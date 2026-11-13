"""Rule evaluation and condition matching engine for Theme Switch Engine."""

from __future__ import annotations

from datetime import date, datetime, time as dt_time
import logging
from typing import Any

from homeassistant.core import HomeAssistant

_LOGGER = logging.getLogger(__name__)


def is_daytime(hass: HomeAssistant, elevation_threshold: float = 0.0) -> bool:
    """Determine whether it is currently daytime based on sun.sun or system time."""
    sun = hass.states.get("sun.sun")
    if sun:
        elevation = sun.attributes.get("elevation")
        if elevation is not None:
            try:
                return float(elevation) > elevation_threshold
            except (ValueError, TypeError):
                pass
        return sun.state == "above_horizon"

    # Fallback to local clock
    now_hour = datetime.now().hour
    return 7 <= now_hour < 19


def check_sun_condition(hass: HomeAssistant, cond: dict[str, Any], elevation_threshold: float = 0.0) -> bool:
    """Check sun condition (state or elevation)."""
    sun = hass.states.get("sun.sun")
    expected_state = cond.get("state")  # 'above_horizon' | 'below_horizon'
    min_elev = cond.get("min_elevation")
    max_elev = cond.get("max_elevation")

    if expected_state:
        day = is_daytime(hass, elevation_threshold)
        if expected_state == "above_horizon" and not day:
            return False
        if expected_state == "below_horizon" and day:
            return False

    if sun and (min_elev is not None or max_elev is not None):
        elev = sun.attributes.get("elevation")
        if elev is not None:
            try:
                val = float(elev)
                if min_elev is not None and val < float(min_elev):
                    return False
                if max_elev is not None and val > float(max_elev):
                    return False
            except (ValueError, TypeError):
                pass

    return True


def check_time_condition(cond: dict[str, Any], now_dt: datetime) -> bool:
    """Check time condition with support for midnight crossover."""
    after_str = cond.get("after")
    before_str = cond.get("before")

    now_time = now_dt.time()

    def parse_time(val: str | None) -> dt_time | None:
        if not val:
            return None
        parts = val.strip().split(":")
        h = int(parts[0])
        m = int(parts[1]) if len(parts) > 1 else 0
        s = int(parts[2]) if len(parts) > 2 else 0
        return dt_time(h, m, s)

    after_t = parse_time(after_str)
    before_t = parse_time(before_str)

    if after_t and before_t:
        if after_t <= before_t:
            return after_t <= now_time <= before_t
        # Midnight crossover (e.g. 22:00 to 06:00)
        return now_time >= after_t or now_time <= before_t
    if after_t:
        return now_time >= after_t
    if before_t:
        return now_time <= before_t

    return True


def check_date_range_condition(cond: dict[str, Any], now_dt: datetime) -> bool:
    """Check date range (supports specific year YYYY-MM-DD or annual MM-DD)."""
    start_str = cond.get("start_date") or cond.get("start")
    end_str = cond.get("end_date") or cond.get("end")

    if not start_str or not end_str:
        return True

    today = now_dt.date()

    def parse_date_tuple(val: str) -> tuple[int, int]:
        parts = [int(p) for p in val.strip().replace("/", "-").split("-")]
        if len(parts) == 3:  # YYYY-MM-DD
            return (parts[1], parts[2])
        if len(parts) == 2:  # MM-DD
            return (parts[0], parts[1])
        return (1, 1)

    s_m, s_d = parse_date_tuple(start_str)
    e_m, e_d = parse_date_tuple(end_str)

    start_date = date(today.year, s_m, s_d)
    end_date = date(today.year, e_m, e_d)

    if start_date <= end_date:
        return start_date <= today <= end_date
    # Year crossover (e.g. 12-24 to 01-06)
    return today >= start_date or today <= end_date


def check_weekday_condition(cond: dict[str, Any], now_dt: datetime) -> bool:
    """Check weekday condition (mon-sun or workday/weekend)."""
    days = cond.get("days") or []
    if isinstance(days, str):
        days = [d.strip().lower() for d in days.split(",")]
    else:
        days = [str(d).lower() for d in days]

    if not days:
        return True

    # Python weekday(): Monday is 0 and Sunday is 6
    day_map = {0: "mon", 1: "tue", 2: "wed", 3: "thu", 4: "fri", 5: "sat", 6: "sun"}
    cur_day = day_map.get(now_dt.weekday(), "mon")
    is_weekend = now_dt.weekday() >= 5

    if "weekend" in days and is_weekend:
        return True
    if "workday" in days and not is_weekend:
        return True

    return cur_day in days


