"""Theme Switch Engine: Universal rule-based theme switching integration."""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

import voluptuous as vol

from homeassistant.components import frontend, panel_custom, websocket_api
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant, ServiceCall, callback
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.typing import ConfigType

from .const import DOMAIN, MODES, PANEL_URL, STATIC_URL, VERSION
from .coordinator import ThemeSwitchCoordinator

try:
    from homeassistant.components.http import StaticPathConfig
except ImportError:  # pragma: no cover
    StaticPathConfig = None  # type: ignore[assignment]

_LOGGER = logging.getLogger(__name__)

PLATFORMS = [Platform.SENSOR, Platform.SELECT]
FRONTEND_DIR = Path(__file__).parent / "frontend"


def get_available_themes(hass: HomeAssistant) -> list[str]:
    """Return all themes currently installed in Home Assistant."""
    themes = ["default", "Vision Glass Light", "Vision Glass Dark", "Vision Glass"]
    try:
        frontend_themes = hass.data.get("frontend_themes")
        if frontend_themes and hasattr(frontend_themes, "themes"):
            for t in list(frontend_themes.themes.keys()):
                if t not in themes:
                    themes.append(t)
    except Exception:  # noqa: BLE001
        pass
    return sorted(themes)


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Register WebSocket commands for the Theme Switch Engine."""
    websocket_api.async_register_command(hass, ws_rules_get)
    websocket_api.async_register_command(hass, ws_rules_save)
    websocket_api.async_register_command(hass, ws_config_save)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Theme Switch Engine from a config entry."""
    hass.data.setdefault(DOMAIN, {})

    # Register static path for frontend assets
    if FRONTEND_DIR.exists() and hasattr(hass.http, "async_register_static_paths"):
        try:
            if StaticPathConfig is not None:
                await hass.http.async_register_static_paths(
                    [StaticPathConfig(STATIC_URL, str(FRONTEND_DIR), cache_headers=False)]
                )
            else:
                hass.http.register_static_path(STATIC_URL, str(FRONTEND_DIR), cache_headers=False)
        except Exception as err:  # noqa: BLE001
            _LOGGER.debug("Static path registration skipped: %s", err)

    # Register universal frontend helper script across all HA pages
    if hasattr(frontend, "add_extra_js_url"):
        try:
            frontend.add_extra_js_url(hass, f"{STATIC_URL}/theme-engine.js?v={VERSION}")
        except Exception as err:  # noqa: BLE001
            _LOGGER.debug("add_extra_js_url skipped: %s", err)

    coordinator = ThemeSwitchCoordinator(hass, entry.entry_id)
    await coordinator.async_setup()
    hass.data[DOMAIN][entry.entry_id] = coordinator

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    # Register Standalone Custom Panel in HA Sidebar if enabled
    if coordinator.show_sidebar and hasattr(panel_custom, "async_register_panel"):
        try:
            await panel_custom.async_register_panel(
                hass,
                webcomponent_name="theme-switch-engine-panel",
                frontend_url_path=PANEL_URL,
                module_url=f"{STATIC_URL}/panel.js?v={VERSION}",
                sidebar_title="Theme Engine",
                sidebar_icon="mdi:palette-swatch-outline",
                require_admin=False,
                config={"version": VERSION},
            )
        except Exception as err:  # noqa: BLE001
            _LOGGER.debug("Sidebar panel registration skipped: %s", err)

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
    if hasattr(frontend, "async_remove_panel"):
        try:
            frontend.async_remove_panel(hass, PANEL_URL)
        except Exception:  # noqa: BLE001
            pass

    coordinator: ThemeSwitchCoordinator | None = hass.data.get(DOMAIN, {}).get(entry.entry_id)
    if coordinator:
        await coordinator.async_unload()

    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id, None)

    return unload_ok


def _get_coordinator(hass: HomeAssistant) -> ThemeSwitchCoordinator | None:
    """Retrieve the active coordinator."""
    domain_data = hass.data.get(DOMAIN, {})
    for item in domain_data.values():
        if isinstance(item, ThemeSwitchCoordinator):
            return item
    return None


@websocket_api.websocket_command({vol.Required("type"): "theme_switch_engine/rules/get"})
@callback
def ws_rules_get(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Return configured rules, active state, and themes."""
    coordinator = _get_coordinator(hass)
    if not coordinator:
        connection.send_error(msg["id"], "not_found", "Theme Switch Engine not loaded")
        return

    sun_st = hass.states.get("sun.sun")
    sun_info = {
        "state": sun_st.state if sun_st else "unknown",
        "elevation": sun_st.attributes.get("elevation", 0) if sun_st else 0,
    }

    connection.send_result(
        msg["id"],
        {
            "config": coordinator._config,
            "rules": coordinator.rules,
            "mode": coordinator.mode,
            "active_theme": coordinator.active_theme,
            "active_theme_desktop": coordinator.active_theme_desktop,
            "active_theme_mobile": coordinator.active_theme_mobile,
            "active_rule_id": coordinator.active_rule_id,
            "active_rule_name": coordinator.active_rule_name,
            "priority": coordinator.active_priority,
            "day_night_variant": coordinator.day_night_variant,
            "matched_conditions": coordinator.matched_conditions,
            "glassmorphism_enabled": coordinator.glassmorphism_enabled,
            "transition_enabled": coordinator.transition_enabled,
            "transition_duration": coordinator.transition_duration,
            "sun": sun_info,
            "themes": get_available_themes(hass),
            "modes": MODES,
        },
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): "theme_switch_engine/rules/save",
        vol.Required("rules"): list,
    }
)
@websocket_api.async_response
async def ws_rules_save(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Save updated rules and evaluate."""
    coordinator = _get_coordinator(hass)
    if not coordinator:
        connection.send_error(msg["id"], "not_found", "Theme Switch Engine not loaded")
        return

    await coordinator.async_update_config({"rules": msg["rules"]})
    connection.send_result(msg["id"], {"ok": True, "rules": coordinator.rules})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "theme_switch_engine/config/save",
        vol.Required("config"): dict,
    }
)
@websocket_api.async_response
async def ws_config_save(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Save general engine configuration and re-evaluate."""
    coordinator = _get_coordinator(hass)
    if not coordinator:
        connection.send_error(msg["id"], "not_found", "Theme Switch Engine not loaded")
        return

    await coordinator.async_update_config(msg["config"])
    connection.send_result(msg["id"], {"ok": True, "config": coordinator._config})


