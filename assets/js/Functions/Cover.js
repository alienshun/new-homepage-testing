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

    function isCoverActive() {
      return cover.classList.contains('visible') &&
        !cover.classList.contains('hidden') &&
        !cover.classList.contains('leaving');
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

    const avatarFrame = document.getElementById('avatar-frame');
    const entranceCue = document.getElementById('cover-scroll');

    if (avatarFrame) {
      avatarFrame.addEventListener('pointerenter', resetTargets, { passive: true });
      avatarFrame.addEventListener('pointermove', resetTargets, { passive: true });
    }

    if (entranceCue) {
      entranceCue.addEventListener('pointerenter', resetTargets, { passive: true });
      entranceCue.addEventListener('pointermove', resetTargets, { passive: true });
    }

    const observer = new MutationObserver(() => {
      if (!isCoverActive()) resetTargets();
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

  (function initCoverArrowStardust() {
    const arrow = document.getElementById('cover-scroll');
    if (!arrow) return;

    try {
      const mq = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mq && mq.matches) return;
    } catch (e) {}

    let stardustTimer = null;

    function spawnStardust() {
      const dust = document.createElement('span');
      dust.className = 'cover-stardust';

      const x = (Math.random() - 0.5) * 24;
      const duration = 1200 + Math.random() * 800;

      dust.style.setProperty('--x', `${x}px`);
      dust.style.animationDuration = `${duration}ms`;

      arrow.appendChild(dust);

      dust.addEventListener('animationend', () => {
        dust.remove();
      });
    }

    function startStardust() {
      if (stardustTimer) return;
      stardustTimer = setInterval(spawnStardust, 140);
    }

    function stopStardust() {
      if (!stardustTimer) return;

      clearInterval(stardustTimer);
      stardustTimer = null;

      const dusts = arrow.querySelectorAll('.cover-stardust');
      dusts.forEach((d) => d.remove());
    }

    const observer = new MutationObserver(() => {
      if (arrow.classList.contains('visible')) startStardust();
      else stopStardust();
    });

    observer.observe(arrow, { attributes: true, attributeFilter: ['class'] });

    if (arrow.classList.contains('visible')) startStardust();
  })();
})();
