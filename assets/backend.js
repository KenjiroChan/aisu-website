/* AISU website ↔ Firebase.
   Saves bookings and pickup orders to Cloud Firestore and keeps the booking form's time slots in step
   with how many guests are already booked. Loaded as a module by index.html after firebase-config.js.
   When AISU_FIREBASE_CONFIG is null, or Firebase can't load, nothing is exposed and the page stays in
   preview mode. */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { initializeAppCheck, ReCaptchaV3Provider } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app-check.js';
import {
  getFirestore, doc, collection, runTransaction, serverTimestamp, onSnapshot, addDoc, writeBatch, updateDoc
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

const cfg = window.AISU_FIREBASE_CONFIG;
const DEFAULTS = { capacity: 20, ordersPaused: false, bookingsPaused: false, closedDays: [], notice: '', soldOut: {}, alertTopic: '' };   // must match the defaults in firestore.rules
const TIMEOUT_MS = 20000;

function failure(code, cause){ const e = new Error(code); e.code = code; e.cause = cause; return e; }
function withTimeout(promise){
  return Promise.race([promise, new Promise((_, rej) => setTimeout(() => rej(failure('aisu/timeout')), TIMEOUT_MS))]);
}
function mapError(err){
  if(err && typeof err.code === 'string' && err.code.startsWith('aisu/')) return err;
  const c = err && err.code;
  if(c === 'permission-denied') return failure('aisu/refused', err);
  if(c === 'unavailable' || c === 'deadline-exceeded') return failure('aisu/offline', err);
  return failure('aisu/unknown', err);
}

/* Optional phone alerts: when staff set an alert channel in the dashboard (Settings → Phone alerts),
   each new booking or order also rings the staff's phones through the free ntfy app (ntfy.sh).
   The message carries only the reference, time and size: never a name or phone number. */
function pingStaff(settings, title, message, tag){
  const topic = String(settings.alertTopic || '');
  if(!/^[A-Za-z0-9_-]{12,64}$/.test(topic)) return;
  try{
    fetch('https://ntfy.sh/', { method: 'POST', keepalive: true,
      body: JSON.stringify({ topic, title, message, priority: 5, tags: [tag], click: location.origin + '/staff/' }) }).catch(() => {});
  }catch(e){ /* alerts are best-effort */ }
}
const DOW_FR = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
function whenFr(day, mins){
  const [y, m, d] = day.split('-').map(Number);
  const dow = new Date(y, m - 1, d).getDay();
  return `${DOW_FR[dow]} ${d}/${m} à ${Math.floor(mins / 60)}h${String(mins % 60).padStart(2, '0')}`;
}

/* Pickup tracking. Each order gets a 4-digit pickup code and a long random "tracking key". The key names a
   small public record, pickups/{key}, holding only the reference, code, status, pickup time and item names
   (never a name or phone number). Only someone with the key (the customer's own phone, or the link they
   share with whoever collects) can open it, and the staff dashboard keeps its status in step with the order. */
const KEY_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
function randomKey(n){
  const a = new Uint32Array(n); crypto.getRandomValues(a);
  return Array.from(a, x => KEY_CHARS[x % KEY_CHARS.length]).join('');
}
function randomCode(){
  const a = new Uint32Array(1); crypto.getRandomValues(a);
  return String(a[0] % 10000).padStart(4, '0');
}

if(cfg){
  const app = initializeApp(cfg);
  // App Check proves requests come from this website (see firebase-config.js); off until a key is set
  if(window.AISU_APPCHECK_SITE_KEY){
    try{ initializeAppCheck(app, { provider: new ReCaptchaV3Provider(window.AISU_APPCHECK_SITE_KEY), isTokenAutoRefreshEnabled: true }); }
    catch(e){ /* the site still works if App Check can't start */ }
  }
  const db = getFirestore(app);

  let settings = { ...DEFAULTS };
  const settingsListeners = new Set();
  onSnapshot(doc(db, 'settings', 'main'),
    snap => { settings = { ...DEFAULTS, ...(snap.exists() ? snap.data() : {}) }; settingsListeners.forEach(fn => fn(settings)); },
    () => { /* keep defaults if the settings can't be read */ });

  let slotUnsub = null;

  window.aisuBackend = Object.freeze({
    live: true,
    settings: () => settings,
    onSettings(fn){ settingsListeners.add(fn); fn(settings); return () => settingsListeners.delete(fn); },

    /* Calls fn({ "690": 6, ... }) with guests already booked per half hour on that day, live. */
    watchSlots(day, fn){
      if(slotUnsub) slotUnsub();
      slotUnsub = onSnapshot(doc(db, 'slots', day),
        snap => fn(snap.exists() ? (snap.data().g || {}) : {}),
        () => fn({}));
      return () => { if(slotUnsub){ slotUnsub(); slotUnsub = null; } };
    },

    /* r = { ref, date, time, guests, occasion, seat, name, phone, email, notes, lang } */
    async createReservation(r){
      const resRef = doc(collection(db, 'reservations'));
      const slotRef = doc(db, 'slots', r.date);
      const key = String(r.time);
      if(settings.bookingsPaused) throw failure('aisu/paused');
      if((settings.closedDays || []).includes(r.date)) throw failure('aisu/closed');
      try{
        await withTimeout(runTransaction(db, async tx => {
          const snap = await tx.get(slotRef);
          const g = snap.exists() ? { ...(snap.data().g || {}) } : {};
          const booked = g[key] || 0;
          if(booked + r.guests > settings.capacity) throw failure('aisu/full');
          g[key] = booked + r.guests;
          tx.set(slotRef, { g, last: resRef.id });
          tx.set(resRef, { ...r, status: 'new', createdAt: serverTimestamp() });
        }));
        pingStaff(settings, 'Nouvelle réservation', `${r.ref} · ${whenFr(r.date, r.time)} · ${r.guests} pers.`, 'calendar');
        return resRef.id;
      }catch(err){
        const e = mapError(err);
        if(e.code === 'aisu/refused' && settings.bookingsPaused) throw failure('aisu/paused', err);
        throw e;
      }
    },

    /* o = { ref, items:[{k, n, q}], pickupDay, pickupTime, name, phone, notes, lang }
       Resolves to { id, track, code }: track and code are null if live tracking couldn't be set up
       (for example while the database rules still need publishing), and the order is then saved without them. */
    async createOrder(o){
      if(settings.ordersPaused) throw failure('aisu/paused');
      if((settings.closedDays || []).includes(o.pickupDay)) throw failure('aisu/closed');
      const n = o.items.reduce((a, l) => a + (l.q || 0), 0);
      const ping = () => pingStaff(settings, 'Nouvelle commande', `${o.ref} · retrait ${whenFr(o.pickupDay, o.pickupTime)} · ${n} article${n > 1 ? 's' : ''}`, 'shopping_bags');
      const track = randomKey(24), code = randomCode();
      const orderRef = doc(collection(db, 'orders'));
      try{
        const b = writeBatch(db);
        b.set(orderRef, { ...o, track, code, status: 'new', createdAt: serverTimestamp() });
        b.set(doc(db, 'pickups', track), { order: orderRef.id, ref: o.ref, code, status: 'new',
          pickupDay: o.pickupDay, pickupTime: o.pickupTime,
          items: o.items.map(l => ({ k: l.k, n: l.n, q: l.q })), lang: o.lang, createdAt: serverTimestamp() });
        await withTimeout(b.commit());
        ping();
        return { id: orderRef.id, track, code };
      }catch(err){
        const e = mapError(err);
        if(e.code === 'aisu/refused' && settings.ordersPaused) throw failure('aisu/paused', err);
        if(e.code !== 'aisu/refused') throw e;
      }
      // refused with tracking: fall back to a plain order so the customer can still order
      try{
        const ref = await withTimeout(addDoc(collection(db, 'orders'), { ...o, status: 'new', createdAt: serverTimestamp() }));
        ping();
        return { id: ref.id, track: null, code: null };
      }catch(err){
        const e = mapError(err);
        if(e.code === 'aisu/refused' && settings.ordersPaused) throw failure('aisu/paused', err);
        throw e;
      }
    },

    /* Calls fn(pickup) with the order's public tracking record, live; fn(null) if it doesn't exist,
       and onError(code) if it can't be reached. Returns a function that stops watching. */
    watchPickup(track, fn, onError){
      return onSnapshot(doc(db, 'pickups', track),
        snap => fn(snap.exists() ? snap.data() : null),
        err => { if(onError) onError(mapError(err).code); });
    },

    /* Tells the café the customer has seen this status on their screen (so staff know whether to call). */
    markSeen(track, status){
      return updateDoc(doc(db, 'pickups', track), { seen: status, seenAt: serverTimestamp() }).catch(() => {});
    }
  });
  window.dispatchEvent(new Event('aisu:backend'));
}
