(function () {
  'use strict';

  const LANG_CONFIG = {
    en: {
      src: './assets/js/Content/EN/life/meditations_EN.js',
      htmlVar: 'MEDITATIONS_EN_INNER_HTML'
    },
    zh: {
      src: './assets/js/Content/ZH/life/meditations_ZH.js',
      htmlVar: 'MEDITATIONS_ZH_INNER_HTML'
    }
  };

  const CACHE = {
    en: null,
    zh: null
  };

  const LOAD_PROMISES = {
    en: null,
    zh: null
  };

  let currentLang = null;

  function getLang() {
    if (window.SiteLang && typeof window.SiteLang.getLang === 'function') {
      return window.SiteLang.getLang() === 'zh' ? 'zh' : 'en';
    }

    return document.body && document.body.dataset.lang === 'zh' ? 'zh' : 'en';
  }

  function getMount() {
    return document.getElementById('mount-meditations');
  }

  function getExistingMeditations() {
    const mount = getMount();
    return mount ? mount.querySelector('#meditations') : null;
  }

  function normalizeMeditationHtml(html) {
    const raw = String(html || '').trim();

    if (!raw) {
      return '<div id="meditations"><div class="container"></div></div>';
    }

    if (/^<div\s+id=["']meditations["']/i.test(raw)) {
      return raw;
    }

    return '<div id="meditations">' + raw + '</div>';
  }

  function captureCurrentHtml() {
    const existing = getExistingMeditations();

    if (existing && currentLang && !CACHE[currentLang]) {
      CACHE[currentLang] = existing.outerHTML;
    }
  }

  function setLoading(lang) {
    const mount = getMount();
    if (!mount) return;

    const text = lang === 'zh'
      ? '正在载入沉思录……'
      : 'Loading Meditations...';

    mount.innerHTML = `
      <div id="meditations">
        <div class="container">
          <div class="section">
            <p class="medit-loading">${text}</p>
          </div>
        </div>
      </div>
    `;
  }

  function setFallback(lang) {
    const mount = getMount();
    if (!mount) return;

    const text = lang === 'zh'
      ? '沉思录内容暂时无法加载。'
      : 'Meditations could not be loaded.';

    mount.innerHTML = `
      <div id="meditations">
        <div class="container">
          <div class="section">
            <p class="medit-loading">${text}</p>
          </div>
        </div>
      </div>
    `;
  }

  function getOpenKeys() {
    const mount = getMount();

    if (
      mount &&
      window.ResumeExpanders &&
      typeof window.ResumeExpanders.getOpenKeys === 'function'
    ) {
      return window.ResumeExpanders.getOpenKeys(mount);
    }

    return [];
  }

  function refreshAfterRender(openKeys) {
    const mount = getMount();
    if (!mount) return;

    if (
      window.ResumeExpanders &&
      typeof window.ResumeExpanders.init === 'function'
    ) {
      window.ResumeExpanders.init(mount, {
        openKeys: Array.isArray(openKeys) ? openKeys : [],
        skipSave: false
      });
    }

    if (
      window.CustomCursorAPI &&
      typeof window.CustomCursorAPI.refresh === 'function'
    ) {
      window.CustomCursorAPI.refresh(mount);
    }
  }

  function readHtmlVariable(lang) {
    const config = LANG_CONFIG[lang];
    if (!config) return null;

    const value = window[config.htmlVar];

    return typeof value === 'string' && value.trim()
      ? normalizeMeditationHtml(value)
      : null;
  }

  function loadScript(lang) {
    const config = LANG_CONFIG[lang];

    if (!config || !config.src) {
      return Promise.resolve(false);
    }

    if (LOAD_PROMISES[lang]) {
      return LOAD_PROMISES[lang];
    }

    if (
      window.SiteResourceLoader &&
      typeof window.SiteResourceLoader.loadScript === 'function'
    ) {
      LOAD_PROMISES[lang] = window.SiteResourceLoader.loadScript(config.src)
        .then(() => true)
        .catch((err) => {
          console.warn('[LifeMeditations] Failed to load:', lang, err);
          return false;
        });

      return LOAD_PROMISES[lang];
    }

    LOAD_PROMISES[lang] = new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = config.src;
      script.async = false;

      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.head.appendChild(script);
    });

    return LOAD_PROMISES[lang];
  }

  async function ensureHtmlLoaded(lang) {
    if (CACHE[lang]) {
      return CACHE[lang];
    }

    const fromVariableBeforeLoad = readHtmlVariable(lang);
    if (fromVariableBeforeLoad) {
      CACHE[lang] = fromVariableBeforeLoad;
      return CACHE[lang];
    }

    const mount = getMount();
    if (!mount) return null;

    /*
      EN content file currently inserts DOM directly.
      ZH content file currently exposes MEDITATIONS_ZH_INNER_HTML.
      This loader supports both patterns.
    */
    mount.innerHTML = '';

    const ok = await loadScript(lang);
    if (!ok) return null;

    const fromVariableAfterLoad = readHtmlVariable(lang);
    if (fromVariableAfterLoad) {
      CACHE[lang] = fromVariableAfterLoad;
      return CACHE[lang];
    }

    const inserted = getExistingMeditations();
    if (inserted) {
      CACHE[lang] = inserted.outerHTML;
      return CACHE[lang];
    }

    return null;
  }

  async function render(options) {
    const opts = options || {};
    const lang = opts.lang === 'zh' ? 'zh' : opts.lang === 'en' ? 'en' : getLang();
    const mount = getMount();

    if (!mount) return false;

    const openKeys = Array.isArray(opts.openKeys)
      ? opts.openKeys
      : opts.preserveState
        ? getOpenKeys()
        : [];

    if (currentLang === lang && getExistingMeditations()) {
      refreshAfterRender(openKeys);
      return true;
    }

    captureCurrentHtml();

    if (CACHE[lang]) {
      mount.innerHTML = CACHE[lang];
      currentLang = lang;
      refreshAfterRender(openKeys);
      return true;
    }

    setLoading(lang);

    const html = await ensureHtmlLoaded(lang);

    if (!html) {
      setFallback(lang);
      currentLang = lang;
      refreshAfterRender(openKeys);
      return false;
    }

    mount.innerHTML = html;
    currentLang = lang;

    refreshAfterRender(openKeys);

    return true;
  }

  function ensureCurrent(options) {
    return render(Object.assign({}, options || {}, {
      lang: getLang()
    }));
  }

  function refreshCurrentLanguage() {
    const openKeys = getOpenKeys();

    return render({
      lang: getLang(),
      openKeys
    });
  }

  function clear() {
    captureCurrentHtml();

    const mount = getMount();
    if (mount) mount.innerHTML = '';

    currentLang = null;
  }

  window.LifeMeditations = {
    render,
    ensureCurrent,
    refreshCurrentLanguage,
    clear,
    getOpenKeys
  };
})();
