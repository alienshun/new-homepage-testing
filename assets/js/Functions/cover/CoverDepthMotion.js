(function () {
  'use strict';

  function clamp01(x) {
    return Math.max(0, Math.min(1, x));
  }

  function init() {
    const cover = document.getElementById('cover');
    if (!cover || cover.dataset.depthMotionBound === '1') return;

    cover.dataset.depthMotionBound = '1';

    try {
      const reduceMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const coarsePointer = window.matchMedia &&
        window.matchMedia('(pointer: coarse)').matches;

      if (reduceMotion || coarsePointer) return;
    } catch (e) {}

    const avatarFrame = document.getElementById('avatar-frame');
    const avatarImg = avatarFrame ? avatarFrame.querySelector('img') : null;
    const name = document.getElementById('name');
    const slogan = document.getElementById('slogan');
    const entranceCue = document.getElementById('cover-scroll');

    const MOTION_SETTLE_DELAY = 520;

    let avatarLoadFinished = !avatarImg;
    let coverElementsReadyAt = 0;

    if (avatarImg) {
      if (avatarImg.complete) {
        avatarLoadFinished = true;
      } else {
        avatarImg.addEventListener('load', () => {
          avatarLoadFinished = true;
        }, { once: true, passive: true });

        avatarImg.addEventListener('error', () => {
          avatarLoadFinished = true;
        }, { once: true, passive: true });
      }
    }

    const SPRING = {
      follow: {
        stiffness: 0.064,
        damping: 0.775
      },
      return: {
        stiffness: 0.044,
        damping: 0.83
      }
    };

    const MOTION_KEYS = [
      'bgX', 'bgY',
      'avatarX', 'avatarY',
      'nameX', 'nameY',
      'sloganX', 'sloganY',
      'cueX', 'cueY',
      'lightX', 'lightY'
    ];

    const state = {};
    const target = {};
    const velocity = {};

    MOTION_KEYS.forEach((key) => {
      state[key] = 0;
      target[key] = 0;
      velocity[key] = 0;
    });

    let raf = 0;
    let lastTickTime = 0;
    let motionMode = 'follow';
    let depthMotionSuspended = false;

    function coverStillVisible() {
      return cover.classList.contains('visible') &&
        !cover.classList.contains('hidden') &&
        !cover.classList.contains('leaving');
    }

    function videoBackgroundActive() {
      return cover.classList.contains('video-ready');
    }

    function coverElementsReady() {
      return cover.classList.contains('background-ready') &&
        (!avatarFrame || avatarFrame.classList.contains('visible')) &&
        (!name || name.classList.contains('visible')) &&
        (!slogan || slogan.classList.contains('visible')) &&
        (!entranceCue || entranceCue.classList.contains('visible')) &&
        avatarLoadFinished;
    }

    function coverMotionReady() {
      if (!coverStillVisible() || !coverElementsReady() || videoBackgroundActive()) {
        coverElementsReadyAt = 0;
        return false;
      }

      if (!coverElementsReadyAt) {
        coverElementsReadyAt = performance.now();
        return false;
      }

      return performance.now() - coverElementsReadyAt >= MOTION_SETTLE_DELAY;
    }

    function isCoverActive() {
      return !videoBackgroundActive() && coverStillVisible() && coverMotionReady();
    }

    function px(value) {
      return `${value.toFixed(2)}px`;
    }

    function pct(value) {
      return `${value.toFixed(2)}%`;
    }

    function setVars() {
      cover.style.setProperty('--cover-bg-x', px(state.bgX));
      cover.style.setProperty('--cover-bg-y', px(state.bgY));

      cover.style.setProperty('--cover-fg-x', px(state.nameX));
      cover.style.setProperty('--cover-fg-y', px(state.nameY));

      cover.style.setProperty('--cover-avatar-x', px(state.avatarX));
      cover.style.setProperty('--cover-avatar-y', px(state.avatarY));

      cover.style.setProperty('--cover-name-x', px(state.nameX));
      cover.style.setProperty('--cover-name-y', px(state.nameY));

      cover.style.setProperty('--cover-slogan-x', px(state.sloganX));
      cover.style.setProperty('--cover-slogan-y', px(state.sloganY));

      cover.style.setProperty('--cover-cue-x', px(state.cueX));
      cover.style.setProperty('--cover-cue-y', px(state.cueY));

      cover.style.setProperty('--cover-light-x', pct(50 + state.lightX));
      cover.style.setProperty('--cover-light-y', pct(44 + state.lightY));
    }

    function stopMotionLoop() {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }

      lastTickTime = 0;
    }

    function zeroMotionValues() {
      MOTION_KEYS.forEach((key) => {
        state[key] = 0;
        target[key] = 0;
        velocity[key] = 0;
      });

      setVars();
    }

    function suspendDepthMotion() {
      if (depthMotionSuspended) return;

      depthMotionSuspended = true;
      motionMode = 'return';
      coverElementsReadyAt = 0;

      stopMotionLoop();
      zeroMotionValues();
    }

    function resumeDepthMotion() {
      if (!depthMotionSuspended) return;

      depthMotionSuspended = false;
      coverElementsReadyAt = 0;
      zeroMotionValues();
    }

    function resetTargets() {
      if (videoBackgroundActive()) {
        suspendDepthMotion();
        return;
      }

      resumeDepthMotion();

      motionMode = 'return';

      MOTION_KEYS.forEach((key) => {
        target[key] = 0;
      });

      startMotionLoop();
    }

    function springStep(key, params, dtScale) {
      velocity[key] += (target[key] - state[key]) * params.stiffness * dtScale;
      velocity[key] *= Math.pow(params.damping, dtScale);
      state[key] += velocity[key] * dtScale;
    }

    function isStillMoving() {
      return MOTION_KEYS.some((key) => (
        Math.abs(target[key] - state[key]) > 0.018 ||
        Math.abs(velocity[key]) > 0.018
      ));
    }

    function settleTinyValues() {
      MOTION_KEYS.forEach((key) => {
        if (
          Math.abs(target[key] - state[key]) <= 0.018 &&
          Math.abs(velocity[key]) <= 0.018
        ) {
          state[key] = target[key];
          velocity[key] = 0;
        }
      });
    }

    function startMotionLoop() {
      if (raf || depthMotionSuspended || videoBackgroundActive()) return;

      lastTickTime = 0;

      function tick(now) {
        raf = 0;

        if (depthMotionSuspended || videoBackgroundActive()) {
          suspendDepthMotion();
          return;
        }

        const dtScale = lastTickTime
          ? Math.min(2.35, Math.max(0.55, (now - lastTickTime) / 16.667))
          : 1;

        lastTickTime = now;

        const params = SPRING[motionMode] || SPRING.follow;

        MOTION_KEYS.forEach((key) => {
          springStep(key, params, dtScale);
        });

        settleTinyValues();
        setVars();

        if (coverStillVisible() && isStillMoving()) {
          raf = requestAnimationFrame(tick);
        } else {
          lastTickTime = 0;
        }
      }

      raf = requestAnimationFrame(tick);
    }

    function shouldPauseDepthMotion(event) {
      const targetEl = event.target;

      if (!(targetEl instanceof Element)) return false;

      return Boolean(
        targetEl.closest('#avatar-frame') ||
        targetEl.closest('#cover-scroll')
      );
    }

    cover.addEventListener('pointermove', (event) => {
      if (videoBackgroundActive()) {
        suspendDepthMotion();
        return;
      }

      resumeDepthMotion();

      if (!isCoverActive()) {
        resetTargets();
        return;
      }

      if (event.pointerType && event.pointerType !== 'mouse') return;

      if (shouldPauseDepthMotion(event)) {
        resetTargets();
        return;
      }

      const rect = cover.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const nxRaw = clamp01((event.clientX - rect.left) / rect.width) * 2 - 1;
      const nyRaw = clamp01((event.clientY - rect.top) / rect.height) * 2 - 1;

      const nx = Math.sign(nxRaw) * Math.pow(Math.abs(nxRaw), 0.92);
      const ny = Math.sign(nyRaw) * Math.pow(Math.abs(nyRaw), 0.92);

      motionMode = 'follow';

      target.bgX = -nx * 5.2;
      target.bgY = -ny * 3.9;

      target.avatarX = nx * 2.75;
      target.avatarY = ny * 2.05;

      target.nameX = nx * 1.55;
      target.nameY = ny * 1.12;

      target.sloganX = nx * 1.10;
      target.sloganY = ny * 0.82;

      target.cueX = nx * 2.35;
      target.cueY = ny * 1.82;

      target.lightX = nx * 5.8;
      target.lightY = ny * 4.3;

      startMotionLoop();
    }, { passive: true });

    cover.addEventListener('pointerleave', resetTargets, { passive: true });
    window.addEventListener('blur', resetTargets);

    if (avatarFrame) {
      avatarFrame.addEventListener('pointerenter', resetTargets, { passive: true });
      avatarFrame.addEventListener('pointermove', resetTargets, { passive: true });
    }

    if (entranceCue) {
      entranceCue.addEventListener('pointerenter', resetTargets, { passive: true });
      entranceCue.addEventListener('pointermove', resetTargets, { passive: true });
    }

    const observer = new MutationObserver(() => {
      if (videoBackgroundActive()) {
        suspendDepthMotion();
        return;
      }

      if (!coverStillVisible() || !coverElementsReady()) {
        coverElementsReadyAt = 0;
        resetTargets();
        return;
      }

      resumeDepthMotion();
    });

    observer.observe(cover, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  window.CoverDepthMotion = {
    init
  };
})();
