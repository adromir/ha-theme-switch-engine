/**
 * Theme Switch Engine: Universal Client Helper
 * - Detects Desktop vs. Mobile / Companion App
 * - Synchronizes themes in real-time across all HA pages
 * - Hardware-accelerated smooth live transitions
 */
(function() {
  'use strict';
  if (window.__themeSwitchEngineLoaded) return;
  window.__themeSwitchEngineLoaded = true;

  const TRANSITION_STYLE_ID = 'tse-live-transition';

  // Cleanup any legacy glass styles from earlier builds
  ['tse-glass-header', 'tse-glass-ambient', 'tse-glass-cards'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.remove();
  });
  try {
    const ha = document.querySelector('home-assistant');
    const main = ha?.shadowRoot?.querySelector('home-assistant-main');
    const sidebar = main?.shadowRoot?.querySelector('ha-sidebar');
    sidebar?.shadowRoot?.getElementById('tse-glass-sidebar')?.remove();
  } catch (e) {}

  function isMobileClient() {
    const mq = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
    const ua = /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);
    const touch = 'ontouchstart' in window && (window.innerWidth <= 1024);
    return Boolean(mq || ua || touch);
  }

  function resolveDesiredDark(targetTheme, attrs) {
    const lower = String(targetTheme || '').toLowerCase();
    if (lower.includes('light') || lower.includes('hell')) return false;
    if (lower.includes('dark') || lower.includes('dunkel')) return true;
    const mode = String(attrs?.mode || '').toLowerCase();
    if (mode === 'force light' || mode === 'force day') return false;
    if (mode === 'force dark' || mode === 'force night') return true;
    return undefined;
  }

  function applyTransitionStyle(durationMs) {
    let el = document.getElementById(TRANSITION_STYLE_ID);
    if (!durationMs || durationMs <= 0) {
      if (el) el.remove();
      return;
    }
    if (!el) {
      el = document.createElement('style');
      el.id = TRANSITION_STYLE_ID;
      document.head.appendChild(el);
    }
    const dur = Math.max(100, Math.min(3000, durationMs));
    el.textContent = `
      html, body, home-assistant, home-assistant-main, ha-sidebar, hui-root, ha-card, .card-box {
        transition: background-color ${dur}ms cubic-bezier(0.4, 0, 0.2, 1),
                    color ${dur}ms cubic-bezier(0.4, 0, 0.2, 1),
                    border-color ${dur}ms cubic-bezier(0.4, 0, 0.2, 1),
                    box-shadow ${dur}ms cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
    `;
  }

  let lastKnownState = null;

  function syncThemeFromState(stateObj) {
    if (!stateObj) return;
    lastKnownState = stateObj;
    const isMobile = isMobileClient();
    const attrs = stateObj.attributes || {};

    const targetTheme = (isMobile && attrs.theme_mobile)
      ? attrs.theme_mobile
      : (attrs.theme_desktop || stateObj.state);

    if (!targetTheme || targetTheme === 'unknown' || targetTheme === 'unavailable') return;

    // Apply live transition cross-fade if enabled
    if (attrs.transition_enabled !== false) {
      applyTransitionStyle(attrs.transition_duration_ms || 800);
    } else {
      applyTransitionStyle(0);
    }

    const desiredDark = resolveDesiredDark(targetTheme, attrs);

    // Force synchronize client theme and keep localStorage aligned for ANY theme
    try {
      const storageObj = desiredDark !== undefined
        ? { theme: targetTheme, dark: desiredDark }
        : { theme: targetTheme };
      try {
        localStorage.setItem('selectedTheme', JSON.stringify(storageObj));
      } catch (e) {}

      const ha = document.querySelector('home-assistant');
      const curTheme = ha?.hass?.themes?.theme;
      const curDark = ha?.hass?.themes?.darkMode;
      const needsUpdate = (curTheme !== targetTheme) || (desiredDark !== undefined && curDark !== desiredDark);

      if (needsUpdate) {
        const evtDetail = desiredDark !== undefined
          ? { theme: targetTheme, dark: desiredDark }
          : { theme: targetTheme };
        window.dispatchEvent(new CustomEvent('settheme', { bubbles: true, composed: true, detail: evtDetail }));
        document.dispatchEvent(new CustomEvent('settheme', { bubbles: true, composed: true, detail: evtDetail }));
        if (ha) {
          ha.dispatchEvent(new CustomEvent('settheme', { bubbles: true, composed: true, detail: evtDetail }));
          if (typeof ha._applyTheme === 'function') {
            try { ha._applyTheme(evtDetail); } catch (e) {}
          }
        }
      }
    } catch (e) {}
  }

  // Hook into Home Assistant frontend lifecycle
  function init() {
    function recheck() {
      const ha = document.querySelector('home-assistant');
      if (ha && ha.hass && ha.hass.states) {
        const stateObj = ha.hass.states['sensor.active_theme'] || ha.hass.states['sensor.theme_switch_engine_active_theme'];
        if (stateObj && stateObj.state !== 'unknown') {
          syncThemeFromState(stateObj);
        }
      } else if (lastKnownState) {
        syncThemeFromState(lastKnownState);
      }
    }

    recheck();

    // Reapply on SPA navigation (sidebar click, back/forward)
    window.addEventListener('location-changed', () => setTimeout(recheck, 50));
    window.addEventListener('popstate', () => setTimeout(recheck, 50));

    // Listen for custom broadcast from backend
    window.addEventListener('theme-switch-engine-config', (e) => {
      if (e.detail) {
        syncThemeFromState(e.detail);
      }
    });

    // Observe state updates on sensor.active_theme
    let lastSensorKey = null;
    setInterval(() => {
      try {
        const haEl = document.querySelector('home-assistant');
        if (!haEl || !haEl.hass) return;
        const st = haEl.hass.states['sensor.active_theme'] || haEl.hass.states['sensor.theme_switch_engine_active_theme'];
        if (st && st.state !== 'unknown') {
          const currentKey = `${st.state}:${st.attributes?.theme_mobile}:${st.attributes?.mode}:${st.last_updated}`;
          if (currentKey !== lastSensorKey) {
            lastSensorKey = currentKey;
            syncThemeFromState(st);
          }
        }
      } catch (e) {}
    }, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
