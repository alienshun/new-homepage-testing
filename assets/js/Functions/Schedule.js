// USTC Timetable period definitions
const periodTimes = {
  1: { start: '7:50', end: '8:35' },
  2: { start: '8:40', end: '9:25' },
  3: { start: '9:45', end: '10:30' },
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

// USTC classes storage
let ustcClasses = JSON.parse(localStorage.getItem('ustcClasses')) || [];

// General events storage
let calendarEvents = JSON.parse(localStorage.getItem('calendarEvents')) || [];
let timetableEvents = JSON.parse(localStorage.getItem('timetableEvents')) || [];

// ============ i18n hooks (delegated to Translate.js) ============
function getCurrentLang() {
  // Prefer centralized store
  if (window.SiteLang && typeof window.SiteLang.getLang === 'function') {
    return window.SiteLang.getLang();
  }
  // Fallback
  const s = String((document.body && document.body.dataset && document.body.dataset.lang) || 'en').toLowerCase();
  return (s === 'zh' || s.startsWith('zh')) ? 'zh' : 'en';
}

function getFullCalendarLocale(lang) {
  if (window.SiteLang && typeof window.SiteLang.getFullCalendarLocale === 'function') {
    return window.SiteLang.getFullCalendarLocale(lang);
  }
  const l = String(lang || '').toLowerCase();
  return (l === 'zh' || l.startsWith('zh')) ? 'zh-cn' : 'en';
}

function t(key) {
  if (window.SiteI18N && typeof window.SiteI18N.t === 'function') {
    return window.SiteI18N.t('schedule', key);
  }
  return key;
}
// ===============================================================


// Preserve initial timetable HTML (guarded in case the table is not mounted yet)
const timetableTbody = document.querySelector('#ustc-timetable tbody');
const timetableTbodyInitialHTML = timetableTbody ? timetableTbody.innerHTML : '';

// Schedule state
let calendar; // FullCalendar instance
let calendarRendered = false;
let calendarPendingView = null;
let calendarRefreshPending = false;
let currentWeek = new Date(); // Timetable current week

function setScheduleView(view) {
  const viewSwitchers = document.querySelectorAll('.schedule-switch-btn');
  const calendarSection = document.getElementById('calendar-section');
  const timetableSection = document.getElementById('timetable-section');
  const ustcTimetableSection = document.getElementById('ustc-timetable-section');
  const myTimetableSection = document.getElementById('my-timetable-section');

  // Update switcher active state
  viewSwitchers.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === view);
  });

  // Update section visibility
  [calendarSection, timetableSection, ustcTimetableSection, myTimetableSection].forEach(sec => {
    if (sec) sec.classList.remove('active');
  });

  if (view === 'calendar') {
    if (calendarSection) calendarSection.classList.add('active');
    setTimeout(() => ensureCalendarRendered('dayGridMonth'), 0);
  } else if (view === 'timetable') {
    if (timetableSection) timetableSection.classList.add('active');
    updateTimetable();
  } else if (view === 'ustc-timetable') {
    if (ustcTimetableSection) ustcTimetableSection.classList.add('active');
    renderUstcTimetable();

    try {
      const currentLang = getCurrentLang();
      if (typeof CustomEvent === 'function') {
        window.dispatchEvent(new CustomEvent('site:langchange', { detail: { lang: currentLang } }));
      } else {
        const evt = document.createEvent('CustomEvent');
        evt.initCustomEvent('site:langchange', false, false, { lang: currentLang });
        window.dispatchEvent(evt);
      }
    } catch (e) { }
  } else {
    if (myTimetableSection) myTimetableSection.classList.add('active');
  }
}

