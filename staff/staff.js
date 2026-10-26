/* AISU staff dashboard.
   Today at a glance, live pickup orders, bookings (add, edit, move, cancel), what's sold out, numbers,
   settings that change the public site straight away, and alerts that keep ringing until someone answers.
   Menu prices come from ../assets/menu-data.js, so totals never come from the customer's phone. */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, sendPasswordResetEmail
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import {
  getFirestore, collection, doc, query, where, orderBy, limit, onSnapshot, getDoc, getDocs,
  setDoc, updateDoc, deleteDoc, runTransaction, serverTimestamp, writeBatch, documentId
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

const OWNER = 'aisuparfaiteria@gmail.com';     // must match isOwner() in firestore.rules
// must match DEFAULTS in assets/backend.js and the defaults in firestore.rules
const DEFAULTS = { capacity: 20, ordersPaused: false, bookingsPaused: false, closedDays: [], notice: '', soldOut: {}, alertTopic: '' };
const MENU = window.AISU_MENU;
const ORDER_WAIT_MIN = 5;      // a new order nobody has started after this many minutes triggers a reminder
const RES_WAIT_MIN = 15;       // same for a booking nobody has confirmed
const REMIND_EVERY_MS = 3 * 60 * 1000;
const RING_EVERY_MS = 7000;
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ar = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' Ar';
const store = {
  get(k, d){ try{ const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); }catch(e){ return d; } },
  set(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
};

/* ---------------- words ---------------- */
const S = {
  fr: {
    'signin.title':'Connexion du personnel', email:'E-mail', password:'Mot de passe', signin:'Se connecter',
    forgot:'Mot de passe oublié ?', needEmail:"Entrez d'abord votre e-mail.", resetSent:"Si ce compte existe, un e-mail de réinitialisation vient d'être envoyé à {e}.",
    badLogin:'E-mail ou mot de passe incorrect.', tooMany:"Trop d'essais. Attendez quelques minutes puis réessayez.", netErr:'Pas de connexion internet. Réessayez.',
    'denied.title':"Ce compte n'a pas accès", 'denied.body':"Demandez au propriétaire d'ajouter {e} dans l'onglet Équipe, puis reconnectez-vous.", signout:'Se déconnecter', 'signout.short':'Quitter',
    'tab.today':"Aujourd'hui", 'tab.orders':'Commandes', 'tab.tables':'Réservations', 'tab.menu':'Carte', 'tab.reports':'Chiffres', 'tab.settings':'Réglages', 'tab.team':'Équipe',
    search:'Rechercher', 'search.ph':'Nom, téléphone ou référence', 'search.hint':'Cherche dans les 300 dernières réservations et commandes.', 'search.none':'Aucun résultat.', loading:'Chargement…',
    offline:'Hors ligne : les nouveautés apparaîtront au retour de la connexion.',
    'alerts.ok':'Alertes activées', 'alerts.off':'Alertes : activer', unlock:'Touchez ici pour réactiver le son des alertes', see:'Voir',
    'q.orders':'Commandes en ligne', 'q.bookings':'Réservations en ligne', 'q.open':'Ouvertes : les clients peuvent commander', 'q.openB':'Ouvertes : les clients peuvent réserver',
    'q.paused':'En pause : le site ne prend plus de commandes', 'q.pausedB':'En pause : le site ne prend plus de réservations',
    'st.orders.on':'Commandes en ligne ouvertes', 'st.orders.off':'Commandes en ligne en pause', 'st.book.on':'Réservations en ligne ouvertes', 'st.book.off':'Réservations en ligne en pause',
    's.online':'Sur le site', 's.onlineHint':"Mettez en pause un jour de grande affluence : les clients voient un message et peuvent toujours vous appeler.",
    'setup.title':'Pour ne manquer aucune commande sur cet appareil', 'setup.sound':"Sonnerie à chaque nouvelle commande ou réservation", 'setup.soundBtn':'Activer et tester',
    'setup.wake':"Garder l'écran allumé (la page doit rester ouverte)", 'setup.wakeBtn':'Activer', 'setup.notif':"Notifications quand la page est en arrière-plan", 'setup.notifBtn':'Autoriser',
    'setup.phone':'Faire sonner aussi les téléphones de l\'équipe', 'setup.phoneBtn':'Configurer', done:'Fait',
    'tile.todo':'Commandes à préparer', 'tile.ready':'Prêtes, à récupérer', 'tile.tables':"Réservations aujourd'hui", 'tile.sales':'Ventes du jour (récupérées)', guestsShort:'{n} pers.',
    'next.orders':'Prochains retraits', 'next.tables':'Prochaines tables', 'next.noneO':'Aucune commande à venir.', 'next.noneT':"Plus de table prévue aujourd'hui.",
    'to.confirm':'Réservations à confirmer', 'sold.title':'Épuisé en ce moment', 'sold.none':'Tout est disponible.', manage:'Gérer', edit:'Modifier',
    'notice.live':'Message affiché sur le site',
    'col.new':'Nouvelles', 'col.preparing':'En préparation', 'col.ready':'Prêtes', 'col.done':'Récupérées et annulées', 'empty.col':'Rien ici.',
    today:"Aujourd'hui", tomorrow:'Demain', total:'Total', priceCheck:'prix à vérifier', justNow:"à l'instant", ago:'reçue il y a {n} min', by:'par {n}',
    'due.in':'dans {n} min', 'due.now':'maintenant', 'due.late':'en retard de {n} min', 'due.h':'dans {h} h {m}',
    'act.start':'Commencer', 'act.ready':'Prête', 'act.collected':'Récupérée', 'act.cancel':'Annuler', 'act.sure':"Confirmer l'annulation", back:'Revenir',
    'act.confirm':'Confirmer', 'act.seat':'Arrivés', 'act.noshow':'Absents',
    'o.new':'Nouvelle', 'o.preparing':'En préparation', 'o.ready':'Prête', 'o.collected':'Récupérée', 'o.cancelled':'Annulée',
    'r.new':'À confirmer', 'r.confirmed':'Confirmée', 'r.seated':'Arrivés', 'r.noshow':'Absents', 'r.cancelled':'Annulée',
    'moved.o':'{r} : {s}', 'moved.r':'{n} : {s}', undo:'Annuler', undone:'Annulé.',
    'tables.title':'{d}', 'tables.sum':'{b} réservations · {g} personnes', 'tables.empty':'Aucune réservation ce jour-là.', guests:'{n} pers.', table:'Table {n}', staffMade:'ajoutée par l\'équipe',
    'day.closed':'Fermé ce jour (site)', 'day.open':'Fermer ce jour sur le site', 'day.closedChip':'fermé',
    'res.add':'Réservation', 'res.addLong':'Nouvelle réservation', 'res.editTitle':'Modifier la réservation', 'res.newTitle':'Nouvelle réservation',
    'f.name':'Nom', 'f.phone':'Téléphone', 'f.date':'Date', 'f.time':'Heure', 'f.guests':'Personnes', 'f.table':'Table n°', 'f.occasion':'Pour', 'f.seat':'Place', 'f.status':'Statut', 'f.staffNote':"Note de l'équipe (visible seulement ici)",
    'f.namePh':'Client sur place', 'f.over':'Ce créneau dépassera la limite ({n} / {c} personnes). Vous pouvez quand même enregistrer.', 'f.errDate':'Choisissez une date.', walkin:'Client sur place',
    cancel:'Annuler', save:'Enregistrer', saved:'Enregistré', add:'Ajouter', copy:'Copier', copied:'Copié',
    'occ.cafe':'Café & parfaits', 'occ.brunch':'Brunch', 'occ.peppa':'Peppa Pig Afternoon Tea', 'occ.classique':'Afternoon Tea Classique', 'occ.gourmand':'Afternoon Tea Gourmand',
    'seat.table':'Table', 'seat.booth':'Banquette', 'seat.outside':'Extérieur', 'seat.any':'Sans préférence',
    'opt.hot':'chaud', 'opt.cold':'froid', 'opt.glass':'verre', 'opt.pitcher':'pichet',
    'type.order':'Commande', 'type.res':'Réservation', pickup:'Retrait',
    'menu.title':'Ce qui est disponible', 'menu.hint':"Touchez un article pour le marquer épuisé. Le site l'affiche aussitôt « Épuisé » et ne le vend plus. Touchez à nouveau quand il revient.",
    'menu.filter':'Chercher un article', 'menu.restock':'Tout remettre en stock', 'menu.sure':'Confirmer', avail:'Disponible', soldout:'Épuisé',
    'm.parfaits':'Parfaits', 'm.extras':'Brunch : palettes glacées', 'm.both':'toutes tailles', nSold:'{n} épuisés',
    'g.esp':'Espressos & classiques', 'g.latte':'Cafés latte', 'g.sans':'Sans café', 'g.matcha':'Sélection matcha', 'g.thes':'Thés glacés signature', 'g.jus':'Jus & smoothies', 'g.avo':'Avocat & milkshake',
    'r.today':"Aujourd'hui", 'r.7':'7 jours', 'r.30':'30 jours', 'r.csv':'Télécharger (CSV)', 'r.top':'Les plus vendus', 'r.none':'Pas encore de ventes sur cette période.',
    'r.sales':'Ventes', 'r.orders':'Commandes récupérées', 'r.avg':'Panier moyen', 'r.cancel':'Commandes annulées', 'r.byHour':'Ventes par heure de retrait', 'r.byDay':'Ventes par jour',
    'r.bookings':'Réservations', 'r.guests':'Personnes venues ou attendues', 'r.noshow':'Absents', 'r.rcancel':'Réservations annulées',
    'r.note':'Les ventes comptent les commandes en ligne récupérées, aux prix de la carte. Les ventes au comptoir ne sont pas ici.',
    'cap.label':'Personnes maximum par demi-heure', 'cap.hint':"Le formulaire de réservation n'affiche plus une heure dès que ce nombre est atteint. Les réservations ajoutées ici peuvent dépasser.",
    'closed.title':'Jours de fermeture exceptionnelle', 'closed.hint':'Ces jours-là, le site ne propose ni réservation ni retrait de commande.', 'closed.none':'Aucun jour fermé.',
    'notice.title':'Message sur le site', 'notice.hint':'Affiché en haut du site dans toutes les langues, par exemple « Fermé ce samedi pour un événement privé ». 200 caractères maximum.',
    'notice.publish':'Publier', 'notice.clear':'Retirer', 'notice.done':'Publié', 'notice.removed':'Retiré',
    'dev.title':'Alertes sur cet appareil', 'dev.hint':"À régler sur l'appareil qui reste au comptoir. Chaque nouvelle commande ou réservation remplit l'écran et sonne jusqu'à ce que quelqu'un réponde.",
    'dev.sound':'Sonnerie', 'dev.volume':'Volume', 'dev.test':'Tester', 'dev.remind':'Sonner à nouveau si une commande attend plus de 5 min ou est en retard', 'dev.wake':"Garder l'écran allumé",
    'dev.notif':'Autoriser les notifications', 'notif.on':'Notifications autorisées', 'notif.denied':'Bloquées dans le navigateur : changez-le dans les réglages du site.', 'notif.na':'Pas disponibles sur ce navigateur. Sur iPhone, ajoutez d\'abord cette page à l\'écran d\'accueil.',
    'wake.na':'Pas disponible sur ce navigateur.',
    'ph.title':'Alertes sur les téléphones', 'ph.hint':"Fait sonner les téléphones de l'équipe à chaque nouvelle commande ou réservation, même si personne ne regarde cet écran. Gratuit, avec l'application ntfy. Le message contient seulement la référence, l'heure et le nombre : jamais de nom ni de numéro.",
    'ph.on':'Activer les alertes téléphone', 'ph.s1':"Installez l'application gratuite « ntfy » sur chaque téléphone (Google Play ou App Store).",
    'ph.s2':"Dans l'application, touchez + puis abonnez-vous à ce code (serveur ntfy.sh, celui par défaut) :",
    'ph.s3':"Sur Android, cochez « Livraison instantanée » au moment de l'abonnement. Puis touchez « Envoyer un test » ci-dessous : chaque téléphone doit sonner.",
    'ph.test':'Envoyer un test', 'ph.new':'Changer le code', 'ph.off':'Désactiver', 'ph.sent':'Envoyé. Les téléphones abonnés devraient sonner dans quelques secondes.', 'ph.fail':"L'envoi a échoué. Vérifiez la connexion.",
    'ph.newSure':'Confirmer : les téléphones devront se réabonner', 'ph.offSure':'Confirmer',
    'cleanup.title':'Nettoyer les anciennes données', 'cleanup.body':'Supprime les réservations et commandes de plus de 12 mois.', 'cleanup.btn':'Supprimer', 'cleanup.sure':'Confirmer la suppression', 'cleanup.done':'{n} enregistrements supprimés.',
    'team.body':"Créez d'abord le compte dans Firebase, Authentication, Users, puis ajoutez son e-mail ici. Seul le propriétaire voit cet onglet.", remove:'Retirer', 'remove.sure':'Confirmer', owner:'Propriétaire', 'team.bad':'Entrez une adresse e-mail valide.', 'team.empty':"Personne n'a encore été ajouté.",
    saveFail:"Impossible d'enregistrer. Vérifiez la connexion et réessayez.",
    'alarm.order':'Nouvelle commande', 'alarm.res':'Nouvelle réservation', 'alarm.start':'Commencer la préparation', 'alarm.confirm':'Confirmer la réservation', 'alarm.seen':"Vu, je m'en occupe", 'alarm.more':'+ {n} autre(s) en attente',
    'alarm.items':'{n} article(s)', 'alarm.pick':'Retrait {d} à {h}', 'alarm.for':'{d} à {h} · {g}',
    'wait.orders':'{n} commande(s) attendent depuis plus de 5 min', 'wait.late':'{n} commande(s) en retard', 'wait.res':'{n} réservation(s) à confirmer',
    'notif.order':'Nouvelle commande {r}', 'notif.res':'Nouvelle réservation {r}', 'test.title':'Test AISU', 'test.body':'Les alertes téléphone fonctionnent.',
    other:'EN'
  },
  en: {
    'signin.title':'Staff sign-in', email:'Email', password:'Password', signin:'Sign in',
    forgot:'Forgot password?', needEmail:'Enter your email first.', resetSent:'If this account exists, a reset email has been sent to {e}.',
    badLogin:'Wrong email or password.', tooMany:'Too many attempts. Wait a few minutes and try again.', netErr:'No internet connection. Try again.',
    'denied.title':"This account doesn't have access", 'denied.body':'Ask the owner to add {e} in the Team tab, then sign in again.', signout:'Sign out', 'signout.short':'Sign out',
    'tab.today':'Today', 'tab.orders':'Orders', 'tab.tables':'Bookings', 'tab.menu':'Menu', 'tab.reports':'Numbers', 'tab.settings':'Settings', 'tab.team':'Team',
    search:'Search', 'search.ph':'Name, phone or reference', 'search.hint':'Searches the latest 300 bookings and orders.', 'search.none':'No results.', loading:'Loading…',
    offline:'Offline: new orders will appear when the connection is back.',
    'alerts.ok':'Alerts on', 'alerts.off':'Turn on alerts', unlock:'Tap here to turn the alert sound back on', see:'Show',
    'q.orders':'Online orders', 'q.bookings':'Online bookings', 'q.open':'Open: customers can order', 'q.openB':'Open: customers can book',
    'q.paused':'Paused: the site takes no orders', 'q.pausedB':'Paused: the site takes no bookings',
    'st.orders.on':'Online orders open', 'st.orders.off':'Online orders paused', 'st.book.on':'Online bookings open', 'st.book.off':'Online bookings paused',
    's.online':'On the website', 's.onlineHint':'Pause them on a very busy day: customers see a message and can still call you.',
    'setup.title':'So this device never misses an order', 'setup.sound':'Ring for every new order or booking', 'setup.soundBtn':'Turn on and test',
    'setup.wake':'Keep the screen on (the page must stay open)', 'setup.wakeBtn':'Turn on', 'setup.notif':'Notifications when the page is in the background', 'setup.notifBtn':'Allow',
    'setup.phone':"Ring the team's phones too", 'setup.phoneBtn':'Set up', done:'Done',
    'tile.todo':'Orders to prepare', 'tile.ready':'Ready for pickup', 'tile.tables':'Bookings today', 'tile.sales':'Sales today (collected)', guestsShort:'{n} guests',
    'next.orders':'Next pickups', 'next.tables':'Next tables', 'next.noneO':'No orders coming up.', 'next.noneT':'No more tables today.',
    'to.confirm':'Bookings to confirm', 'sold.title':'Sold out right now', 'sold.none':'Everything is available.', manage:'Manage', edit:'Edit',
    'notice.live':'Notice shown on the website',
    'col.new':'New', 'col.preparing':'Preparing', 'col.ready':'Ready', 'col.done':'Collected and cancelled', 'empty.col':'Nothing here.',
    today:'Today', tomorrow:'Tomorrow', total:'Total', priceCheck:'check price', justNow:'just now', ago:'received {n} min ago', by:'by {n}',
    'due.in':'in {n} min', 'due.now':'now', 'due.late':'{n} min late', 'due.h':'in {h} h {m}',
    'act.start':'Start', 'act.ready':'Ready', 'act.collected':'Collected', 'act.cancel':'Cancel', 'act.sure':'Confirm cancel', back:'Back',
    'act.confirm':'Confirm', 'act.seat':'Arrived', 'act.noshow':'No-show',
    'o.new':'New', 'o.preparing':'Preparing', 'o.ready':'Ready', 'o.collected':'Collected', 'o.cancelled':'Cancelled',
    'r.new':'To confirm', 'r.confirmed':'Confirmed', 'r.seated':'Arrived', 'r.noshow':'No-show', 'r.cancelled':'Cancelled',
    'moved.o':'{r}: {s}', 'moved.r':'{n}: {s}', undo:'Undo', undone:'Undone.',
    'tables.title':'{d}', 'tables.sum':'{b} bookings · {g} guests', 'tables.empty':'No bookings this day.', guests:'{n} guests', table:'Table {n}', staffMade:'added by staff',
    'day.closed':'Closed this day (website)', 'day.open':'Close this day on the website', 'day.closedChip':'closed',
    'res.add':'Booking', 'res.addLong':'New booking', 'res.editTitle':'Edit booking', 'res.newTitle':'New booking',
    'f.name':'Name', 'f.phone':'Phone', 'f.date':'Date', 'f.time':'Time', 'f.guests':'Guests', 'f.table':'Table no.', 'f.occasion':'For', 'f.seat':'Seat', 'f.status':'Status', 'f.staffNote':'Staff note (only shown here)',
    'f.namePh':'Walk-in', 'f.over':'This time will go over the limit ({n} / {c} guests). You can still save.', 'f.errDate':'Choose a date.', walkin:'Walk-in',
    cancel:'Cancel', save:'Save', saved:'Saved', add:'Add', copy:'Copy', copied:'Copied',
    'occ.cafe':'Coffee & parfaits', 'occ.brunch':'Brunch', 'occ.peppa':'Peppa Pig Afternoon Tea', 'occ.classique':'Afternoon Tea Classique', 'occ.gourmand':'Afternoon Tea Gourmand',
    'seat.table':'Table', 'seat.booth':'Booth', 'seat.outside':'Outside', 'seat.any':'No preference',
    'opt.hot':'hot', 'opt.cold':'iced', 'opt.glass':'glass', 'opt.pitcher':'pitcher',
    'type.order':'Order', 'type.res':'Booking', pickup:'Pickup',
    'menu.title':"What's available", 'menu.hint':'Tap an item to mark it sold out. The website shows it as "Sold out" straight away and stops selling it. Tap again when it\'s back.',
    'menu.filter':'Find an item', 'menu.restock':'Everything back in stock', 'menu.sure':'Confirm', avail:'Available', soldout:'Sold out',
    'm.parfaits':'Parfaits', 'm.extras':'Brunch: ice-cream palettes', 'm.both':'all sizes', nSold:'{n} sold out',
    'g.esp':'Espressos & classics', 'g.latte':'Lattes', 'g.sans':'Coffee-free', 'g.matcha':'Matcha selection', 'g.thes':'Signature iced teas', 'g.jus':'Juices & smoothies', 'g.avo':'Avocado & milkshake',
    'r.today':'Today', 'r.7':'7 days', 'r.30':'30 days', 'r.csv':'Download (CSV)', 'r.top':'Best sellers', 'r.none':'No sales in this period yet.',
    'r.sales':'Sales', 'r.orders':'Orders collected', 'r.avg':'Average order', 'r.cancel':'Orders cancelled', 'r.byHour':'Sales by pickup hour', 'r.byDay':'Sales by day',
    'r.bookings':'Bookings', 'r.guests':'Guests seated or expected', 'r.noshow':'No-shows', 'r.rcancel':'Bookings cancelled',
    'r.note':'Sales count collected online orders at menu prices. Counter sales are not included.',
    'cap.label':'Most guests per half hour', 'cap.hint':'The booking form stops offering a time once this many guests are booked. Bookings you add here can go over.',
    'closed.title':'Extra closing days', 'closed.hint':'On these days the website offers no bookings and no order pickups.', 'closed.none':'No closing days.',
    'notice.title':'Website notice', 'notice.hint':'Shown at the top of the website in every language, for example "Closed this Saturday for a private event". 200 characters at most.',
    'notice.publish':'Publish', 'notice.clear':'Remove', 'notice.done':'Published', 'notice.removed':'Removed',
    'dev.title':'Alerts on this device', 'dev.hint':'Set these on the device that stays at the counter. Every new order or booking fills the screen and rings until someone answers it.',
    'dev.sound':'Ringing', 'dev.volume':'Volume', 'dev.test':'Test', 'dev.remind':'Ring again if an order waits more than 5 min or runs late', 'dev.wake':'Keep the screen on',
    'dev.notif':'Allow notifications', 'notif.on':'Notifications allowed', 'notif.denied':"Blocked in the browser: change it in this site's settings.", 'notif.na':'Not available in this browser. On iPhone, add this page to the Home Screen first.',
    'wake.na':'Not available in this browser.',
    'ph.title':'Phone alerts', 'ph.hint':"Rings the team's phones for every new order or booking, even when nobody is looking at this screen. Free, with the ntfy app. The message only carries the reference, time and size: never a name or number.",
    'ph.on':'Turn on phone alerts', 'ph.s1':'Install the free "ntfy" app on each phone (Google Play or App Store).',
    'ph.s2':'In the app, tap + and subscribe to this code (server ntfy.sh, the default):',
    'ph.s3':'On Android, tick "Instant delivery" when subscribing. Then tap "Send a test" below: every phone should ring.',
    'ph.test':'Send a test', 'ph.new':'Change the code', 'ph.off':'Turn off', 'ph.sent':'Sent. Subscribed phones should ring within a few seconds.', 'ph.fail':'Sending failed. Check the connection.',
    'ph.newSure':'Confirm: phones will need to subscribe again', 'ph.offSure':'Confirm',
    'cleanup.title':'Clear old records', 'cleanup.body':'Deletes bookings and orders older than 12 months.', 'cleanup.btn':'Delete', 'cleanup.sure':'Confirm delete', 'cleanup.done':'{n} records deleted.',
    'team.body':'First create the login in Firebase, Authentication, Users, then add the email here. Only the owner sees this tab.', remove:'Remove', 'remove.sure':'Confirm', owner:'Owner', 'team.bad':'Enter a valid email address.', 'team.empty':'No one added yet.',
    saveFail:"Couldn't save. Check the connection and try again.",
    'alarm.order':'New order', 'alarm.res':'New booking', 'alarm.start':'Start preparing', 'alarm.confirm':'Confirm the booking', 'alarm.seen':"Seen, I'm on it", 'alarm.more':'+ {n} more waiting',
    'alarm.items':'{n} item(s)', 'alarm.pick':'Pickup {d} at {h}', 'alarm.for':'{d} at {h} · {g}',
    'wait.orders':'{n} order(s) waiting more than 5 min', 'wait.late':'{n} order(s) late', 'wait.res':'{n} booking(s) to confirm',
    'notif.order':'New order {r}', 'notif.res':'New booking {r}', 'test.title':'AISU test', 'test.body':'Phone alerts are working.',
    other:'FR'
  }
};
let lang = store.get('aisu-staff-lang', 'fr');
if(!S[lang]) lang = 'fr';
const t = (k, v) => { let s = S[lang][k] ?? S.fr[k] ?? k; if(v) for(const x in v) s = s.split('{' + x + '}').join(v[x]); return s; };

/* ---------------- dates in Madagascar time ---------------- */
function nowParts(){
  const p = new Intl.DateTimeFormat('en-CA', {timeZone: MENU.TZ, year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', hour12:false}).formatToParts(new Date());
  const g = x => (p.find(q => q.type === x) || {}).value;
  return { ymd: `${g('year')}-${g('month')}-${g('day')}`, mins: (parseInt(g('hour'), 10) % 24) * 60 + parseInt(g('minute'), 10) };
}
const ymdDate = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = ymdDate(s); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const loc = () => lang === 'en' ? 'en-GB' : 'fr-FR';
const niceDay = s => ymdDate(s).toLocaleDateString(loc(), {weekday:'long', day:'numeric', month:'long'});
const shortDay = s => ymdDate(s).toLocaleDateString(loc(), {weekday:'short', day:'numeric', month:'short'});
const relDay = s => { const td = nowParts().ymd; return s === td ? t('today') : s === addDays(td, 1) ? t('tomorrow') : shortDay(s); };
const hm = m => lang === 'en'
  ? (() => { const h = Math.floor(m / 60), mm = m % 60, ap = h >= 12 ? 'pm' : 'am', hh = h % 12 || 12; return mm ? `${hh}:${String(mm).padStart(2, '0')} ${ap}` : `${hh} ${ap}`; })()
  : `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}`;
const tsMs = ts => ts && ts.toMillis ? ts.toMillis() : (ts && ts.toDate ? ts.toDate().getTime() : Date.now());
const minsSince = ts => Math.max(0, Math.floor((Date.now() - tsMs(ts)) / 60000));
const firstName = em => String(em || '').split('@')[0];

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
  $$('[data-t]').forEach(el => { el.textContent = t(el.dataset.t); });
  $$('[data-lang-toggle]').forEach(el => { el.textContent = t('other'); });
  $('#searchIn').placeholder = t('search.ph');
  $('#menuFilter').placeholder = t('menu.filter');
  $('#rfName').placeholder = t('f.namePh');
}
document.addEventListener('click', e => {
  if(e.target.closest('[data-lang-toggle]')){
    lang = lang === 'fr' ? 'en' : 'fr'; store.set('aisu-staff-lang', lang);
    applyText(); renderAll();
  }
  if(e.target.closest('[data-signout]')){ stopAlarm(); stop(); signOut(auth); }
  const go = e.target.closest('[data-go]'); if(go) setView(go.dataset.go);
  if(e.target.closest('[data-close]')){ const d = e.target.closest('dialog'); if(d) d.close(); }
});

/* toast, with an optional Undo */
let toastTimer, toastUndo = null;
function toast(msg, undo){
  $('#toastText').textContent = msg; toastUndo = undo || null;
  $('#toastUndo').hidden = !undo; $('#toast').classList.toggle('has-undo', !!undo);
  $('#toast').classList.add('show'); clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { $('#toast').classList.remove('show'); toastUndo = null; }, undo ? 6000 : 3200);
}
$('#toastUndo').addEventListener('click', async () => {
  const fn = toastUndo; toastUndo = null; $('#toast').classList.remove('show');
  if(fn){ try{ await fn(); toast(t('undone')); }catch(err){ toast(t('saveFail')); } }
});

/* two-tap for anything destructive: the first tap arms the button for 4 seconds */
function armed(btn, key){
  if(btn.classList.contains('armed')) return true;
  btn.classList.add('armed'); const old = btn.textContent; btn.textContent = t(key || btn.dataset.sureKey || 'act.sure');
  setTimeout(() => { btn.classList.remove('armed'); btn.textContent = old; }, 4000);
  return false;
}

/* ================= this device: sound, screen, notifications ================= */
const dev = Object.assign({ sound: false, vol: 0.8, remind: true, wake: false }, store.get('aisu-staff-device', {}));
const saveDev = () => store.set('aisu-staff-device', dev);
let audio = null;
function ensureAudio(){
  if(!audio){ const C = window.AudioContext || window.webkitAudioContext; if(C) audio = new C(); }
  if(audio && audio.state === 'suspended') audio.resume().then(renderAlertState, () => {});
  renderAlertState();
}
const audioReady = () => !!audio && audio.state === 'running';
function tone(f, at, len, type, peak){
  const o = audio.createOscillator(), g = audio.createGain();
  o.type = type; o.frequency.value = f;
  g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(peak, at + .015); g.gain.exponentialRampToValueAtTime(0.0001, at + len);
  o.connect(g).connect(audio.destination); o.start(at); o.stop(at + len + .05);
}
// order: two bright "ding-dong" pairs; booking: a rising three-note call; reminder: a short double knock
function playAlarm(kind){
  if(!dev.sound || !audio) return;
  if(audio.state === 'suspended') audio.resume();
  const v = Math.max(.05, Math.min(1, dev.vol)), n = audio.currentTime + .02;
  const notes = kind === 'res' ? [[784, 0], [988, .22], [1319, .44], [784, .9], [988, 1.12], [1319, 1.34]]
    : kind === 'remind' ? [[1047, 0], [1047, .2]]
    : [[1319, 0], [988, .28], [1319, .7], [988, .98]];
  notes.forEach(([f, at]) => { tone(f, n + at, .55, 'triangle', .9 * v); tone(f * 2, n + at, .3, 'sine', .25 * v); });
}
function buzz(){ try{ if(navigator.vibrate) navigator.vibrate([500, 200, 500, 200, 500]); }catch(e){} }
// browsers only allow sound after a tap: every tap re-wakes it if it went to sleep
document.addEventListener('pointerdown', () => { if(dev.sound && !audioReady()) ensureAudio(); });
$('#unlockBar').addEventListener('click', () => { ensureAudio(); playAlarm('remind'); });

let wakeLock = null;
async function applyWake(){
  if(!('wakeLock' in navigator)) return;
  try{
    if(dev.wake && document.visibilityState === 'visible' && !wakeLock){
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => { wakeLock = null; });
    }else if(!dev.wake && wakeLock){ await wakeLock.release(); wakeLock = null; }
  }catch(e){ wakeLock = null; }
}
document.addEventListener('visibilitychange', () => { applyWake(); if(document.visibilityState === 'visible'){ renderAlertState(); if(dev.sound) ensureAudio(); } });

