/**
 * Theme Switch Engine: Universal Client Helper
 * - Detects Desktop vs. Mobile / Companion App
 * - Synchronizes themes in real-time across all HA pages
 * - Built-in native Glassmorphism engine (frosted glass sidebar, header, cards)
 * - Hardware-accelerated smooth live transitions
 */
(function() {
  'use strict';
  if (window.__themeSwitchEngineLoaded) return;
  window.__themeSwitchEngineLoaded = true;

  const TRANSITION_STYLE_ID = 'tse-live-transition';
  const GLASS_HEADER_ID = 'tse-glass-header';
  const GLASS_AMBIENT_ID = 'tse-glass-ambient';
  const GLASS_CARD_ID = 'tse-glass-cards';
  const GLASS_SIDEBAR_ID = 'tse-glass-sidebar';

  function isMobileClient() {
    const mq = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
    const ua = /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);
    const touch = 'ontouchstart' in window && (window.innerWidth <= 1024);
    return Boolean(mq || ua || touch);
  }

  function isCompanionApp() {
    return navigator.userAgent.includes('Home Assistant') || Boolean(window.externalApp);
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

  function applyGlassmorphism(activeTheme, isLight) {
    const isGlass = activeTheme && activeTheme.toLowerCase().includes('glass');
    if (!isGlass) {
      // Remove any glass styles when non-glass theme is active
      [GLASS_HEADER_ID, GLASS_AMBIENT_ID, GLASS_CARD_ID].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.remove();
      });
      try {
        const ha = document.querySelector('home-assistant');
        const main = ha?.shadowRoot?.querySelector('home-assistant-main');
        const sidebar = main?.shadowRoot?.querySelector('ha-sidebar');
        sidebar?.shadowRoot?.getElementById(GLASS_SIDEBAR_ID)?.remove();
      } catch (e) {}
      return;
    }

    // 1. Ambient Background Glow
    if (!document.getElementById(GLASS_AMBIENT_ID)) {
      const ambStyle = document.createElement('style');
      ambStyle.id = GLASS_AMBIENT_ID;
      ambStyle.textContent = `
        @keyframes tseAmbientWaft {
          0% { transform: translate3d(0, 0, 0) scale(1) rotate(0deg); }
          50% { transform: translate3d(40px, -30px, 0) scale(1.15) rotate(18deg); }
          100% { transform: translate3d(-35px, 40px, 0) scale(0.95) rotate(-18deg); }
        }
        body::before {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          opacity: 0.35;
          background:
            radial-gradient(circle at 20% 25%, rgba(56, 189, 248, 0.35) 0%, transparent 45%),
            radial-gradient(circle at 80% 75%, rgba(99, 102, 241, 0.30) 0%, transparent 48%),
            radial-gradient(circle at 72% 20%, rgba(16, 185, 129, 0.25) 0%, transparent 42%),
            radial-gradient(circle at 22% 80%, rgba(245, 158, 11, 0.20) 0%, transparent 42%);
          filter: blur(85px);
          animation: tseAmbientWaft 30s ease-in-out infinite alternate;
        }
      `;
      document.head.appendChild(ambStyle);
    }

    // 2. Global Header Styling
    if (!document.getElementById(GLASS_HEADER_ID)) {
      const hStyle = document.createElement('style');
      hStyle.id = GLASS_HEADER_ID;
      hStyle.textContent = `
        app-header, .header, ha-top-app-bar-fixed {
          background: var(--app-header-background-color, rgba(15, 23, 42, 0.82)) !important;
          backdrop-filter: var(--app-header-backdrop-filter, blur(28px) saturate(190%)) !important;
          -webkit-backdrop-filter: var(--app-header-backdrop-filter, blur(28px) saturate(190%)) !important;
          border-bottom: 1px solid var(--divider-color, rgba(255, 255, 255, 0.15)) !important;
        }
      `;
      document.head.appendChild(hStyle);
    }

    // 3. Frosted Glass Cards
    if (!document.getElementById(GLASS_CARD_ID)) {
      const cStyle = document.createElement('style');
      cStyle.id = GLASS_CARD_ID;
      cStyle.textContent = `
        ha-card {
          border-radius: 22px !important;
          backdrop-filter: blur(25px) saturate(180%) !important;
          -webkit-backdrop-filter: blur(25px) saturate(180%) !important;
          border: 1px solid var(--border-glass, var(--divider-color, rgba(255, 255, 255, 0.15))) !important;
        }
      `;
      document.head.appendChild(cStyle);
    }

    // 4. Frosted Glass Sidebar (injected cleanly into ha-sidebar shadow root)
    try {
      const ha = document.querySelector('home-assistant');
      const main = ha?.shadowRoot?.querySelector('home-assistant-main');
      const sidebar = main?.shadowRoot?.querySelector('ha-sidebar');
      if (sidebar && sidebar.shadowRoot) {
        let sbStyle = sidebar.shadowRoot.getElementById(GLASS_SIDEBAR_ID);
        if (!sbStyle) {
          sbStyle = document.createElement('style');
          sbStyle.id = GLASS_SIDEBAR_ID;
          sidebar.shadowRoot.appendChild(sbStyle);
        }
        const bgShell = isLight ? 'rgba(238, 246, 255, 0.85)' : 'rgba(15, 23, 42, 0.80)';
        const textPrimary = isLight ? '#0f172a' : '#f8fafc';
        const dividerColor = isLight ? 'rgba(148, 163, 184, 0.35)' : 'rgba(255, 255, 255, 0.12)';
        const activeBg = isLight ? 'rgba(2, 132, 199, 0.16)' : 'rgba(56, 189, 248, 0.18)';
        const activeBorder = isLight ? 'rgba(2, 132, 199, 0.35)' : 'rgba(56, 189, 248, 0.35)';
        const accentColor = isLight ? '#0284c7' : '#38bdf8';

        sbStyle.textContent = `
          :host {
            background: ${bgShell} !important;
            backdrop-filter: blur(30px) saturate(190%) !important;
            -webkit-backdrop-filter: blur(30px) saturate(190%) !important;
            border-right: 1px solid ${dividerColor} !important;
          }
          .menu { border-bottom: 1px solid ${dividerColor} !important; }
          paper-listbox, ha-md-list { background: transparent !important; }
          ha-md-list-item, paper-icon-item, a[role="listitem"] {
            border-radius: 14px !important;
            margin: 2px 8px !important;
            color: ${textPrimary} !important;
            transition: background 0.2s ease, border-color 0.2s ease !important;
          }
          ha-md-list-item:hover, paper-icon-item:hover, a[role="listitem"]:hover {
            background: rgba(255, 255, 255, 0.08) !important;
          }
          ha-md-list-item.iron-selected, paper-icon-item.iron-selected, a.iron-selected, [aria-current="page"] {
            background: ${activeBg} !important;
            border: 1px solid ${activeBorder} !important;
            color: ${accentColor} !important;
            --md-list-item-label-text-color: ${accentColor} !important;
            --md-list-item-leading-icon-color: ${accentColor} !important;
          }
        `;
      }
    } catch (e) {}
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

    const isLight = targetTheme.toLowerCase().includes('light');

    // Apply Live Transitions
    if (attrs.transition_enabled !== false) {
      applyTransitionStyle(attrs.transition_duration_ms || 800);
    } else {
      applyTransitionStyle(0);
    }

    // Apply Native Glassmorphism
    if (attrs.glassmorphism_enabled !== false) {
      applyGlassmorphism(targetTheme, isLight);
    }

    // Force synchronize client theme and keep localStorage aligned
    try {
      try {
        localStorage.setItem('selectedTheme', JSON.stringify(targetTheme));
      } catch (e) {}

      const ha = document.querySelector('home-assistant');
      const curTheme = ha?.hass?.themes?.theme;
      if (curTheme !== targetTheme) {
        const evtDetail = { theme: targetTheme };
        window.dispatchEvent(new CustomEvent('settheme', { bubbles: true, composed: true, detail: evtDetail }));
        document.dispatchEvent(new CustomEvent('settheme', { bubbles: true, composed: true, detail: evtDetail }));
        if (ha) {
          ha.dispatchEvent(new CustomEvent('settheme', { bubbles: true, composed: true, detail: evtDetail }));
          if (typeof ha._applyTheme === 'function') {
            try { ha._applyTheme(targetTheme); } catch (e) {}
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
          const currentKey = `${st.state}:${st.attributes?.theme_mobile}:${st.last_updated}`;
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
