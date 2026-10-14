/* Free To Go — collector views and shared screen shell. */
(function () {
  const t = FTG.t, C = FTG.C, icon = FTG.icon, esc = C.esc, fmt = C.fmt;
  const V = FTG.V = {};
  const S = () => FTG.state();

  // ---------------- Shell ----------------
  V.screen = () => {
    const s = S();
    const tp = s.stack[s.stack.length - 1];
    let html = `<div class="statusbar"><span>${fmt(s.now)}</span><span class="notch"></span><span style="display:flex;gap:6px;align-items:center">${icon('wifi').replace('<svg', '<svg style="width:16px;height:16px"')}<span style="display:inline-block;width:24px;height:11px;border:1.5px solid currentColor;border-radius:3px;position:relative"><i style="position:absolute;inset:1.5px;right:5px;background:currentColor;border-radius:1px"></i></span></span></div><div class="app">`;
    if (s.role === 'merchant') html += FTG.MV.main(); else html += V.main();
    html += (s.role === 'merchant' ? FTG.MV.tabbar() : V.tabbar());
    if (tp) html += (s.role === 'merchant' ? FTG.MV.stackView(tp) : V.stackView(tp));
    html += `</div>`;
    if (s.sheet) html += (V.sheets[s.sheet.type] || FTG.MV.sheets[s.sheet.type])(s.sheet);
    if (s.dialog) html += V.dialogs[s.dialog.type](s.dialog);
    if (s.camera) html += FTG.MV.camera();
    if (s.push) html += V.push(s.push);
    if (s.toast) html += `<div class="toast ${tp ? 'high' : ''}" role="status"><span class="grow">${esc(s.toast.msg)}</span>${s.toast.action ? `<button data-action="toastAction">${esc(s.toast.label)}</button>` : ''}</div>`;
    return html;
  };

  V.tabbar = () => {
    const s = S(), n = FTG.myActive() ? 1 : 0;
    const tabs = [['discover', 'discover', 'tab_discover'], ['favorites', 'heart', 'tab_favorites'], ['pickups', 'bag', 'tab_pickups'], ['profile', 'user', 'tab_profile']];
    return `<nav class="tabbar" aria-label="${t('app_name')}">${tabs.map(([id, ic, lbl]) => `<button class="tab ${s.tab === id ? 'on' : ''}" data-action="go" data-arg="${id}" aria-current="${s.tab === id ? 'page' : 'false'}">${icon(ic)}<span>${t(lbl)}</span>${id === 'pickups' && n ? `<span class="dot">${n}</span>` : ''}</button>`).join('')}</nav>`;
  };

  V.main = () => {
    const s = S();
    return { discover: V.discover, favorites: V.favorites, pickups: V.pickups, profile: V.profile }[s.tab]();
  };

  V.stackView = (tp) => ({ offer: V.offerDetail, store: V.storePage, reserved: V.reservedView, rate: V.rateView, notif: V.notifSettings, bells: V.bellsView }[tp.view])(tp);

  V.rolePill = () => `<button class="role-pill" data-action="switchRole">${icon('swap').replace('<svg', '<svg style="width:16px;height:16px"')}${t('switch_to_merchant')}</button>`;
  V.mockbar = () => `<div class="mockbar">${icon('info').replace('<svg', '<svg style="width:16px;height:16px;flex:none"')}<span>${t('mock_banner')}</span></div>`;

  // ---------------- Discover ----------------
  V.discover = () => {
    const s = S(), L = s.location, D = s.discover;
    const c = L.city && FTG.city(L.city);
    const title = L.mode === 'unset' ? t('loc_choose') : c.name;
    const sub = L.mode === 'unset' ? '' : (L.mode === 'gps' ? t('loc_current') + ' · ' : '') + t('loc_within', { km: L.km });
    const nf = FTG.activeFilterCount();
    let h = `<div class="scroll" data-skey="discover"><div class="topbar"><button class="loc-chip" data-action="openLocation">${icon('pin')}<span style="min-width:0"><span class="t">${esc(title)}</span>${sub ? `<span class="sub">${sub}</span>` : ''}</span>${icon('down')}</button>${V.rolePill()}</div>`;
    h += `<div class="searchrow"><label class="search">${icon('search')}<span class="sr-only">${t('search_ph')}</span><input type="search" placeholder="${t('search_ph')}" value="${esc(D.q)}" data-input="search" data-fkey="search"></label><button class="icon-btn" data-action="openFilters" aria-label="${t('filters')}">${icon('sliders')}${nf ? `<span class="badge-n">${nf}</span>` : ''}</button></div>`;
    h += `<div class="chips" role="group">${[['all', 'mode_all'], ['reserved', 'mode_reserved'], ['walkin', 'mode_walkin']].map(([m, k]) => `<button class="chip ${D.mode === m ? 'on' : ''}" data-action="setMode" data-arg="${m}" aria-pressed="${D.mode === m}">${m === 'reserved' ? `<span class="sw" style="background:var(--berry-600)"></span>` : m === 'walkin' ? `<span class="sw" style="background:var(--hatch)"></span>` : ''}${t(k)}</button>`).join('')}</div>`;

    if (L.mode === 'unset') {
      h += V.mockbar();
      h += C.empty({ title: t('pick_location_title'), body: t('pick_location_body'), actions: C.actionCard('useGps', '', 'nav', 'berry', t('loc_use_gps'), t('loc_use_gps_s')) + C.actionCard('openLocation', '', 'city', 'saffron', t('loc_pick_city'), FTG.CITIES.slice(0, 4).map(c => c.name).join(', ') + '…') });
      return h + `<div style="height:24px"></div></div>`;
    }
    const list = FTG.discoverOffers();
    const area = FTG.offersInArea();
    h += `<div class="pad mt-3 between"><span class="small muted bold">${t('results_n', { n: list.length })}</span><div class="seg" style="width:184px">${[['list', 'list', 'view_list'], ['map', 'map', 'view_map']].map(([v, ic, k]) => `<button class="${D.view === v ? 'on' : ''}" data-action="setView" data-arg="${v}" aria-pressed="${D.view === v}">${icon(ic).replace('<svg', '<svg style="width:18px;height:18px"')}${t(k)}</button>`).join('')}</div></div>`;
    h += V.mockbar();

    if (!area.length) { h += V.emptyArea(); return h + `<div style="height:24px"></div></div>`; }
    if (!list.length) {
      h += C.empty({ title: t('no_match_title'), body: t('no_match_body'), art: false, actions: `<button class="btn secondary block" data-action="clearFilters">${t('clear_filters')}</button>` });
      return h + '</div>';
    }
    if (D.view === 'map') { h += V.mapView(list); return h + `<div style="height:24px"></div></div>`; }

    const ctx = (o) => ({ now: s.now, fav: s.favorites.includes(o.storeId), lastReport: o.distributionMode === 'WALK_IN' ? FTG.walkSignal(o).last : null });
    const groups = [['now_title', o => o.start <= s.now && !['soldout', 'stopped'].includes(FTG.offerState(o))], ['later_title', o => o.start > s.now && !['soldout', 'stopped'].includes(FTG.offerState(o))], ['sold_out_title', o => ['soldout', 'stopped'].includes(FTG.offerState(o))]];
    h += `<div class="pad">`;
    groups.forEach(([k, f]) => {
      const g = list.filter(f); if (!g.length) return;
      h += `<div class="section-title"><h2 class="h3">${t(k)}</h2><span class="small muted">${g.length}</span></div><div class="cards">${g.map(o => C.offerCard(o, FTG.store(o.storeId), FTG.offerState(o), ctx(o))).join('')}</div>`;
    });
    return h + `</div><div style="height:24px"></div></div>`;
  };

  V.emptyArea = () => {
    const s = S(), alertsOn = s.notif.permission === 'granted' && (s.notif.radius || s.notif.cities.includes(s.location.city) || s.bells.length);
    let a = alertsOn
      ? C.actionCard('openNotif', '', 'bellFill', 'ink', t('empty_alerts_on_t'), t('empty_alerts_on_s'))
      : C.actionCard('turnOnAlerts', '', 'bell', 'ink', t('empty_alerts_t'), t('empty_alerts_s'));
    if (s.location.km < 20) a += C.actionCard('widenRadius', '', 'map', 'saffron', t('empty_radius_t'), t('empty_radius_s', { km: s.location.km }));
    let h = C.empty({ title: t('empty_title'), body: t('empty_body'), actions: a });
    const stores = s.stores.filter(x => x.city === s.location.city);
    if (stores.length) {
      h += `<div class="pad"><div class="section-title"><h2 class="h3">${t('participating')}</h2></div><p class="small muted">${t('participating_s')}</p><div class="list">${stores.map(st => V.storeRow(st)).join('')}</div></div>`;
    }
    return h;
  };

  V.storeRow = (st, subText) => {
    const s = S();
    const sub = subText || `${st.kind[FTG.lang]} · ${t('km', { d: C.km(st.km) })}`;
    return `<div class="row-item"><button class="grow" style="display:flex;gap:12px;align-items:center;border:0;background:none;padding:0;text-align:left;min-height:48px" data-action="openStore" data-arg="${st.id}">${C.avatar(st, 'sm')}<span style="min-width:0"><span class="t">${esc(st.name)}</span><span class="s">${sub}</span></span></button><span class="r">${C.heart(st.id, s.favorites.includes(st.id))}${C.bell(st.id, s.bells.includes(st.id))}</span></div>`;
  };

  V.mapView = (list) => {
    const s = S(), D = s.discover;
    const sel = list.find(o => o.id === D.selectedPin) || null;
    const pins = list.map(o => { const st = FTG.store(o.storeId), state = FTG.offerState(o); return { id: o.id, x: st.x, y: st.y, mode: o.distributionMode, label: o.distributionMode === 'WALK_IN' ? '?' : String(o.qtyLeft), dim: state !== 'active' && o.distributionMode === 'RESERVED', selected: sel && sel.id === o.id }; });
    let h = `<div class="map-wrap">${FTG.mapSvg(pins, { me: s.location.mode === 'gps', radius: 150 })}<span class="map-label badge outline">${icon('map')}${t('sim_map')}</span>`;
    if (sel) h += `<div class="map-peek">${C.offerCard(sel, FTG.store(sel.storeId), FTG.offerState(sel), { now: s.now, fav: s.favorites.includes(sel.storeId), lastReport: sel.distributionMode === 'WALK_IN' ? FTG.walkSignal(sel).last : null }).replace('class="card', 'class="card compact')}</div>`;
    h += `</div><div class="pad mt-2 small muted gap-row"><span class="badge reserve">${icon('bag')}${t('reserve_badge')}</span><span class="small">= ${FTG.lang ? 'bags left' : 'kasseja jäljellä'}</span><span class="badge walkin">?</span><span class="small">= ${t('walkin_badge').toLowerCase()}</span></div>`;
    return h;
  };

  // ---------------- Offer detail ----------------
  V.offerDetail = (tp) => {
    const s = S(), o = FTG.offer(tp.id), st = FTG.store(o.storeId), state = FTG.offerState(o);
    const walk = o.distributionMode === 'WALK_IN';
    const fav = s.favorites.includes(st.id), bell = s.bells.includes(st.id);
    let h = `<div class="detail"><div class="scroll" data-skey="offer-${o.id}"><div class="hero">${C.photo(o, st)}<div class="hero-actions"><button class="back float" data-action="back" aria-label="${t('back')}">${icon('left')}</button><div class="r">${C.heart(st.id, fav)}${C.bell(st.id, bell)}</div></div><span class="photo-tag-wrap" style="position:absolute;left:16px;bottom:36px">${C.photoTag(o)}</span></div>`;
    h += `<div class="sheet-card"><div style="display:flex;gap:12px;align-items:center">${C.avatar(st, 'lg')}<div style="min-width:0;flex:1"><h1 class="h2">${esc(st.name)}</h1><button class="btn ghost" style="padding:0;min-height:28px" data-action="openStore" data-arg="${st.id}">${st.kind[FTG.lang]} · ${t('open_store')}</button></div><div class="zero" style="font-size:26px">${t('free')}<small>${t('free_s')}</small></div></div>`;
    h += `<div class="gap-row mt-3">${C.modeBadge(o)}${C.statusBadge(o, state)}${!walk && state === 'active' ? '' : ''}</div>`;
    const reasons = s.notifReasons[o.id];
    if (reasons) h += C.callout('info', 'bell', `<span class="why-notified">${t('why_notified', { r: FTG.reasonText(reasons) })}</span>`);
    h += `</div><div class="pad" style="padding-bottom:20px">`;

    if (walk) h += V.walkinPanel(o, state);
    else h += `<div class="mode-panel reserve"><span class="ic">${icon('bag')}</span><div><div class="bold">${t('reserve_explain_t')}</div><div class="small muted">${t('reserve_explain_s')}</div>${state !== 'ended' ? `<div class="mt-2"><div class="between small bold"><span>${t('bags_left_of', { n: o.qtyLeft, t: o.qtyTotal })}</span></div><div class="progress mt-2"><i style="width:${(o.qtyLeft / o.qtyTotal) * 100}%"></i></div></div>` : ''}</div></div>`;

    // Pickup + address
    h += `<div class="block"><div class="info-row"><span class="ic">${icon('clock')}</span><div><div class="t">${t('pickup_time')}</div><div class="s">${t('today')} ${fmt(o.start)}–${fmt(o.end)}${o.start > s.now ? ' · ' + t('starts_at', { t: fmt(o.start) }) : ''}</div></div></div><div class="info-row"><span class="ic">${icon('pin')}</span><div style="flex:1;min-width:0"><div class="t">${esc(st.address)}</div><div class="s">${t('km', { d: C.km(st.km) })}</div></div><button class="btn secondary sm" data-action="directions">${icon('nav').replace('<svg', '<svg style="width:16px;height:16px"')}${t('directions')}</button></div><div class="mini-map">${FTG.mapSvg([{ id: o.id, x: .5, y: .55, mode: o.distributionMode, label: walk ? '?' : String(o.qtyLeft) }], { h: 132 })}</div></div>`;

    // Contents
    if (walk) {
      h += `<div class="block"><h3>${t('walkin_available')}</h3><p>${esc(o.what)}</p>${o.categories.length ? C.categoryTags(o.categories) : ''}</div>`;
    } else {
      h += `<div class="block"><h3>${t('possible_contents')}</h3>${C.categoryTags(o.categories)}<div class="caveat">${t('contents_caveat')}</div>${o.description ? `<h3 class="mt-4">${t('from_shop')}</h3><p class="muted">${esc(o.description)}</p>` : ''}</div>`;
    }
    if (walk) h += V.reportBlock(o, state);
    h += C.ratingBlock(st);
    h += `<div class="block"><h3>${t('good_to_know')}</h3><p class="small muted">${t('allergen_note')}</p><p class="small muted">${t('bring_bag')}</p><button class="btn ghost" style="padding:0" data-action="safety">${icon('flag')}${t('safety_link')}</button></div>`;
    h += `</div></div>`;
    h += V.ctaBar(o, state);
    return h + `</div>`;
  };

  V.walkinPanel = (o, state) => {
    const s = S();
    let h = `<div class="mode-panel walkin"><div class="hatch-head">${t('walkin_label')}</div><div class="inner">${t('walkin_explain')}<div class="mt-2 bold">${t('published_ago', { a: C.ago(o.publishedAt, s.now) })} · ${t('photo_today', { t: fmt(o.photo.at) })}</div></div></div>`;
    const sig = FTG.walkSignal(o);
    if (state === 'closed') h += C.callout('danger', 'hand', `<b>${t('closed_t')}</b><br>${t('closed_s', { a: C.ago(o.closedAt, s.now) })}`);
    else if (state === 'expired') h += C.callout('info', 'clock', `<b>${t('expired_t')}</b><br>${t('expired_s')}`);
    else if (state === 'review') h += C.callout('danger', 'alert', `<b>${t('review_t')}</b><br>${t('review_s')}`);
    else if (state === 'possiblyGone') h += C.callout('warn', 'alert', `<b>${t('possibly_gone_t')}</b><br>${t('possibly_gone_s', { a: C.ago(sig.last.at, s.now) })}`);
    return h;
  };

  V.reportBlock = (o, state) => {
    const s = S(), mine = s.myReports[o.id];
    const live = !FTG.isGone(state);
    let h = `<div class="block">`;
    if (live) {
      h += `<h3>${t('report_title')}</h3><p class="small muted">${t('report_sub')}</p><div class="report-grid">${['MANY', 'LOW', 'NONE'].map(l => `<button class="report-btn ${mine && mine.lvl === l ? 'on' : ''}" data-action="report" data-arg="${o.id}:${l}" aria-pressed="${!!(mine && mine.lvl === l)}">${icon(l === 'MANY' ? 'crateMany' : l === 'LOW' ? 'crateLow' : 'crateNone')}<span>${t('r_' + l)}</span></button>`).join('')}</div>`;
      if (mine) h += `<p class="small mt-2" style="color:var(--ink-700)">${t('report_yours', { r: t('r_' + mine.lvl), a: C.ago(mine.at, s.now) })}</p>`;
    }
    h += `<h3 class="mt-4">${t('latest_reports')}</h3>`;
    const reps = (o.reports || []).slice().reverse().slice(0, 4);
    if (!reps.length) h += `<p class="small muted">${t('no_reports')}</p>`;
    else h += `<div class="report-list">${reps.map(r => { const stale = s.now - r.at > 45; return `<div class="report-item"><span class="lvl ${r.lvl}"></span><span><b>${t('r_' + r.lvl)}</b> · ${C.ago(r.at, s.now)}<br><span class="muted xs">${r.merchant ? t('merchant_confirmed') : (r.by === 'me' ? t('you') + ' · ' : '') + t('unverified')}${stale ? ' · ' + t('stale') : ''}</span></span></div>`; }).join('')}</div>`;
    h += `</div>`;
    // Optional, separate quality rating
    const q = s.myQuality[o.id] || { val: 0, saved: false };
    h += `<div class="block"><h3>${t('quality_optional_t')}</h3><p class="small muted">${t('quality_optional_s')}</p>${C.starInput('walkStar', o.id, q.val, t('quality_optional_t'))}${q.val && !q.saved ? `<button class="btn secondary sm mt-2" data-action="saveQuality" data-arg="${o.id}">${t('save_rating')}</button>` : ''}${q.saved ? `<p class="small mt-2" style="color:var(--success-700)">${icon('check').replace('<svg', '<svg style="width:16px;height:16px;vertical-align:-3px"')} ${t('quality_saved')}</p>` : ''}</div>`;
    return h;
  };

  V.ctaBar = (o, state) => {
    const s = S(), walk = o.distributionMode === 'WALK_IN', st = FTG.store(o.storeId);
    let h = `<div class="cta-bar">`;
    if (walk) {
      if (FTG.isGone(state)) return h + `<button class="btn block" disabled>${t('cta_ended')}</button>${C.disabledWhy(t('cta_ended_why'))}</div>`;
      return h + `<button class="btn saffron block" data-action="directions">${icon('nav')}${t('directions')}</button>${C.disabledWhy(t('no_reserve_needed'))}</div>`;
    }
    const mine = FTG.myActive();
    if (mine && mine.offerId === o.id) return h + `<button class="btn dark block" data-action="showCode">${icon('qr')}${t('view_my_pickup')}</button></div>`;
    if (FTG.isGone(state)) return h + `<button class="btn block" disabled>${t('cta_ended')}</button>${C.disabledWhy(t('cta_ended_why'))}</div>`;
    if (state === 'soldout' || state === 'stopped') return h + `<button class="btn block" disabled>${t('cta_soldout')}</button>${C.disabledWhy(t('cta_soldout_why'))}${!s.bells.includes(st.id) ? `<button class="btn secondary block mt-2" data-action="toggleBell" data-arg="${st.id}">${icon('bell')}${t('turn_bell_on')}</button>` : ''}</div>`;
    if (mine) return h + `<button class="btn block" disabled>${t('cta_has_active')}</button>${C.disabledWhy(t('cta_has_active_why'))}</div>`;
    return h + `<div class="line"><span class="bold">${t('free')} · ${t('left_n', { n: o.qtyLeft })}</span><span class="muted">${t('today')} ${fmt(o.start)}–${fmt(o.end)}</span></div><button class="btn primary block" data-action="reserve" data-arg="${o.id}">${t('reserve_cta')}</button></div>`;
  };

  // ---------------- Store page ----------------
  V.storePage = (tp) => {
    const s = S(), st = FTG.store(tp.id);
    const offers = FTG.storeOffers(st.id).filter(o => !FTG.isGone(FTG.offerState(o)));
    let h = `<div class="detail"><div class="scroll" data-skey="store-${st.id}"><div class="hero" style="height:200px">${FTG.art(st.art, st.id)}<div class="hero-actions"><button class="back float" data-action="back" aria-label="${t('back')}">${icon('left')}</button></div></div>`;
    h += `<div class="sheet-card"><div style="display:flex;gap:12px;align-items:center">${C.avatar(st, 'lg')}<div><h1 class="h2">${esc(st.name)}</h1><div class="small muted">${st.kind[FTG.lang]} · ${esc(st.address)}</div></div></div><div class="pair mt-4">${C.heartCard(st.id, s.favorites.includes(st.id))}${C.bellCard(st.id, s.bells.includes(st.id))}</div></div><div class="pad" style="padding-bottom:28px">`;
    if (offers.length) h += `<div class="section-title"><h2 class="h3">${t('today')}</h2></div><div class="cards">${offers.map(o => C.offerCard(o, st, FTG.offerState(o), { now: s.now, fav: s.favorites.includes(st.id), lastReport: o.distributionMode === 'WALK_IN' ? FTG.walkSignal(o).last : null })).join('')}</div>`;
    else h += `<div class="block center"><p class="bold">${t('fav_no_offer')}</p><p class="small muted">${t('participating_s')}</p></div>`;
    h += C.ratingBlock(st);
    h += `</div></div></div>`;
    return h;
  };

  // ---------------- Reserved success ----------------
  V.reservedView = (tp) => {
    const r = S().reservations.find(x => x.id === tp.id), o = FTG.offer(r.offerId), st = FTG.store(o.storeId);
    return `<div class="detail"><div class="scroll" data-skey="reserved" style="padding-top:var(--safe-top)"><div class="pad">${C.statusHero('berry', 'check', t('reserved_title'), t('reserved_body', { store: esc(st.name), s: fmt(o.start), e: fmt(o.end) }))}<div class="block"><div class="kv"><span class="k">${t('pickup_code')}</span><span class="v">${r.code}</span></div><div class="kv"><span class="k">${t('pickup_time')}</span><span class="v">${t('today')} ${fmt(o.start)}–${fmt(o.end)}</span></div><div class="kv"><span class="k">${t('address')}</span><span class="v">${esc(st.address)}</span></div><div class="kv"><span class="k">${t('free_s')}</span><span class="v">${t('free')}</span></div></div></div></div><div class="cta-bar"><button class="btn primary block" data-action="showCode">${icon('qr')}${t('show_code')}</button><button class="btn ghost block mt-2" data-action="backToDiscover">${t('back_discover')}</button></div></div>`;
  };

  // ---------------- Pickups ----------------
  V.pickups = () => {
    const s = S(), mine = FTG.myReservations();
    const active = mine.filter(r => r.status === 'confirmed');
    const cancelled = mine.filter(r => r.status === 'cancelled_merchant');
    const past = mine.filter(r => !['confirmed'].includes(r.status));
    let h = `<div class="scroll" data-skey="pickups"><div class="view-pad"><h1 class="h1" style="margin:8px 0 4px">${t('pickups_title')}</h1>`;
    cancelled.filter(r => !r.ack).forEach(r => { const o = FTG.offer(r.offerId); h += C.callout('danger', 'alert', `<b>${t('merchant_cancelled_t')}</b><br>${esc(FTG.store(o.storeId).name)} – ${t('merchant_cancelled_s', { r: t(r.reasonKey) })}`); });
    if (!active.length && !past.length && !s.history.length) {
      h += C.empty({ title: t('no_pickups_t'), body: t('no_pickups_s'), actions: `<button class="btn primary block" data-action="go" data-arg="discover">${t('find_food')}</button>` });
      return h + '</div></div>';
    }
    active.forEach(r => { h += V.ticket(r); });
    if (!active.length) h += `<div class="block center mt-3"><p class="bold">${t('no_pickups_t')}</p><button class="btn secondary mt-2" data-action="go" data-arg="discover">${t('find_food')}</button></div>`;
    h += `<div class="section-title"><h2 class="h3">${t('history')}</h2></div><div class="list">`;
    past.slice().reverse().forEach(r => { const o = FTG.offer(r.offerId), st = FTG.store(o.storeId); h += V.historyRow(st, t('today'), r.status, r, !!r.rated); });
    s.history.forEach(hh => { const st = FTG.store(hh.storeId); h += V.historyRow(st, hh.day, hh.status, hh, hh.rated, hh.walkIn); });
    return h + `</div><div style="height:24px"></div></div></div>`;
  };

  const stKey = { confirmed: 'st_confirmed', collected: 'st_collected', cancelled_user: 'st_cancelled_user', cancelled_merchant: 'st_cancelled_merchant', not_received: 'st_not_received', expired: 'st_expired' };
  const stTone = { collected: 'ok', cancelled_merchant: 'danger', not_received: 'warn', expired: 'ended', cancelled_user: 'ended', confirmed: 'outline' };
  V.historyRow = (st, day, status, rec, rated, walk) => {
    const canRate = status === 'collected' && !rated && !walk;
    return `<div class="row-item">${C.avatar(st, 'sm')}<div class="grow"><span class="t">${esc(st.name)}</span><span class="s">${day} · ${walk ? t('walkin_badge') : t('surprise_bag')}</span></div><div class="r">${canRate ? `<button class="btn primary sm" data-action="openRate" data-arg="${rec.id}">${t('rate_cta')}</button>` : `<span class="badge ${stTone[status] || 'outline'}">${status === 'collected' && rated ? t('rated') : t(stKey[status])}</span>`}</div></div>`;
  };

  V.ticket = (r) => {
    const s = S(), o = FTG.offer(r.offerId), st = FTG.store(o.storeId);
    const open = s.now >= o.start;
    return `<div class="ticket mt-3"><div class="head"><div class="small" style="opacity:.85">${t('active_pickup')}</div><div class="h2">${esc(st.name)}</div><div class="small">${t('today')} ${fmt(o.start)}–${fmt(o.end)} · ${esc(st.address)}</div></div><div class="qr">${FTG.qrSvg(r.code)}<span class="badge outline mt-2">${t('sim_qr')}</span></div><div class="code">${r.code}</div><p class="small muted center pad mt-2">${t('pickup_code_s')}</p><div class="perf"></div><div class="foot">${C.callout(open ? 'ok' : 'info', 'clock', open ? t('pickup_open_now', { t: fmt(o.end) }) : t('pickup_opens', { t: fmt(o.start) }))}<div class="pair mt-3"><button class="btn secondary sm" data-action="directions">${t('directions')}</button><button class="btn danger sm" data-action="cancelRes" data-arg="${r.id}">${t('cancel_reservation')}</button></div>${open ? `<button class="btn ghost block mt-2" data-action="notReceived" data-arg="${r.id}">${icon('alert')}${t('not_received')}</button>` : `<p class="xs muted center mt-2">${t('not_received')}: ${t('pickup_opens', { t: fmt(o.start) }).toLowerCase()}</p>`}<div class="center mt-2"><button class="demo-act" data-action="simScan" data-arg="${r.id}"><b>${t('demo_tag')}</b>${t('demo_scan')}</button></div></div></div>`;
  };

  // ---------------- Rating ----------------
  V.rateView = (tp) => {
    const s = S();
    const rec = s.reservations.find(x => x.id === tp.id) || s.history.find(x => x.id === tp.id);
    const st = FTG.store(rec.storeId || FTG.offer(rec.offerId).storeId);
    const missing = Object.values(tp.vals).some(v => !v);
    let h = `<div class="detail"><div class="scroll" data-skey="rate" style="padding-top:var(--safe-top)"><div class="navbar"><button class="back" data-action="back" aria-label="${t('back')}">${icon('left')}</button><span class="title">${t('rate_title')}</span></div><div class="pad"><div style="display:flex;gap:12px;align-items:center">${C.avatar(st, 'lg')}<div><div class="h2">${esc(st.name)}</div><div class="small muted">${t('surprise_bag')} · ${t('st_collected')}</div></div></div><p class="small muted mt-3">${t('rate_s')}</p><div class="block">`;
    [['quality', 'rate_q_quality'], ['quantity', 'rate_q_quantity'], ['variety', 'rate_q_variety'], ['smoothness', 'rate_q_smoothness']].forEach(([k, l]) => { h += `<div class="rate-row"><div class="bold">${t(l)}</div>${C.starInput('rateStar', k, tp.vals[k], t(l))}</div>`; });
    h += `</div>${C.callout('info', 'shield', `${t('reliability')}: ${t('reliability_s', { ok: st.rel.ok, f: st.rel.fail })}`)}</div></div><div class="cta-bar"><button class="btn primary block" data-action="submitRating" ${missing ? 'aria-disabled="true"' : ''}>${t('submit_rating')}</button>${missing ? C.disabledWhy(t('rate_missing')) : ''}</div></div>`;
    return h;
  };

  // ---------------- Favorites ----------------
  V.favorites = () => {
    const s = S();
    const favs = s.favorites.map(FTG.store), bellsOnly = s.bells.filter(b => !s.favorites.includes(b)).map(FTG.store);
    const nSources = (s.notif.fav ? 1 : 0) + (s.bells.length ? 1 : 0) + (s.notif.radius ? 1 : 0) + s.notif.cities.length;
    let h = `<div class="scroll" data-skey="favorites"><div class="view-pad"><h1 class="h1" style="margin:8px 0 12px">${t('fav_title')}</h1>`;
    h += C.actionCard('openNotif', '', s.notif.permission === 'denied' ? 'bellOff' : 'bellFill', s.notif.permission === 'denied' ? 'saffron' : 'ink', t('alerts_card_t'), s.notif.permission === 'denied' ? t('perm_denied') : (nSources && s.notif.permission === 'granted' ? t('alerts_summary', { n: nSources }) : t('alerts_summary_off')));
    if (!favs.length) {
      h += C.empty({ title: t('fav_empty_t'), body: t('fav_empty_s'), actions: `<button class="btn primary block" data-action="go" data-arg="discover">${t('find_food')}</button>` });
    } else {
      h += `<div class="section-title"><h2 class="h3">${t('fav_title')}</h2><span class="small muted">${favs.length}</span></div><div class="list">${favs.map(st => { const has = FTG.storeOffers(st.id).some(o => !FTG.isGone(FTG.offerState(o))); return V.storeRow(st, has ? `<span style="color:var(--berry-700);font-weight:700">● ${t('fav_has_offer')}</span>` : t('fav_no_offer')); }).join('')}</div>`;
    }
    if (bellsOnly.length) h += `<div class="section-title"><h2 class="h3">${t('n_bell_t')}</h2></div><div class="list">${bellsOnly.map(st => V.storeRow(st)).join('')}</div>`;
    return h + `<div style="height:24px"></div></div></div>`;
  };

  // ---------------- Notification settings ----------------
  V.notifSettings = () => {
    const s = S(), N = s.notif;
    let perm;
    if (N.permission === 'granted') perm = C.callout('ok', 'check', `<b>${t('perm_granted')}</b>`);
    else if (N.permission === 'denied') perm = C.callout('danger', 'bellOff', `<b>${t('perm_denied')}</b><br>${t('perm_denied_s')}<div class="mt-2"><button class="btn dark sm" data-action="openDeviceSettings">${t('open_settings')}</button> <span class="xs">(${t('simulated').toLowerCase()})</span></div>`);
    else perm = C.callout('warn', 'bell', `<b>${t('perm_unknown')}</b><br>${t('perm_unknown_s')}<div class="mt-2"><button class="btn dark sm" data-action="askPush">${t('allow_notifs')}</button></div>`);
    let h = `<div class="detail"><div class="scroll" data-skey="notif" style="padding-top:var(--safe-top)"><div class="navbar"><button class="back" data-action="back" aria-label="${t('back')}">${icon('left')}</button><span class="title">${t('notif_title')}</span></div><div class="pad" style="padding-bottom:32px">${perm}`;
    h += `<div class="section-title"><h2 class="h3">${t('notif_sources')}</h2></div><div class="block" style="padding-top:4px;padding-bottom:4px">`;
    h += C.switchRow('notifToggle', N.fav, t('n_fav_t'), t('n_fav_s', { n: s.favorites.length }), 'fav');
    h += `<div class="switch-row"><div class="grow"><span class="t">${t('n_bell_t')}</span><span class="s">${t('n_bell_s', { n: s.bells.length })}</span></div><button class="btn secondary sm" data-action="openBells">${t('n_bell_manage')}</button></div>`;
    h += C.switchRow('notifToggle', N.radius, t('n_radius_t'), t('n_radius_s', { km: N.radiusKm, p: `${t('saved_place_home')} (${t('saved_place_addr')})` }), 'radius');
    if (N.radius) h += `<div class="sub-block"><div class="range-head"><span>1 km</span><span>${N.radiusKm} km</span><span>20 km</span></div><input type="range" min="1" max="20" value="${N.radiusKm}" data-input="notifRadius" aria-label="${t('loc_radius')}"><div class="mini-map">${FTG.mapSvg([], { h: 132, home: true, radius: 8 + N.radiusKm * 6 })}</div></div>`;
    h += `<div class="switch-row" style="display:block"><span class="t bold">${t('n_city_t')}</span><span class="s small muted" style="display:block">${t('n_city_s')}</span><div class="tags mt-2">${N.cities.map(c => `<button class="chip on" data-action="toggleCityAlert" data-arg="${c}" aria-label="${FTG.city(c).name} – ${t('m_remove')}">${icon('city').replace('<svg', '<svg style="width:16px;height:16px"')}${FTG.city(c).name}${icon('x').replace('<svg', '<svg style="width:14px;height:14px"')}</button>`).join('')}<button class="chip" data-action="addCity">${icon('plus').replace('<svg', '<svg style="width:16px;height:16px"')}${t('add_city')}</button></div></div>`;
    h += `</div><div class="block" style="padding-top:4px;padding-bottom:4px">${C.switchRow('notifToggle', N.quiet, t('quiet_t'), t('quiet_s', { s: N.quietS, e: N.quietE }), 'quiet')}${N.quiet ? `<div class="sub-block time-pair"><div><label for="qs">${t('m_start')}</label><input id="qs" class="input" type="time" value="${N.quietS}" data-input="quietS"></div><div><label for="qe">${t('m_end')}</label><input id="qe" class="input" type="time" value="${N.quietE}" data-input="quietE"></div></div>` : ''}</div>`;
    h += `<div class="section-title"><h2 class="h3">${t('other_notifs')}</h2></div><div class="block" style="padding-top:4px;padding-bottom:4px">${C.switchRow('notifToggle', N.remind, t('remind_t'), t('remind_s'), 'remind')}<div class="switch-row"><div class="grow"><span class="t">${t('cancel_alert_t')}</span><span class="s">${t('cancel_alert_s')}</span></div>${icon('lock')}</div></div>`;
    h += `<div class="block"><h3>${t('how_alerts')}</h3><ul class="small" style="margin:0;padding-left:18px;color:var(--ink-700)"><li>${t('how_alerts_1')}</li><li>${t('how_alerts_2')}</li><li>${t('how_alerts_3')}</li></ul></div>`;
    return h + `</div></div></div>`;
  };

  V.bellsView = () => {
    const s = S();
    const cities = new Set([s.location.city || 'tampere'].concat(s.notif.cities));
    const stores = s.stores.filter(x => cities.has(x.city));
    return `<div class="detail"><div class="scroll" data-skey="bells" style="padding-top:var(--safe-top)"><div class="navbar"><button class="back" data-action="back" aria-label="${t('back')}">${icon('left')}</button><span class="title">${t('n_bell_t')}</span></div><div class="pad"><p class="small muted">${t('participating_s')}</p><div class="list">${stores.map(st => V.storeRow(st, `${st.kind[FTG.lang]} · ${FTG.city(st.city).name}`)).join('')}</div></div></div></div>`;
  };

  // ---------------- Profile ----------------
  V.profile = () => {
    const s = S(), m = FTG.store(FTG.MERCHANT_STORE_ID);
    let h = `<div class="scroll" data-skey="profile"><div class="view-pad"><h1 class="h1" style="margin:8px 0 12px">${t('profile_title')}</h1>`;
    h += `<div class="block" style="display:flex;gap:14px;align-items:center;margin-top:0"><span class="avatar lg" style="background:var(--berry-600)">AK</span><div style="flex:1"><div class="h3">Aino K.</div><div class="small muted">aino.k@example.fi</div></div><div class="center"><div class="score-big" style="font-size:32px;color:var(--berry-600)">${s.impact}</div><div class="xs muted">${t('saved_impact')}</div></div></div>`;
    h += `<div class="section-title"><h2 class="h3">${t('roles')}</h2></div><div class="list">`;
    [['collector', t('role_collector'), t('role_collector_s'), 'bag'], ['merchant', t('role_merchant'), t('role_merchant_s', { store: m.name }), 'store']].forEach(([r, ti, sub, ic]) => {
      const on = s.role === r;
      h += `<div class="row-item"><span class="ic" style="width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:${on ? 'var(--berry-100)' : 'var(--ink-100)'};color:${on ? 'var(--berry-700)' : 'var(--ink-700)'}">${icon(ic)}</span><div class="grow"><span class="t">${ti}</span><span class="s">${esc(sub)}</span></div><div class="r">${on ? `<span class="badge ok">${t('active_role')}</span>` : `<button class="btn secondary sm" data-action="setRole" data-arg="${r}">${t('use_role')}</button>`}</div></div>`;
    });
    h += `</div><div class="list mt-4">`;
    [['openNotif', '', 'bell', t('p_alerts')], ['openLocation', '', 'pin', t('p_location')], ['openSheet', 'lang', 'globe', `${t('p_language')} · ${FTG.lang ? 'English' : 'Suomi'}`], ['openSheet', 'privacy', 'lock', t('p_privacy')], ['openSheet', 'help', 'help', t('p_help')]].forEach(([a, arg, ic, ti]) => { h += `<button class="row-item" data-action="${a}" data-arg="${arg}">${icon(ic)}<span class="grow t">${ti}</span>${icon('right')}</button>`; });
    return h + `</div><p class="xs muted center mt-6">Free To Go · Stage One HTML mockup</p></div></div>`;
  };

  // ---------------- Push banner ----------------
  V.push = (p) => `<button class="push" data-action="openPush" aria-label="${esc(p.title)}">${FTG.appIcon(38)}<span style="flex:1;min-width:0"><span class="meta"><span>FREE TO GO</span><span>${t('now_lbl')}</span></span><span class="t" style="display:block">${esc(p.title)}</span><span class="s" style="display:block">${esc(p.body)}</span><span class="sim">${t('sim_push')}</span></span></button>`;

  // ---------------- Dialogs ----------------
  V.dialogs = {
    gps: () => C.osDialog(t('gps_dialog_t'), t('gps_dialog_s'), [{ label: t('gps_allow_once'), action: 'gpsAllow' }, { label: t('gps_allow_using'), action: 'gpsAllow', bold: true }, { label: t('gps_deny'), action: 'gpsDeny' }]),
    push: () => C.osDialog(t('push_dialog_t'), t('push_dialog_s'), [{ label: t('dont_allow'), action: 'pushDeny' }, { label: t('allow'), action: 'pushAllow', bold: true }]),
  };

  // ---------------- Sheets ----------------
  V.sheets = {
    location: (sh) => {
      const s = S(), L = s.location;
      let b = '';
      if (L.gps === 'denied') b += C.callout('warn', 'nav', `<b>${t('loc_denied_title')}</b><br>${t('loc_denied_body')}`);
      else b += `<button class="action-card mt-2" data-action="useGps"><span class="ic berry">${icon('nav')}</span><span><span class="t">${t('loc_use_gps')}</span><span class="s">${t('loc_use_gps_s')}</span></span></button>`;
      b += `<div class="section-title"><h3 class="h3">${t('loc_pick_city')}</h3></div><div class="list" style="border:1px solid var(--ink-100)">${FTG.CITIES.map(c => { const on = L.mode !== 'unset' && L.city === c.id; return `<button class="row-item" data-action="pickCity" data-arg="${c.id}" aria-pressed="${on}">${icon('city')}<span class="grow t">${c.name}</span>${on ? `<span style="color:var(--berry-600)">${icon('check')}</span>` : ''}</button>`; }).join('')}</div>`;
      b += `<div class="field"><div class="range-head"><span>${t('loc_radius')}</span><span>${L.km} km</span></div><input type="range" min="1" max="20" value="${L.km}" data-input="locRadius" aria-label="${t('loc_radius')}"></div>`;
      b += `<div class="btns"><button class="btn primary block" data-action="locDone">${t('loc_done')}</button></div>`;
      return C.sheet(t('loc_sheet_title'), b);
    },
    filters: () => {
      const D = S().discover;
      let b = `<div class="field"><span class="lbl">${t('m_groups')}</span><div class="checks">${FTG.CATEGORIES.map(c => `<button class="check ${D.cats.includes(c) ? 'on' : ''}" data-action="filterCat" data-arg="${c}" aria-pressed="${D.cats.includes(c)}"><span class="box">${icon('check')}</span>${FTG.cat(c)}</button>`).join('')}</div></div>`;
      b += `<div class="field"><span class="lbl">${t('pickup_time')}</span><div class="seg">${[['any', t('mode_all')], ['now', t('when_now')], ['later', t('when_later')]].map(([w, l]) => `<button class="${D.when === w ? 'on' : ''}" data-action="filterWhen" data-arg="${w}">${l}</button>`).join('')}</div></div>`;
      b += `<div class="field"><span class="lbl">${FTG.lang ? 'Sort' : 'Järjestys'}</span><div class="tags">${[['distance', FTG.lang ? 'Distance' : 'Etäisyys'], ['time', t('pickup_time')], ['rating', t('ratings_title')]].map(([k, l]) => `<button class="chip ${D.sort === k ? 'on' : ''}" data-action="filterSort" data-arg="${k}">${l}</button>`).join('')}</div></div>`;
      b += `<div class="field">${C.switchRow('filterSold', D.showSold, t('sold_out_title'), FTG.lang ? 'Show fully reserved offers' : 'Näytä loppuunvaratut tarjoukset')}</div>`;
      b += `<div class="btns"><button class="btn primary block" data-action="closeSheet">${t('results_n', { n: FTG.discoverOffers().length })}</button><button class="btn ghost block" data-action="clearFilters">${t('clear_filters')}</button></div>`;
      return C.sheet(t('filters'), b);
    },
    confirmReserve: (sh) => {
      const o = FTG.offer(sh.id), st = FTG.store(o.storeId);
      return C.sheet(t('confirm_title'), `<div class="block flat" style="background:var(--bg)"><div class="kv"><span class="k">${esc(st.name)}</span><span class="v">${t('surprise_bag')}</span></div><div class="kv"><span class="k">${t('pickup_time')}</span><span class="v">${t('today')} ${fmt(o.start)}–${fmt(o.end)}</span></div><div class="kv"><span class="k">${t('free_s')}</span><span class="v">${t('free')}</span></div></div><p class="small muted mt-3">${t('confirm_body')}</p><div class="btns"><button class="btn primary block" data-action="confirmReserve" data-arg="${o.id}">${t('confirm_btn')}</button><button class="btn ghost block" data-action="closeSheet">${t('cancel')}</button></div>`);
    },
    checking: () => `<div class="overlay"><div class="sheet center" style="padding:32px 16px 40px"><div class="spinner"></div><h2 class="h2 mt-4">${t('checking')}</h2><p class="muted">${t('checking_s')}</p></div></div>`,
    race: (sh) => { const o = FTG.offer(sh.id); return C.sheet(t('race_title'), `${C.statusHero('warn', 'alert', '', t('race_body'))}<div class="btns">${!S().bells.includes(o.storeId) ? `<button class="btn dark block" data-action="toggleBell" data-arg="${o.storeId}">${icon('bell')}${t('turn_bell_on')}</button>` : ''}<button class="btn secondary block" data-action="backToDiscover">${t('back_discover')}</button></div>`); },
    gone: () => C.sheet(t('offer_gone_title'), `${C.statusHero('warn', 'clock', '', t('offer_gone_body'))}<div class="btns"><button class="btn primary block" data-action="backToDiscover">${t('back_discover')}</button></div>`),
    cancelRes: (sh) => C.sheet(t('cancel_confirm_t'), `<p class="muted">${t('cancel_confirm_s')}</p><div class="btns"><button class="btn danger-solid block" data-action="doCancelRes" data-arg="${sh.id}">${t('yes_cancel')}</button><button class="btn secondary block" data-action="closeSheet">${t('keep_reservation')}</button></div>`),
    notReceived: (sh) => {
      let b = `<p class="muted">${t('not_received_s')}</p><div class="list" style="border:1px solid var(--ink-100)">${[['out', 'nr_out'], ['closed', 'nr_closed'], ['other', 'nr_other']].map(([k, l]) => `<button class="row-item" data-action="nrReason" data-arg="${k}" role="radio" aria-checked="${sh.reason === k}"><span class="grow t">${t(l)}</span><span style="width:24px;height:24px;border-radius:50%;border:2px solid ${sh.reason === k ? 'var(--berry-600)' : 'var(--ink-300)'};display:grid;place-items:center">${sh.reason === k ? '<i style="width:12px;height:12px;border-radius:50%;background:var(--berry-600)"></i>' : ''}</span></button>`).join('')}</div>`;
      if (sh.reason === 'other') b += `<div class="field"><textarea class="input" placeholder="${t('nr_other_ph')}" data-input="nrText" data-fkey="nrText">${esc(sh.text)}</textarea></div>`;
      b += `<div class="btns"><button class="btn primary block" data-action="nrSend" ${sh.reason ? '' : 'disabled'}>${t('send_report')}</button>${sh.reason ? '' : C.disabledWhy(FTG.lang ? 'Choose a reason first.' : 'Valitse ensin syy.')}</div>`;
      return C.sheet(t('not_received_t'), b);
    },
    nrSent: () => C.sheet(t('nr_sent_t'), `${C.statusHero('ok', 'check', '', t('nr_sent_s'))}<div class="btns"><button class="btn primary block" data-action="closeSheet">${t('done')}</button></div>`),
    collected: (sh) => C.sheet(t('collected_t'), `${C.statusHero('ok', 'check', '', t('collected_s'))}<div class="btns"><button class="btn primary block" data-action="openRate" data-arg="${sh.id}">${icon('star')}${t('rate_now')}</button><button class="btn ghost block" data-action="closeSheet">${t('later')}</button></div>`),
    safety: (sh) => C.sheet(t('safety_t'), `<p class="muted small">${t('safety_s')}</p><div class="list" style="border:1px solid var(--ink-100)">${[['spoiled', 'sf_spoiled'], ['allergen', 'sf_allergen'], ['other', 'sf_other']].map(([k, l]) => `<button class="row-item" data-action="safetyKind" data-arg="${k}" role="radio" aria-checked="${sh.kind === k}"><span class="grow t">${t(l)}</span>${sh.kind === k ? `<span style="color:var(--berry-600)">${icon('check')}</span>` : ''}</button>`).join('')}</div>${C.callout('danger', 'alert', t('safety_urgent'))}<div class="btns"><button class="btn primary block" data-action="safetySend" ${sh.kind ? '' : 'disabled'}>${t('send_report')}</button>${sh.kind ? '' : C.disabledWhy(FTG.lang ? 'Choose what happened first.' : 'Valitse ensin, mitä tapahtui.')}</div>`),
    addCity: () => { const s = S(); return C.sheet(t('add_city'), `<div class="list" style="border:1px solid var(--ink-100)">${FTG.CITIES.map(c => { const on = s.notif.cities.includes(c.id); return `<button class="row-item" data-action="toggleCityAlert" data-arg="${c.id}" aria-pressed="${on}">${icon('city')}<span class="grow t">${c.name}</span><span class="check ${on ? 'on' : ''}" style="border:0;padding:0;min-height:0;background:none"><span class="box">${icon('check')}</span></span></button>`; }).join('')}</div><p class="small muted mt-3">${t('n_city_s')}</p><div class="btns"><button class="btn primary block" data-action="closeSheet">${t('done')}</button></div>`); },
    lang: () => C.sheet(t('p_language'), `<div class="list" style="border:1px solid var(--ink-100)">${[['0', 'Suomi'], ['1', 'English']].map(([i, l]) => `<button class="row-item" data-action="setLang" data-arg="${i}"><span class="grow t">${l}</span>${+i === FTG.lang ? `<span style="color:var(--berry-600)">${icon('check')}</span>` : ''}</button>`).join('')}</div><p class="small muted mt-3">${FTG.lang ? 'More languages can be added without changing screens.' : 'Lisää kieliä voidaan lisätä muuttamatta näkymiä.'}</p>`),
    privacy: () => C.sheet(t('p_privacy'), `<p class="muted">${t('privacy_body')}</p><div class="btns"><button class="btn primary block" data-action="closeSheet">${t('close')}</button></div>`),
    help: () => C.sheet(t('p_help'), `<p class="muted">${t('help_body')}</p><div class="btns"><button class="btn primary block" data-action="closeSheet">${t('close')}</button></div>`),
  };
})();
