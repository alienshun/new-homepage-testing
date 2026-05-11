(function () {
  'use strict';

  const previous = window.ACTIVITIES_MOMENTS_EN || {};

  window.ACTIVITIES_MOMENTS_EN = {
    ui: {
      viewMoment: 'View Moment',
      backToMoments: 'Back to Moments',
      close: 'Close',
      openImage: 'Open image'
    },

    moments: Array.isArray(previous.moments) ? previous.moments : []
  };
})();
