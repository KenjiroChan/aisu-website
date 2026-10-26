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

## Staff alerts

New orders and bookings take over the dashboard screen and ring until someone answers, on whichever tab is open. Browsers keep a freshly opened page silent until it is touched, so the dashboard opens with a "Start service" screen that takes that one tap.

## Pickup orders

Each online order gets a 4-digit **pickup code** and its own live page on the website, which the customer keeps open or reopens later (the order also shows in a chip at the bottom of the site on that phone, and the page link can be sent to whoever collects). The page shows the code, the pickup time, the latest time we hold the order (`PICKUP_HOLD`, 30 minutes after the pickup time but never past closing, in `assets/menu-data.js`), what to know about iced items and paying at the counter, and the status as staff move it: received, preparing, ready, collected. It needs no e-mail, SMS or WhatsApp.

The page reads a small record, `pickups/{key}`, named by a long random key and holding only the reference, code, status, pickup time and item names: never a name or phone number. Staff see on each ready order whether the customer has seen that it's ready, so they know when to call.

At the counter, **Récupérée** (Collected) first asks for the customer's code; typing a code in "Un client vient chercher sa commande ?" finds the order directly. A customer without the code can still be served after staff check their name and phone, and the order then records that it was handed over without the code. Iced items (parfaits, palettes, iced drinks, juices, smoothies, affogatos; see `isCold` in `assets/menu-data.js`) carry a snowflake on both sides.

## Who sees what

- **Owner** (`aisuparfaiteria@gmail.com`): everything, including the Team tab.
- **Managers** (role Manager in the Team tab): everything except Team.
- **Team** (role Team): Today, Orders, Bookings and Menu (sold out). No Numbers, no Settings, no sales figure, and the online switches are locked.

The counter team shares one login, `aisuparfaiteria+staff@gmail.com`. Gmail delivers "+staff" mail to the owner's inbox, so no new mailbox is needed. Create that user once in Firebase (Authentication, Users), add it in the Team tab as Team, and staff sign in by choosing **Équipe** and typing only the team password. To change who has access, change that password in Firebase.

Phone alerts are optional: Settings → Phone alerts creates a private channel code for the free ntfy app (ntfy.sh). The website then pings that channel with each new order or booking: reference, time and size only, never a name or phone number.

## After changing `firestore.rules`

Paste the whole file into Firebase console → Firestore Database → Rules and press Publish. The site and dashboard rely on the published rules, not the copy in this repository.
