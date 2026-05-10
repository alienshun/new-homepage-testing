(function () {
  'use strict';

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

    // keep compatibility with Schedule theme
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

  function init() {
    initializeTheme();
    bindThemeToggles();
  }

  window.Theme = {
    init,
    toggleTheme,
    updateToggleBtnIcon,
    applyTheme,
  };
})();