function initSchedulePage() {
  // Initialize calendar and timetable
  initCalendar();
  initTimetable();

  // View switching functionality
  const viewSwitchers = document.querySelectorAll('.schedule-switch-btn');

  // Default: show My Timetable when entering Schedule
  setScheduleView('my-timetable');

  viewSwitchers.forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      setScheduleView(view);
    });
  });

  // Event modal functionality
  const eventModal = document.getElementById('event-modal');
  const eventModalClose = document.getElementById('event-modal-close');
  const eventCancelBtn = document.getElementById('event-cancel-btn');
  const eventForm = document.getElementById('event-form');

  // General event modal
  const generalEventModal = document.getElementById('general-event-modal');
  const generalEventModalClose = document.getElementById('general-event-modal-close');
  const generalEventCancelBtn = document.getElementById('general-event-cancel-btn');
  const generalEventForm = document.getElementById('general-event-form');

  // Open modal for new calendar event
  document.getElementById('add-calendar-event').addEventListener('click', () => {
    openGeneralEventModal('calendar');
  });

  // Open modal for new timetable event
  document.getElementById('add-timetable-event').addEventListener('click', () => {
    openGeneralEventModal('timetable');
  });

  // Open modal for new USTC class
  document.getElementById('add-ustc-event').addEventListener('click', () => {
    openUstcClassModal();
  });

  // Close modals
  eventModalClose.addEventListener('click', () => {
    eventModal.style.display = 'none';
  });

  eventCancelBtn.addEventListener('click', () => {
    eventModal.style.display = 'none';
  });

  generalEventModalClose.addEventListener('click', () => {
    generalEventModal.style.display = 'none';
  });

  generalEventCancelBtn.addEventListener('click', () => {
    generalEventModal.style.display = 'none';
  });

  // Close modals when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === eventModal) {
      eventModal.style.display = 'none';
    }
    if (e.target === generalEventModal) {
      generalEventModal.style.display = 'none';
    }
  });

  // Handle USTC class form submission
  eventForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveUstcClass();
  });

  // Handle general event form submission
  generalEventForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveGeneralEvent();
  });

  // Delete USTC class
  document.getElementById('event-delete-btn').addEventListener('click', () => {
    deleteUstcClass();
  });

  // Delete general event
  document.getElementById('general-event-delete-btn').addEventListener('click', () => {
    deleteGeneralEvent();
  });

  // Week navigation for timetable
  document.getElementById('prev-week-btn').addEventListener('click', () => {
    currentWeek.setDate(currentWeek.getDate() - 7);
    updateTimetable();
  });

  document.getElementById('next-week-btn').addEventListener('click', () => {
    currentWeek.setDate(currentWeek.getDate() + 7);
    updateTimetable();
  });
}

// Semester selection functionality
function initSemesterSelection() {
  const semesterLinks = document.querySelectorAll('.semester-dropdown-content a');

  semesterLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const semester = link.dataset.semester;

      // Update dropdown button text
      const dropdownBtn = document.querySelector('.semester-dropdown-btn');
      dropdownBtn.innerHTML = `${link.textContent} <i class="fas fa-caret-down"></i>`;

      // Hide all semester timetables
      document.querySelectorAll('.semester-timetable-container').forEach(container => {
        container.classList.remove('active');
      });

      // Show selected semester timetable
      document.getElementById(semester).classList.add('active');
    });
  });
}

// Calendar functionality
function isCalendarVisible() {
  const schedulePage = document.getElementById('schedule');
  const calendarSection = document.getElementById('calendar-section');
  const container = document.getElementById('calendar-container');
  return !!(
    schedulePage &&
    schedulePage.classList.contains('visible') &&
    calendarSection &&
    calendarSection.classList.contains('active') &&
    container &&
    container.offsetParent !== null
  );
}

function ensureCalendarRendered(forceView) {
  if (!calendar) return;

  if (forceView) {
    calendarPendingView = forceView;
  }

  if (!isCalendarVisible()) {
    calendarRefreshPending = true;
    return;
  }

  if (!calendarRendered) {
    // First render
    calendar.render();
    calendarRendered = true;
  } else if (calendarRefreshPending) {
    try {
      calendar.destroy();
      calendarRendered = false;
      calendar.render();
      calendarRendered = true;
    } catch (e) {
      // Fallback: at least try a size update
      try { calendar.updateSize(); } catch (err) { }
    }
  }

  if (calendarPendingView) {
    calendar.changeView(calendarPendingView);
    calendarPendingView = null;
  }

  calendarRefreshPending = false;

  setTimeout(() => {
    try { calendar.updateSize(); } catch (e) { }
  }, 0);
}

function initCalendar() {
  const calendarEl = document.getElementById('calendar-container');

  calendar = new FullCalendar.Calendar(calendarEl, {
    locale: getFullCalendarLocale(getCurrentLang()),
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    events: calendarEvents,
    eventClick: function (info) {
      openGeneralEventModal('calendar', info.event);
    },
    // Visual styling is handled by CSS tokens (including dark mode).
  });

  updateCalendarTheme();
}

