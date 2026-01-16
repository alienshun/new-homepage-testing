(function () {
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

  function setRandomCoverBackground(coverEl) {
    if (!coverEl) return;

    const covers = [
      'cover_1.jpg',
      'cover_2.png',
      'cover_3.jpg',
      'cover_4.jpg',
      'cover_5.jpg',
      'cover_6.png',
      'cover_7.png',
      'cover_8.jpg',
      'cover_9.jpg',
      'cover_10.jpg',
      'cover_11.jpg',
      'cover_12.jpg',
      'cover_13.jpg',
      'cover_14.jpg',
      'cover_15.jpg',
      'cover_16.png',
      'cover_17.jpg',
      'cover_18.jpg',
      'cover_19.png',
      'cover_20.jpg',
      'cover_21.jpg',
      'cover_22.jpg',
      'cover_23.jpg',
      'cover_24.jpg',
      'cover_25.jpg',
      'cover_26.jpg',
      'cover_27.jpg',
      'cover_28.jpg',
      'cover_29.jpg',
      'cover_30.jpg',
      'cover_31.jpg',
      'cover_32.jpg',
      'cover_33.jpg',
      'cover_34.jpg',
      'cover_35.jpg',
      'cover_36.jpg',
      'cover_37.jpg'
    ];

    const chosen = covers[Math.floor(Math.random() * covers.length)];

    coverEl.style.backgroundImage = `url('./assets/images/${chosen}')`;
    coverEl.style.backgroundRepeat = 'no-repeat';
    coverEl.style.backgroundPosition = 'center center';
    coverEl.style.backgroundSize = 'cover';
    coverEl.classList.add('visible');
  }

  const mount = document.getElementById("mount-cover") || document.body;
  const slogan = getRandomSlogan();

  // Removed four buttons; added bottom arrow (no border/circle)
  mount.insertAdjacentHTML(
    "beforeend",
    `
    <div id="cover">
      <div id="avatar-frame"
           data-cursor="precise_select"
           data-cursor-fallback="pointer">
        <img src="./assets/images/avatar.jpg" alt="Profile Avatar" loading="lazy">
      </div>

      <div id="name">Stardust</div>
      <div id="slogan">${slogan}</div>

      <button id="cover-scroll"
              type="button"
              aria-label="Scroll to About"
              title="Scroll to About"
              data-cursor="precise_select"
              data-cursor-fallback="pointer">
        <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
          <path class="chev c1" d="M14 22 L32 40 L50 22" />
          <path class="chev c2" d="M18 30 L32 44 L46 30" />
          <path class="chev c3" d="M22 38 L32 48 L42 38" />
        </svg>
        <span class="cover-scroll-sub">Scroll</span>
      </button>
    </div>
    `
  );

  const coverEl = document.getElementById('cover');
  setRandomCoverBackground(coverEl);

  // ------------------------------
  // Stardust trail for cover arrow
  // ------------------------------
  (function initCoverArrowStardust() {
    const arrow = document.getElementById('cover-scroll');
    if (!arrow) return;

    // Respect reduced motion
    try {
      const mq = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mq && mq.matches) return;
    } catch (e) {
      // ignore
    }

    let stardustTimer = null;

    function spawnStardust() {
      const dust = document.createElement('span');
      dust.className = 'cover-stardust';

      // left/right drift
      const x = (Math.random() - 0.5) * 24; // px
      const duration = 1200 + Math.random() * 800; // ms

      dust.style.setProperty('--x', `${x}px`);
      dust.style.animationDuration = `${duration}ms`;

      arrow.appendChild(dust);

      dust.addEventListener('animationend', () => {
        dust.remove();
      });
    }

    function startStardust() {
      if (stardustTimer) return;
      stardustTimer = setInterval(spawnStardust, 140);
    }

    function stopStardust() {
      if (!stardustTimer) return;
      clearInterval(stardustTimer);
      stardustTimer = null;

      // clean up remaining dust
      const dusts = arrow.querySelectorAll('.cover-stardust');
      dusts.forEach((d) => d.remove());
    }

    // Start/stop based on visibility class
    const observer = new MutationObserver(() => {
      if (arrow.classList.contains('visible')) startStardust();
      else stopStardust();
    });

    observer.observe(arrow, { attributes: true, attributeFilter: ['class'] });

    // If already visible when this runs
    if (arrow.classList.contains('visible')) startStardust();
  })();
})();
