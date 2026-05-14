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
    dateKey: '2025_08_31',
    dateISO: '2025-08-31',
    dateLabel: '2025.08.31',

    title: '深大访友',
    location: '深圳大学',

    cover: './assets/images/life/activities_moments/2025_08_31/cover.jpg',

    summary: '去深大看望高中同学，在久违的闲谈里，偷得一段夏末的轻松。',

    body: [
      '久违的同学见面，去深大找高中同学了[机智]。',
      '偶尔开怀畅聊，真是舒心[憨笑]。',
      '不过依旧是羡慕别人学校的一天[流泪]。',
      '以及希望我的朋友们都能安好[皱眉]。'
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

  window.ACTIVITIES_MOMENTS_ZH = target;
})();
