/* Free To Go — icons, food illustrations (stand-ins for merchant photos), simulated map and QR.
   Native mapping: icons -> react-native-svg icon components; art -> real merchant photos from storage. */
(function () {
  const I = {};
  const p = (d, extra = '') => `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${d}</svg>`;
  I.discover = p('<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>');
  I.heart = p('<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>');
  I.heartFill = p('<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" fill="currentColor"/>');
  I.bell = p('<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 21h4"/>');
  I.bellFill = p('<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" fill="currentColor"/><path d="M10 21h4"/>');
  I.bellOff = p('<path d="M8.6 4.6A6 6 0 0 1 18 11v4M6 11v5l-1.5 2H17"/><path d="M10 21h4M3 3l18 18"/>');
  I.bag = p('<path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>');
  I.user = p('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>');
  I.plus = p('<path d="M12 5v14M5 12h14"/>');
  I.minus = p('<path d="M5 12h14"/>');
  I.list = p('<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>');
  I.map = p('<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15M15 6v15"/>');
  I.search = p('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>');
  I.sliders = p('<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>');
  I.pin = p('<path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>');
  I.clock = p('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>');
  I.left = p('<path d="m15 18-6-6 6-6"/>');
  I.right = p('<path d="m9 6 6 6-6 6"/>');
  I.down = p('<path d="m6 9 6 6 6-6"/>');
  I.x = p('<path d="M6 6l12 12M18 6 6 18"/>');
  I.check = p('<path d="m5 12 5 5 9-10"/>');
  I.camera = p('<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>');
  I.star = '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="currentColor" d="m12 2.8 2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z"/></svg>';
  I.info = p('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>');
  I.alert = p('<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/>');
  I.store = p('<path d="M4 9 5.5 4h13L20 9M4 9h16v11H4zM4 9a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0"/><path d="M10 20v-5h4v5"/>');
  I.qr = p('<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3M21 14v.01M14 21h7v-4"/>');
  I.nav = p('<path d="m3 11 18-8-8 18-2-8z"/>');
  I.shield = p('<path d="M12 3 5 6v6c0 4.5 3 7.7 7 9 4-1.3 7-4.5 7-9V6z"/><path d="m9 12 2 2 4-4"/>');
  I.repeat = p('<path d="M17 2l3 3-3 3"/><path d="M4 11V9a4 4 0 0 1 4-4h12M7 22l-3-3 3-3"/><path d="M20 13v2a4 4 0 0 1-4 4H4"/>');
  I.globe = p('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>');
  I.lock = p('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>');
  I.help = p('<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01"/>');
  I.edit = p('<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13 7 4 4"/>');
  I.hand = p('<path d="M7 11V6a1.5 1.5 0 0 1 3 0v4M10 10V4.5a1.5 1.5 0 0 1 3 0V10M13 10V5.5a1.5 1.5 0 0 1 3 0V12M16 9a1.5 1.5 0 0 1 3 0v5a7 7 0 0 1-7 7h-1a6 6 0 0 1-5-2.7L3.5 15a1.5 1.5 0 0 1 2.5-1.6L7 15"/>');
  I.moon = p('<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>');
  I.swap = p('<path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/>');
  I.send = p('<path d="M21 3 10 14M21 3l-7 18-4-7-7-4z"/>');
  I.home = p('<path d="M4 11 12 4l8 7v9h-5v-6h-6v6H4z"/>');
  I.city = p('<path d="M3 21h18M5 21V8l5-3v16M10 21V10h9v11M13 13h3M13 16h3M7 10v.01M7 13v.01M7 16v.01"/>');
  I.flag = p('<path d="M5 21V4h11l-2 4 2 4H5"/>');
  I.leaf = p('<path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14z"/><path d="M5 19 13 11"/>');
  I.wifi = p('<path d="M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 19.5h.01"/>');
  // availability crates (report buttons)
  const crate = (fill) => `<svg viewBox="0 0 40 32" width="40" height="32" aria-hidden="true"><path d="M3 12h34l-3 18H6z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M5 19h30M6.5 25h27" stroke="currentColor" stroke-width="1.6" opacity=".55"/>${fill}</svg>`;
  const ban = (x, y, r) => `<path transform="translate(${x} ${y}) rotate(${r})" d="M0 0c4 5 12 5 16 0" fill="none" stroke="#FFB020" stroke-width="4" stroke-linecap="round"/>`;
  I.crateMany = crate(ban(5, 7, -8) + ban(14, 3, 6) + ban(21, 8, -4) + ban(10, 10, 4));
  I.crateLow = crate(ban(13, 9, 8));
  I.crateNone = crate('<path d="M14 4l12 6M26 4l-12 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>');
  FTG.icon = (name, cls) => { const s = I[name] || ''; return cls ? s.replace('<svg ', `<svg class="${cls}" `) : s; };

  // ---------- App icon (concept 1: "Kassi-ovi" — bag whose handle loops into a go-arrow) ----------
  FTG.appIcon = (size = 38, variant = 'A') => {
    const v = { A: ['#C21E56', '#FFFFFF', '#FFB020'], B: ['#3B34C8', '#FFFFFF', '#C8F25A'], C: ['#B83A13', '#FFFFFF', '#F2C14E'] }[variant];
    return `<svg viewBox="0 0 64 64" width="${size}" height="${size}" aria-hidden="true"><rect width="64" height="64" rx="15" fill="${v[0]}"/><path d="M17 26h30l-2.6 24.5a3 3 0 0 1-3 2.5H22.6a3 3 0 0 1-3-2.5z" fill="${v[1]}"/><path d="M25 26v-4a7 7 0 0 1 13.4-2.8" fill="none" stroke="${v[1]}" stroke-width="4.5" stroke-linecap="round"/><path d="m35.5 14 3.6 5.6-6 2.4" fill="none" stroke="${v[1]}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="32" cy="39" r="5" fill="${v[2]}"/></svg>`;
  };

  // ---------- Seeded random ----------
  function rng(seed) { let s = 0; for (const c of String(seed)) s = (s * 31 + c.charCodeAt(0)) >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

  // ---------- Food illustrations ----------
  const wrap = (bg1, bg2, body, id) => `<svg class="art" viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Kuvitus"><defs><linearGradient id="bg${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${bg1}"/><stop offset="1" stop-color="${bg2}"/></linearGradient><radialGradient id="sh${id}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#000" stop-opacity=".22"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient></defs><rect width="400" height="250" fill="url(#bg${id})"/>${body}</svg>`;
  let uid = 0;
  const ART = {
    bread(r, id) {
      let b = `<ellipse cx="200" cy="200" rx="230" ry="70" fill="#B9784A"/><ellipse cx="200" cy="196" rx="220" ry="62" fill="#C98B5B"/>`;
      b += `<path d="M30 150 L330 60" stroke="#C9874A" stroke-width="34" stroke-linecap="round"/><path d="M30 150 L330 60" stroke="#E2A867" stroke-width="22" stroke-linecap="round"/>`;
      for (let i = 0; i < 5; i++) { const x = 70 + i * 60; b += `<path d="M${x} ${118 - i * 18} l18 -4" stroke="#F3CF9C" stroke-width="4" stroke-linecap="round"/>`; }
      [[120, 170, 78, 46], [255, 165, 84, 50], [190, 205, 70, 40]].forEach(([x, y, rx, ry], k) => {
        b += `<ellipse cx="${x}" cy="${y + 26}" rx="${rx}" ry="16" fill="url(#sh${id})"/><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${['#B4682D', '#C27A3A', '#A65A25'][k]}"/><ellipse cx="${x - 8}" cy="${y - 10}" rx="${rx * .8}" ry="${ry * .6}" fill="${['#CF8744', '#D9964E', '#BE7135'][k]}"/>`;
        for (let j = -1; j <= 1; j++) b += `<path d="M${x + j * 26 - 12} ${y - 14} q12 -10 24 2" stroke="#F0C990" stroke-width="5" fill="none" stroke-linecap="round"/>`;
      });
      for (let i = 0; i < 18; i++) b += `<circle cx="${40 + r() * 330}" cy="${215 + r() * 30}" r="${1 + r() * 2}" fill="#8A5530"/>`;
      return wrap('#F6E2C2', '#E9C99A', b, id);
    },
    pastry(r, id) {
      let b = `<rect x="20" y="60" width="360" height="200" rx="18" fill="#3E3456"/><rect x="30" y="68" width="340" height="190" rx="14" fill="#4B4066"/>`;
      const pos = [[95, 118], [200, 112], [305, 118], [95, 212], [200, 206], [305, 212]];
      pos.forEach(([x, y]) => {
        b += `<ellipse cx="${x + 4}" cy="${y + 10}" rx="48" ry="40" fill="url(#sh${id})"/><circle cx="${x}" cy="${y}" r="44" fill="#C77C3B"/><circle cx="${x - 4}" cy="${y - 4}" r="38" fill="#DA9550"/>`;
        b += `<path d="M${x} ${y} m-4 0 a4 4 0 1 1 8 0 a10 10 0 1 1 -18 0 a16 16 0 1 1 30 0 a22 22 0 1 1 -42 0" stroke="#8F4E22" stroke-width="5" fill="none" stroke-linecap="round"/>`;
        for (let i = 0; i < 9; i++) b += `<rect x="${x - 30 + r() * 56}" y="${y - 30 + r() * 56}" width="4" height="4" rx="1" fill="#FFF8EE" transform="rotate(${r() * 90} ${x} ${y})"/>`;
      });
      return wrap('#FBE3EA', '#F3CBD7', b, id);
    },
    bananas(r, id) {
      let b = `<rect y="190" width="400" height="60" fill="#8C8496"/><rect y="186" width="400" height="8" fill="#A39BAF"/>`;
      b += `<ellipse cx="200" cy="236" rx="190" ry="18" fill="url(#sh${id})"/><path d="M30 110 h340 l-14 120 h-312z" fill="#9A6234"/>`;
      for (let i = 0; i < 4; i++) b += `<rect x="${44 + i * 2}" y="${140 + i * 24}" width="${310 - i * 4}" height="14" rx="3" fill="#B97A45"/>`;
      for (let k = 0; k < 9; k++) {
        const x = 60 + (k % 5) * 66 + r() * 14, y = 88 + Math.floor(k / 5) * 26 + r() * 10, rot = -25 + r() * 50;
        b += `<g transform="translate(${x} ${y}) rotate(${rot})">`;
        for (let j = 0; j < 4; j++) b += `<path d="M${-6 + j * 5} 0 C ${-2 + j * 5} 38, ${44 + j * 3} 46, ${70 + j * 2} 22" stroke="#E0A400" stroke-width="15" fill="none" stroke-linecap="round"/><path d="M${-6 + j * 5} 0 C ${-2 + j * 5} 34, ${44 + j * 3} 42, ${70 + j * 2} 20" stroke="#FFD23F" stroke-width="10" fill="none" stroke-linecap="round"/>`;
        b += `<rect x="-14" y="-10" width="16" height="12" rx="3" fill="#6D7A2A"/><circle cx="${74}" cy="22" r="4" fill="#3B2A1A"/>`;
        for (let s = 0; s < 4; s++) b += `<circle cx="${10 + r() * 50}" cy="${12 + r() * 20}" r="${1.4 + r() * 1.6}" fill="#7A5A1E" opacity=".6"/>`;
        b += `</g>`;
      }
      b += `<path d="M30 110 h340 l-3 26 h-334z" fill="#B57643"/>`;
      return wrap('#E9E1F0', '#D8CDE4', b, id);
    },
    produce(r, id) {
      let b = `<ellipse cx="200" cy="232" rx="200" ry="34" fill="#C9B79A"/><path d="M40 120 Q200 300 360 120 z" fill="#A87B4C"/><path d="M40 120 Q200 290 360 120" fill="none" stroke="#8B6239" stroke-width="6"/>`;
      for (let i = 0; i < 5; i++) b += `<path d="M${60 + i * 64} ${130} q30 ${60 + (i % 2) * 10} 60 0" fill="none" stroke="#C49563" stroke-width="3"/>`;
      b += `<path d="M90 120 q-40 -70 30 -84 q10 40 -30 84" fill="#4E9A3C"/><path d="M120 120 q10 -90 70 -70 q-20 50 -70 70" fill="#69B34C"/>`;
      b += `<path d="M230 126 L300 34" stroke="#E8731C" stroke-width="22" stroke-linecap="round"/><path d="M300 34 l14 -22 M300 34 l22 -6 M300 34 l4 -26" stroke="#4E9A3C" stroke-width="6" stroke-linecap="round"/>`;
      b += `<path d="M260 128 L330 70" stroke="#2F6B2A" stroke-width="28" stroke-linecap="round"/><path d="M262 122 L326 68" stroke="#4E8C38" stroke-width="10" stroke-linecap="round" opacity=".7"/>`;
      [[150, 110], [200, 100], [180, 130], [235, 120], [130, 140]].forEach(([x, y]) => { b += `<circle cx="${x}" cy="${y}" r="26" fill="#D63A2A"/><circle cx="${x - 8}" cy="${y - 8}" r="8" fill="#F07A5E" opacity=".7"/><path d="M${x - 8} ${y - 24} l8 6 8 -6" stroke="#2F6B2A" stroke-width="4" fill="none" stroke-linecap="round"/>`; });
      return wrap('#EEF3E6', '#DCE6CF', b, id);
    },
    meals(r, id) {
      let b = '';
      [[30, 40], [210, 40], [30, 148], [210, 148]].forEach(([x, y], k) => {
        b += `<rect x="${x + 4}" y="${y + 8}" width="160" height="96" rx="14" fill="url(#sh${id})"/><rect x="${x}" y="${y}" width="160" height="96" rx="14" fill="#FFFFFF"/><rect x="${x + 8}" y="${y + 8}" width="144" height="80" rx="9" fill="#F4F1F7"/>`;
        b += `<ellipse cx="${x + 52}" cy="${y + 48}" rx="38" ry="30" fill="#FBF8F2"/>`;
        for (let i = 0; i < 26; i++) b += `<ellipse cx="${x + 26 + r() * 52}" cy="${y + 26 + r() * 44}" rx="3" ry="1.6" fill="#E9E1D2" transform="rotate(${r() * 180} ${x + 52} ${y + 48})"/>`;
        const c = ['#B5542C', '#C77C3B', '#8E3B2A', '#D9963A'][k];
        for (let i = 0; i < 6; i++) b += `<rect x="${x + 96 + r() * 36}" y="${y + 20 + r() * 50}" width="16" height="12" rx="4" fill="${c}"/>`;
        for (let i = 0; i < 5; i++) b += `<circle cx="${x + 100 + r() * 34}" cy="${y + 20 + r() * 56}" r="5" fill="#4E9A3C"/>`;
        b += `<circle cx="${x + 92}" cy="${y + 72}" r="5" fill="#E8731C"/>`;
      });
      return wrap('#E9E4F4', '#D9D1EA', b, id);
    },
    groceries(r, id) {
      let b = `<rect y="200" width="400" height="50" fill="#D7C3AE"/>`;
      b += `<path d="M168 30 L200 0" stroke="#D9964E" stroke-width="26" stroke-linecap="round"/><path d="M170 32 L196 6" stroke="#EDB878" stroke-width="10" stroke-linecap="round"/>`;
      b += `<rect x="236" y="20" width="56" height="110" rx="4" fill="#FFFFFF"/><path d="M236 20 l28 -18 28 18z" fill="#E9E4F4"/><rect x="236" y="60" width="56" height="30" fill="#4B6FD6"/>`;
      b += `<path d="M120 60 l20 -60 M128 60 l-4 -58" stroke="#4E9A3C" stroke-width="10" stroke-linecap="round"/>`;
      b += `<ellipse cx="200" cy="232" rx="140" ry="18" fill="url(#sh${id})"/><path d="M90 70 h220 l-14 160 h-192z" fill="#C79A6A"/><path d="M90 70 h220 l-3 22 h-214z" fill="#B48655"/>`;
      b += `<path d="M120 70 l-10 -14 h180 l-10 14" fill="#D6AE80"/>`;
      [[322, 200, '#D63A2A'], [352, 214, '#E6B422'], [60, 210, '#D63A2A']].forEach(([x, y, c]) => b += `<circle cx="${x}" cy="${y}" r="20" fill="${c}"/><path d="M${x} ${y - 20} q4 -10 10 -10" stroke="#3B2A1A" stroke-width="3" fill="none"/>`);
      b += `<rect x="150" y="120" width="100" height="44" rx="8" fill="#FFFFFF" opacity=".25"/>`;
      return wrap('#FBE9DC', '#F2D4BE', b, id);
    },
    sushi(r, id) {
      let b = `<rect x="40" y="70" width="320" height="150" rx="22" fill="#151020"/><rect x="48" y="78" width="304" height="134" rx="16" fill="#241A3A"/>`;
      for (let i = 0; i < 8; i++) {
        const x = 92 + (i % 4) * 72, y = 116 + Math.floor(i / 4) * 64;
        b += `<circle cx="${x}" cy="${y}" r="28" fill="#2B2B2B"/><circle cx="${x}" cy="${y}" r="23" fill="#FBF8F2"/>`;
        for (let k = 0; k < 10; k++) b += `<circle cx="${x - 18 + r() * 36}" cy="${y - 18 + r() * 36}" r="1.6" fill="#E9E1D2"/>`;
        b += `<circle cx="${x}" cy="${y}" r="10" fill="${i % 3 ? '#F08A4B' : '#5BA34A'}"/><circle cx="${x + 3}" cy="${y - 2}" r="4" fill="${i % 2 ? '#F7C548' : '#FFB49A'}"/>`;
      }
      b += `<path d="M300 40 L380 200" stroke="#C9A06A" stroke-width="6" stroke-linecap="round"/><path d="M316 36 L388 190" stroke="#C9A06A" stroke-width="6" stroke-linecap="round"/>`;
      return wrap('#3A2F52', '#2A2140', b, id);
    },
    cafe(r, id) {
      let b = `<ellipse cx="200" cy="150" rx="170" ry="96" fill="#FFFFFF"/><ellipse cx="200" cy="150" rx="150" ry="80" fill="#F4F1F7"/>`;
      [[140, 120, -10], [250, 112, 14]].forEach(([x, y, rot]) => {
        b += `<g transform="rotate(${rot} ${x} ${y})"><path d="M${x - 60} ${y + 10} Q${x} ${y - 70} ${x + 60} ${y + 10} Q${x} ${y + 30} ${x - 60} ${y + 10}z" fill="#D18A42"/>`;
        for (let k = -2; k <= 2; k++) b += `<path d="M${x + k * 20} ${y - 30} q6 20 0 40" stroke="#A9652C" stroke-width="4" fill="none"/>`;
        b += `</g>`;
      });
      b += `<path d="M150 170 h100 l-8 34 h-84z" fill="#E8C690"/><rect x="146" y="160" width="108" height="14" rx="4" fill="#4E9A3C"/><rect x="148" y="150" width="104" height="14" rx="5" fill="#E2B070"/><rect x="152" y="172" width="96" height="8" rx="3" fill="#F2D06B"/>`;
      return wrap('#E6E1F2', '#D3CAE6', b, id);
    },
  };
  FTG.art = (key, seed) => { const id = 'a' + (uid++); const f = ART[key] || ART.groceries; return f(rng(seed || key), id); };

  // ---------- Empty-state illustration: an empty crate with a waiting bell ----------
  FTG.emptyArt = () => `<svg class="ill" viewBox="0 0 132 112" aria-hidden="true"><ellipse cx="66" cy="102" rx="52" ry="7" fill="#DEDAE6"/><path d="M18 46h96l-8 52H26z" fill="#FFF1D6" stroke="#241A3A" stroke-width="3" stroke-linejoin="round"/><path d="M22 66h88M25 82h82" stroke="#241A3A" stroke-width="2" opacity=".25"/><circle cx="98" cy="28" r="18" fill="#C21E56"/><path d="M91 33v-6a7 7 0 0 1 14 0v6l1.5 2h-17z" fill="#fff"/><path d="M96 38.5h4" stroke="#fff" stroke-width="2" stroke-linecap="round"/><path d="M40 40c4-8 10-10 16-8" stroke="#B9B3C6" stroke-width="3" fill="none" stroke-linecap="round" stroke-dasharray="2 6"/></svg>`;

  // ---------- Simulated map ----------
  FTG.mapSvg = (pins, opts = {}) => {
    const W = 360, H = opts.h || 430;
    let s = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${FTG.t('sim_map')}"><rect width="${W}" height="${H}" fill="#ECE8F1"/>`;
    s += `<path d="M0 0 H230 C210 40 150 70 90 74 C50 76 20 92 0 110z" fill="#CBDDF0"/>`;
    s += `<path d="M150 72 C160 160 170 240 140 ${H}" stroke="#CBDDF0" stroke-width="16" fill="none"/>`;
    s += `<path d="M250 ${H - 140} h110 v140 h-130 z" fill="#D9EAD3"/><path d="M20 ${H - 90} h80 v60 h-80z" fill="#D9EAD3"/>`;
    for (let i = 0; i < 9; i++) s += `<path d="M0 ${90 + i * 46} L${W} ${70 + i * 46}" stroke="#FFFFFF" stroke-width="${i % 3 ? 5 : 9}"/>`;
    for (let i = 0; i < 7; i++) s += `<path d="M${30 + i * 56} 60 L${50 + i * 56} ${H}" stroke="#FFFFFF" stroke-width="${i % 3 ? 5 : 9}"/>`;
    s += `<path d="M0 230 C120 210 220 260 ${W} 220" stroke="#FFF6DD" stroke-width="12" fill="none"/>`;
    if (opts.radius) s += `<circle cx="${opts.cx || 180}" cy="${opts.cy || 230}" r="${opts.radius}" fill="rgba(194,30,86,.07)" stroke="#C21E56" stroke-width="1.5" stroke-dasharray="5 5"/>`;
    if (opts.me) s += `<circle cx="${opts.cx || 180}" cy="${opts.cy || 230}" r="14" fill="rgba(45,107,224,.18)"/><circle cx="${opts.cx || 180}" cy="${opts.cy || 230}" r="7" fill="#2D6BE0" stroke="#fff" stroke-width="3"/>`;
    if (opts.home) s += `<g transform="translate(${(opts.cx || 180) - 12} ${(opts.cy || 230) - 12})"><rect width="24" height="24" rx="8" fill="#241A3A"/><path d="M6 12l6-5 6 5v6h-4v-4h-4v4H6z" fill="#fff"/></g>`;
    pins.forEach(pn => {
      const x = pn.x * W, y = pn.y * H, sel = pn.selected;
      const fill = pn.mode === 'WALK_IN' ? 'url(#hatchpin)' : (pn.dim ? '#B9B3C6' : '#C21E56');
      s += `<g class="pin" data-action="mapPin" data-arg="${pn.id}" transform="translate(${x} ${y}) scale(${sel ? 1.18 : 1})"><ellipse cx="0" cy="2" rx="9" ry="3" fill="rgba(0,0,0,.18)"/><path d="M0 0 C-14 -16 -18 -24 -18 -32 a18 18 0 0 1 36 0 c0 8 -4 16 -18 32z" fill="${fill}" stroke="${sel ? '#241A3A' : '#fff'}" stroke-width="${sel ? 3 : 2.5}"/><text x="0" y="-27" text-anchor="middle" font-family="Bricolage Grotesque, sans-serif" font-weight="800" font-size="12" fill="${pn.mode === 'WALK_IN' ? '#241A3A' : '#fff'}">${pn.label}</text></g>`;
    });
    s += `<defs><pattern id="hatchpin" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="#FFB020"/><rect width="4" height="8" fill="#FFC550"/></pattern></defs></svg>`;
    return s;
  };

  // ---------- Simulated QR (deterministic, not scannable) ----------
  FTG.qrSvg = (code) => {
    const n = 25, r = rng(code), cells = [];
    const finder = (x, y) => (x >= 0 && x < 7 && y >= 0 && y < 7);
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const inF = finder(x, y) || finder(x - (n - 7), y) || finder(x, y - (n - 7));
      if (inF) continue;
      if (r() > 0.52) cells.push(`<rect x="${x}" y="${y}" width="1.02" height="1.02"/>`);
    }
    const f = (x, y) => `<rect x="${x}" y="${y}" width="7" height="7" fill="#241A3A"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="#fff"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3" fill="#241A3A"/>`;
    return `<svg viewBox="-1 -1 ${n + 2} ${n + 2}" shape-rendering="crispEdges" role="img" aria-label="${FTG.t('sim_qr')}"><rect x="-1" y="-1" width="${n + 2}" height="${n + 2}" fill="#fff"/><g fill="#241A3A">${cells.join('')}</g>${f(0, 0)}${f(n - 7, 0)}${f(0, n - 7)}<rect x="10" y="10" width="5" height="5" rx="1" fill="#C21E56"/></svg>`;
  };
})();
