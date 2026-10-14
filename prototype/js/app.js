/* Free To Go — app core: state, domain rules, actions, render loop.
   Native mapping: state -> Zustand store slices; domain rules -> typed mock service layer (src/services/*). */
(function () {
  const t = FTG.t, C = FTG.C;
  let S;
  FTG.state = () => S;

  // ---------------- Selectors ----------------
  const store = FTG.store = (id) => S.stores.find(s => s.id === id);
  const offer = FTG.offer = (id) => S.offers.find(o => o.id === id);
  const city = FTG.city = (id) => FTG.CITIES.find(c => c.id === id);

  // Only launch-enabled offers are ever rendered: food vertical, free, public channel.
  FTG.isLaunchVisible = (o) => FTG.FLAGS.enabled_verticals.includes(o.vertical) && o.pricingMode === 'FREE' && o.priceMinor === 0 && o.accessChannel === 'PUBLIC' && o.campaignId == null;

  FTG.walkSignal = (o) => {
    const reps = o.reports || [];
    let lastM = -1; reps.forEach((r, i) => { if (r.merchant) lastM = i; });
    const after = reps.slice(lastM + 1);
    const last = reps[reps.length - 1] || null;
    const noneUsers = new Set(after.filter(r => r.lvl === 'NONE' && !r.merchant && S.now - r.at <= 30).map(r => r.by));
    let state = 'active';
    if (noneUsers.size >= 2) state = 'review';
    else if (last && last.lvl === 'NONE' && !last.merchant) state = 'possiblyGone';
    return { state, last };
  };

  FTG.offerState = (o) => {
    if (o.status === 'closed') return 'closed';
    if (o.status === 'ended') return 'ended';
    if (o.status === 'expired') return 'expired';
    if (o.distributionMode === 'WALK_IN' && S.now >= o.expiresAt) return 'expired';
    if (S.now >= o.end) return 'ended';
    if (o.distributionMode === 'RESERVED') {
      if (o.qtyLeft <= 0) return 'soldout';
      if (!o.reservationsOpen) return 'stopped';
      return 'active';
    }
    return FTG.walkSignal(o).state;
  };
  FTG.isGone = (st) => ['ended', 'expired', 'closed'].includes(st);

  FTG.myActive = () => S.reservations.find(r => r.userId === 'me' && r.status === 'confirmed');
  FTG.myReservations = () => S.reservations.filter(r => r.userId === 'me');

  FTG.discoverOffers = () => {
    const L = S.location, D = S.discover;
    if (L.mode === 'unset') return [];
    const q = D.q.trim().toLowerCase();
    let list = S.offers.filter(o => {
      if (!FTG.isLaunchVisible(o)) return false;
      const st = FTG.offerState(o), s = store(o.storeId);
      if (FTG.isGone(st)) return false;
      if (s.city !== L.city || s.km > L.km) return false;
      if (D.mode === 'reserved' && o.distributionMode !== 'RESERVED') return false;
      if (D.mode === 'walkin' && o.distributionMode !== 'WALK_IN') return false;
      if (D.cats.length && !o.categories.some(c => D.cats.includes(c))) return false;
      if (D.when === 'now' && !(o.start <= S.now)) return false;
      if (D.when === 'later' && !(o.start > S.now)) return false;
      if (!D.showSold && (st === 'soldout' || st === 'stopped')) return false;
      if (q) { const hay = (s.name + ' ' + s.kind.join(' ') + ' ' + o.categories.map(FTG.cat).join(' ') + ' ' + (o.what || '') + ' ' + o.description).toLowerCase(); if (!hay.includes(q)) return false; }
      return true;
    });
    const by = { distance: (a, b) => store(a.storeId).km - store(b.storeId).km, time: (a, b) => a.start - b.start, rating: (a, b) => C.overall(store(b.storeId).ratings) - C.overall(store(a.storeId).ratings) }[D.sort];
    return list.sort(by);
  };
  FTG.offersInArea = () => S.location.mode === 'unset' ? [] : S.offers.filter(o => FTG.isLaunchVisible(o) && !FTG.isGone(FTG.offerState(o)) && store(o.storeId).city === S.location.city && store(o.storeId).km <= S.location.km);
  FTG.activeFilterCount = () => { const D = S.discover; return D.cats.length + (D.when !== 'any') + (!D.showSold) + (D.sort !== 'distance'); };
  FTG.storeOffers = (id) => S.offers.filter(o => o.storeId === id && FTG.isLaunchVisible(o));

  // ---------------- Demo instrumentation ----------------
  FTG.emit = (ev) => { if (!S.demo.done.includes(ev)) S.demo.done.push(ev); };
  FTG.log = (fi, en) => { S.demo.log.unshift({ at: S.now, fi, en: en || fi }); S.demo.log = S.demo.log.slice(0, 30); };

  let toastTimer, pushTimer;
  FTG.toast = (msg, action, arg, label) => {
    S.toast = { msg, action, arg, label }; clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { S.toast = null; render(); }, action ? 5200 : 3200);
  };
  FTG.showPush = (p) => {
    S.push = p; clearTimeout(pushTimer);
    pushTimer = setTimeout(() => { S.push = null; render(); }, 8000);
    if (p.kind === 'offer') FTG.emit('pushShown');
    render();
  };

  // ---------------- Notifications: matching + dedup + quiet hours ----------------
  FTG.inQuiet = () => { if (!S.notif.quiet) return false; const s = C.parseT(S.notif.quietS), e = C.parseT(S.notif.quietE), n = S.now % 1440; return s > e ? (n >= s || n < e) : (n >= s && n < e); };

  FTG.matchAlerts = (o) => {
    const s = store(o.storeId), r = [];
    if (S.notif.fav && S.favorites.includes(s.id)) r.push({ k: 'favorite' });
    if (S.bells.includes(s.id)) r.push({ k: 'bell' });
    if (S.notif.radius && s.city === 'tampere' && s.km <= S.notif.radiusKm) r.push({ k: 'radius' });
    if (S.notif.cities.includes(s.city)) r.push({ k: 'city' });
    return r;
  };
  FTG.notifyNewOffer = (o) => {
    const s = store(o.storeId);
    const reasons = FTG.matchAlerts(o).map(x => x.k === 'city' ? Object.assign(x, { c: s.city }) : x);
    const names = reasons.map(x => x.k).join(' + ');
    if (!reasons.length) { FTG.log(`${s.name}: julkaisu, 0 osumaa → ei ilmoitusta`, `${s.name}: published, 0 matches → no alert`); return; }
    if (!FTG.FLAGS.push_alerts_enabled) return;
    if (S.notif.permission !== 'granted') { FTG.log(`${s.name}: ${reasons.length} osumaa, mutta ilmoitukset eivät ole sallittuja → ei lähetetty`, `${s.name}: ${reasons.length} matches but notifications not allowed → not sent`); return; }
    if (FTG.inQuiet()) { FTG.log(`${s.name}: ${reasons.length} osumaa → hiljainen aika, pidätetty klo ${S.notif.quietE} asti`, `${s.name}: ${reasons.length} matches → quiet hours, held until ${S.notif.quietE}`); FTG.emit('quietHeld'); return; }
    S.notifReasons[o.id] = reasons;
    FTG.log(`${s.name}: ${reasons.length} osumaa (${names}) → 1 ilmoitus (deduplikoitu)`, `${s.name}: ${reasons.length} matches (${names}) → 1 alert (deduplicated)`);
    if (reasons.length >= 4) FTG.emit('dedupShown');
    if (reasons.length === 1 && reasons[0].k === 'city' && s.city === 'tampere') FTG.emit('cityOnly');
    if (s.city !== 'tampere') FTG.emit('otherCity');
    const p = o.distributionMode === 'WALK_IN'
      ? { kind: 'offer', offerId: o.id, title: t('push_walkin_t', { store: s.name }), body: t('push_walkin_s', { what: o.what }) }
      : { kind: 'offer', offerId: o.id, title: t('push_new_bags_t', { store: s.name, n: o.qtyTotal }), body: t('push_new_bags_s', { s: C.fmt(o.start), e: C.fmt(o.end) }) };
    setTimeout(() => FTG.showPush(p), 650);
  };

  // reasons text helper (clean version)
  FTG.reasonText = (reasons) => reasons.map(x => {
    if (x.k === 'favorite') return t('reason_favorite');
    if (x.k === 'bell') return t('reason_bell');
    if (x.k === 'radius') return t('reason_radius', { km: S.notif.radiusKm, place: t('saved_place_home') });
    return t('reason_city', { c: city(x.c || 'tampere').name });
  }).join(', ');

  FTG.publish = (o) => { S.offers.unshift(o); FTG.notifyNewOffer(o); return o; };

  // ---------------- Clock ----------------
  FTG.advance = (mins, absolute) => {
    const prev = S.now; S.now = absolute != null ? absolute : S.now + mins;
    S.reservations.forEach(r => {
      const o = offer(r.offerId); if (!o || r.status !== 'confirmed') return;
      if (r.userId === 'me' && S.notif.remind && prev < o.start - 30 && S.now >= o.start - 30 && S.now < o.end) {
        FTG.showPush({ kind: 'remind', title: t('push_remind_t'), body: `${store(o.storeId).name} · ${C.fmt(o.start)}–${C.fmt(o.end)}` });
      }
      if (S.now >= o.end) r.status = 'expired';
    });
    S.offers.forEach(o => { if (o.distributionMode === 'WALK_IN' && o.status === 'active' && prev < o.expiresAt && S.now >= o.expiresAt) FTG.log(`${store(o.storeId).name}: ilmaisjako vanheni automaattisesti`, `${store(o.storeId).name}: giveaway expired automatically`); });
  };

  // ---------------- Actions ----------------
  const A = FTG.A = {};
  const top = () => S.stack[S.stack.length - 1];
  A.go = (tab) => { if (S.role === 'merchant') { S.mTab = tab; S.published = null; } else S.tab = tab; S.stack = []; };
  A.back = () => { S.stack.pop(); };
  A.closeSheet = () => { S.sheet = null; };
  A.noop = () => {};

  A.openOffer = (id) => {
    S.stack.push({ view: 'offer', id });
    const o = offer(id); if (o.distributionMode === 'WALK_IN') FTG.emit('walkinOpened');
  };
  A.openStore = (id) => { S.stack.push({ view: 'store', id }); };
  A.mapPin = (id) => { S.discover.selectedPin = id; };

  A.toggleFav = (id) => {
    const on = S.favorites.includes(id);
    if (on) { S.favorites = S.favorites.filter(x => x !== id); FTG.toast(t('fav_removed'), 'toggleFav', id, t('undo')); }
    else {
      S.favorites.push(id); FTG.emit('favorited');
      if (!S.bells.includes(id)) FTG.toast(t('fav_added_bell'), 'toggleBell', id, t('turn_on'));
      else FTG.toast(t('fav_added'));
    }
  };
  A.toggleBell = (id) => {
    const on = S.bells.includes(id);
    if (on) { S.bells = S.bells.filter(x => x !== id); FTG.toast(t('bell_off_toast', { s: store(id).name })); return; }
    if (S.notif.permission === 'unknown') { S.dialog = { type: 'push', then: ['bellOnNow', id] }; return; }
    A.bellOnNow(id);
  };
  A.bellOnNow = (id) => {
    if (!S.bells.includes(id)) S.bells.push(id);
    FTG.emit('bellOn');
    if (S.notif.permission === 'denied') FTG.toast(t('perm_denied'), 'openNotif', '', t('open_settings'));
    else FTG.toast(t('bell_on_toast', { s: store(id).name }));
  };
  A.pushAllow = () => { const th = S.dialog && S.dialog.then; S.notif.permission = 'granted'; S.dialog = null; if (th) A[th[0]](th[1]); };
  A.pushDeny = () => { const th = S.dialog && S.dialog.then; S.notif.permission = 'denied'; S.dialog = null; if (th) A[th[0]](th[1]); };
  A.askPush = () => { S.dialog = { type: 'push' }; };
  A.openDeviceSettings = () => { S.notif.permission = 'granted'; FTG.toast(t('perm_granted')); };

  // Notification preferences
  A.openNotif = () => { S.stack.push({ view: 'notif' }); FTG.emit('alertsOpened'); };
  A.openBells = () => { S.stack.push({ view: 'bells' }); };
  const needPerm = (key) => { if (S.notif.permission === 'unknown') { S.dialog = { type: 'push', then: ['setNotif', key] }; return true; } return false; };
  A.setNotif = (key) => { S.notif[key] = true; };
  A.notifToggle = (key) => { if (!S.notif[key] && (key === 'fav' || key === 'radius') && needPerm(key)) return; S.notif[key] = !S.notif[key]; };
  A.toggleCityAlert = (id) => {
    if (S.notif.cities.includes(id)) { S.notif.cities = S.notif.cities.filter(c => c !== id); return; }
    S.notif.cities.push(id);
    if (S.notif.permission === 'unknown') S.dialog = { type: 'push' };
  };
  A.addCity = () => { S.sheet = { type: 'addCity' }; };
  A.turnOnAlerts = () => {
    // Empty-state shortcut: radius alerts around home + notifications permission.
    if (S.notif.permission === 'unknown') { S.dialog = { type: 'push', then: ['enableAreaAlerts'] }; return; }
    A.enableAreaAlerts();
  };
  A.enableAreaAlerts = () => { S.notif.radius = true; S.notif.fav = true; if (S.location.city && !S.notif.cities.includes(S.location.city)) S.notif.cities.push(S.location.city); FTG.toast(t('empty_alerts_on_t')); FTG.emit('bellOn'); };

  // Location
  A.openLocation = () => { S.sheet = { type: 'location' }; };
  A.useGps = () => { if (S.location.gps === 'denied') { S.sheet = { type: 'location', deniedAgain: true }; return; } S.dialog = { type: 'gps' }; };
  A.gpsAllow = () => { S.dialog = null; S.location = Object.assign(S.location, { mode: 'gps', city: 'tampere', gps: 'granted' }); S.sheet = null; FTG.emit('locationSet'); };
  A.gpsDeny = () => { S.dialog = null; S.location.gps = 'denied'; S.sheet = { type: 'location' }; };
  A.pickCity = (id) => { S.location.mode = 'city'; S.location.city = id; FTG.emit('locationSet'); };
  A.locDone = () => { S.sheet = null; if (S.location.mode === 'unset') { S.location.mode = 'city'; S.location.city = 'tampere'; FTG.emit('locationSet'); } };
  A.widenRadius = () => { S.location.km = Math.min(20, S.location.km < 10 ? 10 : 20); };

  // Discover
  A.setView = (v) => { S.discover.view = v; if (v === 'map') FTG.emit('mapOpened'); };
  A.setMode = (m) => { S.discover.mode = m; };
  A.openFilters = () => { S.sheet = { type: 'filters' }; };
  A.filterCat = (c) => { const D = S.discover; D.cats = D.cats.includes(c) ? D.cats.filter(x => x !== c) : D.cats.concat(c); };
  A.filterWhen = (w) => { S.discover.when = w; };
  A.filterSort = (w) => { S.discover.sort = w; };
  A.filterSold = () => { S.discover.showSold = !S.discover.showSold; };
  A.clearFilters = () => Object.assign(S.discover, { cats: [], when: 'any', showSold: true, sort: 'distance', q: '', mode: 'all' });

  // Reserve
  A.reserve = (id) => { S.sheet = { type: 'confirmReserve', id }; };
  A.confirmReserve = (id) => {
    S.sheet = { type: 'checking' };
    setTimeout(() => {
      const o = offer(id), st = FTG.offerState(o);
      if (S.demo.race) { S.demo.race = false; o.qtyLeft = 0; S.sheet = { type: 'race', id }; FTG.emit('raceLost'); FTG.log('Varaus hävisi kilpailun: viimeinen kassi meni toiselle', 'Reservation lost the race: last bag went to someone else'); }
      else if (st === 'soldout' || st === 'stopped') S.sheet = { type: 'race', id };
      else if (st !== 'active') S.sheet = { type: 'gone' };
      else {
        o.qtyLeft -= 1;
        const r = { id: FTG.nextId('r'), offerId: id, userId: 'me', code: FTG.code(), status: 'confirmed', createdAt: S.now };
        S.reservations.push(r); S.sheet = null; S.stack.push({ view: 'reserved', id: r.id }); FTG.emit('reserved');
        FTG.log(`Varaus ${r.code}: varasto ${o.qtyLeft + 1} → ${o.qtyLeft}`, `Reservation ${r.code}: stock ${o.qtyLeft + 1} → ${o.qtyLeft}`);
      }
      render();
    }, 900);
  };
  A.showCode = () => { S.stack = []; S.tab = 'pickups'; };
  A.backToDiscover = () => { S.sheet = null; S.stack = []; S.tab = 'discover'; };
  A.cancelRes = (id) => { S.sheet = { type: 'cancelRes', id }; };
  A.doCancelRes = (id) => { const r = S.reservations.find(x => x.id === id); r.status = 'cancelled_user'; offer(r.offerId).qtyLeft += 1; S.sheet = null; FTG.toast(t('st_cancelled_user')); };
  A.notReceived = (id) => { S.sheet = { type: 'notReceived', id, reason: null, text: '' }; };
  A.nrReason = (r) => { S.sheet.reason = r; };
  A.nrSend = () => { const r = S.reservations.find(x => x.id === S.sheet.id); r.status = 'not_received'; r.nr = S.sheet.reason; S.sheet = { type: 'nrSent' }; FTG.emit('notReceived'); };
  A.simScan = (id) => { const r = S.reservations.find(x => x.id === id); r.status = 'collected'; S.impact += 1; S.sheet = { type: 'collected', id }; FTG.emit('collected'); };
  A.directions = () => FTG.toast(t('directions_toast'));

  // Rating
  A.openRate = (id) => { S.sheet = null; S.stack.push({ view: 'rate', id, vals: { quality: 0, quantity: 0, variety: 0, smoothness: 0 }, tried: false }); };
  A.rateStar = (arg) => { const [k, v] = arg.split(':'); top().vals[k] = +v; };
  A.submitRating = () => {
    const v = top(); if (Object.values(v.vals).some(x => !x)) { v.tried = true; return; }
    const r = S.reservations.find(x => x.id === v.id) || S.history.find(x => x.id === v.id);
    const s = store(r.storeId || offer(r.offerId).storeId), R = s.ratings, n = R.n;
    ['quality', 'quantity', 'variety', 'smoothness'].forEach(k => { R[k] = (R[k] * n + v.vals[k]) / (n + 1); });
    R.n = n + 1; r.rated = true; S.stack.pop(); FTG.toast(t('rating_thanks')); FTG.emit('rated');
  };

  // Walk-in reports
  A.report = (arg) => {
    const [id, lvl] = arg.split(':'); const o = offer(id);
    o.reports = o.reports.filter(r => r.by !== 'me'); // one live report per collector, replaced on update
    o.reports.push({ lvl, at: S.now, by: 'me' });
    S.myReports[id] = { lvl, at: S.now };
    FTG.toast(t('report_thanks')); FTG.emit('reported');
    if (FTG.walkSignal(o).state === 'possiblyGone') FTG.emit('possiblyGone');
  };
  A.walkStar = (arg) => { const [id, v] = arg.split(':'); S.myQuality[id] = { val: +v, saved: false }; };
  A.saveQuality = (id) => { S.myQuality[id].saved = true; FTG.toast(t('quality_saved')); };
  A.safety = () => { S.sheet = { type: 'safety', kind: null }; };
  A.safetyKind = (k) => { S.sheet.kind = k; };
  A.safetySend = () => { S.sheet = null; FTG.toast(t('safety_sent')); };

  // Push
  A.openPush = () => {
    const p = S.push; S.push = null; if (!p) return;
    S.role = 'collector';
    if (p.kind !== 'offer') { S.stack = []; S.tab = 'pickups'; return; }
    S.tab = 'discover'; S.stack = [{ view: 'offer', id: p.offerId }]; FTG.emit('pushOpened');
    S.sheet = { type: 'checking', recheck: true };
    setTimeout(() => {
      const o = offer(p.offerId), st = FTG.offerState(o);
      if (FTG.isGone(st)) { S.sheet = { type: 'gone' }; S.stack = []; if (p.stale) FTG.emit('staleOpened'); }
      else S.sheet = null;
      render();
    }, 800);
  };
  A.dismissPush = () => { S.push = null; };

  // Profile
  A.switchRole = () => { S.role = S.role === 'merchant' ? 'collector' : 'merchant'; S.stack = []; S.sheet = null; if (S.role === 'merchant') FTG.emit('roleMerchant'); };
  A.setRole = (r) => { if (S.role !== r) A.switchRole(); };
  A.openSheet = (type) => { S.sheet = { type }; };
  A.setTheme = (id) => { FTG.setTheme(id); };
  A.setLang = (i) => { FTG.lang = +i; S.lang = +i; S.sheet = null; };

  // Toast
  A.toastAction = () => { const tt = S.toast; S.toast = null; if (tt && tt.action) A[tt.action](tt.arg); };

  // Inputs (no full re-render while typing unless needed)
  const I = FTG.I = {};
  I.search = (v) => { S.discover.q = v; return true; };
  I.locRadius = (v) => { S.location.km = +v; return true; };
  I.notifRadius = (v) => { S.notif.radiusKm = +v; return true; };
  I.quietS = (v) => { S.notif.quietS = v; return true; };
  I.quietE = (v) => { S.notif.quietE = v; return true; };
  I.nrText = (v) => { S.sheet.text = v; return false; };

  // ---------------- Render loop ----------------
  const root = () => document.getElementById('app');
  const demoRoot = () => document.getElementById('demo');

  function render() {
    if (!S) return;
    const r = root();
    const scrolls = {}; r.querySelectorAll('[data-skey]').forEach(el => { scrolls[el.dataset.skey] = el.scrollTop; });
    const ae = document.activeElement, fkey = ae && ae.dataset && ae.dataset.fkey, sel = fkey && ae.selectionStart;
    r.innerHTML = FTG.V.screen();
    r.querySelectorAll('[data-skey]').forEach(el => { if (scrolls[el.dataset.skey] != null) el.scrollTop = scrolls[el.dataset.skey]; });
    if (fkey) { const el = r.querySelector(`[data-fkey="${fkey}"]`); if (el) { el.focus(); try { if (sel != null) el.setSelectionRange(sel, sel); } catch (e) { } } }
    const d = demoRoot(); if (d) { const st = d.scrollTop; d.innerHTML = FTG.V.demo(); d.scrollTop = st; }
    document.documentElement.lang = FTG.lang ? 'en' : 'fi';
  }
  FTG.render = render;

  FTG.reset = (id) => {
    const lang = S ? S.lang : 0;
    S = FTG.SCENARIOS[id].build();
    S.lang = lang; FTG.lang = lang; S.demo.scenario = id;
    FTG.log(`Skenaario ladattu: ${FTG.SCENARIOS[id].title[0]}`, `Scenario loaded: ${FTG.SCENARIOS[id].title[1]}`);
    render();
  };

  function handle(e) {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    if (el.dataset.self && e.target !== el) return; // scrim click only
    const name = el.dataset.action; if (!name) return;
    const fn = A[name] || (FTG.MA && FTG.MA[name]) || (FTG.DA && FTG.DA[name]);
    if (!fn) { console.warn('No action', name); return; }
    e.preventDefault();
    fn(el.dataset.arg, el, e);
    render();
  }
  function onInput(e) {
    const el = e.target.closest('[data-input]'); if (!el) return;
    const fn = I[el.dataset.input] || (FTG.MI && FTG.MI[el.dataset.input]);
    if (!fn) return;
    const v = el.type === 'checkbox' ? el.checked : el.value;
    const rerender = fn(v, el);
    if (rerender || e.type === 'change') render();
  }

  document.addEventListener('click', handle);
  document.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[role=link][data-action]')) { e.preventDefault(); handle(e); }
    if (e.key === 'Escape' && S && (S.sheet || S.dialog)) { S.sheet = null; S.dialog = null; render(); }
  });
  document.addEventListener('input', onInput);
  document.addEventListener('change', onInput);

  // Theme layer: apply + persist (localStorage here; AsyncStorage in the native app, as in texttranslator Settings).
  FTG.setTheme = (id) => { FTG.theme.apply(id); FTG.theme.save(id); FTG.theme.current = id; };
  FTG.boot = () => { FTG.theme.current = FTG.theme.load(); FTG.theme.apply(FTG.theme.current); FTG.reset('explore'); };
})();
