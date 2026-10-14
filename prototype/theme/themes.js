/* Free To Go — selectable colour themes 6–10. ONE shared UI; only these tokens change.
   Mirrors AriCad/texttranslator packages/ui/src/theme (Palette + Brand + ThemeProvider + persisted setting).
   Generated values (see scripts/check-contrast.mjs); `primary` is the exact approved variant hex.
   Token roles: primary = brand hue (fills, selected states) · primarySoft = tinted backgrounds ·
   accent/icon = icon highlights, stars, heart, bell (≥3:1 on white) · active = CTA fill, active tab (white text ≥4.5:1) ·
   link = links · selected/onSelected = selected segment/chip · badge/badgeText = pills · border = hairlines. */
(function (root) {
  const THEMES = {
  "6": {
    "name": "Violetti",
    "primary": "#7A6FF0",
    "primarySoft": "#ECEBFD",
    "accent": "#7A6FF0",
    "textPrimary": "#1B1A2E",
    "textSecondary": "#5E5C70",
    "background": "#FCFBFF",
    "surface": "#FFFFFF",
    "border": "#D5D6EC",
    "active": "#6B5FEE",
    "onActive": "#FFFFFF",
    "link": "#6B5FEE",
    "selected": "#6B5FEE",
    "onSelected": "#FFFFFF",
    "badge": "#ECEBFD",
    "badgeText": "#5E51ED",
    "icon": "#7A6FF0"
  },
  "7": {
    "name": "Korallit",
    "primary": "#E57C73",
    "primarySoft": "#FBEDEB",
    "accent": "#E26E64",
    "textPrimary": "#2E1B1A",
    "textSecondary": "#705D5C",
    "background": "#FEFCFB",
    "surface": "#FFFFFF",
    "border": "#E4D8DA",
    "active": "#D83A2C",
    "onActive": "#FFFFFF",
    "link": "#D83A2C",
    "selected": "#E57C73",
    "onSelected": "#2E1B1A",
    "badge": "#FBEDEB",
    "badgeText": "#CA3226",
    "icon": "#E26E64"
  },
  "8": {
    "name": "Salvia",
    "primary": "#6FA37B",
    "primarySoft": "#EBF2ED",
    "accent": "#679E74",
    "textPrimary": "#1A2E1E",
    "textSecondary": "#5C7061",
    "background": "#FBFDFC",
    "surface": "#FFFFFF",
    "border": "#D4DDDB",
    "active": "#517F5C",
    "onActive": "#FFFFFF",
    "link": "#517F5C",
    "selected": "#6FA37B",
    "onSelected": "#1A2E1E",
    "badge": "#EBF2ED",
    "badgeText": "#4B7555",
    "icon": "#679E74"
  },
  "9": {
    "name": "Hunaja",
    "primary": "#D8A23C",
    "primarySoft": "#FAF2E4",
    "accent": "#BB8825",
    "textPrimary": "#2E271A",
    "textSecondary": "#70695C",
    "background": "#FEFDFA",
    "surface": "#FFFFFF",
    "border": "#E2DDD2",
    "active": "#976D1E",
    "onActive": "#FFFFFF",
    "link": "#976D1E",
    "selected": "#D8A23C",
    "onSelected": "#2E271A",
    "badge": "#FAF2E4",
    "badgeText": "#8D661C",
    "icon": "#BB8825"
  },
  "10": {
    "name": "Luumu",
    "primary": "#8B6B8F",
    "primarySoft": "#EFEAEF",
    "accent": "#8B6B8F",
    "textPrimary": "#2B1A2E",
    "textSecondary": "#6E5C70",
    "background": "#FCFBFC",
    "surface": "#FFFFFF",
    "border": "#D8D6DE",
    "active": "#88688C",
    "onActive": "#FFFFFF",
    "link": "#88688C",
    "selected": "#8B6B8F",
    "onSelected": "#FFFFFF",
    "badge": "#EFEAEF",
    "badgeText": "#7B5F7F",
    "icon": "#8B6B8F"
  }
};
  const DEFAULT_THEME = '6';
  const KEY = 'ftg.theme';
  const api = { THEMES, DEFAULT_THEME, KEY,
    load() { try { const v = root.localStorage && root.localStorage.getItem(KEY); return THEMES[v] ? v : DEFAULT_THEME; } catch (e) { return DEFAULT_THEME; } },
    save(id) { try { root.localStorage && root.localStorage.setItem(KEY, id); } catch (e) {} },
    apply(id, el) {
      const t = THEMES[id] || THEMES[DEFAULT_THEME]; const s = (el || root.document.documentElement).style;
      for (const k in t) if (k !== 'name') s.setProperty('--' + k, t[k]);
      (el || root.document.documentElement).dataset.theme = THEMES[id] ? id : DEFAULT_THEME;
      return t;
    },
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else { root.FTG = root.FTG || {}; root.FTG.theme = api; }
})(typeof window !== 'undefined' ? window : globalThis);
