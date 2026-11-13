"""Sensor platform for Theme Switch Engine."""

from __future__ import annotations

from typing import Any

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN
from .coordinator import ThemeSwitchCoordinator


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the Theme Switch Engine sensors."""
    coordinator: ThemeSwitchCoordinator = hass.data[DOMAIN][entry.entry_id]
    async_add_entities([ThemeSwitchEngineActiveSensor(coordinator, entry)])


class ThemeSwitchEngineActiveSensor(SensorEntity):
    """Sensor reporting the currently applied theme and active rule metadata."""

    _attr_has_entity_name = True
    _attr_name = "Active Theme"
    _attr_unique_id = "theme_switch_engine_active_theme"
    _attr_icon = "mdi:palette-swatch"

    def __init__(self, coordinator: ThemeSwitchCoordinator, entry: ConfigEntry) -> None:
        """Initialize the sensor."""
        self._coordinator = coordinator
        self._entry = entry

    async def async_added_to_hass(self) -> None:
        """Register coordinator update listener."""
        self.async_on_remove(self._coordinator.register_listener(self.async_write_ha_state))

    @property
    def native_value(self) -> str | None:
        """Return the current active theme name."""
        return self._coordinator.active_theme

    @property
    def icon(self) -> str:
        """Return dynamic icon based on day/night or mode."""
        if self._coordinator.mode == "Paused":
            return "mdi:pause-circle"
        if self._coordinator.day_night_variant == "day":
            return "mdi:weather-sunny"
        if self._coordinator.day_night_variant == "night":
            return "mdi:weather-night"
        return "mdi:palette-swatch"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return rule metadata and engine state."""
        return {
            "active_rule_id": self._coordinator.active_rule_id,
            "active_rule_name": self._coordinator.active_rule_name,
            "priority": self._coordinator.active_priority,
            "day_night_variant": self._coordinator.day_night_variant,
            "mode": self._coordinator.mode,
            "last_switch": self._coordinator.last_switch,
            "matched_conditions": self._coordinator.matched_conditions,
            "preview_active": self._coordinator.preview_active,
            "transition_enabled": self._coordinator.transition_enabled,
            "transition_duration_ms": self._coordinator.transition_duration,
            "rules_count": len(self._coordinator.rules),
        }
