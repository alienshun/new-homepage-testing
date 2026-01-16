(function () {
  'use strict';

  // ------------------------------
  // Render Top Nav HTML
  // ------------------------------
  const mount = document.getElementById("mount-top-nav") || document.body;
  mount.insertAdjacentHTML("beforeend", `
  <nav id="top-nav" class="top-nav" aria-label="Primary navigation">
    <div class="top-nav-inner">
      <div class="top-nav-left">
        <button id="top-toggle-btn" class="top-nav-icon" aria-label="Toggle theme" data-cursor="precise_select" data-cursor-fallback="pointer">
          <span><i class="fas fa-sun"></i></span>
        </button>
        <div id="top-clock" class="top-nav-clock" aria-label="Local time">GMT+8 00:00</div>
      </div>

      <div class="top-nav-center" role="navigation" aria-label="Pages">
        <button class="top-nav-link" data-page="resume" data-cursor="precise_select" data-cursor-fallback="pointer">About</button>
        <button class="top-nav-link" data-page="schedule" data-cursor="precise_select" data-cursor-fallback="pointer">Schedule</button>
        <button class="top-nav-link" data-page="social" data-cursor="precise_select" data-cursor-fallback="pointer">Social</button>
        <button class="top-nav-link" data-page="toolkit" data-cursor="precise_select" data-cursor-fallback="pointer">Toolkit</button>
      </div>

      <div class="top-nav-right">
        <!-- Language toggle (EN/ZH ↔ 英/中) -->
        <button id="top-lang-btn" class="top-nav-icon top-nav-lang-btn" aria-label="Switch to Chinese" data-cursor="precise_select" data-cursor-fallback="pointer">
          <span class="top-nav-lang" aria-hidden="true">
            <span class="lang-token lang-left">EN</span>
            <span class="lang-sep">/</span>
            <span class="lang-token lang-right">ZH</span>
          </span>
        </button>

        <button id="top-back-btn" class="top-nav-icon" aria-label="Back to cover" data-cursor="precise_select" data-cursor-fallback="pointer">
          <i class="fas fa-arrow-left"></i>
        </button>
      </div>
    </div>
  </nav>
`);

  function showTopNav() {
    document.body.classList.add('nav-visible');
  }

  function hideTopNav() {
    document.body.classList.remove('nav-visible');
  }

  function setTopNavActive(pageKey) {
    const links = document.querySelectorAll('.top-nav-link');
    links.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.page === pageKey);
    });
  }

  function initTopNav(onNavigate, onBackToCover) {
    const topNav = document.getElementById('top-nav');
    if (!topNav) return;

    const topBackBtn = document.getElementById('top-back-btn');
    if (topBackBtn && onBackToCover) {
      topBackBtn.addEventListener('click', onBackToCover);
    }

    const links = topNav.querySelectorAll('.top-nav-link');
    links.forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.page;
        if (!target || !onNavigate) return;
        onNavigate(target);
      });
    });

    // Hidden on cover by default
    hideTopNav();
  }

  // ------------------------------
  // Export to global
  // ------------------------------
  window.TopNav = {
    show: showTopNav,
    hide: hideTopNav,
    setActive: setTopNavActive,
    init: initTopNav
  };
})();
