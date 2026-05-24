(function () {
  'use strict';

  // Base path for cursor files, resolved relative to the document base URL.
  // This stays stable under /about/, /social/, etc. when <base> is set.
  var BASE = new URL('./assets/cursors/', document.baseURI).href;

  // Map logical names to filenames
  var CURSORS = {
    normal: 'normal.cur',
    unavailable: 'unavailable.cur',
    vertical_resize: 'vertical_resize.cur',
    background_run: 'background_run.cur',
    candidate: 'candidate.cur',
    precise_select: 'precise_select.cur',
    link_select: 'link_select.cur',
    busy: 'busy.cur',
    handwriting: 'handwriting.cur',
    horizontal_resize: 'horizontal_resize.cur',
    text_select: 'text_select.cur',
    diagonal1: 'diagonal_resize1.cur',
    diagonal2: 'diagonal_resize2.cur',
    move: 'move.cur',
    help: 'help.cur'
  };

  var pendingRoots = new Set();
  var flushScheduled = false;

  function cursorValue(fileName, fallback) {
    return 'url(' + BASE + fileName + '), ' + (fallback || 'auto');
  }

  function applyDefaultCursor() {
    if (CURSORS.normal) {
      document.documentElement.style.cursor = cursorValue(CURSORS.normal, 'auto');
    }
  }

  function applyCursorToElement(el, cursorKey, fallback) {
    if (!el || !cursorKey || !CURSORS[cursorKey]) return;

    try {
      el.style.cursor = cursorValue(CURSORS[cursorKey], fallback);
    } catch (e) {
      // fail silently
    }
  }

  function seedStaticMappings(root) {
    root = root || document;

    root.querySelectorAll('a, a *').forEach(function (el) {
      applyCursorToElement(el, 'link_select', 'pointer');
    });

    root.querySelectorAll('button, button *, .btn, .btn *, input[type="button"], input[type="submit"]').forEach(function (el) {
      applyCursorToElement(el, 'precise_select', 'pointer');
    });

    root.querySelectorAll('input[type="text"], input[type="search"], textarea, [contenteditable="true"]').forEach(function (el) {
      applyCursorToElement(el, 'text_select', 'text');
    });

    root.querySelectorAll('[draggable="true"], .draggable').forEach(function (el) {
      applyCursorToElement(el, 'move', 'move');
    });

    root.querySelectorAll('.resize-vertical').forEach(function (el) {
      applyCursorToElement(el, 'vertical_resize', 'ns-resize');
    });

    root.querySelectorAll('.resize-horizontal').forEach(function (el) {
      applyCursorToElement(el, 'horizontal_resize', 'ew-resize');
    });

    root.querySelectorAll('.resize-diag1').forEach(function (el) {
      applyCursorToElement(el, 'diagonal1', 'nwse-resize');
    });

    root.querySelectorAll('.resize-diag2').forEach(function (el) {
      applyCursorToElement(el, 'diagonal2', 'nesw-resize');
    });

    root.querySelectorAll('.help, [title]').forEach(function (el) {
      applyCursorToElement(el, 'help', 'help');
    });

    root.querySelectorAll('.busy, [data-busy]').forEach(function (el) {
      applyCursorToElement(el, 'busy', 'wait');
    });

    root.querySelectorAll('.handwriting, .scribble-area').forEach(function (el) {
      applyCursorToElement(el, 'handwriting', 'crosshair');
    });

    try {
      if (root.matches && (root.matches('a') || root.matches('a *'))) {
        applyCursorToElement(root, 'link_select', 'pointer');
      }

      if (
        root.matches &&
        (
          root.matches('button') ||
          root.matches('.btn') ||
          root.matches('input[type="button"]') ||
          root.matches('input[type="submit"]')
        )
      ) {
        applyCursorToElement(root, 'precise_select', 'pointer');
      }

      if (root.matches && (root.matches('[draggable="true"]') || root.matches('.draggable'))) {
        applyCursorToElement(root, 'move', 'move');
      }
    } catch (e) {
      // ignore
    }
  }

  function seedDataCursorAPI(root) {
    root = root || document;

    if (root instanceof Element && root.hasAttribute && root.hasAttribute('data-cursor')) {
      var selfKey = root.getAttribute('data-cursor');
      var selfFallback = root.getAttribute('data-cursor-fallback') || undefined;

      if (selfKey && CURSORS[selfKey]) {
        applyCursorToElement(root, selfKey, selfFallback);
      }
    }

    var els = root.querySelectorAll ? root.querySelectorAll('[data-cursor]') : [];

    els.forEach(function (el) {
      var key = el.getAttribute('data-cursor');
      var fallback = el.getAttribute('data-cursor-fallback') || undefined;

      if (key && CURSORS[key]) {
        applyCursorToElement(el, key, fallback);
      }
    });
  }

  function refresh(root) {
    var scope = root || document;
    seedStaticMappings(scope);
    seedDataCursorAPI(scope);
  }

  function isContainedByAnotherRoot(root, roots) {
    for (var i = 0; i < roots.length; i += 1) {
      var other = roots[i];

      if (other !== root && other.contains && other.contains(root)) {
        return true;
      }
    }

    return false;
  }

  function flushPendingRoots() {
    flushScheduled = false;

    var roots = Array.from(pendingRoots).filter(function (root) {
      return root && root.isConnected;
    });

    pendingRoots.clear();

    roots = roots.filter(function (root) {
      return !isContainedByAnotherRoot(root, roots);
    });

    roots.forEach(function (root) {
      refresh(root);
    });
  }

  function scheduleRefresh(root) {
    if (!root || !(root instanceof Element)) return;

    pendingRoots.add(root);

    if (flushScheduled) return;

    flushScheduled = true;

    if (typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(flushPendingRoots);
    } else {
      window.setTimeout(flushPendingRoots, 0);
    }
  }

  function observeMutations() {
    if (typeof MutationObserver !== 'function') return;

    var target = document.documentElement || document.body;
    if (!target) return;

    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        if (!m.addedNodes || !m.addedNodes.length) return;

        m.addedNodes.forEach(function (node) {
          if (!(node instanceof Element)) return;
          scheduleRefresh(node);
        });
      });
    });

    observer.observe(target, {
      childList: true,
      subtree: true
    });
  }

  function init() {
    applyDefaultCursor();
    refresh(document);
    observeMutations();

    window.CustomCursorAPI = {
      setDefault: function (key, fallback) {
        if (CURSORS[key]) {
          document.documentElement.style.cursor = cursorValue(CURSORS[key], fallback || 'auto');
        }
      },
      apply: function (el, key, fallback) {
        applyCursorToElement(el, key, fallback);
      },
      refresh: refresh
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
