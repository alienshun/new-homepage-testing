(function () {
  'use strict';

  // ------------------------------
  // Navigation (cover <-> pages)
  // ------------------------------
  let coverHidden = false;
  let currentPage = null;

  function showCoverElements() {
    const avatarFrame = document.getElementById('avatar-frame');
    const name = document.getElementById('name');
    const slogan = document.getElementById('slogan');
    const aboutBtn = document.getElementById('about-btn');
    const socialBtn = document.getElementById('social-btn');
    const toolkitBtn = document.getElementById('toolkit-btn');
    const scheduleBtn = document.getElementById('schedule-btn');

    if (!avatarFrame || !name || !slogan || !aboutBtn || !socialBtn || !toolkitBtn || !scheduleBtn) return;

    avatarFrame.classList.add('visible');
    setTimeout(() => name.classList.add('visible'), 400);
    setTimeout(() => slogan.classList.add('visible'), 800);
    setTimeout(() => {
      aboutBtn.classList.add('visible');
      socialBtn.classList.add('visible');
      toolkitBtn.classList.add('visible');
      scheduleBtn.classList.add('visible');
    }, 1200);
  }

  function showPage(page) {
    const cover = document.getElementById('cover');
    const resume = document.getElementById('resume');
    const social = document.getElementById('social');
    const toolkit = document.getElementById('toolkit');
    const schedule = document.getElementById('schedule');

    if (!cover || !resume || !social || !toolkit || !schedule) return;
    if (coverHidden && currentPage === page) return;

    function activatePage(target) {
      resume.classList.remove('visible');
      social.classList.remove('visible');
      toolkit.classList.remove('visible');
      schedule.classList.remove('visible');

      if (target === 'resume') {
        resume.classList.add('visible');
        currentPage = 'resume';
      } else if (target === 'social') {
        social.classList.add('visible');
        currentPage = 'social';
      } else if (target === 'toolkit') {
        toolkit.classList.add('visible');
        currentPage = 'toolkit';
      } else if (target === 'schedule') {
        schedule.classList.add('visible');
        currentPage = 'schedule';
        if (window.Schedule && typeof window.Schedule.setScheduleView === 'function') {
          window.Schedule.setScheduleView('my-timetable');
        }
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
    ['avatar-frame', 'name', 'slogan', 'about-btn', 'social-btn', 'toolkit-btn', 'schedule-btn'].forEach((id) => {
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

    if (!cover || !resume || !social || !toolkit || !schedule) return;

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

    // Back buttons are optional (kept for compatibility)
    ['resume-back-btn', 'social-back-btn', 'toolkit-back-btn', 'schedule-back-btn'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('visible');
    });

    setTimeout(() => {
      cover.classList.add('visible');
      showCoverElements();
    }, 100);
  }

  function bindCoverButtons() {
    const aboutBtn = document.getElementById('about-btn');
    const socialBtn = document.getElementById('social-btn');
    const toolkitBtn = document.getElementById('toolkit-btn');
    const scheduleBtn = document.getElementById('schedule-btn');

    if (aboutBtn) aboutBtn.addEventListener('click', () => showPage('resume'));
    if (socialBtn) socialBtn.addEventListener('click', () => showPage('social'));
    if (toolkitBtn) toolkitBtn.addEventListener('click', () => showPage('toolkit'));
    if (scheduleBtn) scheduleBtn.addEventListener('click', () => showPage('schedule'));

    ['resume-back-btn', 'social-back-btn', 'toolkit-back-btn', 'schedule-back-btn'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('click', backToCover);
    });
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

    const cover = document.getElementById('cover');
    if (cover) {
      cover.classList.add('visible');
      showCoverElements();
    }
    bindCoverButtons();

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
