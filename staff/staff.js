/* AISU staff dashboard: live pickup orders, today's tables, search, settings and the staff list.
   Reads menu prices from ../assets/menu-data.js so totals never come from the customer's phone. */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, sendPasswordResetEmail
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import {
  getFirestore, collection, doc, query, where, orderBy, limit, onSnapshot, getDoc, getDocs,
  setDoc, updateDoc, deleteDoc, runTransaction, serverTimestamp, writeBatch, documentId
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

const OWNER = 'aisuparfaiteria@gmail.com';     // must match isOwner() in firestore.rules
const DEFAULTS = { capacity: 20, ordersPaused: false };
const MENU = window.AISU_MENU;
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ar = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' Ar';

/* ---------------- words ---------------- */
const S = {
  fr: {
    title:'Espace personnel', 'signin.title':'Connexion du personnel', email:'E-mail', password:'Mot de passe', signin:'Se connecter',
    forgot:'Mot de passe oublié ?', needEmail:"Entrez d'abord votre e-mail.", resetSent:"Si ce compte existe, un e-mail de réinitialisation vient d'être envoyé à {e}.",
    badLogin:'E-mail ou mot de passe incorrect.', tooMany:"Trop d'essais. Attendez quelques minutes puis réessayez.", netErr:'Pas de connexion internet. Réessayez.',
    'denied.title':"Ce compte n'a pas accès", 'denied.body':"Demandez au propriétaire d'ajouter {e} dans l'onglet Équipe, puis reconnectez-vous.", signout:'Se déconnecter',
    'tab.orders':'Commandes', 'tab.tables':'Tables', 'tab.search':'Recherche', 'tab.settings':'Réglages', 'tab.team':'Équipe',
    'sound.on':'Son activé', 'sound.off':'Activer le son', offline:'Hors ligne : les nouveautés apparaîtront au retour de la connexion.',
    'col.new':'Nouvelles', 'col.preparing':'En préparation', 'col.ready':'Prêtes', 'col.done':'Récupérées et annulées', 'empty.col':'Rien ici.',
    today:"Aujourd'hui", tomorrow:'Demain', total:'Total', priceCheck:'prix à vérifier', justNow:"à l'instant", ago:'il y a {n} min',
    'act.start':'Commencer', 'act.ready':'Prête', 'act.collected':'Récupérée', 'act.cancel':'Annuler', 'act.sure':"Confirmer l'annulation",
    'act.confirm':'Confirmer', 'act.seat':'Installés', 'act.noshow':'Absents',
    'o.new':'Nouvelle', 'o.preparing':'En préparation', 'o.ready':'Prête', 'o.collected':'Récupérée', 'o.cancelled':'Annulée',
    'r.new':'À confirmer', 'r.confirmed':'Confirmée', 'r.seated':'Installés', 'r.noshow':'Absents', 'r.cancelled':'Annulée',
    'tables.title':'Réservations du {d}', 'tables.sum':'Réservations : {b} · Personnes : {g}', 'tables.empty':'Aucune réservation ce jour-là.', guests:'{n} pers.',
    'occ.cafe':'Café & parfaits', 'occ.brunch':'Brunch', 'occ.peppa':'Peppa Pig Afternoon Tea', 'occ.classique':'Afternoon Tea Classique', 'occ.gourmand':'Afternoon Tea Gourmand',
    'seat.table':'Table', 'seat.booth':'Banquette', 'seat.outside':'Extérieur', 'seat.any':'Sans préférence',
    'opt.hot':'chaud', 'opt.cold':'froid', 'opt.glass':'verre', 'opt.pitcher':'pichet',
    'search.ph':'Nom, téléphone ou référence', 'search.hint':'Cherche dans les 300 dernières réservations et commandes.', 'search.none':'Aucun résultat.', loading:'Chargement…',
    'type.order':'Commande', 'type.res':'Réservation', pickup:'Retrait',
    'pause.label':'Commandes en ligne', 'pause.on':'En pause : les clients ne peuvent pas commander', 'pause.off':'Ouvertes', 'pause.hint':'Mettez-les en pause un jour de grande affluence. Les clients voient un message à la place du bouton.',
    'cap.label':'Personnes maximum par demi-heure', 'cap.hint':"Le formulaire de réservation n'affiche plus une heure dès que ce nombre est atteint.", save:'Enregistrer', saved:'Enregistré',
    'cleanup.title':'Nettoyer les anciennes données', 'cleanup.body':'Supprime les réservations et commandes de plus de 12 mois.', 'cleanup.btn':'Supprimer', 'cleanup.sure':'Confirmer la suppression', 'cleanup.done':'{n} enregistrements supprimés.',
    'team.body':"Créez d'abord le compte dans Firebase, Authentication, Users, puis ajoutez son e-mail ici. Seul le propriétaire voit cet onglet.", add:'Ajouter', remove:'Retirer', 'remove.sure':'Confirmer', owner:'Propriétaire', 'team.bad':'Entrez une adresse e-mail valide.', 'team.empty':"Personne n'a encore été ajouté.",
    saveFail:"Impossible d'enregistrer. Vérifiez la connexion et réessayez.", newOrder:'Nouvelle commande : {r}', other:'English'
  },
  en: {
    title:'Staff', 'signin.title':'Staff sign-in', email:'Email', password:'Password', signin:'Sign in',
    forgot:'Forgot password?', needEmail:'Enter your email first.', resetSent:'If this account exists, a reset email has been sent to {e}.',
    badLogin:'Wrong email or password.', tooMany:'Too many attempts. Wait a few minutes and try again.', netErr:'No internet connection. Try again.',
    'denied.title':"This account doesn't have access", 'denied.body':'Ask the owner to add {e} in the Team tab, then sign in again.', signout:'Sign out',
    'tab.orders':'Orders', 'tab.tables':'Tables', 'tab.search':'Search', 'tab.settings':'Settings', 'tab.team':'Team',
    'sound.on':'Sound on', 'sound.off':'Turn on sound', offline:'Offline: new orders will appear when the connection is back.',
    'col.new':'New', 'col.preparing':'Preparing', 'col.ready':'Ready', 'col.done':'Collected and cancelled', 'empty.col':'Nothing here.',
    today:'Today', tomorrow:'Tomorrow', total:'Total', priceCheck:'check price', justNow:'just now', ago:'{n} min ago',
    'act.start':'Start', 'act.ready':'Ready', 'act.collected':'Collected', 'act.cancel':'Cancel', 'act.sure':'Confirm cancel',
    'act.confirm':'Confirm', 'act.seat':'Seated', 'act.noshow':'No-show',
    'o.new':'New', 'o.preparing':'Preparing', 'o.ready':'Ready', 'o.collected':'Collected', 'o.cancelled':'Cancelled',
    'r.new':'To confirm', 'r.confirmed':'Confirmed', 'r.seated':'Seated', 'r.noshow':'No-show', 'r.cancelled':'Cancelled',
    'tables.title':'Bookings for {d}', 'tables.sum':'Bookings: {b} · Guests: {g}', 'tables.empty':'No bookings this day.', guests:'{n} guests',
    'occ.cafe':'Coffee & parfaits', 'occ.brunch':'Brunch', 'occ.peppa':'Peppa Pig Afternoon Tea', 'occ.classique':'Afternoon Tea Classique', 'occ.gourmand':'Afternoon Tea Gourmand',
    'seat.table':'Table', 'seat.booth':'Booth', 'seat.outside':'Outside', 'seat.any':'No preference',
    'opt.hot':'hot', 'opt.cold':'iced', 'opt.glass':'glass', 'opt.pitcher':'pitcher',
    'search.ph':'Name, phone or reference', 'search.hint':'Searches the latest 300 bookings and orders.', 'search.none':'No results.', loading:'Loading…',
    'type.order':'Order', 'type.res':'Booking', pickup:'Pickup',
    'pause.label':'Online orders', 'pause.on':"Paused: customers can't order", 'pause.off':'Open', 'pause.hint':'Pause them on a very busy day. Customers see a message instead of the order button.',
    'cap.label':'Most guests per half hour', 'cap.hint':'The booking form stops offering a time once this many guests are booked.', save:'Save', saved:'Saved',
    'cleanup.title':'Clear old records', 'cleanup.body':'Deletes bookings and orders older than 12 months.', 'cleanup.btn':'Delete', 'cleanup.sure':'Confirm delete', 'cleanup.done':'{n} records deleted.',
    'team.body':'First create the login in Firebase, Authentication, Users, then add the email here. Only the owner sees this tab.', add:'Add', remove:'Remove', 'remove.sure':'Confirm', owner:'Owner', 'team.bad':'Enter a valid email address.', 'team.empty':'No one added yet.',
    saveFail:"Couldn't save. Check the connection and try again.", newOrder:'New order: {r}', other:'Français'
  }
};
let lang = 'fr';
try{ lang = localStorage.getItem('aisu-staff-lang') || 'fr'; }catch(e){}
const t = (k, v) => { let s = S[lang][k] ?? S.fr[k] ?? k; if(v) for(const x in v) s = s.replace('{' + x + '}', v[x]); return s; };

/* ---------------- dates in Madagascar time ---------------- */
function nowParts(){
  const p = new Intl.DateTimeFormat('en-CA', {timeZone: MENU.TZ, year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', hour12:false}).formatToParts(new Date());
  const g = x => (p.find(q => q.type === x) || {}).value;
  return { ymd: `${g('year')}-${g('month')}-${g('day')}`, mins: (parseInt(g('hour'), 10) % 24) * 60 + parseInt(g('minute'), 10) };
}
const ymdDate = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = ymdDate(s); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const niceDay = s => ymdDate(s).toLocaleDateString(lang === 'en' ? 'en-GB' : 'fr-FR', {weekday:'long', day:'numeric', month:'long'});
const hm = m => lang === 'en'
  ? (() => { const h = Math.floor(m / 60), mm = m % 60, ap = h >= 12 ? 'pm' : 'am', hh = h % 12 || 12; return mm ? `${hh}:${String(mm).padStart(2, '0')} ${ap}` : `${hh} ${ap}`; })()
  : `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}`;
const agoText = ts => { if(!ts || !ts.toDate) return t('justNow'); const n = Math.round((Date.now() - ts.toDate().getTime()) / 60000); return n < 1 ? t('justNow') : t('ago', {n}); };

/* ---------------- Firebase ---------------- */
const app = initializeApp(window.AISU_FIREBASE_CONFIG);
const auth = getAuth(app);
const db = getFirestore(app);
let me = null, isOwner = false;
const unsubs = [];
const stop = () => { while(unsubs.length) try{ unsubs.pop()(); }catch(e){} };

/* ---------------- static text ---------------- */
function applyText(){
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-t]').forEach(el => { el.textContent = t(el.dataset.t); });
  document.querySelectorAll('[data-lang-toggle]').forEach(el => { el.textContent = t('other'); });
  $('#searchIn').placeholder = t('search.ph');
  $('#soundBtn').textContent = t(soundOn ? 'sound.on' : 'sound.off');
  $('#soundBtn').setAttribute('aria-pressed', soundOn);
  $('#today').textContent = niceDay(nowParts().ymd);
}
document.addEventListener('click', e => {
  if(e.target.closest('[data-lang-toggle]')){
    lang = lang === 'fr' ? 'en' : 'fr';
    try{ localStorage.setItem('aisu-staff-lang', lang); }catch(err){}
    applyText(); renderAll();
  }
  if(e.target.closest('[data-signout]')){ stop(); signOut(auth); }
});

let toastTimer;
function toast(msg){ const el = $('#toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 3200); }

/* ---------------- sound ---------------- */
let soundOn = false, audio = null;
try{ soundOn = localStorage.getItem('aisu-staff-sound') === '1'; }catch(e){}
function ensureAudio(){ if(!audio){ const C = window.AudioContext || window.webkitAudioContext; if(C) audio = new C(); } if(audio && audio.state === 'suspended') audio.resume(); }
function chime(){
  if(!soundOn || !audio) return;
  const now = audio.currentTime;
  [[880, 0], [1320, .18]].forEach(([f, at]) => {
    const o = audio.createOscillator(), g = audio.createGain();
    o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0, now + at);
    g.gain.linearRampToValueAtTime(.35, now + at + .02); g.gain.exponentialRampToValueAtTime(.001, now + at + .5);
    o.connect(g).connect(audio.destination); o.start(now + at); o.stop(now + at + .55);
  });
}
$('#soundBtn').addEventListener('click', () => {
  soundOn = !soundOn; if(soundOn){ ensureAudio(); chime(); }
  try{ localStorage.setItem('aisu-staff-sound', soundOn ? '1' : '0'); }catch(e){}
  $('#soundBtn').setAttribute('aria-pressed', soundOn); $('#soundBtn').textContent = t(soundOn ? 'sound.on' : 'sound.off');
});
// browsers only allow sound after a tap, so the first tap anywhere wakes it if it was left on
document.addEventListener('pointerdown', () => { if(soundOn) ensureAudio(); }, {once:true});

window.addEventListener('online', () => { $('#offline').hidden = true; });
window.addEventListener('offline', () => { $('#offline').hidden = false; });

/* ---------------- sign in ---------------- */
$('#loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const em = $('#lEmail').value.trim(), pw = $('#lPass').value;
  $('#lErr').hidden = true; $('#lOk').hidden = true;
  if(!em || !pw){ $('#lErr').textContent = t('badLogin'); $('#lErr').hidden = false; return; }
  $('#lBtn').disabled = true;
  try{ await signInWithEmailAndPassword(auth, em, pw); }
  catch(err){
    const c = err && err.code;
    $('#lErr').textContent = t(c === 'auth/too-many-requests' ? 'tooMany' : c === 'auth/network-request-failed' ? 'netErr' : 'badLogin');
    $('#lErr').hidden = false;
  }finally{ $('#lBtn').disabled = false; }
});
$('#lForgot').addEventListener('click', async () => {
  const em = $('#lEmail').value.trim();
  $('#lErr').hidden = true; $('#lOk').hidden = true;
  if(!em){ $('#lErr').textContent = t('needEmail'); $('#lErr').hidden = false; $('#lEmail').focus(); return; }
  try{ await sendPasswordResetEmail(auth, em); }catch(err){ /* same message either way, so nobody can test which emails exist */ }
  $('#lOk').textContent = t('resetSent', {e: em}); $('#lOk').hidden = false;
});

function show(id){ ['login', 'denied', 'shell'].forEach(x => { $('#' + x).hidden = x !== id; }); }

onAuthStateChanged(auth, async user => {
  stop();
  me = user ? (user.email || '').toLowerCase() : null;
  if(!user){ show('login'); applyText(); return; }
  isOwner = me === OWNER;
  if(!isOwner){
    try{ const s = await getDoc(doc(db, 'staff', me)); if(!s.exists()) throw new Error('not staff'); }
    catch(err){ $('#deniedBody').textContent = t('denied.body', {e: me}); show('denied'); applyText(); return; }
  }
  $('#teamTab').hidden = !isOwner; $('#cleanupPanel').hidden = !isOwner;
  show('shell'); applyText(); startLive();
});

/* ---------------- tabs ---------------- */
let view = 'orders';
document.querySelector('.tabs').addEventListener('click', e => {
  const b = e.target.closest('[data-view]'); if(!b) return;
  view = b.dataset.view;
  document.querySelectorAll('.tabs [data-view]').forEach(x => x.setAttribute('aria-selected', x.dataset.view === view));
  document.querySelectorAll('[data-panel]').forEach(p => { p.hidden = p.dataset.panel !== view; });
  if(view === 'search' && !searchCache) loadSearch();
});

/* ---------------- live data ---------------- */
let orders = [], reservations = [], slotG = {}, settings = {...DEFAULTS}, staffList = [], firstOrders = true;
let tablesDay = nowParts().ymd;

let liveDay = null;
function startLive(){
  firstOrders = true;
  const today = nowParts().ymd; liveDay = today;
  unsubs.push(onSnapshot(query(collection(db, 'orders'), where('pickupDay', 'in', [today, addDays(today, 1)])), snap => {
    const fresh = [];
    snap.docChanges().forEach(ch => { if(ch.type === 'added' && !firstOrders && ch.doc.data().status === 'new') fresh.push(ch.doc.id); });
    orders = snap.docs.map(d => ({id: d.id, ...d.data()}));
    renderOrders(fresh);
    if(fresh.length){ chime(); const o = orders.find(x => x.id === fresh[0]); toast(t('newOrder', {r: o ? o.ref : ''})); }
    firstOrders = false;
  }, () => {}));
  unsubs.push(onSnapshot(doc(db, 'settings', 'main'), s => { settings = {...DEFAULTS, ...(s.exists() ? s.data() : {})}; renderSettings(); renderTables(); }, () => {}));
  if(isOwner) unsubs.push(onSnapshot(collection(db, 'staff'), snap => { staffList = snap.docs.map(d => d.id).sort(); renderTeam(); }, () => {}));
  watchDay();
  // refresh the 'minutes ago' labels, and start a fresh day's order list after midnight
  const tick = setInterval(() => { if(nowParts().ymd !== liveDay){ stop(); tablesDay = nowParts().ymd; applyText(); startLive(); } else renderOrders([]); }, 30000);
  unsubs.push(() => clearInterval(tick));
}
let dayUnsubs = [];
function watchDay(){
  dayUnsubs.forEach(u => u()); dayUnsubs = [];
  reservations = []; slotG = {};
  dayUnsubs.push(onSnapshot(query(collection(db, 'reservations'), where('date', '==', tablesDay)), snap => {
    reservations = snap.docs.map(d => ({id: d.id, ...d.data()})); renderTables();
  }, () => {}));
  dayUnsubs.push(onSnapshot(doc(db, 'slots', tablesDay), s => { slotG = s.exists() ? (s.data().g || {}) : {}; renderTables(); }, () => {}));
  unsubs.push(() => { dayUnsubs.forEach(u => u()); dayUnsubs = []; });
  renderTables();
}

/* ---------------- orders ---------------- */
function itemLine(it){
  const info = MENU.itemFor(it.k);
  const name = info ? info.name + (info.option ? ` (${t('opt.' + info.option)})` : '') : (it.n || it.k);
  const price = info ? info.price * it.q : null;
  return {name, price};
}
function orderCard(o, flash){
  const today = nowParts().ymd;
  const lines = (o.items || []).map(it => ({...itemLine(it), q: it.q}));
  const unknown = lines.some(l => l.price == null);
  const total = lines.reduce((a, l) => a + (l.price || 0), 0);
  const next = {new: ['preparing', 'act.start'], preparing: ['ready', 'act.ready'], ready: ['collected', 'act.collected']}[o.status];
  const day = o.pickupDay === today ? '' : `<small>${t('tomorrow')}</small>`;
  return `<article class="card is-${esc(o.status)}${flash ? ' flash' : ''}" data-id="${esc(o.id)}">
    <div class="card-top"><span class="when">${hm(o.pickupTime)}${day}</span><span class="chip st-${esc(o.status)}">${t('o.' + o.status)}</span><span class="ref">${esc(o.ref)}</span></div>
    <div class="who"><b>${esc(o.name)}</b><a href="tel:${esc(String(o.phone).replace(/[^\d+]/g, ''))}">${esc(o.phone)}</a></div>
    <ul class="items">${lines.map(l => `<li><span><span class="q">${l.q}×</span>${esc(l.name)}</span><span class="pr">${l.price == null ? t('priceCheck') : ar(l.price)}</span></li>`).join('')}</ul>
    <div class="total"><span>${t('total')}</span><span>${ar(total)}${unknown ? ' + ?' : ''}</span></div>
    ${o.notes ? `<div class="note">${esc(o.notes)}</div>` : ''}
    <div class="meta"><span>${agoText(o.createdAt)}</span></div>
    ${next ? `<div class="actions"><button class="btn btn-fill" type="button" data-order="${esc(o.id)}" data-to="${next[0]}">${t(next[1])}</button><button class="btn btn-danger" type="button" data-order="${esc(o.id)}" data-to="cancelled">${t('act.cancel')}</button></div>` : ''}
  </article>`;
}
function renderOrders(fresh){
  const by = s => orders.filter(o => o.status === s).sort((a, b) => (a.pickupDay + String(a.pickupTime).padStart(4, '0')).localeCompare(b.pickupDay + String(b.pickupTime).padStart(4, '0')));
  const col = (id, list) => { $(id).innerHTML = list.length ? list.map(o => orderCard(o, fresh.includes(o.id))).join('') : `<div class="empty">${t('empty.col')}</div>`; };
  col('#colNew', by('new')); col('#colPrep', by('preparing')); col('#colReady', by('ready'));
  const past = orders.filter(o => o.status === 'collected' || o.status === 'cancelled');
  $('#colPast').innerHTML = past.map(o => orderCard(o, false)).join(''); $('#pastCount').textContent = past.length;
  const n = by('new').length; $('#newCount').textContent = n; $('#newCount').dataset.n = n;
  document.title = n ? `(${n}) AISU · Staff` : 'AISU · Staff';
}

/* two-tap cancel: the first tap arms the button for 4 seconds */
function armed(btn){
  if(btn.classList.contains('armed')) return true;
  btn.classList.add('armed'); const old = btn.textContent; btn.textContent = t(btn.dataset.sureKey || 'act.sure');
  setTimeout(() => { btn.classList.remove('armed'); btn.textContent = old; }, 4000);
  return false;
}
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-order]'); if(!b) return;
  if(b.dataset.to === 'cancelled' && !armed(b)) return;
  b.disabled = true;
  try{ await updateDoc(doc(db, 'orders', b.dataset.order), {status: b.dataset.to, statusAt: serverTimestamp(), statusBy: me}); }
  catch(err){ b.disabled = false; toast(t('saveFail')); }
});

