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
      <div class="cover-buttons">
        <button id="about-btn">About</button>
        <button id="schedule-btn">Schedule</button>
        <button id="social-btn">Social</button>
        <button id="toolkit-btn">Toolkit</button>
      </div>
    </div>
    `
  );

  const coverEl = document.getElementById('cover');
  setRandomCoverBackground(coverEl);
})();