let swReg = null;
if('serviceWorker' in navigator){ navigator.serviceWorker.register('sw.js').then(r => { swReg = r; }, () => {}); }
const notifSupported = () => 'Notification' in window;
function systemNotify(title, body, tag){
  if(!notifSupported() || Notification.permission !== 'granted' || document.visibilityState === 'visible') return;
  const opts = { body, tag, renotify: true, requireInteraction: true, vibrate: [500, 200, 500], icon: 'icon-192.png', badge: 'icon-192.png' };
  try{ if(swReg) swReg.showNotification(title, opts); else new Notification(title, opts); }catch(e){}
}
async function askNotif(){
  if(!notifSupported()) return;
  try{ await Notification.requestPermission(); }catch(e){}
  renderAlertState();
}

function renderAlertState(){
  const soundOk = dev.sound && audioReady();
  $('#unlockBar').hidden = !(dev.sound && !audioReady() && !$('#shell').hidden);
  const ab = $('#alertBtn');
  ab.classList.toggle('alert-off', !soundOk); ab.setAttribute('aria-pressed', soundOk ? 'true' : 'false');
  $('#alertBtnText').textContent = t(soundOk ? 'alerts.ok' : 'alerts.off');
  // settings panel
  $('#soundIn').checked = dev.sound; $('#volIn').value = dev.vol; $('#remindIn').checked = dev.remind;
  $('#wakeIn').checked = dev.wake; $('#wakeIn').disabled = !('wakeLock' in navigator);
  const ns = !notifSupported() ? 'na' : Notification.permission;
  $('#notifBtn').hidden = ns !== 'default';
  $('#notifState').textContent = ns === 'granted' ? t('notif.on') : ns === 'denied' ? t('notif.denied') : ns === 'na' ? t('notif.na') : '';
  // setup checklist on the Today page
  const steps = [];
  steps.push(['sound', t('setup.sound'), soundOk, t('setup.soundBtn')]);
  if('wakeLock' in navigator) steps.push(['wake', t('setup.wake'), dev.wake, t('setup.wakeBtn')]);
  if(ns === 'default' || ns === 'granted') steps.push(['notif', t('setup.notif'), ns === 'granted', t('setup.notifBtn')]);
  steps.push(['phone', t('setup.phone'), !!settings.alertTopic, t('setup.phoneBtn')]);
  $('#setupCard').hidden = steps.every(s => s[2]);
  $('#setupList').innerHTML = steps.map(([k, txt, ok, btn]) => `<li><span class="t">${esc(txt)}</span>${ok ? `<span class="ok">✓ ${t('done')}</span>` : `<button class="btn btn-fill btn-sm" type="button" data-setup="${k}">${esc(btn)}</button>`}</li>`).join('');
}
function turnSoundOn(){ dev.sound = true; saveDev(); ensureAudio(); setTimeout(() => playAlarm('order'), 120); renderAlertState(); }
document.addEventListener('click', e => {
  const b = e.target.closest('[data-setup]'); if(!b) return;
  const k = b.dataset.setup;
  if(k === 'sound') turnSoundOn();
  if(k === 'wake'){ dev.wake = true; saveDev(); applyWake(); renderAlertState(); }
  if(k === 'notif') askNotif();
  if(k === 'phone'){ setView('settings'); $('#phonePanel').scrollIntoView({block:'center', behavior:'smooth'}); }
});
$('#alertBtn').addEventListener('click', () => {
  if(!dev.sound || !audioReady()) turnSoundOn();
  setView('settings'); $('#devicePanel').scrollIntoView({block:'start', behavior:'smooth'});
});
$('#soundIn').addEventListener('change', e => { dev.sound = e.target.checked; saveDev(); if(dev.sound){ ensureAudio(); playAlarm('order'); } renderAlertState(); });
$('#volIn').addEventListener('change', e => { dev.vol = Number(e.target.value); saveDev(); ensureAudio(); playAlarm('order'); });
$('#testSound').addEventListener('click', () => { if(!dev.sound){ dev.sound = true; saveDev(); } ensureAudio(); playAlarm('order'); buzz(); renderAlertState(); });
$('#remindIn').addEventListener('change', e => { dev.remind = e.target.checked; saveDev(); });
$('#wakeIn').addEventListener('change', e => { dev.wake = e.target.checked; saveDev(); applyWake(); renderAlertState(); });
$('#notifBtn').addEventListener('click', askNotif);

