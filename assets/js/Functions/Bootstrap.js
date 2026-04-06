(function () {
  'use strict';

  const ROUTE_TO_PAGE = {
    '/about': 'resume',
    '/schedule': 'schedule',
    '/social': 'social',
    '/meditations': 'meditations'
  };

  const PAGE_TO_ROUTE = {
    resume: 'about',
    schedule: 'schedule',
    social: 'social',
    meditations: 'meditations'
  };

  // ------------------------------
  // Navigation (cover <-> pages)
  // ------------------------------
  let coverHidden = false;
  let currentPage = null;

  let wheelTriggered = false;
  let wheelLockTimer = null;

  function normalizePath(pathname) {
    let cleaned = pathname || '/';
    cleaned = cleaned.replace(/index\.html$/, '');
    cleaned = cleaned.replace(/\/+$/, '');
    return cleaned || '/';
  }

  function getSiteRootPath() {
    const normalized = normalizePath(window.location.pathname);
    const parts = normalized.split('/').filter(Boolean);

    if (parts.length > 0) {
      const last = parts[parts.length - 1];
      if (['about', 'schedule', 'social', 'meditations'].includes(last)) {
        parts.pop();
      }
    }

    return '/' + (parts.length ? parts.join('/') + '/' : '');
  }

  function stripSiteRoot(pathname) {
    const siteRoot = getSiteRootPath().replace(/\/$/, '');
    const normalized = normalizePath(pathname);

    if (!siteRoot) return normalized;
    if (siteRoot === '') return normalized;
    if (siteRoot === '/') return normalized;

    if (normalized === siteRoot) return '/';
    if (normalized.startsWith(siteRoot + '/')) {
      return normalized.slice(siteRoot.length) || '/';
    }
    return normalized;
  }

  function getPageFromPath(pathname) {
    const relativePath = stripSiteRoot(pathname || window.location.pathname);
    return ROUTE_TO_PAGE[relativePath] || null;
  }

  function getRouteForPage(page) {
    const siteRoot = getSiteRootPath();
    const segment = PAGE_TO_ROUTE[page];
    if (!segment) return siteRoot;
    return `${siteRoot}${segment}/`;
  }

  function getCoverRoute() {
    return getSiteRootPath();
  }

  function syncHistory(path, replace) {
    if (!window.history || typeof window.history.pushState !== 'function') return;
    const nextPath = path || getCoverRoute();
    const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (currentPath === nextPath) return;
    const method = replace ? 'replaceState' : 'pushState';
    window.history[method]({ path: nextPath }, '', nextPath);
  }

  // Keep a stable viewport height on mobile browsers
  let appHeightRaf = 0;
  function syncAppHeight() {
    try {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    } catch (e) {
      // ignore
    }
  }
  function scheduleAppHeightSync() {
    if (appHeightRaf) cancelAnimationFrame(appHeightRaf);
    appHeightRaf = requestAnimationFrame(() => {
      appHeightRaf = 0;
      syncAppHeight();
    });
  }
  syncAppHeight();
  window.addEventListener('resize', scheduleAppHeightSync, { passive: true });
  window.addEventListener('orientationchange', scheduleAppHeightSync, { passive: true });

  function lockWheelTrigger(ms) {
    wheelTriggered = true;
    if (wheelLockTimer) clearTimeout(wheelLockTimer);
    wheelLockTimer = setTimeout(() => { wheelTriggered = false; }, ms);
  }

  function scrollTargetIntoView(targetId, behavior) {
    const el = document.getElementById(targetId);
    if (!el) return;
    try {
      el.scrollIntoView({ behavior: behavior || 'smooth', block: 'start' });
    } catch (e) {
      // ignore
    }
  }

  function showCoverElements() {
    const avatarFrame = document.getElementById('avatar-frame');
    const name = document.getElementById('name');
    const slogan = document.getElementById('slogan');
    const arrow = document.getElementById('cover-scroll');

    if (!avatarFrame || !name || !slogan) return;

    avatarFrame.classList.add('visible');
    setTimeout(() => name.classList.add('visible'), 400);
    setTimeout(() => slogan.classList.add('visible'), 800);
    setTimeout(() => {
      if (arrow) arrow.classList.add('visible');
    }, 1200);
  }

  function showPage(page, options) {
    const opts = Object.assign({
      updateHistory: true,
      replaceHistory: false,
      instant: false,
      scrollBehavior: 'smooth'
    }, options || {});

    const cover = document.getElementById('cover');
    const resume = document.getElementById('resume');
    const social = document.getElementById('social');
    const toolkit = document.getElementById('toolkit');
    const schedule = document.getElementById('schedule');
    const meditations = document.getElementById('meditations');

    if (!cover || !resume || !social || !toolkit || !schedule || !meditations) return;

    function activatePage(target) {
      resume.classList.remove('visible');
      social.classList.remove('visible');
      toolkit.classList.remove('visible');
      schedule.classList.remove('visible');
      meditations.classList.remove('visible');

      if (target === 'resume') {
        resume.classList.add('visible');
        currentPage = 'resume';
        scrollTargetIntoView('resume', opts.scrollBehavior);
      } else if (target === 'social') {
        social.classList.add('visible');
        currentPage = 'social';
        scrollTargetIntoView('social', opts.scrollBehavior);
      } else if (target === 'toolkit') {
        toolkit.classList.add('visible');
        currentPage = 'toolkit';
        scrollTargetIntoView('toolkit', opts.scrollBehavior);
      } else if (target === 'schedule') {
        schedule.classList.add('visible');
        currentPage = 'schedule';
        scrollTargetIntoView('schedule', opts.scrollBehavior);
        if (window.Schedule && typeof window.Schedule.setScheduleView === 'function') {
          window.Schedule.setScheduleView('my-timetable');
        }
      } else if (target === 'meditations') {
        meditations.classList.add('visible');
        currentPage = 'meditations';
        scrollTargetIntoView('meditations', opts.scrollBehavior);
      }

      if (window.TopNav) {
        window.TopNav.show();
        window.TopNav.setActive(currentPage);
      }

      if (opts.updateHistory && PAGE_TO_ROUTE[currentPage]) {
        syncHistory(getRouteForPage(currentPage), opts.replaceHistory);
      }
    }

    if (coverHidden && currentPage === page) {
      if (opts.updateHistory && PAGE_TO_ROUTE[page]) {
        syncHistory(getRouteForPage(page), opts.replaceHistory);
      }
      return;
    }

    if (coverHidden || opts.instant) {
      cover.style.display = 'none';
      document.body.style.overflow = 'auto';
      coverHidden = true;
      activatePage(page);
      return;
    }

    cover.classList.add('hidden');
    setTimeout(() => {
      cover.style.display = 'none';
      document.body.style.overflow = 'auto';
      coverHidden = true;
      activatePage(page);
    }, 1500);

    ['avatar-frame', 'name', 'slogan', 'cover-scroll'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('visible');
    });
  }

  function backToCover(options) {
    const opts = Object.assign({
      updateHistory: true,
      replaceHistory: false,
      instant: false
    }, options || {});

    const cover = document.getElementById('cover');
    const resume = document.getElementById('resume');
    const social = document.getElementById('social');
    const toolkit = document.getElementById('toolkit');
    const schedule = document.getElementById('schedule');
    const meditations = document.getElementById('meditations');

    if (!cover || !resume || !social || !toolkit || !schedule || !meditations) return;

    coverHidden = false;
    currentPage = null;

    if (window.TopNav) {
      window.TopNav.hide();
      window.TopNav.setActive('');
    }

    cover.style.display = 'flex';
    cover.classList.remove('hidden');

    resume.classList.remove('visible');
    social.classList.remove('visible');
    toolkit.classList.remove('visible');
    schedule.classList.remove('visible');
    meditations.classList.remove('visible');

    ['resume-back-btn', 'social-back-btn', 'toolkit-back-btn', 'schedule-back-btn'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('visible');
    });

    window.scrollTo(0, 0);
    document.body.style.overflow = 'hidden';

    if (opts.updateHistory) {
      syncHistory(getCoverRoute(), opts.replaceHistory);
    }

    if (opts.instant) {
      cover.classList.add('visible');
      showCoverElements();
      return;
    }

    setTimeout(() => {
      cover.classList.add('visible');
      showCoverElements();
    }, 100);
  }

  function applyRouteFromLocation(options) {
    const page = getPageFromPath(window.location.pathname);
    if (page) {
      showPage(page, Object.assign({
        updateHistory: false,
        instant: true,
        scrollBehavior: 'auto'
      }, options || {}));
    } else {
      backToCover(Object.assign({
        updateHistory: false,
        instant: true
      }, options || {}));
    }
  }

  function bindCoverArrowAndScroll() {
    const cover = document.getElementById('cover');
    const arrow = document.getElementById('cover-scroll');
    if (!cover) return;

    // Arrow click -> About(Resume)
    if (arrow) {
      arrow.addEventListener('click', () => {
        if (coverHidden) return;
        arrow.classList.add('pulse');
        setTimeout(() => arrow.classList.remove('pulse'), 320);
        showPage('resume');
      });
    }

    // Wheel down -> About(Resume)
    cover.addEventListener('wheel', (e) => {
      if (coverHidden) return;

      if (e.deltaY > 6 && !wheelTriggered) {
        e.preventDefault();
        lockWheelTrigger(900);
        showPage('resume');
        return;
      }

      e.preventDefault();
    }, { passive: false });

    // Touch swipe -> About(Resume)
    let touchStartY = 0;
    let touchStartX = 0;
    let touchActive = false;

    cover.addEventListener('touchstart', (e) => {
      if (coverHidden) return;
      if (!e.touches || e.touches.length !== 1) return;
      touchActive = true;
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    cover.addEventListener('touchmove', (e) => {
      if (coverHidden || !touchActive) return;
      const t = e.touches && e.touches[0];
      if (!t) return;

      const dy = t.clientY - touchStartY;
      const dx = t.clientX - touchStartX;

      if (Math.abs(dy) > Math.abs(dx) * 1.2) {
        e.preventDefault();
      }
    }, { passive: false });

    cover.addEventListener('touchend', (e) => {
      if (coverHidden || !touchActive) return;
      touchActive = false;

      const t = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0] : null;
      if (!t) return;

      const dy = t.clientY - touchStartY;
      const dx = t.clientX - touchStartX;

      const isVertical = Math.abs(dy) > Math.abs(dx) * 1.2;
      const strongEnough = Math.abs(dy) > 60;

      if (isVertical && strongEnough && !wheelTriggered) {
        lockWheelTrigger(900);
        showPage('resume');
      }
    }, { passive: true });

    window.addEventListener('keydown', (e) => {
      if (coverHidden) return;
      const keys = ['ArrowDown', 'PageDown', 'Space'];
      if (keys.includes(e.code)) {
        e.preventDefault();
        if (!wheelTriggered) {
          lockWheelTrigger(900);
          showPage('resume');
        }
      }
    }, { passive: false });
  }

  // ------------------------------
  // Boot
  // ------------------------------
  function bootDOMContentLoaded() {
    if (window.Theme && typeof window.Theme.init === 'function') {
      window.Theme.init();
    }

    if (window.TopNav && typeof window.TopNav.init === 'function') {
      window.TopNav.init(showPage, backToCover);
    }

    if (window.Toolkit && typeof window.Toolkit.initToolkitFilter === 'function') {
      window.Toolkit.initToolkitFilter();
    }

    if (window.Clock && typeof window.Clock.initToggle === 'function') {
      window.Clock.initToggle();
    }

    if (window.Schedule && typeof window.Schedule.initSchedulePage === 'function') {
      window.Schedule.initSchedulePage();
    }
    if (window.Schedule && typeof window.Schedule.initWeeksSelection === 'function') {
      window.Schedule.initWeeksSelection();
    }
    if (window.Schedule && typeof window.Schedule.initSemesterSelection === 'function') {
      window.Schedule.initSemesterSelection();
    }
  }

  function bootOnLoad() {
    const initialPage = getPageFromPath(window.location.pathname);

    if (initialPage) {
      applyRouteFromLocation();
    } else {
      if (window.TopNav) {
        window.TopNav.hide();
      }

      document.body.style.overflow = 'hidden';

      const cover = document.getElementById('cover');
      if (cover) {
        cover.classList.add('visible');
        showCoverElements();
      }
    }

    bindCoverArrowAndScroll();

    if (window.Clock && typeof window.Clock.start === 'function') {
      window.Clock.start();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootDOMContentLoaded);
  } else {
    bootDOMContentLoaded();
  }

  window.addEventListener('popstate', () => {
    applyRouteFromLocation();
  });

  window.addEventListener('load', bootOnLoad);
})();
