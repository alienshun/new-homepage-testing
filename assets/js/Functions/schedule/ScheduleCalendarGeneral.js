// General events storage
let calendarEvents = JSON.parse(localStorage.getItem('calendarEvents')) || [];
let timetableEvents = JSON.parse(localStorage.getItem('timetableEvents')) || [];

// General schedule state
let calendar;
let calendarRendered = false;
let calendarPendingView = null;
let calendarRefreshPending = false;
let currentWeek = new Date();
let fullCalendarLoadPromise = null;
let timetableInitialized = false;

function getFullCalendarAssets() {
  const resources = window.SiteResources || {};
  const external = resources.external || {};
  const libraries = external.libraries || {};
  return libraries.fullCalendar || { styles: [], scripts: [] };
}

function loadFullCalendarAssets() {
  if (window.FullCalendar && typeof window.FullCalendar.Calendar === 'function') {
    return Promise.resolve(true);
  }

  if (fullCalendarLoadPromise) {
    return fullCalendarLoadPromise;
  }

  fullCalendarLoadPromise = (async () => {
    const loader = window.SiteResourceLoader || {};
    const assets = getFullCalendarAssets();

    if (typeof loader.loadStylesInParallel === 'function') {
      await loader.loadStylesInParallel(assets.styles || []);
    }

    if (typeof loader.loadScriptsInOrder === 'function') {
      await loader.loadScriptsInOrder(assets.scripts || []);
    } else {
      for (const script of (assets.scripts || [])) {
        await new Promise((resolve) => {
          const src = typeof script === 'string' ? script : script.src;
          if (!src) {
            resolve(null);
            return;
          }

          const el = document.createElement('script');
          el.src = src;
          el.async = false;
          el.onload = () => resolve(el);
          el.onerror = () => resolve(null);
          document.body.appendChild(el);
        });
      }
    }

    return !!(window.FullCalendar && typeof window.FullCalendar.Calendar === 'function');
  })();

  return fullCalendarLoadPromise;
}

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

async function createCalendarIfNeeded() {
  if (calendar) return calendar;

  const calendarEl = document.getElementById('calendar-container');
  if (!calendarEl) return null;

  const loaded = await loadFullCalendarAssets();
  if (!loaded || !window.FullCalendar || typeof window.FullCalendar.Calendar !== 'function') {
    console.warn('[Schedule] FullCalendar failed to load.');
    return null;
  }

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
    }
  });

  updateCalendarTheme();
  return calendar;
}

function ensureCalendarRendered(forceView) {
  if (forceView) {
    calendarPendingView = forceView;
  }

  createCalendarIfNeeded().then((instance) => {
    if (!instance) return;

    if (!isCalendarVisible()) {
      calendarRefreshPending = true;
      return;
    }

    if (!calendarRendered) {
      instance.render();
      calendarRendered = true;
    } else if (calendarRefreshPending) {
      try {
        instance.destroy();
        calendarRendered = false;
        instance.render();
        calendarRendered = true;
      } catch (e) {
        try {
          instance.updateSize();
        } catch (err) { }
      }
    }

    if (calendarPendingView) {
      instance.changeView(calendarPendingView);
      calendarPendingView = null;
    }

    calendarRefreshPending = false;

    setTimeout(() => {
      try {
        instance.updateSize();
      } catch (e) { }
    }, 0);
  });
}

function initCalendar() {
  calendarRendered = false;
  calendarPendingView = null;
  calendarRefreshPending = false;
}

function updateCalendarTheme() {
  if (!calendar) return;
  calendar.setOption('themeSystem', 'standard');
}

function setCalendarLocale(lang) {
  if (!calendar) return;

  calendar.setOption('locale', getFullCalendarLocale(lang));
  calendarRefreshPending = true;
  ensureCalendarRendered();
}

// Timetable functionality
function initTimetable() {
  if (timetableInitialized) {
    updateTimetable();
    return;
  }

  const timetableBody = document.getElementById('timetable-body');
  if (!timetableBody) return;

  timetableBody.innerHTML = '';

  for (let hour = 8; hour <= 22; hour++) {
    const row = document.createElement('tr');

    const timeCell = document.createElement('td');
    timeCell.className = 'time-cell';
    timeCell.textContent = `${String(hour).padStart(2, '0')}:00 - ${String(hour + 1).padStart(2, '0')}:00`;
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

  timetableInitialized = true;
  updateTimetable();
}

function updateTimetable() {
  const weekStart = new Date(currentWeek);
  weekStart.setDate(currentWeek.getDate() - (currentWeek.getDay() + 6) % 7);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const lang = getCurrentLang();
  const currentWeekEl = document.getElementById('current-week');

  if (currentWeekEl) {
    if (lang === 'zh') {
      const optionsZh = { weekday: 'short', month: 'numeric', day: 'numeric' };
      const left = weekStart.toLocaleDateString('zh-CN', optionsZh);
      const right = weekEnd.toLocaleDateString('zh-CN', optionsZh);
      currentWeekEl.textContent = `${t('weekOf')}${left} - ${right}`;
    } else {
      const optionsEn = { weekday: 'short', month: 'short', day: 'numeric' };
      currentWeekEl.textContent =
        `${t('weekOf')} ${weekStart.toLocaleDateString('en-US', optionsEn)} - ${weekEnd.toLocaleDateString('en-US', optionsEn)}`;
    }
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

function goToPreviousWeek() {
  currentWeek.setDate(currentWeek.getDate() - 7);
  updateTimetable();
}

function goToNextWeek() {
  currentWeek.setDate(currentWeek.getDate() + 7);
  updateTimetable();
}

function openGeneralEventModal(type, event = null, preset = null) {
  const modal = document.getElementById('general-event-modal');
  const deleteBtn = document.getElementById('general-event-delete-btn');
  if (!modal || !deleteBtn) return;

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
    if (calendar) {
      calendar.removeAllEvents();
      calendar.addEventSource(events);
    }

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
    if (calendar) {
      calendar.removeAllEvents();
      calendar.addEventSource(events);
    }

    calendarRefreshPending = true;
    ensureCalendarRendered();
  } else {
    updateTimetable();
  }
}
