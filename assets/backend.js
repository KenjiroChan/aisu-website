/* AISU website ↔ Firebase.
   Saves bookings and pickup orders to Cloud Firestore and keeps the booking form's time slots in step
   with how many guests are already booked. Loaded as a module by index.html after firebase-config.js.
   When AISU_FIREBASE_CONFIG is null, or Firebase can't load, nothing is exposed and the page stays in
   preview mode. */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {
  getFirestore, doc, collection, runTransaction, serverTimestamp, onSnapshot, addDoc
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

if(cfg){
  const app = initializeApp(cfg);
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

    /* o = { ref, items:[{k, n, q}], pickupDay, pickupTime, name, phone, notes, lang } */
    async createOrder(o){
      if(settings.ordersPaused) throw failure('aisu/paused');
      if((settings.closedDays || []).includes(o.pickupDay)) throw failure('aisu/closed');
      try{
        const ref = await withTimeout(addDoc(collection(db, 'orders'), { ...o, status: 'new', createdAt: serverTimestamp() }));
        const n = o.items.reduce((a, l) => a + (l.q || 0), 0);
        pingStaff(settings, 'Nouvelle commande', `${o.ref} · retrait ${whenFr(o.pickupDay, o.pickupTime)} · ${n} article${n > 1 ? 's' : ''}`, 'shopping_bags');
        return ref.id;
      }catch(err){
        const e = mapError(err);
        if(e.code === 'aisu/refused' && settings.ordersPaused) throw failure('aisu/paused', err);
        throw e;
      }
    }
  });
  window.dispatchEvent(new Event('aisu:backend'));
}
