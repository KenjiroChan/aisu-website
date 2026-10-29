import asyncio, sys, json
from playwright.async_api import async_playwright
O='/tmp/claude-0/-home-claude/af5c3a5d-3681-5814-aa7b-f88523c0fb1e/scratchpad/menu/'
# steps: list of [device, label, js-before-shot or ''] ; page = sys.argv[1]
page=sys.argv[1]; steps=json.loads(sys.argv[2])
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for dev in ['phone','desk']:
      kw=dict(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,device_scale_factor=2) if dev=='phone' else dict(viewport={'width':1280,'height':860},device_scale_factor=1)
      c=await b.new_context(**kw); pg=await c.new_page(); errs=[]; pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: m.type=='error' and errs.append(m.text))
      await pg.goto('http://localhost:8765/dev/proposals/'+page); await pg.wait_for_timeout(700)
      for d,label,js in steps:
        if d!=dev: continue
        if js: await pg.evaluate(js); await pg.wait_for_timeout(450)
        await pg.screenshot(path=O+f'{page.split(".")[0]}-{dev}-{label}.png')
      print(dev,'errors',errs,'scrollW',await pg.evaluate('document.documentElement.scrollWidth'))
      await c.close()
    await b.close()
asyncio.run(main())
