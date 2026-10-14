/* Free To Go — demo control panel (NOT part of the app). Drives scenarios and simulated events. */
(function () {
  const C = FTG.C, icon = FTG.icon, esc = C.esc, fmt = C.fmt;
  const DA = FTG.DA = {};
  const S = () => FTG.state();
  const L = (fi, en) => FTG.lang ? en : fi;

  const ACTIONS = {
    pubKaneli: [['Leipomo Kaneli julkaisee 5 kassia', 'Leipomo Kaneli publishes 5 bags'], () => simPublish('kaneli', { categories: ['bread', 'snacks'], qty: 5, start: 17 * 60, end: 18 * 60 + 30, art: 'bread', desc: 'Päivän leivät ja pullat.' })],
    pubPihlaja: [['Lähikauppa Pihlaja julkaisee 4 kassia', 'Lähikauppa Pihlaja publishes 4 bags'], () => simPublish('pihlaja', { categories: ['produce', 'dairy'], qty: 4, start: 17 * 60 + 30, end: 19 * 60, art: 'groceries' })],
    pubKumo: [['Sushi Kumo (6,8 km) julkaisee', 'Sushi Kumo (6.8 km) publishes'], () => simPublish('kumo', { categories: ['fish', 'meals'], qty: 3, start: 19 * 60, end: 20 * 60, art: 'sushi' })],
    pubHarju: [['Leipätupa Harju, Jyväskylä julkaisee', 'Leipätupa Harju, Jyväskylä publishes'], () => simPublish('harju', { categories: ['bread'], qty: 4, start: 17 * 60 + 30, end: 18 * 60 + 30, art: 'pastry' })],
    othersReserve: [['Muut varaavat loput Pihlajan kassit', 'Others reserve the remaining Pihlaja bags'], othersReserve],
    otherNone: [['Toinen kerääjä: Kaikki loppu', 'Another collector: All gone'], () => otherReport('u71')],
    otherNone2: [['Kolmas kerääjä: Kaikki loppu', 'A third collector: All gone'], () => otherReport('u72')],
    staleAlert: [['Avaa vanha ilmoitus (päättynyt tarjous)', 'Open an old alert (ended offer)'], staleAlert],
    race: [['Seuraava varaus häviää kilpailun', 'Next reservation loses the race'], () => { S().demo.race = !S().demo.race; FTG.log(S().demo.race ? 'Kilpailu päällä: seuraava varaus epäonnistuu' : 'Kilpailu pois', S().demo.race ? 'Race on: next reservation fails' : 'Race off'); }],
    clock30: [['+30 min', '+30 min'], () => FTG.advance(30)],
    clockNight: [['Kello 22:30 (hiljainen aika)', 'Set clock 22:30 (quiet hours)'], () => FTG.advance(0, 22 * 60 + 30)],
  };

  function simPublish(storeId, p) {
    const s = S();
    if (p.start <= s.now) { p.start = Math.ceil((s.now + 10) / 5) * 5; p.end = Math.max(p.end, p.start + 60); }
    const o = FTG.makeOffer({ storeId, distributionMode: 'RESERVED', categories: p.categories, qtyTotal: p.qty, qtyLeft: p.qty, start: p.start, end: p.end, publishedAt: s.now, photo: { kind: 'current', art: p.art, at: s.now }, description: p.desc || '' });
    FTG.publish(o);
  }
  function othersReserve() {
    const s = S(), o = s.offers.find(x => x.storeId === 'pihlaja' && x.distributionMode === 'RESERVED' && FTG.offerState(x) === 'active');
    if (!o) { FTG.log('Ei aktiivista Pihlajan kassitarjousta – julkaise ensin', 'No active Pihlaja bag offer – publish first'); return; }
    while (o.qtyLeft > 0) { o.qtyLeft--; s.reservations.push({ id: FTG.nextId('r'), offerId: o.id, userId: 'u' + Math.floor(Math.random() * 90 + 10), code: FTG.code(), status: 'confirmed', createdAt: s.now }); }
    FTG.emit('soldOut'); FTG.log('Pihlaja: kaikki kassit varattu → loppuunvarattu', 'Pihlaja: all bags reserved → fully reserved');
  }
  function otherReport(user) {
    const s = S();
    const o = s.offers.filter(x => x.distributionMode === 'WALK_IN' && !FTG.isGone(FTG.offerState(x)))[0];
    if (!o) { FTG.log('Ei aktiivista ilmaisjakoa', 'No active walk-in giveaway'); return; }
    o.reports = o.reports.filter(r => r.by !== user); o.reports.push({ lvl: 'NONE', at: s.now, by: user });
    const st = FTG.walkSignal(o).state;
    if (st === 'possiblyGone' || st === 'review') FTG.emit('possiblyGone');
    FTG.log(st === 'review' ? `${FTG.store(o.storeId).name}: 2 itsenäistä ”Kaikki loppu” → tarkistettavana, kauppaa pyydetty vahvistamaan (ei suljettu automaattisesti)` : `${FTG.store(o.storeId).name}: 1 vahvistamaton ”Kaikki loppu” → mahdollisesti loppu (ei suljettu)`, st === 'review' ? `${FTG.store(o.storeId).name}: 2 independent “All gone” → under review, shop asked to confirm (not auto-closed)` : `${FTG.store(o.storeId).name}: 1 unverified “All gone” → possibly gone (not closed)`);
  }
  function staleAlert() {
    const s = S();
    const o = FTG.makeOffer({ storeId: 'kaneli', distributionMode: 'RESERVED', categories: ['bread'], qtyTotal: 5, qtyLeft: 2, start: s.now - 120, end: s.now - 30, publishedAt: s.now - 180, photo: { kind: 'current', art: 'bread', at: s.now - 182 } });
    s.offers.push(o);
    FTG.showPush({ kind: 'offer', stale: true, offerId: o.id, title: FTG.t('push_new_bags_t', { store: 'Leipomo Kaneli', n: 5 }), body: L('Saapunut 3 h sitten', 'Arrived 3 h ago') });
  }

  DA.dScenario = (id) => { FTG.reset(id); };
  DA.dAct = (k) => { ACTIONS[k][1](); };
  DA.dClock = (n) => { FTG.advance(+n); };
  DA.dWidth = (w) => { document.documentElement.style.setProperty('--device-w', w + 'px'); S().demo.width = +w; };
  DA.dLang = (i) => { FTG.lang = +i; S().lang = +i; };
  DA.dRole = () => FTG.A.switchRole();
  DA.dOpen = () => document.getElementById('demo').classList.add('open');
  DA.dClose = () => document.getElementById('demo').classList.remove('open');

  FTG.V.demo = () => {
    const s = S(), sc = FTG.SCENARIOS[s.demo.scenario];
    let h = `<button class="d demo-close" data-action="dClose">${L('Sulje', 'Close')}</button><h1>Free To Go</h1><p>${L('Stage One · klikattava HTML-mallinnus. Ei taustajärjestelmää, ei oikeaa varastoa, ei push-viestejä.', 'Stage One · clickable HTML mockup. No backend, no real stock, no real push.')}</p>`;
    h += `<div class="notice">${L('Kaikki tässä on simuloitua demodataa. Kuvat ovat piirrettyjä kuvituksia, eivät kauppojen kuvia.', 'Everything here is simulated demo data. Pictures are drawn illustrations, not shop photos.')}</div>`;
    h += `<h2>${L('Skenaariot', 'Scenarios')}</h2><div class="scen">${Object.entries(FTG.SCENARIOS).map(([id, x]) => `<button class="d ${s.demo.scenario === id ? 'on' : ''}" data-action="dScenario" data-arg="${id}"><b>${x.title[FTG.lang]}</b>${x.sub[FTG.lang]}</button>`).join('')}</div>`;
    h += `<ol class="steps">${sc.steps.map(st => `<li class="${s.demo.done.includes(st[2]) ? 'done' : ''}">${st[FTG.lang]}</li>`).join('')}</ol>`;
    const acts = (sc.actions || []).concat(sc.actions && sc.actions.includes('race') ? [] : []);
    if (acts.length) h += `<h2>${L('Simuloi tapahtuma', 'Simulate an event')}</h2><div class="row">${acts.map(k => `<button class="d ${k === 'race' && s.demo.race ? 'on' : ''}" data-action="dAct" data-arg="${k}">${ACTIONS[k][0][FTG.lang]}</button>`).join('')}</div>`;
    h += `<h2>${L('Muut simulaatiot', 'More simulations')}</h2><div class="row">${['pubKaneli', 'pubPihlaja', 'pubKumo', 'pubHarju', 'otherNone', 'staleAlert', 'race'].filter(k => !(sc.actions || []).includes(k)).map(k => `<button class="d ${k === 'race' && s.demo.race ? 'on' : ''}" data-action="dAct" data-arg="${k}">${ACTIONS[k][0][FTG.lang]}</button>`).join('')}</div>`;
    h += `<h2>${L('Demoaika', 'Demo clock')} · ${fmt(s.now)}</h2><div class="row"><button class="d" data-action="dClock" data-arg="10">+10 min</button><button class="d" data-action="dClock" data-arg="30">+30 min</button><button class="d" data-action="dClock" data-arg="60">+60 min</button><button class="d" data-action="dAct" data-arg="clockNight">22:30</button></div>`;
    h += `<h2>${L('Näkymä', 'View')}</h2><div class="row"><button class="d" data-action="dRole">${s.role === 'merchant' ? L('Vaihda kerääjäksi', 'Switch to collector') : L('Vaihda kauppiaaksi', 'Switch to merchant')}</button><button class="d ${!FTG.lang ? 'on' : ''}" data-action="dLang" data-arg="0">Suomi</button><button class="d ${FTG.lang ? 'on' : ''}" data-action="dLang" data-arg="1">English</button></div><div class="row" style="margin-top:6px">${[360, 390, 430].map(w => `<button class="d ${(s.demo.width || 390) === w ? 'on' : ''}" data-action="dWidth" data-arg="${w}">${w}px</button>`).join('')}</div>`;
    h += `<h2>${L('Ilmoitus- ja tapahtumaloki', 'Notification & event log')}</h2><div class="log" data-empty="—">${s.demo.log.map(l => `<div><b>${fmt(l.at)}</b> ${esc(FTG.lang ? l.en : l.fi)}</div>`).join('')}</div>`;
    h += `<p style="margin-top:14px" class="xs">${L('Pois päältä ja piilotettu: maksut, muut toimialat, kohdennettu kanava, kampanjat ja etuoikeus. Katso docs/design.', 'Off and hidden: payments, other verticals, targeted channel, campaigns and priority. See docs/design.')}</p>`;
    return h;
  };
})();
