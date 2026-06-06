(function () {
  'use strict';

  const ROOT_ID = 'social';
  const MOUNT_ID = 'mount-social';

  function getMount() {
    return document.getElementById(MOUNT_ID) || document.body;
  }

  function getSocialRoot() {
    return document.getElementById(ROOT_ID);
  }

  function refreshAfterRender(root) {
    if (!root) return;

    if (window.CustomCursorAPI && typeof window.CustomCursorAPI.refresh === 'function') {
      window.CustomCursorAPI.refresh(root);
    }
  }

  function renderSocialPage() {
    const existing = getSocialRoot();

    if (existing) {
      refreshAfterRender(existing);
      return existing;
    }

    const mount = getMount();

    mount.insertAdjacentHTML('beforeend', `
      <div id="social">
        <button id="toggle-btn-social">
          <span><i class="fas fa-sun"></i></span>
        </button>
        <div id="clock-social">GMT+8 00:00</div>

        <!-- Social cards -->
        <div class="container">
          <div class="social-heading" data-i18n="social_heading">Connect With Me</div>
          
          <div class="social-grid">
            <!-- YouTube card -->
            <div class="social-card">
              <div class="social-icon"><i class="fab fa-youtube"></i></div>
              <div class="social-title" data-i18n="youtube_title">YouTube</div>
              <div class="social-description" data-i18n="youtube_desc">My video content and playlists</div>
              <div class="social-link-group">
                <a href="https://www.youtube.com/channel/UCemKYMAMJk8FggZ5NI36i1Q" class="social-link" target="_blank" rel="noopener noreferrer" data-i18n="link_channel">Channel</a>
                <span class="social-divider">/</span>
                <a href="https://www.youtube.com/@JinghaoChen-Stardust" class="social-link" target="_blank" rel="noopener noreferrer" data-i18n="link_handle">Handle</a>
              </div>
            </div>
            
            <!-- TikTok card -->
            <div class="social-card">
              <div class="social-icon"><i class="fab fa-tiktok"></i></div>
              <div class="social-title" data-i18n="tiktok_title">TikTok (Chinese)</div>
              <div class="social-description" data-i18n="tiktok_desc">Short-form videos in Chinese</div>
              <div class="social-link-group">
                <a href="https://www.douyin.com/user/MS4wLjABAAAAqb9M45SaGeb8yI28lL3lDFHm48c4kl32Xq7BfRk3I24" class="social-link" target="_blank" rel="noopener noreferrer" data-i18n="link_link1">Link 1</a>
                <span class="social-divider">/</span>
                <a href="https://v.douyin.com/PzIS6mSXJGY/" class="social-link" target="_blank" rel="noopener noreferrer" data-i18n="link_link2">Link 2</a>
              </div>
            </div>
            
            <!-- REDnote (Xiaohongshu) card -->
            <div class="social-card">
              <div class="social-icon"><i class="fas fa-book"></i></div>
              <div class="social-title" data-i18n="rednote_title">REDnote</div>
              <div class="social-description" data-i18n="rednote_desc">Chinese lifestyle and knowledge sharing</div>
              <a href="https://www.xiaohongshu.com/user/profile/64c696da000000000b005093" class="social-link" target="_blank" rel="noopener noreferrer" data-i18n="link_profile">Profile</a>
            </div>
            
            <!-- Quora card -->
            <div class="social-card">
              <div class="social-icon"><i class="fab fa-quora"></i></div>
              <div class="social-title" data-i18n="quora_title">Quora</div>
              <div class="social-description" data-i18n="quora_desc">Various questions and answers</div>
              <a href="https://www.quora.com/profile/Jinghao-Chen-11/" class="social-link" target="_blank" rel="noopener noreferrer" data-i18n="link_profile">Profile</a>
            </div>
            
            <!-- Twitter/X card -->
            <div class="social-card">
              <div class="social-icon"><i class="fab fa-twitter"></i></div>
              <div class="social-title" data-i18n="x_title">X (Twitter)</div>
              <div class="social-description" data-i18n="x_desc">Notes and sharing</div>
              <a href="https://x.com/stardust_math" class="social-link" target="_blank" rel="noopener noreferrer" data-i18n="link_profile">Profile</a>
            </div>
            
            <!-- Bilibili card -->
            <div class="social-card">
              <div class="social-icon">
                <svg class="bilibili-icon" viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.99 6.5a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6.01a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h2.75l-1-3a.5.5 0 0 1 .33-.63l.94-.3a.5.5 0 0 1 .63.32l1.1 3.1h2.64l1.1-3.1a.5.5 0 0 1 .63-.32l.94.3a.5.5 0 0 1 .33.63l-1 3h2.75zm-2.74 2.5H8.75a1.5 1.5 0 0 0-1.5 1.5v3a1.5 1.5 0 0 0 1.5 1.5h6.5a1.5 1.5 0 0 0 1.5-1.5v-3a1.5 1.5 0 0 0-1.5-1.5z"
                        fill="currentColor" stroke="currentColor" stroke-width="0.2"/>
                  <circle cx="10.5" cy="11.5" r="1" fill="currentColor"/>
                  <circle cx="13.5" cy="11.5" r="1" fill="currentColor"/>
                </svg>
              </div>
              <div class="social-title" data-i18n="bilibili_title">Bilibili</div>
              <div class="social-description" data-i18n="bilibili_desc">Chinese video platform for my content</div>
              <a href="https://space.bilibili.com/470364718" class="social-link" target="_blank" rel="noopener noreferrer" data-i18n="link_channel">Channel</a>
            </div>

            <!-- GitHub card -->
            <div class="social-card">
              <div class="social-icon"><i class="fab fa-github"></i></div>
              <div class="social-title" data-i18n="github_title">GitHub</div>
              <div class="social-description" data-i18n="github_desc">My code repositories and projects</div>
              <a href="https://github.com/Stardust-math" class="social-link" target="_blank" rel="noopener noreferrer" data-i18n="link_profile">Profile</a>
            </div>

            <!-- Steam card -->
            <div class="social-card">
              <div class="social-icon"><i class="fab fa-steam"></i></div>
              <div class="social-title" data-i18n="steam_title">Steam</div>
              <div class="social-description" data-i18n="steam_desc">My gaming profile and library</div>
              <a href="https://steamcommunity.com/id/stardust-math/" class="social-link" target="_blank" rel="noopener noreferrer" data-i18n="link_profile">Profile</a>
            </div>
          </div>
        </div>

        <!-- Website statistics -->
        <div class="container stats-container">
          <div class="stats-heading" data-i18n="stats_heading">Website Statistics</div>

          <!-- GoatCounter summary -->
          <div class="stats-metrics" aria-label="GoatCounter summary">
            <div class="stats-metric">
              <div class="stats-metric-label" data-i18n="metric_total">All-time (Total)</div>
              <div class="stats-metric-value" id="gc-total">—</div>
            </div>
            <div class="stats-metric">
              <div class="stats-metric-label" data-i18n="metric_month">Last 30 days</div>
              <div class="stats-metric-value" id="gc-month">—</div>
            </div>
            <div class="stats-metric">
              <div class="stats-metric-label" data-i18n="metric_week">Last 7 days</div>
              <div class="stats-metric-value" id="gc-week">—</div>
            </div>
            <div class="stats-metric">
              <div class="stats-metric-label" data-i18n="metric_page">This path</div>
              <div class="stats-metric-value" id="gc-page">—</div>
            </div>
          </div>

          <!-- GoatCounter dashboard -->
          <div class="stats-block">
            <div class="stats-subtitle">
              <span data-i18n="dashboard_title">GoatCounter Dashboard</span>
              <a class="stats-link" href="https://stardust.goatcounter.com/" target="_blank" rel="noopener noreferrer" data-i18n="link_open">Open</a>
            </div>

            <div class="stats-embed">
              <iframe
                class="goatcounter-frame"
                title="GoatCounter dashboard"
                loading="lazy"
                data-src="https://stardust.goatcounter.com?hideui=1"
              ></iframe>
            </div>
          </div>

          <div class="stats-sep"></div>

          <!-- ClustrMaps visitor map -->
          <div class="stats-block">
            <div class="stats-subtitle">
              <span data-i18n="visitor_map">Visitor Map</span>
            </div>
            <div class="clustrmaps-wrap">
              <div id="clustrmaps-placeholder"></div>
            </div>
          </div>

          <div class="stats-sep"></div>

          <!-- Giscus guestbook -->
          <div class="stats-block comments-block">
            <div class="stats-subtitle comments-subtitle">
              <span data-i18n="comments_title">Guestbook</span>
              <span id="giscus-meta" class="comments-meta" aria-live="polite"></span>
            </div>

            <p class="stats-note comments-note" data-i18n="comments_note">
              Feel free to leave a note, suggestion, or academic message. Comments are stored in GitHub Discussions.
            </p>

            <div class="comments-actions">
              <a
                id="giscus-github-link"
                class="stats-link comments-github-link"
                href="https://github.com/Stardust-math/Stardust-math.github.io/discussions/2"
                target="_blank"
                rel="noopener noreferrer"
                data-i18n="comments_open_github"
              >Open on GitHub</a>
            </div>

            <div id="giscus-container" class="giscus-container">
              <div id="giscus-loading" class="giscus-loading" data-i18n="comments_loading">
                Loading comments...
              </div>
            </div>
          </div>
        </div>
        
        <a href="#" class="back-btn" id="social-back-btn">
          <i class="fas fa-arrow-left"></i>
        </a>
      </div>
    `);

    const root = getSocialRoot();
    refreshAfterRender(root);

    return root;
  }

  function init() {
    return renderSocialPage();
  }

  window.SocialRender = {
    init,
    renderSocialPage
  };

  if (window.SitePages && typeof window.SitePages.register === 'function') {
    window.SitePages.register('social', {
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
})();
