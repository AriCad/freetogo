/* Free To Go — reusable UI components (pure functions: props -> HTML string).
   Each maps to a future React Native component; see docs/design/NATIVE_MAPPING.md. */
(function () {
  const t = FTG.t, icon = FTG.icon;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (m) => { m = ((m % 1440) + 1440) % 1440; return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };
  const parseT = (s) => { const [h, m] = String(s).split(':').map(Number); return h * 60 + (m || 0); };
  const km = (d) => FTG.lang ? d.toFixed(1) : d.toFixed(1).replace('.', ',');
  const num1 = (v) => FTG.lang ? v.toFixed(1) : v.toFixed(1).replace('.', ',');
  const C = { esc, fmt, parseT, km, num1 };

  C.ago = (at, now) => { const d = Math.max(0, now - at); if (d < 1) return t('ago_now'); if (d < 60) return t('ago_min', { n: d }); return t('ago_h', { n: Math.floor(d / 60) }); };

  // AvailabilityBadge + DistributionMode badge
  C.modeBadge = (o) => o.distributionMode === 'WALK_IN'
    ? `<span class="badge walkin">${icon('alert')}${t('walkin_badge')}</span>`
    : `<span class="badge reserve">${icon('bag')}${t('reserve_badge')}</span>`;

  C.statusBadge = (o, st) => {
    switch (st) {
      case 'soldout': case 'stopped': return `<span class="badge soldout">${t('soldout_badge')}</span>`;
      case 'ended': return `<span class="badge ended">${t('expired_badge')}</span>`;
      case 'expired': return `<span class="badge ended">${t('expired_t')}</span>`;
      case 'closed': return `<span class="badge ended">${t('closed_badge')}</span>`;
      case 'possiblyGone': return `<span class="badge danger">${t('possibly_gone_badge')}</span>`;
      case 'review': return `<span class="badge danger">${t('review_badge')}</span>`;
      default:
        if (o.distributionMode === 'RESERVED') return `<span class="badge light">${t('left_n', { n: o.qtyLeft })}</span>`;
        return '';
    }
  };

  C.photoTag = (o) => {
    if (!o.photo || o.photo.kind === 'none') return '';
    if (o.photo.kind === 'example') return `<span class="photo-tag example">${icon('info')}${t('photo_example')}</span>`;
    return `<span class="photo-tag">${icon('camera')}${t('photo_today', { t: fmt(o.photo.at) })}</span>`;
  };

  C.photo = (o, store) => {
    if (o.photo && o.photo.kind !== 'none') return FTG.art(o.photo.art, o.id);
    // No photo: calm branded placeholder with store initials, never pretending to be food.
    return `<svg class="art" viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="400" height="250" style="fill:var(--primarySoft)"/><text x="200" y="150" text-anchor="middle" font-family="Figtree, sans-serif" font-weight="700" font-size="84" style="fill:var(--icon)" opacity=".35">${esc(store.initials)}</text></svg>`;
  };

  C.avatar = (store, cls = '') => `<span class="avatar ${cls}" aria-hidden="true">${esc(store.initials)}</span>`;

  C.stars = (v) => { let s = '<span class="stars" aria-hidden="true">'; for (let i = 1; i <= 5; i++) s += `<span style="opacity:${v >= i - .25 ? 1 : .25}">${icon('star')}</span>`; return s + '</span>'; };

  C.overall = (r) => r.n ? (r.quality + r.quantity + r.variety + r.smoothness) / 4 : 0;

  // FavoriteHeart / ShopBell (distinct controls)
  C.heart = (storeId, on, cls = 'round') => `<button class="${cls} heart ${on ? 'on' : ''}" data-action="toggleFav" data-arg="${storeId}" aria-pressed="${on}" aria-label="${t('heart_label')}">${icon(on ? 'heartFill' : 'heart')}</button>`;
  C.bell = (storeId, on, cls = 'round') => `<button class="${cls} bell ${on ? 'on' : ''}" data-action="toggleBell" data-arg="${storeId}" aria-pressed="${on}" aria-label="${t('bell_label')}">${icon(on ? 'bellFill' : 'bell')}</button>`;
  C.heartCard = (storeId, on) => `<button class="toggle-card heart ${on ? 'on' : ''}" data-action="toggleFav" data-arg="${storeId}" aria-pressed="${on}">${icon(on ? 'heartFill' : 'heart')}<span>${t('heart_label')}<span class="sub">${on ? t('heart_on_s') : t('heart_off_s')}</span></span></button>`;
  C.bellCard = (storeId, on) => `<button class="toggle-card bell ${on ? 'on' : ''}" data-action="toggleBell" data-arg="${storeId}" aria-pressed="${on}">${icon(on ? 'bellFill' : 'bell')}<span>${t('bell_label')}<span class="sub">${on ? t('bell_on_s') : t('bell_off_s')}</span></span></button>`;

  C.contentLine = (o) => o.distributionMode === 'WALK_IN' && o.what ? o.what : o.categories.map(FTG.cat).join(', ');

  // OfferCard (v2 anatomy; colours from theme tokens)
  C.offerCard = (o, store, st, ctx) => {
    const dim = ['soldout', 'stopped', 'ended', 'expired', 'closed'].includes(st);
    const walk = o.distributionMode === 'WALK_IN', r = store.ratings;
    let left;
    if (dim || st === 'possiblyGone' || st === 'review') left = `<span class="oc-pill l dim">${C.statusBadge(o, st).replace(/<[^>]+>/g, '')}</span>`;
    else left = walk ? `<span class="oc-pill l walk">${t('walkin_badge')}</span>` : `<span class="oc-pill l">${t('left_n', { n: o.qtyLeft })}</span>`;
    const last = walk ? ctx.lastReport : null;
    const mode = walk
      ? `<span class="oc-mode">${icon('alert')}${last ? `${t('r_' + last.lvl)} · ${C.ago(last.at, ctx.now)}` : t('walkin_label')}</span>`
      : `<span class="oc-mode">${icon('bag')}<b>${t('reserve_badge')}</b></span>`;
    return `<article class="card ${dim ? 'dim' : ''}" data-action="openOffer" data-arg="${o.id}" role="link" tabindex="0" aria-label="${esc(store.name)}">
      <div class="oc-photo">${C.photo(o, store)}${left}${r.n ? `<span class="oc-pill r">${icon('star')}${num1(C.overall(r))}</span>` : ''}<span class="oc-tag">${C.photoTag(o)}</span><span class="oc-logo" aria-hidden="true">${esc(store.initials)}</span></div>
      <div class="oc-body">
        <div class="oc-title-row"><p class="oc-title">${esc(store.name)}</p><button class="oc-heart ${ctx.fav ? 'on' : ''}" data-action="toggleFav" data-arg="${store.id}" aria-pressed="${!!ctx.fav}" aria-label="${t('heart_label')}">${icon(ctx.fav ? 'heartFill' : 'heart')}</button></div>
        <p class="oc-sub">${esc(walk ? (o.what || C.contentLine(o)) : t('surprise_bag') + ' · ' + C.contentLine(o))}</p>
        <p class="oc-meta"><span>${t('pickup_window', { s: fmt(o.start), e: fmt(o.end) })}</span><i></i><span>${t('km', { d: km(store.km) })}</span></p>
        <div class="oc-foot">${mode}<span class="zero">${t('free')}</span></div>
      </div>
    </article>`;
  };

  C.categoryTags = (cats) => `<div class="tags">${cats.map(c => `<span class="tag">${esc(FTG.cat(c))}</span>`).join('')}</div>`;

  // RatingFactors (+ separate reliability)
  C.ratingBlock = (store) => {
    const r = store.ratings;
    let html = `<div class="block"><h3>${t('ratings_title')}</h3>`;
    if (!r.n) html += `<p class="muted small">${t('ratings_none')}</p>`;
    else {
      html += `<div class="score-head"><span class="score-big">${num1(C.overall(r))}</span><div>${C.stars(C.overall(r))}<div class="muted small">${t('ratings_based', { n: r.n })}</div></div></div><div class="mt-3">`;
      [['f_quality', r.quality], ['f_quantity', r.quantity], ['f_variety', r.variety], ['f_smoothness', r.smoothness]].forEach(([k, v]) => {
        html += `<div class="factor"><span>${t(k)}</span><span class="bar"><i style="width:${(v / 5) * 100}%"></i></span><b>${num1(v)}</b></div>`;
      });
      html += `</div>`;
    }
    const rel = store.rel;
    if (rel.ok + rel.fail > 0) {
      const pct = Math.round((rel.ok / (rel.ok + rel.fail)) * 100);
      html += `<div class="reliab">${icon('shield')}<div><b>${pct} %</b> <span class="bold">${t('reliability')}</span><div>${t('reliability_s', { ok: rel.ok, f: rel.fail })}</div></div></div>`;
    }
    return html + `</div>`;
  };

  C.starInput = (action, arg, val, label) => {
    let s = `<div class="star-input" role="radiogroup" aria-label="${esc(label)}">`;
    for (let i = 1; i <= 5; i++) s += `<button class="${val >= i ? 'on' : ''}" data-action="${action}" data-arg="${arg}:${i}" role="radio" aria-checked="${val === i}" aria-label="${i}/5">${icon('star')}</button>`;
    return s + '</div>';
  };

  C.switchRow = (action, on, title, sub, arg = '') => `<div class="switch-row"><div class="grow"><span class="t">${title}</span>${sub ? `<span class="s">${sub}</span>` : ''}</div><button class="switch ${on ? 'on' : ''}" role="switch" aria-checked="${on}" aria-label="${esc(title)}" data-action="${action}" data-arg="${arg}"></button></div>`;

  C.empty = ({ title, body, actions = '', art = true }) => `<div class="empty">${art ? FTG.emptyArt() : ''}<h2 class="h2">${title}</h2><p>${body}</p>${actions ? `<div class="actions">${actions}</div>` : ''}</div>`;

  C.actionCard = (action, arg, ic, tone, title, sub) => `<button class="action-card" data-action="${action}" data-arg="${arg || ''}"><span class="ic ${tone}">${icon(ic)}</span><span><span class="t">${title}</span><span class="s">${sub}</span></span><span class="chev">${icon('right')}</span></button>`;

  C.sheet = (title, body, opts = {}) => `<div class="overlay" data-action="${opts.dismiss === false ? '' : 'closeSheet'}" data-self="1"><div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="grab"></div><div class="sheet-head"><h2 class="h2">${title}</h2>${opts.dismiss === false ? '' : `<button class="x" data-action="closeSheet" aria-label="${t('close')}">${icon('x')}</button>`}</div>${body}</div></div>`;

  C.osDialog = (title, sub, buttons) => `<div class="dialog-wrap"><div class="os-dialog" role="alertdialog" aria-label="${esc(title)}"><div class="body"><div class="t">${title}</div><div class="s">${sub}</div><span class="sim">${t('sim_dialog')}</span></div>${buttons.map(b => `<button class="${b.bold ? 'b' : ''}" data-action="${b.action}" data-arg="${b.arg || ''}">${b.label}</button>`).join('')}</div></div>`;

  C.disabledWhy = (text) => `<div class="disabled-why">${icon('info')}<span>${text}</span></div>`;

  C.callout = (tone, ic, html) => `<div class="callout ${tone}">${icon(ic)}<div>${html}</div></div>`;

  C.statusHero = (tone, ic, title, body) => `<div class="status-hero"><div class="ring ${tone}">${icon(ic)}</div><h2 class="h1">${title}</h2>${body ? `<p>${body}</p>` : ''}</div>`;

  FTG.C = C;
})();