/* ---------------- tables ---------------- */
function resCard(r){
  const acts = {
    new: [['confirmed', 'act.confirm', 'btn-fill'], ['seated', 'act.seat', 'btn-ghost']],
    confirmed: [['seated', 'act.seat', 'btn-fill'], ['noshow', 'act.noshow', 'btn-ghost']]
  }[r.status] || [];
  const cancel = (r.status === 'new' || r.status === 'confirmed') ? `<button class="btn btn-danger" type="button" data-res="${esc(r.id)}" data-to="cancelled">${t('act.cancel')}</button>` : '';
  return `<article class="card is-${esc(r.status)}">
    <div class="card-top"><span class="when">${hm(r.time)}</span><span class="chip st-${esc(r.status)}">${t('r.' + r.status)}</span><span class="ref">${esc(r.ref)}</span></div>
    <div class="who"><b>${esc(r.name)}</b><a href="tel:${esc(String(r.phone).replace(/[^\d+]/g, ''))}">${esc(r.phone)}</a></div>
    <div class="meta"><span><b>${t('guests', {n: r.guests})}</b></span><span>${t('occ.' + r.occasion)}</span><span>${t('seat.' + r.seat)}</span>${r.email ? `<span>${esc(r.email)}</span>` : ''}</div>
    ${r.notes ? `<div class="note">${esc(r.notes)}</div>` : ''}
    ${acts.length || cancel ? `<div class="actions">${acts.map(a => `<button class="btn ${a[2]}" type="button" data-res="${esc(r.id)}" data-to="${a[0]}">${t(a[1])}</button>`).join('')}${cancel}</div>` : ''}
  </article>`;
}
function renderTables(){
  if($('#dayPick').value !== tablesDay) $('#dayPick').value = tablesDay;
  $('#tablesTitle').textContent = t('tables.title', {d: niceDay(tablesDay)});
  const list = reservations.slice().sort((a, b) => a.time - b.time);
  const live = list.filter(r => r.status !== 'cancelled');
  $('#tablesSummary').textContent = t('tables.sum', {b: live.length, g: live.reduce((a, r) => a + r.guests, 0)});
  const keys = Object.keys(slotG).map(Number).sort((a, b) => a - b).filter(k => slotG[String(k)] > 0);
  $('#slotBar').innerHTML = keys.map(k => { const n = slotG[String(k)]; return `<span class="${n >= settings.capacity ? 'full' : ''}"><b>${hm(k)}</b>${n} / ${settings.capacity}</span>`; }).join('');
  $('#slotBar').hidden = !keys.length;
  $('#resList').innerHTML = list.length ? list.map(resCard).join('') : `<div class="empty">${t('tables.empty')}</div>`;
}
$('#dayPrev').addEventListener('click', () => { tablesDay = addDays(tablesDay, -1); watchDay(); });
$('#dayNext').addEventListener('click', () => { tablesDay = addDays(tablesDay, 1); watchDay(); });
$('#dayToday').addEventListener('click', () => { tablesDay = nowParts().ymd; watchDay(); });
$('#dayPick').addEventListener('change', e => { if(e.target.value){ tablesDay = e.target.value; watchDay(); } });

