"""Config and Options flows for Theme Switch Engine."""

from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.core import callback
from homeassistant.data_entry_flow import FlowResult
from homeassistant.helpers import selector

from .const import (
    CONF_DEFAULT_THEME_DARK,
    CONF_DEFAULT_THEME_LIGHT,
    CONF_DEFAULT_THEME_MOBILE_DARK,
    CONF_DEFAULT_THEME_MOBILE_LIGHT,
    CONF_SHOW_SIDEBAR,
    CONF_SUN_ELEVATION_THRESHOLD,
    CONF_TRANSITION_DURATION,
    CONF_TRANSITION_ENABLED,
    CONF_WEATHER_ENTITY,
    DEFAULT_SHOW_SIDEBAR,
    DEFAULT_SUN_ELEVATION_THRESHOLD,
    DEFAULT_THEME_DARK,
    DEFAULT_THEME_LIGHT,
    DEFAULT_THEME_MOBILE_DARK,
    DEFAULT_THEME_MOBILE_LIGHT,
    DEFAULT_TRANSITION_DURATION,
    DEFAULT_TRANSITION_ENABLED,
    DOMAIN,
    MODES,
)

_LOGGER = logging.getLogger(__name__)


def get_available_themes(hass: Any) -> list[str]:
    """Return all themes currently installed in Home Assistant."""
    built_in = ["default", "default:light", "default:dark"]
    custom_themes: list[str] = []
    try:
        frontend_themes = hass.data.get("frontend_themes")
        if frontend_themes and hasattr(frontend_themes, "themes") and isinstance(frontend_themes.themes, dict):
            for t in frontend_themes.themes.keys():
                if t not in built_in and t not in custom_themes:
                    custom_themes.append(t)
        elif isinstance(frontend_themes, dict):
            for t in frontend_themes.keys():
                if t not in built_in and t not in custom_themes:
                    custom_themes.append(t)
    except Exception:  # noqa: BLE001
        pass
    return built_in + sorted(custom_themes)


class ThemeSwitchConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Theme Switch Engine."""

    VERSION = 1

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> FlowResult:
        """Handle the initial setup step."""
        if self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")

        if user_input is not None:
            return self.async_create_entry(title="Theme Switch Engine", data=user_input)

        themes = get_available_themes(self.hass)
        schema = vol.Schema({
            vol.Required("mode", default="Auto (Engine)"): vol.In(MODES),
            vol.Required(CONF_DEFAULT_THEME_LIGHT, default=DEFAULT_THEME_LIGHT): vol.In(themes),
            vol.Required(CONF_DEFAULT_THEME_DARK, default=DEFAULT_THEME_DARK): vol.In(themes),
            vol.Optional(CONF_WEATHER_ENTITY): selector.EntitySelector(
                selector.EntitySelectorConfig(domain="weather")
            ),
            vol.Optional(CONF_TRANSITION_ENABLED, default=DEFAULT_TRANSITION_ENABLED): bool,
            vol.Optional(CONF_TRANSITION_DURATION, default=DEFAULT_TRANSITION_DURATION): int,
        })

        return self.async_show_form(step_id="user", data_schema=schema)

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: config_entries.ConfigEntry) -> config_entries.OptionsFlow:
        """Get the options flow for this handler."""
        return ThemeSwitchOptionsFlow()


class ThemeSwitchOptionsFlow(config_entries.OptionsFlow):
    """Handle options for Theme Switch Engine."""

    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> FlowResult:
        """Manage engine settings."""
        coordinator = self.hass.data.get(DOMAIN, {}).get(self.config_entry.entry_id)

        if user_input is not None:
            if coordinator:
                await coordinator.async_update_config(user_input)
            return self.async_create_entry(title="", data=user_input)

        themes = get_available_themes(self.hass)
        cur_mode = coordinator.mode if coordinator else "Auto (Engine)"
        cur_light = coordinator.default_theme_light if coordinator else DEFAULT_THEME_LIGHT
        cur_dark = coordinator.default_theme_dark if coordinator else DEFAULT_THEME_DARK
        cur_mob_light = coordinator.default_theme_mobile_light if coordinator else DEFAULT_THEME_MOBILE_LIGHT
        cur_mob_dark = coordinator.default_theme_mobile_dark if coordinator else DEFAULT_THEME_MOBILE_DARK
        cur_trans = coordinator.transition_enabled if coordinator else DEFAULT_TRANSITION_ENABLED
        cur_dur = coordinator.transition_duration if coordinator else DEFAULT_TRANSITION_DURATION
        cur_elev = coordinator.elevation_threshold if coordinator else DEFAULT_SUN_ELEVATION_THRESHOLD
        cur_w = coordinator.weather_entity if coordinator else None

        schema = vol.Schema({
            vol.Required("mode", default=cur_mode if cur_mode in MODES else MODES[0]): vol.In(MODES),
            vol.Required(CONF_DEFAULT_THEME_LIGHT, default=cur_light if cur_light in themes else themes[0]): vol.In(themes),
            vol.Required(CONF_DEFAULT_THEME_DARK, default=cur_dark if cur_dark in themes else themes[0]): vol.In(themes),
            vol.Required(CONF_DEFAULT_THEME_MOBILE_LIGHT, default=cur_mob_light if cur_mob_light in themes else themes[0]): vol.In(themes),
            vol.Required(CONF_DEFAULT_THEME_MOBILE_DARK, default=cur_mob_dark if cur_mob_dark in themes else themes[0]): vol.In(themes),
            vol.Optional(CONF_WEATHER_ENTITY, description={"suggested_value": cur_w}): selector.EntitySelector(
                selector.EntitySelectorConfig(domain="weather")
            ),
            vol.Optional(CONF_TRANSITION_ENABLED, default=cur_trans): bool,
            vol.Optional(CONF_TRANSITION_DURATION, default=cur_dur): int,
            vol.Optional(CONF_SUN_ELEVATION_THRESHOLD, default=cur_elev): float,
        })

        return self.async_show_form(step_id="init", data_schema=schema)

