(function () {
  "use strict";

  const STORAGE_KEY = "resume_expanders_open_keys_v1";
  const ANIMATION_MS = 340;

  // NOTE: Keep this behavior (reset on full refresh), but don't interfere with in-page lang switches.
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (e) {}

  function qsAll(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function getOpenDisplay(el) {
    if (!el) return "";

    if (el.tagName && el.tagName.toLowerCase() === "tr") {
      return "table-row";
    }

    return "block";
  }

  function setDisplay(el, open) {
    if (!el) return;
    el.style.display = open ? getOpenDisplay(el) : "none";
  }

  function getPanel(row) {
    if (!row) return null;
    return row.querySelector(".expand-content") || row;
  }

  function clearMotionTimer(row) {
    if (!row || !row.dataset.expandTimer) return;

    try {
      clearTimeout(Number(row.dataset.expandTimer));
    } catch (e) {}

    delete row.dataset.expandTimer;
  }

  function clearPanelInlineMotion(panel) {
    if (!panel) return;

    panel.style.transition = "";
    panel.style.maxHeight = "";
    panel.style.opacity = "";
    panel.style.transform = "";
  }

  function setInstantRowState(row, open) {
    if (!row) return;

    clearMotionTimer(row);

    const panel = getPanel(row);

    row.classList.remove("is-animating");
    row.classList.toggle("is-open", open);
    row.setAttribute("aria-hidden", open ? "false" : "true");
    setDisplay(row, open);

    if (panel) {
      clearPanelInlineMotion(panel);

      if (open) {
        panel.style.maxHeight = "none";
      }
    }
  }

  function animateRowOpen(row) {
    if (!row) return;

    clearMotionTimer(row);

    const panel = getPanel(row);

    row.classList.add("is-animating");
    row.classList.remove("is-open");
    row.setAttribute("aria-hidden", "false");
    setDisplay(row, true);

    if (!panel) {
      row.classList.add("is-open");
      row.classList.remove("is-animating");
      return;
    }

    panel.style.transition = "none";
    panel.style.maxHeight = "0px";
    panel.style.opacity = "0";
    panel.style.transform = "translateY(-4px)";

    // Force browser to register the collapsed state before animating.
    panel.offsetHeight;

    panel.style.transition = "";
    row.classList.add("is-open");

    requestAnimationFrame(function () {
      panel.style.maxHeight = panel.scrollHeight + "px";
      panel.style.opacity = "1";
      panel.style.transform = "translateY(0)";
    });

    const timer = window.setTimeout(function () {
      row.classList.remove("is-animating");

      if (row.classList.contains("is-open")) {
        panel.style.maxHeight = "none";
      }

      panel.style.opacity = "";
      panel.style.transform = "";
      panel.style.transition = "";

      delete row.dataset.expandTimer;
    }, ANIMATION_MS + 40);

    row.dataset.expandTimer = String(timer);
  }

  function animateRowClose(row) {
    if (!row) return;

    clearMotionTimer(row);

    const panel = getPanel(row);

    row.classList.add("is-animating");
    row.classList.add("is-open");
    row.setAttribute("aria-hidden", "true");
    setDisplay(row, true);

    if (!panel) {
      row.classList.remove("is-open");
      row.classList.remove("is-animating");
      setDisplay(row, false);
      return;
    }

    panel.style.transition = "none";
    panel.style.maxHeight = panel.scrollHeight + "px";
    panel.style.opacity = "1";
    panel.style.transform = "translateY(0)";

    // Force browser to register the expanded state before collapsing.
    panel.offsetHeight;

    panel.style.transition = "";
    row.classList.remove("is-open");

    requestAnimationFrame(function () {
      panel.style.maxHeight = "0px";
      panel.style.opacity = "0";
      panel.style.transform = "translateY(-4px)";
    });

    const timer = window.setTimeout(function () {
      row.classList.remove("is-animating");
      setDisplay(row, false);
      clearPanelInlineMotion(panel);

      delete row.dataset.expandTimer;
    }, ANIMATION_MS + 40);

    row.dataset.expandTimer = String(timer);
  }

  function getBtnKey(btn) {
    if (!btn) return null;

    const k = btn.getAttribute("data-expand-key");
    if (k && String(k).trim()) return String(k).trim();

    const t = btn.getAttribute("data-expand-target");
    if (t && String(t).trim()) return String(t).trim();

    return null;
  }

  function saveState(scope) {
    try {
      const root = scope || document;
      const open = qsAll('button.expander[aria-expanded="true"]', root)
        .map(getBtnKey)
        .filter(Boolean);

      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(open));
    } catch (e) {}
  }

  function loadState() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return [];

      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr.map(String) : [];
    } catch (e) {
      return [];
    }
  }

  function setOpen(btn, open, options) {
    if (!btn) return;

    const opts = options || {};
    const animate = opts.animate === true;

    const targetId = btn.getAttribute("data-expand-target");
    if (!targetId) return;

    const row = document.getElementById(targetId);
    if (!row) return;

    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.classList.toggle("is-open", open);

    if (!animate) {
      setInstantRowState(row, open);
      return;
    }

    if (open) {
      animateRowOpen(row);
    } else {
      animateRowClose(row);
    }
  }

  function toggle(btn) {
    if (!btn) return;

    const isOpen = btn.getAttribute("aria-expanded") === "true";
    setOpen(btn, !isOpen, { animate: true });
    saveState(document);
  }

  function bindOne(btn) {
    if (!btn || btn.dataset.bound === "1") return;

    btn.dataset.bound = "1";

    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggle(btn);
    });
  }

  function normalizeRows(scope) {
    const root = scope || document;

    qsAll(".expand-row[id]", root).forEach(function (row) {
      const isOpen =
        row.classList.contains("is-open") ||
        row.getAttribute("aria-hidden") === "false";

      setInstantRowState(row, isOpen);
    });
  }

  // Mark each expander's media layout so CSS can do:
  // - 1 item => centered (1/3 width)
  // - N>1 => 3-per-row, left-aligned
  function markExpandLayouts(scope) {
    const root = scope || document;

    qsAll(".expand-content", root).forEach(function (box) {
      const items = box.querySelectorAll(".expand-item");
      const n = items ? items.length : 0;

      box.classList.remove("is-single", "is-multi");

      if (n === 1) box.classList.add("is-single");
      if (n > 1) box.classList.add("is-multi");
    });
  }

  // Read open keys from current DOM (not storage)
  function getOpenKeys(scope) {
    try {
      const root = scope || document;

      return qsAll('button.expander[aria-expanded="true"]', root)
        .map(getBtnKey)
        .filter(Boolean);
    } catch (e) {
      return [];
    }
  }

  // Apply open keys to current DOM WITHOUT "close-all then open" flash
  function applyOpenKeys(keys, scope) {
    const root = scope || document;
    const wanted = Array.isArray(keys) ? keys.map(String) : [];

    const btns = qsAll('button.expander[data-expand-target]', root);

    const wantSet = Object.create(null);
    wanted.forEach(function (k) {
      wantSet[String(k)] = true;
    });

    btns.forEach(function (btn) {
      const k = getBtnKey(btn);
      const shouldOpen = !!(k && wantSet[String(k)]);

      setOpen(btn, shouldOpen, { animate: false });
    });
  }

  function restoreState(scope) {
    const root = scope || document;
    const keys = loadState();

    if (!keys || keys.length === 0) return;

    applyOpenKeys(keys, root);
  }

  // opts: { openKeys?: string[] , skipSave?: boolean }
  function init(root, opts) {
    const scope = root || document;
    const options = opts || {};

    normalizeRows(scope);
    markExpandLayouts(scope);
    qsAll("button.expander[data-expand-target]", scope).forEach(bindOne);

    if (Array.isArray(options.openKeys) && options.openKeys.length > 0) {
      applyOpenKeys(options.openKeys, scope);
    } else {
      restoreState(scope);
    }

    if (!options.skipSave) saveState(scope);
  }

  // ---------------------------------------------------------
  // FIX: event delegation for expanders (survives DOM swaps)
  // ---------------------------------------------------------
  function setupDelegatedClickOnce() {
    if (document.documentElement.dataset.expanderDelegation === "1") return;

    document.documentElement.dataset.expanderDelegation = "1";

    // Use capture phase so it works even if inner elements stop propagation
    document.addEventListener(
      "click",
      function (e) {
        const btn = e.target && e.target.closest
          ? e.target.closest("button.expander[data-expand-target]")
          : null;

        if (!btn) return;

        // If the button already has a direct handler bound, that handler will run too;
        // prevent double toggling by stopping here when delegation handles it.
        e.preventDefault();
        e.stopPropagation();

        toggle(btn);
      },
      true
    );
  }

  // ---------------------------------------------------------
  // Meditations: click the whole row to toggle (not just arrow)
  // ---------------------------------------------------------
  function setupMeditationsRowClickOnce() {
    if (document.documentElement.dataset.meditRowClick === "1") return;

    document.documentElement.dataset.meditRowClick = "1";

    // Capture phase so it works consistently with expander delegation
    document.addEventListener(
      "click",
      function (e) {
        const t = e.target;

        // Only apply inside the Meditations page
        const row = t && t.closest ? t.closest("#meditations .medit-row") : null;
        if (!row) return;

        // If user clicked the expander button itself, the expander delegation handles it
        if (t && t.closest && t.closest("button.expander")) return;

        // Don't hijack clicks on other interactive elements (future-proof)
        if (t && t.closest && t.closest("a, button, input, textarea, select, label")) return;

        const btn = row.querySelector('button.expander[data-expand-target]');
        if (!btn) return;

        toggle(btn);
      },
      true
    );
  }

  // Expose a tiny API so Translate.js can restore state synchronously
  window.ResumeExpanders = window.ResumeExpanders || {};
  window.ResumeExpanders.init = init;
  window.ResumeExpanders.getOpenKeys = getOpenKeys;
  window.ResumeExpanders.applyOpenKeys = applyOpenKeys;
  window.ResumeExpanders.saveState = saveState;

  setupDelegatedClickOnce();
  setupMeditationsRowClickOnce();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      init(document);
    });
  } else {
    init(document);
  }

  // Smooth lang switch: use event detail.openKeys if provided
  window.addEventListener("site:langchange", function (e) {
    const openKeys =
      e && e.detail && Array.isArray(e.detail.openKeys) ? e.detail.openKeys : null;

    requestAnimationFrame(function () {
      init(document, openKeys ? { openKeys: openKeys } : undefined);
    });
  });
})();
