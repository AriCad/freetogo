from playwright.sync_api import sync_playwright
import os, sys, pathlib
HERE = pathlib.Path(__file__).resolve().parent
TARGET = sys.argv[1] if len(sys.argv) > 1 else str(HERE.parent / 'index.html')
URL = pathlib.Path(TARGET).resolve().as_uri()
SHOTS = os.environ.get('SHOTS', str(HERE / 'shots'))
os.makedirs(SHOTS, exist_ok=True)
errs=[]; fails=[]
def run():
  with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1100,'height':920})
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: errs.append('console:'+m.text) if m.type=='error' else None)
    pg.goto(URL); pg.wait_for_timeout(400)
    def c(action,arg=None,where='#app',nth=0,wait=120):
      try: return _c(action,arg,where,nth,wait)
      except Exception as ex: fails.append(f'click {action} {arg}: {str(ex)[-700:]}'); return False
    def _c(action,arg=None,where='#app',nth=0,wait=120):
      tail=f'[data-action="{action}"]'+(f'[data-arg="{arg}"]' if arg is not None else '')
      sel=f'{where} {tail}'
      if where=='#app':
        for ov in ['#app .dialog-wrap','#app .camera','#app .overlay','#app .push','#app .toast']:
          if pg.locator(f'{ov} {tail}').count() or pg.locator(f'{ov}{tail}').count():
            sel = f'{ov} {tail}' if pg.locator(f'{ov} {tail}').count() else f'{ov}{tail}'; break
      loc=pg.locator(sel)
      if loc.count()<=nth: fails.append(f'missing {sel}'); return False
      loc.nth(nth).click(timeout=3000); pg.wait_for_timeout(wait); return True
    def d(action,arg=None,wait=150): return c(action,arg,'#demo',0,wait)
    def shot(n): pg.locator('#app').screenshot(path=f'{SHOTS}/{n}.png')
    def has(text, where='#app'):
      ok = text in pg.locator(where).inner_text()
      if not ok: fails.append(f'expected text: {text!r}')
      return ok
    def overflow(tag):
      pg.wait_for_timeout(400)  # let the 0.22 s push animation finish
      r=pg.evaluate("""()=>{const out=[];document.querySelectorAll('#app .scroll').forEach(el=>{if(el.scrollWidth>el.clientWidth+1)out.push(el.dataset.skey+':'+el.scrollWidth+'/'+el.clientWidth)});const sw=document.querySelector('#app');const R=sw.getBoundingClientRect();document.querySelectorAll('#app button, #app .card, #app .block, #app h1, #app h2, #app p').forEach(e=>{const r=e.getBoundingClientRect();if(r.width&&r.right>R.right+1&&!e.closest('.chips,.rail,.rail-v2'))out.push((e.className||e.tagName)+' right '+Math.round(r.right-R.right))});return out.slice(0,8)}""")
      if r: fails.append(f'overflow[{tag}]: {r}')
    # ---------- explore ----------
    shot('01_discover_list'); overflow('discover')
    c('setView','map'); c('mapPin','o3'); shot('02_discover_map')
    c('setView','list')
    c('openOffer','o3'); shot('03_walkin_detail'); overflow('walkin')
    c('report','o3:LOW'); c('walkStar','o3:4'); c('saveQuality','o3'); has('Vähän jäljellä')
    pg.locator('#app .detail .scroll').evaluate('e=>e.scrollTop=900'); pg.wait_for_timeout(100); shot('04_walkin_report')
    c('back'); c('openOffer','o1'); shot('05_reserved_detail'); overflow('detail')
    pg.locator('#app .detail .scroll').evaluate('e=>e.scrollTop=560'); pg.wait_for_timeout(100); shot('06_reserved_detail_contents')
    c('reserve','o1'); shot('07_confirm'); c('confirmReserve','o1',wait=1200); has('Kassi on varattu sinulle'); shot('08_reserved_success')
    c('showCode'); shot('09_pickup_qr'); overflow('pickups')
    c('go','discover'); c('openFilters'); shot('10_filters'); c('closeSheet')
    # ---------- s1 ----------
    d('dScenario','s1'); shot('11_s1_pick_location')
    c('useGps'); shot('12_gps_dialog'); c('gpsDeny'); shot('13_location_denied'); c('pickCity','tampere'); c('locDone')
    has('Ei ilmaista ruokaa juuri nyt'); shot('14_empty_tampere'); overflow('empty')
    c('toggleFav','kaneli'); c('toastAction'); shot('15_push_permission'); c('pushAllow')
    d('dAct','pubKaneli',wait=1000); shot('16_push_banner')
    c('openPush',wait=1100); has('Sait ilmoituksen'); shot('17_deeplink_offer')
    c('reserve'); c('confirmReserve',wait=1200); c('showCode'); c('simScan'); shot('18_collected'); c('openRate')
    for k in ['quality','quantity','variety','smoothness']: c('rateStar',f'{k}:5' if k!='variety' else f'{k}:4')
    shot('19_rate'); c('submitRating'); has('Kiitos arviosta')
    # ---------- s2 ----------
    d('dScenario','s2'); shot('20_m_publish_home'); overflow('m-publish')
    c('mNewDraft','RESERVED')
    for cat in ['bread','produce','dairy','dry']: c('mCat',cat)
    c('mExample'); shot('21_m_form_reserved'); overflow('m-form')
    pg.locator('#app .scroll').evaluate('e=>e.scrollTop=2000'); pg.wait_for_timeout(100); shot('22_m_form_preview')
    c('mPublish',wait=1000); has('Julkaistu'); shot('23_m_published')
    c('openPush',wait=1100); c('reserve'); c('confirmReserve',wait=1200); c('backToDiscover')
    d('dAct','othersReserve'); pg.locator('#app .card[data-action="openOffer"]').filter(has_text='Pihlaja').first.click(); pg.wait_for_timeout(150); has('Kassi'); shot('24_soldout_detail')
    c('back'); c('switchRole'); c('go','manage'); c('mOpen'); shot('25_m_manage_reserved')
    c('mCancelAll'); c('mCancelReason','mc_out'); c('mCancelDo',wait=900); shot('26_cancel_push')
    c('openPush',wait=300); has('Kauppa perui varauksesi'); shot('27_cancelled_pickups')
    # ---------- s3 ----------
    d('dScenario','s3'); c('mNewDraft','WALK_IN'); shot('28_m_walkin_form_blocked')
    c('mTakePhoto'); shot('29_camera'); c('mShutter',wait=600)
    pg.locator('#app textarea[data-input="mWhat"]').fill('Laatikollinen kypsiä banaaneja'); pg.wait_for_timeout(150)
    shot('30_m_walkin_form_ready'); c('mPublish',wait=1000)
    c('openPush',wait=1100); has('Ei varausta – saatavuus epävarma.'); shot('31_walkin_collector')
    c('report',None); 
    d('dAct','otherNone'); has('Mahdollisesti loppunut'); shot('32_possibly_gone')
    d('dAct','otherNone2'); has('Tarkistettavana')
    shot('32b_before_back'); c('back'); shot('32c_after_back'); c('switchRole'); c('go','manage'); c('mOpen'); shot('33_m_walkin_manage')
    c('mAllGone'); shot('33b_m_closed'); c('back'); c('switchRole'); has('tarjousta')
    # ---------- s4 ----------
    d('dScenario','s4'); c('go','favorites'); shot('34_favorites'); c('openNotif'); shot('35_alert_settings'); overflow('notif')
    d('dAct','pubPihlaja',wait=900); has('4 osumaa','#demo'); pg.wait_for_timeout(100)
    d('dAct','pubKumo',wait=900); d('dAct','pubHarju',wait=300); has('0 osumaa','#demo')
    c('addCity'); c('toggleCityAlert','jyvaskyla'); c('closeSheet'); d('dAct','pubHarju',wait=900)
    c('notifToggle','quiet'); d('dAct','clockNight'); d('dAct','pubKaneli',wait=300); has('hiljainen aika','#demo')
    pg.locator('#demo').screenshot(path=SHOTS+'/36_demo_log.png')
    # ---------- s5 ----------
    d('dScenario','s5'); c('openLocation'); shot('37_loc_denied'); c('pickCity','tampere'); c('locDone')
    d('dAct','staleAlert',wait=300); c('openPush',wait=1100); has('Tarjous ei ole enää saatavilla'); shot('38_offer_gone'); c('backToDiscover')
    c('go','pickups'); shot('39_pickups_active'); c('notReceived'); c('nrReason','out'); shot('40_not_received'); c('nrSend'); has('Ilmoitus vastaanotettu'); c('closeSheet')
    c('go','discover'); d('dAct','race'); c('openOffer','o1'); c('reserve'); c('confirmReserve',wait=1200); has('Joku ehti ensin'); shot('41_race_lost'); c('closeSheet'); c('back')
    c('openOffer','o3'); has('Mahdollisesti loppunut'); c('back')
    c('go','profile'); shot('42_profile'); c('openNotif'); has('estetty'); shot('43_notif_denied')
    # ---------- widths ----------
    d('dScenario','explore')
    for w in [360,430]:
      d('dWidth',str(w)); overflow(f'discover{w}'); shot(f'44_discover_{w}')
      c('openOffer','o3'); overflow(f'walkin{w}'); c('back'); c('openOffer','o1'); overflow(f'detail{w}'); c('back')
      c('switchRole'); c('mNewDraft','RESERVED'); overflow(f'mform{w}'); c('mDiscard'); c('switchRole')
    # English
    d('dWidth','360'); d('dLang','1'); shot('45_english_360'); c('openOffer','o3'); overflow('en-walkin360'); shot('46_english_walkin'); c('back'); d('dLang','0'); d('dWidth','390')
    # ---------- themes 6–10 ----------
    import json
    T = json.loads(pg.evaluate('JSON.stringify(FTG.theme.THEMES)'))
    d('dScenario','explore'); c('go','profile'); c('openSheet','theme'); shot('50_theme_sheet')
    for tid in ['7','8','9','10','6']:
      c('setTheme', tid)
      got = pg.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--active').trim()").upper()
      if got != T[tid]['active'].upper(): fails.append(f'theme {tid}: --active {got} != {T[tid]["active"]}')
    c('setTheme','9'); c('closeSheet'); c('go','discover'); shot('51_discover_theme9')
    pg.reload(); pg.wait_for_timeout(400)
    if pg.evaluate('document.documentElement.dataset.theme') != '9': fails.append('theme 9 not persisted after reload')
    for tid in ['6','7','8','9','10']:
      d('dTheme', tid); overflow(f'theme{tid}')
      if tid in ('7','10'): shot(f'52_discover_theme{tid}')
    broken = pg.evaluate("[...document.querySelectorAll('#app img')].filter(i => i.complete && i.naturalWidth === 0).length")
    if broken: fails.append(f'{broken} broken images')
    d('dTheme','6')
    # real phone viewport
    m=b.new_page(viewport={'width':390,'height':844}, device_scale_factor=2)
    m.on('pageerror', lambda e: errs.append('mobile:'+str(e)))
    m.goto(URL); m.wait_for_timeout(400); m.screenshot(path=SHOTS+'/47_mobile_fullscreen.png')
    m.locator('.demo-fab').click(); m.wait_for_timeout(150); m.screenshot(path=SHOTS+'/48_mobile_demo_overlay.png')
    sw=m.evaluate('document.documentElement.scrollWidth'); 
    if sw>390: fails.append(f'mobile page scrollWidth {sw}')
    b.close()
run()
print('ERRORS', errs); print('FAILS', len(fails)); [print(' -',f) for f in fails]
