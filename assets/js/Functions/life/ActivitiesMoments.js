(function () {
  'use strict';

  const STATE = {
    initialized: false,
    mode: 'list',
    dateKey: null
  };

  const DETAIL_PROMISES = Object.create(null);

  const IMAGE_WARMUP = {
    started: false,
    running: false,
    queue: [],
    seen: Object.create(null),
    active: 0,
    loaded: 0,
    failed: 0,
    concurrency: 3,
    gap: 80,
    timeout: 30000
  };

  let detailRenderToken = 0;

  const INLINE_EMOTES = {
    '[旺柴]': {
      className: 'am-emote-wangchai',
      label: '旺柴',
      text: '🐶'
    },
    '[doge]': {
      className: 'am-emote-wangchai',
      label: 'doge',
      text: '🐶'
    },
    '[叹气]': {
      className: 'am-emote-sigh',
      label: '叹气',
      text: '😮‍💨'
    },
    '[sigh]': {
      className: 'am-emote-sigh',
      label: 'sigh',
      text: '😮‍💨'
    },
    '[苦涩]': {
      className: 'am-emote-bitter',
      label: '苦涩',
      text: '🥲'
    },
    '[bitter]': {
      className: 'am-emote-bitter',
      label: 'bitter',
      text: '🥲'
    },
    '[流泪]': {
      className: 'am-emote-crying',
      label: '流泪',
      text: '😭'
    },
    '[crying]': {
      className: 'am-emote-crying',
      label: 'crying',
      text: '😭'
    },
    '[捂脸]': {
      className: 'am-emote-bitter',
      label: '捂脸',
      text: '🤦'
    },
    '[facepalm]': {
      className: 'am-emote-bitter',
      label: 'facepalm',
      text: '🤦'
    },
    '[机智]': {
      className: 'am-emote-witty',
      label: '机智',
      text: '😏'
    },
    '[witty]': {
      className: 'am-emote-witty',
      label: 'witty',
      text: '😏'
    },
    '[憨笑]': {
      className: 'am-emote-smile',
      label: '憨笑',
      text: '😊'
    },
    '[smile]': {
      className: 'am-emote-smile',
      label: 'smile',
      text: '😊'
    },
    '[皱眉]': {
      className: 'am-emote-frown',
      label: '皱眉',
      text: '😟'
    },
    '[frown]': {
      className: 'am-emote-frown',
      label: 'frown',
      text: '😟'
    },
    '[好吃]': {
      className: 'am-emote-delicious',
      label: '好吃',
      text: '😋'
    },
    '[delicious]': {
      className: 'am-emote-delicious',
      label: 'delicious',
      text: '😋'
    },
    '[庆祝]': {
      className: 'am-emote-celebrate',
      label: '庆祝',
      text: '🎉'
    },
    '[celebrate]': {
      className: 'am-emote-celebrate',
      label: 'celebrate',
      text: '🎉'
    },
    '[玫瑰]': {
      className: 'am-emote-rose',
      label: '玫瑰',
      text: '🌹'
    },
    '[rose]': {
      className: 'am-emote-rose',
      label: 'rose',
      text: '🌹'
    },
    '[呲牙]': {
      className: 'am-emote-grin',
      label: '呲牙',
      text: '😁'
    },
    '[grin]': {
      className: 'am-emote-grin',
      label: 'grin',
      text: '😁'
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

  function toResourceLang(lang) {
    return lang === 'zh' ? 'ZH' : 'EN';
  }

  function getData(lang) {
    const current = lang === 'zh'
      ? window.ACTIVITIES_MOMENTS_ZH
      : window.ACTIVITIES_MOMENTS_EN;

    if (current) {
      if (!Array.isArray(current.items)) current.items = [];
      if (!Array.isArray(current.moments)) current.moments = [];
      return current;
    }

    return {
      ui: {},
      items: [],
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
      openImage: lang === 'zh' ? '查看图片' : 'Open image',
      loadingMoment: lang === 'zh' ? '正在加载这一瞬的完整内容……' : 'Loading this moment...'
    }, fallback, primary);
  }

  function getActivitiesConfig() {
    return window.SiteResources && window.SiteResources.activitiesMoments
      ? window.SiteResources.activitiesMoments
      : null;
  }

  function getDetailScript(lang, dateKey) {
    const config = getActivitiesConfig();
    const resourceLang = toResourceLang(lang);

    if (
      config &&
      typeof config.detailScript === 'function'
    ) {
      return config.detailScript(resourceLang, dateKey);
    }

    return './assets/js/Content/' + resourceLang + '/life/activities_moments_' + dateKey + '.js';
  }

  function getCatalogItems(lang) {
    const data = getData(lang);

    if (Array.isArray(data.items) && data.items.length) {
      return data.items;
    }

    if (Array.isArray(data.catalog) && data.catalog.length) {
      return data.catalog;
    }

    if (Array.isArray(data.moments)) {
      return data.moments;
    }

    return [];
  }

  function getDetailItems(lang) {
    const data = getData(lang);
    return Array.isArray(data.moments) ? data.moments : [];
  }

  function findByDateKey(items, dateKey) {
    return (Array.isArray(items) ? items : []).find((item) => {
      return item && item.dateKey === dateKey;
    }) || null;
  }

  function getCatalogMomentInLang(lang, dateKey) {
    return findByDateKey(getCatalogItems(lang), dateKey);
  }

  function getDetailMomentInLang(lang, dateKey) {
    return findByDateKey(getDetailItems(lang), dateKey);
  }

  function hasDetailInLang(lang, dateKey) {
    return !!getDetailMomentInLang(lang, dateKey);
  }

  function mergeMoment(catalog, detail) {
    if (!catalog && !detail) return null;
    return Object.assign({}, catalog || {}, detail || {});
  }

  function getMomentInLang(lang, dateKey) {
    return mergeMoment(
      getCatalogMomentInLang(lang, dateKey),
      getDetailMomentInLang(lang, dateKey)
    );
  }

  function ensureDetailLoaded(dateKey, lang) {
    const currentLang = lang === 'zh' ? 'zh' : 'en';

    if (!dateKey) return Promise.resolve(false);

    if (hasDetailInLang(currentLang, dateKey)) {
      return Promise.resolve(true);
    }

    const key = currentLang + ':' + dateKey;

    if (DETAIL_PROMISES[key]) {
      return DETAIL_PROMISES[key];
    }

    const src = getDetailScript(currentLang, dateKey);

    if (
      !src ||
      !window.SiteResourceLoader ||
      typeof window.SiteResourceLoader.loadScript !== 'function'
    ) {
      return Promise.resolve(false);
    }

    DETAIL_PROMISES[key] = window.SiteResourceLoader.loadScript(src)
      .then(() => hasDetailInLang(currentLang, dateKey))
      .catch((err) => {
        console.warn('[ActivitiesMoments] Failed to load detail:', dateKey, currentLang, err);
        return false;
      });

    return DETAIL_PROMISES[key];
  }

  async function ensureMomentDetail(dateKey) {
    const lang = getLang();

    if (hasDetailInLang(lang, dateKey)) {
      return true;
    }

    const loaded = await ensureDetailLoaded(dateKey, lang);
    if (loaded) return true;

    const fallbackLang = lang === 'zh' ? 'en' : 'zh';

    if (hasDetailInLang(fallbackLang, dateKey)) {
      return true;
    }

    return ensureDetailLoaded(dateKey, fallbackLang);
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

    const pattern = /(\[旺柴\]|\[doge\]|\[叹气\]|\[sigh\]|\[苦涩\]|\[bitter\]|\[流泪\]|\[crying\]|\[捂脸\]|\[facepalm\]|\[机智\]|\[witty\]|\[憨笑\]|\[smile\]|\[皱眉\]|\[frown\]|\[好吃\]|\[delicious\]|\[庆祝\]|\[celebrate\]|\[玫瑰\]|\[rose\]|\[呲牙\]|\[grin\])/g;

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

  function renderTitle(moment) {
    const parts = Array.isArray(moment && moment.titleParts) ? moment.titleParts : null;

    if (!parts || !parts.length) {
      return escapeHtml(moment && moment.title ? moment.title : '');
    }

    return parts.map((part) => {
      const text = escapeHtml(part && part.text ? part.text : '');

      if (part && part.italic) {
        return '<em>' + text + '</em>';
      }

      return text;
    }).join('');
  }

  function normalizePath(pathname) {
    return String(pathname || '/')
      .replace(/index\.html$/, '')
      .replace(/\/+$/, '') || '/';
  }

  function normalizeAssetUrl(src) {
    if (!src) return '';

    try {
      return new URL(src, document.baseURI).href;
    } catch (e) {
      return String(src);
    }
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
    const primary = getCatalogItems(lang);
    const fallback = getCatalogItems(lang === 'zh' ? 'en' : 'zh');

    return sortMoments(primary.length ? primary : fallback);
  }

  function getMomentByKey(dateKey) {
    const lang = getLang();
    const fallbackLang = lang === 'zh' ? 'en' : 'zh';

    return getMomentInLang(lang, dateKey)
      || getMomentInLang(fallbackLang, dateKey)
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
    const plainTitle = escapeHtml(moment.title || '');
    const title = renderTitle(moment);
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
            alt="${plainTitle}"
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

  function renderDetailShell(moment, innerHtml) {
    const dateLabel = escapeHtml(moment.dateLabel || moment.dateISO || moment.dateKey || '');
    const plainTitle = escapeHtml(moment.title || '');
    const title = renderTitle(moment);
    const meta = escapeHtml(getMetaText(moment));
    const cover = moment.cover ? escapeHtml(moment.cover) : '';
    const currentDateKey = moment.dateKey || '';

    const hero = cover
      ? `<img src="${cover}" alt="${plainTitle}" loading="eager" decoding="async" fetchpriority="high">`
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
              ${innerHtml}
            </div>
          </div>
        </article>
      </div>
    `;
  }

  function renderDetailLoadingHtml(moment) {
    const ui = getUi();

    return renderDetailShell(moment, `
      <div class="am-detail-body">
        <p>${escapeHtml(ui.loadingMoment)}</p>
      </div>
    `);
  }

  function renderDetailHtml(moment) {
    const ui = getUi();

    const backHref = escapeHtml(getListRoute());
    const body = Array.isArray(moment.body) ? moment.body : [];
    const bodyHtml = body
      .map((paragraph) => `<p>${renderInlineText(paragraph)}</p>`)
      .join('');

    return renderDetailShell(moment, `
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
    `);
  }

  function collectGalleryImagesFromMoment(moment) {
    if (!moment || !Array.isArray(moment.gallery)) return [];

    return moment.gallery
      .map((src) => {
        if (typeof src === 'string') return src;
        if (src && typeof src === 'object' && src.src) return src.src;
        return '';
      })
      .filter(Boolean);
  }

  function collectAllGalleryImages() {
    const langs = ['en', 'zh'];
    const images = [];

    langs.forEach((lang) => {
      getDetailItems(lang).forEach((moment) => {
        images.push(...collectGalleryImagesFromMoment(moment));
      });
    });

    return images;
  }

  function preloadImage(src) {
    const abs = normalizeAssetUrl(src);

    if (!abs) {
      return Promise.resolve(false);
    }

    return new Promise((resolve) => {
      const img = new Image();
      let settled = false;
      let timer = null;

      function settle(ok) {
        if (settled) return;
        settled = true;

        if (timer) {
          window.clearTimeout(timer);
          timer = null;
        }

        resolve(ok);
      }

      img.decoding = 'async';

      try {
        img.fetchPriority = 'low';
      } catch (e) {}

      img.onload = () => settle(true);
      img.onerror = () => settle(false);

      timer = window.setTimeout(() => {
        settle(false);
      }, IMAGE_WARMUP.timeout);

      img.src = abs;

      if (img.complete && img.naturalWidth > 0) {
        settle(true);
      }
    });
  }

  function scheduleImageWarmupPump() {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        pumpImageWarmupQueue();
      }, { timeout: 1800 });
      return;
    }

    window.setTimeout(() => {
      pumpImageWarmupQueue();
    }, 250);
  }

  function pumpImageWarmupQueue() {
    if (!IMAGE_WARMUP.running) return;

    while (
      IMAGE_WARMUP.active < IMAGE_WARMUP.concurrency &&
      IMAGE_WARMUP.queue.length
    ) {
      const src = IMAGE_WARMUP.queue.shift();
      IMAGE_WARMUP.active += 1;

      preloadImage(src)
        .then((ok) => {
          if (ok) {
            IMAGE_WARMUP.loaded += 1;
          } else {
            IMAGE_WARMUP.failed += 1;
          }
        })
        .catch(() => {
          IMAGE_WARMUP.failed += 1;
        })
        .finally(() => {
          IMAGE_WARMUP.active -= 1;

          if (IMAGE_WARMUP.queue.length) {
            window.setTimeout(() => {
              pumpImageWarmupQueue();
            }, IMAGE_WARMUP.gap);
            return;
          }

          if (IMAGE_WARMUP.active === 0) {
            IMAGE_WARMUP.running = false;
          }
        });
    }
  }

  function startGalleryImageWarmup(reason) {
    if (IMAGE_WARMUP.started) return;

    const sources = collectAllGalleryImages();
    const unique = [];

    sources.forEach((src) => {
      const abs = normalizeAssetUrl(src);
      if (!abs || IMAGE_WARMUP.seen[abs]) return;

      IMAGE_WARMUP.seen[abs] = true;
      unique.push(abs);
    });

    if (!unique.length) return;

    IMAGE_WARMUP.started = true;
    IMAGE_WARMUP.running = true;
    IMAGE_WARMUP.queue.push(...unique);

    try {
      window.dispatchEvent(new CustomEvent('activities:gallerywarmupstarted', {
        detail: {
          reason: reason || '',
          total: unique.length
        }
      }));
    } catch (e) {}

    scheduleImageWarmupPump();
  }

  function bindBackgroundWarmupEvents() {
    if (window.__activitiesMomentsWarmupEventsBound) return;
    window.__activitiesMomentsWarmupEventsBound = true;

    window.addEventListener('site:pagewarmuploaded', (event) => {
      const detail = event && event.detail ? event.detail : {};

      if (detail.page === 'life') {
        startGalleryImageWarmup('life-background-detail-warmup-finished');
      }
    });

    if (
      window.SiteResourceLoader &&
      typeof window.SiteResourceLoader.isPageWarmupLoaded === 'function' &&
      window.SiteResourceLoader.isPageWarmupLoaded('life')
    ) {
      startGalleryImageWarmup('life-background-detail-warmup-already-finished');
    }
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

    detailRenderToken += 1;

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

  async function showDetail(dateKey, options) {
    const opts = options || {};
    const mount = getMount();
    if (!mount) return;

    const token = ++detailRenderToken;
    const lang = getLang();
    const initialMoment = getMomentByKey(dateKey);

    if (!initialMoment) {
      showList({
        updateHistory: opts.updateHistory,
        replaceHistory: true,
        scroll: opts.scroll
      });
      return;
    }

    STATE.mode = 'detail';
    STATE.dateKey = dateKey;

    if (opts.updateHistory) {
      pushRoute(getDetailRoute(dateKey), opts.replaceHistory);
    }

    let didScroll = false;

    if (!hasDetailInLang(lang, dateKey)) {
      mount.innerHTML = renderDetailLoadingHtml(initialMoment);
      bindEvents();
      syncMomentIndex();

      if (opts.scroll !== false) {
        scrollToMount();
        didScroll = true;
      }

      await ensureMomentDetail(dateKey);

      if (
        token !== detailRenderToken ||
        STATE.mode !== 'detail' ||
        STATE.dateKey !== dateKey
      ) {
        return;
      }
    }

    const moment = getMomentByKey(dateKey);

    if (!moment) {
      showList({
        updateHistory: false,
        replaceHistory: true,
        scroll: opts.scroll
      });
      return;
    }

    mount.innerHTML = renderDetailHtml(moment);
    bindEvents();
    syncMomentIndex();

    if (opts.scroll !== false && !didScroll) {
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
    bindBackgroundWarmupEvents();

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
    resolveDateKeyFromPath,
    ensureMomentDetail,
    startGalleryImageWarmup
  };

  bindBackgroundWarmupEvents();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