function updateCalendarTheme() {
  if (!calendar) return;

  if (document.body.classList.contains('dark-mode')) {
    calendar.setOption('themeSystem', 'standard');
  } else {
    calendar.setOption('themeSystem', 'standard');
  }
}

// Timetable functionality
function initTimetable() {
  const timetableBody = document.getElementById('timetable-body');
  timetableBody.innerHTML = '';

  for (let hour = 8; hour <= 22; hour++) {
    const row = document.createElement('tr');

    const timeCell = document.createElement('td');
    timeCell.className = 'time-cell';
    timeCell.textContent = `${hour}:00 - ${hour + 1}:00`;
    row.appendChild(timeCell);

    for (let day = 0; day < 7; day++) {
      const dayCell = document.createElement('td');
      dayCell.dataset.day = day;
      dayCell.dataset.hour = hour;
      dayCell.addEventListener('click', () => {
        handleTimetableCellClick(dayCell);
      });
      row.appendChild(dayCell);
    }

    timetableBody.appendChild(row);
  }

  updateTimetable();
}

function updateTimetable() {
  const weekStart = new Date(currentWeek);
  weekStart.setDate(currentWeek.getDate() - (currentWeek.getDay() + 6) % 7);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const lang = getCurrentLang();
  if (lang === 'zh') {
    const optionsZh = { weekday: 'short', month: 'numeric', day: 'numeric' };
    const left = weekStart.toLocaleDateString('zh-CN', optionsZh);
    const right = weekEnd.toLocaleDateString('zh-CN', optionsZh);
    document.getElementById('current-week').textContent = `${t('weekOf')}${left} - ${right}`;
  } else {
    const optionsEn = { weekday: 'short', month: 'short', day: 'numeric' };
    document.getElementById('current-week').textContent =
      `${t('weekOf')} ${weekStart.toLocaleDateString('en-US', optionsEn)} - ${weekEnd.toLocaleDateString('en-US', optionsEn)}`;
  }

  const cells = document.querySelectorAll('#timetable-body td:not(.time-cell)');
  cells.forEach(cell => {
    cell.className = '';
    cell.innerHTML = '';
  });

  const weekStartTime = weekStart.getTime();
  const weekEndTime = weekEnd.getTime() + 24 * 60 * 60 * 1000;

  const weekEvents = timetableEvents.filter(event => {
    const eventDate = new Date(event.start).getTime();
    return eventDate >= weekStartTime && eventDate < weekEndTime;
  });

  weekEvents.forEach(event => {
    const eventDate = new Date(event.start);
    const day = (eventDate.getDay() + 6) % 7;
    const hour = eventDate.getHours();

    const cell = document.querySelector(`#timetable-body td[data-day="${day}"][data-hour="${hour}"]`);
    if (cell) {
      cell.className = 'has-event';

      const eventElement = document.createElement('div');
      eventElement.className = 'timetable-event';
      eventElement.innerHTML = `
        <strong>${event.title}</strong>
        ${event.description ? `<small>${event.description}</small>` : ''}
      `;
      eventElement.addEventListener('click', (e) => {
        e.stopPropagation();
        openGeneralEventModal('timetable', event);
      });

      cell.appendChild(eventElement);
    }
  });
}

function handleTimetableCellClick(cell) {
  const day = parseInt(cell.dataset.day);
  const hour = parseInt(cell.dataset.hour);

  const eventDate = new Date(currentWeek);
  eventDate.setDate(currentWeek.getDate() - (currentWeek.getDay() + 6) % 7);
  eventDate.setDate(eventDate.getDate() + day);
  eventDate.setHours(hour, 0, 0, 0);

  const endDate = new Date(eventDate);
  endDate.setHours(hour + 1, 0, 0, 0);

  openGeneralEventModal('timetable', null, {
    start: eventDate,
    end: endDate
  });
}

// Initialize weeks selection
function initWeeksSelection() {
  const weeksGrid = document.getElementById('weeks-grid');
  weeksGrid.innerHTML = '';

  for (let week = 1; week <= 18; week++) {
    const checkboxContainer = document.createElement('div');
    checkboxContainer.className = 'week-checkbox';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `week-${week}`;
    checkbox.name = 'ustc-week';
    checkbox.value = week;

    const label = document.createElement('label');
    label.htmlFor = `week-${week}`;
    label.textContent = week;

    checkbox.addEventListener('change', updateWeekDisplay);

    checkboxContainer.appendChild(checkbox);
    checkboxContainer.appendChild(label);
    weeksGrid.appendChild(checkboxContainer);
  }
}

