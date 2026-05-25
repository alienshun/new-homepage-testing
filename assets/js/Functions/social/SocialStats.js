(function () {
  'use strict';

  const GC_SITE = 'https://stardust.goatcounter.com';
  const CLUSTRMAPS_SCRIPT_ID = 'clustrmaps';
  const CLUSTRMAPS_SRC = 'https://clustrmaps.com/map_v2.js?d=JNHdsUlsgFLa9cs6tAwlyymTImAhTyfKPyc_DG4MDX8&cl=ffffff&w=800';

  let statsStarted = false;
  let statsFinished = false;
  let goatCounterFrameStarted = false;
  let clustrMapsStarted = false;
  let visibleObserver = null;

  function getSocialRoot() {
    return document.getElementById('social');
  }

  function ensureSocialRoot() {
    let social = getSocialRoot();

    if (!social && window.SocialRender && typeof window.SocialRender.renderSocialPage === 'function') {
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
      el.title = 'GoatCounter visitor-counter may be disabled in settings.';
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

      statsFinished = true;
    } catch (e) {
      setStatsFallback();
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

  function bumpClustrMapsLayout() {
    const bump = () => window.dispatchEvent(new Event('resize'));

    requestAnimationFrame(bump);
    setTimeout(bump, 200);
    setTimeout(bump, 600);
  }

  function mountClustrMapsScript() {
    if (clustrMapsStarted) {
      bumpClustrMapsLayout();
      return;
    }

    const placeholder = document.getElementById('clustrmaps-placeholder');
    if (!placeholder) return;

    if (document.getElementById(CLUSTRMAPS_SCRIPT_ID)) {
      clustrMapsStarted = true;
      bumpClustrMapsLayout();
      return;
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.id = CLUSTRMAPS_SCRIPT_ID;
    script.src = CLUSTRMAPS_SRC;
    script.async = true;

    script.addEventListener('load', bumpClustrMapsLayout, { once: true });
    placeholder.replaceWith(script);

    clustrMapsStarted = true;
    bumpClustrMapsLayout();
  }

  function initVisibleResources() {
    ensureSocialRoot();

    if (!socialIsVisible()) {
      return false;
    }

    loadGoatCounterFrame();
    mountClustrMapsScript();

    if (!statsFinished) {
      initStats();
    }

    bumpClustrMapsLayout();

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
    mountClustrMapsScript,
    bumpClustrMapsLayout
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
