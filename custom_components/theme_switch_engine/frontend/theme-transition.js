/**
 * Theme Switch Engine - Smooth Live Transition Injector
 * Provides hardware-accelerated cross-fade transitions when themes change in real-time.
 */
(function() {
  'use strict';
  if (window.__themeSwitchTransitionLoaded) return;
  window.__themeSwitchTransitionLoaded = true;

  const STYLE_ID = 'theme-switch-engine-transition';

  function applyTransition(durationMs) {
    let el = document.getElementById(STYLE_ID);
    if (!durationMs || durationMs <= 0) {
      if (el) el.remove();
      return;
    }

    if (!el) {
      el = document.createElement('style');
      el.id = STYLE_ID;
      document.head.appendChild(el);
    }

    const dur = Math.max(100, Math.min(3000, durationMs));
    el.textContent = `
      html, body, home-assistant, home-assistant-main, ha-sidebar, hui-root, ha-card, .card-box, .dashboard-root {
        transition: background-color ${dur}ms cubic-bezier(0.4, 0, 0.2, 1),
                    color ${dur}ms cubic-bezier(0.4, 0, 0.2, 1),
                    border-color ${dur}ms cubic-bezier(0.4, 0, 0.2, 1),
                    box-shadow ${dur}ms cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
    `;
  }

  // Listen for custom event or configuration broadcast from backend
  window.addEventListener('theme-switch-engine-config', (e) => {
    if (e.detail) {
      applyTransition(e.detail.transition_enabled ? e.detail.transition_duration : 0);
    }
  });

  // Default initial transition
  applyTransition(800);
})();

