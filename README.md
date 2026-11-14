# 🔄 Theme Switch Engine for Home Assistant

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=adromir&repository=ha-theme-switch-engine&category=integration)
[![Ko-Fi](https://img.shields.io/badge/Ko--fi-F16061?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/adromir)
[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg?style=for-the-badge)](https://github.com/hacs/default)
[![GitHub Release](https://img.shields.io/github/v/release/adromir/ha-theme-switch-engine?style=for-the-badge&color=blue)](https://github.com/adromir/ha-theme-switch-engine/releases)
[![Home Assistant](https://img.shields.io/badge/Home%20Assistant-2024.7%2B-18BCF2?style=for-the-badge&logo=home-assistant)](https://www.home-assistant.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg?style=for-the-badge)](https://github.com/adromir/ha-theme-switch-engine)

A universal, hierarchical, **rule-based theme switching integration** for Home Assistant. Switch between arbitrarily many themes based on sun position, weather states, time schedules, annual recurring dates (holidays, Christmas, New Year), seasons, weekdays, and custom entity states with optional hardware-accelerated **smooth live transitions**, **fullscreen canvas particle effects**, and **atmospheric background soundscapes**.

---

## ✨ Key Advantages & Features

- 🎯 **Hierarchical First-Match-Wins Rule Engine**: Prioritize specific temporary events over broad seasons (e.g. Christmas theme with Priority 100 cleanly overrides Winter theme with Priority 50 without conflict).
- 📱 **Desktop vs. Mobile Theme Targeting**: Assign dedicated desktop and companion app / mobile themes per rule (e.g. high-density glass for desktop, minimal OLED dark for phones).
- 🌓 **Home Assistant Default Theme Restoration**: Selectable directly from the global mode selector (`Home Assistant Default`, `Force Light`, `Force Dark`, `Auto`, `Paused`) to easily revert or test vanilla Home Assistant themes.
- ⚡ **Hardware-Accelerated Smooth Live Transitions**: Optional configurable cross-fade effect when themes switch in real-time, eliminating abrupt color flashes (can be toggled or customized in ms).
- 🎆 **Fullscreen Atmospheric Visual Effects**:
  - Non-blocking canvas overlay (`pointer-events: none; z-index: 999999;`) that never obstructs clicks or gestures.
  - Zero idle CPU overhead: cancels `requestAnimationFrame` when no effect is active.
  - **6 Bundled High-Performance Canvas Effects**:
    1. ❄️ **Schneefall (Snow)**: Gentle, softly floating white snowflakes with natural sway and drift.
    2. 🌧️ **Regen (Rain)**: Diagonal sleek raindrops with realistic ground splashes.
    3. 🌌 **Polarlicht (Aurora Borealis)**: Ethereal glowing ribbons of emerald green, cyan, and violet shimmering across the sky.
    4. 🌫️ **Nebel (Fog)**: Volumetric drifting misty clouds rolling softly across the screen.
    5. 🎆 **Feuerwerk (Fireworks)**: Festive rockets bursting into vibrant particle explosions with gravity and sparkle physics.
    6. 🍂 **Fallende Blätter (Falling Leaves)**: Autumn leaves fluttering down with 3D tumbling rotation and warm seasonal colors.
  - **Custom JS Plugin Architecture**: Users can easily write and plug in their own canvas effects!
- 🔊 **Soundscape & Audio System**:
  - Stream sound files directly from the Home Assistant `/media` folder (or `/config/www/sounds/`).
  - Configurable subfolder (defaults to `/media/theme_sounds/`).
  - **3 Playback Modes**: `play_once` (play once on theme activation), `loop_count` (repeat X times), or `loop_endless` (continuous ambient loop).
  - Smooth volume fade-out when switching rules.
  - Resilient to browser autoplay policies (auto-resumes on first user interaction).
- 🌦️ **Rich Condition Suite**:
  - **Sun Position**: Above/below horizon, solar elevation thresholds.
  - **Moon Phases**: Full Moon, New Moon, Waxing/Waning crescent, etc. (seamlessly discovers installed moon sensor).
  - **Ebb & Flow (Tides)**: Trigger themes based on high tide, low tide, or rising water (auto-detects World Tides integration).
  - **Weather States**: Matches conditions from your weather integration (`rainy`, `snowy`, `cloudy`, `sunny`, etc.) via convenient dropdown selectors.
  - **Time Schedules**: Time windows with automatic midnight crossover support (e.g. `22:00 – 06:00`).
  - **Date & Annual Ranges**: Specific dates or recurring annual ranges (e.g. `12-24` to `12-26` for Christmas, `12-31` to `01-02` for New Year).
  - **Weekdays & Weekends**: Specific days or `workday` / `weekend` grouping.
  - **Seasons**: Spring, Summer, Autumn, Winter.
  - **Custom Entity States**: Trigger themes from Cinema Mode, Guest Mode, Alarmo status, or sleep helpers.
- 🕹️ **First-Class Home Assistant Entities**:
  - `select.theme_switch_engine_mode`: Switch between **Auto (Engine)**, **Force Light**, **Force Dark**, **Home Assistant Default**, or **Paused**.
  - `sensor.theme_switch_engine_active_theme`: Live report of active theme, triggering rule, priority, active effect, and sound attributes.

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
7. The standalone management panel is permanently available in the Home Assistant sidebar under **Theme Engine** (`/theme-switch-engine`).

---

## 🎨 How-To: Creating Custom JavaScript Effects

Theme Switch Engine provides an open plugin API (`window.ThemeEngineFX`) allowing anyone to add custom screen effects.

### Step 1: Create the Effects Directory
In your Home Assistant configuration directory, create the folder `/config/www/theme_effects/`:
```text
/config/
└── www/
    └── theme_effects/
        └── index.js
```
*(Files in `/config/www/` are publicly accessible to your Home Assistant frontend under `/local/`)*.

### Step 2: Write your Custom Effect
In `/config/www/theme_effects/index.js`, register your effect with `window.ThemeEngineFX.register(id, effectDefinition)`:

```javascript
/**
 * Custom Effect Plugin for Theme Switch Engine
 * File: /config/www/theme_effects/index.js
 */
(function() {
  'use strict';

  if (!window.ThemeEngineFX) return;

  // Register your custom effect:
  window.ThemeEngineFX.register('golden_sparkles', {
    name: '✨ Golden Sparkles',

    /**
     * Called once when the effect starts.
     * @param {HTMLCanvasElement} canvas The fullscreen canvas element
     * @param {number} width Current screen width
     * @param {number} height Current screen height
     * @returns {object} Your effect state object
     */
    init(canvas, width, height) {
      const sparkles = [];
      for (let i = 0; i < 60; i++) {
        sparkles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 3 + 1,
          speedY: Math.random() * 0.8 + 0.3,
          alpha: Math.random(),
          alphaSpeed: (Math.random() - 0.5) * 0.04
        });
      }
      return { sparkles };
    },

    /**
     * Called on every animation frame (60 FPS).
     * @param {CanvasRenderingContext2D} ctx 2D rendering context
     * @param {number} width Current screen width
     * @param {number} height Current screen height
     * @param {number} dt Delta time in seconds since last frame
     * @param {object} state The state object returned by init()
     * @returns {boolean|void} Return false if the effect has finished (for one-shot effects)
     */
    update(ctx, width, height, dt, state) {
      ctx.fillStyle = '#fbbf24'; // Warm gold
      state.sparkles.forEach(s => {
        s.y -= s.speedY;
        s.alpha += s.alphaSpeed;
        if (s.alpha > 1 || s.alpha < 0.1) s.alphaSpeed = -s.alphaSpeed;
        if (s.y < -10) s.y = height + 10;

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, s.alpha));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    },

    /**
     * Called when the effect is stopped or rule switches.
     */
    destroy(state) {
      // Optional cleanup
    }
  });
})();
```

### Step 3: Select in Theme Engine
Open `/theme-switch-engine` in Home Assistant. When editing or creating a rule, your custom effect **✨ Golden Sparkles** will immediately appear in the **Screen Effect** dropdown!

---

## 🎵 Soundscapes & Audio Setup

To use sounds with your theme rules:
1. Place your audio files (`.mp3`, `.wav`, `.ogg`, `.m4a`, `.flac`) into your Home Assistant `/media/theme_sounds/` folder (or specify another subfolder in the panel's Advanced Settings).
2. In the Theme Switch Engine rule editor, select your sound from the dropdown, preview it using the ▶ button, and configure volume and repeat mode (`play_once`, `loop_count`, `loop_endless`).

---

## 🚀 How Hierarchical Rules Work

Rules are evaluated in descending order of **Priority**:

```text
Priority 100: Weihnachten (24.–26. Dez)  ──► Matched? ──► Vision Glass Christmas + Schneefall + Chimes Sound
         │ No
Priority  50: Winter Saison (Dez–Feb)   ──► Matched? ──► Day: Winter Light / Night: Winter Dark
         │ No
Priority   0: Standard Fallback          ──► Always   ──► Day: Default Light / Night: Default Dark
```

If multiple conditions are true on the same day (e.g. Dec 25 is both Winter and Christmas), the rule with higher priority (100 > 50) wins cleanly.

---

## 🛠️ Services

- **`theme_switch_engine.evaluate`**: Force immediate evaluation of all rules (`force: true`).
- **`theme_switch_engine.set_mode`**: Set operational mode (`Auto (Engine)`, `Force Light`, `Force Dark`, `Home Assistant Default`, `Paused`).
- **`theme_switch_engine.preview_theme`**: Preview any theme for a given duration in seconds before reverting.

---

## ⚠️ Disclaimer

This custom integration interacts with Home Assistant frontend themes and state services. Always keep regular backups before major upgrades. Provided "as is" without warranty of any kind.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more details.

**Author**: [Adromir](https://github.com/adromir)  
**Website**: <https://github.com/adromir>
