(function () {
  'use strict';

  const MIN_WEEK = 1;
  const MAX_WEEK = 18;
  const SELECTOR_CLASS = 'schedule-week-selector-control';

  const state = {
    my: 'all',
    ustc: 'all'
  };

  const UI_TEXT = {
    en: {
      selectWeek: 'Select Week',
      allWeeks: 'All Weeks',
      weekOption: function (week) { return 'Week ' + week; },
      weekCell: function (week) { return week + ' week(s)'; }
    },
    zh: {
      selectWeek: '选择周次',
      allWeeks: '全部周次',
      weekOption: function (week) { return '第' + week + '周'; },
      weekCell: function (week) { return '第' + week + '周'; }
    }
  };

  function normalizeLang(lang) {
    const value = String(lang || '').toLowerCase();
    return (value === 'zh' || value.startsWith('zh')) ? 'zh' : 'en';
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

  function cleanWeekText(value) {
    return String(value || '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function toEnglishWeeksText(value) {
    let text = cleanWeekText(value);
    if (!text) return '';

    text = text
      .replace(/^第\s*/g, '')
      .replace(/\s*周$/g, '')
      .replace(/week\(s\)/gi, '')
      .replace(/\bweeks?\b/gi, '')
      .replace(/（\s*单\s*）/g, ' (odd)')
      .replace(/（\s*双\s*）/g, ' (even)')
      .replace(/\b单\b/g, 'odd')
      .replace(/\b双\b/g, 'even')
      .replace(/[，、]/g, ', ')
      .replace(/\s*,\s*/g, ', ')
      .replace(/\s+/g, ' ')
      .trim();

    return text ? (text + ' week(s)') : '';
  }

  function toChineseWeeksText(value) {
    let text = cleanWeekText(value);
    if (!text) return '';

    text = text
      .replace(/^第\s*/g, '')
      .replace(/\s*周$/g, '')
      .replace(/week\(s\)/gi, '')
      .replace(/\bweeks?\b/gi, '')
      .replace(/\(\s*odd\s*\)/gi, '（单）')
      .replace(/\(\s*even\s*\)/gi, '（双）')
      .replace(/\bodd\b/gi, '单')
      .replace(/\beven\b/gi, '双')
      .replace(/[，,]\s*/g, '、')
      .replace(/\s*、\s*/g, '、')
      .replace(/\s+/g, ' ')
      .replace(/\s*（/g, '（')
      .replace(/）\s*/g, '）')
      .trim();

    return text ? ('第' + text + '周') : '';
  }

  function weekTextForLang(value, lang) {
    return normalizeLang(lang) === 'zh'
      ? toChineseWeeksText(value)
      : toEnglishWeeksText(value);
  }

  function selectedWeekText(week, lang) {
    const normalized = normalizeLang(lang);
    return textFor(normalized).weekCell(week);
  }

  function storeOriginalWeekText(weeksEl) {
    if (!weeksEl || !weeksEl.dataset) return;
    if (weeksEl.dataset.weekSelectorOriginalText) return;

    const sourceText = weeksEl.dataset.enText || weeksEl.textContent || '';
    weeksEl.dataset.weekSelectorOriginalText = cleanWeekText(sourceText);
  }

  function getWeekTargets(type) {
    if (type === 'ustc') {
      return Array.from(document.querySelectorAll(
        '#ustc-timetable .overlap-course .weeks, #ustc-timetable .course-container .weeks'
      ));
    }

    return Array.from(document.querySelectorAll(
      '#my-timetable-section .semester-timetable-container .timetable .course-container .weeks, ' +
      '#my-timetable-section .semester-timetable-container .timetable .overlap-course .weeks'
    ));
  }

  function setTextIfChanged(element, text) {
    const next = String(text == null ? '' : text);
    if (element && element.textContent !== next) {
      element.textContent = next;
    }
  }

  function applyWeekSelection(type) {
    const lang = getCurrentLang();
    const selected = state[type] || 'all';
    const targets = getWeekTargets(type);

    targets.forEach((weeksEl) => {
      storeOriginalWeekText(weeksEl);

      if (selected === 'all') {
        const original = weeksEl.dataset.weekSelectorOriginalText || weeksEl.dataset.enText || weeksEl.textContent || '';
        setTextIfChanged(weeksEl, weekTextForLang(original, lang));
        return;
      }

      const week = parseInt(selected, 10);
      if (Number.isFinite(week)) {
        setTextIfChanged(weeksEl, selectedWeekText(week, lang));
      }
    });
  }

  function applyAllWeekSelections() {
    applyWeekSelection('my');
    applyWeekSelection('ustc');
  }

  function createWeekControl(type) {
    const lang = getCurrentLang();
    const text = textFor(lang);

    const control = document.createElement('div');
    control.className = 'schedule-export-control ' + SELECTOR_CLASS;
    control.dataset.weekSelectorType = type;

    const label = document.createElement('label');
    label.textContent = text.selectWeek;

    const select = document.createElement('select');
    select.setAttribute('aria-label', text.selectWeek);
    select.dataset.scheduleWeekSelect = type;

    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = text.allWeeks;
    select.appendChild(allOption);

    for (let week = MIN_WEEK; week <= MAX_WEEK; week += 1) {
      const option = document.createElement('option');
      option.value = String(week);
      option.textContent = text.weekOption(week);
      select.appendChild(option);
    }

    select.value = state[type] || 'all';
    select.addEventListener('change', () => {
      state[type] = select.value || 'all';
      applyWeekSelection(type);
    });

    control.appendChild(label);
    control.appendChild(select);

    return control;
  }

  function updateWeekControlLanguage(control) {
    if (!control) return;

    const type = control.dataset.weekSelectorType || 'my';
    const lang = getCurrentLang();
    const text = textFor(lang);
    const label = control.querySelector('label');
    const select = control.querySelector('select');

    if (label) setTextIfChanged(label, text.selectWeek);
    if (select) {
      const selectedValue = select.value || state[type] || 'all';
      select.setAttribute('aria-label', text.selectWeek);

      const allOption = select.querySelector('option[value="all"]');
      if (allOption) setTextIfChanged(allOption, text.allWeeks);

      for (let week = MIN_WEEK; week <= MAX_WEEK; week += 1) {
        const option = select.querySelector('option[value="' + week + '"]');
        if (option) setTextIfChanged(option, text.weekOption(week));
      }

      select.value = selectedValue;
    }
  }

  function mountMyWeekSelector() {
    if (document.querySelector('[data-week-selector-mounted="my"]')) return;

    const row = document.querySelector('#my-timetable-section .schedule-export-my-row');
    const toolbar = document.querySelector('#my-timetable-section [data-schedule-export-mounted="my"]');
    if (!row || !toolbar) return;

    const control = createWeekControl('my');
    control.dataset.weekSelectorMounted = 'my';
    row.insertBefore(control, toolbar);
    applyWeekSelection('my');
  }

  function mountUstcWeekSelector() {
    if (document.querySelector('[data-week-selector-mounted="ustc"]')) return;

    const row = document.querySelector('#ustc-timetable-section .schedule-export-ustc-row');
    const toolbar = document.querySelector('#ustc-timetable-section [data-schedule-export-mounted="ustc"]');
    if (!row || !toolbar) return;

    const hint = row.querySelector('.ustc-local-save-hint');
    if (hint) {
      row.parentNode.insertBefore(hint, row.nextSibling);
    }

    const control = createWeekControl('ustc');
    control.dataset.weekSelectorMounted = 'ustc';
    row.insertBefore(control, toolbar);
    applyWeekSelection('ustc');
  }

  function mountWeekSelectors() {
    mountMyWeekSelector();
    mountUstcWeekSelector();
  }

  function refreshControlLanguage() {
    document.querySelectorAll('.' + SELECTOR_CLASS).forEach(updateWeekControlLanguage);
  }

  function init() {
    mountWeekSelectors();
    refreshControlLanguage();
    applyAllWeekSelections();
  }

  function initWithRetry() {
    let attempts = 0;
    const maxAttempts = 50;

    const tick = () => {
      attempts += 1;
      init();

      const myMounted = !!document.querySelector('[data-week-selector-mounted="my"]');
      const ustcMounted = !!document.querySelector('[data-week-selector-mounted="ustc"]');

      if ((!myMounted || !ustcMounted) && attempts < maxAttempts) {
        setTimeout(tick, 100);
      }
    };

    tick();
  }

  let observerPending = false;

  function scheduleObservedRefresh() {
    if (observerPending) return;
    observerPending = true;

    const run = () => {
      observerPending = false;
      init();
    };

    if (typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(run);
    } else {
      setTimeout(run, 0);
    }
  }

  function observeScheduleMutations() {
    const root = document.getElementById('schedule');
    if (!root || typeof MutationObserver !== 'function') return;

    const observer = new MutationObserver(scheduleObservedRefresh);
    observer.observe(root, {
      childList: true,
      subtree: true
    });
  }

  window.addEventListener('site:langchange', function () {
    refreshControlLanguage();
    applyAllWeekSelections();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initWithRetry();
      observeScheduleMutations();
    });
  } else {
    initWithRetry();
    observeScheduleMutations();
  }

  window.ScheduleWeekSelector = window.ScheduleWeekSelector || {};
  window.ScheduleWeekSelector.init = init;
  window.ScheduleWeekSelector.applyWeekSelection = applyWeekSelection;
})();
