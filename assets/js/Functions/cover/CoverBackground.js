(function () {
  'use strict';

  const DEFAULT_COVER_VIDEO_DIR = './assets/animation/cover/';
  const DEFAULT_COVER_VIDEO_EXTENSION = '.mp4';

  const COVER_VIDEO_PAGE_WARMUP_MAX_WAIT = 28000;
  const COVER_VIDEO_RESOURCE_QUIET_WINDOW = 1800;
  const COVER_VIDEO_RESOURCE_QUIET_MAX_WAIT = 12000;
  const COVER_VIDEO_IDLE_TIMEOUT = 6000;
  const COVER_VIDEO_RETURN_IDLE_TIMEOUT = 1600;

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

  function waitForWindowLoad() {
    if (document.readyState === 'complete') {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      window.addEventListener('load', resolve, { once: true });
    });
  }

  function waitForFontsReady(timeout) {
    if (!document.fonts || !document.fonts.ready) {
      return Promise.resolve();
    }

    const maxWait = Math.max(0, Number(timeout) || 3500);

    return Promise.race([
      document.fonts.ready.catch(() => {}),
      new Promise((resolve) => {
        window.setTimeout(resolve, maxWait);
      })
    ]).then(() => {});
  }

  function uniqueValidPages(list) {
    const pages = window.SiteResources && window.SiteResources.pages
      ? window.SiteResources.pages
      : {};

    const seen = Object.create(null);

    return (Array.isArray(list) ? list : [])
      .filter((page) => page && pages[page] && !seen[page])
      .map((page) => {
        seen[page] = true;
        return page;
      });
  }

  function getLowestPriorityWarmupPages() {
    const resources = window.SiteResources || {};
    const navigation = resources.navigation || {};
    const warmup = navigation.warmup || {};

    const list = [];

    if (navigation.defaultPage) {
      list.push(navigation.defaultPage);
    }

    if (Array.isArray(warmup.afterCover)) {
      list.push(...warmup.afterCover);
    }

    if (Array.isArray(warmup.afterFirstPage)) {
      list.push(...warmup.afterFirstPage);
    }

    if (!list.length) {
      list.push('resume', 'schedule', 'social', 'life');
    }

    return uniqueValidPages(list);
  }

  function warmupPagesAreSettled(pageKeys) {
    const loader = window.SiteResourceLoader;

    if (
      !loader ||
      typeof loader.isPageLoaded !== 'function' ||
      typeof loader.isPageLoading !== 'function'
    ) {
      return true;
    }

    return pageKeys.every((page) => {
      if (loader.isPageLoading(page)) return false;

      if (
        typeof loader.isPageWarmupLoading === 'function' &&
        loader.isPageWarmupLoading(page)
      ) {
        return false;
      }

      return loader.isPageLoaded(page);
    });
  }

  function waitForPageWarmups(maxWait) {
    const pageKeys = getLowestPriorityWarmupPages();

    if (!pageKeys.length) return Promise.resolve();

    const waitLimit = Math.max(0, Number(maxWait) || COVER_VIDEO_PAGE_WARMUP_MAX_WAIT);

    return new Promise((resolve) => {
      const startedAt = performance.now();
      let timer = null;

      function cleanup() {
        if (timer) {
          window.clearTimeout(timer);
          timer = null;
        }

        window.removeEventListener('site:pageassetsloaded', check);
        window.removeEventListener('site:pagewarmuploaded', check);
      }

      function done() {
        cleanup();
        resolve();
      }

      function check() {
        if (warmupPagesAreSettled(pageKeys)) {
          done();
          return;
        }

        if (performance.now() - startedAt >= waitLimit) {
          done();
          return;
        }

        timer = window.setTimeout(check, 520);
      }

      window.addEventListener('site:pageassetsloaded', check);
      window.addEventListener('site:pagewarmuploaded', check);

      check();
    });
  }

  function waitForResourceQuiet(quietWindow, maxWait) {
    const quietMs = Math.max(0, Number(quietWindow) || COVER_VIDEO_RESOURCE_QUIET_WINDOW);
    const maxMs = Math.max(quietMs, Number(maxWait) || COVER_VIDEO_RESOURCE_QUIET_MAX_WAIT);

    if (!quietMs) return Promise.resolve();

    if (typeof PerformanceObserver !== 'function') {
      return new Promise((resolve) => {
        window.setTimeout(resolve, quietMs);
      });
    }

    return new Promise((resolve) => {
      let quietTimer = null;
      let maxTimer = null;
      let observer = null;
      let settled = false;

      function cleanup() {
        if (quietTimer) {
          window.clearTimeout(quietTimer);
          quietTimer = null;
        }

        if (maxTimer) {
          window.clearTimeout(maxTimer);
          maxTimer = null;
        }

        if (observer) {
          try {
            observer.disconnect();
          } catch (e) {}

          observer = null;
        }
      }

      function done() {
        if (settled) return;

        settled = true;
        cleanup();
        resolve();
      }

      function markActivity() {
        if (settled) return;

        if (quietTimer) {
          window.clearTimeout(quietTimer);
        }

        quietTimer = window.setTimeout(done, quietMs);
      }

      try {
        observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();

          if (entries && entries.length) {
            markActivity();
          }
        });

        observer.observe({
          entryTypes: ['resource']
        });
      } catch (e) {
        observer = null;
      }

      markActivity();
      maxTimer = window.setTimeout(done, maxMs);
    });
  }

  function waitForIdle(timeout) {
    const waitTimeout = Math.max(0, Number(timeout) || COVER_VIDEO_IDLE_TIMEOUT);

    return new Promise((resolve) => {
      if (typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(resolve, {
          timeout: waitTimeout
        });
        return;
      }

      window.setTimeout(resolve, Math.min(waitTimeout, 900));
    });
  }

  async function waitForLowestPriorityWindow() {
    await waitForWindowLoad();
    await waitForFontsReady(3500);
    await waitForPageWarmups(COVER_VIDEO_PAGE_WARMUP_MAX_WAIT);
    await waitForResourceQuiet(
      COVER_VIDEO_RESOURCE_QUIET_WINDOW,
      COVER_VIDEO_RESOURCE_QUIET_MAX_WAIT
    );
    await waitForIdle(COVER_VIDEO_IDLE_TIMEOUT);
  }

  function playCoverVideo(video, coverEl) {
    if (!video || !coverIsVisibleForVideo(coverEl)) return;

    const playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {});
    }
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

    observer.observe(coverEl, {
      attributes: true,
      attributeFilter: ['class', 'style']
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

    function reveal() {
      if (video.dataset.coverVideoRevealed === '1') return false;
      if (!video.isConnected) return false;
      if (!coverIsVisibleForVideo(coverEl)) return false;

      video.dataset.coverVideoRevealed = '1';

      coverEl.classList.remove('video-loading', 'video-failed');
      coverEl.classList.add('video-ready');
      coverEl.dataset.coverVideoReady = '1';

      bindVideoPlaybackToCover(video, coverEl);
      playCoverVideo(video, coverEl);

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
      attributeFilter: ['class', 'style']
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
      delete coverEl.dataset.coverVideoVisibleWatcher;

      waitForIdle(COVER_VIDEO_RETURN_IDLE_TIMEOUT).then(() => {
        if (coverIsVisibleForVideo(coverEl)) {
          start();
        }
      });
    });

    observer.observe(coverEl, {
      attributes: true,
      attributeFilter: ['class', 'style']
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

    waitForLowestPriorityWindow().then(() => {
      if (!coverIsVisibleForVideo(coverEl)) {
        deferCoverVideoUntilVisible(coverEl, start);
        return;
      }

      start();
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
