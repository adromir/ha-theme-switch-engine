"""Constants for the Theme Switch Engine integration."""

from __future__ import annotations

DOMAIN = "theme_switch_engine"
VERSION = "1.0.0"

STORAGE_KEY = "theme_switch_engine.config"
STORAGE_VERSION = 1

CONF_RULES = "rules"
CONF_DEFAULT_THEME_DAY = "default_theme_day"
CONF_DEFAULT_THEME_NIGHT = "default_theme_night"
CONF_TRANSITION_ENABLED = "transition_enabled"
CONF_TRANSITION_DURATION = "transition_duration"
CONF_SUN_ELEVATION_THRESHOLD = "sun_elevation_threshold"
CONF_WEATHER_ENTITY = "weather_entity"

DEFAULT_THEME_DAY = "Vision Glass Light"
DEFAULT_THEME_NIGHT = "Vision Glass Dark"
DEFAULT_TRANSITION_ENABLED = True
DEFAULT_TRANSITION_DURATION = 800  # milliseconds
DEFAULT_SUN_ELEVATION_THRESHOLD = 0.0

MODE_AUTO = "Auto (Engine)"
MODE_FORCE_DAY = "Force Day"
MODE_FORCE_NIGHT = "Force Night"
MODE_PAUSED = "Paused"
MODES = [MODE_AUTO, MODE_FORCE_DAY, MODE_FORCE_NIGHT, MODE_PAUSED]

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