window.addEventListener('online', () => { $('#offline').hidden = true; });
window.addEventListener('offline', () => { $('#offline').hidden = false; });

/* ================= sign in ================= */
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
  stop(); stopAlarm();
  me = user ? (user.email || '').toLowerCase() : null;
  if(!user){ show('login'); applyText(); return; }
  isOwner = me === OWNER;
  if(!isOwner){
    try{ const s = await getDoc(doc(db, 'staff', me)); if(!s.exists()) throw new Error('not staff'); }
    catch(err){ $('#deniedBody').textContent = t('denied.body', {e: me}); show('denied'); applyText(); return; }
  }
  $('#teamTab').hidden = !isOwner; $('#cleanupPanel').hidden = !isOwner;
  $('#whoami').textContent = me;
  show('shell'); applyText(); startLive(); renderAll(); applyWake();
  if(dev.sound) ensureAudio();
});

/* ================= views ================= */
let view = store.get('aisu-staff-view', 'today');
function setView(v){
  if(v === 'team' && !isOwner) v = 'today';
  view = v; store.set('aisu-staff-view', v);
  $$('.tabs [data-view]').forEach(x => x.setAttribute('aria-selected', x.dataset.view === view));
  $$('[data-panel]').forEach(p => { p.hidden = p.dataset.panel !== view; });
  if(view === 'reports') loadReports();
  if(view === 'tables') renderTables();
  window.scrollTo({top: 0});
}
document.querySelector('.tabs').addEventListener('click', e => { const b = e.target.closest('[data-view]'); if(b) setView(b.dataset.view); });

