(function () {
  "use strict";

  function qsAll(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function setDisplay(el, open) {
    if (!el) return;
    el.style.display = open ? "" : "none";
  }

  function toggle(btn) {
    if (!btn) return;

    const targetId = btn.getAttribute("data-expand-target");
    if (!targetId) return;

    const row = document.getElementById(targetId);
    if (!row) return;

    const isOpen = btn.getAttribute("aria-expanded") === "true";
    const next = !isOpen;

    btn.setAttribute("aria-expanded", next ? "true" : "false");
    btn.classList.toggle("is-open", next);

    row.classList.toggle("is-open", next);
    row.setAttribute("aria-hidden", next ? "false" : "true");

    setDisplay(row, next);
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

  function init(root) {
    const scope = root || document;

    qsAll(".expand-row[id]", scope).forEach(function (row) {
      const isOpen = row.classList.contains("is-open") || row.getAttribute("aria-hidden") === "false";
      setDisplay(row, isOpen);
    });

    qsAll("button.expander[data-expand-target]", scope).forEach(bindOne);
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
