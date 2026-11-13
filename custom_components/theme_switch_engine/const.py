"""Constants for the Theme Switch Engine integration."""

from __future__ import annotations

DOMAIN = "theme_switch_engine"
VERSION = "1.3.0"

STORAGE_KEY = "theme_switch_engine.config"
STORAGE_VERSION = 1

CONF_RULES = "rules"
CONF_DEFAULT_THEME_LIGHT = "default_theme_light"
CONF_DEFAULT_THEME_DARK = "default_theme_dark"
CONF_DEFAULT_THEME_MOBILE_LIGHT = "default_theme_mobile_light"
CONF_DEFAULT_THEME_MOBILE_DARK = "default_theme_mobile_dark"
# Legacy aliases for backward compatibility with existing stored configs
CONF_DEFAULT_THEME_DAY = "default_theme_day"
CONF_DEFAULT_THEME_NIGHT = "default_theme_night"
CONF_DEFAULT_THEME_MOBILE_DAY = "default_theme_mobile_day"
CONF_DEFAULT_THEME_MOBILE_NIGHT = "default_theme_mobile_night"

CONF_TRANSITION_ENABLED = "transition_enabled"
CONF_TRANSITION_DURATION = "transition_duration"
CONF_SUN_ELEVATION_THRESHOLD = "sun_elevation_threshold"
CONF_WEATHER_ENTITY = "weather_entity"
CONF_SHOW_SIDEBAR = "show_sidebar"

PANEL_URL = "theme-switch-engine"
STATIC_URL = "/theme_switch_engine_static"

DEFAULT_THEME_LIGHT = "default"
DEFAULT_THEME_DARK = "default"
DEFAULT_THEME_MOBILE_LIGHT = "default"
DEFAULT_THEME_MOBILE_DARK = "default"
# Legacy aliases
DEFAULT_THEME_DAY = DEFAULT_THEME_LIGHT
DEFAULT_THEME_NIGHT = DEFAULT_THEME_DARK
DEFAULT_THEME_MOBILE_DAY = DEFAULT_THEME_MOBILE_LIGHT
DEFAULT_THEME_MOBILE_NIGHT = DEFAULT_THEME_MOBILE_DARK

DEFAULT_TRANSITION_ENABLED = True
DEFAULT_TRANSITION_DURATION = 800  # milliseconds
DEFAULT_SUN_ELEVATION_THRESHOLD = 0.0
DEFAULT_SHOW_SIDEBAR = True

MODE_AUTO = "Auto (Engine)"
MODE_FORCE_LIGHT = "Force Light"
MODE_FORCE_DARK = "Force Dark"
MODE_PAUSED = "Paused"
# Legacy mode aliases
MODE_FORCE_DAY = "Force Day"
MODE_FORCE_NIGHT = "Force Night"
MODES = [MODE_AUTO, MODE_FORCE_LIGHT, MODE_FORCE_DARK, MODE_PAUSED]

# Supported condition types
COND_SUN = "sun"
COND_TIME = "time"
COND_DATE_RANGE = "date_range"
COND_WEEKDAY = "weekday"
COND_SEASON = "season"
COND_WEATHER = "weather"
COND_ENTITY_STATE = "entity_state"

CONDITION_TYPES = [
    COND_SUN,
    COND_TIME,
    COND_DATE_RANGE,
    COND_WEEKDAY,
    COND_SEASON,
    COND_WEATHER,
    COND_ENTITY_STATE,
]

