(() => {
  "use strict";

  /* ==========
     Config
     ========== */

  // Your GoatCounter site (already in your tracking snippet)
  const GOAT_SITE = "https://stardust.goatcounter.com";

  // Optional: if your dashboard is not fully public, set token here.
  // How to use: Settings -> Dashboard viewable by -> "logged in users or with secret token"
  // Then embed with ?access-token=TOKEN (GoatCounter docs).  :contentReference[oaicite:4]{index=4}
  const GOAT_ACCESS_TOKEN = ""; // <-- put token here if needed, otherwise keep empty

  // Dashboard embed URL (hideui removes the chrome; docs).  :contentReference[oaicite:5]{index=5}
  const GOAT_DASHBOARD_BASE = `${GOAT_SITE}?hideui=1`;

  // Your existing ClustrMaps globe script
  const CLUSTRMAPS_SRC =
    "//clustrmaps.com/globe.js?d=JNHdsUlsgFLa9cs6tAwlyymTImAhTyfKPyc_DG4MDX8";

  /* ==========
     Helpers
     ========== */

  const $ = (sel, root = document) => root.querySelector(sel);

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  async function fetchJson(url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return res.json();
  }

  function getCurrentTrackedPath() {
    // GoatCounter recommends using get_data()['p'] if count.js is present.  :contentReference[oaicite:6]{index=6}
    try {
      if (window.goatcounter && typeof window.goatcounter.get_data === "function") {
        const p = window.goatcounter.get_data()["p"];
        if (p) return p;
      }
    } catch (_) {}
    return location.pathname || "/";
  }

  async function getGoatCounterCount(path, query = "") {
    // /counter/[PATH].json returns {count: "1,234"} if visitor counter is enabled.  :contentReference[oaicite:7]{index=7}
    const url = `${GOAT_SITE}/counter/${encodeURIComponent(path)}.json${query}`;
    const data = await fetchJson(url);
    return data.count || "0";
  }

  async function updateGoatCounterCounters() {
    setText("gc-total-count", "…");
    setText("gc-page-count", "…");
    setText("gc-month-count", "…");

    const pagePath = getCurrentTrackedPath();

    try {
      // TOTAL is a special path for site totals.  :contentReference[oaicite:8]{index=8}
      const [total, page, month] = await Promise.all([
        getGoatCounterCount("TOTAL"),
        getGoatCounterCount(pagePath),
        // start=month -> counts for last month (GoatCounter visitor counter supports start/end). :contentReference[oaicite:9]{index=9}
        getGoatCounterCount("TOTAL", "?start=month"),
      ]);

      setText("gc-total-count", total);
      setText("gc-page-count", page);
      setText("gc-month-count", month);
    } catch (e) {
      console.warn("[stats] GoatCounter counter error:", e);
      setText("gc-total-count", "Unavailable");
      setText("gc-page-count", "Unavailable");
      setText("gc-month-count", "Unavailable");
    }
  }

  async function updateVisitorIP() {
    setText("visitor-ip", "…");
    const endpoints = [
      "https://api.ipify.org?format=json",
      "https://api64.ipify.org?format=json",
    ];

    for (const url of endpoints) {
      try {
        const data = await fetchJson(url);
        if (data && data.ip) {
          setText("visitor-ip", data.ip);
          return;
        }
      } catch (e) {
        // try next endpoint
      }
    }
    setText("visitor-ip", "Unavailable");
  }

  function loadGoatCounterDashboardIframe() {
    const iframe = document.getElementById("goatcounter-dashboard");
    if (!iframe) return;

    let src = GOAT_DASHBOARD_BASE;
    if (GOAT_ACCESS_TOKEN) {
      // access-token usage is documented by GoatCounter. :contentReference[oaicite:10]{index=10}
      src += `&access-token=${encodeURIComponent(GOAT_ACCESS_TOKEN)}`;
    }
    iframe.src = src;
  }

  function loadClustrMaps() {
    const holder = document.getElementById("clustrmaps-holder");
    if (!holder) return;

    // Avoid duplicate injection
    if (holder.querySelector("#clstr_globe")) return;

    // Clear placeholder
    holder.innerHTML = "";

    const s = document.createElement("script");
    s.type = "text/javascript";
    s.id = "clstr_globe";
    s.src = CLUSTRMAPS_SRC;
    s.async = true;

    holder.appendChild(s);
  }

  function bindRefreshButton() {
    const btn = document.getElementById("stats-refresh-btn");
    if (!btn) return;

    btn.addEventListener("click", async () => {
      await Promise.allSettled([updateGoatCounterCounters(), updateVisitorIP()]);
    });
  }

  /* ==========
     Init when Social becomes visible
     ========== */

  function initWhenSocialVisible() {
    const social = document.getElementById("social");
    if (!social) return;

    let initialized = false;

    const doInit = () => {
      if (initialized) return;
      initialized = true;

      // load widgets only when visible (avoids 0-width rendering issues)
      loadClustrMaps();
      loadGoatCounterDashboardIframe();

      // update numbers
      updateGoatCounterCounters();
      updateVisitorIP();

      bindRefreshButton();
    };

    // If already visible
    if (social.classList.contains("visible")) doInit();

    // Observe class changes (your SPA toggles .visible)
    const mo = new MutationObserver(() => {
      if (social.classList.contains("visible")) doInit();
    });
    mo.observe(social, { attributes: true, attributeFilter: ["class"] });
  }

  document.addEventListener("DOMContentLoaded", initWhenSocialVisible);
})();
