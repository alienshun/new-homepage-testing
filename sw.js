/* Stardust Math service worker: offline fallback only */

(function () {
  'use strict';

  const SW_VERSION = 'stardust-offline-fallback-v1';

  function isNavigationRequest(request) {
    if (!request || request.method !== 'GET') return false;

    if (request.mode === 'navigate') {
      return true;
    }

    const accept = request.headers.get('accept') || '';
    return accept.indexOf('text/html') !== -1;
  }

  function createOfflineResponse() {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Offline | Stardust Math</title>
<style>
  :root {
    color-scheme: light dark;
  }

  body {
    margin: 0;
    min-height: 100vh;
    display: grid;
    place-items: center;
    font-family: Georgia, "Times New Roman", "Noto Serif CJK SC", serif;
    background:
      radial-gradient(circle at top left, rgba(124, 58, 237, 0.14), transparent 32rem),
      radial-gradient(circle at bottom right, rgba(59, 130, 246, 0.12), transparent 28rem),
      #f8fafc;
    color: #111827;
  }

  main {
    width: min(560px, calc(100vw - 48px));
    padding: 34px 30px;
    border: 1px solid rgba(148, 163, 184, 0.45);
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.84);
    box-shadow: 0 18px 48px rgba(15, 23, 42, 0.12);
    text-align: center;
    backdrop-filter: blur(14px);
  }

  h1 {
    margin: 0 0 12px;
    font-size: 1.8rem;
    line-height: 1.25;
  }

  p {
    margin: 0;
    color: #4b5563;
    font-size: 1rem;
    line-height: 1.75;
  }

  .site {
    margin-top: 18px;
    font-size: 0.88rem;
    color: #6b7280;
  }

  button {
    margin-top: 24px;
    padding: 10px 18px;
    border: 1px solid #7c3aed;
    border-radius: 999px;
    background: #7c3aed;
    color: #ffffff;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }

  button:hover {
    filter: brightness(0.96);
  }

  @media (prefers-color-scheme: dark) {
    body {
      background:
        radial-gradient(circle at top left, rgba(124, 58, 237, 0.24), transparent 32rem),
        radial-gradient(circle at bottom right, rgba(59, 130, 246, 0.18), transparent 28rem),
        #020617;
      color: #f9fafb;
    }

    main {
      border-color: rgba(148, 163, 184, 0.24);
      background: rgba(15, 23, 42, 0.82);
      box-shadow: 0 18px 48px rgba(0, 0, 0, 0.28);
    }

    p {
      color: #cbd5e1;
    }

    .site {
      color: #94a3b8;
    }
  }
</style>
</head>
<body>
  <main>
    <h1>Stardust Math is currently offline.</h1>
    <p>
      The page could not be loaded because the network connection is unavailable.
      Please reconnect and refresh the page.
    </p>
    <div class="site">stardust-math.github.io</div>
    <button type="button" onclick="window.location.reload()">Retry</button>
  </main>
</body>
</html>`;

    return new Response(html, {
      status: 503,
      statusText: 'Service Unavailable',
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store'
      }
    });
  }

  async function networkFirstNavigation(request) {
    try {
      return await fetch(request);
    } catch (err) {
      return createOfflineResponse();
    }
  }

  self.addEventListener('install', (event) => {
    event.waitUntil(self.skipWaiting());
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
      if (self.clients && typeof self.clients.claim === 'function') {
        await self.clients.claim();
      }
    })());
  });

  self.addEventListener('fetch', (event) => {
    if (!isNavigationRequest(event.request)) return;

    event.respondWith(networkFirstNavigation(event.request));
  });

  self.__STARDUST_OFFLINE_SW_VERSION__ = SW_VERSION;
})();
