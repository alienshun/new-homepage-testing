(function () {
  'use strict';

  const previous = window.ACTIVITIES_MOMENTS_ZH || {};

  window.ACTIVITIES_MOMENTS_ZH = {
    ui: {
      viewMoment: '观此一瞬',
      backToMoments: '返回行迹',
      close: '关闭',
      openImage: '查看图片'
    },

    moments: Array.isArray(previous.moments) ? previous.moments : []
  };
})();
