"""Unit tests for Theme Switch Engine condition evaluation logic."""

import sys
import types
from typing import Any
import unittest
from datetime import datetime
from pathlib import Path
from unittest.mock import MagicMock

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))


def _install_ha_stubs() -> None:
    if "homeassistant" in sys.modules:
        return

    ha_mod = types.ModuleType("homeassistant")
    core_mod = types.ModuleType("homeassistant.core")
    config_entries_mod = types.ModuleType("homeassistant.config_entries")
    helpers_mod = types.ModuleType("homeassistant.helpers")
    typing_mod = types.ModuleType("homeassistant.helpers.typing")
    typing_mod.ConfigType = dict[str, Any]
    sys.modules["homeassistant.helpers.typing"] = typing_mod
    storage_mod = types.ModuleType("homeassistant.helpers.storage")
    event_mod = types.ModuleType("homeassistant.helpers.event")
    selector_mod = types.ModuleType("homeassistant.helpers.selector")
    cv_mod = types.ModuleType("homeassistant.helpers.config_validation")
    const_mod = types.ModuleType("homeassistant.const")
    vol_mod = types.ModuleType("voluptuous")

    class HomeAssistant:
        pass

    def callback(fn):
        return fn

    class ConfigFlow:
        def __init_subclass__(cls, **kwargs: Any) -> None:
            pass

    config_entries_mod.ConfigEntry = MagicMock
    config_entries_mod.ConfigFlow = ConfigFlow
    config_entries_mod.OptionsFlow = MagicMock
    data_entry_flow_mod = types.ModuleType("homeassistant.data_entry_flow")
    data_entry_flow_mod.FlowResult = dict
    sys.modules["homeassistant.data_entry_flow"] = data_entry_flow_mod
    event_mod.async_track_state_change_event = MagicMock
    event_mod.async_track_time_interval = MagicMock
    storage_mod.Store = MagicMock
    core_mod.HomeAssistant = HomeAssistant
    core_mod.callback = callback
    core_mod.Event = MagicMock
    core_mod.ServiceCall = MagicMock
    core_mod.CALLBACK_TYPE = object

    class Platform:
        SENSOR = "sensor"
        SELECT = "select"

    const_mod.Platform = Platform

    vol_mod.Schema = lambda s: MagicMock()
    vol_mod.Required = lambda k, **kw: k
    vol_mod.Optional = lambda k, **kw: k
    vol_mod.In = lambda opts: MagicMock()

    comp_mod = types.ModuleType("homeassistant.components")
    frontend_mod = types.ModuleType("homeassistant.components.frontend")
    panel_mod = types.ModuleType("homeassistant.components.panel_custom")
    ws_mod = types.ModuleType("homeassistant.components.websocket_api")

    frontend_mod.add_extra_js_url = MagicMock()
    frontend_mod.async_remove_panel = MagicMock()
    panel_mod.async_register_panel = MagicMock()
    ws_mod.websocket_command = lambda schema: lambda fn: fn
    ws_mod.async_response = lambda fn: fn
    ws_mod.ActiveConnection = MagicMock

    sys.modules["homeassistant"] = ha_mod
    sys.modules["homeassistant.components"] = comp_mod
    sys.modules["homeassistant.components.frontend"] = frontend_mod
    sys.modules["homeassistant.components.panel_custom"] = panel_mod
    sys.modules["homeassistant.components.websocket_api"] = ws_mod
    sys.modules["homeassistant.core"] = core_mod
    sys.modules["homeassistant.config_entries"] = config_entries_mod
    sys.modules["homeassistant.helpers"] = helpers_mod
    sys.modules["homeassistant.helpers.storage"] = storage_mod
    sys.modules["homeassistant.helpers.event"] = event_mod
    sys.modules["homeassistant.helpers.selector"] = selector_mod
    sys.modules["homeassistant.helpers.config_validation"] = cv_mod
    sys.modules["homeassistant.const"] = const_mod
    sys.modules["voluptuous"] = vol_mod


_install_ha_stubs()

