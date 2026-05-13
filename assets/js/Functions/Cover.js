(function () {
  function getRandomSlogan() {
    const slogans = [
      'Alone I stand, yet never alone I think.',
      'I walk slowly, for I am going far.',
      'Stars whisper to the silent; oceans answer the patient; time reveals to the steadfast.',
      'Dawn belongs to the vigilant; dusk speaks to the patient; night reveals to the solitary.',
      'Mountains keep secrets for the observant; rivers guide the patient; eternity belongs to the resolute.',
      'The wind speaks only to those who listen; the night unveils only to those who endure.',
      'Each small step is steady, for the journey is infinite.',
      'I walk alone, for companions are fleeting; I walk slowly, for time is eternal; I walk onward, for destiny awaits.'
    ];
    return slogans[Math.floor(Math.random() * slogans.length)];
  }

  function getCoverResourceConfig() {
    const resources = window.SiteResources || {};
    const images = resources.images || {};

    return {
      coverDir: images.coverDir || './assets/images/cover/',
      coverFiles: Array.isArray(images.coverFiles) ? images.coverFiles : []
    };
  }

  function chooseCoverFile() {
    const earlyBoot = window.SiteEarlyBoot;

    if (earlyBoot && typeof earlyBoot.getSelectedCoverFile === 'function') {
      const selected = earlyBoot.getSelectedCoverFile();
      if (selected) return selected;
    }

    const config = getCoverResourceConfig();
    const covers = config.coverFiles;

    if (!covers.length) return null;

    return covers[Math.floor(Math.random() * covers.length)];
  }

  function setRandomCoverBackground(coverEl) {
    if (!coverEl) return null;

    const config = getCoverResourceConfig();
    const chosen = chooseCoverFile();

    if (!chosen) return null;

    const coverUrl = config.coverDir + chosen;
    const baseLayer = coverEl.querySelector('.cover-bg-base');
    const revealLayer = coverEl.querySelector('.cover-bg-reveal');

    coverEl.classList.remove('background-ready');

    function revealCoverWhenPainted() {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          window.setTimeout(() => {
            coverEl.classList.add('background-ready');
          }, 260);
        });
      });
    }

    if (baseLayer && revealLayer) {
      baseLayer.style.backgroundImage = `url('${coverUrl}')`;
      revealLayer.style.backgroundImage = `url('${coverUrl}')`;

      const img = new Image();

      try {
        img.decoding = 'async';
      } catch (e) {}

      img.onload = revealCoverWhenPainted;

      img.onerror = () => {
        coverEl.classList.add('background-ready');
      };

      img.src = coverUrl;
    } else {
      coverEl.style.backgroundImage = `url('${coverUrl}')`;
      coverEl.style.backgroundRepeat = 'no-repeat';
      coverEl.style.backgroundPosition = 'center center';
      coverEl.style.backgroundSize = 'cover';
      coverEl.classList.add('background-ready');
    }

    coverEl.classList.add('visible');

    return chosen;
  }

  function clamp01(x) {
    return Math.max(0, Math.min(1, x));
  }

  function srgbToLinear(c) {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  }

  function rgbToLuminance(r, g, b) {
    const R = srgbToLinear(r);
    const G = srgbToLinear(g);
    const B = srgbToLinear(b);

    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
  }

  function sampleBottomCenterLuminance(img, samples) {
    const w = samples;
    const h = samples;

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return 0.5;

    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;

    const scale = Math.max(w / iw, h / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (w - dw) / 2;
    const dy = (h - dh) / 2;

    ctx.drawImage(img, dx, dy, dw, dh);

    const x0 = Math.floor(w * 0.30);
    const x1 = Math.floor(w * 0.70);
    const y0 = Math.floor(h * 0.62);
    const y1 = Math.floor(h * 0.95);

    const imgData = ctx.getImageData(0, 0, w, h).data;

    let sum = 0;
    let cnt = 0;

    for (let y = y0; y < y1; y += 1) {
      for (let x = x0; x < x1; x += 1) {
        const idx = (y * w + x) * 4;
        const r = imgData[idx];
        const g = imgData[idx + 1];
        const b = imgData[idx + 2];
        const a = imgData[idx + 3];

        if (a < 8) continue;

        sum += rgbToLuminance(r, g, b);
        cnt += 1;
      }
    }

    if (!cnt) return 0.5;

    return clamp01(sum / cnt);
  }

  function applyArrowContrastFromLuma(luma, arrowEl) {
    if (!arrowEl) return;

    const isBright = luma >= 0.62;

    if (isBright) {
      arrowEl.setAttribute('data-contrast', 'dark');
    } else {
      arrowEl.removeAttribute('data-contrast');
    }
  }

  function applyArrowAdaptiveContrast(chosenCoverFile) {
    const arrow = document.getElementById('cover-scroll');
    if (!arrow || !chosenCoverFile) return;

    const url = `./assets/images/cover/${chosenCoverFile}`;
    const img = new Image();

    img.onload = () => {
      const luma = sampleBottomCenterLuminance(img, 96);
      applyArrowContrastFromLuma(luma, arrow);

      arrow.dataset.coverLuma = String(luma);
      arrow.dataset.coverFile = chosenCoverFile;
    };

    img.onerror = () => {};

    img.src = url;
  }

  function setupArrowContrastResizeWatcher() {
    const arrow = document.getElementById('cover-scroll');
    if (!arrow) return;

    let raf = 0;

    window.addEventListener('resize', () => {
      if (raf) cancelAnimationFrame(raf);

      raf = requestAnimationFrame(() => {
        const file = arrow.dataset.coverFile;
        if (file) applyArrowAdaptiveContrast(file);
      });
    }, { passive: true });
  }

  function initCoverDepthMotion() {
    const cover = document.getElementById('cover');
    if (!cover) return;

    try {
      const reduceMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const coarsePointer = window.matchMedia &&
        window.matchMedia('(pointer: coarse)').matches;

      if (reduceMotion || coarsePointer) return;
    } catch (e) {}

    const avatarFrame = document.getElementById('avatar-frame');
    const avatarImg = avatarFrame ? avatarFrame.querySelector('img') : null;
    const name = document.getElementById('name');
    const slogan = document.getElementById('slogan');
    const entranceCue = document.getElementById('cover-scroll');

    const MOTION_SETTLE_DELAY = 520;

    let avatarLoadFinished = !avatarImg;
    let coverElementsReadyAt = 0;

    if (avatarImg) {
      if (avatarImg.complete) {
        avatarLoadFinished = true;
      } else {
        avatarImg.addEventListener('load', () => {
          avatarLoadFinished = true;
        }, { once: true, passive: true });

        avatarImg.addEventListener('error', () => {
          avatarLoadFinished = true;
        }, { once: true, passive: true });
      }
    }

    const FOLLOW_EASE = 0.12;
    const RETURN_EASE = 0.055;

    let currentEase = FOLLOW_EASE;

    const state = {
      bgX: 0,
      bgY: 0,
      fgX: 0,
      fgY: 0,
      cueX: 0,
      cueY: 0
    };

    const target = {
      bgX: 0,
      bgY: 0,
      fgX: 0,
      fgY: 0,
      cueX: 0,
      cueY: 0
    };

    let raf = 0;

    function coverStillVisible() {
      return cover.classList.contains('visible') &&
        !cover.classList.contains('hidden') &&
        !cover.classList.contains('leaving');
    }

    function coverElementsReady() {
      return cover.classList.contains('background-ready') &&
        (!avatarFrame || avatarFrame.classList.contains('visible')) &&
        (!name || name.classList.contains('visible')) &&
        (!slogan || slogan.classList.contains('visible')) &&
        (!entranceCue || entranceCue.classList.contains('visible')) &&
        avatarLoadFinished;
    }

    function coverMotionReady() {
      if (!coverStillVisible() || !coverElementsReady()) {
        coverElementsReadyAt = 0;
        return false;
      }

      if (!coverElementsReadyAt) {
        coverElementsReadyAt = performance.now();
        return false;
      }

      return performance.now() - coverElementsReadyAt >= MOTION_SETTLE_DELAY;
    }

    function isCoverActive() {
      return coverStillVisible() && coverMotionReady();
    }

    function setVars() {
      cover.style.setProperty('--cover-bg-x', `${state.bgX.toFixed(2)}px`);
      cover.style.setProperty('--cover-bg-y', `${state.bgY.toFixed(2)}px`);
      cover.style.setProperty('--cover-fg-x', `${state.fgX.toFixed(2)}px`);
      cover.style.setProperty('--cover-fg-y', `${state.fgY.toFixed(2)}px`);
      cover.style.setProperty('--cover-cue-x', `${state.cueX.toFixed(2)}px`);
      cover.style.setProperty('--cover-cue-y', `${state.cueY.toFixed(2)}px`);
    }

    function resetTargets() {
      currentEase = RETURN_EASE;

      target.bgX = 0;
      target.bgY = 0;
      target.fgX = 0;
      target.fgY = 0;
      target.cueX = 0;
      target.cueY = 0;

      startMotionLoop();
    }

    function startMotionLoop() {
      if (raf) return;

      function tick() {
        raf = 0;

        const ease = currentEase;

        state.bgX += (target.bgX - state.bgX) * ease;
        state.bgY += (target.bgY - state.bgY) * ease;
        state.fgX += (target.fgX - state.fgX) * ease;
        state.fgY += (target.fgY - state.fgY) * ease;
        state.cueX += (target.cueX - state.cueX) * ease;
        state.cueY += (target.cueY - state.cueY) * ease;

        setVars();

        const stillMoving =
          Math.abs(target.bgX - state.bgX) > 0.035 ||
          Math.abs(target.bgY - state.bgY) > 0.035 ||
          Math.abs(target.fgX - state.fgX) > 0.035 ||
          Math.abs(target.fgY - state.fgY) > 0.035 ||
          Math.abs(target.cueX - state.cueX) > 0.035 ||
          Math.abs(target.cueY - state.cueY) > 0.035;

        if (stillMoving) {
          raf = requestAnimationFrame(tick);
        }
      }

      raf = requestAnimationFrame(tick);
    }

    function shouldPauseDepthMotion(event) {
      const targetEl = event.target;

      if (!(targetEl instanceof Element)) return false;

      return Boolean(
        targetEl.closest('#avatar-frame') ||
        targetEl.closest('#cover-scroll')
      );
    }

    cover.addEventListener('pointermove', (event) => {
      if (!isCoverActive()) {
        resetTargets();
        return;
      }

      if (event.pointerType && event.pointerType !== 'mouse') return;

      if (shouldPauseDepthMotion(event)) {
        resetTargets();
        return;
      }

      const rect = cover.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const nx = clamp01((event.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = clamp01((event.clientY - rect.top) / rect.height) * 2 - 1;

      currentEase = FOLLOW_EASE;

      target.bgX = -nx * 5.8;
      target.bgY = -ny * 4.6;

      target.fgX = nx * 2.8;
      target.fgY = ny * 2.2;

      target.cueX = nx * 3.6;
      target.cueY = ny * 2.8;

      startMotionLoop();
    }, { passive: true });

    cover.addEventListener('pointerleave', resetTargets, { passive: true });
    window.addEventListener('blur', resetTargets);

    if (avatarFrame) {
      avatarFrame.addEventListener('pointerenter', resetTargets, { passive: true });
      avatarFrame.addEventListener('pointermove', resetTargets, { passive: true });
    }

    if (entranceCue) {
      entranceCue.addEventListener('pointerenter', resetTargets, { passive: true });
      entranceCue.addEventListener('pointermove', resetTargets, { passive: true });
    }

    const observer = new MutationObserver(() => {
      if (!coverStillVisible() || !coverElementsReady()) {
        coverElementsReadyAt = 0;
        resetTargets();
      }
    });

    observer.observe(cover, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  const mount = document.getElementById("mount-cover") || document.body;
  const slogan = getRandomSlogan();

  mount.insertAdjacentHTML(
    "beforeend",
    `
    <div id="cover">
      <div class="cover-bg cover-bg-base" aria-hidden="true"></div>
      <div class="cover-bg cover-bg-reveal" aria-hidden="true"></div>

      <div id="avatar-frame"
           data-cursor="precise_select"
           data-cursor-fallback="pointer">
        <img src="./assets/images/avatar.jpg" alt="Profile Avatar">
      </div>

      <div id="name">Stardust</div>
      <div id="slogan">${slogan}</div>

      <button id="cover-scroll"
              type="button"
              aria-label="Enter the site"
              title="Enter"
              data-cursor="precise_select"
              data-cursor-fallback="pointer">
        <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
          <path class="chev c1" d="M14 22 L32 40 L50 22" />
          <path class="chev c2" d="M18 30 L32 44 L46 30" />
          <path class="chev c3" d="M22 38 L32 48 L42 38" />
        </svg>
        <span class="cover-scroll-sub">Enter</span>
      </button>
    </div>
    `
  );

  const coverEl = document.getElementById('cover');
  const chosen = setRandomCoverBackground(coverEl);

  applyArrowAdaptiveContrast(chosen);
  setupArrowContrastResizeWatcher();

  initCoverDepthMotion();

  (function initCoverEnterHint() {
    const cover = document.getElementById('cover');
    const arrow = document.getElementById('cover-scroll');

    if (!cover || !arrow) return;

    const HINT_INTERVAL = 8000;
    const DESKTOP_PARTICLE_COUNT = 64;
    const MOBILE_PARTICLE_COUNT = 30;
    const TRACKING_RATIO = 0.30;
    const CURSOR_FADE_RADIUS = 46;

    let hintTimer = null;
    let raf = 0;
    let bounceTimer = null;
    let particles = [];

    const pointer = {
      x: window.innerWidth * 0.5,
      y: window.innerHeight * 0.52,
      known: false
    };

    function isCoarsePointer() {
      try {
        return window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
      } catch (e) {
        return false;
      }
    }

    const coarsePointer = isCoarsePointer();

    function isCoverHintReady() {
      return cover.classList.contains('visible') &&
        cover.classList.contains('background-ready') &&
        arrow.classList.contains('visible') &&
        !cover.classList.contains('hidden') &&
        !cover.classList.contains('leaving') &&
        cover.style.display !== 'none';
    }

    function randomBetween(min, max) {
      return min + Math.random() * (max - min);
    }

    function clearHintTimer() {
      if (!hintTimer) return;

      clearTimeout(hintTimer);
      hintTimer = null;
    }

    function clearBounce() {
      if (bounceTimer) {
        clearTimeout(bounceTimer);
        bounceTimer = null;
      }

      arrow.classList.remove('cover-hint-bounce');
    }

    function removeParticle(particle) {
      if (!particle || !particle.el) return;
      particle.el.remove();
    }

    function clearParticles() {
      particles.forEach(removeParticle);
      particles = [];

      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    }

    function stop() {
      clearHintTimer();
      clearBounce();
      clearParticles();
    }

    function scheduleNextHint() {
      clearHintTimer();

      if (!isCoverHintReady()) return;

      hintTimer = window.setTimeout(() => {
        hintTimer = null;

        if (!isCoverHintReady()) return;

        triggerHint();
        scheduleNextHint();
      }, HINT_INTERVAL);
    }

    function start() {
      stop();

      if (!isCoverHintReady()) return;

      scheduleNextHint();
    }

    function updatePointer(event) {
      if (event.pointerType && event.pointerType !== 'mouse') return;

      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.known = true;
    }

    function getArrowOrigin() {
      const rect = arrow.getBoundingClientRect();

      return {
        x: rect.left + rect.width * 0.5,
        y: rect.top + rect.height * 0.52
      };
    }

    function makeParticle(origin, trackCursor) {
      const el = document.createElement('span');
      el.className = trackCursor ? 'cover-hint-particle is-tracking' : 'cover-hint-particle';

      const angle = randomBetween(0, Math.PI * 2);
      const speed = trackCursor ? randomBetween(0.75, 1.55) : randomBetween(1.05, 2.85);
      const size = trackCursor ? randomBetween(2.0, 3.8) : randomBetween(1.4, 3.3);
      const spread = trackCursor ? randomBetween(4, 16) : randomBetween(0, 15);

      const particle = {
        el,
        x: origin.x + Math.cos(angle) * spread,
        y: origin.y + Math.sin(angle) * spread,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - randomBetween(0.15, 0.85),
        born: performance.now(),
        ttl: trackCursor ? randomBetween(2300, 3300) : randomBetween(950, 1750),
        trackCursor,
        fadeStart: 0,
        spin: randomBetween(-0.032, 0.032),
        rotate: randomBetween(0, Math.PI * 2),
        baseScale: randomBetween(0.82, 1.16)
      };

      el.style.setProperty('--particle-size', `${size.toFixed(2)}px`);
      el.style.setProperty('--particle-core', trackCursor ? '0.98' : randomBetween(0.72, 0.94).toFixed(2));

      cover.appendChild(el);

      return particle;
    }

    function spawnParticleBurst() {
      const origin = getArrowOrigin();
      const count = coarsePointer ? MOBILE_PARTICLE_COUNT : DESKTOP_PARTICLE_COUNT;

      for (let i = 0; i < count; i += 1) {
        const canTrack = !coarsePointer && pointer.known;
        const trackCursor = canTrack && Math.random() < TRACKING_RATIO;

        particles.push(makeParticle(origin, trackCursor));
      }

      startParticleLoop();
    }

    function startParticleLoop() {
      if (raf) return;
      raf = requestAnimationFrame(updateParticles);
    }

    function updateParticles(now) {
      raf = 0;

      if (!isCoverHintReady()) {
        clearParticles();
        return;
      }

      const nextParticles = [];

      particles.forEach((particle) => {
        const age = now - particle.born;
        let life = age / particle.ttl;

        if (particle.trackCursor && pointer.known && age > 120) {
          const dx = pointer.x - particle.x;
          const dy = pointer.y - particle.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;

          const attraction = dist < 180 ? 0.0032 : 0.0020;

          particle.vx += dx * attraction;
          particle.vy += dy * attraction;

          particle.vx *= 0.91;
          particle.vy *= 0.91;

          if (dist <= CURSOR_FADE_RADIUS && !particle.fadeStart) {
            particle.fadeStart = now;
          }
        } else {
          particle.vx *= 0.982;
          particle.vy *= 0.982;
          particle.vy += 0.006;
        }

        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.rotate += particle.spin;

        let opacity = 1 - life;

        if (particle.trackCursor && particle.fadeStart) {
          const fadeAge = now - particle.fadeStart;
          const fadeProgress = clamp01(fadeAge / 700);
          opacity *= (1 - fadeProgress);
          life = Math.max(life, fadeProgress);
        }

        if (life >= 1 || opacity <= 0.015) {
          removeParticle(particle);
          return;
        }

        const scale = particle.baseScale * (particle.trackCursor ? 1 - life * 0.42 : 1 - life * 0.68);
        const shimmer = 0.72 + Math.sin((age + particle.rotate * 1000) / 115) * 0.18;
        const finalOpacity = Math.max(0, opacity * shimmer);

        particle.el.style.opacity = finalOpacity.toFixed(3);
        particle.el.style.transform =
          `translate3d(${particle.x.toFixed(2)}px, ${particle.y.toFixed(2)}px, 0) ` +
          `rotate(${particle.rotate.toFixed(3)}rad) ` +
          `scale(${Math.max(0.18, scale).toFixed(3)})`;

        nextParticles.push(particle);
      });

      particles = nextParticles;

      if (particles.length) {
        raf = requestAnimationFrame(updateParticles);
      }
    }

    function triggerHint() {
      if (!isCoverHintReady()) return;

      clearBounce();

      void arrow.offsetWidth;

      arrow.classList.add('cover-hint-bounce');

      bounceTimer = window.setTimeout(() => {
        bounceTimer = null;
        arrow.classList.remove('cover-hint-bounce');
      }, 980);

      spawnParticleBurst();
    }

    window.addEventListener('pointermove', updatePointer, { passive: true });
    window.addEventListener('pagehide', stop);
    window.addEventListener('blur', stop);

    window.CoverEnterHint = {
      start,
      stop
    };
  })();
})();