/* ================= live data ================= */
let orders = [], resFuture = [], resPast = null, settings = {...DEFAULTS}, settingsLoaded = false, staffList = [];
let tablesDay = nowParts().ymd, liveDay = null, pastUnsub = null;
let firstOrders = true, firstRes = true;

function startLive(){
  firstOrders = true; firstRes = true;
  const today = nowParts().ymd; liveDay = today;
  if(tablesDay < today) tablesDay = today;
  // every order for today and later (pickups can be a few days out when the café is closed in between)
  unsubs.push(onSnapshot(query(collection(db, 'orders'), where('pickupDay', '>=', today)), snap => {
    const added = firstOrders ? [] : snap.docChanges().filter(ch => ch.type === 'added').map(ch => ch.doc.id);
    orders = snap.docs.map(d => ({id: d.id, ...d.data()}));
    if(firstOrders) orders.filter(o => o.status === 'new').forEach(o => markSeen('o:' + o.id));
    added.forEach(id => { const o = orders.find(x => x.id === id); if(o && o.status === 'new') raise('order', o); });
    firstOrders = false;
    syncAlarm(); renderOrders(added); renderToday(); renderWait();
  }, () => {}));
  // every booking from today on: today's tables, the 2-week strip, bookings to confirm, alerts
  unsubs.push(onSnapshot(query(collection(db, 'reservations'), where('date', '>=', today)), snap => {
    const added = firstRes ? [] : snap.docChanges().filter(ch => ch.type === 'added').map(ch => ch.doc.id);
    resFuture = snap.docs.map(d => ({id: d.id, ...d.data()}));
    if(firstRes) resFuture.filter(r => r.status === 'new').forEach(r => markSeen('r:' + r.id));
    added.forEach(id => { const r = resFuture.find(x => x.id === id); if(r && r.status === 'new' && r.source !== 'staff') raise('res', r); });
    firstRes = false;
    syncAlarm(); renderTables(); renderToday(); renderWait();
  }, () => {}));
  unsubs.push(onSnapshot(doc(db, 'settings', 'main'), s => {
    settings = {...DEFAULTS, ...(s.exists() ? s.data() : {})}; settingsLoaded = true;
    renderSettings(); renderTables(); renderToday(); renderMenu(); renderAlertState();
  }, () => {}));
  if(isOwner) unsubs.push(onSnapshot(collection(db, 'staff'), snap => { staffList = snap.docs.map(d => d.id).sort(); renderTeam(); }, () => {}));
  watchPastDay();
  const tick = setInterval(minuteTick, 20000);
  unsubs.push(() => clearInterval(tick));
  unsubs.push(() => { if(pastUnsub){ pastUnsub(); pastUnsub = null; } });
}
function minuteTick(){
  if(nowParts().ymd !== liveDay){ stop(); tablesDay = nowParts().ymd; startLive(); renderAll(); return; }
  renderClock(); renderOrders([]); renderToday(); renderWait(); renderAlertState();
}
// bookings for a past day aren't in the live list; fetch them when someone looks back
function watchPastDay(){
  if(pastUnsub){ pastUnsub(); pastUnsub = null; }
  resPast = null;
  if(tablesDay >= nowParts().ymd) return;
  pastUnsub = onSnapshot(query(collection(db, 'reservations'), where('date', '==', tablesDay)), snap => {
    resPast = snap.docs.map(d => ({id: d.id, ...d.data()})); renderTables();
  }, () => {});
}
const dayList = d => (d >= nowParts().ymd ? resFuture.filter(r => r.date === d) : (resPast || [])).slice().sort((a, b) => a.time - b.time);

/* ================= alerts ================= */
const seen = new Set(store.get('aisu-staff-seen', []));
function markSeen(key){ seen.add(key); const a = [...seen]; store.set('aisu-staff-seen', a.slice(-400)); }
let queue = [];                       // [{kind, id}] waiting for someone to answer
let ringTimer = null, titleTimer = null;
function raise(kind, item){
  const key = (kind === 'order' ? 'o:' : 'r:') + item.id;
  if(seen.has(key) || queue.some(q => q.key === key)) return;
  queue.push({kind, id: item.id, key});
  systemNotify(t(kind === 'order' ? 'notif.order' : 'notif.res', {r: item.ref}), alarmSummary(kind, item), key);
  buzz();
}
const findItem = q => q.kind === 'order' ? orders.find(o => o.id === q.id) : resFuture.find(r => r.id === q.id);
function alarmSummary(kind, x){
  if(kind === 'order'){ const n = (x.items || []).reduce((a, l) => a + (l.q || 0), 0); return `${t('alarm.items', {n})} · ${t('alarm.pick', {d: relDay(x.pickupDay).toLowerCase(), h: hm(x.pickupTime)})}`; }
  return t('alarm.for', {d: relDay(x.date), h: hm(x.time), g: t('guests', {n: x.guests})});
}
// keep only items still waiting: if another device already started the order, this one stops ringing
function syncAlarm(){
  queue = queue.filter(q => { const x = findItem(q); return x && x.status === 'new' && !seen.has(q.key); });
  const dlg = $('#alarm');
  if(!queue.length){ stopAlarm(); return; }
  const q = queue[0], x = findItem(q);
  $('#alarmTitle').textContent = t(q.kind === 'order' ? 'alarm.order' : 'alarm.res');
  if(q.kind === 'order'){
    const lines = (x.items || []).map(it => ({...itemLine(it), q: it.q}));
    $('#alarmCard').innerHTML = `<div class="big">${t('alarm.pick', {d: relDay(x.pickupDay).toLowerCase(), h: hm(x.pickupTime)})}</div>
      <div><b>${esc(x.name)}</b> · <span class="ref">${esc(x.ref)}</span></div>
      <ul class="items">${lines.map(l => `<li><span><span class="q">${l.q}×</span>${esc(l.name)}</span></li>`).join('')}</ul>${x.notes ? `<div class="note">${esc(x.notes)}</div>` : ''}`;
    $('#alarmAct').textContent = t('alarm.start');
  }else{
    $('#alarmCard').innerHTML = `<div class="big">${esc(t('alarm.for', {d: relDay(x.date), h: hm(x.time), g: t('guests', {n: x.guests})}))}</div>
      <div><b>${esc(x.name)}</b> · ${esc(t('occ.' + x.occasion))} · <span class="ref">${esc(x.ref)}</span></div>${x.notes ? `<div class="note">${esc(x.notes)}</div>` : ''}`;
    $('#alarmAct').textContent = t('alarm.confirm');
  }
  $('#alarmMore').hidden = queue.length < 2; $('#alarmMore').textContent = t('alarm.more', {n: queue.length - 1});
  if(!dlg.open){ try{ dlg.showModal(); }catch(e){ dlg.setAttribute('open', ''); } }
  if(!ringTimer){
    const ring = () => { const k = queue[0] ? queue[0].kind : 'order'; playAlarm(k === 'res' ? 'res' : 'order'); };
    ring(); ringTimer = setInterval(() => { ring(); if(document.visibilityState !== 'visible') buzz(); }, RING_EVERY_MS);
  }
  if(!titleTimer){ let on = false; titleTimer = setInterval(() => { on = !on; document.title = on ? '🔔 ' + $('#alarmTitle').textContent.toUpperCase() : baseTitle(); }, 900); }
}
function stopAlarm(){
  clearInterval(ringTimer); ringTimer = null; clearInterval(titleTimer); titleTimer = null;
  const dlg = $('#alarm'); if(dlg.open) dlg.close();
  document.title = baseTitle();
}
$('#alarm').addEventListener('cancel', e => e.preventDefault());   // Escape doesn't silence it: someone has to answer
$('#alarmSeen').addEventListener('click', () => { const q = queue[0]; if(q) markSeen(q.key); syncAlarm(); });
$('#alarmAct').addEventListener('click', async () => {
  const q = queue[0]; if(!q) return;
  markSeen(q.key); syncAlarm();
  try{
    if(q.kind === 'order') await setOrderStatus(q.id, 'preparing');
    else await setResStatus(q.id, 'confirmed');
  }catch(err){ toast(t('saveFail')); }
});

