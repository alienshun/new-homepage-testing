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
    dateKey: '2025_08_31',
    dateISO: '2025-08-31',
    dateLabel: '2025.08.31',

    title: 'Visiting a Friend at Shenzhen University',
    location: 'Shenzhen University',

    cover: './assets/images/life/activities_moments/2025_08_31/cover.jpg',

    summary: 'I visited a high school friend at Shenzhen University and found a brief moment of ease in a long-awaited conversation at the end of summer.',

    body: [
      'It was a long-awaited reunion, and I went to Shenzhen University to visit a high school friend [witty].',
      'An occasional open-hearted conversation truly feels comforting [smile].',
      'Still, it was another day of envying someone else’s university [crying].',
      'And I hope all my friends will stay safe and well [frown].'
    ],

    gallery: [
      './assets/images/life/activities_moments/2025_08_31/01.jpg',
      './assets/images/life/activities_moments/2025_08_31/02.jpg',
      './assets/images/life/activities_moments/2025_08_31/03.jpg',
      './assets/images/life/activities_moments/2025_08_31/04.jpg',
      './assets/images/life/activities_moments/2025_08_31/05.jpg',
      './assets/images/life/activities_moments/2025_08_31/06.jpg',
      './assets/images/life/activities_moments/2025_08_31/07.jpg',
      './assets/images/life/activities_moments/2025_08_31/08.jpg'
    ]
  });

  window.ACTIVITIES_MOMENTS_EN = target;
})();
