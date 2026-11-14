"""Constants for the Theme Switch Engine integration."""

from __future__ import annotations

DOMAIN = "theme_switch_engine"
VERSION = "1.4.2"

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
CONF_MEDIA_SUBFOLDER = "media_subfolder"
DEFAULT_MEDIA_SUBFOLDER = "theme_sounds"

CONF_EFFECT = "effect"
CONF_EFFECT_MODE = "effect_mode"
CONF_EFFECT_CYCLES = "effect_cycles"
CONF_SOUND_FILE = "sound_file"
CONF_SOUND_MODE = "sound_mode"
CONF_SOUND_LOOPS = "sound_loops"
CONF_SOUND_VOLUME = "sound_volume"

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
MODE_DEFAULT = "Home Assistant Default"
MODE_PAUSED = "Paused"
# Legacy mode aliases
MODE_FORCE_DAY = "Force Day"
MODE_FORCE_NIGHT = "Force Night"
MODES = [MODE_AUTO, MODE_FORCE_LIGHT, MODE_FORCE_DARK, MODE_DEFAULT, MODE_PAUSED]

# Supported condition types
COND_SUN = "sun"
COND_TIME = "time"
COND_DATE_RANGE = "date_range"
COND_WEEKDAY = "weekday"
COND_SEASON = "season"
COND_WEATHER = "weather"
COND_ENTITY_STATE = "entity_state"
COND_MOON = "moon"
COND_TIDES = "tides"

CONDITION_TYPES = [
    COND_SUN,
    COND_TIME,
    COND_DATE_RANGE,
    COND_WEEKDAY,
    COND_SEASON,
    COND_WEATHER,
    COND_ENTITY_STATE,
    COND_MOON,
    COND_TIDES,
]

MOON_PHASES = [
    "new_moon",
    "waxing_crescent",
    "first_quarter",
    "waxing_gibbous",
    "full_moon",
    "waning_gibbous",
    "last_quarter",
    "waning_crescent",
]

TIDE_STATES = [
    "high_tide",
    "low_tide",
    "rising",
    "falling",
]

