(function () {
  'use strict';

  function clamp01(x) {
    return Math.max(0, Math.min(1, x));
  }

  const HINT_INTERVAL = 8000;
  const DESKTOP_PARTICLE_COUNT = 64;
  const MOBILE_PARTICLE_COUNT = 30;
  const TRACKING_RATIO = 0.30;
  const CURSOR_FADE_RADIUS = 46;

  let hintTimer = null;
  let raf = 0;
  let bounceTimer = null;
  let particles = [];
  let initialized = false;

  const pointer = {
    x: window.innerWidth * 0.5,
    y: window.innerHeight * 0.52,
    known: false
  };

  function getCover() {
    return document.getElementById('cover');
  }

  function getArrow() {
    return document.getElementById('cover-scroll');
  }

  function isCoarsePointer() {
    try {
      return window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    } catch (e) {
      return false;
    }
  }

  function isCoverHintReady() {
    const cover = getCover();
    const arrow = getArrow();

    if (!cover || !arrow) return false;

    return cover.classList.contains('visible') &&
      cover.classList.contains('background-ready') &&
      arrow.classList.contains('visible') &&
      !cover.classList.contains('hidden') &&
      !cover.classList.contains('leaving') &&
      cover.style.display !== 'none';
  }

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function clearHintTimer() {
    if (!hintTimer) return;

    clearTimeout(hintTimer);
    hintTimer = null;
  }

  function clearBounce() {
    const arrow = getArrow();

    if (bounceTimer) {
      clearTimeout(bounceTimer);
      bounceTimer = null;
    }

    if (arrow) {
      arrow.classList.remove('cover-hint-bounce');
    }
  }

  function removeParticle(particle) {
    if (!particle || !particle.el) return;
    particle.el.remove();
  }

  function clearParticles() {
    particles.forEach(removeParticle);
    particles = [];

    if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }

  function stop() {
    clearHintTimer();
    clearBounce();
    clearParticles();
  }

  function scheduleNextHint() {
    clearHintTimer();

    if (!isCoverHintReady()) return;

    hintTimer = window.setTimeout(() => {
      hintTimer = null;

      if (!isCoverHintReady()) return;

      triggerHint();
      scheduleNextHint();
    }, HINT_INTERVAL);
  }

  function start() {
    stop();

    if (!isCoverHintReady()) return;

    scheduleNextHint();
  }

  function updatePointer(event) {
    if (event.pointerType && event.pointerType !== 'mouse') return;

    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.known = true;
  }

  function getArrowOrigin() {
    const arrow = getArrow();
    const rect = arrow.getBoundingClientRect();

    return {
      x: rect.left + rect.width * 0.5,
      y: rect.top + rect.height * 0.52
    };
  }

  function makeParticle(origin, trackCursor) {
    const cover = getCover();
    const el = document.createElement('span');

    el.className = trackCursor ? 'cover-hint-particle is-tracking' : 'cover-hint-particle';

    const angle = randomBetween(0, Math.PI * 2);
    const speed = trackCursor ? randomBetween(0.75, 1.55) : randomBetween(1.05, 2.85);
    const size = trackCursor ? randomBetween(2.0, 3.8) : randomBetween(1.4, 3.3);
    const spread = trackCursor ? randomBetween(4, 16) : randomBetween(0, 15);

    const particle = {
      el,
      x: origin.x + Math.cos(angle) * spread,
      y: origin.y + Math.sin(angle) * spread,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - randomBetween(0.15, 0.85),
      born: performance.now(),
      ttl: trackCursor ? randomBetween(2300, 3300) : randomBetween(950, 1750),
      trackCursor,
      fadeStart: 0,
      spin: randomBetween(-0.032, 0.032),
      rotate: randomBetween(0, Math.PI * 2),
      baseScale: randomBetween(0.82, 1.16)
    };

    el.style.setProperty('--particle-size', `${size.toFixed(2)}px`);
    el.style.setProperty('--particle-core', trackCursor ? '0.98' : randomBetween(0.72, 0.94).toFixed(2));

    if (cover) {
      cover.appendChild(el);
    }

    return particle;
  }

  function spawnParticleBurst() {
    const origin = getArrowOrigin();
    const coarsePointer = isCoarsePointer();
    const count = coarsePointer ? MOBILE_PARTICLE_COUNT : DESKTOP_PARTICLE_COUNT;

    for (let i = 0; i < count; i += 1) {
      const canTrack = !coarsePointer && pointer.known;
      const trackCursor = canTrack && Math.random() < TRACKING_RATIO;

      particles.push(makeParticle(origin, trackCursor));
    }

    startParticleLoop();
  }

  function startParticleLoop() {
    if (raf) return;
    raf = requestAnimationFrame(updateParticles);
  }

  function updateParticles(now) {
    raf = 0;

    if (!isCoverHintReady()) {
      clearParticles();
      return;
    }

    const nextParticles = [];

    particles.forEach((particle) => {
      const age = now - particle.born;
      let life = age / particle.ttl;

      if (particle.trackCursor && pointer.known && age > 120) {
        const dx = pointer.x - particle.x;
        const dy = pointer.y - particle.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        const attraction = dist < 180 ? 0.0032 : 0.0020;

        particle.vx += dx * attraction;
        particle.vy += dy * attraction;

        particle.vx *= 0.91;
        particle.vy *= 0.91;

        if (dist <= CURSOR_FADE_RADIUS && !particle.fadeStart) {
          particle.fadeStart = now;
        }
      } else {
        particle.vx *= 0.982;
        particle.vy *= 0.982;
        particle.vy += 0.006;
      }

      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.rotate += particle.spin;

      let opacity = 1 - life;

      if (particle.trackCursor && particle.fadeStart) {
        const fadeAge = now - particle.fadeStart;
        const fadeProgress = clamp01(fadeAge / 700);
        opacity *= (1 - fadeProgress);
        life = Math.max(life, fadeProgress);
      }

      if (life >= 1 || opacity <= 0.015) {
        removeParticle(particle);
        return;
      }

      const scale = particle.baseScale * (particle.trackCursor ? 1 - life * 0.42 : 1 - life * 0.68);
      const shimmer = 0.72 + Math.sin((age + particle.rotate * 1000) / 115) * 0.18;
      const finalOpacity = Math.max(0, opacity * shimmer);

      particle.el.style.opacity = finalOpacity.toFixed(3);
      particle.el.style.transform =
        `translate3d(${particle.x.toFixed(2)}px, ${particle.y.toFixed(2)}px, 0) ` +
        `rotate(${particle.rotate.toFixed(3)}rad) ` +
        `scale(${Math.max(0.18, scale).toFixed(3)})`;

      nextParticles.push(particle);
    });

    particles = nextParticles;

    if (particles.length) {
      raf = requestAnimationFrame(updateParticles);
    }
  }

  function triggerHint() {
    const arrow = getArrow();
    if (!arrow || !isCoverHintReady()) return;

    clearBounce();

    void arrow.offsetWidth;

    arrow.classList.add('cover-hint-bounce');

    bounceTimer = window.setTimeout(() => {
      bounceTimer = null;
      arrow.classList.remove('cover-hint-bounce');
    }, 980);

    spawnParticleBurst();
  }

  function bindEventsOnce() {
    if (initialized) return;

    initialized = true;

    window.addEventListener('pointermove', updatePointer, { passive: true });
    window.addEventListener('pagehide', stop);
    window.addEventListener('blur', stop);
  }

  bindEventsOnce();

  window.CoverEnterHint = {
    start,
    stop,
    triggerHint
  };
})();