/* the red strip: orders nobody started, late pickups, bookings nobody confirmed */
let lastRemind = 0, waitTarget = 'orders';
function waitingNow(){
  const n = nowParts();
  const lateO = orders.filter(o => (o.status === 'new' || o.status === 'preparing') && (o.pickupDay < n.ymd || (o.pickupDay === n.ymd && o.pickupTime < n.mins)));
  const slowO = orders.filter(o => o.status === 'new' && !lateO.includes(o) && minsSince(o.createdAt) >= ORDER_WAIT_MIN);
  const slowR = resFuture.filter(r => r.status === 'new' && minsSince(r.createdAt) >= RES_WAIT_MIN);
  return {lateO, slowO, slowR};
}
function renderWait(){
  if($('#shell').hidden) return;
  const {lateO, slowO, slowR} = waitingNow(), parts = [];
  if(slowO.length) parts.push(t('wait.orders', {n: slowO.length}));
  if(lateO.length) parts.push(t('wait.late', {n: lateO.length}));
  if(slowR.length) parts.push(t('wait.res', {n: slowR.length}));
  $('#waitBar').hidden = !parts.length; $('#waitText').textContent = parts.join(' · ');
  waitTarget = (slowO.length || lateO.length) ? 'orders' : 'tables';
  if(slowR.length && !slowO.length && !lateO.length){ const first = slowR.slice().sort((a, b) => a.date.localeCompare(b.date))[0]; waitDay = first.date; } else waitDay = null;
  if((slowO.length || lateO.length) && dev.remind && !queue.length && Date.now() - lastRemind > REMIND_EVERY_MS){
    lastRemind = Date.now(); playAlarm('remind'); buzz();
  }
}
let waitDay = null;
$('#waitGo').addEventListener('click', () => { if(waitTarget === 'tables' && waitDay){ tablesDay = waitDay; watchPastDay(); } setView(waitTarget); });
const baseTitle = () => { const n = orders.filter(o => o.status === 'new').length; return n ? `(${n}) AISU · Staff` : 'AISU · Staff'; };

/* ================= today ================= */
function renderClock(){
  const now = new Date();
  $('#clock').textContent = now.toLocaleString(loc(), {timeZone: MENU.TZ, weekday:'short', day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'});
  $('#todayTitle').textContent = niceDay(nowParts().ymd).replace(/^./, c => c.toUpperCase());
}
function renderQuick(){
  [['ordersPaused', 'q.open', 'q.paused', 'st.orders.on', 'st.orders.off'], ['bookingsPaused', 'q.openB', 'q.pausedB', 'st.book.on', 'st.book.off']].forEach(([k, on, off, son, soff]) => {
    const paused = !!settings[k];
    $$(`input[data-open="${k}"]`).forEach(i => { i.checked = !paused; i.disabled = !settingsLoaded; });
    $$(`.qcard[data-q="${k}"]`).forEach(c => { c.classList.toggle('off', paused); c.querySelector('.qt span').textContent = t(paused ? off : on); });
    $$(`[data-state="${k}"]`).forEach(s => { s.textContent = t(paused ? soff : son); });
  });
}
function lrowOrder(o){
  const n = nowParts(), late = o.pickupDay === n.ymd && o.pickupTime < n.mins;
  const next = {new: ['preparing', 'act.start'], preparing: ['ready', 'act.ready'], ready: ['collected', 'act.collected']}[o.status];
  const cnt = (o.items || []).reduce((a, l) => a + (l.q || 0), 0);
  return `<div class="lrow is-${esc(o.status)}${late && o.status !== 'ready' ? ' late' : ''}" style="--stripe:var(--${o.status === 'new' ? 'new' : o.status === 'preparing' ? 'prep' : 'ready'})">
    <span class="tm">${hm(o.pickupTime)}</span><span class="tx"><b>${esc(o.name)}</b><span>${o.pickupDay !== n.ymd ? esc(relDay(o.pickupDay)) + ' · ' : ''}${t('alarm.items', {n: cnt})} · ${t('o.' + o.status)}</span></span>
    ${next ? `<button class="btn btn-fill btn-sm" type="button" data-order="${esc(o.id)}" data-to="${next[0]}">${t(next[1])}</button>` : ''}</div>`;
}
function lrowRes(r, showDay){
  const act = r.status === 'new' ? ['confirmed', 'act.confirm'] : r.status === 'confirmed' ? ['seated', 'act.seat'] : null;
  return `<div class="lrow" style="--stripe:var(--${r.status === 'new' ? 'new' : r.status === 'seated' ? 'ready' : 'line'})">
    <span class="tm">${hm(r.time)}</span><span class="tx"><b>${esc(r.name)}${r.table ? ` · ${esc(t('table', {n: r.table}))}` : ''}</b><span>${showDay ? esc(relDay(r.date)) + ' · ' : ''}${t('guests', {n: r.guests})} · ${esc(t('occ.' + r.occasion))} · ${t('r.' + r.status)}</span></span>
    <button class="btn btn-ghost btn-sm" type="button" data-edit-res="${esc(r.id)}">${t('edit')}</button>
    ${act ? `<button class="btn btn-fill btn-sm" type="button" data-res="${esc(r.id)}" data-to="${act[0]}">${t(act[1])}</button>` : ''}</div>`;
}
function renderToday(){
  if($('#shell').hidden) return;
  renderClock(); renderQuick();
  const n = nowParts(), td = n.ymd;
  const todo = orders.filter(o => o.status === 'new' || o.status === 'preparing');
  const ready = orders.filter(o => o.status === 'ready');
  const todayRes = resFuture.filter(r => r.date === td && r.status !== 'cancelled');
  const sales = orders.filter(o => o.pickupDay === td && o.status === 'collected').reduce((a, o) => a + orderTotal(o).total, 0);
  const tile = (id, num, extra, hot) => { const el = $(id); el.querySelector('.n').innerHTML = `${num}${extra ? `<small>${extra}</small>` : ''}`; el.classList.toggle('hot', !!hot); };
  tile('#tileTodo', todo.length, '', todo.some(o => o.status === 'new'));
  tile('#tileReady', ready.length);
  tile('#tileTables', todayRes.length, esc(t('guestsShort', {n: todayRes.reduce((a, r) => a + r.guests, 0)})));
  tile('#tileSales', ar(sales).replace(' Ar', ''), 'Ar');
  const upcoming = orders.filter(o => ['new', 'preparing', 'ready'].includes(o.status)).sort(byPickup).slice(0, 6);
  $('#nextOrders').innerHTML = upcoming.length ? upcoming.map(lrowOrder).join('') : `<div class="empty">${t('next.noneO')}</div>`;
  const nextT = todayRes.filter(r => (r.status === 'new' || r.status === 'confirmed') && r.time >= n.mins - 30).sort((a, b) => a.time - b.time).slice(0, 6);
  $('#nextTables').innerHTML = nextT.length ? nextT.map(r => lrowRes(r, false)).join('') : `<div class="empty">${t('next.noneT')}</div>`;
  const toC = resFuture.filter(r => r.status === 'new' && !(r.date === td && nextT.includes(r))).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).slice(0, 10);
  $('#toConfirmWrap').hidden = !toC.length; $('#toConfirm').innerHTML = toC.map(r => lrowRes(r, true)).join('');
  const sold = soldList();
  $('#soldChips').innerHTML = sold.length ? sold.map(s => `<button class="chip" type="button" data-sold="${esc(s.key)}">${esc(s.name)} ✕</button>`).join('') : `<span class="sub">${t('sold.none')}</span>`;
  const notice = String(settings.notice || '').trim();
  $('#noticeNow').hidden = !notice; $('#noticeNowText').textContent = notice;
}

/* ================= orders ================= */
function itemLine(it){
  const info = MENU.itemFor(it.k);
  const name = info ? info.name + (info.option ? ` (${t('opt.' + info.option)})` : '') : (it.n || it.k);
  const price = info ? info.price * it.q : null;
  return {name, price};
}
function orderTotal(o){
  const lines = (o.items || []).map(it => ({...itemLine(it), q: it.q}));
  return {lines, unknown: lines.some(l => l.price == null), total: lines.reduce((a, l) => a + (l.price || 0), 0)};
}
const byPickup = (a, b) => (a.pickupDay + String(a.pickupTime).padStart(4, '0')).localeCompare(b.pickupDay + String(b.pickupTime).padStart(4, '0'));
const digits = p => String(p || '').replace(/[^\d+]/g, '');
function waNumber(p){ let d = String(p || '').replace(/\D/g, ''); if(d.startsWith('00')) d = d.slice(2); if(d.length === 10 && d.startsWith('0')) d = '261' + d.slice(1); return d; }
function contactLinks(phone){
  if(!phone) return '';
  return `<a class="contact" href="tel:${esc(digits(phone))}"><svg><use href="#i-phone"/></svg>${esc(phone)}</a><a class="contact" href="https://wa.me/${esc(waNumber(phone))}" target="_blank" rel="noopener"><svg><use href="#i-chat"/></svg>WhatsApp</a>`;
}
function dueText(o){
  const n = nowParts();
  if(o.pickupDay !== n.ymd) return {cls: '', txt: relDay(o.pickupDay)};
  const d = o.pickupTime - n.mins;
  if(d < 0) return {cls: 'late', txt: t('due.late', {n: -d})};
  if(d === 0) return {cls: 'soon', txt: t('due.now')};
  if(d >= 60) return {cls: '', txt: t('due.h', {h: Math.floor(d / 60), m: String(d % 60).padStart(2, '0')})};
  return {cls: d <= 15 ? 'soon' : '', txt: t('due.in', {n: d})};
}
const PREV_O = {preparing: 'new', ready: 'preparing', collected: 'ready'};
function orderCard(o, flash){
  const {lines, unknown, total} = orderTotal(o);
  const next = {new: ['preparing', 'act.start'], preparing: ['ready', 'act.ready'], ready: ['collected', 'act.collected']}[o.status];
  const live = ['new', 'preparing', 'ready'].includes(o.status);
  const due = live ? dueText(o) : {cls: '', txt: relDay(o.pickupDay)};
  const late = live && o.status !== 'ready' && due.cls === 'late';
  return `<article class="card is-${esc(o.status)}${flash ? ' flash' : ''}${late ? ' late' : ''}" data-id="${esc(o.id)}">
    <div class="card-top"><span class="when">${hm(o.pickupTime)}</span><span class="due ${due.cls}">${esc(due.txt)}</span><span class="ref">${esc(o.ref)}</span></div>
    <div class="who"><b>${esc(o.name)}</b>${contactLinks(o.phone)}</div>
    <ul class="items">${lines.map(l => `<li><span><span class="q">${l.q}×</span>${esc(l.name)}</span><span class="pr">${l.price == null ? t('priceCheck') : ar(l.price)}</span></li>`).join('')}</ul>
    <div class="total"><span>${t('total')}</span><span>${ar(total)}${unknown ? ' + ?' : ''}</span></div>
    ${o.notes ? `<div class="note">${esc(o.notes)}</div>` : ''}
    <div class="meta"><span class="chip st-${esc(o.status)}">${t('o.' + o.status)}</span><span>${esc(t('ago', {n: minsSince(o.createdAt)}))}</span>${o.statusBy ? `<span>${esc(t('by', {n: firstName(o.statusBy)}))}</span>` : ''}</div>
    <div class="actions">${PREV_O[o.status] && o.status !== 'collected' ? `<button class="btn btn-ghost btn-back" type="button" data-order="${esc(o.id)}" data-to="${PREV_O[o.status]}" aria-label="${t('back')}">‹ ${t('back')}</button>` : ''}${next ? `<button class="btn btn-fill" type="button" data-order="${esc(o.id)}" data-to="${next[0]}">${t(next[1])}</button>` : ''}${live ? `<button class="btn btn-danger" type="button" data-order="${esc(o.id)}" data-to="cancelled">${t('act.cancel')}</button>` : ''}${o.status === 'collected' || o.status === 'cancelled' ? `<button class="btn btn-ghost btn-sm" type="button" data-order="${esc(o.id)}" data-to="${o.status === 'collected' ? 'ready' : 'new'}">‹ ${t('back')}</button>` : ''}</div>
  </article>`;
}
function renderOrders(fresh){
  if($('#shell').hidden) return;
  const by = s => orders.filter(o => o.status === s).sort(byPickup);
  const col = (id, cnt, list) => { $(id).innerHTML = list.length ? list.map(o => orderCard(o, fresh.includes(o.id))).join('') : `<div class="empty">${t('empty.col')}</div>`; $(cnt).textContent = list.length; };
  col('#colNew', '#nNew', by('new')); col('#colPrep', '#nPrep', by('preparing')); col('#colReady', '#nReady', by('ready'));
  const past = orders.filter(o => o.status === 'collected' || o.status === 'cancelled').sort(byPickup).reverse();
  $('#colPast').innerHTML = past.map(o => orderCard(o, false)).join(''); $('#pastCount').textContent = past.length;
  const n = by('new').length; $('#badgeOrders').textContent = n; $('#badgeOrders').dataset.n = n;
  if(!titleTimer) document.title = baseTitle();
}
async function setOrderStatus(id, to){
  const o = orders.find(x => x.id === id); const from = o ? o.status : null;
  await updateDoc(doc(db, 'orders', id), {status: to, statusAt: serverTimestamp(), statusBy: me});
  markSeen('o:' + id);
  if(from && from !== to) toast(t('moved.o', {r: o.ref, s: t('o.' + to)}), () => updateDoc(doc(db, 'orders', id), {status: from, statusAt: serverTimestamp(), statusBy: me}));
}
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-order]'); if(!b) return;
  if(b.dataset.to === 'cancelled' && !armed(b)) return;
  b.disabled = true;
  try{ await setOrderStatus(b.dataset.order, b.dataset.to); }
  catch(err){ b.disabled = false; toast(t('saveFail')); }
});