document.addEventListener('click', async e => {
  const b = e.target.closest('[data-res]'); if(!b) return;
  if(b.dataset.to === 'cancelled' && !armed(b)) return;
  b.disabled = true;
  const ref = doc(db, 'reservations', b.dataset.res);
  try{
    if(b.dataset.to === 'cancelled'){
      // cancelling gives the guests' places back to that half hour
      await runTransaction(db, async tx => {
        const rs = await tx.get(ref); if(!rs.exists()) return;
        const r = rs.data(); if(r.status === 'cancelled') return;
        const sref = doc(db, 'slots', r.date); const ss = await tx.get(sref);
        if(ss.exists()){ const k = String(r.time), g = {...(ss.data().g || {})}; g[k] = Math.max(0, (g[k] || 0) - r.guests); tx.update(sref, {g}); }
        tx.update(ref, {status: 'cancelled', statusAt: serverTimestamp(), statusBy: me});
      });
    }else{
      await updateDoc(ref, {status: b.dataset.to, statusAt: serverTimestamp(), statusBy: me});
    }
  }catch(err){ b.disabled = false; toast(t('saveFail')); }
});

/* ---------------- search ---------------- */
let searchCache = null;
async function loadSearch(){
  $('#results').innerHTML = `<div class="empty">${t('loading')}</div>`;
  try{
    const [os, rs] = await Promise.all([
      getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(300))),
      getDocs(query(collection(db, 'reservations'), orderBy('createdAt', 'desc'), limit(300)))
    ]);
    searchCache = [...os.docs.map(d => ({kind: 'order', id: d.id, ...d.data()})), ...rs.docs.map(d => ({kind: 'res', id: d.id, ...d.data()}))];
    runSearch();
  }catch(err){ $('#results').innerHTML = `<div class="empty">${t('saveFail')}</div>`; }
}
function runSearch(){
  if(!searchCache) return;
  const q = $('#searchIn').value.trim().toLowerCase(), digits = q.replace(/\D/g, '');
  if(!q){ $('#results').innerHTML = ''; return; }
  const hits = searchCache.filter(x => (x.name || '').toLowerCase().includes(q) || (x.ref || '').toLowerCase().includes(q)
    || (digits.length >= 3 && String(x.phone || '').replace(/\D/g, '').includes(digits))).slice(0, 60);
  $('#results').innerHTML = hits.length ? hits.map(x => x.kind === 'order'
    ? orderCard(x, false).replace('<div class="card-top">', `<div class="meta"><b>${t('type.order')}</b><span>${t('pickup')} ${esc(niceDay(x.pickupDay))}</span></div><div class="card-top">`)
    : resCard(x).replace('<div class="card-top">', `<div class="meta"><b>${t('type.res')}</b><span>${esc(niceDay(x.date))}</span></div><div class="card-top">`)).join('')
    : `<div class="empty">${t('search.none')}</div>`;
}
$('#searchForm').addEventListener('submit', e => { e.preventDefault(); if(!searchCache) loadSearch(); else runSearch(); });
$('#searchIn').addEventListener('input', () => runSearch());

