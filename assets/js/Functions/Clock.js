(function () {
  'use strict';

  let _timerId = null;

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

  function start() {
    updateClock();

    // prevent double interval
    if (_timerId !== null) clearInterval(_timerId);
    _timerId = setInterval(updateClock, 1000);
  }

  function initToggle() {
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

  window.Clock = {
    start,
    initToggle,
    updateClock,
  };
})();