/* ================= bookings ================= */
// moving a booking in or out of "cancelled" gives back or takes the guests' places in that half hour
async function setResStatus(id, to){
  const ref = doc(db, 'reservations', id);
  let from = null, name = '';
  await runTransaction(db, async tx => {
    const rs = await tx.get(ref); if(!rs.exists()) return;
    const r = rs.data(); from = r.status; name = r.name; if(from === to) return;
    const delta = (from !== 'cancelled' && to === 'cancelled') ? -r.guests : (from === 'cancelled' && to !== 'cancelled') ? r.guests : 0;
    if(delta){
      const sref = doc(db, 'slots', r.date), ss = await tx.get(sref);
      const g = ss.exists() ? {...(ss.data().g || {})} : {}, k = String(r.time);
      g[k] = Math.max(0, (g[k] || 0) + delta);
      tx.set(sref, {g, last: id});
    }
    tx.update(ref, {status: to, statusAt: serverTimestamp(), statusBy: me});
  });
  markSeen('r:' + id);
  if(from && from !== to){ const back = from; toast(t('moved.r', {n: name, s: t('r.' + to)}), () => setResStatus(id, back).then(() => $('#toast').classList.remove('show'))); }
}
const PREV_R = {confirmed: 'new', seated: 'confirmed', noshow: 'confirmed', cancelled: 'confirmed'};
function resCard(r){
  const acts = {
    new: [['confirmed', 'act.confirm', 'btn-fill'], ['seated', 'act.seat', 'btn-ghost']],
    confirmed: [['seated', 'act.seat', 'btn-fill'], ['noshow', 'act.noshow', 'btn-ghost']]
  }[r.status] || [];
  const cancel = (r.status === 'new' || r.status === 'confirmed') ? `<button class="btn btn-danger" type="button" data-res="${esc(r.id)}" data-to="cancelled">${t('act.cancel')}</button>` : '';
  const back = ['seated', 'noshow', 'cancelled'].includes(r.status) ? `<button class="btn btn-ghost btn-back" type="button" data-res="${esc(r.id)}" data-to="${PREV_R[r.status]}">‹ ${t('back')}</button>` : '';
  return `<article class="card is-${esc(r.status)}">
    <div class="card-top"><span class="when">${hm(r.time)}</span><span class="chip st-${esc(r.status)}">${t('r.' + r.status)}</span>${r.table ? `<span class="chip tbl">${esc(t('table', {n: r.table}))}</span>` : ''}<span class="ref">${esc(r.ref)}</span></div>
    <div class="who"><b>${esc(r.name)}</b>${contactLinks(r.phone)}</div>
    <div class="meta"><span><b style="color:var(--ink)">${t('guests', {n: r.guests})}</b></span><span>${esc(t('occ.' + r.occasion))}</span><span>${esc(t('seat.' + r.seat))}</span>${r.email ? `<span>${esc(r.email)}</span>` : ''}${r.source === 'staff' ? `<span>${t('staffMade')}</span>` : ''}${r.statusBy ? `<span>${esc(t('by', {n: firstName(r.statusBy)}))}</span>` : ''}</div>
    ${r.notes ? `<div class="note">${esc(r.notes)}</div>` : ''}
    ${r.staffNote ? `<div class="note staff">${esc(r.staffNote)}</div>` : ''}
    <div class="actions">${back}${acts.map(a => `<button class="btn ${a[2]}" type="button" data-res="${esc(r.id)}" data-to="${a[0]}">${t(a[1])}</button>`).join('')}<button class="btn btn-ghost" type="button" data-edit-res="${esc(r.id)}">${t('edit')}</button>${cancel}</div>
  </article>`;
}
function bookedAt(day, mins, exceptId){
  return dayList(day).filter(r => r.status !== 'cancelled' && r.time === mins && r.id !== exceptId).reduce((a, r) => a + r.guests, 0);
}
function renderTables(){
  if($('#shell').hidden) return;
  const td = nowParts().ymd;
  if($('#dayPick').value !== tablesDay) $('#dayPick').value = tablesDay;
  $('#tablesTitle').textContent = t('tables.title', {d: niceDay(tablesDay).replace(/^./, c => c.toUpperCase())});
  const closed = (settings.closedDays || []);
  // two weeks ahead, with how many guests each day
  $('#dayStrip').innerHTML = Array.from({length: 14}, (_, i) => addDays(td, i)).map(d => {
    const list = resFuture.filter(r => r.date === d && r.status !== 'cancelled');
    const pending = resFuture.some(r => r.date === d && r.status === 'new');
    return `<button type="button" data-day="${d}" aria-pressed="${d === tablesDay}" class="${closed.includes(d) ? 'closed' : ''}"><b>${esc(d === td ? t('today') : shortDay(d))}${pending ? ' •' : ''}</b><span>${closed.includes(d) ? t('day.closedChip') : list.length ? `${list.length} · ${esc(t('guestsShort', {n: list.reduce((a, r) => a + r.guests, 0)}))}` : '—'}</span></button>`;
  }).join('');
  const isClosed = closed.includes(tablesDay);
  $('#dayClosedIn').checked = isClosed; $('#dayClosedIn').disabled = !settingsLoaded || tablesDay < td;
  $('#dayClosedText').textContent = t(isClosed ? 'day.closed' : 'day.open');
  const list = dayList(tablesDay), live = list.filter(r => r.status !== 'cancelled');
  $('#tablesSummary').textContent = t('tables.sum', {b: live.length, g: live.reduce((a, r) => a + r.guests, 0)});
  // guests per half hour across the opening hours, against the limit
  const h = MENU.HOURS[ymdDate(tablesDay).getDay()], cap = settings.capacity, keys = [];
  if(h) for(let m = h[0]; m < h[1]; m += 30) keys.push(m);
  live.forEach(r => { if(!keys.includes(r.time)) keys.push(r.time); }); keys.sort((a, b) => a - b);
  $('#slotBar').innerHTML = keys.map(k => { const n = live.filter(r => r.time === k).reduce((a, r) => a + r.guests, 0);
    return `<span class="${n >= cap ? 'full' : ''}"><b>${hm(k)}</b>${n} / ${cap}<i style="--p:${Math.min(100, Math.round(n / cap * 100))}%"></i></span>`; }).join('');
  $('#resList').innerHTML = list.length ? list.map(resCard).join('') : `<div class="empty">${t('tables.empty')}</div>`;
  const toConfirm = resFuture.filter(r => r.status === 'new').length; $('#badgeRes').textContent = toConfirm; $('#badgeRes').dataset.n = toConfirm;
}
function goDay(d){ tablesDay = d; watchPastDay(); renderTables(); }
$('#dayPrev').addEventListener('click', () => goDay(addDays(tablesDay, -1)));
$('#dayNext').addEventListener('click', () => goDay(addDays(tablesDay, 1)));
$('#dayPick').addEventListener('change', e => { if(e.target.value) goDay(e.target.value); });
$('#dayStrip').addEventListener('click', e => { const b = e.target.closest('[data-day]'); if(b) goDay(b.dataset.day); });
$('#dayClosedIn').addEventListener('change', e => {
  const set = new Set(settings.closedDays || []);
  if(e.target.checked) set.add(tablesDay); else set.delete(tablesDay);
  saveSettings({closedDays: [...set]});
});
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-res]'); if(!b) return;
  if(b.dataset.to === 'cancelled' && !armed(b)) return;
  b.disabled = true;
  try{ await setResStatus(b.dataset.res, b.dataset.to); }
  catch(err){ b.disabled = false; toast(t('saveFail')); }
});

