(function () {
  'use strict';

  const resources = window.SiteResources;

  if (!resources) {
    console.error('[SiteResourceLoader] window.SiteResources is not defined.');
    return;
  }

  const loadedStyles = Object.create(null);
  const loadedScripts = Object.create(null);
  const pagePromises = Object.create(null);
  const pageLoaded = Object.create(null);

  const pageWarmupPromises = Object.create(null);
  const pageWarmupLoaded = Object.create(null);

  let bootPromise = null;
  let analyticsStarted = false;

  function toAssetObject(item, keyName) {
    if (typeof item === 'string') {
      return {
        [keyName]: item,
        attrs: {}
      };
    }

    if (item && typeof item === 'object') {
      return {
        [keyName]: item[keyName],
        attrs: item.attrs || {},
        fallbackHref: item.fallbackHref || '',
        timeout: item.timeout
      };
    }

    return {
      [keyName]: '',
      attrs: {}
    };
  }

  function applyAttributes(el, attrs) {
    Object.keys(attrs || {}).forEach((key) => {
      const value = attrs[key];

      if (value === false || value == null) return;

      if (value === true) {
        el.setAttribute(key, '');
        return;
      }

      el.setAttribute(key, String(value));
    });
  }

  function normalizeUrl(url) {
    try {
      return new URL(url, document.baseURI).href;
    } catch (e) {
      return url;
    }
  }

  function findExistingStyle(href) {
    const abs = normalizeUrl(href);
    const links = Array.from(document.querySelectorAll('link[rel="stylesheet"][href]'));

    return links.find((link) => {
      return link.href === abs || normalizeUrl(link.getAttribute('href')) === abs;
    });
  }

  function findExistingScript(src) {
    const abs = normalizeUrl(src);
    const scripts = Array.from(document.querySelectorAll('script[src]'));

    return scripts.find((script) => {
      return script.src === abs || normalizeUrl(script.getAttribute('src')) === abs;
    });
  }

  function flatten(arrays) {
    return arrays.reduce((acc, item) => {
      if (Array.isArray(item)) {
        acc.push(...item);
      } else if (item) {
        acc.push(item);
      }
      return acc;
    }, []);
  }

  function delay(ms) {
    return new Promise((resolve) => {
      window.setTimeout(resolve, Math.max(0, Number(ms) || 0));
    });
  }

  function idle(callback, timeout) {
    if (typeof callback !== 'function') return;

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(callback, { timeout: timeout || 1600 });
      return;
    }

    window.setTimeout(callback, timeout || 800);
  }

  function setSiteMeta() {
    if (resources.site && resources.site.title) {
      document.title = resources.site.title;
    }

    const favicon = resources.site && resources.site.favicon;
    if (!favicon || !favicon.href) return;

    const oldIcon = document.querySelector('link[rel="icon"]');
    if (oldIcon) oldIcon.remove();

    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = favicon.href;

    if (favicon.type) {
      link.type = favicon.type;
    }

    document.head.appendChild(link);
  }

  function loadStyleCandidate(href, attrs, timeout) {
    if (!href) return Promise.resolve(null);

    const existing = findExistingStyle(href);
    if (existing) {
      return Promise.resolve(existing);
    }

    return new Promise((resolve) => {
      const link = document.createElement('link');
      const timeoutMs = Math.max(0, Number(timeout) || 0);
      let settled = false;
      let timer = null;

      function settle(result, shouldRemove) {
        if (settled) return;
        settled = true;

        if (timer) {
          window.clearTimeout(timer);
          timer = null;
        }

        if (shouldRemove && link.parentNode) {
          link.parentNode.removeChild(link);
        }

        resolve(result);
      }

      link.rel = 'stylesheet';
      link.href = href;
      link.dataset.siteManaged = 'style';

      applyAttributes(link, attrs);

      link.onload = () => {
        settle(link, false);
      };

      link.onerror = () => {
        console.warn('[SiteResourceLoader] Failed to load stylesheet:', href);
        settle(null, true);
      };

      if (timeoutMs > 0) {
        timer = window.setTimeout(() => {
          console.warn('[SiteResourceLoader] Stylesheet load timed out:', href);
          settle(null, true);
        }, timeoutMs);
      }

      document.head.appendChild(link);
    });
  }

  function loadStyle(item) {
    const asset = toAssetObject(item, 'href');
    const href = asset.href;
    if (!href) return Promise.resolve(null);

    const key = normalizeUrl(href);

    if (loadedStyles[key]) {
      return loadedStyles[key];
    }

    loadedStyles[key] = (async () => {
      const primary = await loadStyleCandidate(href, asset.attrs, asset.timeout);

      if (primary) {
        return primary;
      }

      if (asset.fallbackHref) {
        console.warn('[SiteResourceLoader] Loading fallback stylesheet:', asset.fallbackHref);
        return loadStyle(asset.fallbackHref);
      }

      return null;
    })();

    return loadedStyles[key];
  }

  function loadScript(item) {
    const asset = toAssetObject(item, 'src');
    const src = asset.src;
    if (!src) return Promise.resolve(null);

    const key = normalizeUrl(src);

    if (loadedScripts[key]) {
      return loadedScripts[key];
    }

    const existing = findExistingScript(src);
    if (existing) {
      loadedScripts[key] = Promise.resolve(existing);
      return loadedScripts[key];
    }

    loadedScripts[key] = new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = false;
      script.dataset.siteManaged = 'script';

      applyAttributes(script, asset.attrs);

      script.onload = () => resolve(script);
      script.onerror = () => {
        console.warn('[SiteResourceLoader] Failed to load script:', src);
        resolve(null);
      };

      document.body.appendChild(script);
    });

    return loadedScripts[key];
  }

  async function loadStylesInParallel(items) {
    const list = Array.isArray(items) ? items : [];
    await Promise.all(list.map(loadStyle));
  }

  async function loadScriptsInOrder(items) {
    const list = Array.isArray(items) ? items : [];

    for (const item of list) {
      await loadScript(item);
    }
  }

  function hasWarmupAssets(page) {
    return !!(
      page &&
      (
        (Array.isArray(page.warmupStyles) && page.warmupStyles.length) ||
        (Array.isArray(page.warmupScripts) && page.warmupScripts.length)
      )
    );
  }

  function warmPageExtras(pageKey, reason) {
    const pages = resources.pages || {};
    const page = pages[pageKey];

    if (!page || !hasWarmupAssets(page)) {
      return Promise.resolve(null);
    }

    if (pageWarmupPromises[pageKey]) {
      return pageWarmupPromises[pageKey];
    }

    pageWarmupPromises[pageKey] = (async () => {
      await loadStylesInParallel(page.warmupStyles || []);
      await loadScriptsInOrder(page.warmupScripts || []);

      pageWarmupLoaded[pageKey] = true;

      try {
        window.dispatchEvent(new CustomEvent('site:pagewarmuploaded', {
          detail: { page: pageKey, config: page, reason: reason || '' }
        }));
      } catch (e) {}

      return page;
    })().catch((err) => {
      console.warn('[SiteResourceLoader] Page extra warm-up failed:', pageKey, reason || '', err);
      return null;
    });

    return pageWarmupPromises[pageKey];
  }

  function startPageExtrasWarmup(pageKey, reason) {
    const pages = resources.pages || {};
    const page = pages[pageKey];

    if (!page || !hasWarmupAssets(page)) return;
    if (pageWarmupPromises[pageKey] || pageWarmupLoaded[pageKey]) return;

    window.setTimeout(() => {
      warmPageExtras(pageKey, reason || 'post-critical-load');
    }, 0);
  }

  function loadAnalyticsWhenIdle() {
    if (analyticsStarted) return;
    analyticsStarted = true;

    idle(() => {
      const analyticsScripts = flatten([
        resources.external && resources.external.analytics
      ]);

      analyticsScripts.forEach((script) => {
        loadScript(script);
      });
    }, 2000);
  }

  async function bootCore() {
    if (bootPromise) return bootPromise;

    bootPromise = (async () => {
      setSiteMeta();

      const externalStyles = flatten([
        resources.external && resources.external.styles
      ]);

      const coreStyles = flatten([
        resources.styles && resources.styles.core
      ]);

      loadStylesInParallel(externalStyles);
      await loadStylesInParallel(coreStyles);

      const coreScripts = flatten([
        resources.scripts && resources.scripts.core,
        resources.scripts && resources.scripts.bootstrap
      ]);

      await loadScriptsInOrder(coreScripts);

      loadAnalyticsWhenIdle();
    })();

    return bootPromise;
  }

  async function loadPage(pageKey) {
    const pages = resources.pages || {};
    const page = pages[pageKey];

    if (!page) {
      console.warn('[SiteResourceLoader] Unknown page:', pageKey);
      return null;
    }

    if (pagePromises[pageKey]) {
      return pagePromises[pageKey];
    }

    pagePromises[pageKey] = (async () => {
      await loadStylesInParallel(page.styles || []);
      await loadScriptsInOrder(page.scripts || []);

      pageLoaded[pageKey] = true;

      try {
        window.dispatchEvent(new CustomEvent('site:pageassetsloaded', {
          detail: { page: pageKey, config: page }
        }));
      } catch (e) {}

      startPageExtrasWarmup(pageKey, 'post-critical-load');

      return page;
    })();

    return pagePromises[pageKey];
  }

  function warmPage(pageKey, reason) {
    const pages = resources.pages || {};
    const page = pages[pageKey];

    if (!page) return Promise.resolve(null);

    if (pageLoaded[pageKey]) {
      startPageExtrasWarmup(pageKey, reason || 'warm-page-loaded');
      return Promise.resolve(page);
    }

    return loadPage(pageKey).catch((err) => {
      console.warn('[SiteResourceLoader] Warm-up failed:', pageKey, reason || '', err);
      return null;
    });
  }

  async function warmPagesSequential(pageKeys, options) {
    const opts = options || {};
    const list = Array.isArray(pageKeys) ? pageKeys : [];
    const gap = Number(opts.gap) || 0;

    for (const pageKey of list) {
      await warmPage(pageKey, opts.reason || 'sequence');
      if (gap > 0) await delay(gap);
    }
  }

  function isPageLoaded(pageKey) {
    return !!pageLoaded[pageKey];
  }

  function isPageLoading(pageKey) {
    return !!pagePromises[pageKey] && !pageLoaded[pageKey];
  }

  function isPageWarmupLoaded(pageKey) {
    return !!pageWarmupLoaded[pageKey];
  }

  function isPageWarmupLoading(pageKey) {
    return !!pageWarmupPromises[pageKey] && !pageWarmupLoaded[pageKey];
  }

  function getPageConfig(pageKey) {
    return resources.pages && resources.pages[pageKey]
      ? resources.pages[pageKey]
      : null;
  }

  function getAllPageConfigs() {
    return resources.pages || {};
  }

  window.SiteResourceLoader = {
    bootCore,
    loadPage,
    warmPage,
    warmPageExtras,
    warmPagesSequential,
    isPageLoaded,
    isPageLoading,
    isPageWarmupLoaded,
    isPageWarmupLoading,
    loadStyle,
    loadScript,
    loadStylesInParallel,
    loadScriptsInOrder,
    getPageConfig,
    getAllPageConfigs,
    idle,
    delay
  };

  bootCore();
})();
