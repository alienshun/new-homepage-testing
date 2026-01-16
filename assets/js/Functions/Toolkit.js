(function () {
  const mount = document.getElementById("mount-toolkit") || document.body;
  mount.insertAdjacentHTML("beforeend", `
  <div id="toolkit">
    <button id="toggle-btn-toolkit">
      <span><i class="fas fa-sun"></i></span>
    </button>
    <div id="clock-toolkit">GMT+8 00:00</div>
    <div class="container">
      <div class="toolkit-heading" data-i18n="toolkit_heading">Academic Toolkit</div>
      
      <!-- Search box -->
      <div class="toolkit-search">
        <div class="search-container">
          <i class="fas fa-search search-icon"></i>
          <input
            type="text"
            class="search-input"
            placeholder="Search tools by name..."
            data-i18n-placeholder="search_placeholder"
            id="toolkit-search-input"
          >
        </div>
      </div>
      
      <!-- Category filters -->
      <div class="toolkit-filter">
        <button class="filter-btn active" data-category="all" data-i18n="filter_all">All</button>
        <button class="filter-btn" data-category="development" data-i18n="filter_development">Development</button>
        <button class="filter-btn" data-category="communication" data-i18n="filter_communication">Communication</button>
        <button class="filter-btn" data-category="media" data-i18n="filter_media">Media & Video</button>
        <button class="filter-btn" data-category="music" data-i18n="filter_music">Music</button>
        <button class="filter-btn" data-category="knowledge" data-i18n="filter_knowledge">Knowledge</button>
        <button class="filter-btn" data-category="productivity" data-i18n="filter_productivity">Productivity</button>
        <button class="filter-btn" data-category="reference" data-i18n="filter_reference">Document and Management</button>
        <button class="filter-btn" data-category="ustc" data-i18n="filter_ustc">USTC Services</button>
      </div>
      
      <!-- Development category -->
      <div class="category-section" data-category="development">
        <h3 class="category-title" data-i18n="category_development">Development</h3>
        <div class="toolkit-grid">
          <!-- GitHub -->
          <div class="toolkit-card" data-title="github" data-categories="development">
            <div class="toolkit-icon github-icon">
              <i class="fab fa-github"></i>
            </div>
            <div class="toolkit-title">GitHub</div>
            <a href="https://github.com/" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>
          
          <!-- Maple -->
          <div class="toolkit-card" data-title="maple" data-categories="development">
            <div class="toolkit-icon maple-icon">
              <i class="fas fa-calculator"></i>
            </div>
            <div class="toolkit-title">Maple</div>
            <a href="https://learn.maplesoft.com/doc" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>
          
          <!-- DeepSeek -->
          <div class="toolkit-card" data-title="deepseek" data-categories="development">
            <div class="toolkit-icon deepseek-icon">
              <i class="fas fa-robot"></i>
            </div>
            <div class="toolkit-title">DeepSeek</div>
            <a href="https://chat.deepseek.com/" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>
          
          <!-- ChatGPT -->
          <div class="toolkit-card" data-title="chatgpt" data-categories="development">
            <div class="toolkit-icon chatgpt-icon">
              <i class="fas fa-comment-dots"></i>
            </div>
            <div class="toolkit-title">ChatGPT</div>
            <a href="https://chatgpt.com/" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>
          
          <!-- Grok -->
          <div class="toolkit-card" data-title="grok" data-categories="development">
            <div class="toolkit-icon grok-icon">
              <i class="fas fa-brain"></i>
            </div>
            <div class="toolkit-title">Grok</div>
            <a href="https://grok.com/" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>
          
          <!-- DeepL -->
          <div class="toolkit-card" data-title="deepl" data-categories="development">
            <div class="toolkit-icon deepl-icon">
              <i class="fas fa-language"></i>
            </div>
            <div class="toolkit-title">DeepL</div>
            <a href="https://www.deepl.com/zh/translator" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>
          
          <!-- Overleaf -->
          <div class="toolkit-card" data-title="overleaf" data-categories="development">
            <div class="toolkit-icon overleaf-icon">
              <i class="fas fa-leaf"></i>
            </div>
            <div class="toolkit-title">Overleaf</div>
            <a href="https://cn.overleaf.com/project" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>
          
          <!-- Jupyter -->
          <div class="toolkit-card" data-title="jupyter" data-categories="development">
            <div class="toolkit-icon jupyter-icon">
              <i class="fas fa-code"></i>
            </div>
            <div class="toolkit-title">Jupyter</div>
            <a href="https://jupyter.org/try" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>

          <!-- Wolfram Alpha -->
          <div class="toolkit-card" data-title="wolfram alpha" data-categories="development">
            <div class="toolkit-icon wolfram-icon">
              <i class="fas fa-infinity"></i>
            </div>
            <div class="toolkit-title">Wolfram Alpha</div>
            <a href="https://www.wolframalpha.com/" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>

          <!-- GitLab -->
          <div class="toolkit-card" data-title="gitlab" data-categories="development">
            <div class="toolkit-icon gitlab-icon">
              <i class="fab fa-gitlab"></i>
            </div>
            <div class="toolkit-title">GitLab</div>
            <a href="https://gitlab.com/" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>

          <!-- CodeSandbox -->
          <div class="toolkit-card" data-title="codesandbox" data-categories="development">
            <div class="toolkit-icon codesandbox-icon">
              <i class="fas fa-laptop-code"></i>
            </div>
            <div class="toolkit-title">CodeSandbox</div>
            <a href="https://codesandbox.io/" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>

          <!-- LeetCode -->
          <div class="toolkit-card" data-title="leetcode" data-categories="development">
            <div class="toolkit-icon leetcode-icon">
              <i class="fas fa-code"></i>
            </div>
            <div class="toolkit-title">LeetCode</div>
            <a href="https://leetcode.com/" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>

          <!-- Tableau -->
          <div class="toolkit-card" data-title="tableau" data-categories="datascience">
            <div class="toolkit-icon tableau-icon">
              <i class="fas fa-chart-bar"></i>
            </div>
            <div class="toolkit-title">Tableau Public</div>
            <a href="https://public.tableau.com/" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>
    
          <!-- Colab -->
          <div class="toolkit-card" data-title="colab" data-categories="datascience">
            <div class="toolkit-icon colab-icon">
              <i class="fas fa-brain"></i>
            </div>
            <div class="toolkit-title">Colab</div>
            <a href="https://colab.research.google.com/" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>
        </div>
      </div>
      
      <!-- Communication category -->
      <div class="category-section" data-category="communication">
        <h3 class="category-title" data-i18n="category_communication">Communication</h3>
        <div class="toolkit-grid">
          <!-- Gmail -->
          <div class="toolkit-card" data-title="gmail" data-categories="communication">
            <div class="toolkit-icon gmail-icon">
              <i class="fas fa-envelope"></i>
            </div>
            <div class="toolkit-title">Gmail</div>
            <a href="https://mail.google.com/" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>
          
          <!-- QQ Mail -->
          <div class="toolkit-card" data-title="qq mail" data-categories="communication">
            <div class="toolkit-icon qqmail-icon">
              <i class="fas fa-envelope"></i>
            </div>
            <div class="toolkit-title">QQ Mail</div>
            <a href="https://mail.qq.com/" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>
          
          <!-- NetEase Mail -->
          <div class="toolkit-card" data-title="netease mail" data-categories="communication">
            <div class="toolkit-icon neteasemail-icon">
              <i class="fas fa-envelope"></i>
            </div>
            <div class="toolkit-title">NetEase Mail</div>
            <a href="https://email.163.com/" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>
          
          <!-- Quora -->
          <div class="toolkit-card" data-title="quora" data-categories="communication">
            <div class="toolkit-icon quora-icon">
              <i class="fab fa-quora"></i>
            </div>
            <div class="toolkit-title">Quora</div>
            <a href="https://www.quora.com/" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>
          
          <!-- Twitter/X -->
          <div class="toolkit-card" data-title="twitter" data-categories="communication">
            <div class="toolkit-icon twitter-icon">
              <i class="fab fa-twitter"></i>
            </div>
            <div class="toolkit-title">X (Twitter)</div>
            <a href="https://x.com/" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>
        </div>
      </div>
      
      <!-- Media & Video category -->
      <div class="category-section" data-category="media">
        <h3 class="category-title" data-i18n="category_media">Media & Video</h3>
        <div class="toolkit-grid">
          <!-- YouTube -->
          <div class="toolkit-card" data-title="youtube" data-categories="media">
            <div class="toolkit-icon youtube-icon">
              <i class="fab fa-youtube"></i>
            </div>
            <div class="toolkit-title">YouTube</div>
            <a href="https://www.youtube.com/" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>
          
          <!-- TikTok -->
          <div class="toolkit-card" data-title="tiktok" data-categories="media">
            <div class="toolkit-icon tiktok-icon">
              <i class="fab fa-tiktok"></i>
            </div>
            <div class="toolkit-title">TikTok</div>
            <a href="https://www.douyin.com/" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>
          
          <!-- REDnote -->
          <div class="toolkit-card" data-title="rednote" data-categories="media">
            <div class="toolkit-icon rednote-icon">
              <i class="fas fa-book"></i>
            </div>
            <div class="toolkit-title">REDnote</div>
            <a href="https://www.xiaohongshu.com/" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>
          
          <!-- Bilibili -->
          <div class="toolkit-card" data-title="bilibili" data-categories="media">
            <div class="toolkit-icon bilibili-icon">
              <i class="fas fa-play-circle"></i>
            </div>
            <div class="toolkit-title">Bilibili</div>
            <a href="https://www.bilibili.com/" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>
          
          <!-- iQIYI -->
          <div class="toolkit-card" data-title="iqiyi" data-categories="media">
            <div class="toolkit-icon iqiyi-icon">
              <i class="fas fa-film"></i>
            </div>
            <div class="toolkit-title">iQIYI</div>
            <a href="https://www.iqiyi.com/" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>
          
          <!-- Tencent Video/WeTV -->
          <div class="toolkit-card" data-title="tencent video" data-categories="media">
            <div class="toolkit-icon tencent-icon">
              <i class="fas fa-tv"></i>
            </div>
            <div class="toolkit-title">Tencent Video</div>
            <div style="display: flex; gap: 5px; justify-content: center; align-items: center;">
              <a href="https://v.qq.com/" class="toolkit-link" target="_blank" data-i18n="link_visit1">Visit 1</a>
              <span class="social-divider">/</span>
              <a href="https://wetv.vip/" class="toolkit-link" target="_blank" data-i18n="link_visit2">Visit 2</a>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Music category -->
      <div class="category-section" data-category="music">
        <h3 class="category-title" data-i18n="category_music">Music</h3>
        <div class="toolkit-grid">
          <!-- QQ Music -->
          <div class="toolkit-card" data-title="qq music" data-categories="music">
            <div class="toolkit-icon qqmusic-icon">
              <i class="fas fa-music"></i>
            </div>
            <div class="toolkit-title">QQ Music</div>
            <a href="https://y.qq.com/" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>
          
          <!-- NetEase Cloud Music -->
          <div class="toolkit-card" data-title="netease cloud music" data-categories="music">
            <div class="toolkit-icon neteasemusic-icon">
              <i class="fas fa-music"></i>
            </div>
            <div class="toolkit-title">NetEase Cloud Music</div>
            <a href="https://music.163.com/" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>
          
          <!-- KuGou Music -->
          <div class="toolkit-card" data-title="kugou music" data-categories="music">
            <div class="toolkit-icon kugou-icon">
              <i class="fas fa-music"></i>
            </div>
            <div class="toolkit-title">KuGou Music</div>
            <a href="https://www.kugou.com/" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>
          
          <!-- Spotify -->
          <div class="toolkit-card" data-title="spotify" data-categories="music">
            <div class="toolkit-icon spotify-icon">
              <i class="fab fa-spotify"></i>
            </div>
            <div class="toolkit-title">Spotify</div>
            <a href="https://open.spotify.com/" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>
        </div>
      </div>
      
      <!-- Knowledge category -->
      <div class="category-section" data-category="knowledge">
        <h3 class="category-title" data-i18n="category_knowledge">Knowledge</h3>
        <div class="toolkit-grid">
          <!-- Wikipedia -->
          <div class="toolkit-card" data-title="wikipedia" data-categories="knowledge">
            <div class="toolkit-icon wikipedia-icon">
              <i class="fab fa-wikipedia-w"></i>
            </div>
            <div class="toolkit-title">Wikipedia</div>
            <a href="https://www.wikipedia.org/" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>
          
          <!-- Google Scholar -->
          <div class="toolkit-card" data-title="google scholar" data-categories="knowledge">
            <div class="toolkit-icon scholar-icon">
              <i class="fas fa-graduation-cap"></i>
            </div>
            <div class="toolkit-title">Google Scholar</div>
            <a href="https://scholar.google.com/" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>
          
          <!-- Z-Library -->
          <div class="toolkit-card" data-title="z-library" data-categories="knowledge">
            <div class="toolkit-icon zlib-icon">
              <i class="fas fa-book"></i>
            </div>
            <div class="toolkit-title">Z-Library</div>
            <a href="https://zh.z-library.sk/" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>
          
          <!-- CNKI -->
          <div class="toolkit-card" data-title="cnki" data-categories="knowledge">
            <div class="toolkit-icon cnki-icon">
              <i class="fas fa-search"></i>
            </div>
            <div class="toolkit-title">CNKI</div>
            <a href="https://www.cnki.net/" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>
          
          <!-- ScienceDirect -->
          <div class="toolkit-card" data-title="sciencedirect" data-categories="knowledge">
            <div class="toolkit-icon sciencedirect-icon">
              <i class="fas fa-book-open"></i>
            </div>
            <div class="toolkit-title">ScienceDirect</div>
            <a href="https://www.sciencedirect.com/" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>
          
          <!-- Web of Science -->
          <div class="toolkit-card" data-title="web of science" data-categories="knowledge">
            <div class="toolkit-icon webofscience-icon">
              <i class="fas fa-globe"></i>
            </div>
            <div class="toolkit-title">Web of Science</div>
            <a href="https://www.webofscience.com/" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>

          <!-- MathOverflow -->
          <div class="toolkit-card" data-title="mathoverflow" data-categories="knowledge">
            <div class="toolkit-icon mathoverflow-icon">
              <i class="fas fa-square-root-alt"></i>
            </div>
            <div class="toolkit-title">MathOverflow</div>
            <a href="https://mathoverflow.net/" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>

          <!-- OEIS -->
          <div class="toolkit-card" data-title="oeis" data-categories="knowledge">
            <div class="toolkit-icon oeis-icon">
              <i class="fas fa-list-ol"></i>
            </div>
            <div class="toolkit-title">OEIS</div>
            <a href="https://oeis.org/" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>
        </div>
      </div>

      <!-- Productivity category -->
      <div class="category-section" data-category="productivity">
        <h3 class="category-title" data-i18n="category_productivity">Productivity</h3>
        <div class="toolkit-grid">
          <!-- Notion -->
          <div class="toolkit-card" data-title="notion" data-categories="productivity">
            <div class="toolkit-icon notion-icon">
              <i class="fas fa-clipboard-list"></i>
            </div>
            <div class="toolkit-title">Notion</div>
            <a href="https://www.notion.so/" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>
    
          <!-- Obsidian -->
          <div class="toolkit-card" data-title="obsidian" data-categories="productivity">
            <div class="toolkit-icon obsidian-icon">
              <i class="fas fa-book"></i>
            </div>
            <div class="toolkit-title">Obsidian</div>
            <a href="https://obsidian.md/" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>
    
          <!-- Tencent Docs -->
          <div class="toolkit-card" data-title="tencent docs" data-categories="productivity">
            <div class="toolkit-icon tencentdocs-icon">
              <i class="fas fa-file-alt"></i>
            </div>
            <div class="toolkit-title">Tencent Docs</div>
            <a href="https://docs.qq.com/" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>

          <!-- Typora -->
          <div class="toolkit-card" data-title="typora" data-categories="productivity">
            <div class="toolkit-icon typora-icon">
              <i class="fas fa-edit"></i>
            </div>
            <div class="toolkit-title">Typora</div>
            <a href="https://typora.io/" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>

          <!-- Yuque -->
          <div class="toolkit-card" data-title="yuque" data-categories="productivity">
            <div class="toolkit-icon yuque-icon">
              <i class="fas fa-feather-alt"></i>
            </div>
            <div class="toolkit-title">Yuque</div>
            <a href="https://www.yuque.com/" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>

          <!-- Canva -->
          <div class="toolkit-card" data-title="canva" data-categories="productivity">
            <div class="toolkit-icon canva-icon">
              <i class="fas fa-palette"></i>
            </div>
            <div class="toolkit-title">Canva</div>
            <a href="https://www.canva.com/" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>

          <!-- Remove.bg -->
          <div class="toolkit-card" data-title="removebg" data-categories="productivity">
            <div class="toolkit-icon removebg-icon">
              <i class="fas fa-image"></i>
            </div>
            <div class="toolkit-title">Remove.bg</div>
            <a href="https://www.remove.bg/" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>

          <!-- TinyPNG -->
          <div class="toolkit-card" data-title="tinypng" data-categories="productivity">
            <div class="toolkit-icon tinypng-icon">
              <i class="fas fa-compress-alt"></i>
            </div>
            <div class="toolkit-title">TinyPNG</div>
            <a href="https://tinypng.com/" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>
        </div>
      </div>

      <!-- Document and Management -->
      <div class="category-section" data-category="reference">
        <h3 class="category-title" data-i18n="category_reference">Document and Management</h3>
        <div class="toolkit-grid">
          <!-- EndNote -->
          <div class="toolkit-card" data-title="endnote" data-categories="reference">
            <div class="toolkit-icon endnote-icon">
              <i class="fas fa-quote-right"></i>
            </div>
            <div class="toolkit-title">EndNote</div>
            <a href="http://www.myendnoteweb.com" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>
    
          <!-- Zotero -->
          <div class="toolkit-card" data-title="zotero" data-categories="reference">
            <div class="toolkit-icon zotero-icon">
              <i class="fas fa-book"></i>
            </div>
            <div class="toolkit-title">Zotero</div>
            <a href="https://www.zotero.org/" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>
    
          <!-- Mendeley -->
          <div class="toolkit-card" data-title="mendeley" data-categories="reference">
            <div class="toolkit-icon mendeley-icon">
              <i class="fas fa-file-alt"></i>
            </div>
            <div class="toolkit-title">Mendeley</div>
            <a href="https://www.mendeley.com/" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>
    
          <!-- Academia -->
          <div class="toolkit-card" data-title="academia" data-categories="reference">
            <div class="toolkit-icon academia-icon">
              <i class="fas fa-graduation-cap"></i>
            </div>
            <div class="toolkit-title">Academia</div>
            <a href="https://www.academia.edu/" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>
        </div>
      </div>

      <!-- USTC Services -->
      <div class="category-section" data-category="ustc">
        <h3 class="category-title" data-i18n="category_ustc">USTC Services</h3>
        <div class="toolkit-grid">
          <!-- Blackboard -->
          <div class="toolkit-card" data-title="ustc blackboard" data-categories="ustc">
            <div class="toolkit-icon ustc-blackboard-icon">
              <i class="fas fa-chalkboard"></i>
            </div>
            <div class="toolkit-title">USTC Blackboard</div>
            <a href="https://www.bb.ustc.edu.cn/" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>
    
          <!-- USTC Mail -->
          <div class="toolkit-card" data-title="ustc mail" data-categories="ustc">
            <div class="toolkit-icon ustc-mail-icon">
              <i class="fas fa-envelope"></i>
            </div>
            <div class="toolkit-title">USTC Mail</div>
            <a href="https://email.ustc.edu.cn/" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>
    
          <!-- USTC Flyer -->
          <div class="toolkit-card" data-title="ustc flyer" data-categories="ustc">
            <div class="toolkit-icon ustc-flyer-icon">
              <i class="fas fa-paper-plane"></i>
            </div>
            <div class="toolkit-title">USTC Flyer</div>
            <a href="https://ustcflyer.com/" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>
    
          <!-- USTC Website -->
          <div class="toolkit-card" data-title="ustc website" data-categories="ustc">
            <div class="toolkit-icon ustc-website-icon">
              <i class="fas fa-globe"></i>
            </div>
            <div class="toolkit-title">USTC Website</div>
            <a href="https://www.ustc.edu.cn/" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>
    
          <!-- Integrated Academic Affairs System -->
          <div class="toolkit-card" data-title="ustc jw" data-categories="ustc">
            <div class="toolkit-icon ustc-jw-icon">
              <i class="fas fa-graduation-cap"></i>
            </div>
            <div class="toolkit-title">Academic Affairs System</div>
            <a href="https://jw.ustc.edu.cn/" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>
    
          <!-- USTC Course Review Community -->
          <div class="toolkit-card" data-title="ustc icourse" data-categories="ustc">
            <div class="toolkit-icon ustc-icourse-icon">
              <i class="fas fa-comments"></i>
            </div>
            <div class="toolkit-title">Course Review Community</div>
            <a href="https://icourse.club/" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>
    
          <!-- USTC Software -->
          <div class="toolkit-card" data-title="ustc software" data-categories="ustc">
            <div class="toolkit-icon ustc-software-icon">
              <i class="fas fa-download"></i>
            </div>
            <div class="toolkit-title">USTC Software</div>
            <a href="https://software.ustc.edu.cn/" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>
    
          <!-- Hanhai Teaching Network -->
          <div class="toolkit-card" data-title="ustc hanhai" data-categories="ustc">
            <div class="toolkit-icon ustc-hanhai-icon">
              <i class="fas fa-video"></i>
            </div>
            <div class="toolkit-title">Hanhai Teaching Network</div>
            <a href="https://course.ustc.edu.cn/" class="toolkit-link" target="_blank" data-i18n="link_visit">Visit</a>
          </div>
        </div>
      </div>
      
      <!-- No results message -->
      <div class="no-results" style="display: none;" data-i18n="no_results">
        No matching tools found. Try a different search term.
      </div>
    </div>
    
    <a href="#" class="back-btn" id="toolkit-back-btn">
      <i class="fas fa-arrow-left"></i>
    </a>
  </div>
`);

  // ------------------------------
  // Toolkit filtering (search + categories)
  // ------------------------------
  function initToolkitFilter() {
    const root = document.getElementById('toolkit');
    if (!root) return;

    const filterButtons = root.querySelectorAll('.filter-btn');
    const searchInput = root.querySelector('#toolkit-search-input');
    const toolkitCards = root.querySelectorAll('.toolkit-card');
    const categorySections = root.querySelectorAll('.category-section');
    const noResultsMessage = root.querySelector('.no-results');

    if (!filterButtons.length || !searchInput || !toolkitCards.length) return;

    function filterTools(category, searchTerm) {
      let totalVisible = 0;
      const term = String(searchTerm || '').trim().toLowerCase();

      toolkitCards.forEach((card) => {
        const cardCategories = String(card.dataset.categories || '').split(' ').filter(Boolean);
        const cardTitle = String(card.dataset.title || '').toLowerCase();
        const searchMatch = term === '' || cardTitle.includes(term);
        const categoryMatch = category === 'all' || cardCategories.includes(category);

        if (searchMatch && categoryMatch) {
          card.style.display = 'flex';
          totalVisible++;
        } else {
          card.style.display = 'none';
        }
      });

      categorySections.forEach((section) => {
        const sectionCategory = section.dataset.category;
        const hasVisibleCards = Array.from(section.querySelectorAll('.toolkit-card')).some(
          (card) => card.style.display !== 'none'
        );

        if ((category === 'all' || sectionCategory === category) && hasVisibleCards) {
          section.style.display = 'block';
        } else {
          section.style.display = 'none';
        }
      });

      if (noResultsMessage) {
        noResultsMessage.style.display = totalVisible === 0 ? 'block' : 'none';
      }
    }

    filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const category = button.dataset.category;
        filterButtons.forEach((btn) => btn.classList.remove('active'));
        button.classList.add('active');
        filterTools(category, searchInput.value);
      });
    });

    searchInput.addEventListener('input', () => {
      const active = root.querySelector('.filter-btn.active');
      const activeCategory = active ? active.dataset.category : 'all';
      filterTools(activeCategory, searchInput.value);
    });

    // Initial display
    filterTools('all', '');
  }

  // Expose as a page module API
  window.Toolkit = window.Toolkit || {};
  window.Toolkit.initToolkitFilter = initToolkitFilter;
})();
