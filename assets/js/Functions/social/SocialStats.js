(function () {
  'use strict';

  const GC_SITE = 'https://stardust.goatcounter.com';
  const VISITOR_MAP_FRAME_SRC = './assets/vendor/mapmyvisitors-3d.html?v=20260607';

  let statsStarted = false;
  let statsFinished = false;
  let goatCounterFrameStarted = false;
  let visitorMapStarted = false;
  let visibleObserver = null;
  let delayedLoadTimer = null;

  function getSocialRoot() {
    return document.getElementById('social');
  }

  function ensureSocialRoot() {
    let social = getSocialRoot();

    if (
      !social &&
      window.SocialRender &&
      typeof window.SocialRender.renderSocialPage === 'function'
    ) {
      social = window.SocialRender.renderSocialPage();
    }

    return social || getSocialRoot();
  }

  function socialIsVisible() {
    const social = getSocialRoot();
    if (!social) return false;

    if (social.classList.contains('visible')) {
      return true;
    }

    try {
      const cs = window.getComputedStyle(social);
      return cs.display !== 'none' && social.offsetWidth > 0 && social.offsetHeight > 0;
    } catch (e) {
      return false;
    }
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function setStatsFallback() {
    ['gc-total', 'gc-month', 'gc-week', 'gc-page'].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      el.textContent = '—';
      el.title = 'GoatCounter visitor-counter may be disabled or blocked.';
    });
  }

  async function fetchCounter(path, start) {
    const qs = new URLSearchParams();
    if (start) qs.set('start', start);

    const url = `${GC_SITE}/counter/${encodeURIComponent(path)}.json${qs.toString() ? '?' + qs.toString() : ''}`;
    const response = await fetch(url, { mode: 'cors' });

    if (!response.ok) {
      throw new Error(`GoatCounter counter failed: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.count != null) {
      return data.count;
    }

    if (data && data.count_unique != null) {
      return data.count_unique;
    }

    return '—';
  }

  async function initStats() {
    if (statsStarted) return;

    statsStarted = true;

    try {
      const currentPath = window.location.pathname || '/';

      const [
        total,
        month,
        week,
        page
      ] = await Promise.all([
        fetchCounter('TOTAL'),
        fetchCounter('TOTAL', 'month'),
        fetchCounter('TOTAL', 'week'),
        fetchCounter(currentPath)
      ]);

      setText('gc-total', total);
      setText('gc-month', month);
      setText('gc-week', week);
      setText('gc-page', page);
    } catch (e) {
      setStatsFallback();
    } finally {
      statsFinished = true;
    }
  }

  function loadGoatCounterFrame() {
    if (goatCounterFrameStarted) return;

    const frame = document.querySelector('#social .goatcounter-frame');
    if (!frame) return;

    const src = frame.getAttribute('data-src');
    if (!src) return;

    if (!frame.getAttribute('src')) {
      frame.setAttribute('src', src);
    }

    goatCounterFrameStarted = true;
  }

  function getVisitorMapPlaceholder() {
    return document.getElementById('visitor-map-placeholder');
  }

  function mountVisitorMapFrame() {
    const placeholder = getVisitorMapPlaceholder();
    if (!placeholder) return;

    const existingFrame = placeholder.querySelector('.visitor-map-frame');

    if (visitorMapStarted && existingFrame) {
      return;
    }

    visitorMapStarted = true;

    placeholder.textContent = '';

    const frame = document.createElement('iframe');
    frame.className = 'visitor-map-frame';
    frame.title = 'Global visitor globe and map';
    frame.loading = 'lazy';
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.setAttribute('scrolling', 'no');
    frame.src = VISITOR_MAP_FRAME_SRC;

    placeholder.appendChild(frame);
  }

  function scheduleVisibleResourceLoad() {
    if (delayedLoadTimer) return;

    delayedLoadTimer = window.setTimeout(() => {
      delayedLoadTimer = null;

      if (!socialIsVisible()) return;

      mountVisitorMapFrame();

      window.setTimeout(() => {
        if (!socialIsVisible()) return;

        if (!statsFinished) {
          initStats();
        }
      }, 180);

      window.setTimeout(() => {
        if (!socialIsVisible()) return;

        loadGoatCounterFrame();
      }, 1200);
    }, 180);
  }

  function initVisibleResources() {
    ensureSocialRoot();

    if (!socialIsVisible()) {
      return false;
    }

    scheduleVisibleResourceLoad();

    return true;
  }

  function disconnectVisibleObserver() {
    if (!visibleObserver) return;

    visibleObserver.disconnect();
    visibleObserver = null;
  }

  function armWhenVisible() {
    const social = ensureSocialRoot();
    if (!social) return;

    if (initVisibleResources()) {
      disconnectVisibleObserver();
      return;
    }

    if (visibleObserver) return;

    visibleObserver = new MutationObserver(() => {
      if (initVisibleResources()) {
        disconnectVisibleObserver();
      }
    });

    visibleObserver.observe(social, {
      attributes: true,
      attributeFilter: ['class', 'style']
    });
  }

  function enter() {
    armWhenVisible();
  }

  function refresh() {
    armWhenVisible();
  }

  window.SocialStats = {
    enter,
    refresh,
    initVisibleResources,
    initStats,
    loadGoatCounterFrame,
    mountVisitorMapFrame
  };

  if (window.SitePages && typeof window.SitePages.register === 'function') {
    window.SitePages.register('social', {
      enter() {
        enter();
      },

      refresh() {
        refresh();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', armWhenVisible);
  } else {
    armWhenVisible();
  }

  window.addEventListener('load', () => {
    if (socialIsVisible()) {
      initVisibleResources();
    }
  }, { once: true });
})();