def check_season_condition(hass: HomeAssistant, cond: dict[str, Any], now_dt: datetime) -> bool:
    """Check meteorological season (spring, summer, autumn, winter)."""
    expected = (cond.get("season") or "").strip().lower()
    if not expected:
        return True

    # 1. Check sensor.season if present
    st = hass.states.get("sensor.season")
    if st and st.state:
        cur_season = st.state.lower()
        if cur_season == expected:
            return True

    # 2. Meteorological calculation (Northern hemisphere)
    m = now_dt.month
    if m in (3, 4, 5):
        calc_season = "spring"
    elif m in (6, 7, 8):
        calc_season = "summer"
    elif m in (9, 10, 11):
        calc_season = "autumn"
    else:
        calc_season = "winter"

    return calc_season == expected


def check_weather_condition(hass: HomeAssistant, cond: dict[str, Any], default_weather_entity: str | None) -> bool:
    """Check weather condition against weather entity state."""
    w_entity = cond.get("entity_id") or default_weather_entity
    if not w_entity:
        return True

    st = hass.states.get(w_entity)
    if not st:
        return False

    cur_state = (st.state or "").lower()
    allowed_states = cond.get("states") or []
    if isinstance(allowed_states, str):
        allowed_states = [s.strip().lower() for s in allowed_states.split(",")]
    else:
        allowed_states = [str(s).lower() for s in allowed_states]

    if not allowed_states:
        return True

    return cur_state in allowed_states


def check_entity_state_condition(hass: HomeAssistant, cond: dict[str, Any]) -> bool:
    """Check arbitrary entity state condition."""
    e_id = cond.get("entity_id")
    if not e_id:
        return True

    st = hass.states.get(e_id)
    if not st:
        return False

    expected_state = cond.get("state")
    if expected_state is None:
        return True

    if isinstance(expected_state, list):
        return str(st.state) in [str(x) for x in expected_state]

    return str(st.state).lower() == str(expected_state).lower()


def evaluate_rule_conditions(
    hass: HomeAssistant,
    rule: dict[str, Any],
    now_dt: datetime,
    elevation_threshold: float = 0.0,
    default_weather_entity: str | None = None,
) -> tuple[bool, list[str]]:
    """Evaluate all conditions inside a rule. Returns (is_match, matched_condition_names)."""
    conditions = rule.get("conditions") or []
    if not conditions:
        return True, ["always"]

    matched_names: list[str] = []

    for cond in conditions:
        ctype = cond.get("type")
        match = False

        if ctype == "sun":
            match = check_sun_condition(hass, cond, elevation_threshold)
            if match:
                matched_names.append(f"sun({cond.get('state', 'elev')})")
        elif ctype == "time":
            match = check_time_condition(cond, now_dt)
            if match:
                matched_names.append(f"time({cond.get('after')}-{cond.get('before')})")
        elif ctype == "date_range":
            match = check_date_range_condition(cond, now_dt)
            if match:
                matched_names.append(f"date({cond.get('start_date')}-{cond.get('end_date')})")
        elif ctype == "weekday":
            match = check_weekday_condition(cond, now_dt)
            if match:
                matched_names.append(f"weekday({cond.get('days')})")
        elif ctype == "season":
            match = check_season_condition(hass, cond, now_dt)
            if match:
                matched_names.append(f"season({cond.get('season')})")
        elif ctype == "weather":
            match = check_weather_condition(hass, cond, default_weather_entity)
            if match:
                matched_names.append(f"weather({cond.get('states')})")
        elif ctype == "entity_state":
            match = check_entity_state_condition(hass, cond)
            if match:
                matched_names.append(f"entity({cond.get('entity_id')}={cond.get('state')})")
        else:
            _LOGGER.warning("Unknown condition type '%s' in rule '%s'", ctype, rule.get("name"))
            continue

        if not match:
            return False, []

    return True, matched_names
