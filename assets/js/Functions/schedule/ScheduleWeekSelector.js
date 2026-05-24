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

  let originalRenderUstcTimetable = null;
  let isRenderingUstc = false;

  function normalizeLang(lang) {
    const value = String(lang || '').toLowerCase();
    return (value === 'zh' || value.startsWith('zh')) ? 'zh' : 'en';
  }

  function getCurrentLangForWeekSelector() {
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
    return textFor(lang).weekCell(week);
  }

  function parseWeeksFromText(value) {
    let text = cleanWeekText(value);
    const result = new Set();

    if (!text) return result;

    text = text
      .replace(/^第\s*/g, '')
      .replace(/\s*周$/g, '')
      .replace(/week\(s\)/gi, '')
      .replace(/\bweeks?\b/gi, '')
      .replace(/（\s*单\s*）/g, ' odd ')
      .replace(/（\s*双\s*）/g, ' even ')
      .replace(/\(\s*odd\s*\)/gi, ' odd ')
      .replace(/\(\s*even\s*\)/gi, ' even ')
      .replace(/\b单\b/g, ' odd ')
      .replace(/\b双\b/g, ' even ')
      .replace(/[，、;]/g, ',')
      .replace(/\s+/g, ' ')
      .trim();

    const parts = text.split(',')
      .map(function (part) { return part.trim(); })
      .filter(Boolean);

    parts.forEach(function (part) {
      const lower = part.toLowerCase();
      const oddOnly = /\bodd\b/i.test(lower);
      const evenOnly = /\beven\b/i.test(lower);

      const cleaned = part
        .replace(/\bodd\b/gi, '')
        .replace(/\beven\b/gi, '')
        .replace(/[()（）]/g, '')
        .trim();

      const rangeMatch = cleaned.match(/(\d+)\s*-\s*(\d+)/);
      if (rangeMatch) {
        const start = parseInt(rangeMatch[1], 10);
        const end = parseInt(rangeMatch[2], 10);
        const left = Math.min(start, end);
        const right = Math.max(start, end);

        for (let week = left; week <= right; week += 1) {
          if (week < MIN_WEEK || week > MAX_WEEK) continue;
          if (oddOnly && week % 2 === 0) continue;
          if (evenOnly && week % 2 !== 0) continue;
          result.add(week);
        }
        return;
      }

      const numbers = cleaned.match(/\d+/g) || [];
      numbers.forEach(function (numText) {
        const week = parseInt(numText, 10);
        if (week < MIN_WEEK || week > MAX_WEEK) return;
        if (oddOnly && week % 2 === 0) return;
        if (evenOnly && week % 2 !== 0) return;
        result.add(week);
      });
    });

    return result;
  }

  function storeOriginalWeekText(weeksEl) {
    if (!weeksEl || !weeksEl.dataset) return;

    if (!weeksEl.dataset.weekSelectorOriginalText) {
      const sourceText = weeksEl.dataset.enText || weeksEl.textContent || '';
      weeksEl.dataset.weekSelectorOriginalText = cleanWeekText(sourceText);
    }

    if (!weeksEl.dataset.weekSelectorWeeks) {
      const weeks = Array.from(parseWeeksFromText(weeksEl.dataset.weekSelectorOriginalText));
      weeksEl.dataset.weekSelectorWeeks = weeks.join(',');
    }
  }

  function getStoredWeeks(weeksEl) {
    storeOriginalWeekText(weeksEl);

    const raw = weeksEl && weeksEl.dataset
      ? weeksEl.dataset.weekSelectorWeeks || ''
      : '';

    return raw.split(',')
      .map(function (value) { return parseInt(value, 10); })
      .filter(function (value) { return Number.isFinite(value); });
  }

  function setTextIfChanged(element, text) {
    const next = String(text == null ? '' : text);
    if (element && element.textContent !== next) {
      element.textContent = next;
    }
  }

  function courseBlockMatchesWeek(block, selectedWeek) {
    if (selectedWeek === 'all') return true;

    const week = parseInt(selectedWeek, 10);
    if (!Number.isFinite(week)) return true;

    const weeksEl = block ? block.querySelector('.weeks') : null;
    if (!weeksEl) return true;

    const weeks = getStoredWeeks(weeksEl);

    if (!weeks.length) return true;

    return weeks.indexOf(week) !== -1;
  }

  function getMyCourseBlocks() {
    return Array.from(document.querySelectorAll(
      '#my-timetable-section .semester-timetable-container .timetable .course-container, ' +
      '#my-timetable-section .semester-timetable-container .timetable .overlap-course'
    ));
  }

  function storeMyCellState(cell) {
    if (!cell || !cell.dataset) return;

    if (cell.dataset.weekSelectorOriginalClass == null) {
      cell.dataset.weekSelectorOriginalClass = cell.className || '';
    }

    if (cell.dataset.weekSelectorOriginalCursor == null) {
      cell.dataset.weekSelectorOriginalCursor = cell.style.cursor || '';
    }
  }

  function resetMyCellState(cell) {
    if (!cell || !cell.dataset) return;

    if (cell.dataset.weekSelectorOriginalClass != null) {
      cell.className = cell.dataset.weekSelectorOriginalClass;
    }

    if (cell.dataset.weekSelectorOriginalCursor != null) {
      cell.style.cursor = cell.dataset.weekSelectorOriginalCursor;
    }

    cell.removeAttribute('data-week-selector-empty');
  }

  function updateMyCellVisibility(cell) {
    if (!cell) return;

    storeMyCellState(cell);
    resetMyCellState(cell);

    const blocks = Array.from(cell.querySelectorAll('.course-container, .overlap-course'));
    if (!blocks.length) return;

    const visibleBlocks = blocks.filter(function (block) {
      return block.dataset.scheduleWeekHidden !== 'true';
    });

    if (!visibleBlocks.length) {
      cell.classList.remove('has-event', 'has-class', 'event-cell');
      cell.classList.add('empty-cell');
      cell.style.cursor = 'default';
      cell.dataset.weekSelectorEmpty = 'true';
    }
  }

  function applyMyWeekSelection() {
    const lang = getCurrentLangForWeekSelector();
    const selected = state.my || 'all';
    const blocks = getMyCourseBlocks();

    blocks.forEach(function (block) {
      const matched = courseBlockMatchesWeek(block, selected);
      const weeksEl = block.querySelector('.weeks');

      block.dataset.scheduleWeekHidden = matched ? 'false' : 'true';

      if (!weeksEl) return;

      storeOriginalWeekText(weeksEl);

      if (!matched) return;

      if (selected === 'all') {
        const original = weeksEl.dataset.weekSelectorOriginalText || weeksEl.dataset.enText || weeksEl.textContent || '';
        setTextIfChanged(weeksEl, weekTextForLang(original, lang));
      } else {
        const week = parseInt(selected, 10);
        if (Number.isFinite(week)) {
          setTextIfChanged(weeksEl, selectedWeekText(week, lang));
        }
      }
    });

    const cells = new Set();
    blocks.forEach(function (block) {
      const cell = block.closest('td');
      if (cell) cells.add(cell);
    });

    cells.forEach(updateMyCellVisibility);
  }

  function classMatchesSelectedWeek(cls, selectedWeek) {
    if (selectedWeek === 'all') return true;

    const week = parseInt(selectedWeek, 10);
    if (!Number.isFinite(week)) return true;

    const weeks = Array.isArray(cls && cls.weeks)
      ? cls.weeks.map(function (value) {
        return parseInt(value, 10);
      }).filter(function (value) {
        return Number.isFinite(value);
      })
      : [];

    if (!weeks.length) return true;

    return weeks.indexOf(week) !== -1;
  }

  function patchUstcRender() {
    if (originalRenderUstcTimetable) return;
    if (typeof renderUstcTimetable !== 'function') return;

    originalRenderUstcTimetable = renderUstcTimetable;

    renderUstcTimetable = function patchedRenderUstcTimetable() {
      if (isRenderingUstc) {
        return originalRenderUstcTimetable();
      }

      const selected = state.ustc || 'all';

      if (selected === 'all' || typeof ustcClasses === 'undefined' || !Array.isArray(ustcClasses)) {
        return originalRenderUstcTimetable();
      }

      const fullClasses = ustcClasses;
      const filteredClasses = fullClasses.filter(function (cls) {
        return classMatchesSelectedWeek(cls, selected);
      });

      try {
        isRenderingUstc = true;
        ustcClasses = filteredClasses;
        originalRenderUstcTimetable();
      } finally {
        ustcClasses = fullClasses;
        isRenderingUstc = false;
      }

      if (typeof renderUstcClassesList === 'function') {
        renderUstcClassesList();
      }
    };
  }

  function applyUstcWeekText() {
    const selected = state.ustc || 'all';
    if (selected === 'all') return;

    const lang = getCurrentLangForWeekSelector();
    const week = parseInt(selected, 10);
    if (!Number.isFinite(week)) return;

    document.querySelectorAll('#ustc-timetable .weeks').forEach(function (weeksEl) {
      setTextIfChanged(weeksEl, selectedWeekText(week, lang));
    });
  }

  function applyUstcWeekSelection() {
    patchUstcRender();

    if (typeof renderUstcTimetable === 'function') {
      renderUstcTimetable();
    }

    applyUstcWeekText();
  }

  function applyWeekSelection(type) {
    if (type === 'ustc') {
      applyUstcWeekSelection();
      return;
    }

    applyMyWeekSelection();
  }

  function createWeekControl(type) {
    const lang = getCurrentLangForWeekSelector();
    const text = textFor(lang);

    const control = document.createElement('div');
    control.className = 'schedule-week-panel ' + SELECTOR_CLASS;
    control.dataset.weekSelectorType = type;

    const label = document.createElement('label');
    label.textContent = text.selectWeek;

    const selectWrap = document.createElement('div');
    selectWrap.className = 'schedule-week-select-wrap';

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

    select.addEventListener('change', function () {
      state[type] = select.value || 'all';
      applyWeekSelection(type);
    });

    selectWrap.appendChild(select);
    control.appendChild(label);
    control.appendChild(selectWrap);

    return control;
  }

  function updateWeekControlLanguage(control) {
    if (!control) return;

    const type = control.dataset.weekSelectorType || 'my';
    const lang = getCurrentLangForWeekSelector();
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

    row.classList.add('schedule-control-row', 'schedule-control-row-my');

    const selector = row.querySelector('.semester-selector');
    if (selector) {
      selector.classList.add('schedule-semester-panel');
    }

    const control = createWeekControl('my');
    control.dataset.weekSelectorMounted = 'my';

    row.insertBefore(control, toolbar);

    applyMyWeekSelection();
  }

  function mountUstcWeekSelector() {
    if (document.querySelector('[data-week-selector-mounted="ustc"]')) return;

    const row = document.querySelector('#ustc-timetable-section .schedule-export-ustc-row');
    const toolbar = document.querySelector('#ustc-timetable-section [data-schedule-export-mounted="ustc"]');
    if (!row || !toolbar) return;

    row.classList.add('schedule-control-row', 'schedule-control-row-ustc');

    const hint = row.querySelector('.ustc-local-save-hint');
    if (hint) {
      hint.classList.add('schedule-control-hint-below');
      row.parentNode.insertBefore(hint, row.nextSibling);
    }

    const control = createWeekControl('ustc');
    control.dataset.weekSelectorMounted = 'ustc';

    row.insertBefore(control, toolbar);

    applyUstcWeekSelection();
  }

  function mountWeekSelectors() {
    mountMyWeekSelector();
    mountUstcWeekSelector();
  }

  function refreshControlLanguage() {
    document.querySelectorAll('.' + SELECTOR_CLASS).forEach(updateWeekControlLanguage);
  }

  function init() {
    patchUstcRender();
    mountWeekSelectors();
    refreshControlLanguage();
    applyMyWeekSelection();
    applyUstcWeekText();
  }

  function initWithRetry() {
    let attempts = 0;
    const maxAttempts = 50;

    const tick = function () {
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

    const run = function () {
      observerPending = false;
      mountWeekSelectors();
      refreshControlLanguage();
      applyMyWeekSelection();
      applyUstcWeekText();
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
    applyMyWeekSelection();
    applyUstcWeekText();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
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
