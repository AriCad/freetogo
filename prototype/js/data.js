/* Free To Go — mock data, feature flags and demo scenarios. Everything here is fictional demo data.
   Offer shape mirrors the future generic engine: vertical, distributionMode, pricingMode, accessChannel,
   campaignId and eligibilityPolicyId exist in the model but only FOOD / FREE / PUBLIC are ever rendered. */
(function () {
  // Launch flags. Future modules are OFF and the UI never renders them (not even disabled).
  FTG.FLAGS = Object.freeze({
    enabled_verticals: ['food'],
    walk_in_mode_enabled: true,
    push_alerts_enabled: true,
    public_channel_enabled: true,
    targeted_channel_enabled: false,
    community_campaigns_enabled: false,
    assistance_request_enabled: false,
    priority_early_access_enabled: false,
    paid_offers_enabled: false,
    merchant_billing_enabled: false,
    consumer_access_fee_enabled: false,
    advertising_enabled: false,
  });

  FTG.CATEGORIES = ['bread', 'produce', 'dairy', 'meals', 'meat', 'fish', 'dry', 'snacks', 'other'];

  FTG.CITIES = [
    { id: 'tampere', name: 'Tampere', in: 'Tampereella' },
    { id: 'jyvaskyla', name: 'Jyväskylä', in: 'Jyväskylässä' },
    { id: 'turku', name: 'Turku', in: 'Turussa' },
    { id: 'helsinki', name: 'Helsinki', in: 'Helsingissä' },
    { id: 'oulu', name: 'Oulu', in: 'Oulussa' },
    { id: 'kuopio', name: 'Kuopio', in: 'Kuopiossa' },
  ];

  FTG.MERCHANT_STORE_ID = 'pihlaja';

  const R = (quality, quantity, variety, smoothness, n) => ({ quality, quantity, variety, smoothness, n });
  FTG.STORES_SEED = [
    { id: 'kaneli', name: 'Leipomo Kaneli', kind: ['Leipomo', 'Bakery'], city: 'tampere', address: 'Hämeenkatu 14, Tampere', km: 0.8, x: .42, y: .47, color: '#9E1645', initials: 'LK', art: 'bread', ratings: R(4.7, 4.4, 4.3, 4.8, 128), rel: { ok: 126, fail: 2 } },
    { id: 'pihlaja', name: 'Lähikauppa Pihlaja', kind: ['Lähikauppa', 'Grocery'], city: 'tampere', address: 'Kalevan puistotie 3, Tampere', km: 1.6, x: .68, y: .38, color: '#241A3A', initials: 'LP', art: 'groceries', ratings: R(4.5, 4.6, 4.7, 4.4, 86), rel: { ok: 84, fail: 1 } },
    { id: 'sointu', name: 'Kahvila Sointu', kind: ['Kahvila', 'Café'], city: 'tampere', address: 'Kuninkaankatu 22, Tampere', km: 0.4, x: .33, y: .62, color: '#6B4FA0', initials: 'KS', art: 'cafe', ratings: R(4.6, 4.0, 4.2, 4.9, 54), rel: { ok: 54, fail: 0 } },
    { id: 'aurinko', name: 'Hedelmätori Aurinko', kind: ['Torikoju', 'Market stall'], city: 'tampere', address: 'Laukontori, Tampere', km: 2.1, x: .52, y: .79, color: '#9A5B00', initials: 'HA', art: 'bananas', ratings: R(4.4, 4.8, 3.9, 4.6, 41), rel: { ok: 0, fail: 0 } },
    { id: 'torikeittio', name: 'Torikeittiö', kind: ['Lounasravintola', 'Lunch restaurant'], city: 'tampere', address: 'Tuomiokirkonkatu 9, Tampere', km: 3.4, x: .18, y: .33, color: '#3B5BA9', initials: 'TK', art: 'meals', ratings: R(4.3, 4.5, 4.0, 4.7, 33), rel: { ok: 32, fail: 1 } },
    { id: 'kumo', name: 'Sushi Kumo', kind: ['Ravintola', 'Restaurant'], city: 'tampere', address: 'Hervannan valtaväylä 12, Tampere', km: 6.8, x: .88, y: .88, color: '#463C5C', initials: 'SK', art: 'sushi', ratings: R(4.8, 4.1, 4.4, 4.6, 19), rel: { ok: 19, fail: 0 } },
    { id: 'harju', name: 'Leipätupa Harju', kind: ['Leipomo', 'Bakery'], city: 'jyvaskyla', address: 'Kauppakatu 5, Jyväskylä', km: 148, x: .5, y: .5, color: '#7A4B00', initials: 'LH', art: 'pastry', ratings: R(4.6, 4.3, 4.1, 4.7, 22), rel: { ok: 22, fail: 0 } },
    { id: 'aura', name: 'Aura Deli', kind: ['Herkkukauppa', 'Deli'], city: 'turku', address: 'Eerikinkatu 18, Turku', km: 162, x: .5, y: .5, color: '#1E7A4C', initials: 'AD', art: 'meals', ratings: R(0, 0, 0, 0, 0), rel: { ok: 0, fail: 0 } },
  ];

  const H = (h, m = 0) => h * 60 + m; // minutes since midnight
  FTG.H = H;

  let seq = 100;
  FTG.nextId = (p) => p + (++seq);
  FTG.code = () => 'FTG-' + String(1000 + Math.floor(Math.random() * 9000));

  function offer(o) {
    return Object.assign({
      id: FTG.nextId('o'), vertical: 'food', pricingMode: 'FREE', priceMinor: 0, currency: 'EUR',
      accessChannel: 'PUBLIC', campaignId: null, eligibilityPolicyId: null,
      status: 'active', description: '', categories: [], photo: { kind: 'none' }, reports: [],
      qtyTotal: null, qtyLeft: null, reservationsOpen: true,
    }, o);
  }
  FTG.makeOffer = offer;

  function defaultOffers() {
    return [
      offer({ id: 'o1', storeId: 'kaneli', distributionMode: 'RESERVED', categories: ['bread', 'snacks'], qtyTotal: 5, qtyLeft: 3, start: H(17), end: H(18, 30), publishedAt: H(16, 10), photo: { kind: 'current', art: 'bread', at: H(16, 8) }, description: 'Päivän leivät, sämpylät ja korvapuustit.' }),
      offer({ id: 'o2', storeId: 'sointu', distributionMode: 'RESERVED', categories: ['bread', 'meals', 'dairy'], qtyTotal: 4, qtyLeft: 1, start: H(16, 30), end: H(17, 30), publishedAt: H(15, 50), photo: { kind: 'example', art: 'cafe' }, description: 'Voileipiä, croissantteja ja jogurttia.' }),
      offer({ id: 'o3', storeId: 'aurinko', distributionMode: 'WALK_IN', categories: ['produce'], what: 'Laatikollinen kypsiä banaaneja ja muutama mango', start: H(16, 20), end: H(18), publishedAt: H(16, 20), expiresAt: H(17, 20), photo: { kind: 'current', art: 'bananas', at: H(16, 18) }, reports: [{ lvl: 'MANY', at: H(16, 28), by: 'u17' }, { lvl: 'LOW', at: H(16, 36), by: 'u23' }] }),
      offer({ id: 'o4', storeId: 'torikeittio', distributionMode: 'RESERVED', categories: ['meals', 'meat', 'fish'], qtyTotal: 6, qtyLeft: 6, start: H(18, 30), end: H(19, 30), publishedAt: H(16, 30), photo: { kind: 'example', art: 'meals' }, description: 'Lounaan ylijäämäannoksia rasioissa.' }),
      offer({ id: 'o5', storeId: 'pihlaja', distributionMode: 'RESERVED', categories: ['produce', 'dairy', 'bread', 'dry'], qtyTotal: 5, qtyLeft: 0, start: H(17, 30), end: H(19), publishedAt: H(15, 40), photo: { kind: 'current', art: 'groceries', at: H(15, 38) }, description: 'Hedelmiä, vihanneksia ja maitotuotteita.' }),
      offer({ id: 'o6', storeId: 'kumo', distributionMode: 'RESERVED', categories: ['fish', 'meals'], qtyTotal: 3, qtyLeft: 2, start: H(19), end: H(20), publishedAt: H(16, 35), photo: { kind: 'current', art: 'sushi', at: H(16, 33) } }),
      offer({ id: 'o7', storeId: 'harju', distributionMode: 'RESERVED', categories: ['bread'], qtyTotal: 4, qtyLeft: 4, start: H(17), end: H(18), publishedAt: H(16), photo: { kind: 'current', art: 'pastry', at: H(15, 58) } }),
    ];
  }
  function pihlajaReservations() {
    return [
      { id: 'r1', offerId: 'o5', userId: 'u31', code: 'FTG-2281', status: 'collected', createdAt: H(15, 44) },
      { id: 'r2', offerId: 'o5', userId: 'u44', code: 'FTG-5190', status: 'collected', createdAt: H(15, 47) },
      { id: 'r3', offerId: 'o5', userId: 'u52', code: 'FTG-3307', status: 'confirmed', createdAt: H(15, 52) },
      { id: 'r4', offerId: 'o5', userId: 'u58', code: 'FTG-7742', status: 'confirmed', createdAt: H(16, 2) },
      { id: 'r5', offerId: 'o5', userId: 'u61', code: 'FTG-6015', status: 'confirmed', createdAt: H(16, 15) },
    ];
  }
  const history = () => [
    { id: 'h1', offerId: null, storeId: 'kaneli', code: 'FTG-1188', status: 'collected', day: 'Ti 13.10.', rated: true },
    { id: 'h2', offerId: null, storeId: 'aurinko', walkIn: true, status: 'collected', day: 'Ma 12.10.', rated: false },
  ];

  function base() {
    return {
      role: 'collector', tab: 'discover', mTab: 'publish', stack: [], sheet: null, dialog: null, toast: null, push: null, camera: null,
      now: H(16, 40), lang: 0,
      stores: JSON.parse(JSON.stringify(FTG.STORES_SEED)),
      offers: defaultOffers(), reservations: [], history: history(),
      location: { mode: 'city', city: 'tampere', km: 5, gps: 'unknown' },
      discover: { view: 'list', mode: 'all', q: '', cats: [], when: 'any', showSold: true, sort: 'distance', selectedPin: null },
      favorites: ['kaneli'], bells: ['kaneli'],
      notif: { permission: 'granted', fav: true, radius: true, radiusKm: 5, cities: [], quiet: false, quietS: '22:00', quietE: '07:00', remind: true },
      myReports: {}, myQuality: {}, notifReasons: {},
      demo: { race: false, scenario: 'explore', done: [], log: [] },
      draft: null, impact: 7,
    };
  }

  FTG.SCENARIOS = {
    explore: {
      title: ['Vapaa tutkiminen', 'Free exploration'], sub: ['Täysi demodata, kaikki näkymät', 'Full demo data, every view'],
      build() { const s = base(); s.reservations = pihlajaReservations(); return s; },
      steps: [
        ['Selaa listaa ja vaihda karttaan', 'Browse the list, then switch to the map', 'mapOpened'],
        ['Avaa ilmaisjako (banaanit) ja ilmoita tilanne', 'Open the walk-in (bananas) and report', 'reported'],
        ['Varaa kassi ja näytä noutokoodi', 'Reserve a bag and show the code', 'reserved'],
        ['Vaihda kauppiaaksi profiilista tai yläkulmasta', 'Switch to merchant from the top corner', 'roleMerchant'],
      ],
    },
    s1: {
      title: ['1 · Ei ruokaa → ilmoitus → nouto', '1 · No food → alert → pickup'], sub: ['Tyhjä tila, suosikki, kello, push, varaus, arvio', 'Empty state, favourite, bell, push, reserve, rate'],
      build() {
        const s = base();
        s.offers = s.offers.filter(o => s.stores.find(x => x.id === o.storeId).city !== 'tampere');
        s.location = { mode: 'unset', city: null, km: 5, gps: 'unknown' };
        s.favorites = []; s.bells = []; s.history = [];
        s.notif = Object.assign(s.notif, { permission: 'unknown', fav: false, radius: false, cities: [] });
        s.impact = 0;
        return s;
      },
      steps: [
        ['Valitse sijainti (kokeile kieltää GPS → valitse Tampere)', 'Choose location (try denying GPS → pick Tampere)', 'locationSet'],
        ['Lisää Leipomo Kaneli suosikiksi (sydän)', 'Favourite Leipomo Kaneli (heart)', 'favorited'],
        ['Laita kaupan kello päälle ja salli ilmoitukset', 'Turn on the shop bell and allow notifications', 'bellOn'],
        ['Paina demopaneelista: ”Leipomo Kaneli julkaisee 5 kassia”', 'In this panel tap “Leipomo Kaneli publishes 5 bags”', 'pushShown'],
        ['Napauta ilmoitusta → varaa', 'Tap the alert → reserve', 'reserved'],
        ['Noudot: simuloi skannaus ja arvioi neljällä tähtirivillä', 'Pickups: simulate the scan and rate with four star rows', 'rated'],
      ],
      actions: ['pubKaneli'],
    },
    s2: {
      title: ['2 · Kauppias julkaisee 5 kassia', '2 · Merchant publishes 5 bags'], sub: ['Monivalinnat, varaus, loppuunvarattu, kaupan peruutus', 'Multi-select, reserve, sold out, shop cancellation'],
      build() { const s = base(); s.offers = s.offers.filter(o => o.storeId !== 'pihlaja'); s.role = 'merchant'; s.mTab = 'publish'; s.favorites = ['kaneli', 'pihlaja']; s.bells = ['pihlaja']; return s; },
      steps: [
        ['Julkaise: valitse ”Varattavat kassit”, 5 kassia, useita ruokaryhmiä, aika', 'Publish: “Reservable bags”, 5 bags, several food groups, time', 'published'],
        ['Vaihda kerääjäksi ja varaa yksi Pihlajan kassi', 'Switch to collector and reserve a Pihlaja bag', 'reserved'],
        ['Paina demopaneelista: ”Muut varaavat loput kassit”', 'In this panel tap “Others reserve the remaining bags”', 'soldOut'],
        ['Vaihda kauppiaaksi → Hallinta → Peru varaukset', 'Switch to merchant → Manage → Cancel reservations', 'merchantCancelled'],
      ],
      actions: ['othersReserve'],
    },
    s3: {
      title: ['3 · Ilmaisjako: banaanit', '3 · Walk-in: bananas'], sub: ['Pakollinen kuva, ei varausta, ilmoitukset, kaikki loppu', 'Required photo, no reservation, reports, all gone'],
      build() { const s = base(); s.role = 'merchant'; s.mTab = 'publish'; s.offers = s.offers.filter(o => o.storeId !== 'aurinko' && o.storeId !== 'pihlaja'); s.bells = ['pihlaja']; s.favorites = ['pihlaja']; return s; },
      steps: [
        ['Julkaise: ”Ilmaisjako ilman varausta” → ota kuva → kuvaus → aika', 'Publish: “Walk-in giveaway” → take photo → describe → time', 'walkinPublished'],
        ['Vaihda kerääjäksi ja avaa banaanien ilmaisjako', 'Switch to collector and open the banana giveaway', 'walkinOpened'],
        ['Ilmoita ”Vähän jäljellä” ja anna halutessasi laatutähdet', 'Report “A little left”, optionally rate quality', 'reported'],
        ['Demopaneeli: ”Toinen kerääjä: Kaikki loppu” → mahdollisesti loppu', 'Panel: “Another collector: All gone” → possibly gone', 'possiblyGone'],
        ['Vaihda kauppiaaksi → Hallinta → Kaikki loppu', 'Switch to merchant → Manage → All gone', 'merchantClosed'],
      ],
      actions: ['otherNone', 'otherNone2', 'clock30'],
    },
    s4: {
      title: ['4 · Päällekkäiset ilmoitukset', '4 · Overlapping alerts'], sub: ['Suosikki + kello + säde + kaupunki = yksi ilmoitus', 'Favourite + bell + radius + city = one alert'],
      build() { const s = base(); s.offers = s.offers.filter(o => !['pihlaja', 'kumo', 'harju'].includes(o.storeId)); s.favorites = ['pihlaja', 'kaneli']; s.bells = ['pihlaja']; s.notif.cities = ['tampere']; s.reservations = []; return s; },
      steps: [
        ['Avaa Suosikit → Ilmoitusasetukset ja katso neljä lähdettä', 'Open Favourites → Alert settings, see four sources', 'alertsOpened'],
        ['Demopaneeli: ”Pihlaja julkaisee” → 4 osumaa, 1 ilmoitus', 'Panel: “Pihlaja publishes” → 4 matches, 1 alert', 'dedupShown'],
        ['Demopaneeli: ”Sushi Kumo (6,8 km)” → vain kaupunki täsmää', 'Panel: “Sushi Kumo (6.8 km)” → only city matches', 'cityOnly'],
        ['Demopaneeli: ”Leipätupa Harju, Jyväskylä” → ei ilmoitusta; lisää Jyväskylä ja kokeile uudelleen', 'Panel: “Leipätupa Harju, Jyväskylä” → no alert; add Jyväskylä and retry', 'otherCity'],
        ['Laita hiljainen aika päälle ja kokeile julkaisua klo 22:30', 'Turn on quiet hours and try publishing at 22:30', 'quietHeld'],
      ],
      actions: ['pubPihlaja', 'pubKumo', 'pubHarju', 'clockNight'],
    },
    s5: {
      title: ['5 · Tyhjät ja virhetilat', '5 · Empty and error states'], sub: ['Ei GPS:ää, vanhentunut, ei saatu, ehti loppua', 'No GPS, expired, not received, sold out race'],
      build() {
        const s = base();
        s.location = { mode: 'unset', city: null, km: 5, gps: 'denied' };
        s.reservations = [{ id: 'r9', offerId: 'o2', userId: 'me', code: 'FTG-4821', status: 'confirmed', createdAt: H(16, 5) }];
        s.notif.permission = 'denied';
        s.offers.find(o => o.id === 'o3').reports.push({ lvl: 'NONE', at: H(16, 38), by: 'u29' });
        return s;
      },
      steps: [
        ['Sijainti on estetty: valitse kaupunki käsin', 'Location is blocked: choose a city manually', 'locationSet'],
        ['Demopaneeli: ”Avaa vanha ilmoitus” → tarjous päättynyt', 'Panel: “Open an old alert” → offer ended', 'staleOpened'],
        ['Noudot → ”En saanut ruokakassiani” → valitse syy', 'Pickups → “I didn’t get my food bag” → pick a reason', 'notReceived'],
        ['Demopaneeli: ”Seuraava varaus häviää kilpailun” → varaa kassi', 'Panel: “Next reservation loses the race” → reserve a bag', 'raceLost'],
        ['Avaa banaanit: yksi ”Kaikki loppu” = mahdollisesti loppu', 'Open bananas: one “All gone” = possibly gone', 'walkinOpened'],
        ['Profiili → Ilmoitukset: estetyt ilmoitukset ja korjausohje', 'Profile → Alerts: blocked notifications and the fix', 'alertsOpened'],
      ],
      actions: ['staleAlert', 'race', 'otherNone'],
    },
  };

  FTG.TEMPLATES = {
    reserved: { mode: 'RESERVED', qty: 5, categories: ['produce', 'dairy', 'bread', 'dry'], start: '17:30', end: '19:00', description: 'Hedelmiä, vihanneksia ja maitotuotteita.', photo: { kind: 'example', art: 'groceries' } },
    walkin: { mode: 'WALK_IN', categories: ['produce'], what: 'Laatikollinen kypsiä banaaneja', start: '16:45', end: '18:00' },
  };
})();
