import asyncio, json, time
from playwright.async_api import async_playwright
import os
S=os.path.dirname(os.path.abspath(__file__))+'/out'
os.makedirs(S, exist_ok=True)
M=os.path.dirname(os.path.abspath(__file__))+'/mock/'
BASE='http://localhost:8765/'
ntfy=[]
results=[]
async def route(r):
    name=r.request.url.rsplit('/',1)[1]
    await r.fulfill(status=200, headers={'content-type':'application/javascript','access-control-allow-origin':'*'}, body=open(M+name).read())
async def ntfy_route(r):
    if r.request.method=='POST': ntfy.append(json.loads(r.request.post_data or '{}'))
    await r.fulfill(status=200, headers={'content-type':'application/json','access-control-allow-origin':'*'}, body='{}')
def check(label, cond):
    results.append(bool(cond)); print(('PASS ' if cond else 'FAIL ')+label)
OSC="window.__osc=0;(()=>{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const o=C.prototype.createOscillator;C.prototype.createOscillator=function(){if(this.state==='running')window.__osc++;return o.call(this)};})();"

# Pin the browser clock to the next Wednesday, 10:00 in Madagascar, so the tests behave the same
# whatever time they're run (orders placed after closing would otherwise land on the next day).
import datetime as _dt
def cafe_open_time():
    tz=_dt.timezone(_dt.timedelta(hours=3)); now=_dt.datetime.now(tz)
    d=now+_dt.timedelta(days=(2-now.weekday())%7 or 7)
    return d.replace(hour=10,minute=0,second=0,microsecond=0)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        ctx=await b.new_context(viewport={'width':1280,'height':860})
        await ctx.clock.install(time=cafe_open_time())
        await ctx.route('https://www.gstatic.com/firebasejs/**', route)
        csp=[]; ctx.on('console', lambda m: ('Content Security Policy' in m.text or 'Refused to' in m.text) and csp.append(m.text[:200]))
        await ctx.route('https://ntfy.sh/**', ntfy_route)
        await ctx.add_init_script("if(!localStorage.getItem('testInit')){localStorage.clear();localStorage.setItem('aisu-lang','\"en\"');localStorage.setItem('aisu-staff-lang','\"en\"');localStorage.setItem('testInit','1')}"+OSC)
        errs=[]
        dash=await ctx.new_page(); dash.on('pageerror',lambda e: errs.append('dash: '+str(e)))
        await dash.goto(BASE+'staff/'); await dash.wait_for_timeout(500)
        check('sign-in starts on the team login (password only)', await dash.is_hidden('#lEmailField'))
        await dash.click('[data-mode="manager"]')
        await dash.fill('#lEmail','aisuparfaiteria@gmail.com'); await dash.fill('#lPass','secret'); await dash.click('#lBtn'); await dash.wait_for_timeout(800)
        check('"Start service" screen asks for the one tap', await dash.is_visible('#startDlg'))
        await dash.click('#startGo'); await dash.wait_for_timeout(400)
        check('owner lands on Today', await dash.is_visible('[data-panel="today"]') and not await dash.is_visible('#startDlg'))
        check('starting service unlocks the sound (test ring heard)', await dash.evaluate('window.__osc')>0)
        check('top bar shows alerts on', 'Alerts on' in await dash.inner_text('#alertBtn'))
        await dash.screenshot(path=S+'/v2-today-empty.png')

        site=await ctx.new_page(); site.on('pageerror',lambda e: errs.append('site: '+str(e)))
        await site.set_viewport_size({'width':390,'height':844})
        await site.goto(BASE); await site.wait_for_timeout(800)
        db=lambda: site.evaluate("JSON.parse(localStorage.getItem('mockDB')||'{}')")
        tomorrow=await site.evaluate("(()=>{const i=document.getElementById('r-date');const d=new Date(i.value);d.setDate(d.getDate()+1);return d.toISOString().slice(0,10)})()")
        async def book(name, day):
            if await site.is_visible('#newBooking'): await site.evaluate("document.getElementById('newBooking').click()"); await site.wait_for_timeout(150)
            await site.evaluate(f"(()=>{{const i=document.getElementById('r-date');i.value='{day}';i.dispatchEvent(new Event('change'))}})()"); await site.wait_for_timeout(250)
            slot=await site.evaluate("(document.querySelector('#slots .opt:not([disabled])')||{dataset:{}}).dataset.slot")
            if slot: await site.evaluate(f"document.querySelector('#slots [data-slot=\"{slot}\"]').click()")
            await site.fill('#r-name',name); await site.fill('#r-phone','034 12 345 67')
            await site.evaluate("document.querySelector('#reserveForm button[type=submit]').click()"); await site.wait_for_timeout(600)
            return slot
        # ---- a new booking rings the dashboard, whatever tab is open ----
        await dash.reload(); await dash.wait_for_timeout(800)
        check('after a reload the start screen comes back', await dash.is_visible('#startDlg'))
        await dash.click('#startGo'); await dash.wait_for_timeout(300)
        await dash.click('[data-view="menu"]'); await dash.wait_for_timeout(200)
        await dash.bring_to_front()
        osc0=await dash.evaluate('window.__osc')
        first=await book('Rado Test', tomorrow)
        await dash.wait_for_timeout(600)
        check('new booking opens the full-screen alarm', await dash.is_visible('#alarm') and 'New booking' in await dash.inner_text('#alarmTitle') and 'Rado Test' in await dash.inner_text('#alarmCard'))
        await dash.screenshot(path=S+'/v2-alarm-booking.png')
        osc1=await dash.evaluate('window.__osc')
        await dash.wait_for_timeout(7600)
        osc2=await dash.evaluate('window.__osc')
        check('alarm rings on the Menu tab without anyone pressing Orders', osc1>osc0 and osc2>osc1)
        await dash.keyboard.press('Escape'); await dash.wait_for_timeout(200)
        check('Escape does not dismiss the alarm', await dash.is_visible('#alarm'))
        await dash.click('#alarmAct'); await dash.wait_for_timeout(500)
        res=list((await db())['reservations'].values())
        check('"Confirm the booking" confirms it and closes the alarm', res[0]['status']=='confirmed' and not await dash.is_visible('#alarm'))
        osc3=await dash.evaluate('window.__osc'); await dash.wait_for_timeout(7500)
        check('ringing stops once answered', await dash.evaluate('window.__osc')==osc3)

        # ---- phone alerts ----
        await dash.click('[data-view="settings"]'); await dash.click('#phoneOn'); await dash.wait_for_timeout(400)
        topic=(await db())['settings']['main'].get('alertTopic','')
        check('phone alerts create a private channel code', topic.startswith('aisu-') and len(topic)>=20 and topic in await dash.inner_text('#topicCode'))
        await dash.click('#phoneTest'); await dash.wait_for_timeout(400)
        check('Send a test posts to the channel', any(m.get('topic')==topic and m.get('priority')==5 for m in ntfy))
        await dash.screenshot(path=S+'/v2-settings.png', full_page=True)

        # ---- a new order: alarm, phone ping without personal data ----
        await site.reload(); await site.wait_for_timeout(900)
        await site.evaluate("document.querySelector('[data-padd=\"0\"]').click(); document.querySelector('[data-padd=\"0\"]').click(); document.querySelector('[data-drink=\"cafes|0|3|0\"]').click()")
        await site.evaluate("document.querySelector('.tabbar .tb-order').click()"); await site.wait_for_timeout(200)
        await site.click('#toCheckout'); await site.fill('#c-name','Hery Secret'); await site.fill('#c-phone','032 11 222 33'); await site.click('#placeOrder'); await site.wait_for_timeout(700)
        await dash.wait_for_timeout(400)
        check('new order opens the alarm with its items', await dash.is_visible('#alarm') and 'New order' in await dash.inner_text('#alarmTitle') and 'Miss Coco Cherry' in await dash.inner_text('#alarmCard'))
        await dash.screenshot(path=S+'/v2-alarm-order.png')
        pings=[m for m in ntfy if m.get('title')=='Nouvelle commande']
        check('the order also pings the phones', len(pings)==1 and pings[0]['topic']==topic and '3 articles' in pings[0]['message'])
        check('phone message carries no name or number', all('Hery' not in json.dumps(m) and '222' not in json.dumps(m) and 'Rado' not in json.dumps(m) for m in ntfy))
        await dash.click('#alarmSeen'); await dash.wait_for_timeout(300)
        check('"Seen" closes the alarm and leaves the order New', not await dash.is_visible('#alarm') and list((await db())['orders'].values())[0]['status']=='new')

        # ---- undo ----
        await dash.click('[data-view="orders"]'); await dash.wait_for_timeout(200)
        await dash.click('#colNew .card [data-to="preparing"]'); await dash.wait_for_timeout(300)
        check('Start shows an Undo', await dash.is_visible('#toastUndo'))
        await dash.click('#toastUndo'); await dash.wait_for_timeout(400)
        dd=await db(); o0=list(dd['orders'].values())[0]
        check('Undo puts the order back to New', o0['status']=='new' and dd['pickups'][o0['track']]['status']=='new')

        # ---- before the new database rules are published, orders still go through (without live tracking) ----
        await site.evaluate("window.__mockRefuse=['pickups']")
        await site.evaluate('document.querySelector(\'[data-padd="1"]\').click(); document.querySelector(".tabbar .tb-order").click()'); await site.wait_for_timeout(200)
        await site.click('#toCheckout'); await site.click('#placeOrder'); await site.wait_for_timeout(700)
        dd=await db(); plain=[v for v in dd['orders'].values() if 'track' not in v]
        check('if tracking is refused, the order is still saved', len(plain)==1 and len(dd['orders'])==2)
        check('…and the customer still gets an order number to show', plain and plain[0]['ref'] in await site.inner_text('#cartBody') and 'Live tracking isn' in await site.inner_text('#cartBody'))
        await site.evaluate("window.__mockRefuse=null"); await site.click('#closeCart')
        if await dash.is_visible('#alarm'): await dash.click('#alarmSeen'); await dash.wait_for_timeout(200)
        await site.evaluate("(()=>{const db=JSON.parse(localStorage.getItem('mockDB'));for(const k in db.orders){ if(!db.orders[k].track) delete db.orders[k]; }localStorage.setItem('mockDB',JSON.stringify(db))})()"); await dash.wait_for_timeout(300)

        # ---- reminder for a waiting order ----
        osc4=await dash.evaluate('window.__osc')
        await site.evaluate("(()=>{const db=JSON.parse(localStorage.getItem('mockDB'));const o=Object.values(db.orders)[0];o.createdAt={__ts:Date.now()-7*60000};localStorage.setItem('mockDB',JSON.stringify(db))})()")
        await dash.wait_for_timeout(1500)
        check('order waiting over 5 min shows the red strip and rings again', await dash.is_visible('#waitBar') and 'waiting' in await dash.inner_text('#waitText') and await dash.evaluate('window.__osc')>osc4)
        await dash.screenshot(path=S+'/v2-orders.png')

        # ---- sold out ----
        await dash.click('[data-view="menu"]'); await dash.wait_for_timeout(200)
        await dash.click('.mrow[data-sold="p1"]'); await dash.wait_for_timeout(300)
        await dash.click('.mrow[data-sold="cafes-0-3"]'); await dash.wait_for_timeout(300)
        so=(await db())['settings']['main'].get('soldOut',{})
        check('menu tab marks items sold out', so.get('p1') and so.get('cafes-0-3'))
        await dash.screenshot(path=S+'/v2-menu.png')
        await site.reload(); await site.wait_for_timeout(900)
        check('site shows the parfait as sold out', await site.evaluate("document.querySelector('[data-padd=\"0\"]').classList.contains('is-sold') && document.querySelector('[data-padd=\"0\"]').textContent.includes('Sold out')"))
        check('site shows the drink as sold out', await site.evaluate("document.querySelector('[data-drink=\"cafes|0|3|0\"]').classList.contains('is-sold')"))
        await site.evaluate("document.querySelector('[data-padd=\"0\"]').click()"); await site.wait_for_timeout(200)
        cart=await site.evaluate("JSON.parse(localStorage.getItem('aisu-cart')||'[]')")
        check('a sold-out item cannot be added', all(l['key']!='p1' for l in cart) and 'sold out' in (await site.inner_text('#toast')).lower())
        # live: un-sell from Today chip, site updates without reload
        await dash.click('[data-view="today"]'); await dash.click('#soldChips [data-sold="p1"]'); await dash.wait_for_timeout(500)
        check('site updates live when it is back', await site.evaluate("!document.querySelector('[data-padd=\"0\"]').classList.contains('is-sold')"))

        # ---- notice ----
        await dash.click('[data-view="settings"]'); await dash.fill('#noticeIn','Closed Saturday for a private event.'); await dash.click('#noticeSave'); await dash.wait_for_timeout(500)
        check('website notice appears on the site', await site.is_visible('#siteNotice') and 'private event' in await site.inner_text('#siteNotice'))
        await site.screenshot(path=S+'/v2-site-notice.png')

        # ---- pause bookings from Today ----
        await dash.click('[data-view="today"]')
        await dash.click('.qcard[data-q="bookingsPaused"] .switch'); await dash.wait_for_timeout(500)
        check('Today switch pauses online bookings', (await db())['settings']['main']['bookingsPaused'] is True and 'Paused' in await dash.inner_text('.qcard[data-q="bookingsPaused"]'))
        await dash.screenshot(path=S+'/v2-today.png', full_page=True)
        await site.evaluate("document.getElementById('reserve').scrollIntoView()"); await site.wait_for_timeout(200)
        check('site shows bookings paused and blocks the button', 'paused' in (await site.inner_text('#slots')).lower() and await site.evaluate("document.querySelector('#reserveForm button[type=submit]').disabled"))
        await site.screenshot(path=S+'/v2-site-paused.png')
        await dash.click('.qcard[data-q="bookingsPaused"] .switch'); await dash.wait_for_timeout(400)

        # ---- close a day ----
        await dash.click('[data-view="tables"]'); await dash.wait_for_timeout(200)
        await dash.click(f'#dayStrip [data-day="{tomorrow}"]'); await dash.wait_for_timeout(200)
        await dash.click('.closedrow .switch'); await dash.wait_for_timeout(400)
        check('closing a day saves it', tomorrow in (await db())['settings']['main']['closedDays'])
        await site.evaluate(f"(()=>{{const i=document.getElementById('r-date');i.value='{tomorrow}';i.dispatchEvent(new Event('change'))}})()"); await site.wait_for_timeout(300)
        check('site offers no times on the closed day', 'closed' in (await site.inner_text('#slots')).lower())
        await dash.click('.closedrow .switch'); await dash.wait_for_timeout(300)

        # ---- staff adds a walk-in / phone booking ----
        await dash.click('[data-panel="tables"] [data-new-res]'); await dash.wait_for_timeout(200)
        await dash.fill('#rfName','Phone Booking'); await dash.fill('#rfPhone','033 00 000 00'); await dash.fill('#rfTable','5')
        await dash.evaluate(f"(()=>{{const i=document.getElementById('rfDate');i.value='{tomorrow}';i.dispatchEvent(new Event('change'))}})()")
        await dash.fill('#rfGuests','25'); await dash.dispatch_event('#rfGuests','input'); await dash.wait_for_timeout(100)
        check('over-capacity warning shows', await dash.is_visible('#rfWarn'))
        await dash.screenshot(path=S+'/v2-add-booking.png')
        await dash.fill('#rfGuests','6'); await dash.dispatch_event('#rfGuests','input')
        t0=await dash.evaluate("document.getElementById('rfTime').value")
        await dash.click('#rfSave'); await dash.wait_for_timeout(500)
        d=await db(); pb=[r for r in d['reservations'].values() if r['name']=='Phone Booking']
        check('staff booking saved as confirmed, with table, counted in the half hour', len(pb)==1 and pb[0]['status']=='confirmed' and pb[0]['source']=='staff' and pb[0]['table']=='5' and d['slots'][tomorrow]['g'].get(t0,0)>=6)
        # edit: move it 30 min later and to 4 guests
        rid=[k for k,r in d['reservations'].items() if r['name']=='Phone Booking'][0]
        await dash.click(f'#resList [data-edit-res="{rid}"]'); await dash.wait_for_timeout(200)
        t1=str(int(t0)+30)
        await dash.select_option('#rfTime', t1); await dash.fill('#rfGuests','4'); await dash.click('#rfSave'); await dash.wait_for_timeout(500)
        d=await db(); r=d['reservations'][rid]; g=d['slots'][tomorrow]['g']
        check('editing moves the guests to the new half hour', r['time']==int(t1) and r['guests']==4 and g.get(t1,0)>=4 and g.get(t0,0)==(2 if t0==first else 0))
        await dash.screenshot(path=S+'/v2-tables.png', full_page=True)

        # ---- reports ----
        await dash.click('[data-view="orders"]')
        for st in ['preparing','ready','collected']:
            await dash.click(f'#colNew .card [data-to="{st}"], #colPrep .card [data-to="{st}"], #colReady .card [data-to="{st}"]'); await dash.wait_for_timeout(300)
        # a customer without their code: staff check name and phone, then hand over with two taps
        check('handover asks for the code', await dash.is_visible('#handDlg'))
        await dash.click('#handDlg .hand-no summary'); await dash.wait_for_timeout(100)
        check('no-code path shows the name and phone to check', 'compare with' in await dash.inner_text('#handBody'))
        await dash.click('#handAnyway'); await dash.wait_for_timeout(100)
        check('first tap on "without the code" only arms it', await dash.is_visible('#handDlg'))
        await dash.click('#handAnyway'); await dash.wait_for_timeout(400)
        dbs=json.loads(await dash.evaluate("localStorage.getItem('mockDB')"))
        got=[v for v in dbs['orders'].values() if v['status']=='collected']
        check('handed over without code is recorded on the order', not await dash.is_visible('#handDlg') and got and got[0].get('handoff')=='nocode')
        today=await site.evaluate("document.getElementById('r-date').min")
        await book('Today Guest', today); await dash.bring_to_front(); await dash.wait_for_timeout(500)
        if await dash.is_visible('#alarm'): await dash.click('#alarmAct'); await dash.wait_for_timeout(300)
        await dash.click('[data-view="reports"]'); await dash.wait_for_timeout(600)
        rep=await dash.inner_text('#repTiles')
        check('numbers show the collected sale (86 000 Ar)', '86' in rep and '000' in rep)
        async with dash.expect_download() as dl:
            await dash.click('#repCsv')
        f=await dl.value; path=await f.path(); csv=open(path,encoding='utf-8-sig').read()
        check('CSV download has orders and bookings', 'commande;' in csv and 'reservation;' in csv and 'Hery Secret' in csv)
        await dash.screenshot(path=S+'/v2-reports.png')

        # ---- one shared team login, limited to the day-to-day ----
        await dash.click('[data-view="team"]'); await dash.click('#addShared'); await dash.wait_for_timeout(400)
        st=(await db()).get('staff',{})
        check('owner adds the shared team login as Team', st.get('aisuparfaiteria+staff@gmail.com',{}).get('role')=='staff')
        await dash.evaluate("document.querySelector('.top-signout').click()"); await dash.wait_for_timeout(300)
        await dash.click('[data-mode="team"]'); await dash.fill('#lPass','teampass'); await dash.click('#lBtn'); await dash.wait_for_timeout(800)
        if await dash.is_visible('#startDlg'): await dash.click('#startGo'); await dash.wait_for_timeout(200)
        check('team signs in with the password only', await dash.is_visible('#shell') and (await dash.evaluate("JSON.parse(localStorage.getItem('mockAuthUser')).email"))=='aisuparfaiteria+staff@gmail.com')
        hidden=await dash.evaluate("['reports','settings','team'].every(v=>{const b=document.querySelector(`.tabs [data-view=${v}]`);return getComputedStyle(b).display==='none'||b.hidden})")
        check('team sees no Numbers, Settings or Team tabs', hidden)
        check('team sees no sales tile', await dash.is_hidden('#tileSales'))
        check('team cannot flip the online switches', await dash.evaluate("[...document.querySelectorAll('input[data-open]')].every(i=>i.disabled)"))
        await dash.evaluate("document.querySelector('[data-go=\"settings\"]') && document.querySelector('[data-go=\"settings\"]').click()"); await dash.wait_for_timeout(200)
        check('a link to Settings lands on Today instead', await dash.is_visible('[data-panel="today"]') and await dash.is_hidden('[data-panel="settings"]'))
        await dash.click('[data-view="menu"]'); await dash.click('.mrow[data-sold="p3"]'); await dash.wait_for_timeout(400)
        check('team can still mark items sold out', (await db())['settings']['main']['soldOut'].get('p3') is True)
        await dash.click('#alertBtn'); await dash.wait_for_timeout(200)
        check('bell opens this device\'s alert settings for the team', await dash.is_visible('#deviceDlg') and await dash.is_visible('#soundIn'))
        await dash.click('#deviceDlg [data-close]')
        await dash.screenshot(path=S+'/v3-team-today.png')
        await dash.evaluate("document.querySelector('.top-signout').click()"); await dash.wait_for_timeout(300)
        await dash.click('[data-mode="manager"]'); await dash.fill('#lEmail','aisuparfaiteria@gmail.com'); await dash.fill('#lPass','secret'); await dash.click('#lBtn'); await dash.wait_for_timeout(800)
        if await dash.is_visible('#startDlg'): await dash.click('#startGo'); await dash.wait_for_timeout(200)
        await dash.click('[data-view="team"]'); await dash.select_option('select[data-role="aisuparfaiteria+staff@gmail.com"]','manager'); await dash.wait_for_timeout(400)
        check('owner can promote someone to Manager', (await db())['staff']['aisuparfaiteria+staff@gmail.com']['role']=='manager')
        await dash.screenshot(path=S+'/v3-team-tab.png')
        await dash.select_option('select[data-role="aisuparfaiteria+staff@gmail.com"]','staff'); await dash.wait_for_timeout(300)

        # ---- phone-sized dashboard ----
        await dash.set_viewport_size({'width':390,'height':844}); await dash.click('[data-view="today"]'); await dash.wait_for_timeout(300)
        check('no sideways scroll on a phone', await dash.evaluate('document.documentElement.scrollWidth')<=390)
        await dash.screenshot(path=S+'/v2-mobile-today.png', full_page=True)
        await dash.click('[data-view="orders"]'); await dash.screenshot(path=S+'/v2-mobile-orders.png')
        await book('Late Night', tomorrow); await dash.bring_to_front(); await dash.wait_for_timeout(600)
        await dash.screenshot(path=S+'/v2-mobile-alarm.png')
        check('alarm fills the phone screen', await dash.evaluate("(()=>{const r=document.getElementById('alarm').getBoundingClientRect();return r.width>=389&&r.height>=840})()"))
        check('nothing blocked by the security policy (CSP)', not csp)
        if csp: print('   CSP:', csp[:5])
        check('no script errors on any page', not errs)
        print('page errors:', errs or 'none')
        print(f'{sum(results)}/{len(results)} passed')
        await b.close()
asyncio.run(main())
