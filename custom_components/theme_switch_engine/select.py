"""Select platform for Theme Switch Engine."""

from __future__ import annotations

from homeassistant.components.select import SelectEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN, MODES
from .coordinator import ThemeSwitchCoordinator


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the Theme Switch Engine mode select entity."""
    coordinator: ThemeSwitchCoordinator = hass.data[DOMAIN][entry.entry_id]
    async_add_entities([ThemeSwitchEngineModeSelect(coordinator, entry)])


class ThemeSwitchEngineModeSelect(SelectEntity):
    """Select entity for controlling Theme Switch Engine mode."""

    _attr_has_entity_name = True
    _attr_name = "Theme Mode"
    _attr_unique_id = "theme_switch_engine_mode"
    _attr_icon = "mdi:theme-light-dark"
    _attr_options = MODES

    def __init__(self, coordinator: ThemeSwitchCoordinator, entry: ConfigEntry) -> None:
        """Initialize the mode select entity."""
        self._coordinator = coordinator
        self._entry = entry

    async def async_added_to_hass(self) -> None:
        """Register coordinator update listener."""
        self.async_on_remove(self._coordinator.register_listener(self.async_write_ha_state))

    @property
    def current_option(self) -> str | None:
        """Return the current mode."""
        return self._coordinator.mode

    async def async_select_option(self, option: str) -> None:
        """Change the operational mode."""
        if option in MODES:
            await self._coordinator.async_set_mode(option)
            self.async_write_ha_state()
