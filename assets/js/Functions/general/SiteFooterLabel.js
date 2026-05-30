(function () {
  'use strict';

  const CONFIG = {
    stylesheet: './assets/css/components/site-footer-label.css',

    repositoryApi: 'https://api.github.com/repos/Stardust-math/Stardust-math.github.io',
    githubProfile: 'https://github.com/Stardust-math',

    copyright: 'Copyright © 2026 Jinghao Chen',
    quote: 'You have reached the end of this page, but not the end of the journey.',

    /*
      GitHub Pages paths are case-sensitive.
      Keep these filenames exactly the same as the uploaded files.

      SVG is tried first. PNG is used only if SVG fails.
    */
    emblemSvg: './assets/images/labels/USTC.svg',
    emblemPng: './assets/images/labels/USTC.png',

    targetPageIds: [
      'resume',
      'schedule',
      'social',
      'toolkit',
      'life'
    ],

    cacheKey: 'site-footer-label:last-updated',
    cacheTTL: 24 * 60 * 60 * 1000
  };

  let stylesheetLoaded = false;
  let initialized = false;
  let mutationObserver = null;
  let ensureTimer = 0;
  let footerHydrationStarted = false;
  let lastUpdatedPromise = null;

  function runWhenIdle(callback, timeout) {
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(callback, {
        timeout: timeout || 1200
      });
      return;
    }

    window.setTimeout(callback, Math.min(timeout || 600, 600));
  }

  function loadStylesheet() {
    if (stylesheetLoaded) return;

    stylesheetLoaded = true;

    if (document.querySelector('link[data-site-footer-label-style="1"]')) {
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = CONFIG.stylesheet;
    link.setAttribute('data-site-footer-label-style', '1');

    document.head.appendChild(link);
  }

  function escapeText(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatDate(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function readCachedUpdate() {
    try {
      const raw = localStorage.getItem(CONFIG.cacheKey);
      if (!raw) return '';

      const cached = JSON.parse(raw);

      if (
        !cached ||
        !cached.value ||
        !cached.savedAt ||
        Date.now() - cached.savedAt > CONFIG.cacheTTL
      ) {
        return '';
      }

      return cached.value;
    } catch (e) {
      return '';
    }
  }

  function writeCachedUpdate(value) {
    try {
      localStorage.setItem(CONFIG.cacheKey, JSON.stringify({
        value,
        savedAt: Date.now()
      }));
    } catch (e) {}
  }

  function fetchLastUpdated() {
    const cached = readCachedUpdate();

    if (cached) {
      return Promise.resolve(cached);
    }

    if (lastUpdatedPromise) {
      return lastUpdatedPromise;
    }

    lastUpdatedPromise = fetch(CONFIG.repositoryApi, {
      method: 'GET',
      headers: {
        Accept: 'application/vnd.github+json'
      }
    })
      .then((response) => {
        if (!response.ok) return '';
        return response.json();
      })
      .then((data) => {
        const value = formatDate(data && (data.pushed_at || data.updated_at));

        if (value) {
          writeCachedUpdate(value);
        }

        return value;
      })
      .catch(() => '');

    return lastUpdatedPromise;
  }

  function githubIconSvg() {
    return [
      '<svg class="site-footer-label__github-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">',
      '<path fill="currentColor" d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.93.58.11.79-.25.79-.56v-2.15c-3.2.7-3.88-1.37-3.88-1.37-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.23-1.27-5.23-5.67 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.16 1.17A10.9 10.9 0 0 1 12 6.05c.98 0 1.96.13 2.88.39 2.19-1.48 3.15-1.17 3.15-1.17.63 1.58.24 2.75.12 3.04.74.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.38-5.25 5.66.41.36.78 1.06.78 2.14v3.18c0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"/>',
      '</svg>'
    ].join('');
  }

  function createFooter() {
    const footer = document.createElement('footer');
    footer.className = 'site-footer-label';
    footer.setAttribute('aria-label', 'Site footer');
    footer.dataset.siteFooterLabel = '1';

    footer.innerHTML = [
      '<div class="site-footer-label__left">',
      '  <img class="site-footer-label__emblem is-hidden" alt="School emblem" decoding="async" loading="lazy" fetchpriority="low">',
      '</div>',

      '<div class="site-footer-label__center">',
      `  <div class="site-footer-label__copyright">${escapeText(CONFIG.copyright)}</div>`,
      `  <div class="site-footer-label__quote">${escapeText(CONFIG.quote)}</div>`,
      '  <div class="site-footer-label__updated">Last updates: <span data-site-footer-updated>Loading...</span></div>',
      '</div>',

      '<div class="site-footer-label__right">',
      `  <a class="site-footer-label__github-link" href="${CONFIG.githubProfile}" target="_blank" rel="noopener noreferrer" aria-label="Open GitHub profile">`,
      `    ${githubIconSvg()}`,
      '    <span>GitHub</span>',
      '  </a>',
      '</div>'
    ].join('');

    return footer;
  }

  function getFooterHost(page) {
    if (!page) return null;

    return (
      page.querySelector(':scope > .container') ||
      page.querySelector(':scope > .resume-container') ||
      page.querySelector(':scope > .social-container') ||
      page.querySelector(':scope > .life-container') ||
      page
    );
  }

  function ensureFooterForPage(page) {
    if (!page) return;

    const host = getFooterHost(page);
    if (!host) return;

    if (host.querySelector(':scope > .site-footer-label')) {
      page.dataset.footerLabelReady = '1';
      return;
    }

    loadStylesheet();

    const footer = createFooter();
    host.appendChild(footer);

    page.dataset.footerLabelReady = '1';

    observeFooterVisibility(footer);
  }

  function ensureAllFooters() {
    CONFIG.targetPageIds.forEach((id) => {
      const page = document.getElementById(id);

      if (page) {
        ensureFooterForPage(page);
      }
    });
  }

  function scheduleEnsureAllFooters() {
    if (ensureTimer) {
      window.clearTimeout(ensureTimer);
    }

    ensureTimer = window.setTimeout(() => {
      ensureTimer = 0;

      runWhenIdle(() => {
        ensureAllFooters();
      }, 1000);
    }, 120);
  }

  function hydrateVisibleFooters() {
    if (footerHydrationStarted) return;

    footerHydrationStarted = true;

    runWhenIdle(() => {
      const footers = Array.from(document.querySelectorAll('.site-footer-label'));

      footers.forEach((footer) => {
        const emblem = footer.querySelector('.site-footer-label__emblem');
        if (!emblem || emblem.src) return;

        emblem.onerror = () => {
          if (emblem.dataset.triedPng === '1') {
            emblem.classList.add('is-hidden');
            return;
          }

          emblem.dataset.triedPng = '1';
          emblem.src = CONFIG.emblemPng;
        };

        emblem.onload = () => {
          emblem.classList.remove('is-hidden');
        };

        emblem.src = CONFIG.emblemSvg;
      });

      fetchLastUpdated().then((dateText) => {
        footers.forEach((footer) => {
          const updated = footer.querySelector('[data-site-footer-updated]');
          if (!updated) return;

          updated.textContent = dateText || 'Unavailable';
        });
      });
    }, 1500);
  }

  function observeFooterVisibility(footer) {
    if (!footer) return;

    if (typeof IntersectionObserver !== 'function') {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        observer.disconnect();
        hydrateVisibleFooters();
      });
    }, {
      root: null,
      rootMargin: '360px 0px',
      threshold: 0
    });

    observer.observe(footer);
  }

  function observePageCreation() {
    if (mutationObserver) return;

    mutationObserver = new MutationObserver(() => {
      scheduleEnsureAllFooters();
    });

    mutationObserver.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  function init() {
    if (initialized) return;

    initialized = true;

    scheduleEnsureAllFooters();
    observePageCreation();

    window.addEventListener('site:langchange', scheduleEnsureAllFooters);
  }

  window.SiteFooterLabel = {
    init,
    ensureAllFooters,
    ensureFooterForPage,
    fetchLastUpdated
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
