/* Free To Go — merchant role (same app, role switch). Areas: Publish, Manage (listings + pickups), Store. */
(function () {
  const t = FTG.t, C = FTG.C, icon = FTG.icon, esc = C.esc, fmt = C.fmt;
  const MV = FTG.MV = {}, MA = FTG.MA = {}, MI = FTG.MI = {};
  const S = () => FTG.state();
  const me = () => FTG.store(FTG.MERCHANT_STORE_ID);
  const mine = () => S().offers.filter(o => o.storeId === FTG.MERCHANT_STORE_ID);

  MV.tabbar = () => {
    const s = S(), n = mine().filter(o => !FTG.isGone(FTG.offerState(o))).length;
    const tabs = [['publish', 'plus', 'tab_publish'], ['manage', 'list', 'tab_manage'], ['store', 'store', 'tab_store']];
    return `<nav class="tabbar">${tabs.map(([id, ic, l]) => `<button class="tab ${s.mTab === id ? 'on' : ''}" data-action="go" data-arg="${id}" aria-current="${s.mTab === id ? 'page' : 'false'}">${icon(ic)}<span>${t(l)}</span>${id === 'manage' && n ? `<span class="dot">${n}</span>` : ''}</button>`).join('')}</nav>`;
  };

  MV.header = () => { const st = me(); return `<div class="topbar"><div class="loc-chip" style="cursor:default">${C.avatar(st, 'sm')}<span style="min-width:0"><span class="t" style="font-size:20px">${esc(st.name)}</span><span class="sub">${t('m_mode')}</span></span></div><button class="role-pill merchant" data-action="switchRole">${icon('swap').replace('<svg', '<svg style="width:16px;height:16px"')}${t('switch_to_collector')}</button></div>`; };

  MV.main = () => ({ publish: MV.publish, manage: MV.manage, store: MV.storeTab }[S().mTab])();

  MV.stackView = (tp) => ({ mOffer: MV.offerManage, offer: FTG.V.offerDetail, store: FTG.V.storePage }[tp.view])(tp);

  // ---------------- Publish ----------------
  MV.publish = () => {
    const s = S();
    if (s.published) return MV.published();
    if (s.draft) return MV.form();
    const R = FTG.TEMPLATES.reserved, W = FTG.TEMPLATES.walkin;
    let h = `<div class="scroll" data-skey="m-publish">${MV.header()}<div class="view-pad"><h1 class="h1 mt-3">${t('m_publish_title')}</h1>`;
    h += `<div class="section-title"><h2 class="h3">${t('m_repeat_t')}</h2></div><p class="small muted">${t('m_repeat_s')}</p><div class="cards">`;
    h += `<div class="block" style="margin:0;display:flex;gap:12px;align-items:center"><span class="badge reserve" style="height:44px;width:44px;justify-content:center;padding:0">${icon('repeat')}</span><div style="flex:1;min-width:0"><div class="bold">${R.qty} × ${t('surprise_bag').toLowerCase()} · ${R.start}–${R.end}</div><div class="small muted" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${R.categories.map(FTG.cat).join(', ')}</div></div><button class="btn primary sm" data-action="mNewDraft" data-arg="tplR">${t('m_use_template')}</button></div>`;
    h += `<div class="block" style="margin:0;display:flex;gap:12px;align-items:center"><span class="badge walkin" style="height:44px;width:44px;justify-content:center;padding:0">${icon('repeat')}</span><div style="flex:1;min-width:0"><div class="bold">${t('walkin_badge')} · ${W.start}–${W.end}</div><div class="small muted" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(W.what)}</div></div><button class="btn dark sm" data-action="mNewDraft" data-arg="tplW">${t('m_use_template')}</button></div></div>`;
    h += `<div class="section-title"><h2 class="h3">${t('m_new')}</h2></div><div class="mode-pick">`;
    h += `<button class="mode-card" data-action="mNewDraft" data-arg="RESERVED"><div class="top"></div><div class="in"><span class="t">${t('m_mode_reserved_t')}</span><span class="s">${t('m_mode_reserved_s')}</span><ul><li>${t('m_mode_reserved_l1')}</li><li>${t('m_mode_reserved_l2')}</li></ul></div></button>`;
    h += `<button class="mode-card walkin" data-action="mNewDraft" data-arg="WALK_IN"><div class="top"></div><div class="in"><span class="t">${t('m_mode_walkin_t')}</span><span class="s">${t('m_mode_walkin_s')}</span><ul><li>${t('m_mode_walkin_l1')}</li><li>${t('m_mode_walkin_l2')}</li></ul></div></button>`;
    return h + `</div><div style="height:24px"></div></div></div>`;
  };

  const validate = (d) => {
    const e = [], s = S();
    const st = C.parseT(d.start), en = C.parseT(d.end);
    if (d.mode === 'RESERVED' && !d.categories.length) e.push('m_need_groups');
    if (d.mode === 'WALK_IN' && !(d.photo && d.photo.kind === 'current')) e.push('m_need_photo');
    if (d.mode === 'WALK_IN' && !d.what.trim()) e.push('m_need_what');
    if (!(en > st && en > s.now)) e.push('m_need_time');
    return e;
  };

  MV.form = () => {
    const s = S(), d = s.draft, walk = d.mode === 'WALK_IN', errs = validate(d);
    let h = `<div class="scroll" data-skey="m-form" style="padding-top:var(--safe-top)"><div class="navbar"><button class="back" data-action="mDiscard" aria-label="${t('back')}">${icon('left')}</button><span class="title">${t(walk ? 'm_form_walkin' : 'm_form_reserved')}</span>${d.fromTemplate ? `<span class="timer" style="margin-right:8px">${icon('clock').replace('<svg', '<svg style="width:14px;height:14px"')}${FTG.lang ? 'Target' : 'Tavoite'} 20 s</span>` : ''}</div><div class="pad" style="padding-bottom:28px">`;
    h += `<div style="height:6px;border-radius:3px;background:${walk ? 'var(--hatch)' : 'var(--berry-600)'}"></div>`;
    if (d.fromTemplate) h += C.callout('berry', 'repeat', t('m_check_banner'));
    if (walk) h += C.callout('warn', 'alert', `<b>${t('walkin_label')}</b>`);

    if (!walk) h += `<div class="field"><span class="lbl">${t('m_bags')}</span><p class="hint">${t('m_bags_hint')}</p><div class="stepper"><button data-action="mQty" data-arg="-1" aria-label="-1">${icon('minus')}</button><span class="val" aria-live="polite">${d.qty}</span><button data-action="mQty" data-arg="1" aria-label="+1">${icon('plus')}</button></div></div>`;

    if (walk) {
      h += `<div class="field"><span class="lbl">${t('m_photo')} *</span><p class="hint">${t('m_photo_req')}</p>${d.photo ? `<div class="photo-slot">${FTG.art(d.photo.art, 'draft')}<span class="photo-tag">${icon('camera')}${t('photo_today', { t: fmt(d.photo.at) })}</span><button class="btn secondary sm retake" data-action="mTakePhoto">${icon('camera')}${t('m_retake')}</button></div>` : `<button class="btn dark block" style="min-height:120px;flex-direction:column;border-radius:16px" data-action="mTakePhoto">${icon('camera').replace('<svg', '<svg style="width:32px;height:32px"')}${t('m_take_photo_now')}</button>`}</div>`;
      h += `<div class="field"><label for="what">${t('m_what')} *</label><textarea id="what" class="input" placeholder="${t('m_what_ph')}" data-input="mWhat" data-fkey="mWhat" maxlength="140">${esc(d.what)}</textarea></div>`;
    }

    h += `<div class="field"><span class="lbl">${t('m_groups')}${walk ? '' : ' *'}</span><p class="hint">${walk ? t('m_groups_walkin_hint') : t('m_groups_hint')}</p><div class="checks" role="group">${FTG.CATEGORIES.map(c => `<button class="check ${d.categories.includes(c) ? 'on' : ''}" data-action="mCat" data-arg="${c}" role="checkbox" aria-checked="${d.categories.includes(c)}"><span class="box">${icon('check')}</span>${FTG.cat(c)}</button>`).join('')}</div></div>`;

    h += `<div class="field"><span class="lbl">${t('m_time')} *</span><div class="time-pair"><div><label for="ts">${t('m_start')}</label><input id="ts" class="input" type="time" value="${d.start}" data-input="mStart"></div><div><label for="te">${t('m_end')}</label><input id="te" class="input" type="time" value="${d.end}" data-input="mEnd"></div></div>${walk ? `<p class="hint mt-2">${t('m_expiry_note')}</p>` : ''}</div>`;

    if (!walk) {
      h += `<div class="field"><span class="lbl">${t('m_photo')}</span><p class="hint">${t('m_photo_opt')}</p>`;
      if (d.photo) h += `<div class="photo-slot">${FTG.art(d.photo.art, 'draft')}<span class="photo-tag ${d.photo.kind === 'example' ? 'example' : ''}">${d.photo.kind === 'example' ? icon('info') + t('photo_example') : icon('camera') + t('photo_today', { t: fmt(d.photo.at) })}</span><button class="btn secondary sm retake" data-action="mRemovePhoto">${t('m_remove')}</button></div>`;
      else h += `<div class="pair"><button class="btn secondary" data-action="mTakePhoto">${icon('camera')}${t('m_take_photo')}</button><button class="btn secondary" data-action="mExample">${t('m_use_example')}</button></div><p class="hint mt-2">${t('m_example_note')}</p>`;
      h += `</div><div class="field"><label for="desc">${t('m_desc')} <span class="muted" style="font-weight:500">· ${t('m_desc_opt')}</span></label><textarea id="desc" class="input" placeholder="${t('m_desc_ph')}" data-input="mDesc" data-fkey="mDesc" maxlength="140">${esc(d.description)}</textarea></div>`;
    }

    // Preview
    const pv = MV.draftOffer(d, true);
    h += `<div class="section-title"><h2 class="h3">${t('m_preview')}</h2></div>${C.offerCard(pv, me(), 'active', { now: s.now, fav: false, lastReport: null }).replace('data-action="openOffer"', 'data-action="noop"')}`;
    h += `</div></div><div class="cta-bar" style="padding-bottom:18px">${errs.length ? `<button class="btn block" disabled>${walk ? t('m_publish_walkin') : t('m_publish_n', { n: d.qty })}</button>${errs.map(k => C.disabledWhy(t(k))).join('')}` : `<button class="btn ${walk ? 'saffron' : 'primary'} block" data-action="mPublish">${walk ? t('m_publish_walkin') : t('m_publish_n', { n: d.qty })}</button>`}</div>`;
    return h;
  };

  MV.draftOffer = (d, preview) => {
    const s = S(), start = C.parseT(d.start), end = C.parseT(d.end);
    const base = { storeId: FTG.MERCHANT_STORE_ID, distributionMode: d.mode, categories: d.categories.slice(), start, end, publishedAt: s.now, photo: d.photo ? Object.assign({}, d.photo) : { kind: 'none' }, description: d.description };
    if (d.mode === 'RESERVED') Object.assign(base, { qtyTotal: d.qty, qtyLeft: d.qty });
    else Object.assign(base, { what: d.what || t('m_what_ph'), expiresAt: Math.min(end, Math.max(s.now, start) + 60), reports: [] });
    if (preview) base.id = 'preview';
    return FTG.makeOffer(base);
  };

  MV.published = () => {
    const s = S(), p = s.published, o = FTG.offer(p.id);
    let h = `<div class="scroll" data-skey="m-published">${MV.header()}<div class="view-pad">${C.statusHero('ok', 'check', t('m_published'), '')}<div class="center"><span class="timer">${icon('clock').replace('<svg', '<svg style="width:14px;height:14px"')}${t('m_published_in', { n: p.secs })}</span></div>`;
    h += `<div class="mt-4">${C.offerCard(o, me(), FTG.offerState(o), { now: s.now, fav: false, lastReport: null }).replace('data-action="openOffer"', 'data-action="mOpen"')}</div>${C.callout('ok', 'bell', t('m_auto_notify'))}`;
    h += `<div class="btns" style="display:grid;gap:10px;margin-top:20px"><button class="btn primary block" data-action="mGoManage" data-arg="${o.id}">${t('m_go_manage')}</button><button class="btn secondary block" data-action="mAnother">${t('m_publish_another')}</button></div>`;
    return h + `</div></div>`;
  };

  // ---------------- Manage ----------------
  MV.manage = () => {
    const s = S(), list = mine();
    const active = list.filter(o => !FTG.isGone(FTG.offerState(o))), past = list.filter(o => FTG.isGone(FTG.offerState(o)));
    let h = `<div class="scroll" data-skey="m-manage">${MV.header()}<div class="view-pad"><h1 class="h1 mt-3">${t('tab_manage')}</h1>`;
    if (!active.length) h += C.empty({ title: t('m_none_active_t'), body: t('m_none_active_s'), actions: `<button class="btn primary block" data-action="go" data-arg="publish">${icon('plus')}${t('tab_publish')}</button>` });
    else h += `<div class="section-title"><h2 class="h3">${t('m_active')}</h2></div><div class="cards">${active.map(MV.manageCard).join('')}</div>`;
    if (past.length) h += `<div class="section-title"><h2 class="h3">${t('m_past')}</h2></div><div class="cards">${past.map(MV.manageCard).join('')}</div>`;
    return h + `<div style="height:24px"></div></div></div>`;
  };

  MV.manageCard = (o) => {
    const s = S(), st = FTG.offerState(o), walk = o.distributionMode === 'WALK_IN';
    const res = s.reservations.filter(r => r.offerId === o.id && !['cancelled_user', 'cancelled_merchant'].includes(r.status));
    let body;
    if (walk) {
      const sig = FTG.walkSignal(o);
      body = `<div class="small">${FTG.isGone(st) ? '' : t('m_expires_in', { n: Math.max(0, o.expiresAt - s.now) })}</div>${sig.last ? `<div class="small muted">${t('latest_report', { r: t('r_' + sig.last.lvl), a: C.ago(sig.last.at, s.now) })}</div>` : ''}`;
    } else {
      body = `<div class="between small bold"><span>${t('m_reserved_of', { r: o.qtyTotal - o.qtyLeft, t: o.qtyTotal })}</span><span class="muted">${t('m_collected_n', { n: res.filter(r => r.status === 'collected').length })}</span></div><div class="progress mt-2"><i style="width:${((o.qtyTotal - o.qtyLeft) / o.qtyTotal) * 100}%"></i></div>`;
    }
    return `<article class="card" data-action="mOpen" data-arg="${o.id}" role="link" tabindex="0">${walk ? `<div class="walkin-strip"><span>${t('walkin_label')}</span></div>` : `<div style="height:8px;background:var(--berry-600)"></div>`}<div class="card-body"><div class="between"><div class="gap-row">${C.modeBadge(o)}${C.statusBadge(o, st)}</div><span class="small bold">${fmt(o.start)}–${fmt(o.end)}</span></div><p class="name mt-2">${esc(walk ? o.what : o.categories.map(FTG.cat).join(', '))}</p><div class="mt-2">${body}</div></div></article>`;
  };

  MV.offerManage = (tp) => {
    const s = S(), o = FTG.offer(tp.id), st = FTG.offerState(o), walk = o.distributionMode === 'WALK_IN', gone = FTG.isGone(st);
    let h = `<div class="detail"><div class="scroll" data-skey="m-offer-${o.id}" style="padding-top:var(--safe-top)"><div class="navbar"><button class="back" data-action="back" aria-label="${t('back')}">${icon('left')}</button><span class="title">${walk ? t('m_form_walkin') : t('m_form_reserved')}</span></div><div class="pad" style="padding-bottom:28px">`;
    h += `<div class="gap-row">${C.modeBadge(o)}${C.statusBadge(o, st)}<span class="badge outline">${icon('clock')}${fmt(o.start)}–${fmt(o.end)}</span></div><h2 class="h2 mt-3">${esc(walk ? o.what : o.categories.map(FTG.cat).join(', '))}</h2>`;
    if (walk) {
      const sig = FTG.walkSignal(o);
      if (!gone) {
        if (st === 'review' || st === 'possiblyGone') {
          const n = new Set(o.reports.filter(r => r.lvl === 'NONE' && !r.merchant).map(r => r.by)).size;
          h += `<div class="callout danger">${icon('alert')}<div><b>${t('m_review_prompt_t')}</b><br>${t('m_review_prompt_s', { n })}<div class="pair mt-3"><button class="btn dark sm" data-action="mAllGone" data-arg="${o.id}">${t('m_all_gone')}</button><button class="btn secondary sm" data-action="mStillFood" data-arg="${o.id}">${t('m_still_food')}</button></div></div></div>`;
        }
        h += `<div class="mt-4"><button class="big-stop" data-action="mAllGone" data-arg="${o.id}">${icon('hand')}${t('m_all_gone')}</button><p class="small muted center mt-2">${t('m_all_gone_s')}</p></div>`;
        h += `<div class="block between"><div><div class="bold">${t('m_expires_in', { n: Math.max(0, o.expiresAt - s.now) })}</div><div class="small muted">${FTG.lang ? 'Pilot proposal: 60 min max, +30 min extensions' : 'Pilottiehdotus: enintään 60 min, jatko +30 min'}</div></div><button class="btn secondary sm" data-action="mExtend" data-arg="${o.id}">${t('m_extend')}</button></div>`;
      } else h += C.callout('info', 'check', st === 'closed' ? t('closed_t') : t('expired_t'));
      h += `<div class="block"><h3>${t('m_reports')}</h3>${o.reports.length ? `<div class="report-list">${o.reports.slice().reverse().map(r => `<div class="report-item"><span class="lvl ${r.lvl}"></span><span><b>${t('r_' + r.lvl)}</b> · ${C.ago(r.at, s.now)}<br><span class="xs muted">${r.merchant ? t('merchant_confirmed') : t('unverified')}</span></span></div>`).join('')}</div>` : `<p class="small muted">${t('m_reports_none')}</p>`}</div>`;
    } else {
      const res = s.reservations.filter(r => r.offerId === o.id);
      const open = res.filter(r => r.status === 'confirmed');
      h += `<div class="block"><div class="between bold"><span>${t('m_reserved_of', { r: o.qtyTotal - o.qtyLeft, t: o.qtyTotal })}</span><span class="muted small">${t('m_free_n', { n: o.qtyLeft })}</span></div><div class="progress mt-2"><i style="width:${((o.qtyTotal - o.qtyLeft) / o.qtyTotal) * 100}%"></i></div></div>`;
      if (!gone) h += `<button class="btn primary block mt-3" data-action="mScan" data-arg="${o.id}">${icon('qr')}${t('m_scan')}</button>`;
      h += `<div class="block"><h3>${t('m_reservations')}</h3>${res.length ? res.map(r => `<div class="kv"><span class="k">${r.code}${r.userId === 'me' ? ' · Aino K.' : ''}</span><span class="v"><span class="badge ${stTone(r.status)}">${t(stKey(r.status))}</span></span></div>`).join('') : `<p class="small muted">${t('m_no_reservations')}</p>`}</div>`;
      if (!gone) {
        h += `<div class="pair mt-3"><button class="btn secondary" data-action="mEdit" data-arg="${o.id}">${icon('edit')}${t('m_edit')}</button><button class="btn secondary" data-action="mStop" data-arg="${o.id}" ${o.reservationsOpen ? '' : 'disabled'}>${t('m_stop')}</button></div>`;
        if (!o.reservationsOpen) h += C.disabledWhy(t('m_stopped'));
        else h += `<p class="xs muted mt-2">${t('m_stop_s')}</p>`;
        h += `<button class="btn danger block mt-3" data-action="mCancelAll" data-arg="${o.id}" ${open.length ? '' : 'disabled'}>${t('m_cancel_all')}</button>${open.length ? '' : C.disabledWhy(t('m_scan_none'))}`;
      }
    }
    return h + `</div></div></div>`;
  };
  const stKey = (s) => ({ confirmed: 'st_confirmed', collected: 'st_collected', cancelled_user: 'st_cancelled_user', cancelled_merchant: 'st_cancelled_merchant', not_received: 'st_not_received', expired: 'st_expired' }[s]);
  const stTone = (s) => ({ collected: 'ok', cancelled_merchant: 'danger', not_received: 'warn', confirmed: 'outline' }[s] || 'ended');

  // ---------------- Store tab ----------------
  MV.storeTab = () => {
    const st = me();
    let h = `<div class="scroll" data-skey="m-store">${MV.header()}<div class="view-pad"><div class="block" style="margin-top:12px"><div style="display:flex;gap:12px;align-items:center">${C.avatar(st, 'lg')}<div><div class="h2">${esc(st.name)}</div><span class="badge ok mt-2">${icon('shield')}${t('m_verified')}</span></div></div><div class="mt-3"><div class="kv"><span class="k">${t('address')}</span><span class="v">${esc(st.address)}</span></div><div class="kv"><span class="k">${t('m_hours')}</span><span class="v">${t('m_hours_v')}</span></div><div class="kv"><span class="k">${t('m_staff')}</span><span class="v">${t('m_staff_v')}</span></div></div></div>`;
    h += `<div class="section-title"><h2 class="h3">${t('m_store_public')}</h2></div><p class="small muted">${t('m_store_public_s')}</p>${C.ratingBlock(st)}`;
    h += `<button class="btn secondary block mt-4" data-action="mViewAs">${t('m_view_as')}</button>`;
    return h + `<div style="height:24px"></div></div></div>`;
  };

  // ---------------- Camera (simulated) ----------------
  MV.camera = () => { const c = S().camera; return `<div class="camera" role="dialog" aria-label="${t('m_camera_t')}"><div class="vf">${FTG.art(c.art, 'cam')}<div class="frame"></div><span class="lab">${t('m_camera_sim')}</span>${c.flash ? '<div class="flash"></div>' : ''}</div><div style="padding:12px 20px 0"><div class="bold">${t('m_camera_t')}</div><div class="small" style="opacity:.75">${t('m_camera_s')}</div></div><div class="cam-bar"><button class="btn sm" style="background:rgba(255,255,255,.14);color:#fff" data-action="mCamClose">${t('cancel')}</button><button class="shutter" data-action="mShutter" aria-label="${t('m_take_photo')}"></button><span style="width:76px"></span></div></div>`; };

  // ---------------- Sheets ----------------
  MV.sheets = {
    scan: (sh) => {
      const s = S(), open = s.reservations.filter(r => r.offerId === sh.id && r.status === 'confirmed');
      return C.sheet(t('m_scan_t'), `<div style="height:150px;border-radius:16px;background:#0e0a16;position:relative;display:grid;place-items:center;color:#fff"><div style="width:110px;height:110px;border:3px solid var(--saffron-500);border-radius:14px"></div><span class="badge outline" style="position:absolute;top:10px;left:10px">${t('simulated')}</span></div><p class="small muted mt-3">${t('m_scan_s')}</p>${open.length ? `<div class="list" style="border:1px solid var(--ink-100)">${open.map(r => `<button class="row-item" data-action="mScanCode" data-arg="${r.id}">${icon('qr')}<span class="grow t">${r.code}${r.userId === 'me' ? ' · Aino K.' : ''}</span><span class="badge outline">${t('st_confirmed')}</span></button>`).join('')}</div>` : C.callout('info', 'info', t('m_scan_none'))}`);
    },
    edit: (sh) => {
      const o = FTG.offer(sh.id), reserved = o.qtyTotal - o.qtyLeft;
      return C.sheet(t('m_edit_t'), `<div class="field"><span class="lbl">${t('m_bags')}</span><div class="stepper"><button data-action="mEditQty" data-arg="-1" aria-label="-1">${icon('minus')}</button><span class="val">${sh.qty}</span><button data-action="mEditQty" data-arg="1" aria-label="+1">${icon('plus')}</button></div>${sh.qty <= reserved ? C.disabledWhy(t('m_edit_min', { n: reserved })) : ''}</div><div class="field"><label for="ee">${t('m_end')}</label><input id="ee" class="input" type="time" value="${sh.end}" data-input="mEditEnd"></div><div class="btns"><button class="btn primary block" data-action="mEditSave">${t('m_save')}</button></div>`);
    },
    cancelAll: (sh) => {
      const n = S().reservations.filter(r => r.offerId === sh.id && r.status === 'confirmed').length;
      return C.sheet(t('m_cancel_t'), `<p class="muted small">${t('m_cancel_s')}</p><div class="field"><span class="lbl">${t('m_cancel_reason')}</span><div class="list" style="border:1px solid var(--ink-100)">${[['mc_out'], ['mc_closed'], ['mc_other']].map(([k]) => `<button class="row-item" data-action="mCancelReason" data-arg="${k}" role="radio" aria-checked="${sh.reason === k}"><span class="grow t">${t(k)}</span>${sh.reason === k ? `<span style="color:var(--berry-600)">${icon('check')}</span>` : ''}</button>`).join('')}</div></div><div class="btns"><button class="btn danger-solid block" data-action="mCancelDo" ${sh.reason ? '' : 'disabled'}>${t('m_cancel_do', { n })}</button>${sh.reason ? '' : C.disabledWhy(FTG.lang ? 'Choose a reason first.' : 'Valitse ensin syy.')}</div>`);
    },
    extend: (sh) => C.sheet(t('m_extend_t'), `<button class="check ${sh.ok ? 'on' : ''}" style="width:100%" data-action="mExtendOk" role="checkbox" aria-checked="${!!sh.ok}"><span class="box">${icon('check')}</span>${t('m_extend_confirm')}</button><div class="btns"><button class="btn primary block" data-action="mExtendDo" ${sh.ok ? '' : 'disabled'}>${t('m_extend')}</button>${sh.ok ? '' : C.disabledWhy(t('m_extend_confirm'))}</div>`),
  };

  // ---------------- Actions ----------------
  MA.mNewDraft = (arg) => {
    const s = S(), tpl = arg === 'tplR' ? FTG.TEMPLATES.reserved : arg === 'tplW' ? FTG.TEMPLATES.walkin : null;
    const mode = tpl ? tpl.mode : arg;
    const nowT = fmt(Math.ceil((s.now + 5) / 5) * 5);
    s.draft = {
      mode, fromTemplate: !!tpl, startedAt: Date.now(),
      qty: tpl && tpl.qty || 5, categories: tpl ? tpl.categories.slice() : [], description: tpl && tpl.description || '', what: tpl && tpl.what || '',
      start: tpl ? tpl.start : nowT, end: tpl ? tpl.end : fmt(Math.ceil((s.now + 80) / 5) * 5),
      photo: tpl && tpl.photo && mode === 'RESERVED' ? Object.assign({}, tpl.photo) : null, // walk-in photo is never reused
    };
    if (mode === 'WALK_IN') s.draft.start = fmt(Math.floor(s.now / 5) * 5); // walk-in: available right away
  };
  MA.mDiscard = () => { S().draft = null; };
  MA.mQty = (d) => { const x = S().draft; x.qty = Math.max(1, Math.min(50, x.qty + +d)); };
  MA.mCat = (c) => { const d = S().draft; d.categories = d.categories.includes(c) ? d.categories.filter(x => x !== c) : d.categories.concat(c); };
  MA.mTakePhoto = () => { const s = S(); s.camera = { art: s.draft.mode === 'WALK_IN' ? 'bananas' : 'groceries' }; };
  MA.mCamClose = () => { S().camera = null; };
  MA.mShutter = () => {
    const s = S(); s.camera.flash = true;
    setTimeout(() => { s.draft.photo = { kind: 'current', art: s.camera.art, at: s.now }; s.camera = null; FTG.render(); }, 380);
  };
  MA.mExample = () => { S().draft.photo = { kind: 'example', art: 'groceries' }; };
  MA.mRemovePhoto = () => { S().draft.photo = null; };
  MA.mPublish = () => {
    const s = S(), d = s.draft; if (validate(d).length) return;
    const o = MV.draftOffer(d);
    const secs = Math.max(1, Math.round((Date.now() - d.startedAt) / 1000));
    s.draft = null; s.published = { id: o.id, secs };
    FTG.publish(o);
    FTG.emit(d.mode === 'WALK_IN' ? 'walkinPublished' : 'published');
    FTG.log(`Pihlaja julkaisi: ${d.mode === 'WALK_IN' ? 'ilmaisjako' : d.qty + ' kassia'} (${secs} s)`, `Pihlaja published: ${d.mode === 'WALK_IN' ? 'walk-in' : d.qty + ' bags'} (${secs} s)`);
  };
  MA.mAnother = () => { S().published = null; };
  MA.mGoManage = (id) => { const s = S(); s.published = null; s.mTab = 'manage'; s.stack = [{ view: 'mOffer', id }]; };
  MA.mOpen = (id) => { S().stack.push({ view: 'mOffer', id }); };
  MA.mScan = (id) => { S().sheet = { type: 'scan', id }; };
  MA.mScanCode = (rid) => {
    const s = S(), r = s.reservations.find(x => x.id === rid); r.status = 'collected';
    const st = FTG.store(FTG.offer(r.offerId).storeId); st.rel.ok += 1;
    if (r.userId === 'me') { s.impact += 1; FTG.emit('collected'); }
    s.sheet = null; FTG.toast(t('m_scan_ok', { c: r.code }));
  };
  MA.mEdit = (id) => { const o = FTG.offer(id); S().sheet = { type: 'edit', id, qty: o.qtyTotal, end: fmt(o.end) }; };
  MA.mEditQty = (d) => { const sh = S().sheet, o = FTG.offer(sh.id), min = o.qtyTotal - o.qtyLeft; sh.qty = Math.max(Math.max(1, min), Math.min(50, sh.qty + +d)); };
  MA.mEditSave = () => { const s = S(), sh = s.sheet, o = FTG.offer(sh.id); const reserved = o.qtyTotal - o.qtyLeft; o.qtyTotal = sh.qty; o.qtyLeft = sh.qty - reserved; o.end = C.parseT(sh.end); s.sheet = null; FTG.toast(t('m_saved')); };
  MA.mStop = (id) => { FTG.offer(id).reservationsOpen = false; FTG.toast(t('m_stopped')); };
  MA.mCancelAll = (id) => { S().sheet = { type: 'cancelAll', id, reason: null }; };
  MA.mCancelReason = (k) => { S().sheet.reason = k; };
  MA.mCancelDo = () => {
    const s = S(), sh = s.sheet, o = FTG.offer(sh.id), st = FTG.store(o.storeId);
    const open = s.reservations.filter(r => r.offerId === o.id && r.status === 'confirmed');
    open.forEach(r => { r.status = 'cancelled_merchant'; r.reasonKey = sh.reason; });
    o.status = 'ended'; s.sheet = null;
    FTG.toast(t('m_cancelled', { n: open.length }));
    FTG.log(`${st.name} perui ${open.length} varausta (${t(sh.reason)}) → kerääjille peruutusilmoitus`, `${st.name} cancelled ${open.length} reservations → cancellation alerts sent`);
    if (open.some(r => r.userId === 'me')) { FTG.emit('merchantCancelled'); setTimeout(() => FTG.showPush({ kind: 'cancel', title: t('push_cancel_t'), body: t('push_cancel_s', { store: st.name, r: t(sh.reason).toLowerCase() }) }), 600); }
  };
  MA.mAllGone = (id) => { const s = S(), o = FTG.offer(id); o.status = 'closed'; o.closedAt = s.now; o.reports.push({ lvl: 'NONE', at: s.now, by: 'merchant', merchant: true }); FTG.toast(t('m_closed_toast')); FTG.emit('merchantClosed'); FTG.log(`${FTG.store(o.storeId).name}: kauppa merkitsi ”Kaikki loppu” → ilmaisjako suljettu`, `${FTG.store(o.storeId).name}: shop marked “All gone” → giveaway closed`); };
  MA.mStillFood = (id) => { const s = S(); FTG.offer(id).reports.push({ lvl: 'LOW', at: s.now, by: 'merchant', merchant: true }); FTG.toast(t('m_still_food_toast')); };
  MA.mExtend = (id) => { S().sheet = { type: 'extend', id, ok: false }; };
  MA.mExtendOk = () => { const sh = S().sheet; sh.ok = !sh.ok; };
  MA.mExtendDo = () => { const s = S(), o = FTG.offer(s.sheet.id); o.expiresAt = Math.max(o.expiresAt, s.now) + 30; o.end = Math.max(o.end, o.expiresAt); s.sheet = null; FTG.toast(t('m_extended')); };
  MA.mViewAs = () => { const s = S(); s.role = 'collector'; s.stack = [{ view: 'store', id: FTG.MERCHANT_STORE_ID }]; };

  MI.mWhat = (v) => { S().draft.what = v; return true; };
  MI.mDesc = (v) => { S().draft.description = v; return true; };
  MI.mStart = (v) => { if (v) S().draft.start = v; return true; };
  MI.mEnd = (v) => { if (v) S().draft.end = v; return true; };
  MI.mEditEnd = (v) => { if (v) S().sheet.end = v; return false; };
})();
