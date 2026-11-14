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
    CONF_DEFAULT_THEME_DARK,
    CONF_DEFAULT_THEME_DAY,
    CONF_DEFAULT_THEME_LIGHT,
    CONF_DEFAULT_THEME_MOBILE_DARK,
    CONF_DEFAULT_THEME_MOBILE_DAY,
    CONF_DEFAULT_THEME_MOBILE_LIGHT,
    CONF_DEFAULT_THEME_MOBILE_NIGHT,
    CONF_DEFAULT_THEME_NIGHT,
    CONF_MEDIA_SUBFOLDER,
    CONF_RULES,
    CONF_SHOW_SIDEBAR,
    CONF_SUN_ELEVATION_THRESHOLD,
    CONF_TRANSITION_DURATION,
    CONF_TRANSITION_ENABLED,
    CONF_WEATHER_ENTITY,
    DEFAULT_MEDIA_SUBFOLDER,
    DEFAULT_SHOW_SIDEBAR,
    DEFAULT_SUN_ELEVATION_THRESHOLD,
    DEFAULT_THEME_DARK,
    DEFAULT_THEME_LIGHT,
    DEFAULT_THEME_MOBILE_DARK,
    DEFAULT_THEME_MOBILE_LIGHT,
    DEFAULT_TRANSITION_DURATION,
    DEFAULT_TRANSITION_ENABLED,
    DOMAIN,
    MODE_AUTO,
    MODE_DEFAULT,
    MODE_DEFAULT_AUTO,
    MODE_DEFAULT_DARK,
    MODE_DEFAULT_LIGHT,
    MODE_FORCE_DARK,
    MODE_FORCE_DAY,
    MODE_FORCE_LIGHT,
    MODE_FORCE_NIGHT,
    MODE_PAUSED,
    MODES,
    STORAGE_KEY,
    STORAGE_VERSION,
)
from .engine import evaluate_rule_conditions, is_daytime, parse_theme_mode

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
        self.active_theme_desktop: str | None = None
        self.active_theme_mobile: str | None = None
        self.active_rule_id: str | None = None
        self.active_rule_name: str = "Initializing"
        self.active_priority: int = 0
        self.day_night_variant: str = "light"
        self.matched_conditions: list[str] = []
        self.last_switch: str | None = None
        self.preview_active: bool = False
        self._preview_task: asyncio.Task | None = None
        self._entity_unsub: CALLBACK_TYPE | None = None

        # Effects and Sound state
        self.active_effect: str | None = None
        self.active_effect_mode: str = "loop_endless"
        self.active_effect_cycles: int = 3
        self.active_sound_file: str | None = None
        self.active_sound_mode: str = "play_once"
        self.active_sound_loops: int = 3
        self.active_sound_volume: int = 50

    async def async_setup(self) -> None:
        """Load stored config, register event hooks and perform initial evaluation."""
        stored = await self._store.async_load()
        if stored and isinstance(stored, dict):
            self._config = stored
        else:
            self._config = self._build_default_config()
            await self._store.async_save(self._config)

        raw_mode = self._config.get("mode", MODE_AUTO)
        if raw_mode == MODE_FORCE_DAY:
            raw_mode = MODE_FORCE_LIGHT
        elif raw_mode == MODE_FORCE_NIGHT:
            raw_mode = MODE_FORCE_DARK
        self.mode = raw_mode

        # 1. Listen for Sun state changes
        self._unsub_listeners.append(
            async_track_state_change_event(
                self.hass, ["sun.sun"], self._async_handle_state_change
            )
        )

        # 2. Listen for Weather and rule-referenced entities
        self._refresh_entity_listeners()

        # 3. Periodic time check (every 60 seconds)
        self._unsub_listeners.append(
            async_track_time_interval(
                self.hass, self._async_handle_interval, timedelta(seconds=60)
            )
        )

        # Perform initial evaluation
        await self.async_evaluate()

    def _refresh_entity_listeners(self) -> None:
        """Subscribe to state changes for weather and rule-referenced entities."""
        if self._entity_unsub:
            self._entity_unsub()
            self._entity_unsub = None

        tracked: set[str] = set()
        if self.weather_entity:
            tracked.add(self.weather_entity)
        tracked.update(self._get_referenced_entities())
        tracked.discard("sun.sun")

        if tracked:
            self._entity_unsub = async_track_state_change_event(
                self.hass, list(tracked), self._async_handle_state_change
            )

    def _build_default_config(self) -> dict[str, Any]:
        """Generate default configuration template with starter rules."""
        return {
            "mode": MODE_AUTO,
            CONF_DEFAULT_THEME_LIGHT: DEFAULT_THEME_LIGHT,
            CONF_DEFAULT_THEME_DARK: DEFAULT_THEME_DARK,
            CONF_DEFAULT_THEME_MOBILE_LIGHT: DEFAULT_THEME_MOBILE_LIGHT,
            CONF_DEFAULT_THEME_MOBILE_DARK: DEFAULT_THEME_MOBILE_DARK,
            CONF_TRANSITION_ENABLED: DEFAULT_TRANSITION_ENABLED,
            CONF_TRANSITION_DURATION: DEFAULT_TRANSITION_DURATION,
            CONF_SUN_ELEVATION_THRESHOLD: DEFAULT_SUN_ELEVATION_THRESHOLD,
            CONF_WEATHER_ENTITY: None,
            CONF_SHOW_SIDEBAR: DEFAULT_SHOW_SIDEBAR,
            CONF_MEDIA_SUBFOLDER: DEFAULT_MEDIA_SUBFOLDER,
            CONF_RULES: [
                {
                    "id": "rule_christmas",
                    "name": "Holidays",
                    "priority": 100,
                    "enabled": False,
                    "theme": "default",
                    "conditions": [
                        {"type": "date_range", "start_date": "12-24", "end_date": "12-26"}
                    ],
                },
                {
                    "id": "rule_winter",
                    "name": "Winter Season",
                    "priority": 50,
                    "enabled": False,
                    "theme_light": "default",
                    "theme_dark": "default",
                    "conditions": [
                        {"type": "season", "season": "winter"}
                    ],
                },
                {
                    "id": "rule_summer",
                    "name": "Summer Season",
                    "priority": 40,
                    "enabled": False,
                    "theme_light": "default",
                    "theme_dark": "default",
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
    def default_theme_light(self) -> str:
        return self._config.get(CONF_DEFAULT_THEME_LIGHT) or self._config.get(CONF_DEFAULT_THEME_DAY, DEFAULT_THEME_LIGHT)

    @property
    def default_theme_day(self) -> str:
        return self.default_theme_light

    @property
    def default_theme_dark(self) -> str:
        return self._config.get(CONF_DEFAULT_THEME_DARK) or self._config.get(CONF_DEFAULT_THEME_NIGHT, DEFAULT_THEME_DARK)

    @property
    def default_theme_night(self) -> str:
        return self.default_theme_dark

    @property
    def default_theme_mobile_light(self) -> str:
        return self._config.get(CONF_DEFAULT_THEME_MOBILE_LIGHT) or self._config.get(
            CONF_DEFAULT_THEME_MOBILE_DAY, self.default_theme_light
        )

    @property
    def default_theme_mobile_day(self) -> str:
        return self.default_theme_mobile_light

    @property
    def default_theme_mobile_dark(self) -> str:
        return self._config.get(CONF_DEFAULT_THEME_MOBILE_DARK) or self._config.get(
            CONF_DEFAULT_THEME_MOBILE_NIGHT, self.default_theme_dark
        )

    @property
    def default_theme_mobile_night(self) -> str:
        return self.default_theme_mobile_dark

    @property
    def show_sidebar(self) -> bool:
        return True

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

    @property
    def media_subfolder(self) -> str:
        return str(self._config.get(CONF_MEDIA_SUBFOLDER, DEFAULT_MEDIA_SUBFOLDER) or DEFAULT_MEDIA_SUBFOLDER)

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
        if new_mode == MODE_FORCE_DAY:
            new_mode = MODE_FORCE_LIGHT
        elif new_mode == MODE_FORCE_NIGHT:
            new_mode = MODE_FORCE_DARK
        if new_mode not in MODES:
            raise ValueError(f"Invalid mode '{new_mode}'. Expected one of {MODES}")
        self.mode = new_mode
        self._config["mode"] = new_mode
        await self._store.async_save(self._config)
        await self.async_evaluate()

    async def async_update_config(self, new_config: dict[str, Any]) -> None:
        """Update and persist configuration."""
        self._config.update(new_config)
        if "mode" in new_config:
            m = new_config["mode"]
            if m == MODE_FORCE_DAY:
                m = MODE_FORCE_LIGHT
            elif m == MODE_FORCE_NIGHT:
                m = MODE_FORCE_DARK
            if m in MODES:
                self.mode = m
                self._config["mode"] = m
        self._refresh_entity_listeners()
        await self._store.async_save(self._config)
        await self.async_evaluate()

    async def async_preview_theme(self, theme_name: str, duration_seconds: int = 15) -> None:
        """Temporarily activate a theme for live preview."""
        if self._preview_task and not self._preview_task.done():
            self._preview_task.cancel()

        self.preview_active = True
        prev_theme = self.active_theme
        prev_variant = self.day_night_variant
        clean_theme, preview_variant = parse_theme_mode(theme_name, self.day_night_variant)
        await self._async_apply_theme_to_frontend(clean_theme)

        # Broadcast live preview event to notify frontend immediately
        self.hass.bus.async_fire(
            "theme_switch_engine_updated",
            {
                "active_theme": clean_theme,
                "active_theme_desktop": clean_theme,
                "active_theme_mobile": clean_theme,
                "variant": preview_variant,
                "day_night_variant": preview_variant,
                "preview_active": True,
            },
        )

        async def _revert_after() -> None:
            await asyncio.sleep(duration_seconds)
            self.preview_active = False
            if prev_theme:
                await self._async_apply_theme_to_frontend(prev_theme)
            await self.async_evaluate(force=True)

        self._preview_task = self.hass.async_create_task(_revert_after())

    async def async_evaluate(self, force: bool = False) -> None:
        """Evaluate rules and apply the matching theme."""
        if self.preview_active and not force:
            return

        now_dt = datetime.now()
        day = is_daytime(self.hass, self.elevation_threshold)

        target_theme_desktop: str | None = None
        target_theme_mobile: str | None = None
        target_rule_id: str | None = None
        target_rule_name: str = "Fallback"
        target_priority: int = 0
        target_variant: str = "light" if day else "dark"
        matched_conds: list[str] = []
        target_effect: str | None = None
        target_effect_mode: str = "loop_endless"
        target_effect_cycles: int = 3
        target_sound_file: str | None = None
        target_sound_mode: str = "play_once"
        target_sound_loops: int = 3
        target_sound_volume: int = 50

        if self.mode == MODE_PAUSED:
            _LOGGER.debug("Theme Switch Engine is paused. Skipping evaluation.")
            self._notify_listeners()
            return

        if self.mode in (MODE_FORCE_LIGHT, MODE_FORCE_DAY):
            target_theme_desktop, _ = parse_theme_mode(self.default_theme_light, "light")
            target_theme_mobile, _ = parse_theme_mode(self.default_theme_mobile_light, "light")
            target_rule_name = "Force Light"
            target_variant = "light"
            matched_conds = ["mode=force_light"]
        elif self.mode in (MODE_FORCE_DARK, MODE_FORCE_NIGHT):
            target_theme_desktop, _ = parse_theme_mode(self.default_theme_dark, "dark")
            target_theme_mobile, _ = parse_theme_mode(self.default_theme_mobile_dark, "dark")
            target_rule_name = "Force Dark"
            target_variant = "dark"
            matched_conds = ["mode=force_dark"]
        elif self.mode in (MODE_DEFAULT, MODE_DEFAULT_AUTO):
            target_theme_desktop = "default"
            target_theme_mobile = "default"
            target_rule_name = "Home Assistant Default"
            target_variant = "light" if day else "dark"
            matched_conds = ["mode=default"]
        elif self.mode == MODE_DEFAULT_LIGHT:
            target_theme_desktop = "default"
            target_theme_mobile = "default"
            target_rule_name = "Home Assistant Default (Light)"
            target_variant = "light"
            matched_conds = ["mode=default_light"]
        elif self.mode == MODE_DEFAULT_DARK:
            target_theme_desktop = "default"
            target_theme_mobile = "default"
            target_rule_name = "Home Assistant Default (Dark)"
            target_variant = "dark"
            matched_conds = ["mode=default_dark"]
        else:
            default_variant = "light" if day else "dark"
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
                    target_rule_name = rule.get("name") or "Unnamed Rule"
                    target_priority = int(rule.get("priority", 0))
                    matched_conds = cond_names

                    # Visual effect and sound settings
                    raw_eff = rule.get("effect")
                    if raw_eff and raw_eff != "none":
                        target_effect = raw_eff
                        target_effect_mode = rule.get("effect_mode", "loop_endless")
                        try:
                            target_effect_cycles = int(rule.get("effect_cycles", 3))
                        except (ValueError, TypeError):
                            target_effect_cycles = 3

                    raw_sound = rule.get("sound_file")
                    if raw_sound and raw_sound != "none":
                        target_sound_file = raw_sound
                        target_sound_mode = rule.get("sound_mode", "play_once")
                        try:
                            target_sound_loops = int(rule.get("sound_loops", 3))
                        except (ValueError, TypeError):
                            target_sound_loops = 3
                        try:
                            target_sound_volume = int(rule.get("sound_volume", 50))
                        except (ValueError, TypeError):
                            target_sound_volume = 50

                    theme_light = rule.get("theme_light") or rule.get("theme_day")
                    theme_dark = rule.get("theme_dark") or rule.get("theme_night")
                    theme_static = rule.get("theme")

                    theme_mobile_light = rule.get("theme_mobile_light") or rule.get("theme_mobile_day")
                    theme_mobile_dark = rule.get("theme_mobile_dark") or rule.get("theme_mobile_night")
                    theme_mobile_static = rule.get("theme_mobile")

                    # Desktop theme resolution
                    if theme_light and theme_dark and theme_light != theme_dark:
                        selected_desk = theme_light if day else theme_dark
                    elif theme_static:
                        selected_desk = theme_static
                    elif theme_light:
                        selected_desk = theme_light
                    elif theme_dark:
                        selected_desk = theme_dark
                    else:
                        selected_desk = "default"

                    target_theme_desktop, target_variant = parse_theme_mode(selected_desk, default_variant)

                    # Mobile theme resolution
                    if theme_mobile_light and theme_mobile_dark and theme_mobile_light != theme_mobile_dark:
                        selected_mob = theme_mobile_light if day else theme_mobile_dark
                    elif theme_mobile_static:
                        selected_mob = theme_mobile_static
                    elif theme_mobile_light:
                        selected_mob = theme_mobile_light
                    elif theme_mobile_dark:
                        selected_mob = theme_mobile_dark
                    else:
                        selected_mob = selected_desk

                    target_theme_mobile, _ = parse_theme_mode(selected_mob, target_variant)
                    break

            # Fallback if no rule matched
            if not target_theme_desktop:
                target_rule_id = "default_fallback"
                target_rule_name = "Default Fallback"
                target_priority = 0
                default_variant = "light" if day else "dark"
                fallback_desk = self.default_theme_light if day else self.default_theme_dark
                fallback_mob = self.default_theme_mobile_light if day else self.default_theme_mobile_dark
                target_theme_desktop, target_variant = parse_theme_mode(fallback_desk, default_variant)
                target_theme_mobile, _ = parse_theme_mode(fallback_mob, target_variant)
                matched_conds = ["fallback"]

        if not target_theme_mobile:
            target_theme_mobile = target_theme_desktop

        # Check if theme or variant actually changed
        theme_changed = (
            (target_theme_desktop != self.active_theme_desktop)
            or (target_theme_mobile != self.active_theme_mobile)
            or (target_variant != self.day_night_variant)
        )

        self.active_theme = target_theme_desktop
        self.active_theme_desktop = target_theme_desktop
        self.active_theme_mobile = target_theme_mobile
        self.active_rule_id = target_rule_id
        self.active_rule_name = target_rule_name
        self.active_priority = target_priority
        self.day_night_variant = target_variant
        self.matched_conditions = matched_conds
        self.active_effect = target_effect
        self.active_effect_mode = target_effect_mode
        self.active_effect_cycles = target_effect_cycles
        self.active_sound_file = target_sound_file
        self.active_sound_mode = target_sound_mode
        self.active_sound_loops = target_sound_loops
        self.active_sound_volume = target_sound_volume

        if theme_changed:
            self.last_switch = now_dt.strftime("%Y-%m-%d %H:%M:%S")
            _LOGGER.info(
                "Theme Switch Engine applying themes Desktop='%s', Mobile='%s' (Rule: '%s', Priority: %d)",
                target_theme_desktop,
                target_theme_mobile,
                target_rule_name,
                target_priority,
            )
            await self._async_apply_theme_to_frontend(target_theme_desktop)

        # Broadcast update event on Home Assistant event bus
        self.hass.bus.async_fire(
            "theme_switch_engine_updated",
            {
                "active_theme": self.active_theme,
                "active_theme_desktop": self.active_theme_desktop,
                "active_theme_mobile": self.active_theme_mobile,
                "active_rule_id": self.active_rule_id,
                "active_rule_name": self.active_rule_name,
                "priority": self.active_priority,
                "mode": self.mode,
                "variant": self.day_night_variant,
                "day_night_variant": self.day_night_variant,
                "transition_enabled": self.transition_enabled,
                "transition_duration": self.transition_duration,
                "effect": self.active_effect,
                "effect_mode": self.active_effect_mode,
                "effect_cycles": self.active_effect_cycles,
                "sound_file": self.active_sound_file,
                "sound_mode": self.active_sound_mode,
                "sound_loops": self.active_sound_loops,
                "sound_volume": self.active_sound_volume,
                "media_subfolder": self.media_subfolder,
            },
        )

        self._notify_listeners()

    async def _async_apply_theme_to_frontend(self, theme_name: str) -> None:
        """Call frontend.set_theme service for both light and dark modes."""
        if not self.hass.services.has_service("frontend", "set_theme"):
            _LOGGER.warning("Service frontend.set_theme is not available.")
            return

        clean_theme = "default" if str(theme_name).startswith("default") else theme_name

        for mode_slot in ("light", "dark"):
            try:
                await self.hass.services.async_call(
                    "frontend",
                    "set_theme",
                    {"name": clean_theme, "mode": mode_slot},
                    blocking=True,
                )
            except Exception as err:  # noqa: BLE001
                _LOGGER.error("Failed to set theme '%s' (mode=%s): %s", clean_theme, mode_slot, err)

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
        if self._entity_unsub:
            self._entity_unsub()
            self._entity_unsub = None
        for unsub in self._unsub_listeners:
            unsub()
        self._unsub_listeners.clear()
        if self._preview_task and not self._preview_task.done():
            self._preview_task.cancel()