function updateWeekDisplay() {
  const weekDisplay = document.getElementById('week-display');
  const selectedWeeks = Array.from(document.querySelectorAll('input[name="ustc-week"]:checked'))
    .map(checkbox => parseInt(checkbox.value))
    .sort((a, b) => a - b);

  if (selectedWeeks.length === 0) {
    weekDisplay.textContent = t('noWeeksSelected');
    return;
  }

  const ranges = [];
  let start = selectedWeeks[0];
  let end = start;

  for (let i = 1; i < selectedWeeks.length; i++) {
    if (selectedWeeks[i] === end + 1) {
      end = selectedWeeks[i];
    } else {
      ranges.push(start === end ? start : `${start}-${end}`);
      start = selectedWeeks[i];
      end = start;
    }
  }
  ranges.push(start === end ? start : `${start}-${end}`);

  weekDisplay.textContent = (getCurrentLang() === 'zh')
    ? (ranges.join('，') + t('weeksSuffix'))
    : (ranges.join(', ') + t('weeksSuffix'));
}

function formatWeeks(weeks) {
  if (!weeks || weeks.length === 0) return '';

  const sortedWeeks = [...weeks].sort((a, b) => a - b);

  const ranges = [];
  let start = sortedWeeks[0];
  let end = start;

  for (let i = 1; i < sortedWeeks.length; i++) {
    if (sortedWeeks[i] === end + 1) {
      end = sortedWeeks[i];
    } else {
      ranges.push(start === end ? start : `${start}-${end}`);
      start = sortedWeeks[i];
      end = start;
    }
  }
  ranges.push(start === end ? start : `${start}-${end}`);

  return (getCurrentLang() === 'zh')
    ? (ranges.join('，') + (ranges.length > 0 ? t('weeksSuffix') : ''))
    : (ranges.join(', ') + (ranges.length > 0 ? t('weeksSuffix') : ''));
}

// USTC Timetable functionality
function renderUstcTimetable() {
  const timetable = document.getElementById('ustc-timetable');
  const tbody = timetable.querySelector('tbody');
  tbody.innerHTML = timetableTbodyInitialHTML;

  const cells = Array.from(tbody.querySelectorAll('td[data-period][data-day]'));

  const occupied = Array(14).fill().map(() => Array(7).fill(false));

  cells.forEach(cell => {
    cell.innerHTML = '';
    cell.rowSpan = 1;
    cell.className = '';
    cell.style.display = '';
  });

  ustcClasses.sort((a, b) => a.periodStart - b.periodStart);

  const cellCourses = Array(14).fill().map(() => Array(7).fill().map(() => []));

  ustcClasses.forEach(cls => {
    const periodStart = parseInt(cls.periodStart);
    const periodEnd = parseInt(cls.periodEnd);

    cls.days.forEach(day => {
      for (let period = periodStart; period <= periodEnd; period++) {
        if (period >= 1 && period <= 13) {
          cellCourses[period][day].push({
            id: cls.id,
            courseName: cls.courseName,
            instructor: cls.instructor,
            location: cls.location,
            credits: cls.credits,
            weeks: cls.weeks,
            periodStart: cls.periodStart,
            periodEnd: cls.periodEnd
          });
        }
      }
    });
  });

  for (let period = 1; period <= 13; period++) {
    for (let day = 0; day <= 6; day++) {
      const courses = cellCourses[period][day];
      if (courses.length === 0) continue;

      const cell = tbody.querySelector(`td[data-period="${period}"][data-day="${day}"]`);
      if (!cell) continue;

      if (occupied[period][day]) continue;

      let maxPeriod = period;
      for (let p = period; p <= 13; p++) {
        const allExist = courses.every(course =>
          cellCourses[p][day].some(c => c.id === course.id)
        );

        if (allExist) {
          maxPeriod = p;
        } else {
          break;
        }
      }

      const rowSpan = maxPeriod - period + 1;

      for (let p = period; p <= maxPeriod; p++) {
        occupied[p][day] = true;
      }

      cell.rowSpan = rowSpan;
      cell.className = 'has-class event-cell';

      const endPeriod = period + rowSpan - 1;

      const startInfo = document.createElement('div');
      startInfo.className = 'time-info start-info';
      startInfo.textContent = periodTimes[period].start;

      const endInfo = document.createElement('div');
      endInfo.className = 'time-info end-info';
      endInfo.textContent = periodTimes[endPeriod].end;

      const container = document.createElement('div');
      container.className = 'overlap-container';

      cell.appendChild(startInfo);
      cell.appendChild(endInfo);

      courses.forEach(course => {
        const courseDiv = document.createElement('div');
        courseDiv.className = 'overlap-course';
        const credit = (course.credits ?? '').toString().trim();
        const creditHtml = credit ? ` <span class="credits-inline">[${credit}]</span>` : '';
        courseDiv.innerHTML = `
          <div class="course-name">${course.courseName}${creditHtml}</div>
          <div class="instructor">${course.instructor}</div>
          <div class="location">${course.location}</div>
          <div class="weeks">${formatWeeks(course.weeks)}</div>
        `;

        courseDiv.addEventListener('click', (e) => {
          e.stopPropagation();
          const cls = ustcClasses.find(c => c.id === course.id);
          if (cls) {
            openUstcClassModal(cls);
          }
        });

        container.appendChild(courseDiv);
      });

      cell.appendChild(container);

      for (let p = period + 1; p <= maxPeriod; p++) {
        const nextCell = tbody.querySelector(`td[data-period="${p}"][data-day="${day}"]`);
        if (nextCell) {
          nextCell.style.display = 'none';
        }
      }

      cell.addEventListener('click', (e) => {
        if (e.target === cell || e.target === startInfo || e.target === endInfo) {
          const period = parseInt(cell.dataset.period);
          const day = parseInt(cell.dataset.day);
          openUstcClassModal(null, period, period, day);
        }
      });
    }
  }

  renderUstcClassesList();
}

