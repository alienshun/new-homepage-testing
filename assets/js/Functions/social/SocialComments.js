(function () {
  'use strict';

  const GISCUS_CONFIG = {
    repo: 'Stardust-math/Stardust-math.github.io',
    repoId: 'R_kgDOPFvFdg',
    mapping: 'number',
    term: '2',
    reactionsEnabled: '1',
    emitMetadata: '1',
    inputPosition: 'top',
    loading: 'lazy',
    discussionUrl: 'https://github.com/Stardust-math/Stardust-math.github.io/discussions/2'
  };

  const GISCUS_ORIGIN = 'https://giscus.app';

  let giscusLoaded = false;
  let containerObserver = null;
  let themeObserver = null;
  let lastDiscussion = null;

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

  function interpolate(template, values) {
    return String(template || '').replace(/\{(\w+)\}/g, function (_, key) {
      return values && values[key] != null ? String(values[key]) : '';
    });
  }

  function formatDate(value) {
    if (!value) return '';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    try {
      return new Intl.DateTimeFormat(getLang() === 'zh' ? 'zh-CN' : 'en', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date);
    } catch (e) {
      return date.toISOString().slice(0, 10);
    }
  }

  function getCommentCount(discussion) {
    if (!discussion || typeof discussion !== 'object') return null;

    if (typeof discussion.totalCommentCount === 'number') {
      return discussion.totalCommentCount;
    }

    if (discussion.comments && typeof discussion.comments.totalCount === 'number') {
      return discussion.comments.totalCount;
    }

    if (typeof discussion.totalReplyCount === 'number') {
      return discussion.totalReplyCount;
    }

    return null;
  }

  function updateMetadata(discussion) {
    if (discussion && typeof discussion === 'object') {
      lastDiscussion = discussion;
    }

    const target = document.getElementById('giscus-meta');
    if (!target || !lastDiscussion) return;

    const dict = getSocialDict();
    const pieces = [];

    const count = getCommentCount(lastDiscussion);
    if (typeof count === 'number') {
      const key = count === 1 ? 'comments_count_one' : 'comments_count_many';
      const fallback = getLang() === 'zh' ? '{count} 条留言' : '{count} comments';
      pieces.push(interpolate(dict[key] || fallback, { count }));
    }

    const updatedAt = lastDiscussion.updatedAt || lastDiscussion.lastEditedAt || '';
    const dateText = formatDate(updatedAt);
    if (dateText) {
      const fallback = getLang() === 'zh' ? '最近更新 {date}' : 'Updated {date}';
      pieces.push(interpolate(dict.comments_updated || fallback, { date: dateText }));
    }

    target.textContent = pieces.length ? ' · ' + pieces.join(' · ') : '';
  }

  function updateStaticTexts() {
    const container = document.getElementById('giscus-container');
    if (!container) return;

    const loading = document.getElementById('giscus-loading');
    const dict = getSocialDict();

    if (loading && dict.comments_loading) {
      loading.textContent = dict.comments_loading;
    }

    updateMetadata(lastDiscussion);
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
      lang: getGiscusLang()
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

  window.addEventListener('message', function (event) {
    if (!event || event.origin !== GISCUS_ORIGIN) return;

    const data = event.data;
    if (!data || !data.giscus) return;

    if (data.giscus.discussion) {
      updateMetadata(data.giscus.discussion);
    }
  });

  window.addEventListener('site:langchange', function () {
    updateStaticTexts();
    syncGiscusAppearance();
  });

  window.SocialComments = {
    init,
    mountGiscus,
    updateMetadata,
    syncGiscusAppearance
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('load', init, { once: true });
})();
