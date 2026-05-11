(function () {
  'use strict';

  const target = window.ACTIVITIES_MOMENTS_ZH || {
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

    title: '春晚参演',
    location: '中国科学技术大学东区老北门',

    cover: './assets/images/life/activities_moments/2026_03_20/cover.jpg',

    summary: '',

    body: [],

    gallery: []
  });

  window.ACTIVITIES_MOMENTS_ZH = target;
})();
