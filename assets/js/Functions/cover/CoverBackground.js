(function () {
  'use strict';

  const DEFAULT_COVER_VIDEO_DIR = './assets/animation/cover/';
  const DEFAULT_COVER_VIDEO_EXTENSION = '.mp4';

  const COVER_VIDEO_LOWEST_PRIORITY_OPTIONS = {
    waitForFonts: true,
    fontWaitTimeout: 3500,
    waitForPageWarmups: true,
    pageWarmupMaxWait: 28000,
    waitForResourceQuiet: true,
    resourceQuietWindow: 1800,
    resourceQuietMaxWait: 12000,
    idleTimeout: 6000
  };

  const COVER_VIDEO_RETURN_IDLE_TIMEOUT = 1600;
  const COVER_VIDEO_FIRST_FRAME_TIMEOUT = 900;

  function getCoverResourceConfig() {
    const resources = window.SiteResources || {};
    const images = resources.images || {};
    const coverVideo = resources.coverVideo || {};

    return {
      coverDir: images.coverDir || './assets/images/cover/',
      coverFiles: Array.isArray(images.coverFiles) ? images.coverFiles : [],

      coverVideoEnabled: coverVideo.enabled !== false,
      coverVideoDir: coverVideo.dir || DEFAULT_COVER_VIDEO_DIR,
      coverVideoExtension: coverVideo.extension || DEFAULT_COVER_VIDEO_EXTENSION
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

  function getCoverVideoFile(chosenCoverFile, config) {
    if (!chosenCoverFile) return null;

    const extension = config.coverVideoExtension || DEFAULT_COVER_VIDEO_EXTENSION;
    const base = String(chosenCoverFile).replace(/\.[^/.]+$/, '');

    return base + extension;
  }

  function canUseCoverVideo() {
    try {
      const reduceMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (reduceMotion) return false;
    } catch (e) {}

    try {
      const connection = navigator.connection ||
        navigator.mozConnection ||
        navigator.webkitConnection;

      if (connection && connection.saveData) return false;
    } catch (e) {}

    return true;
  }

  function getCoverVideoLayer(coverEl) {
    if (!coverEl) return null;

    let layer = coverEl.querySelector('.cover-video-layer');

    if (layer) return layer;

    layer = document.createElement('div');
    layer.className = 'cover-video-layer';
    layer.setAttribute('aria-hidden', 'true');

    const revealLayer = coverEl.querySelector('.cover-bg-reveal');

    if (revealLayer && revealLayer.parentNode) {
      revealLayer.parentNode.insertBefore(layer, revealLayer.nextSibling);
    } else {
      coverEl.insertBefore(layer, coverEl.firstChild);
    }

    return layer;
  }

  function clearCoverVideo(coverEl) {
    if (!coverEl) return;

    if (coverEl.__coverVideoVisibleObserver) {
      try {
        coverEl.__coverVideoVisibleObserver.disconnect();
      } catch (e) {}

      coverEl.__coverVideoVisibleObserver = null;
    }

    const layer = getCoverVideoLayer(coverEl);

    if (layer) {
      const videos = Array.from(layer.querySelectorAll('video'));

      videos.forEach((video) => {
        if (typeof video.__coverVideoCleanup === 'function') {
          video.__coverVideoCleanup();
        }

        if (video.__coverRevealObserver) {
          try {
            video.__coverRevealObserver.disconnect();
          } catch (e) {}

          video.__coverRevealObserver = null;
        }

        try {
          video.pause();
        } catch (e) {}

        video.removeAttribute('src');

        Array.from(video.querySelectorAll('source')).forEach((source) => {
          source.removeAttribute('src');
        });

        try {
          video.load();
        } catch (e) {}
      });

      layer.innerHTML = '';
    }

    coverEl.classList.remove('video-loading', 'video-ready', 'video-failed');

    delete coverEl.dataset.coverVideoFile;
    delete coverEl.dataset.coverVideoUrl;
    delete coverEl.dataset.coverVideoReady;
    delete coverEl.dataset.coverVideoFailed;
    delete coverEl.dataset.coverVideoScheduled;
    delete coverEl.dataset.coverVideoVisibleWatcher;
  }

  function coverIsVisibleForVideo(coverEl) {
    if (!coverEl || !coverEl.isConnected) return false;

    return (
      coverEl.classList.contains('visible') &&
      !coverEl.classList.contains('hidden') &&
      !coverEl.classList.contains('leaving') &&
      coverEl.style.display !== 'none'
    );
  }

  function runWhenIdle(callback, timeout) {
    if (typeof callback !== 'function') return;

    const loader = window.SiteResourceLoader;

    if (loader && typeof loader.idle === 'function') {
      loader.idle(callback, timeout || COVER_VIDEO_RETURN_IDLE_TIMEOUT);
      return;
    }

    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(callback, {
        timeout: timeout || COVER_VIDEO_RETURN_IDLE_TIMEOUT
      });
      return;
    }

    window.setTimeout(callback, Math.min(Number(timeout) || 900, 900));
  }

  function scheduleLowestPriorityCoverVideoTask(callback) {
    const loader = window.SiteResourceLoader;

    if (
      loader &&
      typeof loader.scheduleLowestPriorityTask === 'function'
    ) {
      return loader.scheduleLowestPriorityTask(
        callback,
        COVER_VIDEO_LOWEST_PRIORITY_OPTIONS
      );
    }

    return new Promise((resolve) => {
      runWhenIdle(() => {
        try {
          resolve(callback());
        } catch (err) {
          console.warn('[CoverBackground] Fallback cover video task failed:', err);
          resolve(null);
        }
      }, COVER_VIDEO_LOWEST_PRIORITY_OPTIONS.idleTimeout);
    });
  }

  function playCoverVideo(video, coverEl) {
    if (!video || !coverIsVisibleForVideo(coverEl)) return null;

    const playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {});
    }

    return playPromise || null;
  }

  function waitForFirstVideoFrame(video, timeout) {
    const waitTimeout = Math.max(0, Number(timeout) || COVER_VIDEO_FIRST_FRAME_TIMEOUT);

    return new Promise((resolve) => {
      let settled = false;
      let timer = null;

      function done() {
        if (settled) return;

        settled = true;

        if (timer) {
          window.clearTimeout(timer);
          timer = null;
        }

        resolve();
      }

      if (typeof video.requestVideoFrameCallback === 'function') {
        try {
          video.requestVideoFrameCallback(() => {
            done();
          });
        } catch (e) {
          window.setTimeout(done, 80);
        }
      } else {
        window.setTimeout(done, 80);
      }

      timer = window.setTimeout(done, waitTimeout);
    });
  }

  function bindVideoPlaybackToCover(video, coverEl) {
    if (!video || !coverEl || video.dataset.coverPlaybackBound === '1') return;

    video.dataset.coverPlaybackBound = '1';

    function syncPlayback() {
      if (
        coverIsVisibleForVideo(coverEl) &&
        coverEl.classList.contains('video-ready') &&
        document.visibilityState !== 'hidden'
      ) {
        playCoverVideo(video, coverEl);
      } else {
        try {
          video.pause();
        } catch (e) {}
      }
    }

    function handlePageHide() {
      try {
        video.pause();
      } catch (e) {}
    }

    const observer = new MutationObserver(syncPlayback);

    /*
      Only observe class changes.

      CoverDepthMotion writes CSS variables to cover.style on every pointer move.
      Observing "style" here would repeatedly trigger syncPlayback(), causing
      unnecessary video.play() calls and visible stutter while moving the mouse.
    */
    observer.observe(coverEl, {
      attributes: true,
      attributeFilter: ['class']
    });

    document.addEventListener('visibilitychange', syncPlayback);
    window.addEventListener('pagehide', handlePageHide);

    video.__coverVideoCleanup = function () {
      try {
        observer.disconnect();
      } catch (e) {}

      document.removeEventListener('visibilitychange', syncPlayback);
      window.removeEventListener('pagehide', handlePageHide);
      video.__coverVideoCleanup = null;
    };

    syncPlayback();
  }

  function revealVideoWhenVisible(video, coverEl) {
    if (!video || !coverEl) return;

    let preparing = false;

    function reveal() {
      if (video.dataset.coverVideoRevealed === '1') return false;
      if (preparing) return false;
      if (!video.isConnected) return false;
      if (!coverIsVisibleForVideo(coverEl)) return false;

      preparing = true;

      const playPromise = video.play();

      Promise.resolve(playPromise)
        .catch(() => {})
        .then(() => waitForFirstVideoFrame(video, COVER_VIDEO_FIRST_FRAME_TIMEOUT))
        .then(() => {
          preparing = false;

          if (video.dataset.coverVideoRevealed === '1') return;
          if (!video.isConnected) return;
          if (!coverIsVisibleForVideo(coverEl)) return;

          video.dataset.coverVideoRevealed = '1';

          coverEl.classList.remove('video-loading', 'video-failed');
          coverEl.classList.add('video-ready');
          coverEl.dataset.coverVideoReady = '1';

          bindVideoPlaybackToCover(video, coverEl);
          playCoverVideo(video, coverEl);
        })
        .catch(() => {
          preparing = false;
        });

      return true;
    }

    if (reveal()) return;

    const observer = new MutationObserver(() => {
      if (reveal()) {
        observer.disconnect();
        video.__coverRevealObserver = null;
      }
    });

    video.__coverRevealObserver = observer;

    observer.observe(coverEl, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  function startCoverVideoLoad(coverEl, chosenCoverFile, coverUrl) {
    if (!coverEl || !chosenCoverFile || !coverUrl) return;

    const config = getCoverResourceConfig();

    if (!config.coverVideoEnabled || !canUseCoverVideo()) return;

    const videoFile = getCoverVideoFile(chosenCoverFile, config);
    if (!videoFile) return;

    const videoUrl = config.coverVideoDir + videoFile;
    const currentUrl = coverEl.dataset.coverVideoUrl;

    if (
      currentUrl === videoUrl &&
      (
        coverEl.classList.contains('video-loading') ||
        coverEl.classList.contains('video-ready')
      )
    ) {
      return;
    }

    const layer = getCoverVideoLayer(coverEl);
    if (!layer) return;

    clearCoverVideo(coverEl);

    coverEl.dataset.coverVideoFile = videoFile;
    coverEl.dataset.coverVideoUrl = videoUrl;
    coverEl.classList.add('video-loading');

    const video = document.createElement('video');

    video.className = 'cover-video-media';
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.autoplay = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.poster = coverUrl;

    video.setAttribute('muted', '');
    video.setAttribute('loop', '');
    video.setAttribute('autoplay', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('aria-hidden', 'true');
    video.setAttribute('tabindex', '-1');
    video.setAttribute('fetchpriority', 'low');

    try {
      video.fetchPriority = 'low';
    } catch (e) {}

    const source = document.createElement('source');
    source.src = videoUrl;
    source.type = 'video/mp4';

    video.appendChild(source);

    let ready = false;

    function handleReady() {
      if (ready) return;

      ready = true;
      revealVideoWhenVisible(video, coverEl);
    }

    function handleError() {
      coverEl.classList.remove('video-loading', 'video-ready');
      coverEl.classList.add('video-failed');
      coverEl.dataset.coverVideoFailed = videoUrl;

      if (video.__coverRevealObserver) {
        try {
          video.__coverRevealObserver.disconnect();
        } catch (e) {}

        video.__coverRevealObserver = null;
      }

      if (typeof video.__coverVideoCleanup === 'function') {
        video.__coverVideoCleanup();
      }

      try {
        video.pause();
      } catch (e) {}

      if (video.parentNode) {
        video.parentNode.removeChild(video);
      }
    }

    video.addEventListener('loadeddata', handleReady, { once: true });
    video.addEventListener('canplay', handleReady, { once: true });
    video.addEventListener('error', handleError, { once: true });

    layer.appendChild(video);

    try {
      video.load();
    } catch (e) {}
  }

  function deferCoverVideoUntilVisible(coverEl, start) {
    if (!coverEl || typeof start !== 'function') return;

    if (coverEl.dataset.coverVideoVisibleWatcher === '1') return;

    coverEl.dataset.coverVideoVisibleWatcher = '1';

    const observer = new MutationObserver(() => {
      if (!coverIsVisibleForVideo(coverEl)) return;

      observer.disconnect();
      coverEl.__coverVideoVisibleObserver = null;
      delete coverEl.dataset.coverVideoVisibleWatcher;

      runWhenIdle(() => {
        if (coverIsVisibleForVideo(coverEl)) {
          start();
        }
      }, COVER_VIDEO_RETURN_IDLE_TIMEOUT);
    });

    coverEl.__coverVideoVisibleObserver = observer;

    observer.observe(coverEl, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  function scheduleCoverVideoLoad(coverEl, chosenCoverFile, coverUrl) {
    if (!coverEl || !chosenCoverFile || !coverUrl) return;

    const config = getCoverResourceConfig();

    if (!config.coverVideoEnabled || !canUseCoverVideo()) return;

    const videoFile = getCoverVideoFile(chosenCoverFile, config);
    if (!videoFile) return;

    const videoUrl = config.coverVideoDir + videoFile;
    const scheduleKey = chosenCoverFile + '|' + videoUrl;

    if (coverEl.dataset.coverVideoScheduled === scheduleKey) return;

    coverEl.dataset.coverVideoScheduled = scheduleKey;

    function start() {
      startCoverVideoLoad(coverEl, chosenCoverFile, coverUrl);
    }

    scheduleLowestPriorityCoverVideoTask(() => {
      if (!coverIsVisibleForVideo(coverEl)) {
        deferCoverVideoUntilVisible(coverEl, start);
        return null;
      }

      start();
      return null;
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
    clearCoverVideo(coverEl);

    if (baseLayer && revealLayer) {
      baseLayer.style.backgroundImage = `url('${coverUrl}')`;
      revealLayer.style.backgroundImage = `url('${coverUrl}')`;

      const img = new Image();

      try {
        img.decoding = 'async';
      } catch (e) {}

      img.onload = () => {
        revealCoverWhenPainted(coverEl);
        scheduleCoverVideoLoad(coverEl, chosen, coverUrl);
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

      scheduleCoverVideoLoad(coverEl, chosen, coverUrl);
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
    scheduleCoverVideoLoad,
    startCoverVideoLoad,
    applyArrowAdaptiveContrast,
    setupArrowContrastResizeWatcher,
    sampleBottomCenterLuminance,
    applyArrowContrastFromLuma
  };
})();
