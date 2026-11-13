/**
 * Theme Switch Engine: Universal Client Helper (v1.4.0)
 * - Real-time theme synchronization across all HA pages & dashboards
 * - Fullscreen Canvas Effects Engine (Snow, Rain, Aurora, Fog, Fireworks, Falling Leaves, Custom JS)
 * - Sound Engine with Media folder integration & autoplay resilience
 * - Hardware-accelerated smooth live transitions
 * - Support for Home Assistant Default theme restoration
 */
(function() {
  'use strict';
  if (window.__themeSwitchEngineLoaded) return;
  window.__themeSwitchEngineLoaded = true;

  const TRANSITION_STYLE_ID = 'tse-live-transition';
  const FX_CANVAS_ID = 'tse-fx-canvas';

  // Cleanup legacy DOM artifacts if present
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
    if (lower === 'default' || lower === 'home assistant') {
      const v = String(attrs?.variant || attrs?.day_night_variant || '').toLowerCase();
      if (v === 'light') return false;
      if (v === 'dark') return true;
      const mode = String(attrs?.mode || '').toLowerCase();
      if (mode === 'force light' || mode === 'force day') return false;
      if (mode === 'force dark' || mode === 'force night') return true;
      return undefined;
    }
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

  // =========================================================================
  // CUSTOM FX PLUGIN REGISTRY (window.ThemeEngineFX)
  // =========================================================================
  window.ThemeEngineFX = window.ThemeEngineFX || {
    _effects: {},
    register(id, def) {
      if (!id || typeof def !== 'object') return;
      this._effects[id] = def;
      try {
        window.dispatchEvent(new CustomEvent('tse-fx-registered', { detail: { id, name: def.name || id } }));
      } catch (e) {}
    },
    get(id) {
      return this._effects[id];
    },
    list() {
      return Object.keys(this._effects).map(id => ({ id, name: this._effects[id].name || id }));
    }
  };

  // Auto-load external custom effects script if placed by user in /local/theme_effects/index.js
  try {
    const customScript = document.createElement('script');
    customScript.src = '/local/theme_effects/index.js?v=' + Date.now();
    customScript.async = true;
    customScript.onerror = () => customScript.remove();
    document.head.appendChild(customScript);
  } catch (e) {}

  // =========================================================================
  // CANVAS VISUAL EFFECTS ENGINE
  // =========================================================================
  class CanvasFXEngine {
    constructor() {
      this.canvas = null;
      this.ctx = null;
      this.rafId = null;
      this.currentEffect = null;
      this.currentMode = 'loop_endless';
      this.cycleLimit = 3;
      this.cycleCount = 0;
      this.startTime = 0;
      this.lastFrameTime = 0;
      this.state = null;
      this.fadeOutStart = 0;
      this.fadeDuration = 1200;
      this._boundResize = this._onResize.bind(this);
    }

    _getOrCreateCanvas() {
      if (this.canvas && document.body.contains(this.canvas)) return this.canvas;
      let el = document.getElementById(FX_CANVAS_ID);
      if (!el) {
        el = document.createElement('canvas');
        el.id = FX_CANVAS_ID;
        el.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:999999;';
        document.body.appendChild(el);
      }
      this.canvas = el;
      this.ctx = el.getContext('2d', { alpha: true });
      this._onResize();
      window.removeEventListener('resize', this._boundResize);
      window.addEventListener('resize', this._boundResize);
      return this.canvas;
    }

    _onResize() {
      if (!this.canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = Math.floor(window.innerWidth * dpr);
      this.canvas.height = Math.floor(window.innerHeight * dpr);
      if (this.ctx) {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(dpr, dpr);
      }
    }

    setEffect(effectId, mode = 'loop_endless', cycles = 3) {
      if (!effectId || effectId === 'none') {
        this.stop();
        return;
      }
      if (this.currentEffect === effectId && this.currentMode === mode && this.cycleLimit === cycles && this.rafId) {
        return; // Already running exact configuration
      }

      this.stop();
      this.currentEffect = effectId;
      this.currentMode = mode;
      this.cycleLimit = Math.max(1, parseInt(cycles, 10) || 3);
      this.cycleCount = 0;
      this.fadeOutStart = 0;
      this._getOrCreateCanvas();

      this._initEffect(effectId);
      this.startTime = performance.now();
      this.lastFrameTime = this.startTime;
      this._loop(this.startTime);
    }

    stop() {
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
      if (this.ctx && this.canvas) {
        this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      }
      if (this.canvas) {
        this.canvas.remove();
        this.canvas = null;
        this.ctx = null;
      }
      window.removeEventListener('resize', this._boundResize);
      this.currentEffect = null;
      this.state = null;
    }

    _initEffect(id) {
      const w = window.innerWidth;
      const h = window.innerHeight;

      // 1. Snow
      if (id === 'snow') {
        const count = Math.min(130, Math.floor(w / 12));
        const flakes = [];
        for (let i = 0; i < count; i++) {
          flakes.push({
            x: Math.random() * w,
            y: Math.random() * h,
            r: Math.random() * 2.8 + 1.2,
            speedY: Math.random() * 1.5 + 0.6,
            drift: (Math.random() - 0.5) * 0.8,
            angle: Math.random() * Math.PI * 2,
            swaySpeed: Math.random() * 0.02 + 0.01,
            opacity: Math.random() * 0.5 + 0.4
          });
        }
        this.state = { flakes };
      }
      // 2. Rain
      else if (id === 'rain') {
        const count = Math.min(160, Math.floor(w / 9));
        const drops = [];
        for (let i = 0; i < count; i++) {
          drops.push({
            x: Math.random() * (w + 200) - 100,
            y: Math.random() * h,
            len: Math.random() * 14 + 14,
            speed: Math.random() * 8 + 16,
            thickness: Math.random() * 0.8 + 1.0,
            opacity: Math.random() * 0.35 + 0.25
          });
        }
        this.state = { drops, splashes: [] };
      }
      // 3. Aurora Borealis
      else if (id === 'aurora') {
        this.state = { time: 0 };
      }
      // 4. Fog
      else if (id === 'fog') {
        const puffs = [];
        const count = 18;
        for (let i = 0; i < count; i++) {
          puffs.push({
            x: Math.random() * (w + 400) - 200,
            y: Math.random() * h,
            r: Math.random() * 220 + 160,
            speedX: Math.random() * 0.35 + 0.15,
            opacity: Math.random() * 0.07 + 0.04,
            pulse: Math.random() * Math.PI * 2
          });
        }
        this.state = { puffs };
      }
      // 5. Fireworks
      else if (id === 'fireworks') {
        this.state = {
          rockets: [],
          particles: [],
          nextLaunch: 0,
          burstsCount: 0
        };
      }
      // 6. Falling Leaves
      else if (id === 'leaves') {
        const count = Math.min(45, Math.floor(w / 35));
        const colors = ['#ea580c', '#f59e0b', '#dc2626', '#b45309', '#d97706'];
        const leaves = [];
        for (let i = 0; i < count; i++) {
          leaves.push({
            x: Math.random() * w,
            y: Math.random() * h,
            size: Math.random() * 12 + 12,
            speedY: Math.random() * 1.2 + 0.8,
            speedX: (Math.random() - 0.5) * 0.6,
            angle: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.04,
            color: colors[Math.floor(Math.random() * colors.length)],
            sway: Math.random() * Math.PI * 2,
            swaySpeed: Math.random() * 0.025 + 0.015,
            flip: Math.random() * Math.PI,
            flipSpeed: Math.random() * 0.03 + 0.02
          });
        }
        this.state = { leaves };
      }
      // Custom user plugin effect
      else {
        const customDef = window.ThemeEngineFX.get(id);
        if (customDef && typeof customDef.init === 'function') {
          this.state = customDef.init(this.canvas, w, h);
        } else {
          this.state = {};
        }
      }
    }

    _loop(now) {
      if (!this.currentEffect || !this.ctx) return;
      const dt = Math.min(100, now - this.lastFrameTime) / 1000;
      this.lastFrameTime = now;
      const w = window.innerWidth;
      const h = window.innerHeight;

      // Handle Repeat Modes & Cycle Duration (15 seconds per cycle for continuous effects)
      const elapsed = (now - this.startTime) / 1000;
      const cycleDuration = 15;
      const targetDuration = this.currentMode === 'once' ? cycleDuration : (this.currentMode === 'loop_count' ? cycleDuration * this.cycleLimit : Infinity);

      let alphaMult = 1.0;
      if (this.currentMode !== 'loop_endless') {
        const remaining = targetDuration - elapsed;
        if (remaining <= 0) {
          this.stop();
          return;
        }
        if (remaining < 1.5) {
          alphaMult = Math.max(0, remaining / 1.5);
        }
      }

      this.ctx.clearRect(0, 0, w, h);
      this.ctx.save();
      this.ctx.globalAlpha = alphaMult;

      const id = this.currentEffect;

      // 1. Render Snow
      if (id === 'snow' && this.state?.flakes) {
        this.ctx.fillStyle = '#ffffff';
        this.state.flakes.forEach(f => {
          f.y += f.speedY;
          f.angle += f.swaySpeed;
          f.x += Math.sin(f.angle) * 0.8 + f.drift;

          if (f.y > h + 10) { f.y = -10; f.x = Math.random() * w; }
          if (f.x > w + 10) f.x = -10;
          if (f.x < -10) f.x = w + 10;

          this.ctx.beginPath();
          this.ctx.globalAlpha = f.opacity * alphaMult;
          this.ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
          this.ctx.fill();
        });
      }
      // 2. Render Rain
      else if (id === 'rain' && this.state?.drops) {
        this.ctx.strokeStyle = 'rgba(186, 230, 253, 0.65)';
        this.ctx.lineWidth = 1.2;
        this.ctx.beginPath();
        this.state.drops.forEach(d => {
          d.y += d.speed;
          d.x += 2.5; // slight wind slant
          if (d.y > h) {
            d.y = -d.len;
            d.x = Math.random() * (w + 200) - 100;
            // Spawn small splash
            if (this.state.splashes.length < 30) {
              this.state.splashes.push({ x: d.x, y: h - 2, vx: (Math.random() - 0.5) * 3, vy: -Math.random() * 3 - 1, life: 1 });
            }
          }
          this.ctx.moveTo(d.x, d.y);
          this.ctx.lineTo(d.x - 4, d.y - d.len);
        });
        this.ctx.stroke();

        // Render Splashes
        if (this.state.splashes.length > 0) {
          this.ctx.fillStyle = 'rgba(224, 242, 254, 0.7)';
          for (let i = this.state.splashes.length - 1; i >= 0; i--) {
            const sp = this.state.splashes[i];
            sp.x += sp.vx;
            sp.y += sp.vy;
            sp.vy += 0.2; // gravity
            sp.life -= 0.05;
            if (sp.life <= 0) {
              this.state.splashes.splice(i, 1);
            } else {
              this.ctx.beginPath();
              this.ctx.arc(sp.x, sp.y, 1.2, 0, Math.PI * 2);
              this.ctx.fill();
            }
          }
        }
      }
      // 3. Render Aurora Borealis
      else if (id === 'aurora') {
        this.state.time += dt * 0.8;
        const t = this.state.time;
        const ribbons = [
          { color: 'rgba(16, 185, 129, 0.22)', freq: 0.003, speed: 0.6, yBase: h * 0.18, amp: 55 },
          { color: 'rgba(6, 182, 212, 0.18)', freq: 0.004, speed: 0.9, yBase: h * 0.24, amp: 70 },
          { color: 'rgba(168, 85, 247, 0.16)', freq: 0.0035, speed: 0.7, yBase: h * 0.12, amp: 45 }
        ];

        this.ctx.globalCompositeOperation = 'lighter';
        ribbons.forEach(rib => {
          this.ctx.beginPath();
          this.ctx.moveTo(0, 0);
          for (let x = 0; x <= w; x += 25) {
            const wave = Math.sin(x * rib.freq + t * rib.speed) * rib.amp +
                         Math.cos(x * rib.freq * 0.5 - t * 0.4) * (rib.amp * 0.5);
            this.ctx.lineTo(x, rib.yBase + wave);
          }
          this.ctx.lineTo(w, 0);
          this.ctx.closePath();

          const grad = this.ctx.createLinearGradient(0, 0, 0, h * 0.45);
          grad.addColorStop(0, 'rgba(0,0,0,0)');
          grad.addColorStop(0.5, rib.color);
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          this.ctx.fillStyle = grad;
          this.ctx.fill();
        });
      }
      // 4. Render Fog
      else if (id === 'fog' && this.state?.puffs) {
        this.state.puffs.forEach(p => {
          p.x += p.speedX;
          p.pulse += 0.01;
          if (p.x - p.r > w) p.x = -p.r;

          const currentAlpha = (p.opacity + Math.sin(p.pulse) * 0.02) * alphaMult;
          const grad = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
          grad.addColorStop(0, `rgba(226, 232, 240, ${currentAlpha})`);
          grad.addColorStop(0.7, `rgba(203, 213, 225, ${currentAlpha * 0.4})`);
          grad.addColorStop(1, 'rgba(203, 213, 225, 0)');

          this.ctx.fillStyle = grad;
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          this.ctx.fill();
        });
      }
      // 5. Render Fireworks
      else if (id === 'fireworks' && this.state) {
        const s = this.state;
        if (now > s.nextLaunch) {
          s.nextLaunch = now + Math.random() * 800 + 400;
          s.rockets.push({
            x: Math.random() * (w * 0.8) + (w * 0.1),
            y: h,
            targetY: Math.random() * (h * 0.45) + (h * 0.15),
            vx: (Math.random() - 0.5) * 2,
            vy: -Math.random() * 4 - 11,
            color: ['#fbbf24', '#22d3ee', '#f43f5e', '#a3e635', '#c084fc', '#fb923c'][Math.floor(Math.random() * 6)]
          });
          s.burstsCount++;
          if (this.currentMode !== 'loop_endless') {
            const burstLimit = (this.currentMode === 'once' ? 5 : this.cycleLimit * 5);
            if (s.burstsCount >= burstLimit && s.rockets.length === 0 && s.particles.length === 0) {
              this.stop();
              return;
            }
          }
        }

        // Update Rockets
        for (let i = s.rockets.length - 1; i >= 0; i--) {
          const r = s.rockets[i];
          r.x += r.vx;
          r.y += r.vy;
          r.vy += 0.08;

          this.ctx.fillStyle = r.color;
          this.ctx.beginPath();
          this.ctx.arc(r.x, r.y, 2.5, 0, Math.PI * 2);
          this.ctx.fill();

          if (r.y <= r.targetY || r.vy >= 0) {
            // Burst into particles
            const particleCount = 70;
            for (let p = 0; p < particleCount; p++) {
              const angle = Math.random() * Math.PI * 2;
              const spd = Math.random() * 5 + 1.5;
              s.particles.push({
                x: r.x,
                y: r.y,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd,
                color: r.color,
                alpha: 1.0,
                decay: Math.random() * 0.02 + 0.015
              });
            }
            s.rockets.splice(i, 1);
          }
        }

        // Update Particles
        this.ctx.globalCompositeOperation = 'lighter';
        for (let i = s.particles.length - 1; i >= 0; i--) {
          const p = s.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.08; // gravity
          p.vx *= 0.98; // friction
          p.vy *= 0.98;
          p.alpha -= p.decay;

          if (p.alpha <= 0) {
            s.particles.splice(i, 1);
          } else {
            this.ctx.save();
            this.ctx.globalAlpha = p.alpha * alphaMult;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
          }
        }
      }
      // 6. Render Falling Leaves
      else if (id === 'leaves' && this.state?.leaves) {
        this.state.leaves.forEach(leaf => {
          leaf.y += leaf.speedY;
          leaf.sway += leaf.swaySpeed;
          leaf.x += Math.sin(leaf.sway) * 1.5 + leaf.speedX;
          leaf.angle += leaf.rotSpeed;
          leaf.flip += leaf.flipSpeed;

          if (leaf.y > h + 20) {
            leaf.y = -20;
            leaf.x = Math.random() * w;
          }

          this.ctx.save();
          this.ctx.translate(leaf.x, leaf.y);
          this.ctx.rotate(leaf.angle);
          this.ctx.scale(Math.cos(leaf.flip), 1);
          this.ctx.fillStyle = leaf.color;
          this.ctx.globalAlpha = 0.85 * alphaMult;

          // Draw stylized teardrop autumn leaf
          this.ctx.beginPath();
          this.ctx.moveTo(0, -leaf.size);
          this.ctx.quadraticCurveTo(leaf.size * 0.8, -leaf.size * 0.3, 0, leaf.size);
          this.ctx.quadraticCurveTo(-leaf.size * 0.8, -leaf.size * 0.3, 0, -leaf.size);
          this.ctx.fill();

          // Leaf vein
          this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
          this.ctx.lineWidth = 1;
          this.ctx.beginPath();
          this.ctx.moveTo(0, -leaf.size * 0.8);
          this.ctx.lineTo(0, leaf.size * 0.8);
          this.ctx.stroke();

          this.ctx.restore();
        });
      }
      // Custom user effect
      else {
        const customDef = window.ThemeEngineFX.get(id);
        if (customDef && typeof customDef.update === 'function') {
          const keepGoing = customDef.update(this.ctx, w, h, dt, this.state);
          if (keepGoing === false && this.currentMode !== 'loop_endless') {
            this.stop();
            return;
          }
        }
      }

      this.ctx.restore();
      this.rafId = requestAnimationFrame(this._loop.bind(this));
    }
  }

  // =========================================================================
  // AUDIO SOUND PLAYER ENGINE
  // =========================================================================
  class SoundPlayerEngine {
    constructor() {
      this.audio = null;
      this.currentUrl = null;
      this.currentMode = 'play_once';
      this.loopsLeft = 0;
      this.fadeInterval = null;
    }

    _resolveSoundUrl(soundFile, subfolder) {
      if (!soundFile || soundFile === 'none') return null;
      if (soundFile.startsWith('http://') || soundFile.startsWith('https://') || soundFile.startsWith('/')) {
        return soundFile;
      }
      const folder = (subfolder || 'theme_sounds').replace(/^\/+|\/+$/g, '');
      return `/api/media_source/local_source/${folder}/${soundFile}`;
    }

    playSound(soundFile, mode = 'play_once', loops = 3, volume = 50, subfolder = 'theme_sounds') {
      const url = this._resolveSoundUrl(soundFile, subfolder);
      if (!url) {
        this.stop();
        return;
      }

      if (this.currentUrl === url && this.audio && !this.audio.paused) {
        return; // Already playing this sound
      }

      this.stop();
      this.currentUrl = url;
      this.currentMode = mode;
      const targetVolume = Math.max(0, Math.min(1, (volume ?? 50) / 100));

      const audio = new Audio(url);
      audio.volume = targetVolume;
      this.audio = audio;

      if (mode === 'loop_endless') {
        audio.loop = true;
      } else if (mode === 'loop_count') {
        audio.loop = false;
        this.loopsLeft = Math.max(1, parseInt(loops, 10) || 3);
        audio.addEventListener('ended', () => {
          this.loopsLeft--;
          if (this.loopsLeft > 0 && this.audio === audio) {
            audio.currentTime = 0;
            audio.play().catch(() => {});
          } else {
            this.stop();
          }
        });
      } else {
        // play_once
        audio.loop = false;
        audio.addEventListener('ended', () => {
          if (this.audio === audio) this.stop();
        });
      }

      // Handle browser autoplay policy
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          if (err.name === 'NotAllowedError') {
            const resumeOnInteraction = () => {
              if (this.audio === audio) {
                audio.play().catch(() => {});
              }
              window.removeEventListener('click', resumeOnInteraction);
              window.removeEventListener('keydown', resumeOnInteraction);
              window.removeEventListener('touchstart', resumeOnInteraction);
            };
            window.addEventListener('click', resumeOnInteraction, { once: true });
            window.addEventListener('keydown', resumeOnInteraction, { once: true });
            window.addEventListener('touchstart', resumeOnInteraction, { once: true });
          }
        });
      }
    }

    stop() {
      if (this.fadeInterval) {
        clearInterval(this.fadeInterval);
        this.fadeInterval = null;
      }
      if (this.audio) {
        const a = this.audio;
        this.audio = null;
        this.currentUrl = null;
        // Smooth 300ms volume ramp down
        let v = a.volume;
        this.fadeInterval = setInterval(() => {
          v = Math.max(0, v - 0.15);
          try { a.volume = v; } catch (e) {}
          if (v <= 0) {
            clearInterval(this.fadeInterval);
            this.fadeInterval = null;
            try { a.pause(); a.currentTime = 0; } catch (e) {}
          }
        }, 50);
      }
    }
  }

  const fxEngine = new CanvasFXEngine();
  const soundEngine = new SoundPlayerEngine();

  // =========================================================================
  // THEME SYNCHRONIZATION
  // =========================================================================
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

    // Apply Canvas Visual Effect & Audio Sound
    const effect = attrs.effect;
    const effectMode = attrs.effect_mode || 'loop_endless';
    const effectCycles = attrs.effect_cycles || 3;
    fxEngine.setEffect(effect, effectMode, effectCycles);

    const soundFile = attrs.sound_file;
    const soundMode = attrs.sound_mode || 'play_once';
    const soundLoops = attrs.sound_loops || 3;
    const soundVolume = attrs.sound_volume ?? 50;
    const mediaSubfolder = attrs.media_subfolder || 'theme_sounds';
    soundEngine.playSound(soundFile, soundMode, soundLoops, soundVolume, mediaSubfolder);

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
          const currentKey = `${st.state}:${st.attributes?.theme_mobile}:${st.attributes?.mode}:${st.attributes?.effect}:${st.attributes?.sound_file}:${st.last_updated}`;
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
