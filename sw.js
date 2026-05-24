/* Stardust Math service worker: lossless WebP image substitution */

(function () {
  'use strict';

  const SW_VERSION = 'stardust-webp-sw-v1';
  const WEBP_CACHE_NAME = 'stardust-lossless-webp-v1';
  const WEBP_MANIFEST_URL = '/assets/generated/webp-manifest.js';

  const SOURCE_IMAGE_RE = /\.(?:png|jpe?g|bmp|tiff?)$/i;
  const WEBP_RE = /\.webp$/i;

  const imageMap = Object.create(null);

  function normalizePath(input) {
    if (!input || typeof input !== 'string') return '';

    try {
      return new URL(input, self.location.origin).pathname;
    } catch (e) {
      const cleaned = input.replace(/^\.\//, '');
      return cleaned.charAt(0) === '/' ? cleaned : '/' + cleaned;
    }
  }

  function normalizeManifest() {
    const manifest = self.SiteWebpManifest || {};
    const images = manifest.images || {};

    Object.keys(images).forEach((sourcePath) => {
      const item = images[sourcePath];
      if (!item || !item.webp) return;

      const normalizedSource = normalizePath(sourcePath);
      const normalizedWebp = normalizePath(item.webp);

      if (!normalizedSource || !normalizedWebp) return;

      imageMap[normalizedSource] = {
        webp: normalizedWebp,
        originalBytes: Number(item.originalBytes) || 0,
        webpBytes: Number(item.webpBytes) || 0
      };
    });
  }

  try {
    importScripts(WEBP_MANIFEST_URL);
    normalizeManifest();
  } catch (err) {
    console.warn('[sw] WebP manifest failed to load. Original images will be used.', err);
  }

  function acceptsWebp(request) {
    const accept = request.headers.get('accept') || '';

    return (
      accept.indexOf('image/webp') !== -1 ||
      accept.indexOf('image/*') !== -1 ||
      accept.indexOf('*/*') !== -1
    );
  }

  function shouldHandleImageRequest(request) {
    if (!request || request.method !== 'GET') return false;

    const destination = request.destination || '';

    if (destination && destination !== 'image') {
      return false;
    }

    let url;

    try {
      url = new URL(request.url);
    } catch (e) {
      return false;
    }

    if (url.origin !== self.location.origin) return false;

    if (WEBP_RE.test(url.pathname)) return false;

    if (!SOURCE_IMAGE_RE.test(url.pathname)) return false;

    if (!imageMap[url.pathname]) return false;

    if (!acceptsWebp(request)) return false;

    return true;
  }

  async function fetchOriginal(request) {
    return fetch(request);
  }

  async function fetchWebpOrOriginal(request) {
    let sourceUrl;

    try {
      sourceUrl = new URL(request.url);
    } catch (e) {
      return fetchOriginal(request);
    }

    const entry = imageMap[sourceUrl.pathname];

    if (!entry || !entry.webp) {
      return fetchOriginal(request);
    }

    const webpUrl = new URL(entry.webp, self.location.origin);

    if (sourceUrl.search) {
      webpUrl.search = sourceUrl.search;
    }

    const cache = await caches.open(WEBP_CACHE_NAME);
    const cached = await cache.match(webpUrl.href);

    if (cached) {
      return cached;
    }

    try {
      const webpResponse = await fetch(webpUrl.href, {
        credentials: 'same-origin',
        cache: 'default',
        redirect: 'follow'
      });

      if (
        webpResponse &&
        webpResponse.ok &&
        (webpResponse.type === 'basic' || webpResponse.type === 'default')
      ) {
        const contentType = webpResponse.headers.get('content-type') || '';

        if (!contentType || contentType.indexOf('image/webp') !== -1) {
          cache.put(webpUrl.href, webpResponse.clone()).catch(() => {});
          return webpResponse;
        }
      }
    } catch (err) {
      console.warn('[sw] WebP fetch failed, falling back to original image:', sourceUrl.pathname, err);
    }

    return fetchOriginal(request);
  }

  self.addEventListener('install', (event) => {
    event.waitUntil(self.skipWaiting());
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
      const keys = await caches.keys();

      await Promise.all(
        keys
          .filter((key) => {
            return key.indexOf('stardust-lossless-webp-') === 0 && key !== WEBP_CACHE_NAME;
          })
          .map((key) => caches.delete(key))
      );

      await self.clients.claim();
    })());
  });

  self.addEventListener('fetch', (event) => {
    if (!shouldHandleImageRequest(event.request)) return;

    event.respondWith(fetchWebpOrOriginal(event.request));
  });

  self.__STARDUST_WEBP_SW_VERSION__ = SW_VERSION;
})();
