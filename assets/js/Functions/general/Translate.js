(function () {
  const STORAGE_KEY = "site_lang"; // "en" | "zh"
  const LANG = { EN: "en", ZH: "zh" };

  // ------------------------------
  // Expose unified language helpers
  // ------------------------------
  function normalizeLang(v) {
    const s = String(v || "").toLowerCase();
    return (s === "zh" || s.startsWith("zh")) ? LANG.ZH : LANG.EN;
  }

  function getLang() {
    return normalizeLang(localStorage.getItem(STORAGE_KEY) || LANG.EN);
  }

  function setLang(lang) {
    const l = normalizeLang(lang);
    localStorage.setItem(STORAGE_KEY, l);
    document.documentElement.setAttribute("lang", l === LANG.ZH ? "zh-CN" : "en");
    document.body.dataset.lang = l;
    return l;
  }

  function getFullCalendarLocale(lang) {
    const l = normalizeLang(lang);
    return (l === LANG.ZH) ? "zh-cn" : "en";
  }

  window.SiteLang = window.SiteLang || {};
  window.SiteLang.LANG = LANG;
  window.SiteLang.normalizeLang = normalizeLang;
  window.SiteLang.getLang = getLang;
  window.SiteLang.setLang = setLang;
  window.SiteLang.getFullCalendarLocale = getFullCalendarLocale;

  // ------------------------------
  // Unified I18N Dictionary Center
  // ------------------------------
  window.SiteI18N = window.SiteI18N || {};
  window.SiteI18N.dict = window.SiteI18N.dict || {};

  window.SiteI18N.dict.schedule = window.SiteI18N.dict.schedule || {
    en: {
      weekOf: "Week of",
      thisWeek: "Week of",
      noWeeksSelected: "No weeks selected",
      weeksSuffix: " week(s)",
      unknown: "Unknown",
      edit: "Edit",
      del: "Delete",
      addNewClass: "Add New Class",
      editClass: "Edit Class",
      addNewEvent: "Add New Event",
      editEvent: "Edit Event",
      fillRequired: "Please fill in all required fields",
      endPeriodEarlier: "End period cannot be earlier than start period",
      confirmDeleteClass: "Are you sure you want to delete this class?",
      confirmDeleteEvent: "Are you sure you want to delete this event?"
    },
    zh: {
      weekOf: "本周：",
      thisWeek: "本周：",
      noWeeksSelected: "未选择周次",
      weeksSuffix: "周",
      unknown: "未知",
      edit: "编辑",
      del: "删除",
      addNewClass: "添加课程",
      editClass: "编辑课程",
      addNewEvent: "添加事件",
      editEvent: "编辑事件",
      fillRequired: "请填写所有必填项",
      endPeriodEarlier: "结束节次不能早于开始节次",
      confirmDeleteClass: "确定要删除这门课吗？",
      confirmDeleteEvent: "确定要删除这个事件吗？"
    }
  };

  window.SiteI18N.t = window.SiteI18N.t || function (scope, key) {
    const l = getLang();
    const store = window.SiteI18N.dict || {};
    const scoped = store[scope] || {};
    const dict = (l === LANG.ZH) ? scoped.zh : scoped.en;
    return (dict && dict[key]) || (scoped.en && scoped.en[key]) || key;
  };

  // ------------------------------
  // Existing Translate.js behavior
  // ------------------------------
  let resumeEnInnerHTML = null;
  let meditationsEnInnerHTML = null;

  function ensureLangButtonMarkup(btn) {
    if (!btn) return null;

    let wrap = btn.querySelector(".top-nav-lang");
    let left = wrap ? wrap.querySelector(".lang-left") : null;
    let right = wrap ? wrap.querySelector(".lang-right") : null;
    let sep = wrap ? wrap.querySelector(".lang-sep") : null;

    if (!wrap || !left || !right || !sep) {
      btn.innerHTML = `
        <span class="top-nav-lang" aria-hidden="true">
          <span class="lang-token lang-left">EN</span>
          <span class="lang-sep">/</span>
          <span class="lang-token lang-right">ZH</span>
        </span>
      `;
      wrap = btn.querySelector(".top-nav-lang");
      left = wrap.querySelector(".lang-left");
      right = wrap.querySelector(".lang-right");
      sep = wrap.querySelector(".lang-sep");
    }

    return { wrap, left, right, sep };
  }

  function updateLangButton(lang) {
    const btn = document.getElementById("top-lang-btn");
    const parts = ensureLangButtonMarkup(btn);
    if (!btn || !parts) return;

    if (lang === LANG.ZH) {
      parts.left.textContent = "英";
      parts.right.textContent = "中";
      btn.setAttribute("aria-label", "切换到英文");
      btn.title = "切换到英文";
    } else {
      parts.left.textContent = "EN";
      parts.right.textContent = "ZH";
      btn.setAttribute("aria-label", "Switch to Chinese");
      btn.title = "Switch to Chinese";
    }
  }

  function captureResumeEnglishTemplate() {
    const resume = document.getElementById("resume");
    if (!resume) return;
    if (resumeEnInnerHTML == null) {
      resumeEnInnerHTML = resume.innerHTML;
    }
  }

  function captureMeditationsEnglishTemplate() {
    const m = document.getElementById("meditations");
    if (!m) return;
    if (meditationsEnInnerHTML == null) {
      meditationsEnInnerHTML = m.innerHTML;
    }
  }

  // ------------------------------
  // Stable asset root resolver
  // ------------------------------
  function getStableSiteRoot() {
    if (typeof window.__SITE_ROOT__ === "string" && window.__SITE_ROOT__.trim()) {
      return window.__SITE_ROOT__;
    }

    const scripts = Array.from(document.scripts || []);
    const matchedScript = scripts.find((s) => {
      return typeof s.src === "string" && /assets\/js\/Functions\/Translate\.js(?:\?|#|$)/.test(s.src);
    });

    if (matchedScript && matchedScript.src) {
      try {
        return new URL("../../../", matchedScript.src).href;
      } catch (e) {}
    }

    if (document.currentScript && document.currentScript.src) {
      try {
        return new URL("../../../", document.currentScript.src).href;
      } catch (e) {}
    }

    const anyAssetEl = document.querySelector(
      'script[src*="assets/"], link[href*="assets/"], img[src*="assets/"]'
    );

    if (anyAssetEl) {
      const url = anyAssetEl.src || anyAssetEl.href;
      if (url) {
        try {
          const idx = url.indexOf("/assets/");
          if (idx >= 0) {
            return url.slice(0, idx + 1);
          }
        } catch (e) {}
      }
    }

    try {
      return new URL("./", window.location.href).href;
    } catch (e) {
      return "/";
    }
  }

  function getStableAssetBase() {
    return new URL("assets/", getStableSiteRoot()).href;
  }

  function absolutizeAssetPaths(html) {
    if (typeof html !== "string" || !html.trim()) return html;

    const assetBase = getStableAssetBase();

    return html
      .replace(/((?:src|href|poster)\s*=\s*["'])\.\/assets\//gi, `$1${assetBase}`)
      .replace(/((?:src|href|poster)\s*=\s*["'])\.\.\/assets\//gi, `$1${assetBase}`)
      .replace(/((?:src|href|poster)\s*=\s*["'])assets\//gi, `$1${assetBase}`)
      .replace(/(url\(\s*["']?)\.\/assets\//gi, `$1${assetBase}`)
      .replace(/(url\(\s*["']?)\.\.\/assets\//gi, `$1${assetBase}`)
      .replace(/(url\(\s*["']?)assets\//gi, `$1${assetBase}`);
  }

  function applyResumeLanguage(lang) {
    const resume = document.getElementById("resume");
    if (!resume) return;

    captureResumeEnglishTemplate();

    if (lang === LANG.ZH) {
      if (typeof window.RESUME_ZH_INNER_HTML === "string" && window.RESUME_ZH_INNER_HTML.trim()) {
        resume.innerHTML = absolutizeAssetPaths(window.RESUME_ZH_INNER_HTML);
      }
    } else {
      if (typeof resumeEnInnerHTML === "string") {
        resume.innerHTML = absolutizeAssetPaths(resumeEnInnerHTML);
      }
    }
  }

  function applyMeditationsLanguage(lang) {
    const m = document.getElementById("meditations");
    if (!m) return;

    captureMeditationsEnglishTemplate();

    if (lang === LANG.ZH) {
      if (typeof window.MEDITATIONS_ZH_INNER_HTML === "string" && window.MEDITATIONS_ZH_INNER_HTML.trim()) {
        m.innerHTML = absolutizeAssetPaths(window.MEDITATIONS_ZH_INNER_HTML);
      }
    } else {
      if (typeof meditationsEnInnerHTML === "string") {
        m.innerHTML = absolutizeAssetPaths(meditationsEnInnerHTML);
      }
    }
  }

  /* ------------------------------
   * Toolkit I18N
   * ------------------------------ */
  function getToolkitEnDict() {
    if (window.TOOLKIT_EN_I18N && typeof window.TOOLKIT_EN_I18N === "object") {
      return window.TOOLKIT_EN_I18N;
    }
    return {
      toolkit_heading: "Academic Toolkit",
      search_placeholder: "Search tools by name.",
      filter_all: "All",
      no_results: "No matching tools found.\nTry a different search term."
    };
  }

  function getToolkitDict(lang) {
    if (lang === LANG.ZH && window.TOOLKIT_ZH_I18N && typeof window.TOOLKIT_ZH_I18N === "object") {
      return window.TOOLKIT_ZH_I18N;
    }
    return getToolkitEnDict();
  }

  function applyToolkitI18N(lang) {
    const toolkit = document.getElementById("toolkit");
    if (!toolkit) return;

    const dict = getToolkitDict(lang);

    toolkit.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (!key) return;
      const val = dict[key];
      if (typeof val === "string") el.textContent = val;
    });

    toolkit.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (!key) return;
      const val = dict[key];
      if (typeof val === "string") el.setAttribute("placeholder", val);
    });
  }

  /* ------------------------------
   * Social I18N
   * ------------------------------ */
  function getSocialDict(lang) {
    const zh = window.SOCIAL_ZH_I18N;
    const en = window.SOCIAL_EN_I18N;
    if (lang === LANG.ZH && zh && typeof zh === "object") return zh;
    if (en && typeof en === "object") return en;
    return null;
  }

  function applySocialI18N(lang) {
    const social = document.getElementById("social");
    if (!social) return;

    const dict = getSocialDict(lang);
    if (!dict) return;

    social.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (!key) return;
      const val = dict[key];
      if (typeof val === "string") el.textContent = val;
    });
  }

  /* ------------------------------
   * Top Nav I18N
   * ------------------------------ */
  function applyTopNavI18N(lang) {
    const nav = document.getElementById("top-nav");
    if (!nav) return;

    const l = normalizeLang(lang);
    const labels = (l === LANG.ZH)
      ? { resume: "关于", schedule: "日程", social: "社交", toolkit: "工具", meditations: "沉思录" }
      : { resume: "About", schedule: "Schedule", social: "Social", toolkit: "Toolkit", meditations: "Meditations" };

    nav.querySelectorAll(".top-nav-link[data-page]").forEach((btn) => {
      const page = btn.getAttribute("data-page");
      if (!page) return;
      const text = labels[page];
      if (typeof text === "string") btn.textContent = text;
    });
  }

  function getFallbackOpenKeys(scope) {
    try {
      const root = scope || document;
      const btns = Array.prototype.slice.call(
        root.querySelectorAll('button.expander[aria-expanded="true"]')
      );

      return btns.map(function (btn) {
        const k = btn.getAttribute("data-expand-key");
        if (k && String(k).trim()) return String(k).trim();

        const t = btn.getAttribute("data-expand-target");
        if (t && String(t).trim()) return String(t).trim();

        return null;
      }).filter(Boolean);
    } catch (e) {
      return [];
    }
  }

  function getResumeOpenKeys() {
    try {
      const api = window.ResumeExpanders;
      if (api && typeof api.getOpenKeys === "function") {
        return api.getOpenKeys(document);
      }
    } catch (e) {}
    return getFallbackOpenKeys(document);
  }

  function restoreResumeOpenKeys(keys) {
    try {
      const api = window.ResumeExpanders;
      const resume = document.getElementById("resume");
      if (api && typeof api.init === "function") {
        api.init(resume || document, { openKeys: Array.isArray(keys) ? keys : [] });
      }
    } catch (e) {}
  }

  function smoothSwapResume(lang, openKeys) {
    const resume = document.getElementById("resume");
    if (!resume) {
      applyResumeLanguage(lang);
      return;
    }

    const prevH = resume.getBoundingClientRect().height;
    if (prevH > 0) resume.style.minHeight = prevH + "px";

    resume.style.transition = "opacity 120ms ease";
    resume.style.opacity = "0";

    requestAnimationFrame(() => {
      applyResumeLanguage(lang);
      restoreResumeOpenKeys(openKeys);

      if (window.CustomCursorAPI && typeof window.CustomCursorAPI.refresh === 'function') {
        window.CustomCursorAPI.refresh(resume);
      }

      try {
        window.dispatchEvent(new CustomEvent("site:langchange", {
          detail: { lang: lang, openKeys: openKeys }
        }));
      } catch (e) {}

      requestAnimationFrame(() => {
        resume.style.opacity = "1";

        const cleanup = () => {
          resume.style.minHeight = "";
          resume.removeEventListener("transitionend", cleanup);
        };

        resume.addEventListener("transitionend", cleanup);
        setTimeout(cleanup, 250);
      });
    });
  }

  function restoreMeditationsOpenKeys(keys) {
    try {
      const api = window.ResumeExpanders;
      const m = document.getElementById("meditations");
      if (api && typeof api.init === "function") {
        api.init(m || document, { openKeys: Array.isArray(keys) ? keys : [], skipSave: true });
      }
    } catch (e) {}
  }

  function smoothSwapMeditations(lang, openKeys) {
    const m = document.getElementById("meditations");
    if (!m) {
      applyMeditationsLanguage(lang);
      return;
    }

    const prevH = m.getBoundingClientRect().height;
    if (prevH > 0) m.style.minHeight = prevH + "px";

    m.style.transition = "opacity 120ms ease";
    m.style.opacity = "0";

    requestAnimationFrame(() => {
      applyMeditationsLanguage(lang);
      restoreMeditationsOpenKeys(openKeys);

      if (window.CustomCursorAPI && typeof window.CustomCursorAPI.refresh === 'function') {
        window.CustomCursorAPI.refresh(m);
      }

      requestAnimationFrame(() => {
        m.style.opacity = "1";

        const cleanup = () => {
          m.style.minHeight = "";
          m.removeEventListener("transitionend", cleanup);
        };

        m.addEventListener("transitionend", cleanup);
        setTimeout(cleanup, 250);
      });
    });
  }

  function applyLanguage(lang) {
    const l = setLang(lang);
    updateLangButton(l);

    const openKeys = getResumeOpenKeys();

    smoothSwapResume(l, openKeys);
    smoothSwapMeditations(l, openKeys);

    applyToolkitI18N(l);
    applySocialI18N(l);
    applyTopNavI18N(l);
  }

  window.SiteLang.applyLanguage = applyLanguage;

  function bindLangToggle() {
    const btn = document.getElementById("top-lang-btn");
    if (!btn || btn.dataset.bound === "1") return;

    btn.dataset.bound = "1";
    btn.addEventListener("click", function () {
      const cur = getLang();
      const next = (cur === LANG.EN) ? LANG.ZH : LANG.EN;
      applyLanguage(next);
    });
  }

  function init() {
    applyLanguage(LANG.EN);
    bindLangToggle();

    let retry = 0;
    const timer = setInterval(() => {
      bindLangToggle();
      updateLangButton(getLang());
      retry += 1;

      if (document.getElementById("top-lang-btn") && retry >= 3) clearInterval(timer);
      if (retry >= 10) clearInterval(timer);
    }, 200);

    window.addEventListener("site:langchange", function (e) {
      const l = normalizeLang(e && e.detail ? e.detail.lang : getLang());

      applyToolkitI18N(l);
      applySocialI18N(l);
      applyTopNavI18N(l);
      updateLangButton(l);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