/* add or edit a booking */
let editing = null;
const OCCASIONS = ['cafe', 'brunch', 'peppa', 'classique', 'gourmand'], SEATS = ['table', 'booth', 'outside', 'any'];
function fillTimes(day, keep){
  const h = MENU.HOURS[ymdDate(day).getDay()] || [540, 1260], opts = [];
  for(let m = h[0]; m <= h[1] - 30; m += 30) opts.push(m);
  if(keep != null && !opts.includes(keep)){ opts.push(keep); opts.sort((a, b) => a - b); }
  const cur = keep != null ? keep : Number($('#rfTime').value);
  $('#rfTime').innerHTML = opts.map(m => `<option value="${m}">${hm(m)}</option>`).join('');
  const n = nowParts(); let pick = opts.includes(cur) ? cur : null;
  if(pick == null) pick = day === n.ymd ? (opts.find(m => m >= n.mins) ?? opts[opts.length - 1]) : opts[0];
  $('#rfTime').value = String(pick);
}
function radio(name, values, labelKey, checked){
  return values.map(v => `<label><input type="radio" name="${name}" value="${v}" ${v === checked ? 'checked' : ''}><span>${esc(t(labelKey + v))}</span></label>`).join('');
}
function openResDialog(r){
  editing = r || null;
  const td = nowParts().ymd;
  $('#resDlgTitle').textContent = t(r ? 'res.editTitle' : 'res.newTitle');
  $('#rfName').value = r ? r.name : ''; $('#rfPhone').value = r ? r.phone : '';
  $('#rfDate').value = r ? r.date : (tablesDay >= td ? tablesDay : td);
  fillTimes($('#rfDate').value, r ? r.time : null);
  $('#rfGuests').value = r ? r.guests : 2; $('#rfTable').value = r ? (r.table || '') : ''; $('#rfNote').value = r ? (r.staffNote || '') : '';
  $('#rfOcc').innerHTML = OCCASIONS.map(o => `<option value="${o}">${esc(t('occ.' + o))}</option>`).join(''); $('#rfOcc').value = r ? r.occasion : 'cafe';
  $('#rfSeat').innerHTML = radio('rfSeat', SEATS, 'seat.', r ? r.seat : 'any');
  const statuses = r ? (r.status === 'new' ? ['new', 'confirmed', 'seated', 'noshow', 'cancelled'] : ['confirmed', 'seated', 'noshow', 'cancelled']) : ['confirmed', 'seated'];
  $('#rfStatus').innerHTML = radio('rfStatus', statuses, 'r.', r ? r.status : 'confirmed');
  $('#rfErr').hidden = true; checkOver();
  $('#resDlg').showModal();
  if(!r) $('#rfName').focus();
}
function checkOver(){
  const day = $('#rfDate').value, m = Number($('#rfTime').value), g = Number($('#rfGuests').value) || 0;
  const st = (document.querySelector('input[name="rfStatus"]:checked') || {}).value;
  if(!day || st === 'cancelled'){ $('#rfWarn').hidden = true; return; }
  const n = bookedAt(day, m, editing && editing.id) + g;
  $('#rfWarn').hidden = n <= settings.capacity; $('#rfWarn').textContent = t('f.over', {n, c: settings.capacity});
}
document.addEventListener('click', e => {
  if(e.target.closest('[data-new-res]')) openResDialog(null);
  const ed = e.target.closest('[data-edit-res]');
  if(ed){ const id = ed.dataset.editRes; const r = resFuture.find(x => x.id === id) || (resPast || []).find(x => x.id === id) || (searchCache || []).find(x => x.kind === 'res' && x.id === id); if(r){ if($('#searchDlg').open) $('#searchDlg').close(); openResDialog(r); } }
});
$('#rfDate').addEventListener('change', () => { if($('#rfDate').value) fillTimes($('#rfDate').value); checkOver(); });
$('#rfTime').addEventListener('change', checkOver);
$('#rfGuests').addEventListener('input', checkOver);
$('#rfStatus').addEventListener('change', checkOver);
$('#resDlg').addEventListener('click', e => {
  const b = e.target.closest('[data-g]'); if(!b) return;
  $('#rfGuests').value = Math.min(40, Math.max(1, (Number($('#rfGuests').value) || 1) + Number(b.dataset.g))); checkOver();
});
const newRef = () => { const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let r = 'AISU-'; for(let i = 0; i < 4; i++) r += a[Math.floor(Math.random() * a.length)]; return r; };
$('#resForm').addEventListener('submit', async e => {
  e.preventDefault();
  const day = $('#rfDate').value, time = Number($('#rfTime').value), guests = Math.round(Number($('#rfGuests').value));
  $('#rfErr').hidden = true;
  if(!day){ $('#rfErr').textContent = t('f.errDate'); $('#rfErr').hidden = false; return; }
  if(!(guests >= 1 && guests <= 40)){ $('#rfGuests').focus(); return; }
  const status = document.querySelector('input[name="rfStatus"]:checked').value;
  const seat = document.querySelector('input[name="rfSeat"]:checked').value;
  const fields = {
    name: ($('#rfName').value.trim() || t('walkin')).slice(0, 80), phone: $('#rfPhone').value.trim().slice(0, 30),
    date: day, time, guests, occasion: $('#rfOcc').value, seat,
    table: $('#rfTable').value.trim().slice(0, 20), staffNote: $('#rfNote').value.trim().slice(0, 300)
  };
  $('#rfSave').disabled = true;
  try{
    if(editing) await saveEdit(editing.id, fields, status);
    else await addBooking(fields, status);
    $('#resDlg').close(); toast(t('saved'));
    if(!editing && day !== tablesDay) goDay(day);
  }catch(err){ $('#rfErr').textContent = t('saveFail'); $('#rfErr').hidden = false; }
  finally{ $('#rfSave').disabled = false; }
});
async function addBooking(f, status){
  const ref = doc(collection(db, 'reservations')), sref = doc(db, 'slots', f.date);
  await runTransaction(db, async tx => {
    const ss = await tx.get(sref);
    const g = ss.exists() ? {...(ss.data().g || {})} : {}, k = String(f.time);
    g[k] = (g[k] || 0) + f.guests;
    tx.set(sref, {g, last: ref.id});
    tx.set(ref, {ref: newRef(), date: f.date, time: f.time, guests: f.guests, occasion: f.occasion, seat: f.seat, name: f.name, phone: f.phone,
      email: '', notes: '', lang: 'fr', status, createdAt: serverTimestamp(), source: 'staff', table: f.table, staffNote: f.staffNote, statusBy: me});
  });
}
async function saveEdit(id, f, status){
  const ref = doc(db, 'reservations', id);
  await runTransaction(db, async tx => {
    const rs = await tx.get(ref); if(!rs.exists()) return;
    const r = rs.data();
    const wasCounted = r.status !== 'cancelled', willCount = status !== 'cancelled';
    const oldRef = doc(db, 'slots', r.date), newRef2 = doc(db, 'slots', f.date);
    const oldSnap = await tx.get(oldRef), newSnap = r.date === f.date ? oldSnap : await tx.get(newRef2);
    const maps = {[r.date]: oldSnap.exists() ? {...(oldSnap.data().g || {})} : {}};
    if(r.date !== f.date) maps[f.date] = newSnap.exists() ? {...(newSnap.data().g || {})} : {};
    let touched = false;
    if(wasCounted){ const k = String(r.time); maps[r.date][k] = Math.max(0, (maps[r.date][k] || 0) - r.guests); touched = true; }
    if(willCount){ const k = String(f.time); maps[f.date][k] = (maps[f.date][k] || 0) + f.guests; touched = true; }
    if(touched){ tx.set(oldRef, {g: maps[r.date], last: id}); if(r.date !== f.date) tx.set(newRef2, {g: maps[f.date], last: id}); }
    // only send what changed: the database rules accept edits to these fields only
    const patch = {};
    for(const k of ['name', 'phone', 'date', 'time', 'guests', 'occasion', 'seat']) if(r[k] !== f[k]) patch[k] = f[k];
    if((r.table || '') !== f.table) patch.table = f.table;
    if((r.staffNote || '') !== f.staffNote) patch.staffNote = f.staffNote;
    if(r.status !== status){ patch.status = status; patch.statusAt = serverTimestamp(); patch.statusBy = me; }
    if(Object.keys(patch).length) tx.update(ref, patch);
  });
  markSeen('r:' + id);
}

/* ================= what's sold out ================= */
function menuEntries(){
  const out = [];
  MENU.PARFAITS.forEach(p => out.push({grp: 'm.parfaits', key: p.id, name: p.name}));
  Object.entries(MENU.EXTRA_ITEMS).forEach(([k, x]) => out.push({grp: 'm.extras', key: k, name: x.name}));
  Object.entries(MENU.CARTE).forEach(([tab, groups]) => groups.forEach((g, gi) => g.items.forEach((it, ii) =>
    out.push({grp: g.g, key: `${tab}-${gi}-${ii}`, name: it[0]}))));
  return out;
}
const soldList = () => { const so = settings.soldOut || {}; return menuEntries().filter(e => so[e.key]); };
function renderMenu(){
  if($('#shell').hidden) return;
  const so = settings.soldOut || {}, q = $('#menuFilter').value.trim().toLowerCase();
  const entries = menuEntries().filter(e => !q || e.name.toLowerCase().includes(q));
  const groups = []; entries.forEach(e => { let g = groups.find(x => x.grp === e.grp); if(!g){ g = {grp: e.grp, items: []}; groups.push(g); } g.items.push(e); });
  $('#menuGroups').innerHTML = groups.map(g => { const n = g.items.filter(e => so[e.key]).length;
    return `<section class="mgroup"><h3>${esc(t(g.grp))}${n ? `<span class="sub" style="color:var(--err)">${t('nSold', {n})}</span>` : ''}</h3>
      ${g.items.map(e => `<div class="mrow${so[e.key] ? ' sold' : ''}" role="switch" tabindex="0" aria-checked="${!so[e.key]}" data-sold="${esc(e.key)}"><span class="nm">${esc(e.name)}</span><span class="state">${t(so[e.key] ? 'soldout' : 'avail')}</span><label class="switch" aria-hidden="true"><input type="checkbox" tabindex="-1" ${so[e.key] ? '' : 'checked'}><span class="track"></span></label></div>`).join('')}</section>`; }).join('');
  const total = Object.keys(so).filter(k => so[k]).length;
  $('#badgeSold').textContent = total; $('#badgeSold').dataset.n = total;
  $('#restockAll').disabled = !total || !settingsLoaded;
}
function toggleSold(key){
  if(!settingsLoaded) return;
  const so = {...(settings.soldOut || {})};
  if(so[key]) delete so[key]; else so[key] = true;
  saveSettings({soldOut: so});
}
document.addEventListener('click', e => { const r = e.target.closest('[data-sold]'); if(r){ e.preventDefault(); toggleSold(r.dataset.sold); } });
document.addEventListener('keydown', e => { const r = e.target.closest && e.target.closest('.mrow[data-sold]'); if(r && (e.key === ' ' || e.key === 'Enter')){ e.preventDefault(); toggleSold(r.dataset.sold); } });
$('#menuFilter').addEventListener('input', renderMenu);
$('#restockAll').addEventListener('click', e => { if(!armed(e.currentTarget, 'menu.sure')) return; saveSettings({soldOut: {}}); });

