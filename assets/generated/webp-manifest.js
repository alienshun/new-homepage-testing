(function (root) {
  'use strict';

  root.SiteWebpManifest = {
    version: 'lossless-webp-manifest-v1',
    generatedAt: '',
    strategy: {
      quality: 'lossless',
      runtimeSizeCheck: false,
      preferredOnly: true,
      sourceExtensions: ['.png', '.jpg', '.jpeg', '.bmp', '.tif', '.tiff'],
      skippedExtensions: ['.svg', '.gif', '.webp']
    },
    images: {}
  };
})(typeof self !== 'undefined' ? self : window);
