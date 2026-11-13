"""Theme Switch Engine: Universal rule-based theme switching integration."""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

import voluptuous as vol

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.helpers import config_validation as cv

from .const import DOMAIN, MODES
from .coordinator import ThemeSwitchCoordinator

try:
    from homeassistant.components.http import StaticPathConfig
except ImportError:  # pragma: no cover
    StaticPathConfig = None  # type: ignore[assignment]

_LOGGER = logging.getLogger(__name__)

PLATFORMS = [Platform.SENSOR, Platform.SELECT]
FRONTEND_DIR = Path(__file__).parent / "frontend"


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Theme Switch Engine from a config entry."""
    hass.data.setdefault(DOMAIN, {})

    # Register static path for frontend transition helper
    if FRONTEND_DIR.exists() and hasattr(hass.http, "async_register_static_paths"):
        try:
            if StaticPathConfig is not None:
                await hass.http.async_register_static_paths(
                    [StaticPathConfig("/theme_switch_engine_static", str(FRONTEND_DIR), cache_headers=False)]
                )
            else:
                hass.http.register_static_path("/theme_switch_engine_static", str(FRONTEND_DIR), cache_headers=False)
        except Exception as err:  # noqa: BLE001
            _LOGGER.debug("Static path registration skipped: %s", err)

    coordinator = ThemeSwitchCoordinator(hass, entry.entry_id)
    await coordinator.async_setup()
    hass.data[DOMAIN][entry.entry_id] = coordinator

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    # Register services
    async def handle_evaluate(call: ServiceCall) -> None:
        """Force re-evaluation of rules."""
        force = call.data.get("force", False)
        await coordinator.async_evaluate(force=force)

    async def handle_set_mode(call: ServiceCall) -> None:
        """Change operational mode."""
        mode = call.data.get("mode")
        if mode in MODES:
            await coordinator.async_set_mode(mode)
        else:
            _LOGGER.error("Invalid mode '%s'. Must be one of %s", mode, MODES)

    async def handle_preview(call: ServiceCall) -> None:
        """Preview a theme temporarily."""
        theme = call.data.get("theme")
        duration = int(call.data.get("duration", 15))
        if theme:
            await coordinator.async_preview_theme(theme, duration_seconds=duration)

    hass.services.async_register(
        DOMAIN,
        "evaluate",
        handle_evaluate,
        schema=vol.Schema({vol.Optional("force", default=False): cv.boolean}),
    )

    hass.services.async_register(
        DOMAIN,
        "set_mode",
        handle_set_mode,
        schema=vol.Schema({vol.Required("mode"): vol.In(MODES)}),
    )

    hass.services.async_register(
        DOMAIN,
        "preview_theme",
        handle_preview,
        schema=vol.Schema({
            vol.Required("theme"): cv.string,
            vol.Optional("duration", default=15): cv.positive_int,
        }),
    )

    entry.async_on_unload(entry.add_update_listener(async_reload_entry))
    return True


async def async_reload_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Reload config entry when options are updated."""
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    coordinator: ThemeSwitchCoordinator | None = hass.data.get(DOMAIN, {}).get(entry.entry_id)
    if coordinator:
        await coordinator.async_unload()

    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id, None)

    return unload_ok

