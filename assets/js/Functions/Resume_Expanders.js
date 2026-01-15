(function () {
  "use strict";

  const STORAGE_KEY = "resume_expanders_open_keys_v1";

  function qsAll(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function setDisplay(el, open) {
    if (!el) return;
    el.style.display = open ? "" : "none";
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
    } catch (e) {
    }
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

  function setOpen(btn, open) {
    if (!btn) return;

    const targetId = btn.getAttribute("data-expand-target");
    if (!targetId) return;

    const row = document.getElementById(targetId);
    if (!row) return;

    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.classList.toggle("is-open", open);

    row.classList.toggle("is-open", open);
    row.setAttribute("aria-hidden", open ? "false" : "true");

    setDisplay(row, open);
  }

  function toggle(btn) {
    if (!btn) return;

    const isOpen = btn.getAttribute("aria-expanded") === "true";
    const next = !isOpen;

    setOpen(btn, next);
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
      const isOpen = row.classList.contains("is-open") || row.getAttribute("aria-hidden") === "false";
      setDisplay(row, isOpen);
    });
  }

  function restoreState(scope) {
    const root = scope || document;
    const keys = loadState();
    if (!keys || keys.length === 0) return;

    qsAll('button.expander[data-expand-target]', root).forEach(function (btn) {
      setOpen(btn, false);
    });

    keys.forEach(function (k) {
      let btn = root.querySelector('button.expander[data-expand-key="' + CSS.escape(k) + '"]');
      if (!btn) btn = root.querySelector('button.expander[data-expand-target="' + CSS.escape(k) + '"]');
      if (btn) setOpen(btn, true);
    });
  }

  function init(root) {
    const scope = root || document;

    normalizeRows(scope);
    qsAll("button.expander[data-expand-target]", scope).forEach(bindOne);

    restoreState(scope);

    saveState(scope);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { init(document); });
  } else {
    init(document);
  }

  window.addEventListener("site:langchange", function () {
    setTimeout(function () { init(document); }, 0);
  });
})();