/* ---------------- settings ---------------- */
function renderSettings(){
  $('#pauseIn').checked = !!settings.ordersPaused;
  $('#pauseState').textContent = t(settings.ordersPaused ? 'pause.on' : 'pause.off');
  if(document.activeElement !== $('#capIn')) $('#capIn').value = settings.capacity;
}
async function saveSettings(patch){
  $('#settingsErr').hidden = true;
  try{ await setDoc(doc(db, 'settings', 'main'), {capacity: settings.capacity, ordersPaused: !!settings.ordersPaused, ...patch, updatedAt: serverTimestamp(), updatedBy: me}); return true; }
  catch(err){ $('#settingsErr').textContent = t('saveFail'); $('#settingsErr').hidden = false; renderSettings(); return false; }
}
$('#pauseIn').addEventListener('change', e => saveSettings({ordersPaused: e.target.checked}));
$('#capSave').addEventListener('click', async () => {
  const n = Math.round(Number($('#capIn').value));
  if(!(n >= 1 && n <= 200)){ $('#capIn').focus(); return; }
  if(await saveSettings({capacity: n})){ $('#capMsg').textContent = t('saved'); setTimeout(() => { $('#capMsg').textContent = ''; }, 2500); }
});
$('#cleanupBtn').addEventListener('click', async e => {
  const b = e.currentTarget; b.dataset.sureKey = 'cleanup.sure';
  if(!armed(b)) return;
  b.disabled = true;
  const cutoff = addDays(nowParts().ymd, -365); let n = 0;
  try{
    for(const [col, field] of [['reservations', 'date'], ['orders', 'pickupDay']]){
      const snap = await getDocs(query(collection(db, col), where(field, '<', cutoff), limit(450)));
      const batch = writeBatch(db); snap.docs.forEach(d => batch.delete(d.ref)); if(snap.size) await batch.commit(); n += snap.size;
    }
    const slots = await getDocs(query(collection(db, 'slots'), where(documentId(), '<', cutoff), limit(450)));
    const batch = writeBatch(db); slots.docs.forEach(d => batch.delete(d.ref)); if(slots.size) await batch.commit();
    $('#cleanupMsg').textContent = t('cleanup.done', {n});
  }catch(err){ $('#cleanupMsg').textContent = t('saveFail'); }
  finally{ b.disabled = false; }
});

