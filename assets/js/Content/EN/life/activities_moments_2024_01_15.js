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
    dateKey: '2024_01_15',
    dateISO: '2024-01-15',
    dateLabel: '2024.01.15',

    title: 'First Scholarship at USTC',
    location: 'Old North Gate, East Campus, University of Science and Technology of China',

    cover: './assets/images/life/activities_moments/2024_01_15/cover.jpg',

    summary: '',

    body: [],

    gallery: []
  });

  window.ACTIVITIES_MOMENTS_EN = target;
})();
