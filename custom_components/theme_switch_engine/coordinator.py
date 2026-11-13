"""Coordinator for Theme Switch Engine: handles storage, triggers, and live theme switching."""

from __future__ import annotations

import asyncio
from datetime import datetime, timedelta
import logging
from typing import Any, Callable

from homeassistant.core import CALLBACK_TYPE, Event, HomeAssistant, callback
from homeassistant.helpers.event import (
    async_track_state_change_event,
    async_track_time_interval,
)
from homeassistant.helpers.storage import Store

from .const import (
    CONF_DEFAULT_THEME_DAY,
    CONF_DEFAULT_THEME_NIGHT,
    CONF_RULES,
    CONF_SUN_ELEVATION_THRESHOLD,
    CONF_TRANSITION_DURATION,
    CONF_TRANSITION_ENABLED,
    CONF_WEATHER_ENTITY,
    DEFAULT_SUN_ELEVATION_THRESHOLD,
    DEFAULT_THEME_DAY,
    DEFAULT_THEME_NIGHT,
    DEFAULT_TRANSITION_DURATION,
    DEFAULT_TRANSITION_ENABLED,
    DOMAIN,
    MODE_AUTO,
    MODE_FORCE_DAY,
    MODE_FORCE_NIGHT,
    MODE_PAUSED,
    MODES,
    STORAGE_KEY,
    STORAGE_VERSION,
)
from .engine import evaluate_rule_conditions, is_daytime

_LOGGER = logging.getLogger(__name__)


