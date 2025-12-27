document.write(`
  <div id="cover">
    <div id="avatar-frame" 
         data-cursor="precise_select" 
         data-cursor-fallback="pointer">
      <img src="./assets/images/avatar.jpg" alt="Profile Avatar" loading="lazy">
    </div>
    <div id="name">Stardust</div>
    <div id="slogan">${getRandomSlogan()}</div>
    <div class="cover-buttons">
      <button id="about-btn">About</button>
      <button id="schedule-btn">Schedule</button>
      <button id="social-btn">Social</button>
      <button id="toolkit-btn">Toolkit</button>
    </div>
  </div>
`);

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
