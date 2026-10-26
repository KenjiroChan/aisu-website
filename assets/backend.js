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
const DEFAULTS = { capacity: 20, ordersPaused: false };   // must match the defaults in firestore.rules
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
        return resRef.id;
      }catch(err){ throw mapError(err); }
    },

    /* o = { ref, items:[{k, n, q}], pickupDay, pickupTime, name, phone, notes, lang } */
    async createOrder(o){
      if(settings.ordersPaused) throw failure('aisu/paused');
      try{
        const ref = await withTimeout(addDoc(collection(db, 'orders'), { ...o, status: 'new', createdAt: serverTimestamp() }));
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
