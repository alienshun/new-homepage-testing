(function () {
  'use strict';

  /*
    Font resources are centralized here.

    Loading strategy:
    1. External font styles are loaded first through SiteResourceLoader.
    2. Local font-face fallbacks are declared in assets/css/fonts.css.
    3. Typography tokens in fonts.css prefer external family names first,
       then local fallback family names.
  */

  const GOOGLE_FONT_STYLES = [
    {
      href: 'https://fonts.googleapis.com/css2?family=Allura&family=Great+Vibes&display=swap'
    },
    {
      href: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap'
    },
    {
      href: 'https://fonts.googleapis.com/css2?family=UnifrakturMaguntia&family=MedievalSharp&display=swap'
    }
  ];

  const ICON_FONT_STYLES = [
    {
      href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
    }
  ];

  window.SiteFonts = {
    googleFontStyles: GOOGLE_FONT_STYLES,
    iconFontStyles: ICON_FONT_STYLES,

    externalStyles: [
      ...GOOGLE_FONT_STYLES,
      ...ICON_FONT_STYLES
    ]
  };
})();
