(function () {
  'use strict';

  function getRandomSlogan() {
    const slogans = [
      'Alone I stand, yet never alone I think.',
      'I walk slowly, for I am going far.',
      'Stars whisper to the silent; oceans answer the patient; time reveals to the steadfast.',
      'Dawn belongs to the vigilant; dusk speaks to the patient; night reveals to the solitary.',
      'Mountains keep secrets for the observant; rivers guide the patient; eternity belongs to the resolute.',
      'The wind speaks only to those who listen; the night unveils only to those who endure.',
      'Each small step is steady, for the journey is infinite.',
      'I walk alone, for companions are fleeting; I walk slowly, for time is eternal; I walk onward, for destiny awaits.'
    ];

    return slogans[Math.floor(Math.random() * slogans.length)];
  }

  function getMount() {
    return document.getElementById('mount-cover') || document.body;
  }

  function getCover() {
    return document.getElementById('cover');
  }

  function renderCoverHtml() {
    const mount = getMount();

    if (getCover()) return getCover();

    const slogan = getRandomSlogan();

    mount.insertAdjacentHTML(
      'beforeend',
      `
      <div id="cover">
        <div class="cover-bg cover-bg-base" aria-hidden="true"></div>
        <div class="cover-bg cover-bg-reveal" aria-hidden="true"></div>
        <div class="cover-video-layer" aria-hidden="true"></div>

        <div
          id="avatar-frame"
          data-cursor="precise_select"
          data-cursor-fallback="pointer"
        >
          <img src="./assets/images/avatar.jpg" alt="Profile Avatar">
        </div>

        <div id="name">Stardust</div>
        <div id="slogan">${slogan}</div>

        <button
          id="cover-scroll"
          type="button"
          aria-label="Enter the site"
          title="Enter"
          data-cursor="precise_select"
          data-cursor-fallback="pointer"
        >
          <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
            <path class="chev c1" d="M14 22 L32 40 L50 22"></path>
            <path class="chev c2" d="M18 30 L32 44 L46 30"></path>
            <path class="chev c3" d="M22 38 L32 48 L42 38"></path>
          </svg>
          <span class="cover-scroll-sub">Enter</span>
        </button>
      </div>
      `
    );

    return getCover();
  }

  function initBackground(coverEl) {
    if (
      window.CoverBackground &&
      typeof window.CoverBackground.init === 'function'
    ) {
      return window.CoverBackground.init(coverEl);
    }

    coverEl.classList.add('visible', 'background-ready');
    return null;
  }

  function initDepthMotion() {
    if (
      window.CoverDepthMotion &&
      typeof window.CoverDepthMotion.init === 'function'
    ) {
      window.CoverDepthMotion.init();
    }
  }

  function refreshCursor() {
    if (
      window.CustomCursorAPI &&
      typeof window.CustomCursorAPI.refresh === 'function'
    ) {
      window.CustomCursorAPI.refresh(getCover() || document);
    }
  }

  function initCover() {
    const coverEl = renderCoverHtml();

    if (!coverEl) return null;

    initBackground(coverEl);
    initDepthMotion();
    refreshCursor();

    return coverEl;
  }

  window.Cover = {
    init: initCover,
    getRandomSlogan,
    getMount,
    getCover,
    renderCoverHtml,
    initBackground,
    initDepthMotion
  };

  initCover();
})();
