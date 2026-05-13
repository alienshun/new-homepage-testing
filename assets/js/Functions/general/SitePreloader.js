(function () {
  'use strict';

  const resources = window.SiteResources || {};

  const loadedPreloads = Object.create(null);
  const loadedFontFaces = Object.create(null);
  const scheduledGroups = Object.create(null);

  function normalizeUrl(url) {
    try {
      return new URL(url, document.baseURI).href;
    } catch (e) {
      return url;
    }
  }

  function idle(callback, timeout) {
    if (typeof callback !== 'function') return;

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(callback, { timeout: timeout || 3000 });
      return;
    }

    window.setTimeout(callback, timeout || 1800);
  }

  function toFontObject(item) {
    if (typeof item === 'string') {
      return {
        href: item,
        type: inferFontType(item),
        family: '',
        load: ''
      };
    }

    if (item && typeof item === 'object') {
      return {
        href: item.href || '',
        type: item.type || inferFontType(item.href || ''),
        family: item.family || '',
        load: item.load || '',
        attrs: item.attrs || {}
      };
    }

    return {
      href: '',
      type: '',
      family: '',
      load: ''
    };
  }

  function inferFontType(href) {
    const clean = String(href || '').split(/[?#]/)[0].toLowerCase();

    if (clean.endsWith('.woff2')) return 'font/woff2';
    if (clean.endsWith('.woff')) return 'font/woff';
    if (clean.endsWith('.ttf')) return 'font/ttf';
    if (clean.endsWith('.otf')) return 'font/otf';

    return 'font/woff2';
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

  function findExistingPreload(href) {
    const abs = normalizeUrl(href);
    const links = Array.from(document.querySelectorAll('link[rel="preload"][href]'));

    return links.find((link) => {
      return link.href === abs || normalizeUrl(link.getAttribute('href')) === abs;
    });
  }

  function preloadFont(item) {
    const font = toFontObject(item);
    const href = font.href;

    if (!href) return Promise.resolve(null);

    const key = normalizeUrl(href);

    if (loadedPreloads[key]) {
      return loadedPreloads[key];
    }

    const existing = findExistingPreload(href);
    if (existing) {
      loadedPreloads[key] = Promise.resolve(existing);
      return loadedPreloads[key];
    }

    loadedPreloads[key] = new Promise((resolve) => {
      const link = document.createElement('link');

      link.rel = 'preload';
      link.as = 'font';
      link.href = href;
      link.type = font.type || inferFontType(href);
      link.crossOrigin = 'anonymous';
      link.dataset.siteManaged = 'preload-font';

      applyAttributes(link, font.attrs);

      link.onload = () => resolve(link);
      link.onerror = () => {
        console.warn('[SitePreloader] Failed to preload font:', href);
        resolve(null);
      };

      document.head.appendChild(link);
    });

    return loadedPreloads[key];
  }

  function escapeFontFamily(family) {
    return String(family || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }

  function getFontLoadExpression(font) {
    if (font.load) return font.load;

    if (font.family) {
      return '1em "' + escapeFontFamily(font.family) + '"';
    }

    return '';
  }

  function loadFontFace(item) {
    const font = toFontObject(item);
    const expression = getFontLoadExpression(font);

    if (!expression) return Promise.resolve(null);

    if (!document.fonts || typeof document.fonts.load !== 'function') {
      return Promise.resolve(null);
    }

    if (loadedFontFaces[expression]) {
      return loadedFontFaces[expression];
    }

    loadedFontFaces[expression] = document.fonts.load(expression).catch((err) => {
      console.warn('[SitePreloader] Failed to warm font face:', expression, err);
      return null;
    });

    return loadedFontFaces[expression];
  }

  async function warmFonts(items, options) {
    const opts = options || {};
    const list = Array.isArray(items) ? items : [];

    if (!list.length) return [];

    const fonts = list.map(toFontObject).filter((font) => font.href);

    fonts.forEach((font) => {
      preloadFont(font);
    });

    if (opts.loadFaces === false) {
      return fonts;
    }

    await Promise.all(fonts.map(loadFontFace));
    return fonts;
  }

  function getFontGroup(groupName) {
    const groups = resources.preload &&
      resources.preload.fonts &&
      typeof resources.preload.fonts === 'object'
      ? resources.preload.fonts
      : {};

    const group = groups[groupName];

    return Array.isArray(group) ? group : [];
  }

  function warmFontGroup(groupName, options) {
    return warmFonts(getFontGroup(groupName), options);
  }

  function warmFontsWhenIdle(items, options) {
    const opts = options || {};
    const timeout = Number(opts.timeout) || 3000;

    return new Promise((resolve) => {
      idle(() => {
        warmFonts(items, opts).then(resolve);
      }, timeout);
    });
  }

  function warmFontGroupWhenIdle(groupName, options) {
    const opts = options || {};
    const key = String(groupName || '');

    if (!key) {
      return Promise.resolve([]);
    }

    if (scheduledGroups[key]) {
      return scheduledGroups[key];
    }

    scheduledGroups[key] = warmFontsWhenIdle(getFontGroup(key), opts);
    return scheduledGroups[key];
  }

  window.SitePreloader = {
    preloadFont,
    warmFonts,
    warmFontGroup,
    warmFontsWhenIdle,
    warmFontGroupWhenIdle
  };
})();
