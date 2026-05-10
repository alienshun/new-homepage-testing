(function () {
  'use strict';

  const resources = window.SiteResources || {};
  const loader = window.SiteResourceLoader || {};
  const pageConfigs = resources.pages || {};
  const navigation = resources.navigation || {};
  const defaultPage = navigation.defaultPage || 'resume';
  const warmupConfig = navigation.warmup || {};

  const ROUTE_TO_PAGE = {};
  const PAGE_TO_ROUTE = {};
  const PAGE_DOM_IDS = {};
  const ROUTE_SEGMENTS = [];

  Object.keys(pageConfigs).forEach((pageKey) => {
    const cfg = pageConfigs[pageKey] || {};
    const route = cfg.route;
    const domId = cfg.domId;

    if (route) {
      ROUTE_TO_PAGE['/' + route] = pageKey;
      PAGE_TO_ROUTE[pageKey] = route;
      ROUTE_SEGMENTS.push(route);
    }

    if (domId) {
      PAGE_DOM_IDS[pageKey] = domId;
    }
  });

  let coverHidden = false;
  let currentPage = null;

  let wheelTriggered = false;
  let wheelLockTimer = null;

  let afterCoverWarmupStarted = false;
  let afterFirstPageWarmupStarted = false;

  const intentWarmTimers = Object.create(null);

  function delay(ms) {
    return new Promise((resolve) => {
      window.setTimeout(resolve, Math.max(0, Number(ms) || 0));
    });
  }

  function normalizePath(pathname) {
    let cleaned = pathname || '/';
    cleaned = cleaned.replace(/index\.html$/, '');
    cleaned = cleaned.replace(/\/+$/, '');
    return cleaned || '/';
  }

  function getSiteRootPath() {
    const normalized = normalizePath(window.location.pathname);
    const parts = normalized.split('/').filter(Boolean);

    if (parts.length > 0) {
      const last = parts[parts.length - 1];
      if (ROUTE_SEGMENTS.includes(last)) {
        parts.pop();
      }
    }

    return '/' + (parts.length ? parts.join('/') + '/' : '');
  }

  function stripSiteRoot(pathname) {
    const siteRoot = getSiteRootPath().replace(/\/$/, '');
    const normalized = normalizePath(pathname);

    if (!siteRoot || siteRoot === '/') return normalized;

    if (normalized === siteRoot) return '/';
    if (normalized.startsWith(siteRoot + '/')) {
      return normalized.slice(siteRoot.length) || '/';
    }

    return normalized;
  }

  function getPageFromPath(pathname) {
    const relativePath = stripSiteRoot(pathname || window.location.pathname);
    return ROUTE_TO_PAGE[relativePath] || null;
  }

  function getRouteForPage(page) {
    const siteRoot = getSiteRootPath();
    const segment = PAGE_TO_ROUTE[page];
    if (!segment) return siteRoot;
    return `${siteRoot}${segment}/`;
  }

  function getCoverRoute() {
    return getSiteRootPath();
  }

  function syncHistory(path, replace) {
    if (!window.history || typeof window.history.pushState !== 'function') return;

    const nextPath = path || getCoverRoute();
    const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;

    if (currentPath === nextPath) return;

    const method = replace ? 'replaceState' : 'pushState';
    window.history[method]({ path: nextPath }, '', nextPath);
  }

  let appHeightRaf = 0;

  function syncAppHeight() {
    try {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    } catch (e) {}
  }

  function scheduleAppHeightSync() {
    if (appHeightRaf) cancelAnimationFrame(appHeightRaf);

    appHeightRaf = requestAnimationFrame(() => {
      appHeightRaf = 0;
      syncAppHeight();
    });
  }

  syncAppHeight();
  window.addEventListener('resize', scheduleAppHeightSync, { passive: true });
  window.addEventListener('orientationchange', scheduleAppHeightSync, { passive: true });

  function lockWheelTrigger(ms) {
    wheelTriggered = true;

    if (wheelLockTimer) clearTimeout(wheelLockTimer);

    wheelLockTimer = setTimeout(() => {
      wheelTriggered = false;
    }, ms);
  }

  function scrollTargetIntoView(targetId, behavior) {
    const el = document.getElementById(targetId);
    if (!el) return;

    try {
      el.scrollIntoView({ behavior: behavior || 'smooth', block: 'start' });
    } catch (e) {}
  }

  function showCoverElements() {
    const avatarFrame = document.getElementById('avatar-frame');
    const name = document.getElementById('name');
    const slogan = document.getElementById('slogan');
    const arrow = document.getElementById('cover-scroll');

    if (!avatarFrame || !name || !slogan) return;

    avatarFrame.classList.add('visible');
    setTimeout(() => name.classList.add('visible'), 400);
    setTimeout(() => slogan.classList.add('visible'), 800);

    setTimeout(() => {
      if (arrow) arrow.classList.add('visible');
    }, 1200);
  }

  function validPages(list) {
    return (Array.isArray(list) ? list : [])
      .filter((page) => page && pageConfigs[page]);
  }

  function warmPage(page, reason) {
    if (!page || !pageConfigs[page]) return Promise.resolve(null);

    if (!loader || typeof loader.warmPage !== 'function') {
      if (typeof loader.loadPage === 'function') {
        return loader.loadPage(page);
      }
      return Promise.resolve(null);
    }

    return loader.warmPage(page, reason || 'bootstrap');
  }

  function scheduleWarmupSequence(pages, options) {
    const opts = options || {};
    const list = validPages(pages);

    if (!list.length) return;

    const startDelay = Number(opts.startDelay) || 0;
    const gap = Number(opts.gap) || 0;
    const reason = opts.reason || 'sequence';

    function run() {
      window.setTimeout(async () => {
        for (const page of list) {
          if (page !== currentPage) {
            await warmPage(page, reason);
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
      reason: 'after-cover'
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

  function getPageElement(page) {
    const id = PAGE_DOM_IDS[page];
    return id ? document.getElementById(id) : null;
  }

  function getPageContext(page, extra) {
    return Object.assign({
      page,
      element: getPageElement(page)
    }, extra || {});
  }

  function runPageInit(page) {
    const sitePages = window.SitePages;

    if (sitePages && typeof sitePages.init === 'function') {
      sitePages.init(page, getPageContext(page));
      return;
    }

    if (page === 'schedule' && window.Schedule) {
      if (typeof window.Schedule.initSchedulePage === 'function') {
        window.Schedule.initSchedulePage();
      }
      if (typeof window.Schedule.initWeeksSelection === 'function') {
        window.Schedule.initWeeksSelection();
      }
      if (typeof window.Schedule.initSemesterSelection === 'function') {
        window.Schedule.initSemesterSelection();
      }
    }

    if (page === 'toolkit' && window.Toolkit && typeof window.Toolkit.initToolkitFilter === 'function') {
      window.Toolkit.initToolkitFilter();
    }
  }

  function runPageEnter(page, previousPage) {
    const sitePages = window.SitePages;

    if (sitePages && typeof sitePages.enter === 'function') {
      sitePages.enter(page, getPageContext(page, {
        previousPage
      }));
      return;
    }

    if (page === 'schedule' && window.Schedule && typeof window.Schedule.setScheduleView === 'function') {
      window.Schedule.setScheduleView('my-timetable');
    }
  }

  function runPageLeave(page, nextPage) {
    const sitePages = window.SitePages;

    if (sitePages && typeof sitePages.leave === 'function') {
      sitePages.leave(page, getPageContext(page, {
        nextPage
      }));
    }
  }

  async function ensurePageAssets(page) {
    if (!pageConfigs[page]) return false;

    if (!loader || typeof loader.loadPage !== 'function') {
      console.error('[Bootstrap] SiteResourceLoader.loadPage is not available.');
      return false;
    }

    await loader.loadPage(page);
    initLoadedPage(page);
    return true;
  }

  function initLoadedPage(page) {
    const pageId = PAGE_DOM_IDS[page];
    const pageEl = pageId ? document.getElementById(pageId) : null;

    runPageInit(page);

    if (window.SiteLang && typeof window.SiteLang.applyLanguage === 'function') {
      const lang = window.SiteLang.getLang ? window.SiteLang.getLang() : 'en';
      window.SiteLang.applyLanguage(lang);
    }

    if (window.Theme && typeof window.Theme.init === 'function') {
      window.Theme.init();
    }

    if (window.Clock && typeof window.Clock.updateClock === 'function') {
      window.Clock.updateClock();
    }

    if (window.ResumeExpanders && typeof window.ResumeExpanders.init === 'function') {
      window.ResumeExpanders.init(pageEl || document);
    }

    if (window.CustomCursorAPI && typeof window.CustomCursorAPI.refresh === 'function') {
      window.CustomCursorAPI.refresh(pageEl || document);
    }
  }

  function hideAllPages() {
    Object.keys(PAGE_DOM_IDS).forEach((page) => {
      const el = getPageElement(page);
      if (el) el.classList.remove('visible');
    });
  }

  function activatePage(targetPage, opts) {
    const targetEl = getPageElement(targetPage);
    if (!targetEl) return false;

    const previousPage = currentPage;

    if (previousPage && previousPage !== targetPage) {
      runPageLeave(previousPage, targetPage);
    }

    hideAllPages();

    targetEl.classList.add('visible');
    currentPage = targetPage;

    scrollTargetIntoView(PAGE_DOM_IDS[targetPage], opts.scrollBehavior);
    runPageEnter(targetPage, previousPage);

    if (window.TopNav) {
      window.TopNav.show();
      window.TopNav.setActive(currentPage);
    }

    if (opts.updateHistory && PAGE_TO_ROUTE[currentPage]) {
      syncHistory(getRouteForPage(currentPage), opts.replaceHistory);
    }

    startAfterFirstPageWarmup();

    return true;
  }

  async function showPage(page, options) {
    const opts = Object.assign({
      updateHistory: true,
      replaceHistory: false,
      instant: false,
      scrollBehavior: 'smooth'
    }, options || {});

    if (!pageConfigs[page]) return;

    if (coverHidden && currentPage === page) {
      if (opts.updateHistory && PAGE_TO_ROUTE[page]) {
        syncHistory(getRouteForPage(page), opts.replaceHistory);
      }
      return;
    }

    const cover = document.getElementById('cover');
    const loadPromise = ensurePageAssets(page);

    if (coverHidden || opts.instant) {
      const loaded = await loadPromise;
      if (!loaded) return;

      const target = getPageElement(page);
      if (!cover || !target) return;

      cover.style.display = 'none';
      document.body.style.overflow = 'auto';
      coverHidden = true;
      activatePage(page, opts);
      document.documentElement.classList.remove('route-entry');
      return;
    }

    if (!cover) {
      const loaded = await loadPromise;
      if (!loaded) return;
      activatePage(page, opts);
      return;
    }

    cover.classList.add('hidden');

    ['avatar-frame', 'name', 'slogan', 'cover-scroll'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('visible');
    });

    const results = await Promise.all([
      loadPromise,
      delay(1500)
    ]);

    const loaded = results[0];
    if (!loaded) return;

    const target = getPageElement(page);
    if (!target) return;

    cover.style.display = 'none';
    document.body.style.overflow = 'auto';
    coverHidden = true;

    activatePage(page, opts);
    document.documentElement.classList.remove('route-entry');
  }

  function backToCover(options) {
    const opts = Object.assign({
      updateHistory: true,
      replaceHistory: false,
      instant: false
    }, options || {});

    const cover = document.getElementById('cover');
    if (!cover) return;

    if (currentPage) {
      runPageLeave(currentPage, null);
    }

    coverHidden = false;
    currentPage = null;

    if (window.TopNav) {
      window.TopNav.hide();
      window.TopNav.setActive('');
    }

    cover.style.display = 'flex';
    cover.classList.remove('hidden');

    hideAllPages();

    ['resume-back-btn', 'social-back-btn', 'toolkit-back-btn', 'schedule-back-btn'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('visible');
    });

    window.scrollTo(0, 0);
    document.body.style.overflow = 'hidden';

    if (opts.updateHistory) {
      syncHistory(getCoverRoute(), opts.replaceHistory);
    }

    if (opts.instant) {
      cover.classList.add('visible');
      showCoverElements();
      startAfterCoverWarmup();
      return;
    }

    setTimeout(() => {
      cover.classList.add('visible');
      showCoverElements();
      startAfterCoverWarmup();
    }, 100);
  }

  async function applyRouteFromLocation(options) {
    const page = getPageFromPath(window.location.pathname);

    if (page) {
      await showPage(page, Object.assign({
        updateHistory: false,
        instant: true,
        scrollBehavior: 'auto'
      }, options || {}));
    } else {
      backToCover(Object.assign({
        updateHistory: false,
        instant: true
      }, options || {}));
    }
  }

  function bindCoverArrowAndScroll() {
    const cover = document.getElementById('cover');
    const arrow = document.getElementById('cover-scroll');
    if (!cover) return;

    if (arrow && arrow.dataset.boundCoverArrow !== '1') {
      arrow.dataset.boundCoverArrow = '1';

      arrow.addEventListener('pointerenter', () => {
        warmPage(defaultPage, 'cover-arrow-intent');
      }, { passive: true });

      arrow.addEventListener('focus', () => {
        warmPage(defaultPage, 'cover-arrow-focus');
      });

      arrow.addEventListener('touchstart', () => {
        warmPage(defaultPage, 'cover-arrow-touch');
      }, { passive: true });

      arrow.addEventListener('click', () => {
        if (coverHidden) return;

        arrow.classList.add('pulse');
        setTimeout(() => arrow.classList.remove('pulse'), 320);

        showPage(defaultPage);
      });
    }

    if (cover.dataset.boundCoverScroll === '1') return;
    cover.dataset.boundCoverScroll = '1';

    cover.addEventListener('wheel', (e) => {
      if (coverHidden) return;

      if (e.deltaY > 6 && !wheelTriggered) {
        e.preventDefault();
        lockWheelTrigger(900);
        showPage(defaultPage);
        return;
      }

      e.preventDefault();
    }, { passive: false });

    let touchStartY = 0;
    let touchStartX = 0;
    let touchActive = false;

    cover.addEventListener('touchstart', (e) => {
      if (coverHidden) return;
      if (!e.touches || e.touches.length !== 1) return;

      touchActive = true;
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    cover.addEventListener('touchmove', (e) => {
      if (coverHidden || !touchActive) return;

      const t = e.touches && e.touches[0];
      if (!t) return;

      const dy = t.clientY - touchStartY;
      const dx = t.clientX - touchStartX;

      if (Math.abs(dy) > Math.abs(dx) * 1.2) {
        e.preventDefault();
      }
    }, { passive: false });

    cover.addEventListener('touchend', (e) => {
      if (coverHidden || !touchActive) return;

      touchActive = false;

      const t = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0] : null;
      if (!t) return;

      const dy = t.clientY - touchStartY;
      const dx = t.clientX - touchStartX;

      const isVertical = Math.abs(dy) > Math.abs(dx) * 1.2;
      const strongEnough = Math.abs(dy) > 60;

      if (isVertical && strongEnough && !wheelTriggered) {
        lockWheelTrigger(900);
        showPage(defaultPage);
      }
    }, { passive: true });

    window.addEventListener('keydown', (e) => {
      if (coverHidden) return;

      const keys = ['ArrowDown', 'PageDown', 'Space'];

      if (keys.includes(e.code)) {
        e.preventDefault();

        if (!wheelTriggered) {
          lockWheelTrigger(900);
          showPage(defaultPage);
        }
      }
    }, { passive: false });
  }

  async function bootDOMContentLoaded() {
    if (window.Theme && typeof window.Theme.init === 'function') {
      window.Theme.init();
    }

    if (window.TopNav && typeof window.TopNav.init === 'function') {
      window.TopNav.init(showPage, backToCover, warmPageByIntent);
    }

    if (window.Clock && typeof window.Clock.initToggle === 'function') {
      window.Clock.initToggle();
    }

    const initialPage = getPageFromPath(window.location.pathname);

    if (initialPage) {
      await applyRouteFromLocation({
        updateHistory: false,
        instant: true,
        scrollBehavior: 'auto'
      });
    }
  }

  function bootOnLoad() {
    const initialPage = getPageFromPath(window.location.pathname);

    if (!initialPage) {
      if (window.TopNav) {
        window.TopNav.hide();
      }

      document.body.style.overflow = 'hidden';

      const cover = document.getElementById('cover');
      if (cover) {
        cover.classList.add('visible');
        showCoverElements();
        startAfterCoverWarmup();
      }
    }

    bindCoverArrowAndScroll();

    if (window.Clock && typeof window.Clock.start === 'function') {
      window.Clock.start();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootDOMContentLoaded);
  } else {
    bootDOMContentLoaded();
  }

  window.addEventListener('popstate', () => {
    applyRouteFromLocation();
  });

  window.addEventListener('load', bootOnLoad);
})();
