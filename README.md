# 🔄 Theme Switch Engine for Home Assistant

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=adromir&repository=ha-theme-switch-engine&category=integration)
[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg?style=for-the-badge)](https://github.com/hacs/default)
[![GitHub Release](https://img.shields.io/github/v/release/adromir/ha-theme-switch-engine?style=for-the-badge&color=blue)](https://github.com/adromir/ha-theme-switch-engine/releases)
[![Home Assistant](https://img.shields.io/badge/Home%20Assistant-2024.7%2B-18BCF2?style=for-the-badge&logo=home-assistant)](https://www.home-assistant.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg?style=for-the-badge)](https://github.com/adromir/ha-theme-switch-engine)

A universal, hierarchical, **rule-based theme switching integration** for Home Assistant. Switch between arbitrarily many themes based on sun position, weather states, time schedules, annual recurring dates (holidays, Christmas, New Year), seasons, weekdays, and custom entity states with optional hardware-accelerated **smooth live transitions**.

---

## ✨ Key Advantages & Features

- 🎯 **Hierarchical First-Match-Wins Rule Engine**: Prioritize specific temporary events over broad seasons (e.g. Christmas theme with Priority 100 cleanly overrides Winter theme with Priority 50 without conflict).
- 🌓 **Day & Night Theme Pairs per Rule**: Each rule can define both `theme_day` and `theme_night` (e.g. *Summer Day* & *Summer Night*), automatically switching based on sun elevation or daylight.
- ⚡ **Hardware-Accelerated Smooth Live Transitions**: Optional configurable cross-fade effect when themes switch in real-time, eliminating abrupt color flashes (can be toggled or customized in ms).
- 🌦️ **Rich Condition Suite**:
  - **Sun Position**: Above/below horizon, solar elevation thresholds.
  - **Weather States**: Matches conditions from your weather integration (`rainy`, `snowy`, `cloudy`, `sunny`, etc.).
  - **Time Schedules**: Time windows with automatic midnight crossover support (e.g. `22:00 – 06:00`).
  - **Date & Annual Ranges**: Specific dates or recurring annual ranges (e.g. `12-24` to `12-26` for Christmas, `12-31` to `01-02` for New Year).
  - **Weekdays & Weekends**: Specific days or `workday` / `weekend` grouping.
  - **Seasons**: Spring, Summer, Autumn, Winter.
  - **Custom Entity States**: Trigger themes from Cinema Mode, Guest Mode, Alarmo status, or sleep helpers.
- 🕹️ **First-Class Home Assistant Entities**:
  - `select.theme_switch_engine_mode`: Switch between **Auto (Engine)**, **Force Day**, **Force Night**, or **Paused**.
  - `sensor.theme_switch_engine_active_theme`: Live report of active theme, triggering rule, priority, and matched conditions.
- 🧪 **1-Click Live Theme Preview**: Test any theme or rule immediately via the `theme_switch_engine.preview_theme` service.

---

## 📦 Installation via HACS

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=adromir&repository=ha-theme-switch-engine&category=integration)

1. Ensure [HACS](https://hacs.xyz/) is installed in your Home Assistant instance.
2. In Home Assistant, open **HACS → Integrations → ⋮ → Custom repositories**.
3. Add repository URL:
   ```text
   https://github.com/adromir/ha-theme-switch-engine
   ```
4. Choose category: **Integration** and click **Add**.
5. Find **Theme Switch Engine**, click **Download**, and **restart Home Assistant**.
6. Go to **Settings → Devices & Services → Add Integration → Theme Switch Engine**.

---

## 🚀 How Hierarchical Rules Work

Rules are evaluated in descending order of **Priority**:

```text
Priority 100: Weihnachten (24.–26. Dez)  ──► Matched? ──► Vision Glass Christmas
         │ No
Priority  50: Winter Saison (Dez–Feb)   ──► Matched? ──► Day: Winter Light / Night: Winter Dark
         │ No
Priority   0: Standard Fallback          ──► Always   ──► Day: Default Light / Night: Default Dark
```

If multiple conditions are true on the same day (e.g. Dec 25 is both Winter and Christmas), the rule with higher priority (100 > 50) wins cleanly.

---

## 🛠️ Services

- **`theme_switch_engine.evaluate`**: Force immediate evaluation of all rules.
- **`theme_switch_engine.set_mode`**: Set operational mode (`Auto (Engine)`, `Force Day`, `Force Night`, `Paused`).
- **`theme_switch_engine.preview_theme`**: Preview any theme for a given duration in seconds before reverting.

---

## ⚠️ Disclaimer

This custom integration interacts with Home Assistant frontend themes and state services. Always keep regular backups before major upgrades. Provided "as is" without warranty of any kind.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more details.

**Author**: [Adromir](https://github.com/adromir)  
**Website**: <https://github.com/adromir>