from custom_components.theme_switch_engine.engine import (
    check_date_range_condition,
    check_entity_state_condition,
    check_moon_condition,
    check_season_condition,
    check_sun_condition,
    check_tides_condition,
    check_time_condition,
    check_weekday_condition,
    check_weather_condition,
    evaluate_rule_conditions,
    is_daytime,
    parse_theme_mode,
)


class TestThemeSwitchEngine(unittest.TestCase):
    """Test suite for engine condition evaluation."""

    def test_time_condition_normal_and_crossover(self):
        # 14:00 is between 08:00 and 18:00
        dt_noon = datetime(2026, 11, 13, 14, 0, 0)
        self.assertTrue(check_time_condition({"after": "08:00", "before": "18:00"}, dt_noon))
        self.assertFalse(check_time_condition({"after": "15:00", "before": "18:00"}, dt_noon))

        # Midnight crossover: 22:00 to 06:00
        dt_night = datetime(2026, 11, 13, 23, 30, 0)
        dt_morning = datetime(2026, 11, 13, 4, 15, 0)
        dt_day = datetime(2026, 11, 13, 12, 0, 0)
        cond_cross = {"after": "22:00", "before": "06:00"}
        self.assertTrue(check_time_condition(cond_cross, dt_night))
        self.assertTrue(check_time_condition(cond_cross, dt_morning))
        self.assertFalse(check_time_condition(cond_cross, dt_day))

    def test_date_range_condition(self):
        # Christmas 12-24 to 12-26
        dt_xmas = datetime(2026, 12, 25, 10, 0, 0)
        dt_nov = datetime(2026, 11, 13, 10, 0, 0)
        cond_xmas = {"start_date": "12-24", "end_date": "12-26"}
        self.assertTrue(check_date_range_condition(cond_xmas, dt_xmas))
        self.assertFalse(check_date_range_condition(cond_xmas, dt_nov))

        # New Year crossover: 12-30 to 01-05
        cond_ny = {"start_date": "12-30", "end_date": "01-05"}
        self.assertTrue(check_date_range_condition(cond_ny, datetime(2026, 12, 31, 23, 0, 0)))
        self.assertTrue(check_date_range_condition(cond_ny, datetime(2027, 1, 2, 10, 0, 0)))
        self.assertFalse(check_date_range_condition(cond_ny, dt_nov))

    def test_weekday_condition(self):
        # 2026-11-13 is Friday
        dt_friday = datetime(2026, 11, 13, 10, 0, 0)
        self.assertTrue(check_weekday_condition({"days": ["fri"]}, dt_friday))
        self.assertTrue(check_weekday_condition({"days": "workday"}, dt_friday))
        self.assertFalse(check_weekday_condition({"days": "weekend"}, dt_friday))
        self.assertFalse(check_weekday_condition({"days": ["sat", "sun"]}, dt_friday))

    def test_season_condition(self):
        hass = MagicMock()
        hass.states.get.return_value = None

        # November is autumn
        dt_nov = datetime(2026, 11, 13, 10, 0, 0)
        self.assertTrue(check_season_condition(hass, {"season": "autumn"}, dt_nov))
        self.assertFalse(check_season_condition(hass, {"season": "summer"}, dt_nov))

        # July is summer
        dt_july = datetime(2026, 7, 15, 10, 0, 0)
        self.assertTrue(check_season_condition(hass, {"season": "summer"}, dt_july))

    def test_weather_and_entity_conditions(self):
        hass = MagicMock()
        weather_state = MagicMock()
        weather_state.state = "rainy"

        bool_state = MagicMock()
        bool_state.state = "on"

        def mock_get(entity_id):
            if entity_id == "weather.home":
                return weather_state
            if entity_id == "input_boolean.cinema_mode":
                return bool_state
            return None

        hass.states.get.side_effect = mock_get

        self.assertTrue(check_weather_condition(hass, {"states": ["rainy", "pouring"]}, "weather.home"))
        self.assertFalse(check_weather_condition(hass, {"states": ["sunny"]}, "weather.home"))

        self.assertTrue(check_entity_state_condition(hass, {"entity_id": "input_boolean.cinema_mode", "state": "on"}))
        self.assertFalse(check_entity_state_condition(hass, {"entity_id": "input_boolean.cinema_mode", "state": "off"}))

    def test_evaluate_rule_combined(self):
        hass = MagicMock()
        sun_state = MagicMock()
        sun_state.state = "above_horizon"
        sun_state.attributes = {"elevation": 25.0}
        hass.states.get.return_value = sun_state

        rule = {
            "name": "Summer Afternoon",
            "priority": 80,
            "conditions": [
                {"type": "sun", "state": "above_horizon"},
                {"type": "season", "season": "summer"},
            ],
        }

        # Summer daytime -> True
        dt_summer = datetime(2026, 7, 15, 14, 0, 0)
        is_match, conds = evaluate_rule_conditions(hass, rule, dt_summer)
        self.assertTrue(is_match)
        self.assertIn("sun(above_horizon)", conds)

        # Winter daytime -> False (season does not match)
        dt_winter = datetime(2026, 12, 15, 14, 0, 0)
        is_match, conds = evaluate_rule_conditions(hass, rule, dt_winter)
        self.assertFalse(is_match)

    def test_desktop_and_mobile_rule_resolution(self):
        rule = {
            "name": "Targeted Rule",
            "priority": 100,
            "theme": "Vision Glass Dark",
            "theme_desktop": "Vision Glass Desktop",
            "theme_mobile": "Vision Glass Mobile",
            "conditions": [],
        }
        # Desktop theme priority
        theme_desktop = rule.get("theme_desktop") or rule.get("theme")
        theme_mobile = rule.get("theme_mobile") or rule.get("theme")
        self.assertEqual(theme_desktop, "Vision Glass Desktop")
        self.assertEqual(theme_mobile, "Vision Glass Mobile")

        # Fallback to general theme if target not explicitly defined
        rule_fallback = {
            "name": "General Rule",
            "priority": 50,
            "theme": "Vision Glass",
            "conditions": [],
        }
        theme_desktop_fallback = rule_fallback.get("theme_desktop") or rule_fallback.get("theme")
        theme_mobile_fallback = rule_fallback.get("theme_mobile") or rule_fallback.get("theme")
        self.assertEqual(theme_desktop_fallback, "Vision Glass")
        self.assertEqual(theme_mobile_fallback, "Vision Glass")

    def test_options_flow_instantiation(self):
        from custom_components.theme_switch_engine.config_flow import ThemeSwitchOptionsFlow, ThemeSwitchConfigFlow
        from unittest.mock import MagicMock
        mock_entry = MagicMock()
        mock_entry.entry_id = "test_entry"
        flow = ThemeSwitchConfigFlow.async_get_options_flow(mock_entry)
        self.assertIsInstance(flow, ThemeSwitchOptionsFlow)

    def test_imports_and_light_dark_constants(self):
        import json
        import custom_components.theme_switch_engine.config_flow  # noqa: F401
        from custom_components.theme_switch_engine.const import (
            MODES,
            MODE_FORCE_LIGHT,
            MODE_FORCE_DARK,
            MODE_DEFAULT,
        )
        self.assertIn(MODE_FORCE_LIGHT, MODES)
        self.assertIn(MODE_FORCE_DARK, MODES)
        self.assertIn(MODE_DEFAULT, MODES)
        self.assertNotIn("Force Day", MODES)
        self.assertNotIn("Force Night", MODES)

        base = ROOT / "custom_components" / "theme_switch_engine"
        en_json = json.loads((base / "translations" / "en.json").read_text(encoding="utf-8"))
        de_json = json.loads((base / "translations" / "de.json").read_text(encoding="utf-8"))
        id_json = json.loads((base / "translations" / "id.json").read_text(encoding="utf-8"))
        strings_json = json.loads((base / "strings.json").read_text(encoding="utf-8"))

        for lang_json in (de_json, id_json, strings_json):
            self.assertEqual(set(en_json["options"]["step"]["init"]["data"].keys()), set(lang_json["options"]["step"]["init"]["data"].keys()))
            self.assertEqual(set(en_json["config"]["step"]["user"]["data"].keys()), set(lang_json["config"]["step"]["user"]["data"].keys()))


    def test_rule_effect_and_sound_attributes(self):
        rule = {
            "name": "Rainy Mood",
            "priority": 80,
            "theme": "Vision Glass Dark",
            "effect": "rain",
            "effect_mode": "loop_endless",
            "effect_cycles": 5,
            "sound_file": "gentle_rain.mp3",
            "sound_mode": "loop_count",
            "sound_loops": 4,
            "sound_volume": 65,
            "conditions": [],
        }
        self.assertEqual(rule.get("effect"), "rain")
        self.assertEqual(rule.get("effect_mode"), "loop_endless")
        self.assertEqual(rule.get("effect_cycles"), 5)
        self.assertEqual(rule.get("sound_file"), "gentle_rain.mp3")
        self.assertEqual(rule.get("sound_mode"), "loop_count")
        self.assertEqual(rule.get("sound_loops"), 4)
        self.assertEqual(rule.get("sound_volume"), 65)

    def test_moon_condition(self):
        hass = MagicMock()
        moon_state = MagicMock()
        moon_state.state = "full_moon"
        hass.states.get.side_effect = lambda eid: moon_state if eid in ("sensor.moon_phase", "sensor.moon") else None

        self.assertTrue(check_moon_condition(hass, {"phases": ["full_moon"]}))
        self.assertTrue(check_moon_condition(hass, {"phase": "full_moon"}))
        self.assertFalse(check_moon_condition(hass, {"phases": ["new_moon"]}))

    def test_tides_condition(self):
        hass = MagicMock()
        tide_state = MagicMock()
        tide_state.state = "high_tide"
        tide_state.attributes = {"tide_type": "High Tide"}
        hass.states.async_entity_ids.return_value = ["sensor.worldtidesinfo_tide"]
        hass.states.get.side_effect = lambda eid: tide_state if "tide" in eid else None

        self.assertTrue(check_tides_condition(hass, {"states": ["high_tide"]}))
        self.assertTrue(check_tides_condition(hass, {"state": "high tide"}))
        self.assertFalse(check_tides_condition(hass, {"states": ["low_tide"]}))

    def test_parse_theme_mode(self):
        # Default with auto fallback
        self.assertEqual(parse_theme_mode("default", "light"), ("default", "light"))
        self.assertEqual(parse_theme_mode("default", "dark"), ("default", "dark"))
        self.assertEqual(parse_theme_mode("default:auto", "dark"), ("default", "dark"))

        # Forced default modes
        self.assertEqual(parse_theme_mode("default:light", "dark"), ("default", "light"))
        self.assertEqual(parse_theme_mode("default_light", "dark"), ("default", "light"))
        self.assertEqual(parse_theme_mode("default (light)", "dark"), ("default", "light"))
        self.assertEqual(parse_theme_mode("default:dark", "light"), ("default", "dark"))
        self.assertEqual(parse_theme_mode("default_dark", "light"), ("default", "dark"))
        self.assertEqual(parse_theme_mode("default (dark)", "light"), ("default", "dark"))

        # Custom themes
        self.assertEqual(parse_theme_mode("Vision Glass Light", "dark"), ("Vision Glass Light", "light"))
        self.assertEqual(parse_theme_mode("Vision Glass Dark", "light"), ("Vision Glass Dark", "dark"))
        self.assertEqual(parse_theme_mode("MyTheme:light", "dark"), ("MyTheme", "light"))
        self.assertEqual(parse_theme_mode("MyTheme:dark", "light"), ("MyTheme", "dark"))
        self.assertEqual(parse_theme_mode("NeutralTheme", "light"), ("NeutralTheme", "light"))
        self.assertEqual(parse_theme_mode("NeutralTheme", "dark"), ("NeutralTheme", "dark"))



if __name__ == "__main__":
    unittest.main()
