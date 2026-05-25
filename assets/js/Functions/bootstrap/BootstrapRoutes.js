(function () {
  'use strict';

  let pageConfigs = {};
  let navigation = {};
  let defaultPage = 'resume';

  const ROUTE_TO_PAGE = {};
  const PAGE_TO_ROUTE = {};
  const PAGE_DOM_IDS = {};
  const ROUTE_SEGMENTS = [];

  const SCROLL_STORAGE_PREFIX = 'stardust-page-scroll:';

  let currentScrollKey = null;
  let isRestoringScroll = false;
  let configured = false;

  function resetMaps() {
    Object.keys(ROUTE_TO_PAGE).forEach((key) => delete ROUTE_TO_PAGE[key]);
    Object.keys(PAGE_TO_ROUTE).forEach((key) => delete PAGE_TO_ROUTE[key]);
    Object.keys(PAGE_DOM_IDS).forEach((key) => delete PAGE_DOM_IDS[key]);
    ROUTE_SEGMENTS.splice(0, ROUTE_SEGMENTS.length);
  }

  function buildRouteMaps() {
    resetMaps();

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
    const routeIndex = parts.findIndex((part) => ROUTE_SEGMENTS.includes(part));
    const rootParts = routeIndex >= 0 ? parts.slice(0, routeIndex) : parts;

    return '/' + (rootParts.length ? rootParts.join('/') + '/' : '');
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
    const exactPage = ROUTE_TO_PAGE[relativePath];

    if (exactPage) return exactPage;

    const nestedRoute = Object.keys(ROUTE_TO_PAGE)
      .sort((a, b) => b.length - a.length)
      .find((route) => relativePath.startsWith(route + '/'));

    return nestedRoute ? ROUTE_TO_PAGE[nestedRoute] : null;
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

  function hasRouteForPage(page) {
    return Boolean(PAGE_TO_ROUTE[page]);
  }

  function syncHistory(path, replace) {
    if (!window.history || typeof window.history.pushState !== 'function') return;

    const nextPath = path || getCoverRoute();
    const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;

    if (currentPath === nextPath) return;

    const method = replace ? 'replaceState' : 'pushState';
    window.history[method]({ path: nextPath }, '', nextPath);
  }

  function getScrollKey(pathname) {
    return SCROLL_STORAGE_PREFIX + normalizePath(pathname || window.location.pathname);
  }

  function setCurrentScrollPath(pathname) {
    currentScrollKey = getScrollKey(pathname || window.location.pathname);
  }

  function readSavedScrollPosition(pathname) {
    try {
      const raw = window.sessionStorage.getItem(getScrollKey(pathname));
      if (!raw) return null;

      const data = JSON.parse(raw);
      const x = Number(data && data.x);
      const y = Number(data && data.y);

      if (!Number.isFinite(x) || !Number.isFinite(y)) return null;

      return {
        x: Math.max(0, x),
        y: Math.max(0, y)
      };
    } catch (e) {
      return null;
    }
  }

  function saveCurrentScrollPosition() {
    if (isRestoringScroll) return;

    try {
      const data = JSON.stringify({
        x: window.scrollX || window.pageXOffset || 0,
        y: window.scrollY || window.pageYOffset || 0,
        ts: Date.now()
      });

      const keys = [
        currentScrollKey,
        getScrollKey(window.location.pathname)
      ].filter(Boolean);

      Array.from(new Set(keys)).forEach((key) => {
        window.sessionStorage.setItem(key, data);
      });
    } catch (e) {}
  }

  function restoreSavedScrollPosition(pathname) {
    const pos = readSavedScrollPosition(pathname);
    if (!pos) return false;

    isRestoringScroll = true;

    const restore = () => {
      try {
        window.scrollTo(pos.x, pos.y);
      } catch (e) {}
    };

    restore();

    requestAnimationFrame(() => {
      restore();

      setTimeout(restore, 80);

      setTimeout(() => {
        restore();
        isRestoringScroll = false;
      }, 240);
    });

    return true;
  }

  function scrollTargetIntoView(targetId, behavior) {
    const el = document.getElementById(targetId);
    if (!el) return;

    try {
      el.scrollIntoView({
        behavior: behavior || 'smooth',
        block: 'start'
      });
    } catch (e) {}
  }

  function getPageElement(page) {
    const id = PAGE_DOM_IDS[page];
    return id ? document.getElementById(id) : null;
  }

  function getPageDomId(page) {
    return PAGE_DOM_IDS[page] || '';
  }

  function getPageContext(page, extra) {
    return Object.assign({
      page,
      element: getPageElement(page)
    }, extra || {});
  }

  function hideAllPages() {
    Object.keys(PAGE_DOM_IDS).forEach((page) => {
      const el = getPageElement(page);
      if (el) el.classList.remove('visible');
    });
  }

  function initScrollRestoration() {
    try {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
    } catch (e) {}
  }

  function bindScrollSaveEvents() {
    if (window.__bootstrapRoutesScrollEventsBound) return;
    window.__bootstrapRoutesScrollEventsBound = true;

    window.addEventListener('pagehide', saveCurrentScrollPosition);
    window.addEventListener('beforeunload', saveCurrentScrollPosition);
  }

  function configure(options) {
    const opts = options || {};

    pageConfigs = opts.pageConfigs || {};
    navigation = opts.navigation || {};
    defaultPage = navigation.defaultPage || opts.defaultPage || 'resume';

    buildRouteMaps();

    if (!configured) {
      configured = true;
      initScrollRestoration();
      bindScrollSaveEvents();
    }

    return {
      defaultPage
    };
  }

  window.BootstrapRoutes = {
    configure,

    normalizePath,
    getSiteRootPath,
    stripSiteRoot,
    getPageFromPath,
    getRouteForPage,
    getCoverRoute,
    hasRouteForPage,
    syncHistory,

    getScrollKey,
    setCurrentScrollPath,
    readSavedScrollPosition,
    saveCurrentScrollPosition,
    restoreSavedScrollPosition,
    scrollTargetIntoView,

    getPageElement,
    getPageDomId,
    getPageContext,
    hideAllPages,

    getMaps() {
      return {
        routeToPage: Object.assign({}, ROUTE_TO_PAGE),
        pageToRoute: Object.assign({}, PAGE_TO_ROUTE),
        pageDomIds: Object.assign({}, PAGE_DOM_IDS),
        routeSegments: ROUTE_SEGMENTS.slice()
      };
    }
  };
})();