class ThemeSwitchCoordinator:
    """Coordinates rule evaluation and dispatches theme switching in Home Assistant."""

    def __init__(self, hass: HomeAssistant, config_entry_id: str) -> None:
        """Initialize the coordinator."""
        self.hass = hass
        self.entry_id = config_entry_id
        self._store: Store = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self._config: dict[str, Any] = {}
        self._unsub_listeners: list[CALLBACK_TYPE] = []
        self._listeners: list[Callable[[], None]] = []

        # State tracking
        self.mode: str = MODE_AUTO
        self.active_theme: str | None = None
        self.active_rule_id: str | None = None
        self.active_rule_name: str = "Initializing"
        self.active_priority: int = 0
        self.day_night_variant: str = "day"
        self.matched_conditions: list[str] = []
        self.last_switch: str | None = None
        self.preview_active: bool = False
        self._preview_task: asyncio.Task | None = None

    async def async_setup(self) -> None:
        """Load stored config, register event hooks and perform initial evaluation."""
        stored = await self._store.async_load()
        if stored and isinstance(stored, dict):
            self._config = stored
        else:
            self._config = self._build_default_config()
            await self._store.async_save(self._config)

        self.mode = self._config.get("mode", MODE_AUTO)

        # 1. Listen for Sun state changes
        self._unsub_listeners.append(
            async_track_state_change_event(
                self.hass, ["sun.sun"], self._async_handle_state_change
            )
        )

        # 2. Listen for Weather changes if configured
        w_entity = self.weather_entity
        if w_entity:
            self._unsub_listeners.append(
                async_track_state_change_event(
                    self.hass, [w_entity], self._async_handle_state_change
                )
            )

        # 3. Track custom entities referenced in rules
        entity_ids = self._get_referenced_entities()
        if entity_ids:
            self._unsub_listeners.append(
                async_track_state_change_event(
                    self.hass, list(entity_ids), self._async_handle_state_change
                )
            )

        # 4. Periodic time check (every 60 seconds)
        self._unsub_listeners.append(
            async_track_time_interval(
                self.hass, self._async_handle_interval, timedelta(seconds=60)
            )
        )

        # Perform initial evaluation
        await self.async_evaluate()

    def _build_default_config(self) -> dict[str, Any]:
        """Generate default configuration template with starter rules."""
        return {
            "mode": MODE_AUTO,
            CONF_DEFAULT_THEME_DAY: DEFAULT_THEME_DAY,
            CONF_DEFAULT_THEME_NIGHT: DEFAULT_THEME_NIGHT,
            CONF_TRANSITION_ENABLED: DEFAULT_TRANSITION_ENABLED,
            CONF_TRANSITION_DURATION: DEFAULT_TRANSITION_DURATION,
            CONF_SUN_ELEVATION_THRESHOLD: DEFAULT_SUN_ELEVATION_THRESHOLD,
            CONF_WEATHER_ENTITY: None,
            CONF_RULES: [
                {
                    "id": "rule_christmas",
                    "name": "Weihnachten (Festtage)",
                    "priority": 100,
                    "enabled": False,
                    "theme": "Vision Glass Dark",
                    "conditions": [
                        {"type": "date_range", "start_date": "12-24", "end_date": "12-26"}
                    ],
                },
                {
                    "id": "rule_winter",
                    "name": "Winter Saison",
                    "priority": 50,
                    "enabled": False,
                    "theme_day": "Vision Glass Light",
                    "theme_night": "Vision Glass Dark",
                    "conditions": [
                        {"type": "season", "season": "winter"}
                    ],
                },
                {
                    "id": "rule_summer",
                    "name": "Sommer Saison",
                    "priority": 40,
                    "enabled": False,
                    "theme_day": "Vision Glass Light",
                    "theme_night": "Vision Glass Dark",
                    "conditions": [
                        {"type": "season", "season": "summer"}
                    ],
                },
            ],
        }

    @property
    def rules(self) -> list[dict[str, Any]]:
        """Return configured rules sorted by priority descending."""
        raw_rules: list[dict[str, Any]] = list(self._config.get(CONF_RULES) or [])
        return sorted(raw_rules, key=lambda r: int(r.get("priority", 0)), reverse=True)

    @property
    def default_theme_day(self) -> str:
        return self._config.get(CONF_DEFAULT_THEME_DAY, DEFAULT_THEME_DAY)

    @property
    def default_theme_night(self) -> str:
        return self._config.get(CONF_DEFAULT_THEME_NIGHT, DEFAULT_THEME_NIGHT)

    @property
    def transition_enabled(self) -> bool:
        return bool(self._config.get(CONF_TRANSITION_ENABLED, DEFAULT_TRANSITION_ENABLED))

    @property
    def transition_duration(self) -> int:
        return int(self._config.get(CONF_TRANSITION_DURATION, DEFAULT_TRANSITION_DURATION))

    @property
    def weather_entity(self) -> str | None:
        return self._config.get(CONF_WEATHER_ENTITY)

    @property
    def elevation_threshold(self) -> float:
        return float(self._config.get(CONF_SUN_ELEVATION_THRESHOLD, DEFAULT_SUN_ELEVATION_THRESHOLD))

    def _get_referenced_entities(self) -> set[str]:
        """Extract all entity IDs referenced by rules."""
        eids: set[str] = set()
        for r in self.rules:
            for cond in r.get("conditions") or []:
                eid = cond.get("entity_id")
                if eid and isinstance(eid, str) and "." in eid:
                    eids.add(eid)
        return eids

    @callback
    def _async_handle_state_change(self, event: Event) -> None:
        """Handle tracked entity state changes."""
        self.hass.async_create_task(self.async_evaluate())

    @callback
    def _async_handle_interval(self, now: datetime) -> None:
        """Handle periodic evaluation."""
        self.hass.async_create_task(self.async_evaluate())

    async def async_set_mode(self, new_mode: str) -> None:
        """Update operational mode and save."""
        if new_mode not in MODES:
            raise ValueError(f"Invalid mode '{new_mode}'. Expected one of {MODES}")
        self.mode = new_mode
        self._config["mode"] = new_mode
        await self._store.async_save(self._config)
        await self.async_evaluate()

    async def async_update_config(self, new_config: dict[str, Any]) -> None:
        """Update and persist configuration."""
        self._config.update(new_config)
        await self._store.async_save(self._config)
        await self.async_evaluate()

    async def async_preview_theme(self, theme_name: str, duration_seconds: int = 15) -> None:
        """Temporarily activate a theme for live preview."""
        if self._preview_task and not self._preview_task.done():
            self._preview_task.cancel()

        self.preview_active = True
        prev_theme = self.active_theme
        await self._async_apply_theme_to_frontend(theme_name)

        async def _revert_after() -> None:
            await asyncio.sleep(duration_seconds)
            self.preview_active = False
            if prev_theme:
                await self._async_apply_theme_to_frontend(prev_theme)
            await self.async_evaluate()

        self._preview_task = self.hass.async_create_task(_revert_after())

    async def async_evaluate(self, force: bool = False) -> None:
        """Evaluate rules and apply the matching theme."""
        if self.preview_active and not force:
            return

        now_dt = datetime.now()
        day = is_daytime(self.hass, self.elevation_threshold)

        target_theme: str | None = None
        target_rule_id: str | None = None
        target_rule_name: str = "Fallback"
        target_priority: int = 0
        target_variant: str = "day" if day else "night"
        matched_conds: list[str] = []

        if self.mode == MODE_PAUSED:
            _LOGGER.debug("Theme Switch Engine is paused. Skipping evaluation.")
            self._notify_listeners()
            return

        if self.mode == MODE_FORCE_DAY:
            target_theme = self.default_theme_day
            target_rule_name = "Manuell: Tag erzwungen"
            target_variant = "day"
            matched_conds = ["mode=force_day"]
        elif self.mode == MODE_FORCE_NIGHT:
            target_theme = self.default_theme_night
            target_rule_name = "Manuell: Nacht erzwungen"
            target_variant = "night"
            matched_conds = ["mode=force_night"]
        else:
            # MODE_AUTO: Evaluate rules top-down by priority
            for rule in self.rules:
                if not rule.get("enabled", True):
                    continue

                is_match, cond_names = evaluate_rule_conditions(
                    self.hass,
                    rule,
                    now_dt,
                    self.elevation_threshold,
                    self.weather_entity,
                )

                if is_match:
                    target_rule_id = rule.get("id")
                    target_rule_name = rule.get("name") or "Unbenannte Regel"
                    target_priority = int(rule.get("priority", 0))
                    matched_conds = cond_names

                    theme_day = rule.get("theme_day")
                    theme_night = rule.get("theme_night")
                    theme_static = rule.get("theme")

                    if theme_day and theme_night:
                        target_theme = theme_day if day else theme_night
                        target_variant = "day" if day else "night"
                    elif theme_static:
                        target_theme = theme_static
                        target_variant = "static"
                    elif theme_day:
                        target_theme = theme_day
                        target_variant = "day"
                    elif theme_night:
                        target_theme = theme_night
                        target_variant = "night"

                    break

            # Fallback if no rule matched
            if not target_theme:
                target_rule_id = "default_fallback"
                target_rule_name = "Standard Fallback"
                target_priority = 0
                target_theme = self.default_theme_day if day else self.default_theme_night
                target_variant = "day" if day else "night"
                matched_conds = ["fallback"]

        # Check if theme actually changed
        theme_changed = target_theme != self.active_theme

        self.active_theme = target_theme
        self.active_rule_id = target_rule_id
        self.active_rule_name = target_rule_name
        self.active_priority = target_priority
        self.day_night_variant = target_variant
        self.matched_conditions = matched_conds

        if theme_changed:
            self.last_switch = now_dt.strftime("%Y-%m-%d %H:%M:%S")
            _LOGGER.info(
                "Theme Switch Engine applying theme '%s' (Rule: '%s', Priority: %d)",
                target_theme,
                target_rule_name,
                target_priority,
            )
            await self._async_apply_theme_to_frontend(target_theme)

        self._notify_listeners()

    async def _async_apply_theme_to_frontend(self, theme_name: str) -> None:
        """Call frontend.set_theme service to update Home Assistant theme live."""
        if not self.hass.services.has_service("frontend", "set_theme"):
            _LOGGER.warning("Service frontend.set_theme is not available.")
            return

        try:
            await self.hass.services.async_call(
                "frontend",
                "set_theme",
                {"name": theme_name},
                blocking=True,
            )
        except Exception as err:  # noqa: BLE001
            _LOGGER.error("Failed to set theme '%s': %s", theme_name, err)

    def register_listener(self, listener: Callable[[], None]) -> CALLBACK_TYPE:
        """Register a callback for coordinator updates."""
        self._listeners.append(listener)

        def _remove() -> None:
            if listener in self._listeners:
                self._listeners.remove(listener)

        return _remove

    def _notify_listeners(self) -> None:
        """Notify all registered listeners."""
        for listener in self._listeners:
            try:
                listener()
            except Exception as err:  # noqa: BLE001
                _LOGGER.exception("Error in theme coordinator listener: %s", err)

    async def async_unload(self) -> None:
        """Clean up listeners and timers."""
        for unsub in self._unsub_listeners:
            unsub()
        self._unsub_listeners.clear()
        if self._preview_task and not self._preview_task.done():
            self._preview_task.cancel()
