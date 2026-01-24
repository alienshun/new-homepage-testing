(function () {
  'use strict';

  // ------------------------------
  // Navigation (cover <-> pages)
  // ------------------------------
  let coverHidden = false;
  let currentPage = null;

  let wheelTriggered = false;
  let wheelLockTimer = null;

  // Keep a stable viewport height on mobile browsers (fixes 100vh issues with dynamic address bars)
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

  function scrollTargetIntoView(targetId) {
    const el = document.getElementById(targetId);
    if (!el) return;
    try {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  function showPage(page) {
    const cover = document.getElementById('cover');
    const resume = document.getElementById('resume');
    const social = document.getElementById('social');
    const toolkit = document.getElementById('toolkit');
    const schedule = document.getElementById('schedule');

    // [NEW]
    const meditations = document.getElementById('meditations');

    if (!cover || !resume || !social || !toolkit || !schedule || !meditations) return;
    if (coverHidden && currentPage === page) return;

    function activatePage(target) {
      resume.classList.remove('visible');
      social.classList.remove('visible');
      toolkit.classList.remove('visible');
      schedule.classList.remove('visible');

      // [NEW]
      meditations.classList.remove('visible');

      if (target === 'resume') {
        resume.classList.add('visible');
        currentPage = 'resume';
        scrollTargetIntoView('resume');
      } else if (target === 'social') {
        social.classList.add('visible');
        currentPage = 'social';
        scrollTargetIntoView('social');
      } else if (target === 'toolkit') {
        toolkit.classList.add('visible');
        currentPage = 'toolkit';
        scrollTargetIntoView('toolkit');
      } else if (target === 'schedule') {
        schedule.classList.add('visible');
        currentPage = 'schedule';
        scrollTargetIntoView('schedule');
        if (window.Schedule && typeof window.Schedule.setScheduleView === 'function') {
          window.Schedule.setScheduleView('my-timetable');
        }
      } else if (target === 'meditations') {
        meditations.classList.add('visible');
        currentPage = 'meditations';
        scrollTargetIntoView('meditations');
      }

      // Use TopNav module
      if (window.TopNav) {
        window.TopNav.show();
        window.TopNav.setActive(currentPage);
      }
    }

    if (coverHidden) {
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

    // Hide cover elements immediately
    ['avatar-frame', 'name', 'slogan', 'cover-scroll'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('visible');
    });
  }

  function backToCover() {
    const cover = document.getElementById('cover');
    const resume = document.getElementById('resume');
    const social = document.getElementById('social');
    const toolkit = document.getElementById('toolkit');
    const schedule = document.getElementById('schedule');

    // [NEW]
    const meditations = document.getElementById('meditations');

    if (!cover || !resume || !social || !toolkit || !schedule || !meditations) return;

    coverHidden = false;
    currentPage = null;

    // Use TopNav module
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

    // [NEW]
    meditations.classList.remove('visible');

    // Back buttons are optional (kept for compatibility)
    ['resume-back-btn', 'social-back-btn', 'toolkit-back-btn', 'schedule-back-btn'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('visible');
    });

    // Reset scroll position for wheel trigger
    window.scrollTo(0, 0);
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
      cover.classList.add('visible');
      showCoverElements();
    }, 100);
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

      // Only capture downward intent; avoid continuous trigger
      if (e.deltaY > 6 && !wheelTriggered) {
        e.preventDefault();
        lockWheelTrigger(900);
        showPage('resume');
        return;
      }

      // Prevent page scroll during cover stage
      e.preventDefault();
    }, { passive: false });

    // Touch swipe (mobile/tablet) -> About(Resume)
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

    // Support touchpad / keyboard down
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
    // Theme init (migrated)
    if (window.Theme && typeof window.Theme.init === 'function') {
      window.Theme.init();
    }

    // Initialize TopNav with callbacks
    if (window.TopNav && typeof window.TopNav.init === 'function') {
      window.TopNav.init(showPage, backToCover);
    }

    // Toolkit page init (migrated)
    if (window.Toolkit && typeof window.Toolkit.initToolkitFilter === 'function') {
      window.Toolkit.initToolkitFilter();
    }

    // Clock toggle init (migrated)
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
    // Use TopNav module
    if (window.TopNav) {
      window.TopNav.hide();
    }

    // Lock scroll initially; transition via wheel/arrow
    document.body.style.overflow = 'hidden';

    const cover = document.getElementById('cover');
    if (cover) {
      cover.classList.add('visible');
      showCoverElements();
    }

    bindCoverArrowAndScroll();

    // Clock start (migrated)
    if (window.Clock && typeof window.Clock.start === 'function') {
      window.Clock.start();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootDOMContentLoaded);
  } else {
    bootDOMContentLoaded();
  }

  window.addEventListener('load', bootOnLoad);
})();
