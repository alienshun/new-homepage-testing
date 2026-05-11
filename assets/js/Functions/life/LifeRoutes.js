(function () {
  'use strict';

  const DEFAULT_VIEW = 'activities-moments';

  const VIEW_TO_SLUG = {
    'activities-moments': 'activities_moments',
    meditations: 'meditations'
  };

  const SLUG_TO_VIEW = {
    activities_moments: 'activities-moments',
    'activities-moments': 'activities-moments',
    activities: 'activities-moments',
    moments: 'activities-moments',
    meditations: 'meditations'
  };

  function normalizeView(view) {
    const key = String(view || '').trim().toLowerCase();
    return SLUG_TO_VIEW[key] || (VIEW_TO_SLUG[key] ? key : null);
  }

  function getLifeBaseUrl() {
    return new URL('life/', document.baseURI);
  }

  function getRoute(view) {
    const normalized = normalizeView(view) || DEFAULT_VIEW;
    return new URL(VIEW_TO_SLUG[normalized] + '/', getLifeBaseUrl()).pathname;
  }

  function normalizePath(pathname) {
    return String(pathname || '/')
      .replace(/index\.html$/, '')
      .replace(/\/+$/, '') || '/';
  }

  function isLifePath(pathname) {
    const parts = normalizePath(pathname || window.location.pathname)
      .split('/')
      .filter(Boolean);

    return parts.includes('life');
  }

  function resolveViewFromPath(pathname) {
    const parts = normalizePath(pathname || window.location.pathname)
      .split('/')
      .filter(Boolean);

    const lifeIndex = parts.indexOf('life');
    const slug = lifeIndex >= 0 ? parts[lifeIndex + 1] : '';

    return normalizeView(slug);
  }

  function injectRouteStyle() {
    if (document.getElementById('life-subnav-route-style')) return;

    const style = document.createElement('style');
    style.id = 'life-subnav-route-style';
    style.textContent = `
      .life-switcher a.life-switch-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        text-decoration: none;
        line-height: normal;
        font-family: inherit;
        box-sizing: border-box;
        user-select: none;
      }
    `;
    document.head.appendChild(style);
  }

  function toRouteLink(control) {
    const view = normalizeView(control && control.dataset ? control.dataset.view : '');
    if (!control || !view) return control;

    const href = getRoute(view);

    if (control.tagName && control.tagName.toLowerCase() === 'a') {
      control.setAttribute('href', href);
      control.setAttribute('role', 'tab');
      return control;
    }

    const link = document.createElement('a');

    Array.from(control.attributes).forEach((attr) => {
      if (attr.name === 'type') return;
      link.setAttribute(attr.name, attr.value);
    });

    link.className = control.className;
    link.dataset.view = view;
    link.href = href;
    link.setAttribute('role', 'tab');
    link.innerHTML = control.innerHTML;

    control.replaceWith(link);
    return link;
  }

  function enhanceLifeSubnav() {
    injectRouteStyle();

    document.querySelectorAll('.life-switcher .life-switch-btn').forEach((control) => {
      const link = toRouteLink(control);
      const view = normalizeView(link && link.dataset ? link.dataset.view : '');

      if (link && view) {
        link.setAttribute('href', getRoute(view));
      }
    });
  }

  function getLifeSetter() {
    if (window.Life && typeof window.Life.setLifeView === 'function') {
      return window.Life.setLifeView.bind(window.Life);
    }

    return null;
  }

  function activateView(view, options) {
    const opts = options || {};
    const normalized = normalizeView(view) || DEFAULT_VIEW;
    const setter = getLifeSetter();

    enhanceLifeSubnav();

    if (setter) {
      setter(normalized);
    }

    if (opts.updateHistory && window.history && typeof window.history.pushState === 'function') {
      const route = getRoute(normalized);
      const current = normalizePath(window.location.pathname);
      const next = normalizePath(route);

      if (current !== next) {
        const method = opts.replaceHistory ? 'replaceState' : 'pushState';
        window.history[method]({ path: route }, '', route);
      }
    }
  }

  function enterFromLocation() {
    const view = resolveViewFromPath(window.location.pathname) || DEFAULT_VIEW;
    activateView(view, { updateHistory: false });
  }

  function handleLifeSubnavClick(event) {
    const control = event.target && event.target.closest
      ? event.target.closest('.life-switcher .life-switch-btn')
      : null;

    if (!control) return;

    const view = normalizeView(control.dataset.view);
    if (!view) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    activateView(view, { updateHistory: true });
  }

  document.addEventListener('click', handleLifeSubnavClick, true);

  window.addEventListener('popstate', () => {
    window.setTimeout(() => {
      if (isLifePath(window.location.pathname)) {
        enterFromLocation();
      }
    }, 0);
  });

  if (window.SitePages && typeof window.SitePages.register === 'function') {
    window.SitePages.register('life', {
      init() {
        if (window.Life && typeof window.Life.initLifePage === 'function') {
          window.Life.initLifePage();
        }

        enhanceLifeSubnav();
      },

      enter() {
        enterFromLocation();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceLifeSubnav);
  } else {
    enhanceLifeSubnav();
  }

  window.LifeRoutes = {
    normalizeView,
    resolveViewFromPath,
    getRoute,
    enhanceLifeSubnav,
    activateView,
    enterFromLocation
  };
})();
