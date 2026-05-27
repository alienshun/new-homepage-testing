(function () {
  'use strict';

  const GC_SITE = 'https://stardust.goatcounter.com';

  const CLUSTRMAPS_TOKEN = 'JNHdsUlsgFLa9cs6tAwlyymTImAhTyfKPyc_DG4MDX8';
  const CLUSTRMAPS_COLOR = 'ffffff';
  const CLUSTRMAPS_WIDTH = '800';

  const CLUSTRMAPS_IMAGE_SRC =
    'https://clustrmaps.com/map_v2.png?d=' +
    encodeURIComponent(CLUSTRMAPS_TOKEN) +
    '&cl=' +
    encodeURIComponent(CLUSTRMAPS_COLOR) +
    '&w=' +
    encodeURIComponent(CLUSTRMAPS_WIDTH);

  const CLUSTRMAPS_SCRIPT_SRC =
    'https://clustrmaps.com/map_v2.js?d=' +
    encodeURIComponent(CLUSTRMAPS_TOKEN) +
    '&cl=' +
    encodeURIComponent(CLUSTRMAPS_COLOR) +
    '&w=' +
    encodeURIComponent(CLUSTRMAPS_WIDTH);

  const CLUSTRMAPS_LINK = 'https://clustrmaps.com/';

  let statsStarted = false;
  let statsFinished = false;
  let goatCounterFrameStarted = false;
  let clustrMapsStarted = false;
  let clustrMapsMode = '';
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

  function getClustrMapsPlaceholder() {
    return document.getElementById('clustrmaps-placeholder');
  }

  function escapeHtmlAttr(value) {
    return String(value).replace(/[&<>"']/g, (ch) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[ch]);
  }

  function createClustrMapsIframeSrcdoc() {
    const scriptSrc = escapeHtmlAttr(CLUSTRMAPS_SCRIPT_SRC);
    const imageSrc = escapeHtmlAttr(CLUSTRMAPS_IMAGE_SRC);
    const linkHref = escapeHtmlAttr(CLUSTRMAPS_LINK);

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
    font-family: Georgia, "Times New Roman", serif;
  }

  a {
    display: inline-block;
    max-width: 100%;
  }

  img {
    display: block;
    max-width: 100%;
    height: auto;
    border: 0;
  }

  .fallback {
    padding: 12px;
    text-align: center;
  }
</style>
</head>
<body>
  <script type="text/javascript" id="clustrmaps" src="${scriptSrc}"><\/script>
  <noscript>
    <div class="fallback">
      <a href="${linkHref}" rel="noopener noreferrer">
        <img src="${imageSrc}" alt="ClustrMaps visitor map">
      </a>
    </div>
  </noscript>
</body>
</html>`;
  }

  function mountClustrMapsIframe(placeholder) {
    if (!placeholder) return;

    placeholder.textContent = '';

    const iframe = document.createElement('iframe');
    iframe.className = 'clustrmaps-frame';
    iframe.title = 'ClustrMaps visitor map';
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('sandbox', 'allow-scripts allow-popups allow-popups-to-escape-sandbox');

    if ('srcdoc' in iframe) {
      iframe.srcdoc = createClustrMapsIframeSrcdoc();
    } else {
      iframe.src = 'data:text/html;charset=utf-8,' + encodeURIComponent(createClustrMapsIframeSrcdoc());
    }

    iframe.addEventListener('load', bumpClustrMapsLayout, { once: true });

    placeholder.appendChild(iframe);

    clustrMapsStarted = true;
    clustrMapsMode = 'iframe';

    bumpClustrMapsLayout();
  }

  function mountClustrMapsImage(placeholder) {
    if (!placeholder) return;

    placeholder.textContent = '';

    const link = document.createElement('a');
    link.className = 'clustrmaps-link';
    link.href = CLUSTRMAPS_LINK;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', 'Open ClustrMaps visitor map');

    const image = document.createElement('img');
    image.className = 'clustrmaps-map';
    image.src = CLUSTRMAPS_IMAGE_SRC;
    image.alt = 'ClustrMaps visitor map';
    image.loading = 'lazy';
    image.decoding = 'async';

    image.addEventListener('load', () => {
      image.dataset.loaded = '1';
      bumpClustrMapsLayout();
    }, { once: true });

    image.addEventListener('error', () => {
      mountClustrMapsIframe(placeholder);
    }, { once: true });

    link.appendChild(image);
    placeholder.appendChild(link);

    clustrMapsStarted = true;
    clustrMapsMode = 'image';

    setTimeout(() => {
      if (
        clustrMapsMode === 'image' &&
        image.dataset.loaded !== '1' &&
        (!image.complete || image.naturalWidth === 0)
      ) {
        mountClustrMapsIframe(placeholder);
      }
    }, 2600);

    bumpClustrMapsLayout();
  }

  function mountClustrMapsScript() {
    const placeholder = getClustrMapsPlaceholder();
    if (!placeholder) return;

    const hasMap =
      placeholder.querySelector('.clustrmaps-map') ||
      placeholder.querySelector('.clustrmaps-frame');

    if (clustrMapsStarted && hasMap) {
      bumpClustrMapsLayout();
      return;
    }

    clustrMapsStarted = false;
    clustrMapsMode = '';

    mountClustrMapsImage(placeholder);
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
