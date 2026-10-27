"""Security checks: hostile data can't run code on the staff dashboard or a customer's order page,
the security policy blocks injected scripts, bots and repeat submissions are turned away, baskets stay
within what the database accepts, spreadsheet exports can't carry formulas, and sign-in persistence
follows the "stay signed in" choice. Run with the site served by dev/serve.py."""
import asyncio, json, os, datetime as _dt
from playwright.async_api import async_playwright

M = os.path.dirname(os.path.abspath(__file__)) + '/mock/'
BASE = 'http://localhost:8765/'
results = []

def check(label, cond):
    results.append(bool(cond)); print(('PASS ' if cond else 'FAIL ') + label)

def cafe_open_time():
    tz = _dt.timezone(_dt.timedelta(hours=3)); now = _dt.datetime.now(tz)
    d = now + _dt.timedelta(days=(2 - now.weekday()) % 7 or 7)
    return d.replace(hour=10, minute=0, second=0, microsecond=0)

async def route(r):
    name = r.request.url.rsplit('/', 1)[1]
    await r.fulfill(status=200, headers={'content-type': 'application/javascript', 'access-control-allow-origin': '*'}, body=open(M + name).read())

EVIL = '<img src=x onerror="window.__pwned=1">'

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={'width': 1280, 'height': 860})
        await ctx.clock.install(time=cafe_open_time())
        await ctx.route('https://www.gstatic.com/firebasejs/**', route)
        await ctx.route('https://ntfy.sh/**', lambda r: r.fulfill(status=200, body='{}'))
        csp = []; ctx.on('console', lambda m: ('Content Security Policy' in m.text) and csp.append(m.text[:160]))
        await ctx.add_init_script("if(!localStorage.getItem('secInit')){localStorage.clear();localStorage.setItem('aisu-lang','\"en\"');localStorage.setItem('aisu-staff-lang','\"en\"');localStorage.setItem('secInit','1')}")
        site = await ctx.new_page(); errs = []; site.on('pageerror', lambda e: errs.append(str(e)))
        await site.set_viewport_size({'width': 390, 'height': 844})
        await site.goto(BASE); await site.wait_for_timeout(800)
        today = await site.evaluate("document.getElementById('r-date').min")

        # ---- hostile records written straight into the database (bypassing the website) ----
        await site.evaluate(f"""(()=>{{const db=JSON.parse(localStorage.getItem('mockDB')||'{{}}');
          db.orders=db.orders||{{}}; db.pickups=db.pickups||{{}};
          db.orders.evil={{ref:'AISU-EVIL',items:[{{k:'p1',n:{json.dumps(EVIL)},q:{json.dumps(EVIL)}}}],pickupDay:'{today}',pickupTime:630,
            name:{json.dumps(EVIL)},phone:{json.dumps(EVIL)},notes:{json.dumps(EVIL)},lang:'fr',status:'ready',createdAt:{{__ts:Date.now()}},
            track:'EvilTrackKey0000000000000',code:{json.dumps(EVIL)}}};
          db.pickups['EvilTrackKey0000000000000']={{order:'evil',ref:{json.dumps(EVIL)},code:{json.dumps(EVIL)},status:'ready',pickupDay:'{today}',pickupTime:630,
            items:[{{k:{json.dumps(EVIL)},n:{json.dumps(EVIL)},q:{json.dumps(EVIL)}}}],lang:'fr',createdAt:{{__ts:Date.now()}}}};
          localStorage.setItem('mockDB',JSON.stringify(db));}})()""")
        dash = await ctx.new_page(); dash.on('pageerror', lambda e: errs.append('dash: ' + str(e)))
        await dash.goto(BASE + 'staff/'); await dash.wait_for_timeout(500)
        check('team sign-in stays signed in on the counter device by default', await dash.is_checked('#lRemember'))
        await dash.click('[data-mode="manager"]')
        check('manager sign-in does not stay signed in by default', not await dash.is_checked('#lRemember'))
        await dash.fill('#lEmail', 'aisuparfaiteria@gmail.com'); await dash.fill('#lPass', 'x'); await dash.click('#lBtn'); await dash.wait_for_timeout(700)
        check('…and the session ends when the browser closes', await dash.evaluate('window.__authPersistence') == 'SESSION')
        await dash.click('#startQuiet'); await dash.wait_for_timeout(200)
        await dash.click('[data-view="orders"]'); await dash.wait_for_timeout(400)
        ready = await dash.inner_html('#colReady')
        check('hostile order shows as plain text on the dashboard', '&lt;img' in ready and not await dash.evaluate("!!document.querySelector('#colReady img')"))
        await dash.click('#colReady .card [data-to="collected"]'); await dash.wait_for_timeout(300)
        check('…and in the handover dialog', not await dash.evaluate("!!document.querySelector('#handBody img')"))
        await dash.click('#handDlg [data-close]')
        await dash.click('#searchBtn'); await dash.fill('#searchIn', 'evil'); await dash.wait_for_timeout(400)
        check('…and in search results', not await dash.evaluate("!!document.querySelector('#results img')"))
        await dash.click('#searchDlg [data-close]')
        check('no hostile code ran on the dashboard', not await dash.evaluate('window.__pwned||0'))
        # the CSV export neutralises formulas
        await site.evaluate("""(()=>{const db=JSON.parse(localStorage.getItem('mockDB'));db.orders.evil.status='collected';db.orders.evil.name='=HYPERLINK("http://x","click")';localStorage.setItem('mockDB',JSON.stringify(db));})()""")
        await dash.click('[data-view="reports"]'); await dash.wait_for_timeout(600)
        async with dash.expect_download() as dl:
            await dash.click('#repCsv')
        f = await dl.value; csv = open(await f.path(), encoding='utf-8-sig').read()
        check('CSV export turns a formula into plain text', "'=HYPERLINK" in csv and ';=HYPERLINK' not in csv)

        # a crafted order link can't run code on a customer's phone
        await site.goto(BASE + '#commande=EvilTrackKey0000000000000'); await site.wait_for_timeout(900)
        check('crafted order link shows hostile text as plain text', await site.is_visible('#cart') and not await site.evaluate("!!document.querySelector('#cartBody img:not(.parfi-say)')") and not await site.evaluate('window.__pwned||0'))
        await site.click('#closeCart')
        await site.evaluate("localStorage.removeItem('aisu-orders')"); await site.goto(BASE); await site.wait_for_timeout(700)

        # ---- the security policy blocks injected scripts even if one slipped through ----
        await site.evaluate("""()=>{ const s=document.createElement('script'); s.textContent='window.__pwned=2'; document.body.appendChild(s);
          document.body.insertAdjacentHTML('beforeend','<img src=x onerror="window.__pwned=3">'); }"""); await site.wait_for_timeout(300)
        check('security policy blocks injected scripts and handlers', not await site.evaluate('window.__pwned||0') and len(csp) >= 2)
        csp.clear()

        # ---- basket limits match the database rules ----
        await site.evaluate("localStorage.setItem('aisu-cart', JSON.stringify([{key:'p1',name:'x',price:1,qty:999},{key:'nope',name:'bad',price:1,qty:1},{key:'p2',name:'Bouquet Fraise',price:1,qty:'abc'}]))")
        await site.reload(); await site.wait_for_timeout(700)
        cart = await site.evaluate("JSON.parse(localStorage.getItem('aisu-cart'))")
        check('a damaged saved basket is repaired (unknown items dropped, quantities 1–50, menu prices)',
              [c['key'] for c in cart] == ['p1', 'p2'] and cart[0]['qty'] == 50 and cart[1]['qty'] == 1 and cart[0]['price'] == 38000)
        await site.evaluate("document.querySelector('[data-padd=\"0\"]').click()"); await site.wait_for_timeout(200)
        check('adding past 50 of one item is refused with a message', (await site.evaluate("JSON.parse(localStorage.getItem('aisu-cart'))"))[0]['qty'] == 50 and 'most we can take' in await site.inner_text('#toastText'))

        # ---- bots and repeat orders ----
        await site.evaluate("document.querySelector('.tabbar .tb-order').click()"); await site.wait_for_timeout(200)
        await site.click('#toCheckout'); await site.fill('#c-name', 'Bot‮NAME'); await site.fill('#c-phone', '032 11 222 33<b>')
        await site.evaluate("document.querySelector('#checkoutForm .hp-in').value='http://spam.example'")
        n0 = len((json.loads(await site.evaluate("localStorage.getItem('mockDB')")) or {}).get('orders', {}))
        await site.click('#placeOrder'); await site.wait_for_timeout(500)
        n1 = len(json.loads(await site.evaluate("localStorage.getItem('mockDB')")).get('orders', {}))
        check('a form with the hidden bot field filled is not sent', n1 == n0)
        await site.evaluate("document.querySelector('#checkoutForm .hp-in').value=''")
        await site.click('#placeOrder'); await site.wait_for_timeout(600)
        db = json.loads(await site.evaluate("localStorage.getItem('mockDB')"))
        mine = [o for o in db['orders'].values() if o['ref'] != 'AISU-EVIL']
        check('typed name loses hidden direction characters, phone keeps only phone characters',
              len(mine) == 1 and mine[0]['name'] == 'BotNAME' and mine[0]['phone'] == '032 11 222 33')
        for i in range(2):
            await site.click('#closeCart'); await site.evaluate("document.querySelector('[data-padd=\"1\"]').click(); document.querySelector('.tabbar .tb-order').click()"); await site.wait_for_timeout(200)
            await site.click('#toCheckout'); await site.click('#placeOrder'); await site.wait_for_timeout(500)
        await site.click('#closeCart'); await site.evaluate("document.querySelector('[data-padd=\"1\"]').click(); document.querySelector('.tabbar .tb-order').click()"); await site.wait_for_timeout(200)
        await site.click('#toCheckout'); await site.click('#placeOrder'); await site.wait_for_timeout(400)
        db = json.loads(await site.evaluate("localStorage.getItem('mockDB')"))
        check('a 4th order while 3 are open on the same phone asks the customer to call', len([o for o in db['orders'].values() if o['ref'] != 'AISU-EVIL']) == 3 and 'call us' in await site.inner_text('#orderErr'))
        await site.click('#closeCart')

        # ---- privacy notice and "clear my details" ----
        await site.evaluate("document.querySelector('footer [data-privacy]').click()"); await site.wait_for_timeout(200)
        txt = await site.inner_text('#privBody')
        check('privacy notice says what is collected, why, who sees it, how long, and how to ask', all(w.lower() in txt.lower() for w in ['What we collect', 'Why', 'Who can see it', 'Twelve months', '+261 36 08 266 88']))
        await site.click('#forgetMe'); await site.wait_for_timeout(200)
        left = await site.evaluate("['aisu-contact','aisu-orders','aisu-cart'].filter(k=>localStorage.getItem(k) && localStorage.getItem(k)!=='[]')")
        check('"clear my details" removes name, phone, orders and basket from the phone', not left and await site.is_hidden('#trackChip'))

        # ---- the order chip doesn't linger: gone an hour after the pickup deadline, or when hidden ----
        c2 = await b.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
        await c2.clock.install(time=cafe_open_time())
        await c2.route('https://www.gstatic.com/firebasejs/**', route)
        await c2.add_init_script("if(!localStorage.getItem('c2')){localStorage.clear();localStorage.setItem('aisu-lang','\"en\"');localStorage.setItem('c2','1')}")
        s2 = await c2.new_page(); await s2.goto(BASE); await s2.wait_for_timeout(700)
        async def order():
            await s2.evaluate("document.querySelector('[data-padd=\"0\"]').click(); document.querySelector('.tabbar .tb-order').click()"); await s2.wait_for_timeout(200)
            await s2.click('#toCheckout'); await s2.fill('#c-name', 'Hery'); await s2.fill('#c-phone', '032 11 222 33'); await s2.click('#placeOrder'); await s2.wait_for_timeout(600)
            await s2.click('#closeCart'); await s2.wait_for_timeout(200)
        await order()
        check('order chip shows after ordering', await s2.is_visible('#trackChip'))
        await s2.clock.fast_forward('01:30:00'); await s2.wait_for_timeout(300)   # pickup 10:30, deadline 11:00, now 11:30
        check('after the deadline the chip says to call', await s2.is_visible('#trackChip') and 'call us' in await s2.inner_text('#trackChip'))
        await s2.clock.fast_forward('00:45:00'); await s2.wait_for_timeout(300)   # now 12:15, more than an hour past
        check('an hour after the deadline the chip is gone', await s2.is_hidden('#trackChip'))
        await s2.reload(); await s2.wait_for_timeout(600)
        check('…and stays gone after reopening the site', await s2.is_hidden('#trackChip'))
        await order()
        await s2.click('#trackChip .tc-x'); await s2.wait_for_timeout(200)
        await s2.reload(); await s2.wait_for_timeout(600)
        check('the × hides the chip on this phone for good', await s2.is_hidden('#trackChip'))
        await c2.close()

        check('nothing legitimate was blocked by the security policy', not csp)
        if csp: print('   CSP:', csp[:4])
        check('no script errors', not errs)
        if errs: print('   errors:', errs[:4])
        print(f'{sum(results)}/{len(results)} passed')
        await b.close()

asyncio.run(main())
