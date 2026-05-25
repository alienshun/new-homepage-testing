(function () {
  'use strict';

  let pageConfigs = {};
  let loader = {};
  let warmupConfig = {};
  let defaultPage = 'resume';
  let getCurrentPage = function () {
    return null;
  };

  let afterCoverWarmupStarted = false;
  let afterFirstPageWarmupStarted = false;
  let lifeDisplayFontWarmupStarted = false;

  const intentWarmTimers = Object.create(null);

  function delay(ms) {
    return new Promise((resolve) => {
      window.setTimeout(resolve, Math.max(0, Number(ms) || 0));
    });
  }

  function validPages(list) {
    return (Array.isArray(list) ? list : [])
      .filter((page) => page && pageConfigs[page]);
  }

  function warmPage(page, reason) {
    if (!page || !pageConfigs[page]) {
      return Promise.resolve(null);
    }

    if (!loader || typeof loader.warmPage !== 'function') {
      if (loader && typeof loader.loadPage === 'function') {
        return loader.loadPage(page);
      }

      return Promise.resolve(null);
    }

    return loader.warmPage(page, reason || 'bootstrap');
  }

  function warmLifeDisplayFontsAfterAbout() {
    if (lifeDisplayFontWarmupStarted) return;

    lifeDisplayFontWarmupStarted = true;

    const preloader = window.SitePreloader;

    if (!preloader || typeof preloader.warmFontGroupWhenIdle !== 'function') {
      return;
    }

    preloader.warmFontGroupWhenIdle('lifeDisplay', {
      timeout: 3000,
      reason: 'after-about-warmup'
    });
  }

  function scheduleWarmupSequence(pages, options) {
    const opts = options || {};
    const list = validPages(pages);

    if (!list.length) return;

    const startDelay = Number(opts.startDelay) || 0;
    const gap = Number(opts.gap) || 0;
    const reason = opts.reason || 'sequence';

    const afterPageWarmup = typeof opts.afterPageWarmup === 'function'
      ? opts.afterPageWarmup
      : null;

    function run() {
      window.setTimeout(async () => {
        for (let index = 0; index < list.length; index += 1) {
          const page = list[index];

          if (page !== getCurrentPage()) {
            await warmPage(page, reason);
          }

          if (afterPageWarmup) {
            try {
              afterPageWarmup(page, index, list);
            } catch (e) {
              console.warn('[BootstrapWarmup] afterPageWarmup failed:', page, e);
            }
          }

          if (gap > 0) {
            await delay(gap);
          }
        }
      }, startDelay);
    }

    if (loader && typeof loader.idle === 'function') {
      loader.idle(run, 1800);
    } else {
      window.setTimeout(run, 800);
    }
  }

  function startAfterCoverWarmup() {
    if (afterCoverWarmupStarted) return;

    afterCoverWarmupStarted = true;

    scheduleWarmupSequence(warmupConfig.afterCover || [defaultPage], {
      startDelay: warmupConfig.delayAfterCover || 650,
      gap: warmupConfig.delayBetweenPages || 850,
      reason: 'after-cover',
      afterPageWarmup(page) {
        if (page === 'resume') {
          warmLifeDisplayFontsAfterAbout();
        }
      }
    });
  }

  function startAfterFirstPageWarmup() {
    if (afterFirstPageWarmupStarted) return;

    afterFirstPageWarmupStarted = true;

    scheduleWarmupSequence(warmupConfig.afterFirstPage || [], {
      startDelay: warmupConfig.delayAfterFirstPage || 700,
      gap: warmupConfig.delayBetweenPages || 850,
      reason: 'after-first-page'
    });
  }

  function warmPageByIntent(page) {
    if (!page || !pageConfigs[page]) return;

    const hoverDelay = Number(warmupConfig.hoverDelay);
    const ms = Number.isFinite(hoverDelay) ? hoverDelay : 80;

    if (intentWarmTimers[page]) {
      clearTimeout(intentWarmTimers[page]);
    }

    intentWarmTimers[page] = window.setTimeout(() => {
      delete intentWarmTimers[page];
      warmPage(page, 'nav-intent');
    }, ms);
  }

  function configure(options) {
    const opts = options || {};

    pageConfigs = opts.pageConfigs || {};
    loader = opts.loader || {};
    warmupConfig = opts.warmupConfig || {};
    defaultPage = opts.defaultPage || 'resume';

    if (typeof opts.getCurrentPage === 'function') {
      getCurrentPage = opts.getCurrentPage;
    }
  }

  function resetWarmupState() {
    afterCoverWarmupStarted = false;
    afterFirstPageWarmupStarted = false;
    lifeDisplayFontWarmupStarted = false;

    Object.keys(intentWarmTimers).forEach((page) => {
      clearTimeout(intentWarmTimers[page]);
      delete intentWarmTimers[page];
    });
  }

  window.BootstrapWarmup = {
    configure,
    delay,
    validPages,
    warmPage,
    scheduleWarmupSequence,
    warmLifeDisplayFontsAfterAbout,
    startAfterCoverWarmup,
    startAfterFirstPageWarmup,
    warmPageByIntent,
    resetWarmupState
  };
})();
