(function () {
  'use strict';

  const A = './assets/';

  window.SiteResources = {
    site: {
      title: 'Joker Chen',
      favicon: {
        href: A + 'images/favicon.png',
        type: 'image/jpeg'
      }
    },

    external: {
      styles: [
        {
          href: 'https://fonts.googleapis.com/css2?family=Allura&family=Great+Vibes&display=swap'
        },
        {
          href: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap'
        },
        {
          href: 'https://fonts.googleapis.com/css2?family=UnifrakturMaguntia&family=MedievalSharp&display=swap'
        },
        {
          href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
        },
        {
          href: 'https://cdn.jsdelivr.net/npm/fullcalendar@5.11.3/main.min.css'
        }
      ],

      scripts: [
        {
          src: 'https://cdn.jsdelivr.net/npm/fullcalendar@5.11.3/main.min.js'
        },
        {
          src: 'https://cdn.jsdelivr.net/npm/fullcalendar@5.11.3/locales-all.min.js'
        }
      ],

      analytics: [
        {
          src: 'https://gc.zgo.at/count.js',
          attrs: {
            async: true,
            'data-goatcounter': 'https://stardust.goatcounter.com/count'
          }
        }
      ]
    },

    styles: {
      core: [
        A + 'css/main.css',
        A + 'css/top-nav.css',
        A + 'css/cover.css'
      ],

      pages: [
        A + 'css/social/social.css',
        A + 'css/toolkit/toolkit.css',
        A + 'css/schedule/schedule.css',
        A + 'css/life/meditations.css'
      ],

      optional: {
        blog: A + 'css/blog/blog.css'
      }
    },

    scripts: {
      modules: [
        A + 'js/Functions/Top-nav.js',
        A + 'js/Functions/Cover.js'
      ],

      content: [
        A + 'js/Content/EN/about/resume_EN.js',
        A + 'js/Content/ZH/about/resume_ZH.js',

        A + 'js/Content/EN/life/meditations_EN.js',
        A + 'js/Content/ZH/life/meditations_ZH.js',

        A + 'js/Content/EN/social/social_EN.js',
        A + 'js/Content/ZH/social/social_ZH.js',

        A + 'js/Content/EN/toolkit/toolkit_EN.js',
        A + 'js/Content/ZH/toolkit/toolkit_ZH.js',

        A + 'js/Content/EN/schedule/schedule_EN.js',
        A + 'js/Content/ZH/schedule/schedule_ZH.js'
      ],

      pageFunctions: [
        A + 'js/Functions/social/Social.js',
        A + 'js/Functions/toolkit/Toolkit.js',
        A + 'js/Functions/schedule/Schedule.js'
      ],

      general: [
        A + 'js/Functions/general/Clock.js',
        A + 'js/Functions/general/Theme.js',
        A + 'js/Functions/general/Translate.js',
        A + 'js/Functions/general/Expanders.js',
        A + 'js/Functions/general/Custom-cursors.js'
      ],

      bootstrap: [
        A + 'js/Functions/Bootstrap.js'
      ],

      optional: {
        blog: A + 'js/Functions/blog/Blog.js'
      }
    },

    images: {
      favicon: A + 'images/favicon.png',
      avatar: A + 'images/avatar.jpg',

      coverDir: A + 'images/cover/',

      blog: {
        background: A + 'images/blog/background.jpg',
        backgroundPng: A + 'images/blog/background.png',
        oldPaperTexture: A + 'images/blog/old-paper-texture.jpg',
        scrollTexture: A + 'images/blog/scroll-texture.png',
        fireAnimation: A + 'animation/blog/fire-animation.gif'
      },

      about: {
        profile: A + 'images/about/profile.jpg',
        educationBackground: A + 'images/about/Education_Background.png',
        excellentStudentScholarship: A + 'images/about/Excellent_Student_Scholarship--Silver.jpg',
        zhangZongzhiScholarship: A + 'images/about/Zhang_Zongzhi_Sci-Tech_Scholarship.jpg',
        excellentFreshmanScholarship: A + 'images/about/Excellent_Freshman_Scholarship--Silver.jpg',
        honorableMention: A + 'images/about/Honorable_Mention.jpg'
      }
    }
  };
})();
