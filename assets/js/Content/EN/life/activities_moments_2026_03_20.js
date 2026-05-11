(function () {
  'use strict';

  const target = window.ACTIVITIES_MOMENTS_EN || {
    ui: {},
    moments: []
  };

  if (!Array.isArray(target.moments)) {
    target.moments = [];
  }

  target.moments.push({
    dateKey: '2026_03_20',
    dateISO: '2026-03-20',
    dateLabel: '2026.03.20',

    title: 'Spring Festival Gala Performance',
    location: 'Old North Gate, East Campus, University of Science and Technology of China',

    cover: './assets/images/life/activities_moments/2026_03_20/cover.jpg',

    summary: '',

    body: [],

    gallery: []
  });

  window.ACTIVITIES_MOMENTS_EN = target;
})();
