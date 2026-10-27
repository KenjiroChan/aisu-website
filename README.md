# AISU Café & Parfaiteria

The AISU website in French, English and Malagasy: the parfait collection, the full drinks menu, brunch and afternoon tea, pickup orders and table bookings, plus a private staff dashboard (also in French, English and Malagasy).

## What's where

| Path | What it is |
| --- | --- |
| `index.html` | The public website |
| `staff/` | The staff dashboard (sign-in required): today, orders, bookings, sold-out items, numbers, settings, team. `sw.js` and `manifest.webmanifest` let it show notifications and be added to a phone's home screen |
| `assets/menu-data.js` | Menu, prices and opening hours, shared by the site and the dashboard |
| `assets/firebase-config.js` | Which Firebase project the site uses (not a secret) |
| `assets/backend.js` | Saves bookings and orders to the database |
| `firestore.rules` | Who can read and write what; paste into Firebase console → Firestore Database → Rules |
| `img/`, `fonts/` | Parfait illustrations and web fonts |

## Changing prices or hours

Edit `assets/menu-data.js`. The website and the dashboard both read it, so totals on the dashboard always match the menu.

## Hosting

Cloudflare Pages publishes this repository automatically on every push to `main`. There is no build step.

The page and `assets/` are served with `Cache-Control: no-cache` (see `_headers`), so phones always check for a newer copy. The script tags in `index.html` and `staff/index.html` also carry a `?v=` version; change it whenever a script in `assets/` changes, so phones that cached an older copy fetch the new one straight away.

## Staff alerts

New orders and bookings take over the dashboard screen and ring until someone answers, on whichever tab is open. Browsers keep a freshly opened page silent until it is touched, so the dashboard opens with a "Start service" screen that takes that one tap.

## Pickup orders

Each online order gets a 4-digit **pickup code** and its own live page on the website, which the customer keeps open or reopens later (the order also shows in a chip at the bottom of the site on that phone until it's collected or cancelled, an hour after its pickup deadline, or until the customer closes it with ×; the page link can be sent to whoever collects). The page shows the code, the pickup time, the latest time we hold the order (`PICKUP_HOLD`, 30 minutes after the pickup time but never past closing, in `assets/menu-data.js`), what to know about iced items and paying at the counter, and the status as staff move it: received, preparing, ready, collected. It needs no e-mail, SMS or WhatsApp.

The page reads a small record, `pickups/{key}`, named by a long random key and holding only the reference, code, status, pickup time and item names: never a name or phone number. Staff see on each ready order whether the customer has seen that it's ready, so they know when to call.

At the counter, **Récupérée** (Collected) first asks for the customer's code; typing a code in "Un client vient chercher sa commande ?" finds the order directly. A customer without the code can still be served after staff check their name and phone, and the order then records that it was handed over without the code. Iced items (parfaits, palettes, iced drinks, juices, smoothies, affogatos; see `isCold` in `assets/menu-data.js`) carry a snowflake on both sides.

## Who sees what

- **Owner** (`aisuparfaiteria@gmail.com`): everything, including the Team tab.
- **Managers** (role Manager in the Team tab): everything except Team.
- **Team** (role Team): Today, Orders, Bookings and Menu (sold out). No Numbers, no Settings, no sales figure, and the online switches are locked.

The counter team shares one login, `aisuparfaiteria+staff@gmail.com`. Gmail delivers "+staff" mail to the owner's inbox, so no new mailbox is needed. Create that user once in Firebase (Authentication, Users), add it in the Team tab as Team, and staff sign in by choosing **Équipe** and typing only the team password. To change who has access, change that password in Firebase.

Phone alerts are optional: Settings → Phone alerts creates a private channel code for the free ntfy app (ntfy.sh). The website then pings that channel with each new order or booking: reference, time and size only, never a name or phone number.

## Parfi, the mascot

The poses live in `img/parfi/` (WebP, cut out from the character sheet, enlarged 4x with Real-ESRGAN and given an even outline; `-sticker` files have the cream die-cut edge for pink or busy backgrounds). `parfi-logo-master.png` is the full-size logo. Only poses with both arms and both legs are used. All of them are still stickers with no movement, each at its own tilt. On the page: waving in the hero, serving tea beside the drinks menu, standing on the checkerboard under the menu, presenting a cloche on the brunch card and waving goodbye beside the footer heart; in the app: the empty basket, each order status and the booking confirmation. Styles are under "Parfi, the AISU mascot" in `index.html`.

## Security

- **Database rules** (`firestore.rules`) are the real gatekeeper. The public can only add a booking or an order in the exact expected shape: reference `AISU-XXXX`, a phone made of phone characters, basket lines that are menu keys with whole quantities (at most 20 lines, 50 of each), and dates within a sensible window (orders up to 9 days ahead, bookings up to 62). Names and phone numbers are never readable without a staff sign-in.
- **Browser protections** (`_headers`): a strict Content-Security-Policy (scripts only from this site and Google's Firebase/reCAPTCHA hosts, no inline scripts, no framing by other sites), plus nosniff, no framing, a strict referrer policy, HSTS and a locked-down permissions policy. The page script lives in `assets/site.js` because inline scripts are blocked. If a new outside service is ever added, its address must be added to the policy too.
- **Escaping**: everything customers type is escaped wherever it's shown, and hidden control or text-direction characters are stripped before saving. The CSV export prefixes anything that starts like a formula.
- **Spam**: a hidden field only bots fill in, and a few orders or bookings per phone per hour (beyond that, customers are asked to call). The strong protection is Firebase App Check with reCAPTCHA Enterprise (free on the Spark plan), ready in the code and switched on by adding a site key in `assets/firebase-config.js` (see the setup guide).
- **Staff sign-in**: the counter's team login stays signed in; a manager's sign-in ends when the browser closes unless "stay signed in" is ticked.
- **Tests**: run the site with `python3 dev/serve.py` (it applies `_headers`, so the tests fail on anything the live security policy would block), then `dev/tests/test_core.py`, `test_staff.py` and `test_security.py`.

## After changing `firestore.rules`

Paste the whole file into Firebase console → Firestore Database → Rules and press Publish. The site and dashboard rely on the published rules, not the copy in this repository.
