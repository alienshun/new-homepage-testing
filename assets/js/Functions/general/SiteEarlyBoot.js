(function () {
  'use strict';

  const resources = window.SiteResources;

  if (!resources) {
    console.error('[SiteEarlyBoot] window.SiteResources is not defined.');
    return;
  }

  const state = {
    selectedCoverFile: null,
    selectedCoverUrl: null
  };

  function normalizeUrl(url) {
    try {
      return new URL(url, document.baseURI).href;
    } catch (e) {
      return url;
    }
  }

  function hasStyle(href) {
    const abs = normalizeUrl(href);
    const links = Array.from(document.querySelectorAll('link[rel="stylesheet"][href]'));

    return links.some((link) => {
      return link.href === abs || normalizeUrl(link.getAttribute('href')) === abs;
    });
  }

  function addStyle(href) {
    if (!href || hasStyle(href)) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.dataset.siteEarlyBoot = 'style';
    document.head.appendChild(link);
  }

  function setSiteMeta() {
    if (resources.site && resources.site.title) {
      document.title = resources.site.title;
    }

    const favicon = resources.site && resources.site.favicon;
    if (!favicon || !favicon.href) return;

    const existing = document.querySelector('link[rel="icon"]');
    const abs = normalizeUrl(favicon.href);

    if (existing) {
      const oldHref = existing.href || normalizeUrl(existing.getAttribute('href'));
      if (oldHref === abs) return;
      existing.remove();
    }

    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = favicon.href;

    if (favicon.type) {
      link.type = favicon.type;
    }

    document.head.appendChild(link);
  }

  function loadCoreStylesEarly() {
    const coreStyles = resources.styles && resources.styles.core;
    if (!Array.isArray(coreStyles)) return;

    coreStyles.forEach(addStyle);
  }

  function chooseCoverFile() {
    const images = resources.images || {};
    const files = Array.isArray(images.coverFiles) ? images.coverFiles : [];

    if (!files.length) return null;

    return files[Math.floor(Math.random() * files.length)];
  }

  function warmCoverImage() {
    const images = resources.images || {};
    const coverDir = images.coverDir || './assets/images/cover/';
    const chosen = chooseCoverFile();

    if (!chosen) return;

    const url = coverDir + chosen;

    state.selectedCoverFile = chosen;
    state.selectedCoverUrl = url;

    const img = new Image();

    try {
      img.decoding = 'async';
    } catch (e) {}

    try {
      img.fetchPriority = 'high';
    } catch (e) {}

    img.src = url;
  }

  function warmAboutProfileImage() {
    const images = resources.images || {};
    const about = images.about || {};
    const url = about.profile || './assets/images/about/profile.jpg';

    if (!url) return;

    const existingPreload = Array.from(document.querySelectorAll('link[rel="preload"][as="image"][href]'))
      .some((link) => {
        return link.href === normalizeUrl(url) || normalizeUrl(link.getAttribute('href')) === normalizeUrl(url);
      });

    if (!existingPreload) {
      const preload = document.createElement('link');
      preload.rel = 'preload';
      preload.as = 'image';
      preload.href = url;
      preload.dataset.siteEarlyBoot = 'about-profile-preload';

      try {
        preload.fetchPriority = 'high';
      } catch (e) {}

      try {
        preload.setAttribute('fetchpriority', 'high');
      } catch (e) {}

      document.head.appendChild(preload);
    }

    const img = new Image();

    try {
      img.decoding = 'async';
    } catch (e) {}

    try {
      img.fetchPriority = 'high';
    } catch (e) {}

    img.src = url;
  }

  setSiteMeta();
  loadCoreStylesEarly();
  warmCoverImage();
  warmAboutProfileImage();

  window.SiteEarlyBoot = {
    getSelectedCoverFile() {
      return state.selectedCoverFile;
    },

    getSelectedCoverUrl() {
      return state.selectedCoverUrl;
    }
  };
})();
