(function () {
  'use strict';

  let defaultPage = 'resume';

  let showPage = function () {};
  let warmPage = function () {
    return Promise.resolve(null);
  };
  let isCoverHidden = function () {
    return false;
  };

  let wheelTriggered = false;
  let wheelLockTimer = null;
  let appHeightRaf = 0;
  let keydownBound = false;
  let visualRestoreBlockUntil = 0;

  const VISUAL_RESTORE_GUARD_MS = 420;

  function syncAppHeight() {
    try {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    } catch (e) {}
  }

  function scheduleAppHeightSync() {
    if (appHeightRaf) {
      cancelAnimationFrame(appHeightRaf);
    }

    appHeightRaf = requestAnimationFrame(() => {
      appHeightRaf = 0;
      syncAppHeight();
    });
  }

  function initAppHeightSync() {
    if (window.__bootstrapCoverInputAppHeightBound) return;
    window.__bootstrapCoverInputAppHeightBound = true;

    syncAppHeight();

    window.addEventListener('resize', scheduleAppHeightSync, { passive: true });
    window.addEventListener('orientationchange', scheduleAppHeightSync, { passive: true });
  }

  function lockWheelTrigger(ms) {
    wheelTriggered = true;

    if (wheelLockTimer) {
      clearTimeout(wheelLockTimer);
    }

    wheelLockTimer = setTimeout(() => {
      wheelTriggered = false;
    }, ms);
  }

  function startCoverEnterHint() {
    if (
      window.CoverEnterHint &&
      typeof window.CoverEnterHint.start === 'function'
    ) {
      window.CoverEnterHint.start();
    }
  }

  function stopCoverEnterHint() {
    if (
      window.CoverEnterHint &&
      typeof window.CoverEnterHint.stop === 'function'
    ) {
      window.CoverEnterHint.stop();
    }
  }

  function getCover() {
    return document.getElementById('cover');
  }

  function getVisualToggle() {
    return document.getElementById('cover-visual-toggle');
  }

  function isVisualRestoreGuardActive() {
    return Date.now() < visualRestoreBlockUntil;
  }

  function isCoverVisualMode() {
    const cover = getCover();

    return !!cover &&
      cover.classList.contains('cover-visual-clean') &&
      !cover.classList.contains('hidden') &&
      !cover.classList.contains('leaving') &&
      cover.style.display !== 'none';
  }

  function setVisualToggleState(active) {
    const toggle = getVisualToggle();

    if (!toggle) return;

    toggle.setAttribute('aria-pressed', active ? 'true' : 'false');
    toggle.setAttribute(
      'aria-label',
      active ? 'Return to cover interface' : 'Enter cinematic cover view'
    );
    toggle.title = active ? 'Return' : 'Cinematic View';
    toggle.classList.toggle('is-closed', !!active);
  }

  function getCoverInterfaceElements() {
    return [
      document.getElementById('avatar-frame'),
      document.getElementById('name'),
      document.getElementById('slogan'),
      document.getElementById('cover-scroll')
    ].filter(Boolean);
  }

  function makeCoverInterfaceVisible() {
    getCoverInterfaceElements().forEach((el) => {
      el.classList.add('visible');
      el.classList.remove('pulse', 'cover-hint-bounce');
    });
  }

  function enterCoverVisualMode() {
    const cover = getCover();

    if (!cover || isCoverHidden()) return;
    if (cover.classList.contains('hidden') || cover.classList.contains('leaving')) return;

    stopCoverEnterHint();
    makeCoverInterfaceVisible();
    setVisualToggleState(true);

    cover.classList.add('cover-visual-clean');
    cover.dataset.coverVisualMode = '1';
  }

  function exitCoverVisualMode() {
    const cover = getCover();

    if (!cover || !cover.classList.contains('cover-visual-clean')) return;

    visualRestoreBlockUntil = Date.now() + VISUAL_RESTORE_GUARD_MS;

    makeCoverInterfaceVisible();

    cover.classList.remove('cover-visual-clean');
    delete cover.dataset.coverVisualMode;

    setVisualToggleState(false);

    window.setTimeout(() => {
      if (!isCoverVisualMode() && !isCoverHidden()) {
        startCoverEnterHint();
      }
    }, 520);
  }

  function showCoverElements() {
    const cover = document.getElementById('cover');
    const avatarFrame = document.getElementById('avatar-frame');
    const name = document.getElementById('name');
    const slogan = document.getElementById('slogan');
    const arrow = document.getElementById('cover-scroll');

    if (!cover || !avatarFrame || !name || !slogan) return;

    function canShow() {
      return !isCoverHidden() &&
        !isCoverVisualMode() &&
        !cover.classList.contains('hidden') &&
        !cover.classList.contains('leaving');
    }

    function resetElements() {
      stopCoverEnterHint();

      avatarFrame.classList.remove('visible');
      name.classList.remove('visible');
      slogan.classList.remove('visible');

      if (arrow) {
        arrow.classList.remove('visible');
      }
    }

    function runSequence() {
      if (!canShow()) return;

      resetElements();

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          setTimeout(() => {
            if (canShow()) avatarFrame.classList.add('visible');
          }, 80);

          setTimeout(() => {
            if (canShow()) name.classList.add('visible');
          }, 340);

          setTimeout(() => {
            if (canShow()) slogan.classList.add('visible');
          }, 560);

          setTimeout(() => {
            if (arrow && canShow()) {
              arrow.classList.add('visible');
              startCoverEnterHint();
            }
          }, 880);
        });
      });
    }

    if (!canShow()) return;

    if (cover.classList.contains('background-ready')) {
      setTimeout(runSequence, 80);
      return;
    }

    let started = false;

    function startOnce() {
      if (started) return;

      started = true;
      runSequence();
    }

    const observer = new MutationObserver(() => {
      if (cover.classList.contains('background-ready')) {
        observer.disconnect();
        setTimeout(startOnce, 80);
      }
    });

    observer.observe(cover, {
      attributes: true,
      attributeFilter: ['class']
    });

    setTimeout(() => {
      observer.disconnect();
      startOnce();
    }, 760);
  }

  function hideCoverElements() {
    stopCoverEnterHint();

    const cover = getCover();

    if (cover) {
      cover.classList.remove('cover-visual-clean');
      delete cover.dataset.coverVisualMode;
    }

    setVisualToggleState(false);

    ['avatar-frame', 'name', 'slogan', 'cover-scroll'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('visible');
    });
  }

  function warmDefaultPage(reason) {
    if (isCoverVisualMode()) return Promise.resolve(null);

    return warmPage(defaultPage, reason || 'cover-intent');
  }

  function enterDefaultPage(triggerEl) {
    if (isCoverHidden() || isCoverVisualMode() || isVisualRestoreGuardActive()) return;

    if (triggerEl && triggerEl.classList) {
      triggerEl.classList.add('pulse');

      setTimeout(() => {
        triggerEl.classList.remove('pulse');
      }, 320);
    }

    showPage(defaultPage);
  }

  function bindVisualToggle(toggle) {
    if (!toggle || toggle.dataset.boundCoverVisualToggle === '1') return;

    toggle.dataset.boundCoverVisualToggle = '1';

    toggle.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (isCoverVisualMode()) {
        exitCoverVisualMode();
      } else {
        enterCoverVisualMode();
      }
    });
  }

  function bindVisualRestore(cover) {
    if (!cover || cover.dataset.boundCoverVisualRestore === '1') return;

    cover.dataset.boundCoverVisualRestore = '1';

    function restoreFromCleanView(event) {
      if (!isCoverVisualMode() && !isVisualRestoreGuardActive()) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      if (isCoverVisualMode()) {
        exitCoverVisualMode();
      }
    }

    cover.addEventListener('pointerdown', restoreFromCleanView, true);
    cover.addEventListener('click', restoreFromCleanView, true);
    cover.addEventListener('touchstart', restoreFromCleanView, {
      capture: true,
      passive: false
    });
  }

  function bindArrow(arrow) {
    if (!arrow || arrow.dataset.boundCoverArrow === '1') return;

    arrow.dataset.boundCoverArrow = '1';

    arrow.addEventListener('pointerenter', () => {
      if (isCoverVisualMode()) return;
      warmDefaultPage('cover-arrow-intent');
    }, { passive: true });

    arrow.addEventListener('focus', () => {
      if (isCoverVisualMode()) return;
      warmDefaultPage('cover-arrow-focus');
    });

    arrow.addEventListener('touchstart', () => {
      if (isCoverVisualMode()) return;
      warmDefaultPage('cover-arrow-touch');
    }, { passive: true });

    arrow.addEventListener('click', () => {
      enterDefaultPage(arrow);
    });
  }

  function bindAvatar(avatarFrame) {
    if (!avatarFrame || avatarFrame.dataset.boundCoverAvatarEnter === '1') return;

    avatarFrame.dataset.boundCoverAvatarEnter = '1';

    avatarFrame.addEventListener('pointerenter', () => {
      if (isCoverVisualMode()) return;
      warmDefaultPage('cover-avatar-intent');
    }, { passive: true });

    avatarFrame.addEventListener('touchstart', () => {
      if (isCoverVisualMode()) return;
      warmDefaultPage('cover-avatar-touch');
    }, { passive: true });

    /*
      Use capture + stopImmediatePropagation so that, if the old Blog.js
      avatar click listener is still loaded somewhere, the avatar will now
      enter the About page instead of triggering the blog easter egg.
    */
    avatarFrame.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();

      enterDefaultPage(avatarFrame);
    }, true);
  }

  function bindWheel(cover) {
    if (!cover || cover.dataset.boundCoverScroll === '1') return;

    cover.dataset.boundCoverScroll = '1';

    cover.addEventListener('wheel', (event) => {
      if (isCoverHidden()) return;

      if (isCoverVisualMode()) {
        event.preventDefault();
        return;
      }

      if (event.deltaY > 6 && !wheelTriggered) {
        event.preventDefault();

        lockWheelTrigger(900);
        showPage(defaultPage);

        return;
      }

      event.preventDefault();
    }, { passive: false });
  }

  function bindTouch(cover) {
    if (!cover || cover.dataset.boundCoverTouch === '1') return;

    cover.dataset.boundCoverTouch = '1';

    let touchStartY = 0;
    let touchStartX = 0;
    let touchActive = false;

    cover.addEventListener('touchstart', (event) => {
      if (isCoverHidden() || isCoverVisualMode()) return;
      if (!event.touches || event.touches.length !== 1) return;

      touchActive = true;
      touchStartY = event.touches[0].clientY;
      touchStartX = event.touches[0].clientX;
    }, { passive: true });

    cover.addEventListener('touchmove', (event) => {
      if (isCoverVisualMode()) {
        event.preventDefault();
        touchActive = false;
        return;
      }

      if (isCoverHidden() || !touchActive) return;

      const touch = event.touches && event.touches[0];
      if (!touch) return;

      const dy = touch.clientY - touchStartY;
      const dx = touch.clientX - touchStartX;

      if (Math.abs(dy) > Math.abs(dx) * 1.2) {
        event.preventDefault();
      }
    }, { passive: false });

    cover.addEventListener('touchend', (event) => {
      if (isCoverVisualMode()) {
        touchActive = false;
        return;
      }

      if (isCoverHidden() || !touchActive) return;

      touchActive = false;

      const touch = event.changedTouches && event.changedTouches[0]
        ? event.changedTouches[0]
        : null;

      if (!touch) return;

      const dy = touch.clientY - touchStartY;
      const dx = touch.clientX - touchStartX;

      const isVertical = Math.abs(dy) > Math.abs(dx) * 1.2;
      const strongEnough = Math.abs(dy) > 60;

      if (isVertical && strongEnough && !wheelTriggered) {
        lockWheelTrigger(900);
        showPage(defaultPage);
      }
    }, { passive: true });
  }

  function bindKeyboard() {
    if (keydownBound) return;

    keydownBound = true;

    window.addEventListener('keydown', (event) => {
      if (isCoverHidden()) return;

      const keys = ['ArrowDown', 'PageDown', 'Space'];

      if (keys.includes(event.code)) {
        event.preventDefault();

        if (isCoverVisualMode()) return;

        if (!wheelTriggered) {
          lockWheelTrigger(900);
          showPage(defaultPage);
        }
      }
    }, { passive: false });
  }

  function bindCoverArrowAndScroll() {
    const cover = document.getElementById('cover');
    const arrow = document.getElementById('cover-scroll');
    const avatarFrame = document.getElementById('avatar-frame');
    const visualToggle = document.getElementById('cover-visual-toggle');

    if (!cover) return;

    bindVisualToggle(visualToggle);
    bindVisualRestore(cover);
    bindArrow(arrow);
    bindAvatar(avatarFrame);
    bindWheel(cover);
    bindTouch(cover);
    bindKeyboard();
  }

  function configure(options) {
    const opts = options || {};

    defaultPage = opts.defaultPage || defaultPage;

    if (typeof opts.showPage === 'function') {
      showPage = opts.showPage;
    }

    if (typeof opts.warmPage === 'function') {
      warmPage = opts.warmPage;
    }

    if (typeof opts.isCoverHidden === 'function') {
      isCoverHidden = opts.isCoverHidden;
    }

    initAppHeightSync();
  }

  window.BootstrapCoverInput = {
    configure,
    initAppHeightSync,
    syncAppHeight,
    scheduleAppHeightSync,

    lockWheelTrigger,

    startCoverEnterHint,
    stopCoverEnterHint,
    showCoverElements,
    hideCoverElements,

    bindCoverArrowAndScroll,
    warmDefaultPage,
    enterDefaultPage,

    isCoverVisualMode,
    enterCoverVisualMode,
    exitCoverVisualMode
  };
})();