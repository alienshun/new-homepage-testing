(function () {
  'use strict';

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

  function revealCoverWhenPainted(coverEl) {
    if (!coverEl) return;

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        window.setTimeout(() => {
          coverEl.classList.add('background-ready');
        }, 260);
      });
    });
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

    if (baseLayer && revealLayer) {
      baseLayer.style.backgroundImage = `url('${coverUrl}')`;
      revealLayer.style.backgroundImage = `url('${coverUrl}')`;

      const img = new Image();

      try {
        img.decoding = 'async';
      } catch (e) {}

      img.onload = () => {
        revealCoverWhenPainted(coverEl);
      };

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

    const config = getCoverResourceConfig();
    const url = config.coverDir + chosenCoverFile;
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
    if (!arrow || arrow.dataset.contrastResizeBound === '1') return;

    arrow.dataset.contrastResizeBound = '1';

    let raf = 0;

    window.addEventListener('resize', () => {
      if (raf) cancelAnimationFrame(raf);

      raf = requestAnimationFrame(() => {
        raf = 0;

        const file = arrow.dataset.coverFile;
        if (file) applyArrowAdaptiveContrast(file);
      });
    }, { passive: true });
  }

  function init(coverEl) {
    const chosen = setRandomCoverBackground(coverEl);

    applyArrowAdaptiveContrast(chosen);
    setupArrowContrastResizeWatcher();

    return chosen;
  }

  window.CoverBackground = {
    init,
    getCoverResourceConfig,
    chooseCoverFile,
    setRandomCoverBackground,
    applyArrowAdaptiveContrast,
    setupArrowContrastResizeWatcher,
    sampleBottomCenterLuminance,
    applyArrowContrastFromLuma
  };
})();
