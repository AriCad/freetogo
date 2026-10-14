"""Local end-to-end smoke test of the exported web build (no cloud services).
Usage: npx expo export --platform web --output-dir /tmp/ftg-web && python3 e2e/web_smoke.py /tmp/ftg-web [shots-dir]
"""
import http.server, os, sys, threading, functools, re
from playwright.sync_api import sync_playwright, expect

ROOT = sys.argv[1]
SHOTS = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(__file__), 'shots')
os.makedirs(SHOTS, exist_ok=True)

class SPA(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
    def send_head(self):
        path = self.translate_path(self.path)
        if not os.path.exists(path) or (os.path.isdir(path) and not os.path.exists(os.path.join(path, 'index.html'))):
            self.path = '/index.html'
        return super().send_head()

srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(SPA, directory=ROOT))
threading.Thread(target=srv.serve_forever, daemon=True).start()
URL = f'http://127.0.0.1:{srv.server_address[1]}'
errors, steps = [], []

def step(name):
    steps.append(name); print('·', name, flush=True)

with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, locale='fi-FI', geolocation=None, permissions=[])
    pg = ctx.new_page()
    pg.on('pageerror', lambda e: errors.append(f'pageerror: {e}'))
    pg.on('console', lambda m: errors.append(f'console: {m.text}') if m.type == 'error' else None)
    shot = lambda n: pg.screenshot(path=f'{SHOTS}/{n}.png')
    text = lambda s: pg.get_by_text(s, exact=False).filter(visible=True).first
    btn = lambda s: pg.get_by_role('button', name=s).filter(visible=True).first
    def tap(label):
        # Tap a control by its accessible name (role button), falling back to visible text.
        loc = pg.get_by_role('button', name=re.compile(re.escape(label))).filter(visible=True)
        (loc.first if loc.count() else pg.get_by_text(label, exact=False).filter(visible=True).first).click()

    pg.goto(URL); pg.wait_for_timeout(1500)
    step('first launch: choose location'); expect(text('Mistä etsitään?')).to_be_visible(); shot('01_first_launch')
    tap('Tai valitse kaupunki'); pg.wait_for_timeout(500)
    pg.get_by_role('radio', name=re.compile('Tampere')).first.click(); pg.wait_for_timeout(200)
    tap('Näytä tarjoukset'); pg.wait_for_timeout(800)
    step('discover rails'); expect(text('Noudettavissa nyt')).to_be_visible(); expect(text('Ilman varausta nyt')).to_be_visible(); shot('02_discover')

    step('walk-in detail + report'); pg.get_by_role('button', name=re.compile('Hedelmätori Aurinko')).filter(visible=True).first.click(); pg.wait_for_timeout(800)
    expect(text('Ei varausta – saatavuus epävarma.')).to_be_visible(); shot('03_walkin')
    btn('Vähän jäljellä').click(); pg.wait_for_timeout(400); expect(text('Ilmoitit:')).to_be_visible()
    btn('Takaisin').click(); pg.wait_for_timeout(500)

    step('reserve a bag'); pg.get_by_role('button', name=re.compile('Kauppahallin Marjapuoti')).filter(visible=True).first.click(); pg.wait_for_timeout(800)
    expect(text('Tämän päivän mahdollinen sisältö')).to_be_visible(); expect(text('Kassien sisältö vaihtelee.')).to_be_visible(); shot('04_offer')
    tap('Varaa ilmaiseksi'); pg.wait_for_timeout(500); shot('05_confirm')
    tap('Varaa kassi · 0 €'); pg.wait_for_timeout(1500)
    expect(text('Kassi on varattu sinulle')).to_be_visible(); shot('06_reserved')
    tap('Näytä noutokoodi'); pg.wait_for_timeout(800)
    step('pickup QR'); expect(text('Aktiivinen varaus')).to_be_visible(); shot('07_pickup_qr')

    step('one active reservation rule'); pg.goto(URL); pg.wait_for_timeout(1200)
    pg.get_by_role('button', name=re.compile('Kasvis-Deli Lehti')).filter(visible=True).first.click(); pg.wait_for_timeout(800)
    expect(text('Sinulla on jo aktiivinen varaus')).to_be_visible(); btn('Takaisin').click(); pg.wait_for_timeout(400)

    step('favourite + shop alerts + demo publish → alert banner → deep link')
    pg.goto(URL + '/store/kaneli'); pg.wait_for_timeout(1200)
    pg.get_by_role('switch', name='Suosikki').click(); pg.wait_for_timeout(200)
    pg.get_by_role('switch', name='Kauppailmoitukset').click(); pg.wait_for_timeout(400); shot('08_store')
    pg.goto(URL + '/demo'); pg.wait_for_timeout(1200)
    tap('Kauppahallin Marjapuoti julkaisee kasseja'); pg.wait_for_timeout(900)
    banner = pg.get_by_role('button', name=re.compile('Kauppahallin Marjapuoti: 4 ilmaista kassia'))
    expect(banner).to_be_visible(); shot('09_alert_banner')
    banner.click(); pg.wait_for_timeout(1500)
    expect(text('Sait ilmoituksen, koska:')).to_be_visible(); shot('10_deeplink')

    step('theme 8 applies immediately and persists'); pg.goto(URL + '/theme'); pg.wait_for_timeout(1200)
    pg.get_by_role('radio', name=re.compile('Teema 8')).click(); pg.wait_for_timeout(400); shot('11_theme8')
    pg.reload(); pg.wait_for_timeout(1500); pg.goto(URL + '/profile'); pg.wait_for_timeout(1200)
    expect(text('Teema · Teema 8 Salvia')).to_be_visible(); shot('12_profile_theme8')

    step('merchant: publish 5 bags with several food groups')
    pg.get_by_role('button', name='Vaihda').filter(visible=True).first.click(); pg.wait_for_timeout(1200)
    expect(text('Julkaise ruokaa')).to_be_visible(); shot('13_merchant_publish')
    tap('Varattavat kassit'); pg.wait_for_timeout(1000)
    for c in ['Hedelmät ja vihannekset', 'Maitotuotteet', 'Leipä ja leivonnaiset']:
        pg.get_by_role('checkbox', name=c).click(); pg.wait_for_timeout(100)
    shot('14_draft'); tap('Julkaise 5 kassia'); pg.wait_for_timeout(1200)
    expect(text('Julkaistu!')).to_be_visible(); shot('15_published')

    step('merchant: walk-in requires a fresh photo, then "Kaikki loppu"')
    pg.goto(URL + '/merchant/draft?mode=WALK_IN'); pg.wait_for_timeout(1200)
    expect(text('Ota uusi kuva ennen julkaisua.')).to_be_visible()
    tap('Käytä demokuvaa (ei kameraa)'); pg.wait_for_timeout(200)
    pg.get_by_role('textbox', name='Mitä on tarjolla?').fill('Laatikollinen banaaneja'); pg.wait_for_timeout(200)
    shot('16_walkin_draft'); tap('Julkaise ilmaisjako'); pg.wait_for_timeout(1200)
    tap('Avaa hallinta'); pg.wait_for_timeout(1000)
    pg.get_by_role('button', name='Kaikki loppu').filter(visible=True).first.click(); pg.wait_for_timeout(500)
    expect(text('Kaikki loppu – kauppa sulki ilmoituksen')).to_be_visible(); shot('17_walkin_closed')

    step('merchant: scan a pickup code')
    pg.goto(URL + '/merchant/scan/o5'); pg.wait_for_timeout(1200)
    pg.get_by_role('textbox', name='Tai kirjoita koodi').fill('FTG-3307'); tap('Vahvista nouto'); pg.wait_for_timeout(400)
    expect(text('Nouto vahvistettu: FTG-3307')).to_be_visible(); shot('18_scan')

    step('english locale + overflow check')
    sw = pg.evaluate('document.documentElement.scrollWidth')
    if sw > 390: errors.append(f'horizontal overflow {sw}px')
    b.close()

srv.shutdown()
real = [e for e in errors if 'deprecated' not in e.lower()]
print(f'\nSTEPS {len(steps)}  ERRORS {len(real)}')
for e in real[:20]: print(' -', e)
sys.exit(1 if real else 0)
