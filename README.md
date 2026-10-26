# AISU Café & Parfaiteria

The AISU website in French, English and Malagasy: the parfait collection, the full drinks menu, brunch and afternoon tea, pickup orders and table bookings, plus a private staff dashboard.

## What's where

| Path | What it is |
| --- | --- |
| `index.html` | The public website |
| `staff/` | The staff dashboard (sign-in required) |
| `assets/menu-data.js` | Menu, prices and opening hours, shared by the site and the dashboard |
| `assets/firebase-config.js` | Which Firebase project the site uses (not a secret) |
| `assets/backend.js` | Saves bookings and orders to the database |
| `firestore.rules` | Who can read and write what; paste into Firebase console → Firestore Database → Rules |
| `img/`, `fonts/` | Parfait illustrations and web fonts |

## Changing prices or hours

Edit `assets/menu-data.js`. The website and the dashboard both read it, so totals on the dashboard always match the menu.

## Hosting

Cloudflare Pages publishes this repository automatically on every push to `main`. There is no build step.
