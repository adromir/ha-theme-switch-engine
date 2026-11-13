/**
 * Standalone Theme Switch Engine Panel
 * Allows complete rule, theme, desktop/mobile, and glassmorphism management
 * without needing Vision Glass Dashboard or third-party card-mod.
 */
class ThemeSwitchEnginePanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._hass = null;
    this._panel = null;
    this._data = null;
    this._loading = false;
    this._showAddModal = false;
    this._editingRule = null;
  }

  set hass(val) {
    this._hass = val;
    if (!this._data && !this._loading) {
      this._loadData();
    }
  }

  set panel(val) {
    this._panel = val;
  }

  async _loadData() {
    if (!this._hass || !this._hass.callWS) return;
    this._loading = true;
    try {
      const res = await this._hass.callWS({ type: 'theme_switch_engine/rules/get' });
      this._data = res;
      this._render();
    } catch (err) {
      console.error('[ThemeEngine] Failed to load data:', err);
    } finally {
      this._loading = false;
    }
  }

  async _saveRules(newRules) {
    if (!this._hass || !this._hass.callWS) return;
    try {
      await this._hass.callWS({ type: 'theme_switch_engine/rules/save', rules: newRules });
      await this._loadData();
    } catch (err) {
      alert('Fehler beim Speichern der Regeln: ' + err.message);
    }
  }

  async _saveConfig(newConfig) {
    if (!this._hass || !this._hass.callWS) return;
    try {
      await this._hass.callWS({ type: 'theme_switch_engine/config/save', config: newConfig });
      await this._loadData();
    } catch (err) {
      alert('Fehler beim Speichern der Konfiguration: ' + err.message);
    }
  }

  async _setMode(mode) {
    if (!this._hass) return;
    try {
      await this._hass.callService('theme_switch_engine', 'set_mode', { mode });
      await this._loadData();
    } catch (err) {
      console.error(err);
    }
  }

  async _evaluate() {
    if (!this._hass) return;
    try {
      await this._hass.callService('theme_switch_engine', 'evaluate', { force: true });
      await this._loadData();
    } catch (err) {
      console.error(err);
    }
  }

  async _preview(theme) {
    if (!this._hass) return;
    try {
      await this._hass.callService('theme_switch_engine', 'preview_theme', { theme, duration: 15 });
    } catch (err) {
      console.error(err);
    }
  }

  _isMobileClient() {
    const mq = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
    const ua = /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);
    return Boolean(mq || ua);
  }

  _render() {
    if (!this._data) {
      this.shadowRoot.innerHTML = `<div style="padding:40px;text-align:center;color:var(--primary-text-color,#fff);">Lade Theme Engine...</div>`;
      return;
    }

    const d = this._data;
    const cfg = d.config || {};
    const rules = d.rules || [];
    const themes = d.themes || ['default'];
    const modes = d.modes || ['Auto (Engine)', 'Force Day', 'Force Night', 'Paused'];
    const isMobile = this._isMobileClient();

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          box-sizing: border-box;
          min-height: 100vh;
          background: var(--lovelace-background, var(--primary-background-color, #0f172a));
          color: var(--primary-text-color, #f8fafc);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          padding: 24px 32px 60px 32px;
        }
        .container {
          max-width: 1100px;
          margin: 0 auto;
        }
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--divider-color, rgba(255,255,255,0.12));
        }
        .header-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .header-title h1 {
          font-size: 24px;
          font-weight: 700;
          margin: 0;
          letter-spacing: -0.5px;
        }
        .header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .btn {
          background: var(--ha-card-background, rgba(30, 41, 59, 0.7));
          color: var(--primary-text-color, #fff);
          border: 1px solid var(--divider-color, rgba(255,255,255,0.15));
          padding: 8px 16px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          font-size: 13px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: background 0.2s ease, transform 0.1s ease;
        }
        .btn:hover {
          background: var(--primary-color, #0284c7);
          color: #fff;
        }
        .btn-primary {
          background: var(--primary-color, #0284c7);
          color: #fff;
          border: none;
        }
        .grid-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        .card {
          background: var(--ha-card-background, rgba(30, 41, 59, 0.6));
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid var(--divider-color, rgba(255,255,255,0.12));
          border-radius: 16px;
          padding: 18px;
          box-sizing: border-box;
        }
        .card-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: var(--secondary-text-color, #94a3b8);
          margin-bottom: 6px;
        }
        .card-val {
          font-size: 18px;
          font-weight: 700;
          color: var(--primary-text-color, #fff);
        }
        .card-sub {
          font-size: 12px;
          color: var(--secondary-text-color, #94a3b8);
          margin-top: 4px;
        }
        .badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 700;
        }
        .badge-auto { background: rgba(56, 189, 248, 0.2); color: #38bdf8; }
        .badge-day { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
        .badge-night { background: rgba(168, 85, 247, 0.2); color: #c084fc; }
        .badge-prio { background: rgba(16, 185, 129, 0.2); color: #10b981; }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 28px 0 14px 0;
        }
        .section-title {
          font-size: 18px;
          font-weight: 700;
        }

        .rules-table {
          width: 100%;
          border-collapse: collapse;
          background: var(--ha-card-background, rgba(30, 41, 59, 0.6));
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid var(--divider-color, rgba(255,255,255,0.12));
        }
        .rules-table th {
          text-align: left;
          padding: 12px 16px;
          font-size: 12px;
          color: var(--secondary-text-color, #94a3b8);
          border-bottom: 1px solid var(--divider-color, rgba(255,255,255,0.1));
          background: rgba(0,0,0,0.15);
        }
        .rules-table td {
          padding: 12px 16px;
          font-size: 13px;
          border-bottom: 1px solid var(--divider-color, rgba(255,255,255,0.06));
        }
        .rules-table tr:last-child td { border-bottom: none; }

        select, input[type="text"], input[type="number"] {
          background: var(--secondary-background-color, rgba(15, 23, 42, 0.6));
          color: var(--primary-text-color, #fff);
          border: 1px solid var(--divider-color, rgba(255,255,255,0.2));
          border-radius: 8px;
          padding: 6px 10px;
          font-size: 13px;
        }
        .switch-toggle {
          position: relative;
          display: inline-block;
          width: 38px;
          height: 22px;
        }
        .switch-toggle input { opacity: 0; width: 0; height: 0; }
        .slider {
          position: absolute; cursor: pointer; inset: 0;
          background-color: rgba(255,255,255,0.2);
          transition: .3s; border-radius: 22px;
        }
        .slider:before {
          position: absolute; content: ""; height: 16px; width: 16px;
          left: 3px; bottom: 3px; background-color: white;
          transition: .3s; border-radius: 50%;
        }
        input:checked + .slider { background-color: var(--primary-color, #0284c7); }
        input:checked + .slider:before { transform: translateX(16px); }

        /* Modal */
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.65);
          backdrop-filter: blur(10px);
          display: flex; align-items: center; justify-content: center;
          z-index: 9999;
        }
        .modal-box {
          background: var(--ha-card-background, #1e293b);
          border: 1px solid var(--divider-color, rgba(255,255,255,0.2));
          border-radius: 20px;
          width: 90%; max-width: 600px;
          padding: 24px; box-sizing: border-box;
          max-height: 90vh; overflow-y: auto;
        }
        .form-row {
          margin-bottom: 14px;
        }
        .form-row label {
          display: block; font-size: 12px; margin-bottom: 4px;
          color: var(--secondary-text-color, #94a3b8);
        }
        .form-row select, .form-row input {
          width: 100%; box-sizing: border-box;
        }
      </style>

      <div class="container">
        <!-- Header -->
        <div class="header">
          <div class="header-title">
            <ha-icon icon="mdi:palette-swatch-outline" style="--mdc-icon-size:32px;color:var(--primary-color,#38bdf8);"></ha-icon>
            <div>
              <h1>Theme Switch Engine</h1>
              <div style="font-size:12px;color:var(--secondary-text-color,#94a3b8);">
                Hierarchischer Regel-Manager & Geräte-Zuweisung (Desktop / Mobil)
              </div>
            </div>
          </div>
          <div class="header-actions">
            <select id="selGlobalMode">
              ${modes.map(m => `<option value="${m}" ${m === d.mode ? 'selected' : ''}>${m}</option>`).join('')}
            </select>
            <button class="btn" id="btnEvaluate">
              <ha-icon icon="mdi:refresh" style="--mdc-icon-size:16px;"></ha-icon> Jetzt prüfen
            </button>
          </div>
        </div>

        <!-- Status Cards -->
        <div class="grid-cards">
          <div class="card">
            <div class="card-label">Aktives Desktop Theme</div>
            <div class="card-val">${d.active_theme_desktop || d.active_theme || 'default'}</div>
            <div class="card-sub">Regel: ${d.active_rule_name} (Prio ${d.priority})</div>
          </div>
          <div class="card">
            <div class="card-label">Aktives Mobil Theme</div>
            <div class="card-val">${d.active_theme_mobile || d.active_theme || 'default'}</div>
            <div class="card-sub">${isMobile ? '📱 Dieses Gerät ist Mobil' : '💻 Dieses Gerät ist Desktop'}</div>
          </div>
          <div class="card">
            <div class="card-label">Sonne & Tageslicht</div>
            <div class="card-val">${d.day_night_variant === 'day' ? '☀️ Tag' : '🌙 Nacht'} (${d.sun?.elevation?.toFixed(1) || 0}°)</div>
            <div class="card-sub">Status: ${d.sun?.state || 'unknown'}</div>
          </div>
          <div class="card">
            <div class="card-label">Glasmorphismus & Effekte</div>
            <div class="card-val">${cfg.glassmorphism_enabled !== false ? 'Aktiviert' : 'Deaktiviert'}</div>
            <div class="card-sub">Übergang: ${cfg.transition_duration || 800}ms</div>
          </div>
        </div>

        <!-- Standard Profile -->
        <div class="card" style="margin-bottom:24px;">
          <div style="font-weight:700;font-size:15px;margin-bottom:12px;">Standard-Themes (Fallback)</div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:14px;">
            <div>
              <label style="font-size:11px;color:var(--secondary-text-color,#94a3b8);display:block;margin-bottom:4px;">Desktop Tag</label>
              <select id="selDefDay" style="width:100%;">
                ${themes.map(t => `<option value="${t}" ${t === (cfg.default_theme_day || 'Vision Glass Light') ? 'selected' : ''}>${t}</option>`).join('')}
              </select>
            </div>
            <div>
              <label style="font-size:11px;color:var(--secondary-text-color,#94a3b8);display:block;margin-bottom:4px;">Desktop Nacht</label>
              <select id="selDefNight" style="width:100%;">
                ${themes.map(t => `<option value="${t}" ${t === (cfg.default_theme_night || 'Vision Glass Dark') ? 'selected' : ''}>${t}</option>`).join('')}
              </select>
            </div>
            <div>
              <label style="font-size:11px;color:var(--secondary-text-color,#94a3b8);display:block;margin-bottom:4px;">Mobil Tag</label>
              <select id="selDefMobDay" style="width:100%;">
                ${themes.map(t => `<option value="${t}" ${t === (cfg.default_theme_mobile_day || 'Vision Glass Light') ? 'selected' : ''}>${t}</option>`).join('')}
              </select>
            </div>
            <div>
              <label style="font-size:11px;color:var(--secondary-text-color,#94a3b8);display:block;margin-bottom:4px;">Mobil Nacht</label>
              <select id="selDefMobNight" style="width:100%;">
                ${themes.map(t => `<option value="${t}" ${t === (cfg.default_theme_mobile_night || 'Vision Glass Dark') ? 'selected' : ''}>${t}</option>`).join('')}
              </select>
            </div>
          </div>
        </div>

        <!-- Rules Section -->
        <div class="section-header">
          <div class="section-title">Hierarchische Regeln (Höchste Priorität gewinnt)</div>
          <button class="btn btn-primary" id="btnAddRule">
            <ha-icon icon="mdi:plus" style="--mdc-icon-size:16px;"></ha-icon> Regel hinzufügen
          </button>
        </div>

        <table class="rules-table">
          <thead>
            <tr>
              <th style="width:50px;">Aktiv</th>
              <th style="width:70px;">Prio</th>
              <th>Regel-Name</th>
              <th>Bedingungen</th>
              <th>Desktop Theme</th>
              <th>Mobil Theme</th>
              <th style="width:100px;text-align:right;">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            ${rules.length === 0 ? `<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--secondary-text-color,#94a3b8);">Keine benutzerdefinierten Regeln hinterlegt. Es greifen die Standard-Fallbacks.</td></tr>` : ''}
            ${rules.map((r, idx) => {
              const condStr = (r.conditions || []).map(c => {
                if (c.type === 'date_range') return `📅 ${c.start_date} bis ${c.end_date}`;
                if (c.type === 'season') return `🍂 ${c.season}`;
                if (c.type === 'weather') return `⛅ ${c.states}`;
                if (c.type === 'time') return `⏰ ${c.after || '00:00'}-${c.before || '24:00'}`;
                if (c.type === 'sun') return `☀️ ${c.state || 'elev'}`;
                if (c.type === 'entity_state') return `⚡ ${c.entity_id} == ${c.state}`;
                return c.type;
              }).join(', ') || 'Immer aktiv';

              const deskTheme = r.theme || (r.theme_day ? `${r.theme_day} / ${r.theme_night || ''}` : 'Standard');
              const mobTheme = r.theme_mobile || (r.theme_mobile_day ? `${r.theme_mobile_day} / ${r.theme_mobile_night || ''}` : 'Wie Desktop');

              return `
                <tr>
                  <td>
                    <label class="switch-toggle">
                      <input type="checkbox" class="rule-toggle" data-idx="${idx}" ${r.enabled !== false ? 'checked' : ''}>
                      <span class="slider"></span>
                    </label>
                  </td>
                  <td><span class="badge badge-prio">${r.priority || 0}</span></td>
                  <td><strong>${r.name || 'Unbenannt'}</strong></td>
                  <td style="color:var(--secondary-text-color,#94a3b8);">${condStr}</td>
                  <td>${deskTheme}</td>
                  <td>${mobTheme}</td>
                  <td style="text-align:right;">
                    <button class="btn btn-preview-rule" data-theme="${r.theme || r.theme_day || r.theme_night || ''}" title="15s Vorschau" style="padding:4px 8px;">
                      <ha-icon icon="mdi:eye" style="--mdc-icon-size:14px;"></ha-icon>
                    </button>
                    <button class="btn btn-del-rule" data-idx="${idx}" title="Löschen" style="padding:4px 8px;color:#ef4444;">
                      <ha-icon icon="mdi:delete" style="--mdc-icon-size:14px;"></ha-icon>
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <!-- Settings & Effects -->
        <div class="card" style="margin-top:30px;">
          <div style="font-weight:700;font-size:15px;margin-bottom:14px;">Erweiterte Engine-Einstellungen</div>
          <div style="display:flex;flex-direction:column;gap:12px;">
            <label style="display:flex;align-items:center;gap:10px;font-size:13px;cursor:pointer;">
              <input type="checkbox" id="chkGlassmorphism" ${cfg.glassmorphism_enabled !== false ? 'checked' : ''}>
              <span><strong>Native Glasmorphismus-Funktion aktivieren</strong> (Milchglas-Seitenleiste, animierter Hintergrund, weiche Karten ohne card-mod)</span>
            </label>
            <label style="display:flex;align-items:center;gap:10px;font-size:13px;cursor:pointer;">
              <input type="checkbox" id="chkTransition" ${cfg.transition_enabled !== false ? 'checked' : ''}>
              <span><strong>Weichen Live-Übergangseffekt aktivieren</strong></span>
            </label>
            <div style="display:flex;align-items:center;gap:12px;font-size:13px;padding-left:26px;">
              <span>Übergangsdauer:</span>
              <input type="number" id="numTransitionDuration" value="${cfg.transition_duration || 800}" min="100" max="3000" step="50" style="width:80px;"> ms
            </div>
            <label style="display:flex;align-items:center;gap:10px;font-size:13px;cursor:pointer;">
              <input type="checkbox" id="chkShowSidebar" ${cfg.show_sidebar !== false ? 'checked' : ''}>
              <span><strong>In Home Assistant Seitenleiste anzeigen</strong></span>
            </label>
          </div>
        </div>
      </div>

      <!-- Add Rule Modal -->
      ${this._showAddModal ? `
        <div class="modal-overlay" id="modalOverlay">
          <div class="modal-box">
            <h2 style="margin-top:0;font-size:18px;">Neue Theme-Regel erstellen</h2>
            <div class="form-row">
              <label>Regel-Name</label>
              <input type="text" id="mRuleName" placeholder="z. B. Sommerurlaub, Kino-Modus, Regenwetter" value="Neue Regel">
            </div>
            <div class="form-row">
              <label>Priorität (Höhere Zahl überschreibt niedrigere Regeln)</label>
              <input type="number" id="mRulePrio" value="50" min="0" max="1000">
            </div>
            <div class="form-row">
              <label>Bedingungstyp</label>
              <select id="mCondType">
                <option value="weather">Wetter (z. B. rainy, sunny, snowy)</option>
                <option value="time">Uhrzeit (mit Mitternachtsüberlauf)</option>
                <option value="date_range">Datumsbereich (jährlich wie Weihnachten)</option>
                <option value="season">Jahreszeit (winter, summer, spring, autumn)</option>
                <option value="sun">Sonnenstand (above_horizon, below_horizon)</option>
                <option value="entity_state">Beliebiger Entitätszustand</option>
              </select>
            </div>
            <div class="form-row" id="mCondValRow">
              <label>Bedingungswert (z. B. rainy)</label>
              <input type="text" id="mCondVal" value="rainy">
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;">
              <div>
                <label style="font-size:12px;color:#94a3b8;">Desktop Tag-Theme</label>
                <select id="mThemeDay" style="width:100%;">
                  ${themes.map(t => `<option value="${t}">${t}</option>`).join('')}
                </select>
              </div>
              <div>
                <label style="font-size:12px;color:#94a3b8;">Desktop Nacht-Theme</label>
                <select id="mThemeNight" style="width:100%;">
                  ${themes.map(t => `<option value="${t}">${t}</option>`).join('')}
                </select>
              </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:18px;">
              <div>
                <label style="font-size:12px;color:#94a3b8;">Mobil Tag-Theme (optional)</label>
                <select id="mMobThemeDay" style="width:100%;">
                  <option value="">Wie Desktop</option>
                  ${themes.map(t => `<option value="${t}">${t}</option>`).join('')}
                </select>
              </div>
              <div>
                <label style="font-size:12px;color:#94a3b8;">Mobil Nacht-Theme (optional)</label>
                <select id="mMobThemeNight" style="width:100%;">
                  <option value="">Wie Desktop</option>
                  ${themes.map(t => `<option value="${t}">${t}</option>`).join('')}
                </select>
              </div>
            </div>
            <div style="display:flex;justify-content:flex-end;gap:10px;">
              <button class="btn" id="btnCancelModal">Abbrechen</button>
              <button class="btn btn-primary" id="btnSaveRuleModal">Regel speichern</button>
            </div>
          </div>
        </div>
      ` : ''}
    `;

    this._attachEvents();
  }

  _attachEvents() {
    const root = this.shadowRoot;

    // Global Mode Select
    const selMode = root.getElementById('selGlobalMode');
    if (selMode) {
      selMode.onchange = () => this._setMode(selMode.value);
    }

    // Evaluate Button
    const btnEval = root.getElementById('btnEvaluate');
    if (btnEval) {
      btnEval.onclick = () => this._evaluate();
    }

    // Default themes change
    ['selDefDay', 'selDefNight', 'selDefMobDay', 'selDefMobNight'].forEach(id => {
      const el = root.getElementById(id);
      if (el) {
        el.onchange = () => {
          this._saveConfig({
            default_theme_day: root.getElementById('selDefDay')?.value,
            default_theme_night: root.getElementById('selDefNight')?.value,
            default_theme_mobile_day: root.getElementById('selDefMobDay')?.value,
            default_theme_mobile_night: root.getElementById('selDefMobNight')?.value,
          });
        };
      }
    });

    // Toggles for glassmorphism, transition, sidebar
    const chkGlass = root.getElementById('chkGlassmorphism');
    if (chkGlass) {
      chkGlass.onchange = () => this._saveConfig({ glassmorphism_enabled: chkGlass.checked });
    }
    const chkTrans = root.getElementById('chkTransition');
    if (chkTrans) {
      chkTrans.onchange = () => this._saveConfig({ transition_enabled: chkTrans.checked });
    }
    const numDur = root.getElementById('numTransitionDuration');
    if (numDur) {
      numDur.onchange = () => this._saveConfig({ transition_duration: parseInt(numDur.value) || 800 });
    }
    const chkSb = root.getElementById('chkShowSidebar');
    if (chkSb) {
      chkSb.onchange = () => this._saveConfig({ show_sidebar: chkSb.checked });
    }

    // Rules enable/disable toggle
    root.querySelectorAll('.rule-toggle').forEach(chk => {
      chk.onchange = () => {
        const idx = parseInt(chk.getAttribute('data-idx'));
        const rList = [...(this._data.rules || [])];
        if (rList[idx]) {
          rList[idx].enabled = chk.checked;
          this._saveRules(rList);
        }
      };
    });

    // Delete rule button
    root.querySelectorAll('.btn-del-rule').forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.getAttribute('data-idx'));
        if (confirm('Möchtest du diese Regel wirklich löschen?')) {
          const rList = [...(this._data.rules || [])];
          rList.splice(idx, 1);
          this._saveRules(rList);
        }
      };
    });

    // Preview rule button
    root.querySelectorAll('.btn-preview-rule').forEach(btn => {
      btn.onclick = () => {
        const t = btn.getAttribute('data-theme');
        if (t) this._preview(t);
      };
    });

    // Open add modal
    const btnAdd = root.getElementById('btnAddRule');
    if (btnAdd) {
      btnAdd.onclick = () => {
        this._showAddModal = true;
        this._render();
      };
    }

    // Modal events
    if (this._showAddModal) {
      const cancelBtn = root.getElementById('btnCancelModal');
      if (cancelBtn) {
        cancelBtn.onclick = () => {
          this._showAddModal = false;
          this._render();
        };
      }
      const overlay = root.getElementById('modalOverlay');
      if (overlay) {
        overlay.onclick = (e) => {
          if (e.target.id === 'modalOverlay') {
            this._showAddModal = false;
            this._render();
          }
        };
      }
      const saveRuleBtn = root.getElementById('btnSaveRuleModal');
      if (saveRuleBtn) {
        saveRuleBtn.onclick = () => {
          const name = root.getElementById('mRuleName')?.value || 'Neue Regel';
          const priority = parseInt(root.getElementById('mRulePrio')?.value || 50);
          const cType = root.getElementById('mCondType')?.value || 'weather';
          const cVal = root.getElementById('mCondVal')?.value || '';
          const themeDay = root.getElementById('mThemeDay')?.value || 'Vision Glass Light';
          const themeNight = root.getElementById('mThemeNight')?.value || 'Vision Glass Dark';
          const mobDay = root.getElementById('mMobThemeDay')?.value || null;
          const mobNight = root.getElementById('mMobThemeNight')?.value || null;

          const cond = { type: cType };
          if (cType === 'weather') cond.states = cVal;
          else if (cType === 'season') cond.season = cVal;
          else if (cType === 'time') {
            const parts = cVal.split('-');
            cond.after = parts[0]?.trim() || '20:00';
            cond.before = parts[1]?.trim() || '06:00';
          } else if (cType === 'date_range') {
            const parts = cVal.split('-');
            cond.start_date = parts[0]?.trim() || '12-24';
            cond.end_date = parts[1]?.trim() || '12-26';
          } else if (cType === 'sun') {
            cond.state = cVal || 'below_horizon';
          } else if (cType === 'entity_state') {
            const parts = cVal.split('=');
            cond.entity_id = parts[0]?.trim();
            cond.state = parts[1]?.trim();
          }

          const newRule = {
            id: 'rule_' + Date.now(),
            name,
            priority,
            enabled: true,
            theme_day: themeDay,
            theme_night: themeNight,
            conditions: [cond]
          };
          if (mobDay) newRule.theme_mobile_day = mobDay;
          if (mobNight) newRule.theme_mobile_night = mobNight;

          const rList = [...(this._data.rules || []), newRule];
          this._showAddModal = false;
          this._saveRules(rList);
        };
      }
    }
  }
}

if (!customElements.get('theme-switch-engine-panel')) {
  customElements.define('theme-switch-engine-panel', ThemeSwitchEnginePanel);
}
