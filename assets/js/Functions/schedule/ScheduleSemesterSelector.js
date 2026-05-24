(function () {
  'use strict';

  const DEFAULT_SEMESTER_ID = 'freshman-first';

  const SEMESTER_ORDER = [
    'freshman-first',
    'freshman-second',
    'sophomore-first',
    'sophomore-second',
    'junior-first',
    'junior-second',
    'senior-first',
    'senior-second'
  ];

  const UI_TEXT = {
    en: {
      selectSemester: 'Select Semester'
    },
    zh: {
      selectSemester: '选择学期'
    }
  };

  let retryTimer = null;

  function normalizeLang(lang) {
    const value = String(lang || '').toLowerCase();
    return value === 'zh' || value.startsWith('zh') ? 'zh' : 'en';
  }

  function getCurrentLang() {
    if (window.SiteLang && typeof window.SiteLang.getLang === 'function') {
      return normalizeLang(window.SiteLang.getLang());
    }

    const bodyLang = document.body && document.body.dataset
      ? document.body.dataset.lang
      : '';

    if (bodyLang) return normalizeLang(bodyLang);

    const htmlLang = document.documentElement
      ? document.documentElement.getAttribute('lang')
      : '';

    if (htmlLang) return normalizeLang(htmlLang);

    return 'en';
  }

  function textFor(lang) {
    return UI_TEXT[normalizeLang(lang)] || UI_TEXT.en;
  }

  function getSemesterConfig() {
    return window.SCHEDULE_SEMESTER_CONFIG && window.SCHEDULE_SEMESTER_CONFIG.semesters
      ? window.SCHEDULE_SEMESTER_CONFIG.semesters
      : {};
  }

  function getSemesterLabel(id, lang) {
    const semester = getSemesterConfig()[id];

    if (semester) {
      return normalizeLang(lang) === 'zh'
        ? (semester.labelZH || semester.labelEN || id)
        : (semester.labelEN || semester.labelZH || id);
    }

    const fallback = {
      'freshman-first': {
        en: 'Freshman Year - First Semester',
        zh: '大一秋季学期'
      },
      'freshman-second': {
        en: 'Freshman Year - Second Semester',
        zh: '大一春季学期'
      },
      'sophomore-first': {
        en: 'Sophomore Year - First Semester',
        zh: '大二秋季学期'
      },
      'sophomore-second': {
        en: 'Sophomore Year - Second Semester',
        zh: '大二春季学期'
      },
      'junior-first': {
        en: 'Junior Year - First Semester',
        zh: '大三秋季学期'
      },
      'junior-second': {
        en: 'Junior Year - Second Semester',
        zh: '大三春季学期'
      },
      'senior-first': {
        en: 'Senior Year - First Semester',
        zh: '大四秋季学期'
      },
      'senior-second': {
        en: 'Senior Year - Second Semester',
        zh: '大四春季学期'
      }
    };

    const item = fallback[id];
    if (!item) return id || '';

    return normalizeLang(lang) === 'zh' ? item.zh : item.en;
  }

  function getAvailableSemesters() {
    const config = getSemesterConfig();
    const ids = SEMESTER_ORDER.filter(function (id) {
      return document.getElementById(id) || config[id];
    });

    if (ids.length) return ids;

    return Array.from(document.querySelectorAll('#my-timetable-section .semester-timetable-container'))
      .map(function (container) {
        return container.id;
      })
      .filter(Boolean);
  }

  function getActiveSemesterId() {
    const active = document.querySelector('#my-timetable-section .semester-timetable-container.active');
    if (active && active.id) return active.id;

    const select = document.querySelector('#my-timetable-section [data-schedule-semester-select]');
    if (select && select.value) return select.value;

    return DEFAULT_SEMESTER_ID;
  }

  function dispatchSemesterChange(semesterId) {
    try {
      if (typeof CustomEvent === 'function') {
        window.dispatchEvent(new CustomEvent('schedule:semesterchange', {
          detail: {
            semesterId: semesterId
          }
        }));
      } else {
        const evt = document.createEvent('CustomEvent');
        evt.initCustomEvent('schedule:semesterchange', false, false, {
          semesterId: semesterId
        });
        window.dispatchEvent(evt);
      }
    } catch (e) { }
  }

  function activateSemester(semesterId) {
    const targetId = semesterId || DEFAULT_SEMESTER_ID;
    const target = document.getElementById(targetId);

    if (!target) return;

    document.querySelectorAll('#my-timetable-section .semester-timetable-container').forEach(function (container) {
      const isActive = container.id === targetId;
      container.classList.toggle('active', isActive);
      container.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    });

    const select = document.querySelector('#my-timetable-section [data-schedule-semester-select]');
    if (select && select.value !== targetId) {
      select.value = targetId;
    }

    const root = document.querySelector('#my-timetable-section .semester-selector');
    if (root) {
      root.dataset.activeSemester = targetId;
    }

    if (window.ScheduleWeekSelector && typeof window.ScheduleWeekSelector.applyWeekSelection === 'function') {
      window.ScheduleWeekSelector.applyWeekSelection('my');
    }

    dispatchSemesterChange(targetId);
  }

  function buildSemesterSelect(root) {
    const lang = getCurrentLang();
    const text = textFor(lang);
    const semesterIds = getAvailableSemesters();
    const activeSemesterId = getActiveSemesterId() || DEFAULT_SEMESTER_ID;

    root.classList.add('schedule-semester-panel');
    root.dataset.scheduleSemesterMounted = 'true';

    root.innerHTML = '';

    const label = document.createElement('label');
    label.className = 'schedule-semester-label';
    label.setAttribute('for', 'schedule-semester-select');
    label.textContent = text.selectSemester;

    const selectWrap = document.createElement('div');
    selectWrap.className = 'schedule-semester-select-wrap';

    const select = document.createElement('select');
    select.id = 'schedule-semester-select';
    select.className = 'schedule-semester-select';
    select.dataset.scheduleSemesterSelect = 'true';
    select.setAttribute('aria-label', text.selectSemester);

    semesterIds.forEach(function (id) {
      const option = document.createElement('option');
      option.value = id;
      option.textContent = getSemesterLabel(id, lang);
      select.appendChild(option);
    });

    if (semesterIds.indexOf(activeSemesterId) !== -1) {
      select.value = activeSemesterId;
    } else if (semesterIds.indexOf(DEFAULT_SEMESTER_ID) !== -1) {
      select.value = DEFAULT_SEMESTER_ID;
    } else if (semesterIds.length) {
      select.value = semesterIds[0];
    }

    select.addEventListener('change', function () {
      activateSemester(select.value);
    });

    selectWrap.appendChild(select);
    root.appendChild(label);
    root.appendChild(selectWrap);

    activateSemester(select.value || DEFAULT_SEMESTER_ID);
  }

  function refreshLanguage() {
    const lang = getCurrentLang();
    const text = textFor(lang);
    const root = document.querySelector('#my-timetable-section .semester-selector');
    const label = root ? root.querySelector('.schedule-semester-label') : null;
    const select = root ? root.querySelector('[data-schedule-semester-select]') : null;

    if (label) {
      label.textContent = text.selectSemester;
    }

    if (!select) return;

    const selected = select.value || getActiveSemesterId() || DEFAULT_SEMESTER_ID;
    select.setAttribute('aria-label', text.selectSemester);

    Array.from(select.options).forEach(function (option) {
      option.textContent = getSemesterLabel(option.value, lang);
    });

    select.value = selected;
  }

  function mount() {
    const root = document.querySelector('#my-timetable-section .semester-selector');
    if (!root) return false;

    buildSemesterSelect(root);
    refreshLanguage();

    return true;
  }

  function initWithRetry() {
    if (retryTimer) {
      clearTimeout(retryTimer);
      retryTimer = null;
    }

    let attempts = 0;
    const maxAttempts = 50;

    const tick = function () {
      attempts += 1;

      const mounted = mount();

      if (!mounted && attempts < maxAttempts) {
        retryTimer = setTimeout(tick, 100);
      }
    };

    tick();
  }

  window.addEventListener('site:langchange', function () {
    refreshLanguage();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWithRetry);
  } else {
    initWithRetry();
  }

  window.ScheduleSemesterSelector = window.ScheduleSemesterSelector || {};
  window.ScheduleSemesterSelector.init = initWithRetry;
  window.ScheduleSemesterSelector.activateSemester = activateSemester;
  window.ScheduleSemesterSelector.getActiveSemesterId = getActiveSemesterId;

  window.Schedule = window.Schedule || {};
  window.Schedule.initSemesterSelection = initWithRetry;
})();
