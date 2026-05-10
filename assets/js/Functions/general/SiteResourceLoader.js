(function () {
  'use strict';

  const resources = window.SiteResources;

  if (!resources) {
    console.error('[SiteResourceLoader] window.SiteResources is not defined.');
    return;
  }

  const loadedStyles = Object.create(null);
  const loadedScripts = Object.create(null);

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
        attrs: item.attrs || {}
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

  function loadStyle(item) {
    const asset = toAssetObject(item, 'href');
    const href = asset.href;
    if (!href) return Promise.resolve(null);

    const key = normalizeUrl(href);

    if (loadedStyles[key]) {
      return loadedStyles[key];
    }

    const existing = findExistingStyle(href);
    if (existing) {
      loadedStyles[key] = Promise.resolve(existing);
      return loadedStyles[key];
    }

    loadedStyles[key] = new Promise((resolve) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.dataset.siteManaged = 'style';

      applyAttributes(link, asset.attrs);

      link.onload = () => resolve(link);
      link.onerror = () => {
        console.warn('[SiteResourceLoader] Failed to load stylesheet:', href);
        resolve(null);
      };

      document.head.appendChild(link);
    });

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

  async function boot() {
    setSiteMeta();

    const allStyles = flatten([
      resources.external && resources.external.styles,
      resources.styles && resources.styles.core,
      resources.styles && resources.styles.pages
    ]);

    await loadStylesInParallel(allStyles);

    const allScripts = flatten([
      resources.external && resources.external.scripts,
      resources.scripts && resources.scripts.modules,
      resources.scripts && resources.scripts.content,
      resources.scripts && resources.scripts.pageFunctions,
      resources.scripts && resources.scripts.general,
      resources.scripts && resources.scripts.bootstrap
    ]);

    await loadScriptsInOrder(allScripts);

    const analyticsScripts = flatten([
      resources.external && resources.external.analytics
    ]);

    analyticsScripts.forEach((script) => {
      const asset = toAssetObject(script, 'src');
      if (!asset.src) return;

      const el = document.createElement('script');
      el.src = asset.src;
      applyAttributes(el, asset.attrs);
      document.body.appendChild(el);
    });
  }

  boot();
})();
