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

        <button
          id="cover-visual-toggle"
          type="button"
          aria-label="Enter cinematic cover view"
          aria-pressed="false"
          title="Cinematic View"
          data-cursor="precise_select"
          data-cursor-fallback="pointer"
        >
          <span class="cover-visual-icon cover-visual-eye-open" aria-hidden="true">
            <svg viewBox="0 0 82 66" focusable="false">
              <path class="star-eye-tail tail-left-top" d="M7.8 27.8C13.2 22.9 18.8 20.9 24.5 22.2"></path>
              <path class="star-eye-tail tail-left-bottom" d="M9.6 38.9C15.1 42.8 20.5 43.9 25.8 42.1"></path>
              <path class="star-eye-tail tail-right-top" d="M57.5 22.2C63.2 20.9 68.8 22.9 74.2 27.8"></path>
              <path class="star-eye-tail tail-right-bottom" d="M56.2 42.1C61.5 43.9 66.9 42.8 72.4 38.9"></path>

              <circle class="star-tail-spark s1" cx="14.3" cy="24.3" r="0.72"></circle>
              <circle class="star-tail-spark s2" cx="20.4" cy="22.3" r="0.48"></circle>
              <circle class="star-tail-spark s3" cx="15.2" cy="41.2" r="0.58"></circle>
              <circle class="star-tail-spark s4" cx="21.9" cy="43.3" r="0.42"></circle>

              <circle class="star-tail-spark s5" cx="67.7" cy="24.3" r="0.72"></circle>
              <circle class="star-tail-spark s6" cx="61.6" cy="22.3" r="0.48"></circle>
              <circle class="star-tail-spark s7" cx="66.8" cy="41.2" r="0.58"></circle>
              <circle class="star-tail-spark s8" cx="60.1" cy="43.3" r="0.42"></circle>

              <path class="star-eye-arc arc-top" d="M16.2 33C22.9 21.3 31.1 15.8 41 15.8C50.9 15.8 59.1 21.3 65.8 33"></path>
              <path class="star-eye-arc arc-bottom" d="M16.2 33C22.9 44.7 31.1 50.2 41 50.2C50.9 50.2 59.1 44.7 65.8 33"></path>

              <path class="star-eye-upper-lash l1" d="M25.1 23.3L23.1 18.7"></path>
              <path class="star-eye-upper-lash l2" d="M31.2 18.9L30.2 14.1"></path>
              <path class="star-eye-upper-lash l3" d="M40.9 17.2L40.9 12.4"></path>
              <path class="star-eye-upper-lash l4" d="M50.8 18.9L51.8 14.1"></path>
              <path class="star-eye-upper-lash l5" d="M56.9 23.3L58.9 18.7"></path>

              <path class="star-eye-inner inner-top" d="M27.5 32.1C31.5 27.2 36 24.8 41 24.8C46 24.8 50.5 27.2 54.5 32.1"></path>
              <path class="star-eye-inner inner-bottom" d="M30.4 37.2C33.8 39.6 37.3 40.8 41 40.8C44.7 40.8 48.2 39.6 51.6 37.2"></path>

              <path class="star-eye-spark" d="M41 23.2L43.6 30.4L50.8 33L43.6 35.6L41 42.8L38.4 35.6L31.2 33L38.4 30.4Z"></path>
              <circle class="star-eye-core" cx="41" cy="33" r="1.78"></circle>
            </svg>
          </span>

          <span class="cover-visual-icon cover-visual-eye-closed" aria-hidden="true">
            <svg viewBox="0 0 82 66" focusable="false">
              <path class="star-eye-closing-tail tail-left" d="M13.5 34.7C20.4 31.2 27.1 30.4 33.5 32.4"></path>
              <path class="star-eye-closing-tail tail-right" d="M48.5 32.4C54.9 30.4 61.6 31.2 68.5 34.7"></path>

              <circle class="star-tail-spark s1" cx="30.7" cy="34.3" r="0.54"></circle>
              <circle class="star-tail-spark s2" cx="35.1" cy="33.1" r="0.38"></circle>
              <circle class="star-tail-spark s3" cx="51.3" cy="34.3" r="0.54"></circle>
              <circle class="star-tail-spark s4" cx="46.9" cy="33.1" r="0.38"></circle>

              <path class="star-eye-lid" d="M17.4 36.7C24.1 43.4 31.8 46.8 41 46.8C50.2 46.8 57.9 43.4 64.6 36.7"></path>

              <path class="star-eye-lash l1" d="M29.7 43.7L25.8 50"></path>
              <path class="star-eye-lash l2" d="M41 46.8L41 53.6"></path>
              <path class="star-eye-lash l3" d="M52.3 43.7L56.2 50"></path>

              <path class="star-eye-fading-star" d="M41 26.8L42.55 31.25L47 32.8L42.55 34.35L41 38.8L39.45 34.35L35 32.8L39.45 31.25Z"></path>
              <circle class="star-eye-fading-core" cx="41" cy="32.8" r="1.05"></circle>
            </svg>
          </span>
        </button>

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