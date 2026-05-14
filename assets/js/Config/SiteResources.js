(function () {
  'use strict';

  const A = './assets/';

  const SITE_FONT_STYLES = window.SiteFonts && Array.isArray(window.SiteFonts.externalStyles)
    ? window.SiteFonts.externalStyles
    : [];

  /*
    Add activity dates here after creating both language files.

    Example:
    const ACTIVITY_MOMENT_DATES = [
      '2026_05_12',
      '2026_04_20'
    ];

    Required files for each date:
    assets/js/Content/EN/life/activities_moments_2026_05_12.js
    assets/js/Content/ZH/life/activities_moments_2026_05_12.js
  */
  const ACTIVITY_MOMENT_DATES = [
    '2026_03_09',
    '2026_02_17',
    '2025_12_12',
    '2025_09_12',
    '2025_08_31',
    '2025_07_15',
    '2025_07_09',
    '2025_06_26',
    '2025_04_22',
    '2024_10_26',
    '2024_08_16',
    '2024_02_20',
    '2024_01_15'
  ];

  function activityMomentScripts(lang) {
    return ACTIVITY_MOMENT_DATES.map((dateKey) => {
      return A + 'js/Content/' + lang + '/life/activities_moments_' + dateKey + '.js';
    });
  }

  const FULL_CALENDAR = {
    styles: [
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
    ]
  };

  window.SiteResources = {
    site: {
      title: 'Joker Chen',
      favicon: {
        href: A + 'images/favicon.png',
        type: 'image/jpeg'
      }
    },

    navigation: {
      defaultPage: 'resume',
      pages: ['resume', 'schedule', 'social', 'toolkit', 'life'],

      warmup: {
        afterCover: ['resume', 'schedule', 'social', 'life'],
        afterFirstPage: ['schedule', 'social', 'life'],
        delayAfterCover: 650,
        delayAfterFirstPage: 700,
        delayBetweenPages: 850,
        hoverDelay: 80
      }
    },

    external: {
      styles: [
        ...SITE_FONT_STYLES
      ],

      libraries: {
        fullCalendar: FULL_CALENDAR
      },

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

    preload: {
      fonts: {
        lifeDisplay: [
          {
            href: A + 'fonts/Local_Display/HongLeiXingShuJianTi-2.woff2',
            family: 'HongLeiXingShu Local',
            type: 'font/woff2',
            load: '1em "HongLeiXingShu Local"'
          },
          {
            href: A + 'fonts/Local_Display/Beautiful-ES-1.woff2',
            family: 'Beautiful ES Local',
            type: 'font/woff2',
            load: '1em "Beautiful ES Local"'
          },
          {
            href: A + 'fonts/Local_Display/Cataneo%20BT.woff2',
            family: 'Cataneo BT Local',
            type: 'font/woff2',
            load: '1em "Cataneo BT Local"'
          }
        ]
      }
    },

    styles: {
      core: [
        A + 'css/fonts.css',
        A + 'css/main.css',
        A + 'css/top-nav.css',
        A + 'css/cover.css'
      ],

      optional: {
        blog: A + 'css/blog/blog.css'
      }
    },

    scripts: {
      core: [
        A + 'js/Functions/Top-nav.js',
        A + 'js/Functions/Cover.js',

        A + 'js/Functions/general/Clock.js',
        A + 'js/Functions/general/Theme.js',
        A + 'js/Functions/general/Translate.js',
        A + 'js/Functions/general/Expanders.js',
        A + 'js/Functions/general/Custom-cursors.js',
        A + 'js/Functions/general/SitePreloader.js',
        A + 'js/Functions/general/SitePages.js'
      ],

      bootstrap: [
        A + 'js/Functions/Bootstrap.js'
      ],

      optional: {
        blog: A + 'js/Functions/blog/Blog.js'
      }
    },

    pages: {
      resume: {
        route: 'about',
        domId: 'resume',
        mountId: 'mount-resume',
        styles: [],
        scripts: [
          A + 'js/Content/EN/about/resume_EN.js',
          A + 'js/Content/ZH/about/resume_ZH.js'
        ]
      },

      schedule: {
        route: 'schedule',
        domId: 'schedule',
        mountId: 'mount-schedule',
        styles: [
          ...FULL_CALENDAR.styles,
          A + 'css/schedule/schedule.css'
        ],
        scripts: [
          ...FULL_CALENDAR.scripts,
          A + 'js/Content/EN/schedule/schedule_EN.js',
          A + 'js/Content/ZH/schedule/schedule_ZH.js',
          A + 'js/Functions/schedule/Schedule.js',
          A + 'js/Functions/schedule/ScheduleRoutes.js'
        ]
      },

      social: {
        route: 'social',
        domId: 'social',
        mountId: 'mount-social',
        styles: [
          A + 'css/social/social.css'
        ],
        scripts: [
          A + 'js/Content/EN/social/social_EN.js',
          A + 'js/Content/ZH/social/social_ZH.js',
          A + 'js/Functions/social/Social.js'
        ]
      },

      toolkit: {
        route: 'toolkit',
        domId: 'toolkit',
        mountId: 'mount-toolkit',
        styles: [
          A + 'css/toolkit/toolkit.css'
        ],
        scripts: [
          A + 'js/Content/EN/toolkit/toolkit_EN.js',
          A + 'js/Content/ZH/toolkit/toolkit_ZH.js',
          A + 'js/Functions/toolkit/Toolkit.js'
        ]
      },

      life: {
        route: 'life',
        domId: 'life',
        mountId: 'mount-life',
        styles: [
          A + 'css/life/life.css',
          A + 'css/life/activities_moments.css',
          A + 'css/life/meditations.css'
        ],
        scripts: [
          A + 'js/Functions/life/Life.js',

          A + 'js/Content/EN/life/activities_moments_EN.js',
          A + 'js/Content/ZH/life/activities_moments_ZH.js',

          ...activityMomentScripts('EN'),
          ...activityMomentScripts('ZH'),

          A + 'js/Content/EN/life/meditations_EN.js',
          A + 'js/Content/ZH/life/meditations_ZH.js',

          A + 'js/Functions/life/ActivitiesMomentsIndex.js',
          A + 'js/Functions/life/ActivitiesMoments.js',
          A + 'js/Functions/life/LifeRoutes.js'
        ]
      }
    },

    images: {
      favicon: A + 'images/favicon.png',
      avatar: A + 'images/avatar.jpg',

      coverDir: A + 'images/cover/',

      coverFiles: [
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
        // 'cover_16.png',
        // 'cover_17.jpg',
        // 'cover_18.jpg',
        'cover_19.png',
        // 'cover_20.jpg',
        // 'cover_21.jpg',
        'cover_22.jpg',
        'cover_23.jpg',
        'cover_24.jpg',
        // 'cover_25.jpg',
        'cover_26.jpg',
        // 'cover_27.jpg',
        'cover_28.jpg',
        'cover_29.jpg',
        'cover_30.jpg',
        'cover_31.jpg',
        'cover_32.jpg',
        'cover_33.jpg',
        'cover_34.jpg',
        // 'cover_35.jpg',
        'cover_36.jpg'
        // 'cover_37.jpg'
      ],

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
