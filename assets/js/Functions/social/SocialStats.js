(function () {
  'use strict';

  const GC_SITE = 'https://stardust.goatcounter.com';

  const CLUSTRMAPS_TOKEN = 'JNHdsUlsgFLa9cs6tAwlyymTImAhTyfKPyc_DG4MDX8';
  const CLUSTRMAPS_COLOR = 'ffffff';
  const CLUSTRMAPS_WIDTH = '800';

  const CLUSTRMAPS_SCRIPT_SRC =
    'https://clustrmaps.com/map_v2.js?d=' +
    encodeURIComponent(CLUSTRMAPS_TOKEN) +
    '&cl=' +
    encodeURIComponent(CLUSTRMAPS_COLOR) +
    '&w=' +
    encodeURIComponent(CLUSTRMAPS_WIDTH);

  let statsStarted = false;
  let statsFinished = false;
  let goatCounterFrameStarted = false;
  let clustrMapsStarted = false;
  let visibleObserver = null;
  let delayedLoadTimer = null;
  let fallbackTimer = null;

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

  function getClustrMapsPlaceholder() {
    return document.getElementById('clustrmaps-placeholder');
  }

  function markClustrMapsLoaded() {
    const placeholder = getClustrMapsPlaceholder();
    if (!placeholder) return;

    placeholder.classList.add('is-loaded');
    placeholder.classList.remove('is-loading');

    if (fallbackTimer) {
      clearTimeout(fallbackTimer);
      fallbackTimer = null;
    }
  }

  function markClustrMapsFallback() {
    const placeholder = getClustrMapsPlaceholder();
    if (!placeholder) return;

    if (placeholder.classList.contains('is-loaded')) return;

    placeholder.classList.remove('is-loading');
    placeholder.classList.add('is-fallback');

    const fallback = document.createElement('div');
    fallback.className = 'clustrmaps-fallback';
    fallback.innerHTML =
      '<p>Visitor map may be blocked by the browser, privacy settings, or an extension.</p>' +
      '<a href="https://clustrmaps.com/" target="_blank" rel="noopener noreferrer">Open ClustrMaps</a>';

    placeholder.textContent = '';
    placeholder.appendChild(fallback);
  }

  function createClustrMapsFrameHtml() {
    return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<base target="_blank">
<style>
  html,
  body {
    width: 100%;
    min-height: 320px;
    margin: 0;
    padding: 0;
    background: transparent;
    overflow: hidden;
  }

  body {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  a,
  img,
  canvas,
  svg {
    max-width: 100% !important;
  }

  img {
    height: auto !important;
    border: 0;
  }
</style>
</head>
<body>
  <script>
    window.addEventListener('load', function () {
      try {
        parent.postMessage({ type: 'stardust-clustrmaps-loaded' }, '*');
      } catch (e) {}
    });
  <\/script>
  <script type="text/javascript" id="clustrmaps" src="${CLUSTRMAPS_SCRIPT_SRC}"><\/script>
</body>
</html>`;
  }

  function mountClustrMapsScript() {
    const placeholder = getClustrMapsPlaceholder();
    if (!placeholder) return;

    if (clustrMapsStarted && placeholder.querySelector('.clustrmaps-frame')) {
      return;
    }

    clustrMapsStarted = true;

    if (fallbackTimer) {
      clearTimeout(fallbackTimer);
      fallbackTimer = null;
    }

    placeholder.textContent = '';
    placeholder.classList.remove('is-loaded', 'is-fallback');
    placeholder.classList.add('is-loading');

    const frame = document.createElement('iframe');
    frame.className = 'clustrmaps-frame';
    frame.title = 'ClustrMaps visitor map';
    frame.loading = 'lazy';
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.setAttribute('scrolling', 'no');

    /*
      Do not add a strict sandbox here.
      ClustrMaps' script may use document.write or related layout logic,
      and an over-restrictive sandbox can make the map render as a blank area.
    */
    frame.srcdoc = createClustrMapsFrameHtml();

    frame.addEventListener('load', () => {
      setTimeout(markClustrMapsLoaded, 500);
    }, { once: true });

    placeholder.appendChild(frame);

    fallbackTimer = window.setTimeout(markClustrMapsFallback, 6500);
  }

  function scheduleVisibleResourceLoad() {
    if (delayedLoadTimer) return;

    delayedLoadTimer = window.setTimeout(() => {
      delayedLoadTimer = null;

      if (!socialIsVisible()) return;

      mountClustrMapsScript();

      window.setTimeout(() => {
        if (!socialIsVisible()) return;

        if (!statsFinished) {
          initStats();
        }
      }, 120);

      window.setTimeout(() => {
        if (!socialIsVisible()) return;

        loadGoatCounterFrame();
      }, 900);
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

  window.addEventListener('message', (event) => {
    if (!event || !event.data || event.data.type !== 'stardust-clustrmaps-loaded') {
      return;
    }

    markClustrMapsLoaded();
  });

  window.SocialStats = {
    enter,
    refresh,
    initVisibleResources,
    initStats,
    loadGoatCounterFrame,
    mountClustrMapsScript
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
