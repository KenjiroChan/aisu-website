# Dashboard and site tests

End-to-end checks run in Playwright against stand-in versions of Firebase (`mock/`), so they work offline.
The stand-in database lives in the browser's localStorage and is shared across tabs; the stand-in sign-in accepts
any password except `wrong`. It does **not** enforce `firestore.rules`, so rule changes still need a live check.

```
python3 dev/serve.py &                               # serve the site with the live security headers
python3 dev/tests/test_core.py                        # site booking/order + basic dashboard (26 checks)
python3 dev/tests/test_staff.py                       # alarms, roles, sold out, pausing, staff bookings, reports (46 checks)
```

Needs `pip install playwright` and Chromium. Screenshots land in `dev/tests/out/` (git-ignored).
`test_staff.py` takes about 2 minutes because it waits for real ring intervals and reminders.

**Run during café hours (Madagascar time).** After closing, or within about an hour of it, test orders and bookings land on the
next opening day. Two checks in `test_staff.py` (the Numbers sales figure and the CSV containing today's booking) then
fail, because the Numbers tab correctly counts only today. Everything else passes at any hour.
