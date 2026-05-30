(function () {
  'use strict';

  const ROOT_ID = 'resume';
  const MOUNT_ID = 'mount-resume';

  let mutationObserver = null;
  let optimizeRaf = 0;

  function getMount() {
    return document.getElementById(MOUNT_ID) || document.body;
  }

  function getResumeRoot() {
    return document.getElementById(ROOT_ID);
  }

  function ensureResumeRoot() {
    let resume = getResumeRoot();

    if (resume) {
      return resume;
    }

    const mount = getMount();
    resume = document.createElement('div');
    resume.id = ROOT_ID;
    mount.appendChild(resume);

    return resume;
  }

  function getEnglishTemplate() {
    if (
      typeof window.RESUME_EN_INNER_HTML === 'string' &&
      window.RESUME_EN_INNER_HTML.trim()
    ) {
      return window.RESUME_EN_INNER_HTML;
    }

    return '';
  }

  function optimizeResumeImages(scope) {
    const root = scope || getResumeRoot();
    if (!root) return;

    const images = Array.from(root.querySelectorAll('img'));

    images.forEach((img) => {
      if (!img.hasAttribute('decoding')) {
        img.setAttribute('decoding', 'async');
      }

      const isHeroAvatar = !!img.closest('.resume-hero-avatar');

      if (isHeroAvatar) {
        img.setAttribute('loading', 'eager');
        img.setAttribute('fetchpriority', 'high');

        try {
          img.fetchPriority = 'high';
        } catch (e) {}

        return;
      }

      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }
    });
  }

  function scheduleImageOptimization(scope) {
    if (optimizeRaf) {
      cancelAnimationFrame(optimizeRaf);
    }

    optimizeRaf = requestAnimationFrame(() => {
      optimizeRaf = 0;
      optimizeResumeImages(scope);
    });
  }

  function observeResumeChanges(resume) {
    if (!resume || mutationObserver) return;

    mutationObserver = new MutationObserver(() => {
      scheduleImageOptimization(resume);
    });

    mutationObserver.observe(resume, {
      childList: true,
      subtree: true
    });
  }

  function renderEnglishResume() {
    const resume = ensureResumeRoot();

    if (!resume) {
      return null;
    }

    if (!resume.innerHTML.trim()) {
      const html = getEnglishTemplate();

      if (!html) {
        console.warn('[AboutResumeRender] RESUME_EN_INNER_HTML is empty or unavailable.');
        return resume;
      }

      resume.innerHTML = html;
      resume.dataset.renderedLang = 'en';
      resume.dataset.aboutRendered = '1';
    }

    observeResumeChanges(resume);
    optimizeResumeImages(resume);

    return resume;
  }

  function waitForImageReady(img, timeout) {
    if (!img) return Promise.resolve(false);

    const timeoutMs = Math.max(0, Number(timeout) || 1400);

    if (img.complete && img.naturalWidth > 0) {
      if (typeof img.decode === 'function') {
        return img.decode()
          .then(() => true)
          .catch(() => true);
      }

      return Promise.resolve(true);
    }

    return new Promise((resolve) => {
      let settled = false;
      let timer = null;

      function cleanup() {
        img.removeEventListener('load', handleLoad);
        img.removeEventListener('error', handleError);

        if (timer) {
          window.clearTimeout(timer);
          timer = null;
        }
      }

      function done(value) {
        if (settled) return;

        settled = true;
        cleanup();
        resolve(value);
      }

      function handleLoad() {
        if (typeof img.decode === 'function') {
          img.decode()
            .then(() => done(true))
            .catch(() => done(true));
          return;
        }

        done(true);
      }

      function handleError() {
        done(false);
      }

      img.addEventListener('load', handleLoad, { once: true });
      img.addEventListener('error', handleError, { once: true });

      if (timeoutMs > 0) {
        timer = window.setTimeout(() => {
          done(img.complete && img.naturalWidth > 0);
        }, timeoutMs);
      }
    });
  }

  function waitForCriticalImages(options) {
    const opts = options || {};
    const resume = renderEnglishResume();

    if (!resume) return Promise.resolve(false);

    const avatar = resume.querySelector('.resume-hero-avatar img');

    if (!avatar) return Promise.resolve(false);

    avatar.setAttribute('loading', 'eager');
    avatar.setAttribute('fetchpriority', 'high');
    avatar.setAttribute('decoding', 'async');

    try {
      avatar.fetchPriority = 'high';
    } catch (e) {}

    return waitForImageReady(avatar, opts.timeout || 1400);
  }

  function init() {
    const resume = renderEnglishResume();

    if (resume && window.ResumeExpanders && typeof window.ResumeExpanders.init === 'function') {
      window.ResumeExpanders.init(resume);
    }

    if (resume && window.CustomCursorAPI && typeof window.CustomCursorAPI.refresh === 'function') {
      window.CustomCursorAPI.refresh(resume);
    }
  }

  window.AboutResumeRender = {
    init,
    renderEnglishResume,
    optimizeResumeImages,
    waitForCriticalImages
  };

  if (window.SitePages && typeof window.SitePages.register === 'function') {
    window.SitePages.register('resume', {
      init() {
        init();
      },

      refresh() {
        init();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('site:langchange', () => {
    scheduleImageOptimization(getResumeRoot());
  });
})();
