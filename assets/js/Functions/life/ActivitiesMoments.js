(function () {
  'use strict';

  const STATE = {
    initialized: false,
    mode: 'list',
    dateKey: null
  };

  const INLINE_EMOTES = {
    '[旺柴]': {
      className: 'am-emote-wangchai',
      label: '旺柴',
      text: '🐶'
    },
    '[叹气]': {
      className: 'am-emote-sigh',
      label: '叹气',
      text: '😮‍💨'
    },
    '[苦涩]': {
      className: 'am-emote-bitter',
      label: '苦涩',
      text: '🥲'
    }
  };

  function getMount() {
    return document.getElementById('mount-activities_moments');
  }

  function getLang() {
    if (window.SiteLang && typeof window.SiteLang.getLang === 'function') {
      return window.SiteLang.getLang() === 'zh' ? 'zh' : 'en';
    }

    return document.body && document.body.dataset.lang === 'zh' ? 'zh' : 'en';
  }

  function getData(lang) {
    const current = lang === 'zh'
      ? window.ACTIVITIES_MOMENTS_ZH
      : window.ACTIVITIES_MOMENTS_EN;

    if (current && Array.isArray(current.moments)) {
      return current;
    }

    return {
      ui: {},
      moments: []
    };
  }

  function getFallbackData(lang) {
    const fallbackLang = lang === 'zh' ? 'en' : 'zh';
    return getData(fallbackLang);
  }

  function getUi() {
    const lang = getLang();
    const primary = getData(lang).ui || {};
    const fallback = getFallbackData(lang).ui || {};

    return Object.assign({
      viewMoment: lang === 'zh' ? '观此一瞬' : 'View Moment',
      backToMoments: lang === 'zh' ? '返回行迹' : 'Back to Moments',
      close: lang === 'zh' ? '关闭' : 'Close',
      openImage: lang === 'zh' ? '查看图片' : 'Open image'
    }, fallback, primary);
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderInlineText(value) {
    const raw = String(value == null ? '' : value);
    const tokens = Object.keys(INLINE_EMOTES);

    if (!tokens.some((token) => raw.includes(token))) {
      return escapeHtml(raw);
    }

    const pattern = /(\[旺柴\]|\[叹气\]|\[苦涩\])/g;

    return raw.split(pattern).map((part) => {
      const emote = INLINE_EMOTES[part];

      if (!emote) {
        return escapeHtml(part);
      }

      return '<span class="am-emote ' + emote.className + '" role="img" aria-label="' +
        escapeHtml(emote.label) + '" title="' + escapeHtml(emote.label) + '">' +
        escapeHtml(emote.text) +
        '</span>';
    }).join('');
  }

  function normalizePath(pathname) {
    return String(pathname || '/')
      .replace(/index\.html$/, '')
      .replace(/\/+$/, '') || '/';
  }

  function getLifeBaseUrl() {
    return new URL('life/', document.baseURI);
  }

  function getListRoute() {
    return new URL('activities_moments/', getLifeBaseUrl()).pathname;
  }

  function getDetailRoute(dateKey) {
    return new URL('activities_moments/' + encodeURIComponent(dateKey) + '/', getLifeBaseUrl()).pathname;
  }

  function pushRoute(path, replace) {
    if (!window.history || typeof window.history.pushState !== 'function') return;

    const current = normalizePath(window.location.pathname);
    const next = normalizePath(path);

    if (current === next) return;

    const method = replace ? 'replaceState' : 'pushState';
    window.history[method]({ path }, '', path);
  }

  function resolveDateKeyFromPath(pathname) {
    const parts = normalizePath(pathname || window.location.pathname)
      .split('/')
      .filter(Boolean);

    const lifeIndex = parts.indexOf('life');
    if (lifeIndex < 0) return null;

    const sub = parts[lifeIndex + 1];
    const dateKey = parts[lifeIndex + 2];

    if (sub !== 'activities_moments') return null;
    if (!dateKey) return null;

    try {
      return decodeURIComponent(dateKey);
    } catch (e) {
      return dateKey;
    }
  }

  function sortMoments(moments) {
    return moments.slice().sort((a, b) => {
      const da = Date.parse(a.dateISO || '');
      const db = Date.parse(b.dateISO || '');

      if (Number.isFinite(db) && Number.isFinite(da) && db !== da) {
        return db - da;
      }

      return String(b.dateKey || '').localeCompare(String(a.dateKey || ''));
    });
  }

  function getSortedMoments() {
    const lang = getLang();
    const data = getData(lang);
    return sortMoments(Array.isArray(data.moments) ? data.moments : []);
  }

  function getMomentByKey(dateKey) {
    const lang = getLang();
    const primary = getData(lang).moments || [];
    const fallback = getFallbackData(lang).moments || [];

    return primary.find((item) => item && item.dateKey === dateKey)
      || fallback.find((item) => item && item.dateKey === dateKey)
      || null;
  }

  function getMetaText(moment) {
    const pieces = [];

    if (moment.location) pieces.push(moment.location);
    if (moment.occasion) pieces.push(moment.occasion);
    if (moment.subtitle && !moment.location && !moment.occasion) pieces.push(moment.subtitle);

    return pieces.join(' · ');
  }

  function renderMomentIndex(currentDateKey) {
    if (
      window.ActivitiesMomentsIndex
      && typeof window.ActivitiesMomentsIndex.render === 'function'
    ) {
      return window.ActivitiesMomentsIndex.render(getSortedMoments(), currentDateKey);
    }

    return '';
  }

  function syncMomentIndex() {
    const mount = getMount();

    if (
      mount
      && window.ActivitiesMomentsIndex
      && typeof window.ActivitiesMomentsIndex.scheduleSync === 'function'
    ) {
      window.ActivitiesMomentsIndex.scheduleSync(mount);
    }
  }

  function renderCard(moment, index, ui) {
    const rawDateKey = moment.dateKey || '';
    const dateKey = escapeHtml(rawDateKey);
    const dateLabel = escapeHtml(moment.dateLabel || moment.dateISO || moment.dateKey || '');
    const title = escapeHtml(moment.title || '');
    const meta = escapeHtml(getMetaText(moment));
    const summary = renderInlineText(moment.summary || '');
    const cover = moment.cover ? escapeHtml(moment.cover) : '';
    const action = escapeHtml(ui.viewMoment);
    const detailHref = escapeHtml(getDetailRoute(rawDateKey));

    const fetchPriority = index === 0 ? ' fetchpriority="high"' : '';
    const loading = index === 0 ? 'eager' : 'lazy';

    const media = cover
      ? `
        <div class="am-card-media">
          <img
            src="${cover}"
            alt="${title}"
            loading="${loading}"
            decoding="async"${fetchPriority}
          >
          <div class="am-card-date">${dateLabel}</div>
        </div>
      `
      : `
        <div class="am-card-media" aria-hidden="true">
          <div class="am-card-date">${dateLabel}</div>
        </div>
      `;

    return `
      <article class="am-card" data-date-key="${dateKey}">
        ${media}
        <div class="am-card-body">
          <h3 class="am-card-title">${title}</h3>
          ${meta ? `<p class="am-card-meta">${meta}</p>` : ''}
          ${summary ? `<p class="am-card-summary">${summary}</p>` : ''}
          <a
            class="am-card-action"
            href="${detailHref}"
            data-am-action="view"
            data-date-key="${dateKey}"
            data-cursor="precise_select"
            data-cursor-fallback="pointer"
          >${action}</a>
        </div>
      </article>
    `;
  }

  function renderListHtml() {
    const ui = getUi();
    const moments = getSortedMoments();

    if (!moments.length) {
      return '<div class="activities_moments is-empty"></div>';
    }

    return `
      <div class="activities_moments" data-am-view="list">
        <div class="am-card-grid">
          ${moments.map((moment, index) => renderCard(moment, index, ui)).join('')}
        </div>
      </div>
    `;
  }

  function renderGallery(moment, ui) {
    const gallery = Array.isArray(moment.gallery) ? moment.gallery : [];
    if (!gallery.length) return '';

    return `
      <div class="am-gallery">
        ${gallery.map((src, index) => {
          const safeSrc = escapeHtml(src);
          const alt = escapeHtml((moment.title || '') + ' ' + (index + 1));

          return `
            <button
              class="am-gallery-item"
              type="button"
              data-am-image="${safeSrc}"
              aria-label="${escapeHtml(ui.openImage)}"
              data-cursor="precise_select"
              data-cursor-fallback="zoom-in"
            >
              <img src="${safeSrc}" alt="${alt}" loading="lazy" decoding="async">
            </button>
          `;
        }).join('')}
      </div>
    `;
  }

  function renderDetailHtml(moment) {
    const ui = getUi();

    const dateLabel = escapeHtml(moment.dateLabel || moment.dateISO || moment.dateKey || '');
    const title = escapeHtml(moment.title || '');
    const meta = escapeHtml(getMetaText(moment));
    const cover = moment.cover ? escapeHtml(moment.cover) : '';
    const backHref = escapeHtml(getListRoute());
    const currentDateKey = moment.dateKey || '';

    const body = Array.isArray(moment.body) ? moment.body : [];
    const bodyHtml = body
      .map((paragraph) => `<p>${renderInlineText(paragraph)}</p>`)
      .join('');

    const hero = cover
      ? `<img src="${cover}" alt="${title}" loading="eager" decoding="async" fetchpriority="high">`
      : '';

    return `
      <div class="activities_moments am-detail" data-am-view="detail" data-date-key="${escapeHtml(currentDateKey)}">
        <article class="am-detail-card">
          <header class="am-detail-hero">
            ${hero}
            <div class="am-detail-head">
              <div class="am-detail-date">${dateLabel}</div>
              <h2 class="am-detail-title">${title}</h2>
              ${meta ? `<p class="am-detail-meta">${meta}</p>` : ''}
            </div>
          </header>

          <div class="am-detail-layout">
            ${renderMomentIndex(currentDateKey)}

            <div class="am-detail-content">
              ${bodyHtml ? `<div class="am-detail-body">${bodyHtml}</div>` : ''}
              ${renderGallery(moment, ui)}

              <div class="am-detail-footer">
                <a
                  class="am-detail-back"
                  href="${backHref}"
                  data-am-action="back"
                  data-cursor="precise_select"
                  data-cursor-fallback="pointer"
                >${escapeHtml(ui.backToMoments)}</a>
              </div>
            </div>
          </div>
        </article>
      </div>
    `;
  }

  function bindEvents() {
    const mount = getMount();
    if (!mount || mount.dataset.activitiesMomentsBound === '1') return;

    mount.dataset.activitiesMomentsBound = '1';

    mount.addEventListener('click', (event) => {
      const back = event.target.closest('[data-am-action="back"]');
      if (back) {
        event.preventDefault();
        showList({ updateHistory: true });
        return;
      }

      const view = event.target.closest('[data-am-action="view"][data-date-key]');
      if (view) {
        event.preventDefault();

        const dateKey = view.getAttribute('data-date-key');
        if (dateKey) {
          showDetail(dateKey, { updateHistory: true });
        }
        return;
      }

      const imageButton = event.target.closest('[data-am-image]');
      if (imageButton) {
        event.preventDefault();
        openLightbox(imageButton.getAttribute('data-am-image'));
      }
    });

    mount.addEventListener('keydown', (event) => {
      if (event.key !== ' ' && event.key !== 'Spacebar') return;

      const back = event.target.closest('[data-am-action="back"]');
      if (back) {
        event.preventDefault();
        showList({ updateHistory: true });
        return;
      }

      const view = event.target.closest('[data-am-action="view"][data-date-key]');
      if (view) {
        event.preventDefault();

        const dateKey = view.getAttribute('data-date-key');
        if (dateKey) {
          showDetail(dateKey, { updateHistory: true });
        }
      }
    });
  }

  function showList(options) {
    const opts = options || {};
    const mount = getMount();
    if (!mount) return;

    STATE.mode = 'list';
    STATE.dateKey = null;

    mount.innerHTML = renderListHtml();
    bindEvents();

    if (opts.updateHistory) {
      pushRoute(getListRoute(), opts.replaceHistory);
    }

    if (opts.scroll !== false) {
      scrollToMount();
    }
  }

  function showDetail(dateKey, options) {
    const opts = options || {};
    const mount = getMount();
    if (!mount) return;

    const moment = getMomentByKey(dateKey);

    if (!moment) {
      showList({
        updateHistory: opts.updateHistory,
        replaceHistory: true,
        scroll: opts.scroll
      });
      return;
    }

    STATE.mode = 'detail';
    STATE.dateKey = dateKey;

    mount.innerHTML = renderDetailHtml(moment);
    bindEvents();
    syncMomentIndex();

    if (opts.updateHistory) {
      pushRoute(getDetailRoute(dateKey), opts.replaceHistory);
    }

    if (opts.scroll !== false) {
      scrollToMount();
    }
  }

  function scrollToMount() {
    const section = document.getElementById('activities_moments-section');
    const target = section || getMount();

    if (!target) return;

    try {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (e) {}
  }

  function renderCurrent(options) {
    const opts = options || {};
    const dateKeyFromPath = resolveDateKeyFromPath(window.location.pathname);

    if (dateKeyFromPath) {
      showDetail(dateKeyFromPath, {
        updateHistory: false,
        scroll: opts.scroll
      });
      return;
    }

    if (STATE.mode === 'detail' && STATE.dateKey) {
      showDetail(STATE.dateKey, {
        updateHistory: false,
        scroll: opts.scroll
      });
      return;
    }

    showList({
      updateHistory: false,
      scroll: opts.scroll
    });
  }

  function syncWithLocation(options) {
    const opts = options || {};
    const dateKey = resolveDateKeyFromPath(window.location.pathname);

    if (dateKey) {
      showDetail(dateKey, {
        updateHistory: false,
        scroll: opts.scroll
      });
    } else {
      showList({
        updateHistory: false,
        scroll: opts.scroll
      });
    }
  }

  function openLightbox(src) {
    if (!src) return;

    closeLightbox();

    const ui = getUi();
    const box = document.createElement('div');
    box.className = 'am-lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');

    box.innerHTML = `
      <button class="am-lightbox-close" type="button" aria-label="${escapeHtml(ui.close)}">×</button>
      <img src="${escapeHtml(src)}" alt="">
    `;

    box.addEventListener('click', (event) => {
      if (
        event.target === box
        || event.target.classList.contains('am-lightbox-close')
      ) {
        closeLightbox();
      }
    });

    document.body.appendChild(box);

    const onKey = (event) => {
      if (event.key === 'Escape') {
        closeLightbox();
        document.removeEventListener('keydown', onKey);
      }
    };

    document.addEventListener('keydown', onKey);
  }

  function closeLightbox() {
    const existing = document.querySelector('.am-lightbox');
    if (existing) existing.remove();
  }

  function init() {
    if (STATE.initialized) {
      renderCurrent({ scroll: false });
      return;
    }

    STATE.initialized = true;

    bindEvents();
    renderCurrent({ scroll: false });
  }

  window.ActivitiesMoments = {
    init,
    renderCurrent,
    showList,
    showDetail,
    syncWithLocation,
    getSortedMoments,
    getMomentByKey,
    getListRoute,
    getDetailRoute,
    resolveDateKeyFromPath
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
