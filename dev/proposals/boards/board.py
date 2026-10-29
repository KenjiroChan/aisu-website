import asyncio
from playwright.async_api import async_playwright
D='/tmp/claude-0/-home-claude/af5c3a5d-3681-5814-aa7b-f88523c0fb1e/scratchpad/menu/'
F='/home/claude/aisu-cafe/fonts/'
css=f"""@font-face{{font-family:C;src:url(file://{F}cormorant-garamond-latin-600-normal.woff2)}}
@font-face{{font-family:O;src:url(file://{F}outfit-latin-400-normal.woff2)}}@font-face{{font-family:O;font-weight:600;src:url(file://{F}outfit-latin-600-normal.woff2)}}
body{{margin:0;background:#FFF3F2;color:#C9195C;font-family:O;padding:40px}}
h1{{font-family:C;font-size:52px;margin:0 0 6px;font-weight:600}} .lead{{margin:0 0 34px;font-size:19px;color:#94456A;max-width:1100px}}
.row{{margin-bottom:44px}} .row h2{{font-family:C;font-size:34px;margin:0 0 4px;font-weight:600}} .row p{{margin:0 0 14px;font-size:17px;color:#94456A;max-width:1200px}}
.shots{{display:flex;gap:18px;align-items:flex-start}} .shots img{{border-radius:14px;box-shadow:0 0 0 1.5px rgba(201,25,92,.25);background:#fff}}
.tag{{display:inline-block;background:#C9195C;color:#FFF9F9;border-radius:999px;padding:3px 12px;font-size:14px;font-weight:600;margin-right:8px;vertical-align:middle;font-family:O}}
.tag.now{{background:#94456A}}"""
def row(tag,title,text,imgs,w):
  return f'<div class="row"><h2><span class="tag {"now" if tag=="Now" else ""}">{tag}</span>{title}</h2><p>{text}</p><div class="shots">'+''.join(f'<img src="file://{D}{i}" width="{w}">' for i in imgs)+'</div></div>'
phone = f"<style>{css}</style><h1>Menu and courses, on a phone</h1><p class='lead'>Three ways to fix it. A and B are two different ideas for the drinks, so pick one of those; the courses layout works with either.</p>" + \
 row('Now','What customers get today','Drinks sit behind three tabs and then folded groups, the third tab runs off the screen, and the prices float far away from the words Hot and Iced.',['now-phone-0.png','now-phone-1.png','now-phone-2.png','now-phone-3.png'],300) + \
 row('A','The whole menu on one long page','Everything is open. A sticky bar with search and group chips follows you down and lights up the group you are in. Each price is a button that says what it is for: Hot, Iced, Glass or Pitcher.',['menu-a-phone-top.png','menu-a-phone-mid.png','menu-a-phone-search.png'],330) + \
 row('B','Pick a category, then a drink','Seven tiles to start, then a clean list with the prices. Tapping a drink opens a sheet where you choose hot or iced and how many, and the button shows the total.',['menu-b-phone-tiles.png','menu-b-phone-list.png','menu-b-phone-sheet.png'],330) + \
 row('Courses','Brunch in three steps, tea as a switch','Brunch reads like a set menu: what comes first, choose one main, then extras with their prices. Afternoon tea gets a three-way switch with the price on it, and the whole tray is shown, nothing folded.',['courses-phone-brunch.png','courses-phone-brunch2.png','courses-phone-tea.png'],330)
desk = f"<style>{css}</style><h1>Menu and courses, on a computer</h1><p class='lead'>The same three ideas on a wide screen.</p>" + \
 row('Now','What customers get today','You see one tab of drinks at a time, and the brunch and teas are folded away further down the page.',['now-desk-0.png'],900) + \
 row('A','The whole menu on one long page','A group index on the left that follows you, two columns of drinks, labelled price buttons.',['menu-a-desk-top.png'],900) + \
 row('B','Pick a category, then a drink','Category tiles across the top, drink cards below, and a panel on the right to choose the option and quantity.',['menu-b-desk-top.png'],900) + \
 row('Courses','Brunch in three steps, the three teas side by side','The teas finally sit next to each other, so you can compare what is on each tray and what drink is included.',['courses-desk-brunch.png','courses-desk-tea.png'],760)
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for name,html,w in [('board-phone',phone,1480),('board-desktop',desk,1620)]:
      pg=await b.new_page(viewport={'width':w,'height':900}); open(D+name+'.html','w').write(html)
      await pg.goto('file://'+D+name+'.html'); await pg.wait_for_timeout(600)
      await pg.screenshot(path=D+name+'.png',full_page=True)
    await b.close()
asyncio.run(main())
