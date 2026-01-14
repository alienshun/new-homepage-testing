(function () {
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
        <!-- Language toggle (EN / 中) -->
        <button id="top-lang-btn" class="top-nav-icon" aria-label="Switch language" data-cursor="precise_select" data-cursor-fallback="pointer">
          <span style="font-family: Arial, sans-serif; font-weight: 700;">中</span>
        </button>

        <button id="top-back-btn" class="top-nav-icon" aria-label="Back to cover" data-cursor="precise_select" data-cursor-fallback="pointer">
          <i class="fas fa-arrow-left"></i>
        </button>
      </div>
    </div>
  </nav>
`);
})();
