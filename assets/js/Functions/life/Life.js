(function () {
  'use strict';

  const DEFAULT_VIEW = 'activities-moments';

  const VIEW_ALIASES = {
    'activities-moments': 'activities-moments',
    activities_moments: 'activities-moments',
    activities: 'activities-moments',
    moments: 'activities-moments',
    meditations: 'meditations'
  };

  const I18N = {
    en: {
      life_heading: 'Part of My Life',
      activities_moments: 'Activities & Moments',
      meditations: 'Meditations',
      top_nav_life: 'Life'
    },
    zh: {
      life_heading: '浮生一隅',
      activities_moments: '岁时行迹',
      meditations: '沉思录',
      top_nav_life: '人生'
    }
  };

  function normalizeView(view) {
    const key = String(view || '').trim().toLowerCase();
    return VIEW_ALIASES[key] || null;
  }

  function getLang() {
    if (window.SiteLang && typeof window.SiteLang.getLang === 'function') {
      return window.SiteLang.getLang() === 'zh' ? 'zh' : 'en';
    }

    return document.body && document.body.dataset.lang === 'zh' ? 'zh' : 'en';
  }

  function getDict() {
    const lang = getLang();
    return I18N[lang] || I18N.en;
  }

  function applyLifeI18N() {
    const dict = getDict();

    document.querySelectorAll('#life [data-life-i18n]').forEach((el) => {
      const key = el.getAttribute('data-life-i18n');
      if (!key) return;

      const value = dict[key];
      if (typeof value === 'string') {
        el.textContent = value;
      }
    });

    const topLife = document.querySelector('.top-nav-link[data-page="life"]');
    if (topLife) {
      topLife.textContent = dict.top_nav_life;
    }
  }

  function getActivitiesHtml() {
    const lang = getLang();

    if (lang === 'zh' && typeof window.ACTIVITIES_MOMENTS_ZH_INNER_HTML === 'string') {
      return window.ACTIVITIES_MOMENTS_ZH_INNER_HTML;
    }

    if (typeof window.ACTIVITIES_MOMENTS_EN_INNER_HTML === 'string') {
      return window.ACTIVITIES_MOMENTS_EN_INNER_HTML;
    }

    return '';
  }

  function renderActivitiesMoments() {
    const mount = document.getElementById('mount-activities-moments');
    if (!mount) return;

    const html = getActivitiesHtml();
    mount.innerHTML = typeof html === 'string' ? html : '';
  }

  function setLifeView(view) {
    const normalized = normalizeView(view) || DEFAULT_VIEW;

    renderActivitiesMoments();
    applyLifeI18N();

    document.querySelectorAll('#life .life-switch-btn').forEach((btn) => {
      const btnView = normalizeView(btn.dataset.view);
      const active = btnView === normalized;

      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
      btn.setAttribute('tabindex', active ? '0' : '-1');
    });

    document.querySelectorAll('#life .life-section').forEach((section) => {
      const sectionView = normalizeView(section.dataset.view);
      const active = sectionView === normalized;

      section.classList.toggle('active', active);
      section.toggleAttribute('hidden', !active);
    });

    return normalized;
  }

  function initLifePage() {
    const life = document.getElementById('life');
    if (!life) return;

    renderActivitiesMoments();
    applyLifeI18N();

    const active = life.querySelector('.life-switch-btn.active');
    const initialView = active && active.dataset ? active.dataset.view : DEFAULT_VIEW;

    setLifeView(initialView);
  }

  function bindLanguageObserver() {
    if (!document.body || document.body.dataset.boundLifeLangObserver === '1') return;

    document.body.dataset.boundLifeLangObserver = '1';

    const observer = new MutationObserver(() => {
      renderActivitiesMoments();
      applyLifeI18N();
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-lang']
    });
  }

  const mount = document.getElementById('mount-life') || document.body;

  if (!document.getElementById('life')) {
    mount.insertAdjacentHTML('beforeend', `
      <div id="life">
        <div class="life-container">
          <div class="life-heading" data-life-i18n="life_heading">Part of My Life</div>

          <div class="life-shell">
            <div class="life-switcher" role="tablist" aria-label="Life sections">
              <button
                class="life-switch-btn active"
                type="button"
                data-view="activities-moments"
                role="tab"
                aria-selected="true"
                data-life-i18n="activities_moments"
                data-cursor="precise_select"
                data-cursor-fallback="pointer"
              >Activities &amp; Moments</button>

              <button
                class="life-switch-btn"
                type="button"
                data-view="meditations"
                role="tab"
                aria-selected="false"
                data-life-i18n="meditations"
                data-cursor="precise_select"
                data-cursor-fallback="pointer"
              >Meditations</button>
            </div>

            <section
              class="life-section active"
              id="activities-moments-section"
              data-view="activities-moments"
              role="tabpanel"
            >
              <div id="mount-activities-moments"></div>
            </section>

            <section
              class="life-section"
              id="meditations-section"
              data-view="meditations"
              role="tabpanel"
              hidden
            >
              <div id="mount-meditations"></div>
            </section>
          </div>
        </div>
      </div>
    `);
  }

  window.Life = {
    normalizeView,
    setLifeView,
    initLifePage,
    renderActivitiesMoments,
    applyLifeI18N
  };

  bindLanguageObserver();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLifePage);
  } else {
    initLifePage();
  }
})();
