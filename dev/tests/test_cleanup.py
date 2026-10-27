"""Deleting test or false orders and bookings: only the owner sees the Delete buttons and the bulk
tool in Settings; deleting an order also removes its tracking record (so the customer's chip goes),
and deleting a booking gives its guests back to the half hour. Run with the site served by dev/serve.py."""
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
    await r.fulfill(status=200, headers={'content-type': 'application/javascript', 'access-control-allow-origin': '*'}, body=open(M + r.request.url.rsplit('/', 1)[1]).read())

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={'width': 1280, 'height': 860})
        await ctx.clock.install(time=cafe_open_time())
        await ctx.route('https://www.gstatic.com/firebasejs/**', route)
        await ctx.route('https://ntfy.sh/**', lambda r: r.fulfill(status=200, body='{}'))
        await ctx.add_init_script("if(!localStorage.getItem('clInit')){localStorage.clear();localStorage.setItem('aisu-lang','\"en\"');localStorage.setItem('aisu-staff-lang','\"en\"');localStorage.setItem('clInit','1')}")
        errs = []
        site = await ctx.new_page(); site.on('pageerror', lambda e: errs.append('site: ' + str(e)))
        await site.set_viewport_size({'width': 390, 'height': 844})
        await site.goto(BASE); await site.wait_for_timeout(800)
        db = lambda: site.evaluate("JSON.parse(localStorage.getItem('mockDB')||'{}')")

        async def order(name):
            await site.evaluate("document.querySelector('[data-padd=\"0\"]').click(); document.querySelector('.tabbar .tb-order').click()"); await site.wait_for_timeout(200)
            await site.click('#toCheckout'); await site.fill('#c-name', name); await site.fill('#c-phone', '032 11 222 33'); await site.click('#placeOrder'); await site.wait_for_timeout(600)
            await site.click('#closeCart'); await site.wait_for_timeout(200)
        await order('Real Customer')
        await order('Test Kenjiro')
        tomorrow = await site.evaluate("(()=>{const i=document.getElementById('r-date');const d=new Date(i.value);d.setDate(d.getDate()+1);return d.toISOString().slice(0,10)})()")
        await site.evaluate(f"(()=>{{const i=document.getElementById('r-date');i.value='{tomorrow}';i.dispatchEvent(new Event('change'))}})()"); await site.wait_for_timeout(250)
        slot = await site.evaluate("document.querySelector('#slots .opt:not([disabled])').dataset.slot")
        await site.evaluate(f"document.querySelector('#slots [data-slot=\"{slot}\"]').click()")
        await site.fill('#r-name', 'test booking'); await site.fill('#r-phone', '034 12 345 67')
        await site.evaluate("document.querySelector('#reserveForm button[type=submit]').click()"); await site.wait_for_timeout(600)
        d = await db()
        check('two orders and one booking were placed', len(d.get('orders', {})) == 2 and len(d.get('reservations', {})) == 1 and d['slots'][tomorrow]['g'][slot] == 2)

        # ---- a manager doesn't get any delete options ----
        await site.evaluate("(()=>{const db=JSON.parse(localStorage.getItem('mockDB'));db.staff=db.staff||{};db.staff['mialy@example.com']={role:'manager'};localStorage.setItem('mockDB',JSON.stringify(db))})()")
        dash = await ctx.new_page(); dash.on('pageerror', lambda e: errs.append('dash: ' + str(e)))
        await dash.goto(BASE + 'staff/'); await dash.wait_for_timeout(500)
        await dash.click('[data-mode="manager"]'); await dash.fill('#lEmail', 'mialy@example.com'); await dash.fill('#lPass', 'x'); await dash.click('#lBtn'); await dash.wait_for_timeout(700)
        await dash.click('#startQuiet'); await dash.wait_for_timeout(200)
        if await dash.is_visible('#alarm'): await dash.click('#alarmSeen'); await dash.wait_for_timeout(200)
        await dash.click('[data-view="orders"]'); await dash.wait_for_timeout(300)
        no_btn = await dash.evaluate("!document.querySelector('[data-del-order],[data-del-res]')")
        await dash.click('[data-view="settings"]'); await dash.wait_for_timeout(200)
        check('a manager sees no Delete buttons and no bulk delete tool', no_btn and await dash.is_hidden('#purgePanel'))
        await dash.evaluate("document.querySelector('#shell [data-signout]').click()"); await dash.wait_for_timeout(300)

        # ---- the owner deletes one false order from its card ----
        await dash.click('[data-mode="manager"]'); await dash.fill('#lEmail', 'aisuparfaiteria@gmail.com'); await dash.fill('#lPass', 'x'); await dash.click('#lBtn'); await dash.wait_for_timeout(700)
        if await dash.is_visible('#startDlg'): await dash.click('#startQuiet'); await dash.wait_for_timeout(200)
        if await dash.is_visible('#alarm'): await dash.click('#alarmSeen'); await dash.wait_for_timeout(200)
        await dash.click('[data-view="orders"]'); await dash.wait_for_timeout(300)
        d = await db(); test_id = [k for k, v in d['orders'].items() if v['name'] == 'Test Kenjiro'][0]; track = d['orders'][test_id]['track']
        btn = f'[data-del-order="{test_id}"]'
        await dash.screenshot(path=os.path.dirname(os.path.abspath(__file__)) + '/out/cleanup-card.png')
        check('the owner sees Delete on order cards', await dash.is_visible(btn))
        await dash.click(btn); await dash.wait_for_timeout(200)
        check('the first tap only asks to confirm', test_id in (await db())['orders'] and 'Confirm' in await dash.inner_text(btn))
        await dash.click(btn); await dash.wait_for_timeout(500)
        d = await db()
        check('the second tap deletes the order and its tracking record', test_id not in d['orders'] and track not in d.get('pickups', {}) and len(d['orders']) == 1)
        check('the deleted order leaves the board', 'Test Kenjiro' not in await dash.inner_text('[data-panel="orders"]') and 'Real Customer' in await dash.inner_text('[data-panel="orders"]'))
        await site.bring_to_front(); await site.reload(); await site.wait_for_timeout(900)
        mine = await site.evaluate("JSON.parse(localStorage.getItem('aisu-orders'))")
        gone = [o for o in mine if o['track'] == track]
        check("the customer's phone stops showing the deleted order", gone and gone[0]['status'] == 'deleted' and 'Test Kenjiro' not in await site.inner_text('#trackChip'))
        await dash.bring_to_front()

        # ---- the owner bulk-deletes test entries from Settings ----
        await dash.click('[data-view="settings"]'); await dash.wait_for_timeout(300)
        check('the owner sees the bulk delete tool in Settings', await dash.is_visible('#purgePanel'))
        await dash.click('#purgeOpen'); await dash.wait_for_timeout(600)
        check('it lists the latest orders and bookings', await dash.evaluate("document.querySelectorAll('#purgeList .prow').length") == 2)
        await dash.fill('#purgeIn', 'test'); await dash.wait_for_timeout(200)
        check('filtering by "test" shows only the test booking', await dash.evaluate("document.querySelectorAll('#purgeList .prow').length") == 1 and 'test booking' in await dash.inner_text('#purgeList'))
        await dash.click('#purgeAll'); await dash.wait_for_timeout(100)
        check('ticking shows the count on the button', 'Delete (1)' in await dash.inner_text('#purgeGo'))
        await dash.click('#purgeGo'); await dash.wait_for_timeout(150)
        check('the first tap only asks to confirm', len((await db()).get('reservations', {})) == 1 and 'Confirm' in await dash.inner_text('#purgeGo'))
        await dash.screenshot(path=os.path.dirname(os.path.abspath(__file__)) + '/out/cleanup-dialog.png')
        await dash.click('#purgeGo'); await dash.wait_for_timeout(600)
        d = await db()
        check('the booking is deleted and its two places are given back', len(d.get('reservations', {})) == 0 and d['slots'][tomorrow]['g'][slot] == 0)
        check('the real order is untouched', len(d['orders']) == 1 and list(d['orders'].values())[0]['name'] == 'Real Customer')
        check('a confirmation says how many were deleted', '1 deleted' in await dash.inner_text('#purgeMsg'))

        check('no script errors', not errs)
        if errs: print('   ', errs[:3])
        print(f'{sum(results)}/{len(results)} passed')
        await b.close()

os.makedirs(os.path.dirname(os.path.abspath(__file__)) + '/out', exist_ok=True)
asyncio.run(main())
