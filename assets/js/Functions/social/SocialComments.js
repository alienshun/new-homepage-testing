(function () {
  'use strict';

  const GISCUS_CONFIG = {
    repo: 'Stardust-math/Stardust-math.github.io',
    repoId: 'R_kgDOPFvFdg',
    mapping: 'number',
    term: '2',
    reactionsEnabled: '0',
    emitMetadata: '0',
    inputPosition: 'top',
    loading: 'lazy',
    discussionUrl: 'https://github.com/Stardust-math/Stardust-math.github.io/discussions/2'
  };

  const GISCUS_ORIGIN = 'https://giscus.app';

  let giscusLoaded = false;
  let containerObserver = null;
  let themeObserver = null;

  function getLang() {
    if (window.SiteLang && typeof window.SiteLang.getLang === 'function') {
      return window.SiteLang.getLang();
    }

    const bodyLang = document.body && document.body.dataset
      ? document.body.dataset.lang
      : '';

    if (bodyLang) {
      return String(bodyLang).toLowerCase().startsWith('zh') ? 'zh' : 'en';
    }

    const htmlLang = document.documentElement.getAttribute('lang') || '';
    return String(htmlLang).toLowerCase().startsWith('zh') ? 'zh' : 'en';
  }

  function getGiscusLang() {
    return getLang() === 'zh' ? 'zh-CN' : 'en';
  }

  function getTheme() {
    if (!document.body) {
      return 'preferred_color_scheme';
    }

    return document.body.classList.contains('dark-mode') ? 'dark' : 'light';
  }

  function getSocialDict() {
    const lang = getLang();

    if (lang === 'zh' && window.SOCIAL_ZH_I18N && typeof window.SOCIAL_ZH_I18N === 'object') {
      return window.SOCIAL_ZH_I18N;
    }

    if (window.SOCIAL_EN_I18N && typeof window.SOCIAL_EN_I18N === 'object') {
      return window.SOCIAL_EN_I18N;
    }

    return {};
  }

  function updateStaticTexts() {
    const dict = getSocialDict();

    const loading = document.getElementById('giscus-loading');
    if (loading && dict.comments_loading) {
      loading.textContent = dict.comments_loading;
    }

    const githubLink = document.getElementById('giscus-github-link');
    if (githubLink) {
      const label = dict.comments_open_github || 'Open on GitHub';
      githubLink.setAttribute('title', label);
      githubLink.setAttribute('aria-label', label);
    }
  }

  function postGiscusConfig(config) {
    const iframe = document.querySelector('iframe.giscus-frame');
    if (!iframe || !iframe.contentWindow) return;

    iframe.contentWindow.postMessage({
      giscus: {
        setConfig: config
      }
    }, GISCUS_ORIGIN);
  }

  function syncGiscusAppearance() {
    if (!giscusLoaded) return;

    postGiscusConfig({
      theme: getTheme(),
      lang: getGiscusLang(),
      inputPosition: GISCUS_CONFIG.inputPosition,
      reactionsEnabled: GISCUS_CONFIG.reactionsEnabled
    });
  }

  function mountGiscus() {
    if (giscusLoaded) return;

    const container = document.getElementById('giscus-container');
    if (!container) return;

    container.textContent = '';

    const script = document.createElement('script');
    script.src = GISCUS_ORIGIN + '/client.js';

    script.setAttribute('data-repo', GISCUS_CONFIG.repo);
    script.setAttribute('data-repo-id', GISCUS_CONFIG.repoId);
    script.setAttribute('data-mapping', GISCUS_CONFIG.mapping);
    script.setAttribute('data-term', GISCUS_CONFIG.term);
    script.setAttribute('data-reactions-enabled', GISCUS_CONFIG.reactionsEnabled);
    script.setAttribute('data-emit-metadata', GISCUS_CONFIG.emitMetadata);
    script.setAttribute('data-input-position', GISCUS_CONFIG.inputPosition);
    script.setAttribute('data-theme', getTheme());
    script.setAttribute('data-lang', getGiscusLang());
    script.setAttribute('data-loading', GISCUS_CONFIG.loading);
    script.setAttribute('crossorigin', 'anonymous');
    script.async = true;

    script.onerror = function () {
      const dict = getSocialDict();
      container.innerHTML = '<div class="giscus-fallback">' +
        (dict.comments_failed || 'Comments failed to load. Please open the discussion on GitHub.') +
        '</div>';
    };

    container.appendChild(script);
    giscusLoaded = true;
  }

  function observeContainer() {
    const container = document.getElementById('giscus-container');
    if (!container || giscusLoaded) return;

    if (containerObserver) {
      containerObserver.disconnect();
      containerObserver = null;
    }

    if ('IntersectionObserver' in window) {
      containerObserver = new IntersectionObserver(function (entries) {
        const entry = entries[0];
        if (!entry || !entry.isIntersecting) return;

        mountGiscus();

        if (containerObserver) {
          containerObserver.disconnect();
          containerObserver = null;
        }
      }, {
        root: null,
        rootMargin: '520px 0px',
        threshold: 0
      });

      containerObserver.observe(container);
      return;
    }

    window.setTimeout(mountGiscus, 800);
  }

  function observeTheme() {
    if (!document.body || themeObserver) return;

    themeObserver = new MutationObserver(function () {
      syncGiscusAppearance();
    });

    themeObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  function init() {
    updateStaticTexts();
    observeContainer();
    observeTheme();
  }

  window.addEventListener('site:langchange', function () {
    updateStaticTexts();
    syncGiscusAppearance();
  });

  window.SocialComments = {
    init,
    mountGiscus,
    syncGiscusAppearance
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('load', init, { once: true });
})();