function renderUstcClassesList() {
  const tbody = document.getElementById('ustc-classes-body');
  tbody.innerHTML = '';

  ustcClasses.forEach(cls => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${cls.periodStart} - ${cls.periodEnd}</td>
      <td>${cls.courseName}</td>
      <td>${cls.instructor}</td>
      <td>${cls.location}</td>
      <td>${formatWeeks(cls.weeks)}</td>
      <td>${getDaysString(cls.days)}</td>
      <td>${cls.credits || t('unknown')}</td>
      <td>
        <button class="edit-ustc-class" data-id="${cls.id}">${t('edit')}</button>
        <button class="delete-ustc-class" data-id="${cls.id}">${t('del')}</button>
      </td>
    `;
    tbody.appendChild(row);
  });

  document.querySelectorAll('.edit-ustc-class').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const cls = ustcClasses.find(c => c.id === id);
      if (cls) {
        openUstcClassModal(cls);
      }
    });
  });

  document.querySelectorAll('.delete-ustc-class').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      deleteUstcClass(id);
    });
  });
}

function getDaysString(days) {
  const lang = getCurrentLang();
  const dayNames = (lang === 'zh')
    ? ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return (lang === 'zh')
    ? days.map(day => dayNames[day]).join('，')
    : days.map(day => dayNames[day]).join(', ');
}

function openUstcClassModal(cls = null, periodStart = null, periodEnd = null, day = null) {
  const modal = document.getElementById('event-modal');
  const deleteBtn = document.getElementById('event-delete-btn');

  if (cls) {
    document.getElementById('event-modal-title').textContent = t('editClass');
    document.getElementById('event-id').value = cls.id;
    document.getElementById('ustc-period-start').value = cls.periodStart;
    document.getElementById('ustc-period-end').value = cls.periodEnd;
    document.getElementById('ustc-course-name').value = cls.courseName;
    document.getElementById('ustc-instructor').value = cls.instructor;
    document.getElementById('ustc-location').value = cls.location;
    document.getElementById('ustc-credits').value = cls.credits || '';

    document.querySelectorAll('input[name="ustc-day"]').forEach(checkbox => {
      checkbox.checked = false;
    });

    cls.days.forEach(day => {
      const checkbox = document.querySelector(`input[name="ustc-day"][value="${day}"]`);
      if (checkbox) checkbox.checked = true;
    });

    document.querySelectorAll('input[name="ustc-week"]').forEach(checkbox => {
      checkbox.checked = false;
    });

    if (cls.weeks && cls.weeks.length > 0) {
      cls.weeks.forEach(week => {
        const checkbox = document.querySelector(`input[name="ustc-week"][value="${week}"]`);
        if (checkbox) checkbox.checked = true;
      });
    }

    updateWeekDisplay();
    deleteBtn.style.display = 'inline-block';
  } else {
    document.getElementById('event-modal-title').textContent = t('addNewClass');
    document.getElementById('event-id').value = '';

    document.getElementById('ustc-period-start').value = periodStart !== null ? periodStart : '1';
    document.getElementById('ustc-period-end').value = periodEnd !== null ? periodEnd : '1';

    document.getElementById('ustc-course-name').value = '';
    document.getElementById('ustc-instructor').value = '';
    document.getElementById('ustc-location').value = '';
    document.getElementById('ustc-credits').value = '';

    document.querySelectorAll('input[name="ustc-day"]').forEach(checkbox => {
      checkbox.checked = false;
    });

    if (day !== null) {
      const dayCheckbox = document.querySelector(`input[name="ustc-day"][value="${day}"]`);
      if (dayCheckbox) dayCheckbox.checked = true;
    }

    document.querySelectorAll('input[name="ustc-week"]').forEach(checkbox => {
      checkbox.checked = false;
    });

    updateWeekDisplay();
    deleteBtn.style.display = 'none';
  }

  const creditsInput = document.getElementById('ustc-credits');
  creditsInput.type = 'number';
  creditsInput.step = '0.5';
  creditsInput.min = '0';

  modal.style.display = 'flex';
}

function saveUstcClass() {
  const id = document.getElementById('event-id').value;
  const periodStart = document.getElementById('ustc-period-start').value;
  const periodEnd = document.getElementById('ustc-period-end').value;
  const courseName = document.getElementById('ustc-course-name').value;
  const instructor = document.getElementById('ustc-instructor').value;
  const location = document.getElementById('ustc-location').value;
  const credits = document.getElementById('ustc-credits').value;

  const days = [];
  document.querySelectorAll('input[name="ustc-day"]:checked').forEach(checkbox => {
    days.push(parseInt(checkbox.value));
  });

  const weeks = [];
  document.querySelectorAll('input[name="ustc-week"]:checked').forEach(checkbox => {
    weeks.push(parseInt(checkbox.value));
  });

  if (!courseName || !instructor || !location || days.length === 0 || weeks.length === 0) {
    alert(t('fillRequired'));
    return;
  }

  if (parseInt(periodStart) > parseInt(periodEnd)) {
    alert(t('endPeriodEarlier'));
    return;
  }

  if (id) {
    const index = ustcClasses.findIndex(c => c.id === id);
    if (index !== -1) {
      ustcClasses[index] = {
        id,
        periodStart,
        periodEnd,
        courseName,
        instructor,
        location,
        credits,
        days,
        weeks
      };
    }
  } else {
    const newClass = {
      id: Date.now().toString(),
      periodStart,
      periodEnd,
      courseName,
      instructor,
      location,
      credits,
      days,
      weeks
    };
    ustcClasses.push(newClass);
  }

  localStorage.setItem('ustcClasses', JSON.stringify(ustcClasses));

  document.getElementById('event-modal').style.display = 'none';
  renderUstcTimetable();
}

function deleteUstcClass(id = null) {
  if (!id) {
    id = document.getElementById('event-id').value;
  }

  if (!id) return;

  if (!confirm(t('confirmDeleteClass'))) return;

  ustcClasses = ustcClasses.filter(c => c.id !== id);
  localStorage.setItem('ustcClasses', JSON.stringify(ustcClasses));

  document.getElementById('event-modal').style.display = 'none';
  renderUstcTimetable();
}

function openGeneralEventModal(type, event = null, preset = null) {
  const modal = document.getElementById('general-event-modal');
  const deleteBtn = document.getElementById('general-event-delete-btn');

  if (event) {
    document.getElementById('general-event-modal-title').textContent = t('editEvent');
    document.getElementById('general-event-id').value = event.id;
    document.getElementById('event-title').value = event.title;
    document.getElementById('event-description').value = event.description || '';
    document.getElementById('event-start').value = formatDateTimeForInput(new Date(event.start));
    document.getElementById('event-end').value = formatDateTimeForInput(new Date(event.end));
    deleteBtn.style.display = 'inline-block';
  } else {
    document.getElementById('general-event-modal-title').textContent = t('addNewEvent');
    document.getElementById('general-event-id').value = '';
    document.getElementById('event-title').value = '';
    document.getElementById('event-description').value = '';

    if (preset) {
      document.getElementById('event-start').value = formatDateTimeForInput(preset.start);
      document.getElementById('event-end').value = formatDateTimeForInput(preset.end);
    } else {
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
      document.getElementById('event-start').value = formatDateTimeForInput(now);
      document.getElementById('event-end').value = formatDateTimeForInput(oneHourLater);
    }

    deleteBtn.style.display = 'none';
  }

  document.getElementById('general-event-type').value = type;
  modal.style.display = 'flex';
}

function formatDateTimeForInput(date) {
  return date.toISOString().slice(0, 16);
}

function saveGeneralEvent() {
  const id = document.getElementById('general-event-id').value;
  const type = document.getElementById('general-event-type').value;
  const title = document.getElementById('event-title').value;
  const description = document.getElementById('event-description').value;
  const start = document.getElementById('event-start').value;
  const end = document.getElementById('event-end').value;

  if (!title || !start || !end) {
    alert(t('fillRequired'));
    return;
  }

  const event = {
    id: id || Date.now().toString(),
    title,
    description,
    start,
    end
  };

  let events;
  if (type === 'calendar') {
    events = calendarEvents;
  } else {
    events = timetableEvents;
  }

  if (id) {
    const index = events.findIndex(e => e.id === id);
    if (index !== -1) events[index] = event;
  } else {
    events.push(event);
  }

  if (type === 'calendar') {
    localStorage.setItem('calendarEvents', JSON.stringify(events));
  } else {
    localStorage.setItem('timetableEvents', JSON.stringify(events));
  }

  document.getElementById('general-event-modal').style.display = 'none';

  if (type === 'calendar') {
    calendar.removeAllEvents();
    calendar.addEventSource(events);
    calendarRefreshPending = true;
    ensureCalendarRendered();
  } else {
    updateTimetable();
  }
}

function deleteGeneralEvent() {
  const id = document.getElementById('general-event-id').value;
  const type = document.getElementById('general-event-type').value;

  if (!id) return;

  if (!confirm(t('confirmDeleteEvent'))) return;

  let events;
  if (type === 'calendar') {
    events = calendarEvents;
  } else {
    events = timetableEvents;
  }

  const index = events.findIndex(e => e.id === id);
  if (index !== -1) events.splice(index, 1);

  if (type === 'calendar') {
    localStorage.setItem('calendarEvents', JSON.stringify(events));
  } else {
    localStorage.setItem('timetableEvents', JSON.stringify(events));
  }

  document.getElementById('general-event-modal').style.display = 'none';

  if (type === 'calendar') {
    calendar.removeAllEvents();
    calendar.addEventSource(events);
    calendarRefreshPending = true;
    ensureCalendarRendered();
  } else {
    updateTimetable();
  }
}

// ===== Respond to global language switch (Translate.js dispatches 'site:langchange') =====
window.addEventListener('site:langchange', function (e) {
  const lang = (window.SiteLang && window.SiteLang.normalizeLang)
    ? window.SiteLang.normalizeLang(e && e.detail && e.detail.lang)
    : getCurrentLang();

  if (calendar) {
    calendar.setOption('locale', getFullCalendarLocale(lang));
    calendarRefreshPending = true;
    ensureCalendarRendered();
  }

  try { updateTimetable(); } catch (err) { }
  try { updateWeekDisplay(); } catch (err) { }
  try { renderUstcClassesList(); } catch (err) { }
});

// Expose a minimal API for the site controller (App.js)
window.Schedule = window.Schedule || {};
window.Schedule.setScheduleView = setScheduleView;
window.Schedule.initSchedulePage = initSchedulePage;
window.Schedule.initWeeksSelection = (typeof initWeeksSelection === 'function') ? initWeeksSelection : undefined;
window.Schedule.initSemesterSelection = (typeof initSemesterSelection === 'function') ? initSemesterSelection : undefined;
window.Schedule.updateCalendarTheme = updateCalendarTheme;

