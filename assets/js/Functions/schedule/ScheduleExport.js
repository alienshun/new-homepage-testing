(function () {
  'use strict';

  const PERIOD_TIMES = {
    1: { start: '07:50', end: '08:35' },
    2: { start: '08:40', end: '09:25' },
    3: { start: '09:45', end: '10:30' },
    4: { start: '10:35', end: '11:20' },
    5: { start: '11:25', end: '12:10' },
    6: { start: '14:00', end: '14:45' },
    7: { start: '14:50', end: '15:35' },
    8: { start: '15:55', end: '16:40' },
    9: { start: '16:45', end: '17:30' },
    10: { start: '17:35', end: '18:20' },
    11: { start: '19:30', end: '20:15' },
    12: { start: '20:20', end: '21:05' },
    13: { start: '21:10', end: '21:55' }
  };

  const DAY_NAMES = {
    en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    zh: ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  };

  const UI_TEXT = {
    en: {
      format: 'Format',
      language: 'Language',
      semester: 'Semester',
      export: 'Export',
      pdf: 'PDF',
      csv: 'CSV',
      ics: 'ICS',
      english: 'EN',
      chinese: '中文',
      title: 'Timetable',
      source: 'Source',
      sourceMy: 'My Timetable',
      sourceUstc: 'USTC Timetable',
      generatedAt: 'Exported at',
      timetableSection: 'Timetable',
      classesSection: 'My Classes',
      noClasses: 'No classes available.',
      selectSemesterAlert: 'Please select a valid semester before exporting ICS.',
      noTimetableAlert: 'No timetable was found for export.',
      noEventsAlert: 'No timetable events were found for ICS export.',
      csvTimetableMarker: '[Timetable]',
      csvClassesMarker: '[My Classes]',
      headers: {
        courseNumber: 'Course Number',
        courseName: 'Course Name',
        instructor: 'Instructor',
        day: 'Day',
        periodRange: 'Period Range',
        startTime: 'Start Time',
        endTime: 'End Time',
        weeks: 'Weeks',
        location: 'Location',
        credits: 'Credits'
      }
    },

    zh: {
      format: '格式',
      language: '语言',
      semester: '学期',
      export: '导出',
      pdf: 'PDF',
      csv: 'CSV',
      ics: 'ICS',
      english: 'EN',
      chinese: '中文',
      title: '课程表',
      source: '来源',
      sourceMy: '我的课程表',
      sourceUstc: 'USTC 课程表',
      generatedAt: '导出时间',
      timetableSection: '课程表',
      classesSection: '我的课程',
      noClasses: '暂无课程。',
      selectSemesterAlert: '请先选择有效学期，再导出 ICS。',
      noTimetableAlert: '未找到可导出的课程表。',
      noEventsAlert: '未找到可导出到 ICS 的课程事件。',
      csvTimetableMarker: '[课程表]',
      csvClassesMarker: '[我的课程]',
      headers: {
        courseNumber: '课程号',
        courseName: '课程名称',
        instructor: '授课教师',
        day: '星期',
        periodRange: '节次',
        startTime: '开始时间',
        endTime: '结束时间',
        weeks: '周次',
        location: '地点',
        credits: '学分'
      }
    }
  };

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function normalizeLang(lang) {
    const value = String(lang || '').toLowerCase();
    return (value === 'zh' || value.startsWith('zh')) ? 'zh' : 'en';
  }

  function getCurrentLang() {
    if (window.SiteLang && typeof window.SiteLang.getLang === 'function') {
      return normalizeLang(window.SiteLang.getLang());
    }

    const lang = String((document.body && document.body.dataset && document.body.dataset.lang) || 'en').toLowerCase();
    return normalizeLang(lang);
  }

  function dispatchLangChange(lang) {
    const normalized = normalizeLang(lang);

    if (document.body && document.body.dataset) {
      document.body.dataset.lang = normalized;
    }

    try {
      if (typeof CustomEvent === 'function') {
        window.dispatchEvent(new CustomEvent('site:langchange', { detail: { lang: normalized } }));
      } else {
        const evt = document.createEvent('CustomEvent');
        evt.initCustomEvent('site:langchange', false, false, { lang: normalized });
        window.dispatchEvent(evt);
      }
    } catch (e) { }
  }

  async function prepareExportLanguage(targetLang) {
    const target = normalizeLang(targetLang);
    const originalLang = getCurrentLang();
    const originalBodyLang = document.body && document.body.dataset
      ? document.body.dataset.lang
      : undefined;

    if (target === originalLang) {
      return async function noopRestore() { };
    }

    dispatchLangChange(target);
    await delay(180);

    return async function restoreExportLanguage() {
      if (document.body && document.body.dataset) {
        if (originalBodyLang == null) {
          delete document.body.dataset.lang;
        } else {
          document.body.dataset.lang = originalBodyLang;
        }
      }

      dispatchLangChange(originalLang);
      await delay(120);
    };
  }

  function textFor(lang) {
    return UI_TEXT[normalizeLang(lang)] || UI_TEXT.en;
  }

  function getSemesterConfig() {
    return (window.SCHEDULE_SEMESTER_CONFIG && window.SCHEDULE_SEMESTER_CONFIG.semesters)
      ? window.SCHEDULE_SEMESTER_CONFIG.semesters
      : {};
  }

  function getDefaultSemesterId() {
    return (window.SCHEDULE_SEMESTER_CONFIG && window.SCHEDULE_SEMESTER_CONFIG.defaultSemesterId)
      ? window.SCHEDULE_SEMESTER_CONFIG.defaultSemesterId
      : 'junior-second';
  }

  function getSemester(id) {
    return getSemesterConfig()[id] || null;
  }

  function getSemesterLabel(id, lang) {
    const semester = getSemester(id);
    if (!semester) return id || '';
    return normalizeLang(lang) === 'zh'
      ? (semester.labelZH || semester.labelEN || id)
      : (semester.labelEN || semester.labelZH || id);
  }

  function getFileSemesterLabel(id) {
    const semester = getSemester(id);
    return semester ? (semester.labelEN || semester.id || id) : (id || 'Unknown_Semester');
  }

  function sanitizeFileNamePart(value) {
    return String(value || '')
      .trim()
      .replace(/[\\/:*?"<>|]+/g, '')
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_');
  }

  function buildFileName(semesterId, lang, format) {
    const semesterPart = sanitizeFileNamePart(getFileSemesterLabel(semesterId));
    const langPart = normalizeLang(lang) === 'zh' ? 'ZH' : 'EN';
    return `Timetable_${semesterPart}_${langPart}.${String(format || '').toLowerCase()}`;
  }

  function downloadTextFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType || 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      URL.revokeObjectURL(url);
      link.remove();
    }, 0);
  }

  function escapeCsv(value) {
    const str = String(value == null ? '' : value);
    if (/[",\n\r]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  function toCsvLine(values) {
    return values.map(escapeCsv).join(',');
  }

  function cleanText(value) {
    return String(value || '')
      .replace(/\u00a0/g, ' ')
      .replace(/[ \t]+/g, ' ')
      .replace(/\s*\n\s*/g, '\n')
      .trim();
  }

  function cleanInlineText(value) {
    return String(value || '')
      .replace(/\u00a0/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function parseNumber(value) {
    const match = String(value || '').match(/\d+/);
    return match ? parseInt(match[0], 10) : null;
  }

  function parseWeeksFromText(text, fallbackMaxWeeks) {
    const value = String(text || '');
    const weeks = new Set();

    const rangeRegex = /(\d+)\s*[-~–—]\s*(\d+)/g;
    let rangeMatch;
    while ((rangeMatch = rangeRegex.exec(value)) !== null) {
      const start = parseInt(rangeMatch[1], 10);
      const end = parseInt(rangeMatch[2], 10);
      if (Number.isFinite(start) && Number.isFinite(end)) {
        const min = Math.min(start, end);
        const max = Math.max(start, end);
        for (let week = min; week <= max; week++) {
          weeks.add(week);
        }
      }
    }

    const withoutRanges = value.replace(rangeRegex, ' ');
    const singleRegex = /\b(\d+)\b/g;
    let singleMatch;
    while ((singleMatch = singleRegex.exec(withoutRanges)) !== null) {
      const week = parseInt(singleMatch[1], 10);
      if (Number.isFinite(week)) weeks.add(week);
    }

    return Array.from(weeks)
      .filter((week) => week >= 1 && week <= (fallbackMaxWeeks || 30))
      .sort((a, b) => a - b);
  }

  function formatWeeks(weeks, lang) {
    if (!weeks || !weeks.length) return '';

    const sorted = Array.from(new Set(weeks.map((week) => parseInt(week, 10))))
      .filter(Number.isFinite)
      .sort((a, b) => a - b);

    if (!sorted.length) return '';

    const ranges = [];
    let start = sorted[0];
    let end = start;

    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] === end + 1) {
        end = sorted[i];
      } else {
        ranges.push(start === end ? String(start) : `${start}-${end}`);
        start = sorted[i];
        end = start;
      }
    }

    ranges.push(start === end ? String(start) : `${start}-${end}`);
    return normalizeLang(lang) === 'zh'
      ? `${ranges.join('，')}周`
      : `${ranges.join(', ')} week(s)`;
  }

  function getPeriodRange(start, end) {
    const s = parseInt(start, 10);
    const e = parseInt(end, 10);
    if (!Number.isFinite(s) || !Number.isFinite(e)) return '';
    return s === e ? String(s) : `${s}-${e}`;
  }

  function getStartTime(periodStart) {
    const p = parseInt(periodStart, 10);
    return PERIOD_TIMES[p] ? PERIOD_TIMES[p].start : '';
  }

  function getEndTime(periodEnd) {
    const p = parseInt(periodEnd, 10);
    return PERIOD_TIMES[p] ? PERIOD_TIMES[p].end : '';
  }

  function getDayName(day, lang) {
    const dayNumber = parseInt(day, 10);
    const names = DAY_NAMES[normalizeLang(lang)] || DAY_NAMES.en;
    return names[dayNumber] || '';
  }

  function dateAddDays(date, days) {
    const result = new Date(date.getTime());
    result.setDate(result.getDate() + days);
    return result;
  }

  function parseLocalDate(dateString) {
    const parts = String(dateString || '').split('-').map((part) => parseInt(part, 10));
    if (parts.length !== 3 || parts.some((part) => !Number.isFinite(part))) return null;
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function formatDateCompact(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  function formatDateTimeForICS(date, time) {
    const cleanTime = String(time || '00:00').trim();
    const parts = cleanTime.split(':');
    const hour = parts[0] || '00';
    const minute = parts[1] || '00';
    return `${formatDateCompact(date)}T${String(hour).padStart(2, '0')}${String(minute).padStart(2, '0')}00`;
  }

  function getDateForWeekAndDay(semesterId, week, day) {
    const semester = getSemester(semesterId);
    if (!semester || !semester.week1Monday) return null;

    const week1Monday = parseLocalDate(semester.week1Monday);
    if (!week1Monday) return null;

    const dayNumber = parseInt(day, 10);
    const mondayBasedOffset = dayNumber === 0 ? 6 : dayNumber - 1;
    return dateAddDays(week1Monday, (parseInt(week, 10) - 1) * 7 + mondayBasedOffset);
  }

  function getActiveSemesterId() {
    const active = document.querySelector('#my-timetable-section .semester-timetable-container.active');
    if (active && active.id) return active.id;

    const firstActiveLink = document.querySelector('.semester-dropdown-content a.active');
    if (firstActiveLink && firstActiveLink.dataset.semester) return firstActiveLink.dataset.semester;

    return getDefaultSemesterId();
  }

  function getExportContext(toolbar) {
    const type = toolbar && toolbar.dataset && toolbar.dataset.exportType === 'ustc'
      ? 'ustc'
      : 'my';

    const formatSelect = toolbar.querySelector('[data-schedule-export-format]');
    const langSelect = toolbar.querySelector('[data-schedule-export-lang]');
    const semesterSelect = toolbar.querySelector('[data-schedule-export-semester]');

    const format = (formatSelect && formatSelect.value) || 'pdf';
    const lang = normalizeLang((langSelect && langSelect.value) || getCurrentLang());
    const semesterId = type === 'ustc'
      ? ((semesterSelect && semesterSelect.value) || getDefaultSemesterId())
      : getActiveSemesterId();

    return {
      type,
      format,
      lang,
      semesterId,
      text: textFor(lang)
    };
  }

  function getActiveMyContainer() {
    return document.querySelector('#my-timetable-section .semester-timetable-container.active');
  }

  function getTimetableTable(type) {
    if (type === 'ustc') return document.getElementById('ustc-timetable');

    const active = getActiveMyContainer();
    return active ? active.querySelector('table.timetable') : null;
  }

  function getClassesContainer(type) {
    if (type === 'ustc') return document.getElementById('ustc-classes-container');

    const active = getActiveMyContainer();
    return active ? active.querySelector('.my-classes-container') : null;
  }

  function removeActionColumns(table) {
    if (!table) return;

    const headerCells = Array.from(table.querySelectorAll('thead th'));
    const actionIndexes = [];

    headerCells.forEach((th, index) => {
      const text = cleanInlineText(th.textContent).toLowerCase();
      if (text === 'actions' || text === 'action' || text === '操作') {
        actionIndexes.push(index);
      }
    });

    if (!actionIndexes.length) return;

    table.querySelectorAll('tr').forEach((row) => {
      const cells = Array.from(row.children);
      actionIndexes
        .slice()
        .sort((a, b) => b - a)
        .forEach((index) => {
          if (cells[index]) cells[index].remove();
        });
    });
  }

  function cloneForExport(element) {
    if (!element) return null;
    const clone = element.cloneNode(true);

    clone.querySelectorAll('button, input, select, textarea, .schedule-export-toolbar').forEach((node) => {
      node.remove();
    });

    clone.querySelectorAll('table').forEach(removeActionColumns);
    return clone;
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function buildPrintExportRoot(context) {
    const sourceLabel = context.type === 'ustc'
      ? context.text.sourceUstc
      : context.text.sourceMy;

    const root = document.createElement('div');
    root.className = 'schedule-print-export';
    root.setAttribute('aria-hidden', 'true');

    const header = document.createElement('div');
    header.className = 'schedule-print-header';

    const title = document.createElement('h1');
    title.textContent = context.text.title;

    const meta = document.createElement('div');
    meta.className = 'schedule-print-meta';
    meta.innerHTML = `
      <div><strong>${escapeHtml(context.text.semester)}:</strong> ${escapeHtml(getSemesterLabel(context.semesterId, context.lang))}</div>
      <div><strong>${escapeHtml(context.text.language)}:</strong> ${context.lang === 'zh' ? context.text.chinese : context.text.english}</div>
      <div><strong>${escapeHtml(context.text.format)}:</strong> PDF</div>
      <div><strong>${escapeHtml(context.text.generatedAt)}:</strong> ${escapeHtml(new Date().toLocaleString())}</div>
      <div><strong>${escapeHtml(context.text.source)}:</strong> ${escapeHtml(sourceLabel)}</div>
    `;

    header.appendChild(title);
    header.appendChild(meta);
    root.appendChild(header);

    const timetableTable = getTimetableTable(context.type);
    const classesContainer = getClassesContainer(context.type);

    const timetableBlock = document.createElement('section');
    timetableBlock.className = 'schedule-print-section';
    timetableBlock.innerHTML = `<h2>${escapeHtml(context.text.timetableSection)}</h2>`;

    const timetableClone = cloneForExport(timetableTable);
    if (timetableClone) {
      const tableWrap = document.createElement('div');
      tableWrap.className = 'schedule-print-table-wrap';
      tableWrap.appendChild(timetableClone);
      timetableBlock.appendChild(tableWrap);
    } else {
      const empty = document.createElement('p');
      empty.className = 'schedule-print-empty';
      empty.textContent = context.text.noTimetableAlert;
      timetableBlock.appendChild(empty);
    }

    root.appendChild(timetableBlock);

    const classesBlock = document.createElement('section');
    classesBlock.className = 'schedule-print-section schedule-print-classes-section';
    classesBlock.innerHTML = `<h2>${escapeHtml(context.text.classesSection)}</h2>`;

    const classesClone = cloneForExport(classesContainer);
    if (classesClone) {
      const existingTitle = classesClone.querySelector('h3');
      if (existingTitle) existingTitle.remove();

      const classesTableWrap = document.createElement('div');
      classesTableWrap.className = 'schedule-print-table-wrap';
      classesTableWrap.appendChild(classesClone);
      classesBlock.appendChild(classesTableWrap);
    } else {
      const empty = document.createElement('p');
      empty.className = 'schedule-print-empty';
      empty.textContent = context.text.noClasses;
      classesBlock.appendChild(empty);
    }

    root.appendChild(classesBlock);
    return root;
  }

  function exportPDF(context, restoreLang) {
    const root = buildPrintExportRoot(context);
    const filename = buildFileName(context.semesterId, context.lang, 'pdf');
    const oldTitle = document.title;

    document.body.appendChild(root);
    document.body.classList.add('schedule-export-print-mode');
    document.title = filename.replace(/\.pdf$/i, '');

    let cleaned = false;

    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;

      document.body.classList.remove('schedule-export-print-mode');
      document.title = oldTitle;
      root.remove();
      window.removeEventListener('afterprint', cleanup);

      if (typeof restoreLang === 'function') {
        restoreLang();
      }
    };

    window.addEventListener('afterprint', cleanup);

    setTimeout(() => {
      try {
        window.print();
      } catch (e) {
        cleanup();
        return;
      }

      setTimeout(() => {
        if (document.body.classList.contains('schedule-export-print-mode')) {
          cleanup();
        }
      }, 4000);
    }, 80);
  }

  function isHiddenCell(cell) {
    if (!cell) return true;
    if (cell.hidden) return true;
    if (cell.style && cell.style.display === 'none') return true;
    return false;
  }

  function getBlockText(block) {
    if (!block) return '';

    const parts = [];

    const selectors = [
      '.course-number',
      '.course-name',
      '.instructor',
      '.location',
      '.weeks'
    ];

    selectors.forEach((selector) => {
      const el = block.querySelector(selector);
      const text = cleanInlineText(el ? el.textContent : '');
      if (text) parts.push(text);
    });

    if (parts.length) return parts.join('\n');

    const clone = block.cloneNode(true);
    clone.querySelectorAll('button, input, select, textarea, .time-info').forEach((node) => node.remove());
    return cleanText(clone.textContent);
  }

  function getCellExportText(cell) {
    if (!cell) return '';

    const courseBlocks = cell.querySelectorAll('.course-container, .overlap-course');
    if (courseBlocks.length) {
      return Array.from(courseBlocks)
        .map(getBlockText)
        .filter(Boolean)
        .join('\n---\n');
    }

    const clone = cell.cloneNode(true);
    clone.querySelectorAll('button, input, select, textarea, .time-info').forEach((node) => node.remove());
    return cleanText(clone.textContent);
  }

  function tableToCsvMatrix(table) {
    if (!table) return [];

    const rows = Array.from(table.querySelectorAll('tr'));
    const matrix = [];

    rows.forEach((tr, rowIndex) => {
      if (!matrix[rowIndex]) matrix[rowIndex] = [];

      let colIndex = 0;

      Array.from(tr.children).forEach((cell) => {
        if (isHiddenCell(cell)) return;

        while (matrix[rowIndex][colIndex] !== undefined) {
          colIndex += 1;
        }

        const rowSpan = parseInt(cell.getAttribute('rowspan') || cell.rowSpan || 1, 10) || 1;
        const colSpan = parseInt(cell.getAttribute('colspan') || cell.colSpan || 1, 10) || 1;
        const text = getCellExportText(cell);

        for (let r = 0; r < rowSpan; r++) {
          const targetRow = rowIndex + r;
          if (!matrix[targetRow]) matrix[targetRow] = [];

          for (let c = 0; c < colSpan; c++) {
            const targetCol = colIndex + c;
            matrix[targetRow][targetCol] = (r === 0 && c === 0) ? text : '';
          }
        }

        colIndex += colSpan;
      });
    });

    const maxCols = matrix.reduce((max, row) => Math.max(max, row.length), 0);
    return matrix.map((row) => {
      const normalized = [];
      for (let i = 0; i < maxCols; i++) {
        normalized.push(row[i] == null ? '' : row[i]);
      }
      return normalized;
    });
  }

  function removeActionColumnsFromMatrix(matrix) {
    if (!matrix || !matrix.length) return matrix;

    const headerIndex = matrix.findIndex((row) => row.some((cell) => cleanInlineText(cell)));
    if (headerIndex < 0) return matrix;

    const header = matrix[headerIndex];
    const actionIndexes = [];

    header.forEach((value, index) => {
      const text = cleanInlineText(value).toLowerCase();
      if (text === 'actions' || text === 'action' || text === '操作') {
        actionIndexes.push(index);
      }
    });

    if (!actionIndexes.length) return matrix;

    return matrix.map((row) => row.filter((_, index) => !actionIndexes.includes(index)));
  }

  function exportCSV(context) {
    const timetableTable = getTimetableTable(context.type);
    const classesContainer = getClassesContainer(context.type);
    const classesTable = classesContainer ? classesContainer.querySelector('table') : null;

    const timetableMatrix = tableToCsvMatrix(timetableTable);
    const classesMatrix = removeActionColumnsFromMatrix(tableToCsvMatrix(classesTable));

    const rows = [];
    rows.push([context.text.csvTimetableMarker]);

    if (timetableMatrix.length) {
      timetableMatrix.forEach((row) => rows.push(row));
    } else {
      rows.push([context.text.noTimetableAlert]);
    }

    rows.push([]);
    rows.push([context.text.csvClassesMarker]);

    if (classesMatrix.length) {
      classesMatrix.forEach((row) => rows.push(row));
    } else {
      rows.push([context.text.noClasses]);
    }

    const csv = '\ufeff' + rows.map(toCsvLine).join('\r\n');
    const filename = buildFileName(context.semesterId, context.lang, 'csv');

    downloadTextFile(filename, csv, 'text/csv;charset=utf-8');
  }

  function escapeICS(value) {
    return String(value == null ? '' : value)
      .replace(/\\/g, '\\\\')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '')
      .replace(/,/g, '\\,')
      .replace(/;/g, '\\;');
  }

  function foldICSLine(line) {
    const str = String(line || '');
    if (str.length <= 73) return str;

    const parts = [];
    let remaining = str;

    while (remaining.length > 73) {
      parts.push(remaining.slice(0, 73));
      remaining = ' ' + remaining.slice(73);
    }

    parts.push(remaining);
    return parts.join('\r\n');
  }

  function extractCourseFromElement(element) {
    const courseNumber = cleanInlineText((element.querySelector('.course-number') || {}).textContent || '');
    const courseNameRaw = cleanInlineText((element.querySelector('.course-name') || {}).textContent || '');
    const instructor = cleanInlineText((element.querySelector('.instructor') || {}).textContent || '');
    const location = cleanInlineText((element.querySelector('.location') || {}).textContent || '');
    const weeksText = cleanInlineText((element.querySelector('.weeks') || {}).textContent || '');

    let courseName = courseNameRaw;
    let credits = '';

    const creditMatch = courseNameRaw.match(/\[([^\]]+)\]\s*$/);
    if (creditMatch) {
      credits = creditMatch[1].trim();
      courseName = cleanInlineText(courseNameRaw.replace(/\[([^\]]+)\]\s*$/, ''));
    }

    if (!credits) {
      const numberCreditMatch = courseNumber.match(/\[([^\]]+)\]\s*$/);
      if (numberCreditMatch) credits = numberCreditMatch[1].trim();
    }

    return {
      courseNumber,
      courseName,
      instructor,
      location,
      weeksText,
      credits
    };
  }

  function shouldReadAsCourseCell(cell) {
    if (!cell || cell.tagName !== 'TD') return false;

    return (
      cell.classList.contains('event-cell') ||
      cell.classList.contains('has-class') ||
      !!cell.querySelector('.course-container, .overlap-course')
    );
  }

  function getDayFromColumn(cell, colIndex) {
    if (cell && cell.dataset && cell.dataset.day != null && cell.dataset.day !== '') {
      const day = parseInt(cell.dataset.day, 10);
      if (Number.isFinite(day)) return day;
    }

    if (colIndex >= 2 && colIndex <= 8) {
      return colIndex === 8 ? 0 : colIndex - 1;
    }

    return null;
  }

  function flattenTimetableEventsFromDOM(table, semesterId) {
    if (!table) return [];

    const semester = getSemester(semesterId);
    const maxWeeks = semester ? semester.teachingWeeks : 20;
    const rows = Array.from(table.querySelectorAll('tbody tr'));
    const grid = [];
    const events = [];

    rows.forEach((tr, rowIndex) => {
      if (!grid[rowIndex]) grid[rowIndex] = [];

      let colIndex = 0;

      Array.from(tr.children).forEach((cell) => {
        if (isHiddenCell(cell)) return;

        while (grid[rowIndex][colIndex]) colIndex += 1;

        const rowSpan = parseInt(cell.getAttribute('rowspan') || cell.rowSpan || 1, 10) || 1;
        const colSpan = parseInt(cell.getAttribute('colspan') || cell.colSpan || 1, 10) || 1;

        for (let r = 0; r < rowSpan; r++) {
          const targetRow = rowIndex + r;
          if (!grid[targetRow]) grid[targetRow] = [];

          for (let c = 0; c < colSpan; c++) {
            grid[targetRow][colIndex + c] = {
              cell,
              anchor: r === 0 && c === 0,
              colIndex: colIndex + c,
              rowIndex
            };
          }
        }

        if (shouldReadAsCourseCell(cell)) {
          const periodCell = tr.querySelector('.period-number');
          const periodStart = parseNumber(cell.dataset && cell.dataset.period ? cell.dataset.period : (periodCell && periodCell.textContent));
          const periodEnd = periodStart ? periodStart + rowSpan - 1 : null;
          const day = getDayFromColumn(cell, colIndex);

          if (periodStart && periodEnd && day !== null) {
            const courseElements = cell.querySelectorAll('.overlap-course').length
              ? Array.from(cell.querySelectorAll('.overlap-course'))
              : Array.from(cell.querySelectorAll('.course-container'));

            const targets = courseElements.length ? courseElements : [cell];

            targets.forEach((target) => {
              const info = extractCourseFromElement(target);
              const weeks = parseWeeksFromText(info.weeksText, maxWeeks);

              if (info.courseName || info.courseNumber) {
                events.push({
                  courseNumber: info.courseNumber,
                  courseName: info.courseName,
                  instructor: info.instructor,
                  location: info.location,
                  credits: info.credits,
                  weeks,
                  day,
                  periodStart,
                  periodEnd
                });
              }
            });
          }
        }

        colIndex += colSpan;
      });
    });

    return dedupeEvents(events);
  }

  function getUstcClassesFromStorage() {
    try {
      const data = JSON.parse(localStorage.getItem('ustcClasses') || '[]');
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return [];
    }
  }

  function getUstcEventsFromStorage() {
    const classes = getUstcClassesFromStorage();
    const events = [];

    classes.forEach((cls) => {
      const days = Array.isArray(cls.days) ? cls.days : [];
      days.forEach((day) => {
        events.push({
          courseNumber: '',
          courseName: cleanInlineText(cls.courseName),
          instructor: cleanInlineText(cls.instructor),
          location: cleanInlineText(cls.location),
          credits: cleanInlineText(cls.credits),
          weeks: Array.isArray(cls.weeks) ? cls.weeks.map((week) => parseInt(week, 10)).filter(Number.isFinite) : [],
          day: parseInt(day, 10),
          periodStart: parseInt(cls.periodStart, 10),
          periodEnd: parseInt(cls.periodEnd, 10)
        });
      });
    });

    return dedupeEvents(events);
  }

  function eventKey(event) {
    return [
      event.courseNumber || '',
      event.courseName || '',
      event.instructor || '',
      event.location || '',
      event.credits || '',
      event.day,
      event.periodStart,
      event.periodEnd,
      (event.weeks || []).join('-')
    ].join('|');
  }

  function dedupeEvents(events) {
    const seen = new Set();
    const result = [];

    events.forEach((event) => {
      const key = eventKey(event);
      if (!seen.has(key)) {
        seen.add(key);
        result.push(event);
      }
    });

    return result.sort((a, b) => {
      if (a.day !== b.day) {
        const order = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 0: 7 };
        return (order[a.day] || 9) - (order[b.day] || 9);
      }
      return (a.periodStart || 0) - (b.periodStart || 0);
    });
  }

  function getTimetableEvents(type, semesterId) {
    const table = getTimetableTable(type);
    const fromDom = flattenTimetableEventsFromDOM(table, semesterId);
    if (fromDom.length) return fromDom;

    if (type === 'ustc') {
      return getUstcEventsFromStorage();
    }

    return [];
  }

  function buildICS(context) {
    const semester = getSemester(context.semesterId);
    if (!semester || !semester.week1Monday) return '';

    const events = getTimetableEvents(context.type, context.semesterId);
    if (!events.length) return '';

    const now = new Date();
    const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Stardust Math//Schedule Export//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:${escapeICS(context.text.title + ' - ' + getSemesterLabel(context.semesterId, context.lang))}`,
      `X-WR-TIMEZONE:${semester.timezone || 'Asia/Shanghai'}`
    ];

    events.forEach((event, eventIndex) => {
      const weeks = Array.isArray(event.weeks) && event.weeks.length
        ? event.weeks
        : Array.from({ length: semester.teachingWeeks || 18 }, (_, index) => index + 1);

      weeks.forEach((week) => {
        const eventDate = getDateForWeekAndDay(context.semesterId, week, event.day);
        if (!eventDate) return;

        const uid = [
          'schedule',
          context.type,
          context.semesterId,
          eventIndex,
          week,
          event.day,
          event.periodStart,
          event.periodEnd,
          'stardust-math.github.io'
        ].join('-');

        const startTime = getStartTime(event.periodStart);
        const endTime = getEndTime(event.periodEnd);

        const titleParts = [];
        if (event.courseNumber) titleParts.push(event.courseNumber);
        if (event.courseName) titleParts.push(event.courseName);

        const summary = titleParts.length ? titleParts.join(' ') : context.text.title;

        const descriptionParts = [
          `${context.text.semester}: ${getSemesterLabel(context.semesterId, context.lang)}`,
          `${context.text.headers.day}: ${getDayName(event.day, context.lang)}`,
          `${context.text.headers.periodRange}: ${getPeriodRange(event.periodStart, event.periodEnd)}`,
          `${context.text.headers.weeks}: ${formatWeeks([week], context.lang)}`
        ];

        if (event.instructor) descriptionParts.push(`${context.text.headers.instructor}: ${event.instructor}`);
        if (event.location) descriptionParts.push(`${context.text.headers.location}: ${event.location}`);
        if (event.credits) descriptionParts.push(`${context.text.headers.credits}: ${event.credits}`);

        lines.push('BEGIN:VEVENT');
        lines.push(`UID:${escapeICS(uid)}`);
        lines.push(`DTSTAMP:${stamp}`);
        lines.push(`DTSTART;TZID=${semester.timezone || 'Asia/Shanghai'}:${formatDateTimeForICS(eventDate, startTime)}`);
        lines.push(`DTEND;TZID=${semester.timezone || 'Asia/Shanghai'}:${formatDateTimeForICS(eventDate, endTime)}`);
        lines.push(`SUMMARY:${escapeICS(summary)}`);
        if (event.location) lines.push(`LOCATION:${escapeICS(event.location)}`);
        lines.push(`DESCRIPTION:${escapeICS(descriptionParts.join('\\n'))}`);
        lines.push('END:VEVENT');
      });
    });

    lines.push('END:VCALENDAR');
    return lines.map(foldICSLine).join('\r\n');
  }

  function exportICS(context) {
    const semester = getSemester(context.semesterId);

    if (!semester || !semester.week1Monday) {
      alert(context.text.selectSemesterAlert);
      return;
    }

    const ics = buildICS(context);
    if (!ics) {
      alert(context.text.noEventsAlert);
      return;
    }

    const filename = buildFileName(context.semesterId, context.lang, 'ics');
    downloadTextFile(filename, ics, 'text/calendar;charset=utf-8');
  }

  function createSemesterOptions(selectedId) {
    const semesters = getSemesterConfig();
    return Object.keys(semesters).map((id) => {
      const selected = id === selectedId ? ' selected' : '';
      return `<option value="${escapeHtml(id)}"${selected}>${escapeHtml(semesters[id].labelEN || id)}</option>`;
    }).join('');
  }

  function createToolbar(type) {
    const currentLang = getCurrentLang();
    const text = textFor(currentLang);
    const defaultSemester = type === 'ustc' ? getDefaultSemesterId() : '';

    const toolbar = document.createElement('div');
    toolbar.className = 'schedule-export-toolbar';
    toolbar.dataset.exportType = type;

    toolbar.innerHTML = `
      <div class="schedule-export-control">
        <label>${escapeHtml(text.format)}</label>
        <select data-schedule-export-format aria-label="${escapeHtml(text.format)}">
          <option value="pdf">${escapeHtml(text.pdf)}</option>
          <option value="csv">${escapeHtml(text.csv)}</option>
          <option value="ics">${escapeHtml(text.ics)}</option>
        </select>
      </div>

      <div class="schedule-export-control">
        <label>${escapeHtml(text.language)}</label>
        <select data-schedule-export-lang aria-label="${escapeHtml(text.language)}">
          <option value="en"${currentLang === 'en' ? ' selected' : ''}>${escapeHtml(text.english)}</option>
          <option value="zh"${currentLang === 'zh' ? ' selected' : ''}>${escapeHtml(text.chinese)}</option>
        </select>
      </div>

      ${type === 'ustc' ? `
        <div class="schedule-export-control schedule-export-semester-control">
          <label>${escapeHtml(text.semester)}</label>
          <select data-schedule-export-semester aria-label="${escapeHtml(text.semester)}">
            ${createSemesterOptions(defaultSemester)}
          </select>
        </div>
      ` : ''}

      <button type="button" class="schedule-export-btn" data-schedule-export-submit>
        <i class="fas fa-download" aria-hidden="true"></i>
        <span>${escapeHtml(text.export)}</span>
      </button>
    `;

    toolbar.querySelector('[data-schedule-export-submit]').addEventListener('click', async () => {
      const context = getExportContext(toolbar);
      const restoreLang = await prepareExportLanguage(context.lang);

      if (context.format === 'pdf') {
        exportPDF(context, restoreLang);
        return;
      }

      try {
        if (context.format === 'csv') {
          exportCSV(context);
        } else if (context.format === 'ics') {
          exportICS(context);
        }
      } finally {
        if (typeof restoreLang === 'function') {
          await restoreLang();
        }
      }
    });

    return toolbar;
  }

  function updateToolbarLanguage(toolbar) {
    if (!toolbar) return;

    const lang = getCurrentLang();
    const text = textFor(lang);

    const controls = toolbar.querySelectorAll('.schedule-export-control');
    if (controls[0]) controls[0].querySelector('label').textContent = text.format;
    if (controls[1]) controls[1].querySelector('label').textContent = text.language;
    if (controls[2] && toolbar.dataset.exportType === 'ustc') {
      controls[2].querySelector('label').textContent = text.semester;
    }

    const formatSelect = toolbar.querySelector('[data-schedule-export-format]');
    if (formatSelect) {
      const selected = formatSelect.value;
      formatSelect.querySelector('option[value="pdf"]').textContent = text.pdf;
      formatSelect.querySelector('option[value="csv"]').textContent = text.csv;
      formatSelect.querySelector('option[value="ics"]').textContent = text.ics;
      formatSelect.value = selected;
    }

    const langSelect = toolbar.querySelector('[data-schedule-export-lang]');
    if (langSelect) {
      const selected = langSelect.value;
      langSelect.querySelector('option[value="en"]').textContent = text.english;
      langSelect.querySelector('option[value="zh"]').textContent = text.chinese;
      langSelect.value = selected;
    }

    const submit = toolbar.querySelector('[data-schedule-export-submit] span');
    if (submit) submit.textContent = text.export;
  }

  function ensureInlineRow(referenceNode, rowClassName) {
    if (!referenceNode) return null;

    if (referenceNode.parentElement && referenceNode.parentElement.classList.contains(rowClassName)) {
      return referenceNode.parentElement;
    }

    const row = document.createElement('div');
    row.className = rowClassName;

    referenceNode.parentNode.insertBefore(row, referenceNode);
    row.appendChild(referenceNode);

    return row;
  }

  function mountMyToolbar() {
    if (document.querySelector('[data-schedule-export-mounted="my"]')) return;

    const selector = document.querySelector('#my-timetable-section > .semester-selector');
    if (!selector) return;

    const row = ensureInlineRow(selector, 'schedule-export-inline-row schedule-export-my-row');
    if (!row) return;

    const toolbar = createToolbar('my');
    toolbar.dataset.scheduleExportMounted = 'my';
    row.appendChild(toolbar);
  }

  function mountUstcToolbar() {
    if (document.querySelector('[data-schedule-export-mounted="ustc"]')) return;

    const hint = document.querySelector('#ustc-timetable-section > .ustc-local-save-hint');
    if (!hint) return;

    const row = ensureInlineRow(hint, 'schedule-export-inline-row schedule-export-ustc-row');
    if (!row) return;

    const toolbar = createToolbar('ustc');
    toolbar.dataset.scheduleExportMounted = 'ustc';
    row.appendChild(toolbar);
  }

  function refreshToolbarLanguage() {
    document.querySelectorAll('.schedule-export-toolbar').forEach(updateToolbarLanguage);
  }

  function init() {
    mountMyToolbar();
    mountUstcToolbar();
    refreshToolbarLanguage();
  }

  function initWithRetry() {
    let attempts = 0;
    const maxAttempts = 40;

    const tick = () => {
      attempts += 1;
      init();

      const myMounted = !!document.querySelector('[data-schedule-export-mounted="my"]');
      const ustcMounted = !!document.querySelector('[data-schedule-export-mounted="ustc"]');

      if ((!myMounted || !ustcMounted) && attempts < maxAttempts) {
        setTimeout(tick, 100);
      }
    };

    tick();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWithRetry);
  } else {
    initWithRetry();
  }

  window.addEventListener('site:langchange', refreshToolbarLanguage);

  window.ScheduleExport = window.ScheduleExport || {};
  window.ScheduleExport.init = init;
  window.ScheduleExport.exportPDF = exportPDF;
  window.ScheduleExport.exportCSV = exportCSV;
  window.ScheduleExport.exportICS = exportICS;
})();
