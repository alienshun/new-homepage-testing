/* Stardust Math service worker cleanup: disable runtime WebP substitution */

(function () {
  'use strict';

  const WEBP_CACHE_PREFIX = 'stardust-lossless-webp-';

  async function clearOldWebpCaches() {
    if (!self.caches) return;

    const keys = await caches.keys();

    await Promise.all(
      keys
        .filter((key) => key.indexOf(WEBP_CACHE_PREFIX) === 0)
        .map((key) => caches.delete(key))
    );
  }

  self.addEventListener('install', (event) => {
    event.waitUntil(self.skipWaiting());
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
      await clearOldWebpCaches();

      if (self.clients && typeof self.clients.claim === 'function') {
        await self.clients.claim();
      }

      if (self.registration && typeof self.registration.unregister === 'function') {
        await self.registration.unregister();
      }
    })());
  });

  self.__STARDUST_WEBP_SW_DISABLED__ = true;
})();
