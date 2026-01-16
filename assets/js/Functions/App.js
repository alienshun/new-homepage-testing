(function () {
  'use strict';

  // Theme
  // ------------------------------
  function applyTheme(theme) {
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }

  function updateToggleBtnIcon() {
    const isDark = document.body.classList.contains('dark-mode');
    const toggleButtons = document.querySelectorAll(
      '#toggle-btn, #toggle-btn-social, #toggle-btn-toolkit, #toggle-btn-schedule, #top-toggle-btn'
    );

    toggleButtons.forEach((button) => {
      const icon = button.querySelector('i');
      if (!icon) return;
      if (isDark) {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
      } else {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
      }
    });
  }

  function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    updateToggleBtnIcon();
    if (window.Schedule && typeof window.Schedule.updateCalendarTheme === 'function') {
      window.Schedule.updateCalendarTheme();
    }
  }

  function initializeTheme() {
    const currentHour = new Date().getHours();
    const isNightTime = currentHour >= 18 || currentHour < 6;
    applyTheme(isNightTime ? 'dark' : 'light');
    updateToggleBtnIcon();
  }

  function bindThemeToggles() {
    const ids = ['toggle-btn', 'toggle-btn-social', 'toggle-btn-toolkit', 'toggle-btn-schedule', 'top-toggle-btn'];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('click', toggleTheme);
    });
  }

  // ------------------------------
  // Clock
  // ------------------------------
  function updateClock() {
    const now = new Date();
    const timeZoneName = now
      .toLocaleTimeString('en-us', { timeZoneName: 'short' })
      .split(' ')
      .pop();
    const hours = now.getHours().toString().padStart(2, '0');
    const mins = now.getMinutes().toString().padStart(2, '0');
    const timeString = `${timeZoneName} ${hours}:${mins}`;

    const ids = ['top-clock', 'clock', 'clock-social', 'clock-toolkit', 'clock-schedule'];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.textContent = timeString;
    });
  }

  function startClock() {
    updateClock();
    setInterval(updateClock, 1000);
  }

  function initClockToggle() {
    const clockToggle = document.getElementById('clock-toggle');
    if (!clockToggle) return;

    const clocks = ['clock', 'clock-social', 'clock-toolkit', 'clock-schedule']
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    let clocksCollapsed = false;
    clockToggle.addEventListener('click', () => {
      clocksCollapsed = !clocksCollapsed;
      clocks.forEach((el) => {
        el.classList.toggle('collapsed', clocksCollapsed);
      });

      clockToggle.innerHTML = clocksCollapsed
        ? '<i class="fas fa-chevron-right"></i>'
        : '<i class="fas fa-clock"></i>';
    });
  }

  // ------------------------------
  // Navigation (cover <-> pages)
  // ------------------------------
  let coverHidden = false;
  let currentPage = null;

  function showTopNav() {
    document.body.classList.add('nav-visible');
  }

  function hideTopNav() {
    document.body.classList.remove('nav-visible');
  }

  function setTopNavActive(pageKey) {
    const links = document.querySelectorAll('.top-nav-link');
    links.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.page === pageKey);
    });
  }

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

      showTopNav();
      setTopNavActive(currentPage);
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

    hideTopNav();
    setTopNavActive('');

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

  function initTopNav() {
    const topNav = document.getElementById('top-nav');
    if (!topNav) return;

    const topBackBtn = document.getElementById('top-back-btn');
    if (topBackBtn) {
      topBackBtn.addEventListener('click', backToCover);
    }

    const links = topNav.querySelectorAll('.top-nav-link');
    links.forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.page;
        if (!target) return;
        showPage(target);
      });
    });

    // Hidden on cover by default
    hideTopNav();
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
    initializeTheme();
    bindThemeToggles();
    initTopNav();

    // Toolkit page init (migrated)
    if (window.Toolkit && typeof window.Toolkit.initToolkitFilter === 'function') {
      window.Toolkit.initToolkitFilter();
    }

    initClockToggle();

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
    hideTopNav();
    const cover = document.getElementById('cover');
    if (cover) {
      cover.classList.add('visible');
      showCoverElements();
    }
    bindCoverButtons();
    startClock();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootDOMContentLoaded);
  } else {
    bootDOMContentLoaded();
  }

  window.addEventListener('load', bootOnLoad);
})();