/* ================= numbers ================= */
let repRange = 1, repData = null;
$('#repRange').addEventListener('click', e => { const b = e.target.closest('[data-range]'); if(!b) return; repRange = Number(b.dataset.range); $$('#repRange [data-range]').forEach(x => x.setAttribute('aria-pressed', x === b)); loadReports(); });
async function loadReports(){
  const td = nowParts().ymd, start = addDays(td, -(repRange - 1));
  $('#repTiles').innerHTML = `<div class="empty" style="grid-column:1/-1">${t('loading')}</div>`; $('#repResTiles').innerHTML = '';
  try{
    const [os, rs] = await Promise.all([
      getDocs(query(collection(db, 'orders'), where('pickupDay', '>=', start))),
      getDocs(query(collection(db, 'reservations'), where('date', '>=', start)))
    ]);
    repData = { start, td,
      orders: os.docs.map(d => ({id: d.id, ...d.data()})).filter(o => o.pickupDay <= td),
      res: rs.docs.map(d => ({id: d.id, ...d.data()})).filter(r => r.date <= td) };
    renderReports();
  }catch(err){ $('#repTiles').innerHTML = `<div class="empty" style="grid-column:1/-1">${t('saveFail')}</div>`; }
}
function renderReports(){
  if(!repData) return;
  const {orders: os, res: rs, start, td} = repData;
  const done = os.filter(o => o.status === 'collected');
  const sales = done.reduce((a, o) => a + orderTotal(o).total, 0);
  const tile = (n, l) => `<div class="tile" style="cursor:default"><span class="n">${n}</span><span class="l">${esc(l)}</span></div>`;
  $('#repTiles').innerHTML = tile(ar(sales).replace(' Ar', '') + '<small>Ar</small>', t('r.sales')) + tile(done.length, t('r.orders'))
    + tile(done.length ? ar(sales / done.length).replace(' Ar', '') + '<small>Ar</small>' : '—', t('r.avg')) + tile(os.filter(o => o.status === 'cancelled').length, t('r.cancel'));
  // bars: by pickup hour for one day, by day otherwise
  let buckets;
  if(repRange === 1){
    const hrs = {}; done.forEach(o => { const h = Math.floor(o.pickupTime / 60); hrs[h] = (hrs[h] || 0) + orderTotal(o).total; });
    const h = MENU.HOURS[ymdDate(td).getDay()] || [540, 1260];
    buckets = []; for(let x = Math.floor(h[0] / 60); x < Math.ceil(h[1] / 60); x++) buckets.push([lang === 'en' ? hm(x * 60) : x + 'h', hrs[x] || 0]);
    $('#repChartTitle').textContent = t('r.byHour');
  }else{
    buckets = []; for(let d = start; d <= td; d = addDays(d, 1)) buckets.push([ymdDate(d).toLocaleDateString(loc(), {day:'numeric', month: repRange > 7 ? 'numeric' : 'short'}), done.filter(o => o.pickupDay === d).reduce((a, o) => a + orderTotal(o).total, 0)]);
    $('#repChartTitle').textContent = t('r.byDay');
  }
  const max = Math.max(1, ...buckets.map(b => b[1]));
  const every = buckets.length > 16 ? Math.ceil(buckets.length / 10) : 1;
  $('#repBars').innerHTML = buckets.map(([l, v], i) => `<div title="${esc(l)} · ${ar(v)}"><i style="height:${Math.round(v / max * 100)}%"></i><span>${i % every === 0 ? esc(l) : '&nbsp;'}</span></div>`).join('');
  const qty = {}; done.forEach(o => (o.items || []).forEach(it => { const n = itemLine(it).name; qty[n] = (qty[n] || 0) + (it.q || 0); }));
  const top = Object.entries(qty).sort((a, b) => b[1] - a[1]).slice(0, 8), tmax = top.length ? top[0][1] : 1;
  $('#repTop').innerHTML = top.length ? top.map(([n, q]) => `<li><span>${esc(n)}</span><b>${q}</b><i style="--p:${Math.round(q / tmax * 100)}%"></i></li>`).join('') : `<li class="sub">${t('r.none')}</li>`;
  const liveR = rs.filter(r => r.status !== 'cancelled');
  $('#repResTiles').innerHTML = tile(liveR.length, t('r.bookings')) + tile(liveR.filter(r => r.status !== 'noshow').reduce((a, r) => a + r.guests, 0), t('r.guests'))
    + tile(rs.filter(r => r.status === 'noshow').length, t('r.noshow')) + tile(rs.filter(r => r.status === 'cancelled').length, t('r.rcancel'));
}
$('#repCsv').addEventListener('click', () => {
  if(!repData) return;
  const q = v => { const s = String(v ?? ''); return /[;"\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  const rows = [['type', 'date', 'heure', 'reference', 'nom', 'telephone', 'statut', 'personnes', 'articles', 'total_ar', 'table', 'note']];
  repData.orders.slice().sort(byPickup).forEach(o => { const {lines, total} = orderTotal(o);
    rows.push(['commande', o.pickupDay, hm(o.pickupTime), o.ref, o.name, o.phone, o.status, '', lines.map(l => `${l.q}x ${l.name}`).join(' | '), total, '', o.notes || '']); });
  repData.res.slice().sort((a, b) => (a.date + String(a.time).padStart(4, '0')).localeCompare(b.date + String(b.time).padStart(4, '0'))).forEach(r =>
    rows.push(['reservation', r.date, hm(r.time), r.ref, r.name, r.phone, r.status, r.guests, r.occasion, '', r.table || '', [r.notes, r.staffNote].filter(Boolean).join(' / ')]));
  const blob = new Blob(['﻿' + rows.map(r => r.map(q).join(';')).join('\r\n')], {type: 'text/csv;charset=utf-8'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `aisu-${repData.start}-${repData.td}.csv`;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
});

/* ================= settings ================= */
function renderSettings(){
  if($('#shell').hidden) return;
  renderQuick();
  if(document.activeElement !== $('#capIn')) $('#capIn').value = settings.capacity;
  const td = nowParts().ymd, days = (settings.closedDays || []).filter(d => d >= td).sort();
  $('#closedList').innerHTML = days.length ? days.map(d => `<button class="chip" type="button" data-unclose="${d}">${esc(niceDay(d))} ✕</button>`).join('') : `<span class="sub">${t('closed.none')}</span>`;
  $('#closedIn').min = td;
  if(document.activeElement !== $('#noticeIn')) $('#noticeIn').value = settings.notice || '';
  $('#noticeCount').textContent = `${$('#noticeIn').value.length} / 200`;
  const topic = settings.alertTopic || '';
  $('#phoneOff').hidden = !!topic; $('#phoneOnBox').hidden = !topic; $('#topicCode').textContent = topic;
}
// The whole settings document is written each time (the rules check its shape); waits until it has loaded once.
async function saveSettings(patch){
  $('#settingsErr').hidden = true;
  if(!settingsLoaded){ toast(t('saveFail')); return false; }
  const td = nowParts().ymd;
  const next = {
    capacity: settings.capacity, ordersPaused: !!settings.ordersPaused, bookingsPaused: !!settings.bookingsPaused,
    closedDays: (settings.closedDays || []).filter(d => d >= td).sort().slice(0, 100), notice: String(settings.notice || '').slice(0, 200),
    soldOut: settings.soldOut || {}, alertTopic: settings.alertTopic || '', ...patch, updatedAt: serverTimestamp(), updatedBy: me
  };
  if(patch.closedDays) next.closedDays = patch.closedDays.filter(d => d >= td).sort().slice(0, 100);
  try{ await setDoc(doc(db, 'settings', 'main'), next); return true; }
  catch(err){ $('#settingsErr').textContent = t('saveFail'); $('#settingsErr').hidden = false; toast(t('saveFail')); renderSettings(); renderMenu(); renderTables(); return false; }
}
document.addEventListener('change', e => {
  const i = e.target.closest('input[data-open]'); if(!i) return;
  saveSettings({[i.dataset.open]: !i.checked});
});
document.addEventListener('click', e => { const b = e.target.closest('[data-cap]'); if(!b) return; $('#capIn').value = Math.min(200, Math.max(1, (Number($('#capIn').value) || 1) + Number(b.dataset.cap))); });
$('#capSave').addEventListener('click', async () => {
  const n = Math.round(Number($('#capIn').value));
  if(!(n >= 1 && n <= 200)){ $('#capIn').focus(); return; }
  if(await saveSettings({capacity: n})){ $('#capMsg').textContent = t('saved'); setTimeout(() => { $('#capMsg').textContent = ''; }, 2500); }
});
$('#closedAdd').addEventListener('click', () => {
  const d = $('#closedIn').value; if(!d || d < nowParts().ymd){ $('#closedIn').focus(); return; }
  saveSettings({closedDays: [...new Set([...(settings.closedDays || []), d])]}); $('#closedIn').value = '';
});
document.addEventListener('click', e => { const b = e.target.closest('[data-unclose]'); if(!b) return; saveSettings({closedDays: (settings.closedDays || []).filter(d => d !== b.dataset.unclose)}); });
$('#noticeIn').addEventListener('input', () => { $('#noticeCount').textContent = `${$('#noticeIn').value.length} / 200`; });
$('#noticeSave').addEventListener('click', async () => {
  if(await saveSettings({notice: $('#noticeIn').value.trim().slice(0, 200)})){ $('#noticeMsg').textContent = t('notice.done'); setTimeout(() => { $('#noticeMsg').textContent = ''; }, 2500); }
});
$('#noticeClear').addEventListener('click', async () => {
  $('#noticeIn').value = '';
  if(await saveSettings({notice: ''})){ $('#noticeMsg').textContent = t('notice.removed'); setTimeout(() => { $('#noticeMsg').textContent = ''; }, 2500); }
});

/* phone alerts through the free ntfy app: the website pings the channel when a booking or order is saved */
const newTopic = () => { const a = 'abcdefghijkmnpqrstuvwxyz23456789'; let s = 'aisu-'; const r = new Uint32Array(18); crypto.getRandomValues(r); r.forEach(x => { s += a[x % a.length]; }); return s; };
$('#phoneOn').addEventListener('click', () => saveSettings({alertTopic: newTopic()}));
$('#phoneNew').addEventListener('click', e => { if(!armed(e.currentTarget, 'ph.newSure')) return; saveSettings({alertTopic: newTopic()}); });
$('#phoneStop').addEventListener('click', e => { if(!armed(e.currentTarget, 'ph.offSure')) return; saveSettings({alertTopic: ''}); });
$('#topicCopy').addEventListener('click', async e => {
  const b = e.currentTarget;
  try{ await navigator.clipboard.writeText(settings.alertTopic || ''); b.textContent = t('copied'); }
  catch(err){ const r = document.createRange(); r.selectNodeContents($('#topicCode')); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
  setTimeout(() => { b.textContent = t('copy'); }, 1600);
});
$('#phoneTest').addEventListener('click', async () => {
  $('#phoneMsg').textContent = '';
  try{
    const r = await fetch('https://ntfy.sh/', {method: 'POST', body: JSON.stringify({topic: settings.alertTopic, title: t('test.title'), message: t('test.body'), priority: 5, tags: ['bell']})});
    $('#phoneMsg').textContent = t(r.ok ? 'ph.sent' : 'ph.fail');
  }catch(err){ $('#phoneMsg').textContent = t('ph.fail'); }
});

$('#cleanupBtn').addEventListener('click', async e => {
  const b = e.currentTarget;
  if(!armed(b, 'cleanup.sure')) return;
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

/* ================= team (owner only) ================= */
function renderTeam(){
  const rows = [`<li><span>${esc(OWNER)}</span><span class="chip">${t('owner')}</span></li>`]
    .concat(staffList.map(em => `<li><span>${esc(em)}</span><button class="btn btn-danger btn-sm" type="button" data-remove="${esc(em)}">${t('remove')}</button></li>`));
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
  if(!armed(b, 'remove.sure')) return;
  b.disabled = true;
  try{ await deleteDoc(doc(db, 'staff', b.dataset.remove)); }catch(err){ b.disabled = false; toast(t('saveFail')); }
});

/* ================= search ================= */
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
  const q = $('#searchIn').value.trim().toLowerCase(), dg = q.replace(/\D/g, '');
  if(!q){ $('#results').innerHTML = ''; return; }
  // live copies are fresher than the cache for anything still on screen
  const fresh = x => (x.kind === 'order' ? orders.find(o => o.id === x.id) : resFuture.find(r => r.id === x.id)) || x;
  const hits = searchCache.filter(x => (x.name || '').toLowerCase().includes(q) || (x.ref || '').toLowerCase().includes(q)
    || (dg.length >= 3 && String(x.phone || '').replace(/\D/g, '').includes(dg))).slice(0, 60).map(x => ({...fresh(x), kind: x.kind}));
  $('#results').innerHTML = hits.length ? hits.map(x => x.kind === 'order'
    ? orderCard(x, false).replace('<div class="card-top">', `<div class="meta"><b>${t('type.order')}</b><span>${t('pickup')} ${esc(niceDay(x.pickupDay))}</span></div><div class="card-top">`)
    : resCard(x).replace('<div class="card-top">', `<div class="meta"><b>${t('type.res')}</b><span>${esc(niceDay(x.date))}</span></div><div class="card-top">`)).join('')
    : `<div class="empty">${t('search.none')}</div>`;
}
$('#searchBtn').addEventListener('click', () => { $('#searchDlg').showModal(); $('#searchIn').focus(); loadSearch(); });
$('#searchIn').addEventListener('input', runSearch);

function renderAll(){ renderClock(); renderToday(); renderOrders([]); renderTables(); renderMenu(); renderSettings(); renderAlertState(); renderWait(); if(isOwner) renderTeam(); if(repData && view === 'reports') renderReports(); if(searchCache) runSearch(); setView(view); }
applyText();