/* ---------------- team (owner only) ---------------- */
function renderTeam(){
  const rows = [`<li><span>${esc(OWNER)}</span><span class="chip">${t('owner')}</span></li>`]
    .concat(staffList.map(em => `<li><span>${esc(em)}</span><button class="btn btn-danger" type="button" data-remove="${esc(em)}" data-sure-key="remove.sure">${t('remove')}</button></li>`));
  $('#teamList').innerHTML = rows.join('') + (staffList.length ? '' : `<li style="color:var(--muted)">${t('team.empty')}</li>`);
}
$('#teamForm').addEventListener('submit', async e => {
  e.preventDefault();
  const em = $('#teamIn').value.trim().toLowerCase();
  $('#teamErr').hidden = true;
  if(!/^[^\s@/]+@[^\s@/]+\.[^\s@/]+$/.test(em)){ $('#teamErr').textContent = t('team.bad'); $('#teamErr').hidden = false; return; }
  try{ await setDoc(doc(db, 'staff', em), {addedAt: serverTimestamp(), addedBy: me}); $('#teamIn').value = ''; }
  catch(err){ $('#teamErr').textContent = t('saveFail'); $('#teamErr').hidden = false; }
});
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-remove]'); if(!b) return;
  if(!armed(b)) return;
  b.disabled = true;
  try{ await deleteDoc(doc(db, 'staff', b.dataset.remove)); }catch(err){ b.disabled = false; toast(t('saveFail')); }
});

function renderAll(){ renderOrders([]); renderTables(); renderSettings(); if(isOwner) renderTeam(); if(searchCache) runSearch(); }
applyText();
