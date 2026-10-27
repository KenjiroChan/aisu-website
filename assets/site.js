/* AISU website: menu, basket, pickup orders and tracking, bookings, languages.
   Loaded by index.html after menu-data.js and firebase-config.js; backend.js connects it to Firebase. */
(function(){
  /* ================= translations ================= */
  const I18N = {
    fr:{
      "so.tag":"Épuisé","so.toast":"{x} est épuisé pour le moment.","so.cart":"Certains articles sont épuisés. Retirez-les pour continuer.","res.paused":"Les réservations en ligne sont en pause pour le moment. Appelez-nous pour réserver.","err.closed":"Le café est fermé ce jour-là. Choisissez une autre date.","notice.label":"Info du café",
      "res.brunchMoved":"Le brunch est servi le week-end : nous avons choisi le {d}.",
      "send.sending":"Envoi…","err.full":"Ce créneau vient d'être complet. Choisissez une autre heure.","err.resOffline":"Nous n'avons pas pu envoyer votre réservation. Vérifiez votre connexion et réessayez, ou appelez-nous.","err.resRefused":"Votre réservation n'a pas pu être enregistrée. Réessayez, ou appelez-nous.","err.orderOffline":"Nous n'avons pas pu envoyer votre commande. Vérifiez votre connexion et réessayez, ou appelez-nous.","err.orderRefused":"Votre commande n'a pas pu être enregistrée. Réessayez, ou appelez-nous.","err.paused":"Les commandes en ligne sont en pause pour le moment. Commandez au comptoir ou réessayez plus tard.","slot.full":"Complet","done.noteLive":"Nous gardons votre table 15 minutes. Pour modifier ou annuler, appelez-nous avec votre référence.","cart.live":"Gardez ce numéro : il vous sera demandé au comptoir.",
      "tb.label":"Raccourcis","tb.parfaits":"Parfaits","tb.menu":"Carte","tb.brunch":"Brunch","tb.book":"Réserver","tb.order":"Panier","col.layersShow":"Voir les couches","brunch.show":"Voir le menu du brunch","tea.show":"Ce qui est servi","g.avo":"Avocat & milkshake",
      "nav.home":"Accueil","nav.open":"Ouvrir le menu","nav.close":"Fermer le menu","nav.sections":"Sections",
      preview:"Aperçu : les horaires, l'adresse et le numéro de téléphone sont provisoires, et les réservations et commandes ne sont pas encore envoyées.",
      dismiss:"Fermer",
      "nav.parfaits":"Parfaits","nav.menu":"La carte","nav.brunch":"Brunch & tea","nav.reserve":"Réservations","nav.visit":"Nous trouver","nav.book":"Réserver","nav.order":"Commander",
      "st.open":"Ouvert jusqu'à {t}","st.soon":"Ferme bientôt, à {t}","st.today":"Fermé, ouvre aujourd'hui à {t}","st.later":"Fermé, ouvre {d} à {t}",
      today:"aujourd'hui",tomorrow:"demain",Today:"Aujourd'hui",Tomorrow:"Demain",
      "hero.title":"Une parenthèse gourmande entre café, desserts et parfums glacés.",
      "hero.lede":"Chaque parfait est composé minute, pensé par couches, et servi dans une mise en scène délicate inspirée des pâtisseries françaises et des fruits de saison.",
      "hero.order":"Commander à emporter","hero.menu":"Voir les parfaits",
      intro:"Chez AISU, on prend le temps : un espresso le matin, un matcha l'après-midi, et un parfait monté couche par couche quand l'envie vous prend. Le week-end, on sert le brunch à table, on partage un afternoon tea à deux, et la carte de jus pressés à froid se boit sans sucre ajouté.",
      "col.title":"La Collection des Parfaits","col.sub":"Choisissez une création pour voir chaque couche, du fond du verre jusqu'à la dernière touche.","col.layers":"Les couches","col.add":"Ajouter à la commande",
      add:"Ajouter","pal.sub":"Mini saveurs de glaces à composer","pal.4":"4 mini boules, 4 saveurs au choix","pal.6":"6 mini boules, 6 saveurs au choix",
      "fondue.sub":"À partager","fondue.d":"Dix mini boules (5 saveurs) à plonger dans une sauce chocolat, avec fruits de saison, cookies, waffles et noix concassées.",dinein:"Sur place uniquement",
      "offers.title":"À ne pas manquer","offers.sub":"Les moments forts de la semaine chez AISU.","offers.note":"Vos promotions apparaîtront ici",
      "of.brunch.t":"Le Brunch","of.brunch.w":"Samedi 11h30 – 16h00, dimanche 11h30 – 15h00","of.brunch.b":"Viennoiseries, un plat au choix, une boisson chaude et un jus pressé.",
      "of.tea.t":"Afternoon Tea","of.tea.w":"Tous les jours, pour 2 personnes","of.tea.b":"Trois formules à partager, de la Peppa Pig à la Gourmande avec sa coupe de bulles.",
      "of.soda.t":"Crème Soda","of.soda.w":"Tous les jours","of.soda.b":"Soda pomme pétillant, glace vanille et cerise, le petit plaisir de l'après-midi.",
      "of.from":"dès","of.on":"En ce moment","of.today":"Aujourd'hui","of.weekend":"Ce week-end","of.daily":"Tous les jours",
      "menu.title":"La Carte","menu.sub":"Espressos, lattes, matcha, thés glacés et jus pressés à froid. Prix en ariary.","menu.hint":"Touchez un prix pour l'ajouter à votre commande.",
      "tab.cafes":"Cafés","tab.matcha":"Matcha & Thés","tab.jus":"Jus & Smoothies",
      hot:"Chaud",cold:"Froid",glass:"Verre",pitcher:"Pichet",
      "g.esp":"Espressos & classiques","g.latte":"Cafés latte","g.sans":"Sans café","g.matcha":"Sélection matcha","g.thes":"Thés glacés signature","g.jus":"Jus & smoothies","g.jus.sub":"Pressés à froid, sans sucre ajouté",
      "brunch.eyebrow":"Servi à table","brunch.title":"Brunch & Afternoon Tea","brunch.when":"Samedi 11h30 – 16h00, dimanche 11h30 – 15h00","brunch.inc":"Comprend une boisson chaude au choix et un jus de fruits frais pressés 20 cl.","brunch.book":"Réserver le brunch",
      "brunch.start":"Pour commencer","brunch.plates":"Plats au choix","brunch.extra":"Pour compléter",sweet:"sucré",
      "tea.for2":"pour 2 personnes","tea.sal":"Salés","tea.suc":"Sucreries","tea.book":"Réserver","tea.note":"Brunch et afternoon tea sont servis sur place. Réservez votre table pour être sûr d'en profiter.",
      "tea.inc.peppa":"Thé (chaud ou froid) ou chocolat chaud inclus","tea.inc.classique":"Café, thé ou chocolat chaud inclus","tea.inc.gourmand":"Une coupe de bulles par personne, thé chaud ou froid ou chocolat chaud inclus",
      "res.title":"Réserver une table","res.sub":"Réservez jusqu'à 60 jours à l'avance, de 1 à 8 personnes. Nous gardons votre table 15 minutes.",
      "res.date":"Date","res.guests":"Personnes","res.big":"Pour 9 personnes ou plus, appelez-nous au +261 36 08 266 88.","res.for":"Pour quelle occasion ?","for.cafe":"Café & parfaits","for.brunch":"Le Brunch (samedi et dimanche)",
      "res.time":"Heure","res.seat":"Placement","seat.table":"Table","seat.table.d":"En salle","seat.booth":"Banquette","seat.booth.d":"Assise confortable","seat.outside":"Extérieur","seat.outside.d":"En terrasse","seat.any":"Sans préférence","seat.any.d":"La première libre",
      "res.name":"Nom","res.phone":"Téléphone mobile","res.email":"E-mail",optional:"facultatif","res.notes":"Remarques","res.notesHint":"allergies, anniversaire, chaise haute","res.submit":"Réserver la table",
      "res.closed":"Nous sommes fermés ce jour-là. Choisissez une autre date.","res.nomore":"Plus de créneaux aujourd'hui. Choisissez une autre date.","res.brunchOnly":"Le brunch est servi uniquement le samedi et le dimanche. Choisissez un week-end.",
      "err.date":"Choisissez une date dans les 60 prochains jours.","err.time":"Choisissez une heure.","err.name":"Indiquez le nom de la réservation.","err.phone":"Indiquez un numéro de mobile valide.","err.email":"Vérifiez l'adresse e-mail, ou laissez le champ vide.",
      "done.ref":"Référence de réservation","done.date":"Date","done.time":"Heure","done.guests":"Personnes","done.for":"Occasion","done.seat":"Placement","done.name":"Nom",
      "done.note":"Nous gardons votre table 15 minutes. Pour modifier ou annuler, appelez-nous avec votre référence. Aperçu uniquement : cette réservation n'a pas été envoyée au café.","done.again":"Faire une autre réservation",
      "aside.title":"Avant votre visite","aside.1":"Sans réservation, nous vous installons dès qu'une table se libère.","aside.2":"Le brunch est servi le samedi de 11h30 à 16h00 et le dimanche de 11h30 à 15h00.","aside.3":"Pour modifier une réservation, appelez-nous avec votre référence.",
      "skip.title":"Évitez l'attente","skip.body":"Commandez à l'avance et récupérez votre commande au comptoir à l'heure choisie.","skip.btn":"Commander à emporter",
      "closing.title":"Un parfait, un café, et tout le temps qu'il faut.","closing.body":"Le week-end, les tables partent vite. Réservez si vous venez entre amis ou pour le brunch.",
      "foot.contact":"Contact","foot.hours":"Horaires","foot.find":"Nous trouver","foot.addr":"Adresse à venir","foot.brunch":"Brunch : samedi 11h30 – 16h00, dimanche 11h30 – 15h00","foot.tea":"Afternoon tea : tous les jours","tea.when":"Servi tous les jours, pour 2 personnes","foot.legal":"Prix en ariary (Ar)",
      copy:"Copier",copied:"Copié",selected:"Sélectionné",
      "trk.title":"Votre commande","trk.code":"Code de retrait","trk.order":"Commande {r}","trk.s.new":"Reçue","trk.s.preparing":"En préparation","trk.s.ready":"Prête","trk.s.collected":"Récupérée","trk.s.late":"Délai dépassé, appelez-nous","trk.s.cancelled":"Annulée","trk.m.new":"C'est noté ! Nous avons bien reçu votre commande, elle sera prête pour {t}.","trk.m.preparing":"Nous préparons votre commande en ce moment.","trk.m.ready":"Votre commande est prête ! Venez la chercher avant {t}.","trk.m.collected":"Commande récupérée. Bonne dégustation !","trk.m.cancelled":"Cette commande a été annulée. Si c'est une erreur, appelez-nous au {p}.","trk.m.late":"L'heure limite de retrait ({t}) est passée. Appelez-nous au {p} avant de venir.","trk.m.lost":"Nous ne trouvons pas cette commande. Vérifiez le lien, ou appelez-nous au {p}.","trk.when":"Retrait","trk.until":"À récupérer avant","trk.pay":"À payer au comptoir","trk.know":"Bon à savoir","trk.k.code":"Au comptoir, montrez ce code (ou une capture d'écran de cette page). Sans le code, nous vérifierons votre nom et votre numéro de téléphone avant de vous remettre la commande.","trk.k.someone":"Quelqu'un vient à votre place ? Envoyez-lui le lien de cette page, ou simplement le code.","trk.k.cold":"Les articles glacés (❄) sont gardés au froid jusqu'à votre arrivée. Venez à l'heure et dégustez-les vite : ils fondent avec la chaleur.","trk.k.hold":"Nous gardons votre commande jusqu'à {t}. Après, elle n'est plus garantie, surtout les articles glacés : en cas de retard, appelez-nous au {p}.","trk.k.pay":"Vous payez au comptoir, au moment du retrait.","trk.k.where":"Où : {a}","trk.live":"Cette page se met à jour toute seule. Vous pouvez la fermer : rouvrez ce site sur ce téléphone et votre commande s'affichera en bas de l'écran.","trk.share":"Envoyer le lien","trk.copied":"Lien copié","trk.shareText":"Commande AISU {r} · code de retrait {c}","trk.notify":"Me prévenir sur ce téléphone quand c'est prêt","trk.notifyOn":"Vous serez prévenu sur ce téléphone tant que cette page reste ouverte.","trk.readyTitle":"Votre commande AISU est prête","trk.readyBody":"Code de retrait {c} · à récupérer avant {t}","trk.mine":"Vos commandes en cours","trk.see":"Voir","trk.noLive":"Le suivi en direct n'est pas disponible pour cette commande. Gardez votre numéro de commande : il vous sera demandé au comptoir.","co.hold":"Nous gardons votre commande {n} minutes après cette heure, jusqu'à la fermeture.","co.cold":"❄ Les articles glacés sont gardés au froid jusqu'à votre arrivée : venez à l'heure.","cold":"servi glacé",
      "cart.max":"Maximum atteint pour une commande en ligne. Pour une grande commande, appelez-nous.","spam.orders":"Vous avez déjà plusieurs commandes en cours sur ce téléphone. Pour en passer une autre maintenant, appelez-nous au {p}.","spam.bookings":"Vous avez déjà fait plusieurs réservations depuis ce téléphone. Pour en ajouter une, appelez-nous au {p}.","priv.link":"Confidentialité","priv.consent":"Nous utilisons votre nom et votre numéro uniquement pour cette commande ou réservation.","priv.title":"Confidentialité","priv.intro":"AISU Café & Parfaiteria recueille le moins de données possible, uniquement pour vos commandes et réservations.","priv.what.h":"Ce que nous recueillons","priv.what":"Votre nom, votre numéro de téléphone, votre e-mail si vous le donnez, vos remarques, et le détail de votre commande ou réservation.","priv.why.h":"Pourquoi","priv.why":"Pour préparer votre commande ou votre table, et vous appeler si besoin. Jamais de publicité, jamais de revente.","priv.who.h":"Qui y a accès","priv.who":"Seule l'équipe AISU, dans un espace protégé par mot de passe. Les données sont hébergées par Google Firebase (Afrique du Sud) et le site par Cloudflare.","priv.long.h":"Combien de temps","priv.long":"Douze mois au maximum, puis nous les supprimons.","priv.device.h":"Sur votre téléphone","priv.device":"Le site garde votre panier, vos commandes en cours, votre nom et votre numéro pour la prochaine fois, et la langue choisie. Pas de cookies publicitaires ni d'outils de suivi.","priv.rights.h":"Vos droits","priv.rights":"Pour consulter, corriger ou supprimer vos données, appelez-nous au {p}.","priv.recaptcha":"Pour bloquer les robots, ce site utilise reCAPTCHA de Google, soumis à ses règles de confidentialité et conditions d'utilisation.","priv.forget":"Effacer mes informations de ce téléphone","priv.cleared":"C'est effacé de ce téléphone.","cart.title":"Votre commande","cart.checkout":"Retrait","cart.placed":"Commande passée","cart.empty":"Votre commande est vide. Ajoutez un parfait ou une boisson depuis la carte.","cart.browse":"Voir la carte",
      "cart.continue":"Choisir l'heure de retrait","cart.pickup":"Heure de retrait","cart.pickupHint":"Comptez environ 20 minutes de préparation.","cart.name":"Nom","cart.phone":"Téléphone mobile","cart.phoneHint":"pour vous joindre si besoin",
      "cart.notes":"Remarques","cart.notesPh":"Allergies, une cuillère en plus, une bougie","cart.pay":"Réglez au comptoir au moment du retrait.","cart.back":"Retour","cart.place":"Passer la commande","cart.total":"Total",
      "cart.no":"Numéro de commande","cart.ready":"Nous préparons {n} pour {name}, {when}. Réglez au comptoir au retrait.","cart.items1":"1 article","cart.itemsN":"{n} articles","cart.preview":"Aperçu uniquement : cette commande n'a pas été envoyée au café.","cart.new":"Nouvelle commande",
      "cart.added":"{x} ajouté","cart.view":"Voir la commande","cart.errName":"Indiquez le nom pour la commande.","cart.errPhone":"Indiquez un numéro de mobile valide.",
      guests1:"1 personne",guestsN:"{n} personnes"
    },
    en:{
      "so.tag":"Sold out","so.toast":"{x} is sold out right now.","so.cart":"Some items are sold out. Remove them to continue.","res.paused":"Online booking is paused right now. Call us to book.","err.closed":"The café is closed that day. Choose another date.","notice.label":"Café notice",
      "res.brunchMoved":"Brunch is served at weekends, so we've picked {d}.",
      "send.sending":"Sending…","err.full":"That time just filled up. Choose another time.","err.resOffline":"We couldn't send your booking. Check your connection and try again, or call us.","err.resRefused":"Your booking couldn't be saved. Try again, or call us.","err.orderOffline":"We couldn't send your order. Check your connection and try again, or call us.","err.orderRefused":"Your order couldn't be saved. Try again, or call us.","err.paused":"Online orders are paused right now. Order at the counter or try again later.","slot.full":"Full","done.noteLive":"We'll hold your table for 15 minutes. To change or cancel, call us with your reference.","cart.live":"Keep this number; we'll ask for it at the counter.",
      "tb.label":"Shortcuts","tb.parfaits":"Parfaits","tb.menu":"Menu","tb.brunch":"Brunch","tb.book":"Book","tb.order":"Order","col.layersShow":"See the layers","brunch.show":"See the brunch menu","tea.show":"What's on the tray","g.avo":"Avocado & milkshake",
      "nav.home":"Home","nav.open":"Open menu","nav.close":"Close menu","nav.sections":"Sections",
      preview:"Design preview: hours, address and phone number are placeholders, and bookings and orders aren't sent yet.",
      dismiss:"Dismiss",
      "nav.parfaits":"Parfaits","nav.menu":"Menu","nav.brunch":"Brunch & tea","nav.reserve":"Reservations","nav.visit":"Visit","nav.book":"Book a table","nav.order":"Order",
      "st.open":"Open now until {t}","st.soon":"Closing soon, at {t}","st.today":"Closed, opens today at {t}","st.later":"Closed, opens {d} at {t}",
      today:"today",tomorrow:"tomorrow",Today:"Today",Tomorrow:"Tomorrow",
      "hero.title":"A sweet pause between coffee, desserts and frozen flavours.",
      "hero.lede":"Every parfait is built to order, layer by layer, and served with a delicate touch inspired by French pâtisserie and the fruit of the season.",
      "hero.order":"Order for pickup","hero.menu":"See the parfaits",
      intro:"AISU is a place to take your time, with an espresso in the morning, a matcha in the afternoon, and a parfait built layer by layer whenever the mood strikes. On weekends we serve brunch at the table, afternoon tea is made for sharing, and our cold-pressed juices come with no added sugar.",
      "col.title":"The Parfait Collection","col.sub":"Choose a creation to see every layer, from the bottom of the glass to the final touch.","col.layers":"The layers","col.add":"Add to order",
      add:"Add","pal.sub":"Mini scoops to mix and match","pal.4":"4 mini scoops, 4 flavours of your choice","pal.6":"6 mini scoops, 6 flavours of your choice",
      "fondue.sub":"For sharing","fondue.d":"Ten mini scoops (5 flavours) to dip in chocolate sauce, with seasonal fruit, cookies, waffles and crushed nuts.",dinein:"Dine-in only",
      "offers.title":"Don't miss","offers.sub":"The highlights of the week at AISU.","offers.note":"Your promotions will appear here",
      "of.brunch.t":"Weekend Brunch","of.brunch.w":"Saturday 11:30 am – 4 pm, Sunday 11:30 am – 3 pm","of.brunch.b":"Pastries, a main of your choice, a hot drink and a fresh-pressed juice.",
      "of.tea.t":"Afternoon Tea","of.tea.w":"Every day, for two","of.tea.b":"Three sets to share, from Peppa Pig to the Gourmand with a glass of bubbles.",
      "of.soda.t":"Crème Soda","of.soda.w":"Every day","of.soda.b":"Sparkling apple soda, vanilla ice cream and a cherry, the little afternoon treat.",
      "of.from":"from","of.on":"On now","of.today":"Today","of.weekend":"This weekend","of.daily":"Every day",
      "menu.title":"The Menu","menu.sub":"Espressos, lattes, matcha, iced teas and cold-pressed juices. Prices in ariary.","menu.hint":"Tap a price to add it to your order.",
      "tab.cafes":"Coffee","tab.matcha":"Matcha & Tea","tab.jus":"Juices & Smoothies",
      hot:"Hot",cold:"Iced",glass:"Glass",pitcher:"Pitcher",
      "g.esp":"Espressos & classics","g.latte":"Lattes","g.sans":"Coffee-free","g.matcha":"Matcha selection","g.thes":"Signature iced teas","g.jus":"Juices & smoothies","g.jus.sub":"Cold-pressed, no added sugar",
      "brunch.eyebrow":"Served at the table","brunch.title":"Brunch & Afternoon Tea","brunch.when":"Saturday 11:30 am – 4 pm, Sunday 11:30 am – 3 pm","brunch.inc":"Includes a hot drink of your choice and a 20 cl fresh-pressed fruit juice.","brunch.book":"Book brunch",
      "brunch.start":"To start","brunch.plates":"Choose a main","brunch.extra":"On the side",sweet:"sweet",
      "tea.for2":"for 2 people","tea.sal":"Savoury","tea.suc":"Sweet","tea.book":"Book","tea.note":"Brunch and afternoon tea are served in the café. Book a table to make sure you get one.",
      "tea.inc.peppa":"Tea (hot or iced) or hot chocolate included","tea.inc.classique":"Coffee, tea or hot chocolate included","tea.inc.gourmand":"A glass of bubbles each, plus hot or iced tea or hot chocolate",
      "res.title":"Book a table","res.sub":"Book up to 60 days ahead for 1 to 8 people. We hold your table for 15 minutes.",
      "res.date":"Date","res.guests":"Guests","res.big":"For 9 or more, please call us on +261 36 08 266 88.","res.for":"What are you coming for?","for.cafe":"Coffee & parfaits","for.brunch":"Brunch (Saturday and Sunday)",
      "res.time":"Time","res.seat":"Seating","seat.table":"Table","seat.table.d":"Inside","seat.booth":"Booth","seat.booth.d":"Cushioned seating","seat.outside":"Outside","seat.outside.d":"On the terrace","seat.any":"No preference","seat.any.d":"First available",
      "res.name":"Name","res.phone":"Mobile number","res.email":"Email",optional:"optional","res.notes":"Notes","res.notesHint":"allergies, a birthday, a high chair","res.submit":"Book table",
      "res.closed":"We're closed that day. Choose another date.","res.nomore":"No more times today. Choose another date.","res.brunchOnly":"Brunch is only served on Saturday and Sunday. Choose a weekend date.",
      "err.date":"Choose a date within the next 60 days.","err.time":"Choose a time.","err.name":"Enter the name for the booking.","err.phone":"Enter a valid mobile number.","err.email":"Check the email address, or leave it blank.",
      "done.ref":"Booking reference","done.date":"Date","done.time":"Time","done.guests":"Guests","done.for":"For","done.seat":"Seating","done.name":"Name",
      "done.note":"We'll hold your table for 15 minutes. To change or cancel, call us with your reference. Preview only: this booking wasn't sent to the café.","done.again":"Make another booking",
      "aside.title":"Before you visit","aside.1":"Without a booking, we'll seat you as soon as a table is free.","aside.2":"Brunch is served on Saturdays from 11:30 am to 4 pm and on Sundays from 11:30 am to 3 pm.","aside.3":"To change a booking, call us with your reference.",
      "skip.title":"Skip the wait","skip.body":"Order ahead and collect at the counter at the time you choose.","skip.btn":"Order for pickup",
      "closing.title":"A parfait, a coffee, and all the time you need.","closing.body":"Tables go quickly on weekends, so book ahead if you're coming with friends or for brunch.",
      "foot.contact":"Contact","foot.hours":"Opening hours","foot.find":"Find us","foot.addr":"Address to come","foot.brunch":"Brunch: Saturday 11:30 am – 4 pm, Sunday 11:30 am – 3 pm","foot.tea":"Afternoon tea: every day","tea.when":"Served every day, for two","foot.legal":"Prices in ariary (Ar)",
      copy:"Copy",copied:"Copied",selected:"Selected",
      "trk.title":"Your order","trk.code":"Pickup code","trk.order":"Order {r}","trk.s.new":"Received","trk.s.preparing":"Preparing","trk.s.ready":"Ready","trk.s.collected":"Collected","trk.s.late":"Deadline passed, call us","trk.s.cancelled":"Cancelled","trk.m.new":"Got it! We've received your order and will have it ready for {t}.","trk.m.preparing":"We're preparing your order now.","trk.m.ready":"Your order is ready! Come and collect it before {t}.","trk.m.collected":"Order collected. Enjoy!","trk.m.cancelled":"This order was cancelled. If that's a mistake, call us on {p}.","trk.m.late":"The pickup deadline ({t}) has passed. Please call us on {p} before you come.","trk.m.lost":"We can't find this order. Check the link, or call us on {p}.","trk.when":"Pickup","trk.until":"Collect before","trk.pay":"To pay at the counter","trk.know":"Good to know","trk.k.code":"At the counter, show this code (or a screenshot of this page). Without it, we'll check your name and phone number before handing the order over.","trk.k.someone":"Someone collecting for you? Send them the link to this page, or just the code.","trk.k.cold":"Iced items (❄) are kept cold until you arrive. Come on time and enjoy them quickly, as they melt in the heat.","trk.k.hold":"We hold your order until {t}. After that it isn't guaranteed, especially the iced items, so if you're running late, call us on {p}.","trk.k.pay":"You pay at the counter when you collect.","trk.k.where":"Where: {a}","trk.live":"This page updates by itself. You can close it: open this site again on this phone and your order will show at the bottom of the screen.","trk.share":"Send the link","trk.copied":"Link copied","trk.shareText":"AISU order {r} · pickup code {c}","trk.notify":"Alert me on this phone when it's ready","trk.notifyOn":"You'll get an alert on this phone while this page stays open.","trk.readyTitle":"Your AISU order is ready","trk.readyBody":"Pickup code {c} · collect before {t}","trk.mine":"Your current orders","trk.see":"View","trk.noLive":"Live tracking isn't available for this order. Keep your order number: we'll ask for it at the counter.","co.hold":"We hold your order for {n} minutes after this time, until closing.","co.cold":"❄ Iced items are kept cold until you arrive, so please come on time.","cold":"served cold",
      "cart.max":"That's the most we can take online. For a large order, please call us.","spam.orders":"You already have several orders in progress on this phone. To place another one now, call us on {p}.","spam.bookings":"You've already made several bookings from this phone. To add another, call us on {p}.","priv.link":"Privacy","priv.consent":"We only use your name and number for this order or booking.","priv.title":"Privacy","priv.intro":"AISU Café & Parfaiteria collects as little as possible, only for your orders and bookings.","priv.what.h":"What we collect","priv.what":"Your name, your phone number, your e-mail if you give it, your notes, and the details of your order or booking.","priv.why.h":"Why","priv.why":"To prepare your order or your table, and to call you if needed. Never for advertising, never sold.","priv.who.h":"Who can see it","priv.who":"Only the AISU team, in a password-protected area. The data is stored by Google Firebase (South Africa) and the site is hosted by Cloudflare.","priv.long.h":"How long","priv.long":"Twelve months at most, then we delete it.","priv.device.h":"On your phone","priv.device":"The site keeps your basket, your current orders, your name and number for next time, and your chosen language. No advertising cookies or tracking tools.","priv.rights.h":"Your rights","priv.rights":"To see, correct or delete your data, call us on {p}.","priv.recaptcha":"To block robots, this site uses Google reCAPTCHA, subject to Google's privacy policy and terms of service.","priv.forget":"Clear my details from this phone","priv.cleared":"Cleared from this phone.","cart.title":"Your order","cart.checkout":"Pickup details","cart.placed":"Order placed","cart.empty":"Your order is empty. Add a parfait or a drink from the menu.","cart.browse":"Browse the menu",
      "cart.continue":"Choose a pickup time","cart.pickup":"Pickup time","cart.pickupHint":"Orders take about 20 minutes.","cart.name":"Name","cart.phone":"Mobile number","cart.phoneHint":"so we can reach you if needed",
      "cart.notes":"Notes","cart.notesPh":"Allergies, an extra spoon, a candle","cart.pay":"Pay at the counter when you collect.","cart.back":"Back","cart.place":"Place order","cart.total":"Total",
      "cart.no":"Order number","cart.ready":"We're preparing {n} for {name}, {when}. Pay at the counter when you collect.","cart.items1":"1 item","cart.itemsN":"{n} items","cart.preview":"Preview only: this order wasn't sent to the café.","cart.new":"Start a new order",
      "cart.added":"{x} added","cart.view":"View order","cart.errName":"Enter the name for the order.","cart.errPhone":"Enter a valid mobile number.",
      guests1:"1 guest",guestsN:"{n} guests"
    },
    mg:{
      "so.tag":"Lany","so.toast":"Lany aloha ny {x}.","so.cart":"Misy zavatra lany. Esory ireo vao manohy.","res.paused":"Mijanona vonjimaika ny fandrihana an-tserasera. Antsoy izahay raha hamandrika.","err.closed":"Mihidy ny kafe amin'io andro io. Misafidiana daty hafa.","notice.label":"Filazana avy amin'ny kafe",
      "res.brunchMoved":"Amin'ny faran'ny herinandro ihany no misy brunch, ka nofidianay ny {d}.",
      "send.sending":"Mandefa…","err.full":"Feno ity ora ity. Misafidiana ora hafa.","err.resOffline":"Tsy lasa ny fandrihanao. Hamarino ny fifandraisana ary andramo indray, na antsoy izahay.","err.resRefused":"Tsy voatahiry ny fandrihanao. Andramo indray, na antsoy izahay.","err.orderOffline":"Tsy lasa ny kaomandinao. Hamarino ny fifandraisana ary andramo indray, na antsoy izahay.","err.orderRefused":"Tsy voatahiry ny kaomandinao. Andramo indray, na antsoy izahay.","err.paused":"Mijanona vonjimaika ny kaomandy an-tserasera. Manaova kaomandy eo amin'ny kesy na andramo indray afaka kelikely.","slot.full":"Feno","done.noteLive":"Tahirizinay mandritra ny 15 minitra ny latabatrao. Raha hanova na hanafoana dia antsoy izahay ary omeo ny laharana fandrihana.","cart.live":"Tehirizo ity laharana ity; hangatahina aminao eo amin'ny kesy izy.",
      "tb.label":"Hitsin-dalana","tb.parfaits":"Parfaits","tb.menu":"Menio","tb.brunch":"Brunch","tb.book":"Hamandrika","tb.order":"Kaomandy","col.layersShow":"Jereo ny sosona","brunch.show":"Jereo ny menio brunch","tea.show":"Izay aroso","g.avo":"Zavoka sy milkshake",
      "nav.home":"Fandraisana","nav.open":"Sokafy ny menio","nav.close":"Akatony ny menio","nav.sections":"Fizarana",
      preview:"Santionany: mbola vonjimaika ny ora fisokafana, ny adiresy ary ny laharana finday, ary tsy mbola alefa ny fandrihana sy ny kaomandy.",
      dismiss:"Akatona",
      "nav.parfaits":"Parfaits","nav.menu":"Menio","nav.brunch":"Brunch sy tea","nav.reserve":"Fandrihana","nav.visit":"Toerana","nav.book":"Hamandrika","nav.order":"Kaomandy",
      "st.open":"Misokatra hatramin'ny {t}","st.soon":"Efa hihidy amin'ny {t}","st.today":"Mihidy, misokatra anio amin'ny {t}","st.later":"Mihidy, misokatra {d} amin'ny {t}",
      today:"anio",tomorrow:"rahampitso",Today:"Anio",Tomorrow:"Rahampitso",
      "hero.title":"Fialan-tsasatra mamy eo anelanelan'ny kafe, tsindrin-tsakafo ary gilasy.",
      "hero.lede":"Amboarina eo no eo ny parfait tsirairay, sosona isaky ny sosona, ary aroso amin'ny fomba malefaka araka ny fanaon'ny mpanao mofomamy frantsay sy ny voankazo isan-taona.",
      "hero.order":"Kaomandy halaina","hero.menu":"Jereo ny parfaits",
      intro:"Ao amin'ny AISU dia omena fotoana ianao: espresso amin'ny maraina, matcha amin'ny tolakandro, ary parfait voaboatra sosona isaky ny sosona isaky ny maniry ianao. Isaky ny faran'ny herinandro dia misy brunch aroso eo ambony latabatra, afternoon tea iarahana mizara, ary ranom-boankazo voafintina mangatsiaka tsy misy siramamy fanampiny.",
      "col.title":"Ireo Parfait-nay","col.sub":"Misafidiana iray mba hahitana ny sosona rehetra, manomboka any amin'ny fanambanin'ny vera ka hatramin'ny tendrony.","col.layers":"Ny sosona","col.add":"Ampio amin'ny kaomandy",
      add:"Ampio","pal.sub":"Gilasy kely hafangaroinao","pal.4":"Gilasy kely 4, tsiro 4 hosafidianao","pal.6":"Gilasy kely 6, tsiro 6 hosafidianao",
      "fondue.sub":"Iarahana mizara","fondue.d":"Gilasy kely folo (tsiro 5) atsoboka anaty saosy sôkôla, miaraka amin'ny voankazo isan-taona, cookies, waffles ary voanjo voatoto.",dinein:"Hohanina eo an-toerana ihany",
      "offers.title":"Aza diso","offers.sub":"Ireo zava-dehibe amin'ity herinandro ity ao amin'ny AISU.","offers.note":"Hiseho eto ny tolotra manokana",
      "of.brunch.t":"Brunch","of.brunch.w":"Asabotsy 11h30 – 16h00, Alahady 11h30 – 15h00","of.brunch.b":"Mofomamy, sakafo iray hosafidianao, zava-pisotro mafana ary ranom-boankazo voafintina.",
      "of.tea.t":"Afternoon Tea","of.tea.w":"Isan'andro, ho an'olona 2","of.tea.b":"Safidy telo iarahana mizara, manomboka amin'ny Peppa Pig ka hatramin'ny Gourmand miaraka amin'ny divay mitsiranoka.",
      "of.soda.t":"Crème Soda","of.soda.w":"Isan'andro","of.soda.b":"Soda paoma mitsiranoka, gilasy vanily ary serizy, ilay fialamboly kely amin'ny tolakandro.",
      "of.from":"manomboka","of.on":"Izao","of.today":"Anio","of.weekend":"Amin'ity faran'ny herinandro ity","of.daily":"Isan'andro",
      "menu.title":"Ny Menio","menu.sub":"Espresso, latte, matcha, dite mangatsiaka ary ranom-boankazo voafintina. Vidiny amin'ny ariary.","menu.hint":"Tsindrio ny vidiny hampidirana azy ao amin'ny kaomandinao.",
      "tab.cafes":"Kafe","tab.matcha":"Matcha sy Dite","tab.jus":"Ranom-boankazo",
      hot:"Mafana",cold:"Mangatsiaka",glass:"Vera",pitcher:"Siny",
      "g.esp":"Espresso sy kilasika","g.latte":"Kafe latte","g.sans":"Tsy misy kafe","g.matcha":"Matcha voafantina","g.thes":"Dite mangatsiaka manokana","g.jus":"Ranom-boankazo sy smoothie","g.jus.sub":"Voafintina mangatsiaka, tsy misy siramamy fanampiny",
      "brunch.eyebrow":"Aroso eo ambony latabatra","brunch.title":"Brunch sy Afternoon Tea","brunch.when":"Asabotsy 11h30 – 16h00, Alahady 11h30 – 15h00","brunch.inc":"Ahitana zava-pisotro mafana iray hosafidianao sy ranom-boankazo voafintina 20 cl.","brunch.book":"Hamandrika brunch",
      "brunch.start":"Fanombohana","brunch.plates":"Sakafo hosafidianao","brunch.extra":"Fanampiny",sweet:"mamy",
      "tea.for2":"ho an'olona 2","tea.sal":"Masira","tea.suc":"Mamy","tea.book":"Hamandrika","tea.note":"Aroso eto an-toerana ny brunch sy ny afternoon tea. Mamandrika latabatra mba hahazoana antoka.",
      "tea.inc.peppa":"Tafiditra ny dite (mafana na mangatsiaka) na sôkôla mafana","tea.inc.classique":"Tafiditra ny kafe, dite na sôkôla mafana","tea.inc.gourmand":"Divay mitsiranoka iray isan'olona, miampy dite mafana na mangatsiaka na sôkôla mafana",
      "res.title":"Hamandrika latabatra","res.sub":"Afaka mamandrika hatramin'ny 60 andro mialoha ianao, ho an'olona 1 ka hatramin'ny 8. Tahirizinay mandritra ny 15 minitra ny latabatrao.",
      "res.date":"Daty","res.guests":"Olona","res.big":"Raha olona 9 na mihoatra, antsoy amin'ny +261 36 08 266 88 izahay.","res.for":"Ho amin'ny inona?","for.cafe":"Kafe sy parfaits","for.brunch":"Brunch (Asabotsy sy Alahady)",
      "res.time":"Ora","res.seat":"Toerana","seat.table":"Latabatra","seat.table.d":"Ao anatiny","seat.booth":"Seza lava","seat.booth.d":"Seza malemy","seat.outside":"Ivelany","seat.outside.d":"Eny an-kalamanjana","seat.any":"Na aiza na aiza","seat.any.d":"Izay malalaka voalohany",
      "res.name":"Anarana","res.phone":"Laharana finday","res.email":"Mailaka",optional:"tsy voatery","res.notes":"Fanamarihana","res.notesHint":"tsy fahazakana sakafo, fitsingerenan'ny andro nahaterahana, seza ho an'ny zaza","res.submit":"Hamandrika latabatra",
      "res.closed":"Mihidy izahay amin'io andro io. Misafidiana daty hafa.","res.nomore":"Tsy misy ora malalaka intsony anio. Misafidiana daty hafa.","res.brunchOnly":"Asabotsy sy Alahady ihany no misy brunch. Misafidiana faran'ny herinandro.",
      "err.date":"Misafidiana daty ao anatin'ny 60 andro ho avy.","err.time":"Misafidiana ora.","err.name":"Ampidiro ny anarana hanaovana ny fandrihana.","err.phone":"Ampidiro laharana finday marina.","err.email":"Hamarino ny mailaka, na avelao ho foana.",
      "done.ref":"Laharana fandrihana","done.date":"Daty","done.time":"Ora","done.guests":"Olona","done.for":"Ho an'ny","done.seat":"Toerana","done.name":"Anarana",
      "done.note":"Tahirizinay mandritra ny 15 minitra ny latabatrao. Raha hanova na hanafoana dia antsoy izahay ary omeo ny laharana fandrihana. Santionany ihany: tsy nalefa tany amin'ny kafe ity fandrihana ity.","done.again":"Hamandrika indray",
      "aside.title":"Alohan'ny hahatongavanao","aside.1":"Raha tsy nanao fandrihana ianao dia hampipetrahinay raha vao misy latabatra malalaka.","aside.2":"Aroso ny brunch ny Asabotsy manomboka amin'ny 11h30 ka hatramin'ny 16h00, ary ny Alahady manomboka amin'ny 11h30 ka hatramin'ny 15h00.","aside.3":"Raha hanova fandrihana dia antsoy izahay ary omeo ny laharana fandrihana.",
      "skip.title":"Aza miandry","skip.body":"Manaova kaomandy mialoha ary alaivo eo amin'ny kesy amin'ny ora tianao.","skip.btn":"Kaomandy halaina",
      "closing.title":"Parfait iray, kafe iray, ary fotoana ampy ho anao.","closing.body":"Lany haingana ny latabatra amin'ny faran'ny herinandro, ka mamandrika mialoha raha hiaraka amin'ny namana na ho amin'ny brunch ianao.",
      "foot.contact":"Fifandraisana","foot.hours":"Ora fisokafana","foot.find":"Toerana misy anay","foot.addr":"Ho fantatra tsy ho ela ny adiresy","foot.brunch":"Brunch: Asabotsy 11h30 – 16h00, Alahady 11h30 – 15h00","foot.tea":"Afternoon tea: isan'andro","tea.when":"Aroso isan'andro, ho an'olona 2","foot.legal":"Vidiny amin'ny ariary (Ar)",
      copy:"Adikao",copied:"Voadika",selected:"Voafidy",
      "trk.title":"Ny kaomandinao","trk.code":"Kaody fakana","trk.order":"Kaomandy {r}","trk.s.new":"Voaray","trk.s.preparing":"Eo am-panomanana","trk.s.ready":"Vonona","trk.s.collected":"Nalaina","trk.s.late":"Lasa ny fotoana, antsoy izahay","trk.s.cancelled":"Nofoanana","trk.m.new":"Voarainay ny kaomandinao, ary ho vonona amin'ny {t} izy.","trk.m.preparing":"Eo am-panomanana ny kaomandinao izahay izao.","trk.m.ready":"Vonona ny kaomandinao! Avia haka azy alohan'ny {t}.","trk.m.collected":"Nalaina ny kaomandy. Mazotoa homana!","trk.m.cancelled":"Nofoanana ity kaomandy ity. Raha diso izany, antsoy amin'ny {p} izahay.","trk.m.late":"Lasa ny ora farany hakana ({t}). Antsoy amin'ny {p} izahay alohan'ny hahatongavanao.","trk.m.lost":"Tsy hitanay ity kaomandy ity. Hamarino ny rohy, na antsoy amin'ny {p} izahay.","trk.when":"Fakana","trk.until":"Alaina alohan'ny","trk.pay":"Aloa eo amin'ny kesy","trk.know":"Tokony ho fantatrao","trk.k.code":"Eo amin'ny kesy, asehoy ity kaody ity (na sary nalaina tamin'ity pejy ity). Raha tsy misy ny kaody, hamarininay ny anaranao sy ny laharan'ny findainao vao omenay anao ny kaomandy.","trk.k.someone":"Olon-kafa no haka azy? Alefaso aminy ny rohin'ity pejy ity, na ny kaody fotsiny.","trk.k.cold":"Tehirizina mangatsiaka mandra-pahatonganao ireo zavatra mangatsiaka (❄). Avia ara-potoana ary hano haingana fa tsy zakany ny hafanana.","trk.k.hold":"Tehirizinay hatramin'ny {t} ny kaomandinao. Aorian'izay dia tsy azo antoka intsony izy, indrindra ireo zavatra mangatsiaka, ka raha ho tara ianao dia antsoy amin'ny {p} izahay.","trk.k.pay":"Aloa eo amin'ny kesy ny vola rehefa maka ny kaomandy ianao.","trk.k.where":"Toerana: {a}","trk.live":"Miova ho azy ity pejy ity. Azonao akatona izy: sokafy indray amin'ity finday ity ity tranonkala ity dia hiseho eo ambanin'ny efijery ny kaomandinao.","trk.share":"Alefaso ny rohy","trk.copied":"Voadika ny rohy","trk.shareText":"Kaomandy AISU {r} · kaody fakana {c}","trk.notify":"Ampandreneso aho amin'ity finday ity rehefa vonona","trk.notifyOn":"Hampandrenesina ianao amin'ity finday ity raha mbola misokatra ity pejy ity.","trk.readyTitle":"Vonona ny kaomandy AISU-nao","trk.readyBody":"Kaody fakana {c} · alaina alohan'ny {t}","trk.mine":"Ny kaomandinao mbola miandry","trk.see":"Jereo","trk.noLive":"Tsy misy fanarahana mivantana ho an'ity kaomandy ity. Tehirizo ny laharan'ny kaomandy: hangatahina aminao eo amin'ny kesy izy.","co.hold":"Tehirizinay {n} minitra aorian'io ora io ny kaomandinao, hatramin'ny fotoana hanidiana.","co.cold":"❄ Tehirizina mangatsiaka mandra-pahatonganao ireo zavatra mangatsiaka, ka avia ara-potoana.","cold":"aroso mangatsiaka",
      "cart.max":"Tratra ny fetra ho an'ny kaomandy an-tserasera. Raha kaomandy lehibe, antsoy izahay.","spam.orders":"Efa manana kaomandy maromaro mbola miandry amin'ity finday ity ianao. Raha hanao kaomandy hafa izao, antsoy amin'ny {p} izahay.","spam.bookings":"Efa nanao famandrihana maromaro tamin'ity finday ity ianao. Raha hanampy iray, antsoy amin'ny {p} izahay.","priv.link":"Fiarovana ny mombamomba","priv.consent":"Ho an'ity kaomandy na famandrihana ity ihany no ampiasanay ny anaranao sy ny laharanao.","priv.title":"Fiarovana ny mombamomba anao","priv.intro":"Ny mombamomba kely indrindra ihany no angonin'ny AISU Café & Parfaiteria, ho an'ny kaomandy sy famandrihana ataonao ihany.","priv.what.h":"Izay angoninay","priv.what":"Ny anaranao, ny laharan'ny findainao, ny mailakao raha omenao, ny fanamarihanao, ary ny antsipirian'ny kaomandy na famandrihanao.","priv.why.h":"Antony","priv.why":"Mba hanomanana ny kaomandinao na ny latabatrao, sy hiantsoana anao raha ilaina. Tsy ampiasaina amin'ny dokam-barotra ary tsy amidy mihitsy.","priv.who.h":"Iza no mahita azy","priv.who":"Ny ekipan'ny AISU ihany, ao amin'ny toerana voaaro amin'ny tenimiafina. Ny Google Firebase (Afrika Atsimo) no mitahiry ny angona, ary ny Cloudflare no mampiantrano ny tranonkala.","priv.long.h":"Haharetany","priv.long":"Roa ambin'ny folo volana farafahabetsany, avy eo fafanay.","priv.device.h":"Ao amin'ny findainao","priv.device":"Tehirizin'ny tranonkala ny haronao, ny kaomandinao mbola miandry, ny anaranao sy ny laharanao ho amin'ny manaraka, ary ny fiteny nofidinao. Tsy misy cookie ho an'ny dokam-barotra na fitaovana fanaraha-maso.","priv.rights.h":"Ny zonao","priv.rights":"Raha hijery, hanitsy na hamafa ny mombamomba anao, antsoy amin'ny {p} izahay.","priv.recaptcha":"Mba hanakanana ny robots, mampiasa ny reCAPTCHA an'i Google ity tranonkala ity, araka ny fitsipiky ny fiarovana sy ny fepetra fampiasana an'i Google.","priv.forget":"Fafao amin'ity finday ity ny mombamomba ahy","priv.cleared":"Voafafa tamin'ity finday ity.","cart.title":"Ny kaomandinao","cart.checkout":"Fakana","cart.placed":"Voaray ny kaomandy","cart.empty":"Mbola foana ny kaomandinao. Misafidiana parfait na zava-pisotro ao amin'ny menio.","cart.browse":"Jereo ny menio",
      "cart.continue":"Misafidiana ora hakana","cart.pickup":"Ora hakana","cart.pickupHint":"Eo amin'ny 20 minitra eo ho eo ny fanomanana.","cart.name":"Anarana","cart.phone":"Laharana finday","cart.phoneHint":"raha mila miantso anao izahay",
      "cart.notes":"Fanamarihana","cart.notesPh":"Tsy fahazakana sakafo, sotro fanampiny, labozia","cart.pay":"Aloa eo amin'ny kesy rehefa maka ianao.","cart.back":"Hiverina","cart.place":"Alefaso ny kaomandy","cart.total":"Totaliny",
      "cart.no":"Laharan'ny kaomandy","cart.ready":"Manomana {n} ho an'i {name} izahay, {when}. Aloa eo amin'ny kesy rehefa maka ianao.","cart.items1":"entana 1","cart.itemsN":"entana {n}","cart.preview":"Santionany ihany: tsy nalefa tany amin'ny kafe ity kaomandy ity.","cart.new":"Kaomandy vaovao",
      "cart.added":"Tafiditra: {x}","cart.view":"Jereo ny kaomandy","cart.errName":"Ampidiro ny anarana ho an'ny kaomandy.","cart.errPhone":"Ampidiro laharana finday marina.",
      guests1:"olona 1",guestsN:"olona {n}"
    }
  };
  const DAYS = {
    fr:['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'],
    en:['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
    mg:['Alahady','Alatsinainy','Talata','Alarobia','Alakamisy','Zoma','Asabotsy']
  };
  const MONTHS_MG = ['Janoary','Febroary','Martsa','Aprily','Mey','Jona','Jolay','Aogositra','Septambra','Oktobra','Novambra','Desambra'];

  /* ================= data from the AISU menus (assets/menu-data.js) ================= */
  const {TZ, HOURS, BRUNCH, PARFAITS, CARTE, TEAS, EXTRA_ITEMS} = window.AISU_MENU;
  // Newer helpers from menu-data.js, with fallbacks so the page keeps working if a phone still has an
  // older copy of that file cached (that once stopped the basket from opening).
  const MENU_ = window.AISU_MENU, fn = (f, alt) => typeof f === 'function' ? f : alt;
  const PICKUP_HOLD = MENU_.PICKUP_HOLD || 30;
  const brunchFor = fn(MENU_.brunchFor, dow => (dow===0||dow===6) && HOURS[dow] ? [BRUNCH[0], Math.min(BRUNCH[1], HOURS[dow][1])] : null);
  const isCold = fn(MENU_.isCold, () => false);
  const pickupDeadline = fn(MENU_.pickupDeadline, (day, mins) => mins + PICKUP_HOLD);

  /* ================= helpers ================= */
  const $ = s => document.querySelector(s);
  const store = {
    get(k,d){ try{ const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; }catch(e){ return d; } },
    set(k,v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
  };
  let lang = store.get('aisu-lang', null) || ((navigator.language||'').toLowerCase().startsWith('en') ? 'en' : (navigator.language||'').toLowerCase().startsWith('mg') ? 'mg' : 'fr');
  const t = (k, vars) => { let s = (I18N[lang] && I18N[lang][k]) ?? I18N.fr[k] ?? k; if(vars) for(const v in vars) s = s.replace('{'+v+'}', vars[v]); return s; };
  const ar = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g,' ') + ' Ar';
  const arBig = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g,' ') + '<small>AR</small>';
  const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const heartSm = '<svg aria-hidden="true"><use href="#heart-f"/></svg>';
  function fmt(mins){
    mins=((mins%1440)+1440)%1440; const h=Math.floor(mins/60), m=mins%60;
    if(lang==='en'){ const ap=h>=12?'pm':'am', hh=h%12||12; return m?`${hh}:${String(m).padStart(2,'0')} ${ap}`:`${hh} ${ap}`; }
    return `${h}h${String(m).padStart(2,'0')}`;
  }
  function cafeNow(){
    const parts = new Intl.DateTimeFormat('en-CA',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false,weekday:'short'}).formatToParts(new Date());
    const g = x => (parts.find(p=>p.type===x)||{}).value;
    return { dow:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(g('weekday').slice(0,3)), mins:(parseInt(g('hour'),10)%24)*60+parseInt(g('minute'),10), ymd:`${g('year')}-${g('month')}-${g('day')}` };
  }
  function ymdToDate(s){ const [y,m,d]=s.split('-').map(Number); return new Date(y,m-1,d); }
  function addDays(s,n){ const d=ymdToDate(s); d.setDate(d.getDate()+n); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
  function niceDate(s){
    const d=ymdToDate(s);
    if(lang==='mg') return `${DAYS.mg[d.getDay()]} ${d.getDate()} ${MONTHS_MG[d.getMonth()]}`;
    return d.toLocaleDateString(lang==='en'?'en-GB':'fr-FR',{weekday:'long',day:'numeric',month:'long'});
  }
  function ref(){ const a='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let r='AISU-'; for(let i=0;i<4;i++) r+=a[Math.floor(Math.random()*a.length)]; return r; }

  /* ================= static translation ================= */
  function applyStatic(){
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el=>{ el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-aria]').forEach(el=>el.setAttribute('aria-label', t(el.dataset.i18nAria)));
    document.querySelectorAll('[data-lang]').forEach(b=>b.setAttribute('aria-pressed', b.dataset.lang===lang));
    document.querySelectorAll('[data-price]').forEach(el=>el.textContent = ar(Number(el.dataset.price)));
    document.querySelectorAll('[data-bigprice]').forEach(el=>el.innerHTML = arBig(Number(el.dataset.bigprice)));
  }
  function setLang(l){ lang = l; store.set('aisu-lang', l); renderAll(); }
  document.addEventListener('click', e=>{ const b=e.target.closest('[data-lang]'); if(b) setLang(b.dataset.lang); });

  /* ================= checkerboard hearts on cream cells ================= */
  document.querySelectorAll('[data-checks]').forEach((band,bi)=>{
    const cells = bi ? [[4,0],[9,1],[15,1],[20,0],[26,0],[31,1],[37,1]] : [[2,0],[7,1],[13,1],[18,0],[24,0],[29,1],[35,1]];
    band.innerHTML = cells.filter(([c,r])=>(c+r)%2===0).map(([c,r])=>`<span style="left:calc(var(--cell)*${c} + var(--cell)/2);top:calc(var(--cell)*${r} + var(--cell)/2)"><svg><use href="#heart-f"/></svg></span>`).join('');
  });

  /* ================= status, hours, offers ================= */
  function renderStatus(){
    const now=cafeNow(), h=HOURS[now.dow]; let open=false, msg='';
    if(h && now.mins>=h[0] && now.mins<h[1]){ open=true; msg=t(h[1]-now.mins<=45?'st.soon':'st.open',{t:fmt(h[1])}); }
    else if(h && now.mins<h[0]) msg=t('st.today',{t:fmt(h[0])});
    else for(let i=1;i<=7;i++){ const d=(now.dow+i)%7; if(HOURS[d]){ msg=t('st.later',{d:i===1?t('tomorrow'):DAYS[lang][d].toLowerCase(),t:fmt(HOURS[d][0])}); break; } }
    $('#status').dataset.open=open; $('#statusText').textContent=msg;
    $('#hoursBody').innerHTML=[1,2,3,4,5,6,0].map(d=>{ const x=HOURS[d]; return `<tr class="${d===now.dow?'today':''}"><td>${DAYS[lang][d]}</td><td>${x?fmt(x[0])+' – '+fmt(x[1]):'—'}</td></tr>`; }).join('');
    const bw = brunchFor(now.dow), weekend = !!bw, brunchOn = weekend && now.mins>=bw[0] && now.mins<bw[1], brunchLater = weekend && now.mins<bw[0];
    const offers = [
      {fig:arBig(85000), t:'of.brunch.t', w:'of.brunch.w', b:'of.brunch.b', state: brunchOn ? ['on','of.on'] : brunchLater ? ['','of.today'] : ['','of.weekend']},
      {fig:`<small>${t('of.from')}</small> ${arBig(70000)}`, t:'of.tea.t', w:'of.tea.w', b:'of.tea.b', state:['','of.daily']},
      {fig:arBig(10000), t:'of.soda.t', w:'of.soda.w', b:'of.soda.b', state: open ? ['on','of.on'] : ['','of.daily']}
    ];
    const ol=$('#offerList'), osl=ol.scrollLeft;
    $('#offerList').innerHTML = offers.map(o=>`<article class="offer"><span class="fig">${o.fig}</span><h3>${t(o.t)}</h3><span class="when">${t(o.w)}</span><p>${t(o.b)}</p><span class="state ${o.state[0]}">${t(o.state[1])}</span></article>`).join('');
    ol.scrollLeft=osl; setupDots(ol);
  }

  /* ================= parfait showcase ================= */
  let current = 0;
  function renderParfait(animate){
    const p = PARFAITS[current], img = $('#stageImg');
    const set = () => { img.src = `img/${p.img}.webp`; img.alt = p.name; img.classList.remove('swap'); };
    if(animate && !matchMedia('(prefers-reduced-motion: reduce)').matches){ img.classList.add('swap'); setTimeout(set,180); } else set();
    $('#pNo').textContent = 'No. '+p.no; $('#pName').textContent = p.name; $('#pFlav').textContent = p.flav[lang];
    $('#pLayers').innerHTML = p.layers.map(l=>`<li>${heartSm}<span lang="fr">${esc(l)}</span></li>`).join('');
    $('#pPrice').innerHTML = arBig(p.price); markSold($('#pAdd'), p.id);
    $('#thumbs').innerHTML = PARFAITS.map((q,i)=>`<button type="button" class="thumb" data-parfait="${i}" aria-pressed="${i===current}"><img src="img/${q.img}.webp" alt="" loading="lazy"><span>${q.name}</span></button>`).join('');
  }
  $('#thumbs').addEventListener('click', e=>{ const b=e.target.closest('[data-parfait]'); if(!b) return; current=Number(b.dataset.parfait); renderParfait(true); });
  $('#pAdd').addEventListener('click', ()=>{ const p=PARFAITS[current]; addToCart({key:p.id,name:p.name,price:p.price,img:p.img,sub:''}); });

  /* ================= drinks carte ================= */
  let tab='cafes';
  const TABS=['cafes','matcha','jus'];
  function renderCarte(){
    $('#carteCols').innerHTML = CARTE[tab].map((grp,gi)=>`<details class="grp" data-fold ${gi===0?'data-fold-open':''} open>
      <summary class="grp-head"><h3>${grp.g?t(grp.g):'&nbsp;'}</h3><span>${t(grp.cols[0])}</span><span>${t(grp.cols[1])}</span></summary>
      ${grp.sub?`<p class="grp-sub">${t(grp.sub)}</p>`:''}
      ${grp.items.map((it,ii)=>{ const note = it[3] ? (it[3][lang]||it[3].fr) : ''; const sold = isSold(`${tab}-${gi}-${ii}`);
        const cell = (price,ci) => price==null ? '<span class="p-none">—</span>' : `<button type="button" class="p${sold?' is-sold':''}" data-drink="${tab}|${gi}|${ii}|${ci}" ${sold?'aria-disabled="true"':''} aria-label="${t('add')} ${esc(it[0])}, ${t(grp.cols[ci])}, ${ar(price)}${sold?', '+t('so.tag'):''}">${ar(price).replace(' Ar','')}</button>`;
        return `<div class="drink"><div><b>${esc(it[0])}</b>${sold?`<span class="so-tag">${t('so.tag')}</span>`:''}${note?`<small>${esc(note)}</small>`:''}</div>${cell(it[1],0)}${cell(it[2],1)}</div>`; }).join('')}
    </details>`).join('');
    syncFolds();
    document.querySelectorAll('[data-tab]').forEach(b=>{ const s=b.dataset.tab===tab; b.setAttribute('aria-selected',s); b.tabIndex=s?0:-1; });
    $('#carteCols').setAttribute('aria-labelledby','tab-'+tab);
  }
  const tabsEl=document.querySelector('.tabs');
  tabsEl.addEventListener('click', e=>{ const b=e.target.closest('[data-tab]'); if(b){ tab=b.dataset.tab; renderCarte(); if(mq.matches && tabsEl.getBoundingClientRect().top < 90) $('#carteCols').scrollIntoView({block:'start'}); } });
  tabsEl.addEventListener('keydown', e=>{ if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft') return; tab=TABS[(TABS.indexOf(tab)+(e.key==='ArrowRight'?1:2))%3]; renderCarte(); document.getElementById('tab-'+tab).focus(); });
  document.addEventListener('click', e=>{
    const b=e.target.closest('[data-drink]'); if(!b) return;
    const [tb,gi,ii,ci]=b.dataset.drink.split('|'), grp=CARTE[tb][gi], it=grp.items[ii], price=it[1+Number(ci)];
    addToCart({key:`${tb}-${gi}-${ii}-${ci}`, name:it[0], price, colKey:grp.cols[ci], sub:''});
  });
  document.addEventListener('click', e=>{ const b=e.target.closest('[data-add]'); if(!b) return; const x=EXTRA_ITEMS[b.dataset.add]; addToCart({key:b.dataset.add,name:x.name,price:x.price,sub:''}); });

  /* ================= afternoon teas ================= */
  function renderTeas(){
    $('#teaList').innerHTML = TEAS.map(x=>`<article class="tea">
      <div class="tea-top"><h3>${x.name}</h3><span class="big-price">${arBig(x.price)}</span><span class="for">${t('tea.for2')}</span><span class="inc">${t(x.inc)}</span></div>
      <details class="m-fold" data-fold open><summary><span>${t('tea.show')}</span></summary><div class="fold-body">
      <div><p class="sub-h">${t('tea.sal')}</p><ul lang="fr">${x.sal.map(s=>`<li>${esc(s)}</li>`).join('')}</ul></div>
      <div><p class="sub-h">${t('tea.suc')}</p><ul lang="fr">${x.suc.map(s=>`<li>${esc(s)}</li>`).join('')}</ul></div>
      </div></details>
      <a class="btn btn-ring" href="#reserve" data-reserve-for="${x.id}" style="justify-self:center">${t('tea.book')}</a>
    </article>`).join('');
    syncFolds(); setupDots($('#teaList'));
  }
  document.addEventListener('click', e=>{ const a=e.target.closest('[data-reserve-for]'); if(!a) return; $('#r-for').value=a.dataset.reserveFor; occasionChanged(); });

  /* ================= staff controls (settings/main) ================= */
  const liveSettings = () => (window.aisuBackend ? window.aisuBackend.settings() : {});
  const soldKey = k => String(k).replace(/^((?:cafes|matcha|jus)-\d+-\d+)-[01]$/, '$1');
  const isSold = k => !!(liveSettings().soldOut || {})[soldKey(k)];
  const isClosedDay = d => (liveSettings().closedDays || []).includes(d);
  function renderNotice(){
    const n = String(liveSettings().notice || '').trim(), box = $('#siteNotice');
    $('#siteNoticeText').textContent = n; box.hidden = !n;
    document.documentElement.style.setProperty('--notice-h', n ? box.offsetHeight + 'px' : '0px');
  }
  function markSold(btn, key){
    const s = isSold(key); btn.classList.toggle('is-sold', s); btn.setAttribute('aria-disabled', s ? 'true' : 'false');
    if(btn.dataset.i18n){ btn.textContent = s ? t('so.tag') : t(btn.dataset.i18n); }
  }

  /* ================= cart ================= */
  const MAX_LINES=20, MAX_QTY=50;
  // a saved basket is re-checked against the menu, so a damaged or edited copy can't break the page
  let cart=(Array.isArray(store.get('aisu-cart',[]))?store.get('aisu-cart',[]):[]).filter(l=>l && typeof l.key==='string' && window.AISU_MENU.itemFor(l.key))
    .map(l=>({...l, name:String(l.name||window.AISU_MENU.itemFor(l.key).name).slice(0,80), price:window.AISU_MENU.itemFor(l.key).price, qty:Math.min(MAX_QTY, Math.max(1, Math.floor(Number(l.qty))||1))})).slice(0,MAX_LINES);
  let view='cart', lastOrder=null;
  const dlg=$('#cart');
  const lineName = l => l.colKey ? `${l.name} (${t(l.colKey).toLowerCase()})` : l.name;
  function saveCart(){ store.set('aisu-cart',cart); const c=cart.reduce((a,l)=>a+l.qty,0); document.querySelectorAll('.cart-count').forEach(el=>{ el.textContent=c; el.dataset.n=c; }); }
  function addToCart(item){ if(isSold(item.key)){ showToast(t('so.toast',{x:item.name}), true); return; } const f=cart.find(l=>l.key===item.key); if((f && f.qty>=MAX_QTY) || (!f && cart.length>=MAX_LINES)){ showToast(t('cart.max'), true); return; } if(f) f.qty++; else cart.push({...item,qty:1}); saveCart(); showToast(t('cart.added',{x:lineName(item)})); if(dlg.open) renderCart(); }
  const total = () => cart.reduce((a,l)=>a+l.price*l.qty,0);
  function pickupSlots(){
    const now=cafeNow(), out=[];
    for(let i=0;i<7&&!out.length;i++){ const d=(now.dow+i)%7, h=HOURS[d]; if(!h) continue;
      let start=i===0?Math.max(h[0],now.mins+20):h[0]+15; start=Math.ceil(start/15)*15;
      const label=i===0?t('Today'):i===1?t('Tomorrow'):DAYS[lang][d];
      const day=addDays(now.ymd,i); if(isClosedDay(day)) continue;
      for(let m=start;m<=h[1]-15;m+=15) out.push({label, time:fmt(m), day, mins:m}); }
    return out;
  }
  function renderCart(){
    const body=$('#cartBody'), foot=$('#cartFoot');
    if(view==='track'){
      const o=orderFor(trackId);
      if(!o){ view='cart'; return renderCart(); }
      $('#cartTitle').textContent=t('trk.title');
      if(!backend() && !o.track){
        body.innerHTML=`<div class="confirm" style="padding-top:22px"><p class="fine">${t('cart.no')}</p><div class="ref">${esc(o.ref)}</div><p class="fine">${t('cart.preview')}</p></div>`;
      } else body.innerHTML=trackView(o);
      foot.hidden=false; foot.innerHTML=`<div class="trk-foot">${o.track && !finished(statusOf(o))?`<button class="btn btn-ring" type="button" id="shareTrack">${t('trk.share')}</button>`:''}<button class="btn btn-fill" type="button" id="newOrder">${t('cart.new')}</button></div>`; return;
    }
    $('#cartTitle').textContent = view==='checkout' ? t('cart.checkout') : t('cart.title');
    const act=view==='cart'?activeOrders():[];
    const mine = act.length ? `<div class="mine"><p class="sub-h">${t('trk.mine')}</p>${act.map(o=>`<button type="button" class="mine-row" data-track="${esc(o.id)}" data-st="${esc(isLate(o)?'late':statusOf(o))}"><span class="dot"></span><span class="tx"><b>${esc(o.ref)}</b><span>${esc(whenText(o.day,o.mins))} · ${esc(t('trk.s.'+(isLate(o)?'late':statusOf(o))))}</span></span><span class="go">${t('trk.see')}</span></button>`).join('')}</div>` : '';
    if(!cart.length){ body.innerHTML=mine+`<div class="empty-cart"><img class="parfi-say" src="img/parfi/parfi-curious-sticker.webp" alt="" width="138" height="260"><p>${t('cart.empty')}</p><a class="btn btn-fill" href="#parfaits" data-close>${t('cart.browse')}</a></div>`; foot.innerHTML=''; foot.hidden=true; return; }
    foot.hidden=false;
    const tot=`<div class="totals"><div class="grand"><span>${t('cart.total')}</span><span>${ar(total())}</span></div></div>`;
    if(view==='cart'){
      const anySold = cart.some(l=>isSold(l.key));
      body.innerHTML=mine+cart.map((l,i)=>`<div class="line${isSold(l.key)?' sold':''}"><div class="art">${l.img?`<img src="img/${esc(l.img)}.webp" alt="">`:'<svg><use href="#heart-f"/></svg>'}</div>
        <div style="min-width:0"><div class="line-name">${esc(lineName(l))}${isCold(l.key)?snowIcon():''}${isSold(l.key)?`<span class="so-tag">${t('so.tag')}</span>`:''}</div>
        <div class="qty"><button type="button" data-q="${i}" data-d="-1" aria-label="−1 ${esc(l.name)}">−</button><span>${esc(l.qty)}</span><button type="button" data-q="${i}" data-d="1" aria-label="+1 ${esc(l.name)}">+</button></div></div>
        <span class="price">${ar(l.price*l.qty)}</span></div>`).join('');
      foot.innerHTML=tot+(anySold?`<p class="form-err" role="alert" style="margin-bottom:10px">${t('so.cart')}</p>`:'')+`<button class="btn btn-fill" type="button" id="toCheckout" ${anySold?'disabled':''}>${t('cart.continue')}</button>`;
    } else {
      const slots=pickupSlots(), saved=store.get('aisu-contact',{});
      body.innerHTML=`<form id="checkoutForm" novalidate>
        <div class="field"><label for="c-time">${t('cart.pickup')}</label><select id="c-time">${slots.map((s,i)=>`<option value="${i}" data-label="${esc(s.label)}" data-time="${esc(s.time)}" data-day="${s.day}" data-mins="${s.mins}">${esc(s.label)}, ${esc(s.time)}</option>`).join('')}</select><span class="hint">${t('cart.pickupHint')} ${t('co.hold',{n:PICKUP_HOLD})}</span></div>
        ${cart.some(l=>isCold(l.key))?`<p class="cold-note">${esc(t('co.cold'))}</p>`:''}
        <div class="field" id="c-name-f"><label for="c-name">${t('cart.name')}</label><input type="text" id="c-name" autocomplete="name" maxlength="80" value="${esc(saved.name||'')}"><span class="err" hidden></span></div>
        <div class="field" id="c-phone-f"><label for="c-phone">${t('cart.phone')} <span class="hint">${t('cart.phoneHint')}</span></label><input type="tel" id="c-phone" autocomplete="tel" inputmode="tel" value="${esc(saved.phone||'')}" placeholder="034 00 000 00" maxlength="30"><span class="err" hidden></span></div>
        <div class="field"><label for="c-notes">${t('cart.notes')} <span class="hint">${t('optional')}</span></label><textarea id="c-notes" maxlength="500" placeholder="${esc(t('cart.notesPh'))}"></textarea></div>
        <div class="pay">${t('cart.pay')}</div>
        <div class="hp" aria-hidden="true"><label>Website<input type="text" name="website" class="hp-in" tabindex="-1" autocomplete="off"></label></div>
        <p class="fine consent">${esc(t('priv.consent'))} <button type="button" class="linkish" data-privacy>${t('priv.link')}</button></p>
        <p class="form-err" id="orderErr" role="alert" ${backend() && backend().settings().ordersPaused ? '' : 'hidden'}>${backend() && backend().settings().ordersPaused ? esc(t('err.paused')) : ''}</p></form>`;
      foot.innerHTML=tot+`<div style="display:flex;gap:12px"><button class="btn btn-ring" type="button" id="backCart">${t('cart.back')}</button><button class="btn btn-fill" type="button" id="placeOrder" style="flex:1" ${backend() && backend().settings().ordersPaused ? 'disabled' : ''}>${t('cart.place')}</button></div>`;
    }
  }
  function openCart(){ if(view==='track') view='cart'; try{ renderCart(); }catch(e){ console.error(e); } if(!dlg.open) dlg.showModal(); }
  document.addEventListener('click', e=>{ if(e.target.closest('[data-open-cart]')){ hideToast(); if(mnav.open) mnav.close(); openCart(); } });
  $('#closeCart').addEventListener('click',()=>dlg.close());
  dlg.addEventListener('click', e=>{
    if(e.target===dlg){ dlg.close(); return; }
    const b=e.target.closest('button, a'); if(!b) return;
    if(b.dataset.close!=null){ dlg.close(); return; }
    if(b.dataset.q!=null){ const l=cart[b.dataset.q]; if(!l) return; if(Number(b.dataset.d)>0 && l.qty>=MAX_QTY){ showToast(t('cart.max'), true); return; } l.qty+=Number(b.dataset.d); if(l.qty<=0) cart.splice(b.dataset.q,1); saveCart(); renderCart(); }
    else if(b.id==='toCheckout'){ view='checkout'; renderCart(); }
    else if(b.id==='backCart'||b.id==='newOrder'){ view='cart'; renderCart(); }
    else if(b.id==='placeOrder') placeOrder();
    else if(b.dataset.track){ openTrack(b.dataset.track); }
    else if(b.id==='shareTrack') shareTrack(b);
    else if(b.id==='trkNotify'){ try{ Notification.requestPermission().then(()=>renderCart()); }catch(e){} }
  });
  dlg.addEventListener('close',()=>{ if(view==='track'){ view='cart'; } renderTrackChip(); });
  document.addEventListener('click', e=>{ const c=e.target.closest('#trackChip'); if(c){ hideToast(); if(mnav.open) mnav.close(); openTrack(c.dataset.track); } });
  function setErr(id,msg){ const f=document.getElementById(id); if(!f) return; const e=f.querySelector('.err'); f.dataset.invalid=msg?'true':'false'; if(e){ e.textContent=msg||''; e.hidden=!msg; } }
  const phoneOk = v => v.replace(/\D/g,'').length >= 9;
  // What customers type is cleaned before it's saved: invisible control and direction characters are
  // removed (they could disguise a name on the staff screen), and phone numbers keep only digits,
  // spaces and + ( ) . - (the database refuses anything else).
  const INVISIBLE=/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200F\u202A-\u202E\u2060-\u2069\uFEFF]/g;
  const cleanLine = (v,max) => String(v||'').replace(INVISIBLE,'').replace(/[\r\n\t]+/g,' ').replace(/ {2,}/g,' ').trim().slice(0,max);
  const cleanText = (v,max) => String(v||'').replace(INVISIBLE,'').replace(/\t/g,' ').trim().slice(0,max);
  const cleanPhone = v => String(v||'').replace(/[^0-9+() .-]/g,'').replace(/ {2,}/g,' ').trim().slice(0,30);
  let placing=false;
  // Guards against bots and repeated taps: a hidden field only bots fill in, and a few orders or bookings
  // per phone per hour. People can still call the café; App Check (firebase-config.js) is the real filter.
  const isBot = form => { const h=form && form.querySelector('.hp-in'); return !!(h && h.value); };
  function recentCount(key, windowMins){ const now=Date.now(), list=(store.get(key,[])||[]).filter(x=>typeof x==='number' && now-x < windowMins*60000); store.set(key,list); return list.length; }
  function noteSent(key){ const list=store.get(key,[])||[]; list.push(Date.now()); store.set(key,list.slice(-20)); }
  async function placeOrder(){
    if(placing) return;
    const name=cleanLine($('#c-name').value,80), phone=cleanPhone($('#c-phone').value), notes=cleanText($('#c-notes').value,500);
    setErr('c-name-f',name?'':t('cart.errName')); setErr('c-phone-f',phoneOk(phone)?'':t('cart.errPhone'));
    if(!name) return $('#c-name').focus(); if(!phoneOk(phone)) return $('#c-phone').focus();
    if(cart.some(l=>isSold(l.key))){ view='cart'; renderCart(); return; }
    if(isBot($('#checkoutForm'))) return;
    if(activeOrders().length>=3 || recentCount('aisu-sent-orders',60)>=5){ const e=$('#orderErr'); e.textContent=t('spam.orders',{p:CAFE_PHONE}); e.hidden=false; return; }
    store.set('aisu-contact',{name,phone});
    const o=$('#c-time').selectedOptions[0];
    const when = `${o.dataset.label.toLowerCase()} ${lang==='en'?'at':lang==='mg'?"amin'ny":'à'} ${o.dataset.time}`;
    const order={ref:ref(),name,phone,when,total:total(),count:cart.reduce((a,l)=>a+l.qty,0),live:false};
    const items=cart.map(l=>({k:l.key, n:lineName(l).slice(0,80), q:l.qty}));
    let saved=null;
    const be=backend(), errEl=$('#orderErr'), btn=$('#placeOrder');
    if(be){
      placing=true; errEl.hidden=true; btn.disabled=true; btn.setAttribute('aria-busy','true'); btn.textContent=t('send.sending');
      try{
        saved=await be.createOrder({ref:order.ref, items,
          pickupDay:o.dataset.day, pickupTime:Number(o.dataset.mins), name:name.slice(0,80), phone:phone.slice(0,30), notes:notes.slice(0,500), lang});
        order.live=true; noteSent('aisu-sent-orders');
      }catch(err){
        placing=false; btn.disabled=false; btn.removeAttribute('aria-busy'); btn.textContent=t('cart.place');
        const code=err&&err.code;
        errEl.textContent = t(code==='aisu/paused'?'err.paused':code==='aisu/closed'?'err.closed':code==='aisu/refused'?'err.orderRefused':'err.orderOffline'); errEl.hidden=false;
        if(code==='aisu/paused') btn.disabled=true;
        return;
      }
      placing=false;
    }
    lastOrder=order;
    const mine={id:(saved&&saved.track)||order.ref, track:saved?saved.track:null, code:saved?saved.code:null, ref:order.ref,
      day:o.dataset.day, mins:Number(o.dataset.mins), items, total:order.total, status:'new'};
    myOrders.push(mine); saveMyOrders();
    cart=[]; saveCart(); openTrack(mine.id);
  }
  /* ================= pickup tracker =================
     After ordering, the customer gets a live page with a 4-digit pickup code, the pickup time and the
     latest time we hold the order, what to know about iced items and payment, and the status as staff
     move it (received, preparing, ready, collected). It works without e-mail, SMS or WhatsApp: the page
     updates by itself, the order is remembered on this phone (a chip at the bottom brings it back), and
     the link can be sent to whoever collects. Staff ask for the code at the counter. */
  const CAFE_PHONE='+261 36 08 266 88', CAFE_TEL='tel:+261360826688';
  const STEPS=['new','preparing','ready','collected'];
  const snowIcon = () => `<svg class="snow" role="img" aria-label="${esc(t('cold'))}"><use href="#snow"/></svg>`;
  let myOrders=store.get('aisu-orders',[]);          // [{id, track, ref, code, day, mins, items:[{k,n,q}], total, status, seen}]
  let trackId=null, trackData=undefined, trackUnsub=null, watchedId=null, flashTimer=null;
  const marked={};
  function saveMyOrders(){
    const today=cafeNow().ymd, keep=addDays(today,-1);
    myOrders=myOrders.filter(o=>o.day>=keep).slice(-8);
    store.set('aisu-orders',myOrders);
  }
  const orderFor = id => myOrders.find(o=>o.id===id);
  const atWord = () => lang==='en'?'at':lang==='mg'?"amin'ny":'à';
  function dayWord(day){ const now=cafeNow(); return day===now.ymd?t('Today').toLowerCase():day===addDays(now.ymd,1)?t('Tomorrow').toLowerCase():niceDate(day); }
  const whenText = (day,mins) => `${dayWord(day)} ${atWord()} ${fmt(mins)}`;
  const deadline = o => pickupDeadline(o.day,o.mins);
  function isLate(o){ const n=cafeNow(); return n.ymd>o.day || (n.ymd===o.day && n.mins>deadline(o)); }
  const finished = s => s==='collected'||s==='cancelled';
  function activeOrders(){ return myOrders.filter(o=>!finished(o.status) && !(isLate(o) && cafeNow().ymd>o.day)); }
  const totalOf = items => items.reduce((a,l)=>{ const it=window.AISU_MENU.itemFor(l.k); return a+(it?it.price*l.q:0); },0);
  const withPhone = (key, vars={}) => esc(t(key,{...vars,p:'\u0001'})).replace('\u0001',`<a href="${CAFE_TEL}" class="tel-in">${CAFE_PHONE}</a>`);
  const statusOf = o => (trackId===o.id && trackData) ? trackData.status : (o.status||'new');

  function shareUrl(o){ return location.origin+location.pathname+'#commande='+o.track; }

  // keep one live connection to the order on screen (or the latest active one, for the chip)
  function watchOrder(id){
    if(watchedId===id) return;
    if(trackUnsub){ trackUnsub(); trackUnsub=null; }
    watchedId=id; trackId=id; trackData=undefined;
    const o=orderFor(id), be=backend();
    if(!o || !o.track || !be || typeof be.watchPickup!=='function') return;
    trackUnsub=be.watchPickup(o.track, d=>{
      const prev=trackData ? trackData.status : (o.status||null);
      trackData=d;
      if(d){
        o.status=d.status; o.seen=d.seen; saveMyOrders();
        if(d.status==='ready' && prev && prev!=='ready') readyAlert(o);
        markSeen(o);
      }
      if(dlg.open && view==='track') renderCart();
      renderTrackChip();
    }, ()=>{ if(dlg.open && view==='track') renderCart(); });
  }
  function markSeen(o){
    const be=backend();
    if(!be || typeof be.markSeen!=='function' || !o.track || !trackData || document.visibilityState!=='visible') return;
    if(trackData.seen===trackData.status || marked[o.track]===trackData.status) return;
    marked[o.track]=trackData.status; be.markSeen(o.track, trackData.status);
  }
  document.addEventListener('visibilitychange',()=>{ const o=watchedId&&orderFor(watchedId); if(o) markSeen(o); if(document.visibilityState==='visible') stopFlash(); });

  // when the order turns ready: a chime (if the browser allows sound), a buzz, the tab title, a notification
  function readyAlert(o){
    try{ navigator.vibrate && navigator.vibrate([250,120,250,120,400]); }catch(e){}
    try{
      const C=window.AudioContext||window.webkitAudioContext; if(C){ const ac=readyAlert.ac||(readyAlert.ac=new C());
        if(ac.state==='suspended') ac.resume();
        [784,988,1319].forEach((f,i)=>{ const os=ac.createOscillator(), g=ac.createGain(), t0=ac.currentTime+i*.18;
          os.type='sine'; os.frequency.value=f; g.gain.setValueAtTime(.0001,t0); g.gain.exponentialRampToValueAtTime(.3,t0+.02); g.gain.exponentialRampToValueAtTime(.0001,t0+.5);
          os.connect(g).connect(ac.destination); os.start(t0); os.stop(t0+.55); }); }
    }catch(e){}
    const title=t('trk.readyTitle'), body=t('trk.readyBody',{c:o.code||o.ref, t:fmt(deadline(o))});
    if(document.visibilityState!=='visible'){
      try{ if('Notification' in window && Notification.permission==='granted') new Notification(title,{body, tag:'aisu-'+o.id, icon:'img/miss-coco-cherry.webp'}); }catch(e){}
      const base=document.title; let on=false; stopFlash();
      flashTimer=setInterval(()=>{ on=!on; document.title=on?('● '+title):base; },1200); flashTimer.base=base;
    }
  }
  function stopFlash(){ if(flashTimer){ clearInterval(flashTimer); document.title=flashTimer.base; flashTimer=null; } }

  // Parfi's pose follows the order: received (thumbs up), preparing (hurrying), ready (cheering),
  // collected (giggling), and hands on cheeks when something needs a call
  const PARFI_FOR={new:['thumbsup',148],preparing:['run',157],ready:['pompom-sticker',252],collected:['giggle',149],late:['cheeks',146],cancelled:['cheeks',146],lost:['cheeks',146]};
  function parfiFor(state){ const p=PARFI_FOR[state]||PARFI_FOR.new; return `<img class="parfi-say" src="img/parfi/parfi-${p[0]}.webp" alt="" width="${p[1]}" height="260">`; }
  function trackView(o){
    const live=!!(o.track && backend());
    const d=trackData, s=d ? d.status : (o.status||'new'), late=isLate(o) && !finished(s);
    const lost = live && d===null;
    const until=fmt(deadline(o));
    let msg;
    if(lost) msg=withPhone('trk.m.lost');
    else if(s==='cancelled') msg=withPhone('trk.m.cancelled');
    else if(late) msg=withPhone('trk.m.late',{t:until});
    else msg=withPhone('trk.m.'+s,{t: s==='new'?fmt(o.mins):until});
    const cur=STEPS.indexOf(s);
    const steps = live && !lost && s!=='cancelled' ? `<ol class="steps" aria-label="${esc(t('trk.title'))}">${STEPS.map((x,i)=>`<li class="${i<cur?'done':i===cur?'now':''}"${i===cur?' aria-current="step"':''}><span class="dot"></span>${esc(t('trk.s.'+x))}</li>`).join('')}</ol>` : '';
    const cold=o.items.some(l=>isCold(l.k));
    const codeBox = o.code
      ? `<div class="trk-code"><span class="lbl">${t('trk.code')}</span><b class="code tnum" aria-label="${esc(String(o.code).split('').join(' '))}">${esc(o.code)}</b><span class="fine">${esc(t('trk.order',{r:o.ref}))}</span></div>`
      : `<div class="trk-code"><span class="lbl">${t('cart.no')}</span><b class="code ref-code">${esc(o.ref)}</b></div>`;
    const know=[ o.code?esc(t('trk.k.code')):esc(t('trk.noLive')), o.track?esc(t('trk.k.someone')):null, cold?esc(t('trk.k.cold')):null,
      withPhone('trk.k.hold',{t:until}), esc(t('trk.k.pay')), esc(t('trk.k.where',{a:t('foot.addr')})) ].filter(Boolean);
    const canNotify = live && 'Notification' in window && !finished(s) && s!=='ready';
    return `<div class="trk st-${esc(lost?'lost':late?'late':s)}">
      <div class="trk-status" role="status" aria-live="polite">${steps}<div class="trk-head"><p class="trk-msg">${msg}</p>${parfiFor(lost?'lost':s==='cancelled'?'cancelled':late?'late':s)}</div></div>
      ${codeBox}
      <dl class="summary"><dt>${t('trk.when')}</dt><dd>${esc(whenText(o.day,o.mins))}</dd><dt>${t('trk.until')}</dt><dd>${esc(until)}</dd><dt>${t('trk.pay')}</dt><dd class="tnum">${ar(o.total)}</dd></dl>
      <ul class="trk-items">${o.items.map(l=>`<li><span class="q">${esc(l.q)}×</span><span>${esc(l.n)}</span>${isCold(l.k)?snowIcon():''}</li>`).join('')}</ul>
      ${finished(s) ? '' : `<div class="trk-know"><h3>${t('trk.know')}</h3><ul>${know.map(k=>`<li>${k}</li>`).join('')}</ul></div>`}
      ${canNotify ? (Notification.permission==='granted' ? `<p class="fine">${t('trk.notifyOn')}</p>` : Notification.permission==='default' ? `<button class="btn btn-ring btn-sm" type="button" id="trkNotify">${t('trk.notify')}</button>` : '') : ''}
      ${live && !finished(s) ? `<p class="fine">${t('trk.live')}</p>` : ''}
    </div>`;
  }

  function renderTrackChip(){
    const chip=$('#trackChip'); if(!chip) return;
    const act=activeOrders(), o=act[act.length-1];
    const room = v => { if(matchMedia('(max-width:760px)').matches) document.documentElement.style.setProperty('--chip-h', v ? (chip.offsetHeight+12)+'px' : '0px'); };
    if(!o){ chip.hidden=true; room(false); return; }
    if(dlg.open && view==='track'){ chip.hidden=true; return; }
    if(o.track && watchedId!==o.id && !(dlg.open && view==='track')) watchOrder(o.id);
    const s=statusOf(o);
    chip.hidden=false; chip.dataset.track=o.id; chip.dataset.st=isLate(o)?'late':s;
    chip.innerHTML=`<span class="dot"></span><span class="tx"><b>${esc(o.ref)}</b> · ${esc(t('trk.s.'+(isLate(o)?'late':s)))}</span><span class="go">${t('trk.see')}</span>`;
    room(true);
  }
  function openTrack(id){
    const o=orderFor(id); if(!o) return;
    watchOrder(id); view='track'; renderCart(); if(!dlg.open) dlg.showModal();
    renderTrackChip(); markSeen(o);
  }
  async function shareTrack(btn){
    const o=orderFor(trackId); if(!o) return;
    const url=o.track?shareUrl(o):location.origin+location.pathname, text=t('trk.shareText',{r:o.ref,c:o.code||'—'});
    try{ if(navigator.share){ await navigator.share({title:'AISU', text, url}); return; } }catch(e){ if(e && e.name==='AbortError') return; }
    try{ await navigator.clipboard.writeText(text+'\n'+url); btn.textContent=t('trk.copied'); setTimeout(()=>{ btn.textContent=t('trk.share'); },1800); }catch(e){}
  }
  // an order link someone sent: #commande=<key>
  async function openFromLink(){
    const m=/#commande=([A-Za-z0-9]{20,40})/.exec(location.hash); if(!m) return;
    const key=m[1]; let o=myOrders.find(x=>x.track===key);
    if(!o){
      const be=backend(); if(!be || typeof be.watchPickup!=='function') return;
      await new Promise(res=>{ const un=be.watchPickup(key, d=>{ un();
        if(d){ o={id:key, track:key, ref:d.ref, code:d.code, day:d.pickupDay, mins:d.pickupTime, items:d.items||[], total:totalOf(d.items||[]), status:d.status, seen:d.seen};
          myOrders.push(o); saveMyOrders(); }
        res(); }, ()=>res()); });
    }
    if(o) openTrack(o.id); else showToast(t('trk.m.lost',{p:CAFE_PHONE}), true);
  }
  window.addEventListener('hashchange', openFromLink);

  /* ================= Parfi: hold still while off screen ================= */
  if('IntersectionObserver' in window){
    const io=new IntersectionObserver(es=>es.forEach(e=>e.target.classList.toggle('is-still',!e.isIntersecting)),{rootMargin:'80px'});
    document.querySelectorAll('.parfi,.parfi-lane').forEach(el=>{ el.classList.add('is-still'); io.observe(el); });
  }
  // keep the hero Parfi clear of the hero buttons on phones
  function placeHeroParfi(){ const b=document.querySelector('.hero-ctas'), h=document.querySelector('.hero'); if(!b||!h) return;
    const gap=h.getBoundingClientRect().bottom-b.getBoundingClientRect().top; h.style.setProperty('--hero-btns',Math.max(0,Math.round(gap+10))+'px'); }
  placeHeroParfi(); window.addEventListener('resize',placeHeroParfi);

  /* ================= privacy notice ================= */
  const privDlg=$('#privacy');
  function renderPrivacy(){
    const sec=['what','why','who','long','device','rights'].map(k=>`<div class="priv-sec"><h3>${esc(t('priv.'+k+'.h'))}</h3><p>${k==='rights'?withPhone('priv.rights'):esc(t('priv.'+k))}</p></div>`).join('');
    $('#privBody').innerHTML=`<div class="priv"><p class="priv-intro">${esc(t('priv.intro'))}</p>${sec}
      ${window.AISU_APPCHECK_SITE_KEY?`<p class="fine">${esc(t('priv.recaptcha'))} <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Privacy</a> · <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">Terms</a></p>`:''}
      <button class="btn btn-ring" type="button" id="forgetMe">${esc(t('priv.forget'))}</button></div>`;
  }
  document.addEventListener('click', e=>{
    if(e.target.closest('[data-privacy]')){ renderPrivacy(); if(dlg.open) dlg.close(); if(mnav.open) mnav.close(); privDlg.showModal(); }
    if(e.target.closest('[data-close-privacy]') || e.target===privDlg) privDlg.close();
    if(e.target.closest('#forgetMe')){
      ['aisu-contact','aisu-orders','aisu-cart','aisu-sent-orders','aisu-sent-bookings'].forEach(k=>{ try{ localStorage.removeItem(k); }catch(err){} });
      cart=[]; myOrders=[]; saveCart(); renderTrackChip(); privDlg.close(); showToast(t('priv.cleared'), true);
    }
  });
  let toastTimer;
  function showToast(m, plain){ $('#toastText').textContent=m; $('#toast [data-open-cart]').hidden=!!plain; $('#toast').classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(hideToast,3600); }
  function hideToast(){ $('#toast').classList.remove('show'); }

  /* ================= reservations ================= */
  let party=2, chosen=null, slotCounts={};
  const backend=()=>window.aisuBackend||null;
  const capacity=()=>backend()?backend().settings().capacity:Infinity;
  const dateIn=$('#r-date'), forIn=$('#r-for');
  { const d=cafeNow().ymd; dateIn.min=d; dateIn.max=addDays(d,60); dateIn.value=d; }
  function renderParty(){ $('#partyOut').textContent = party===1?t('guests1'):t('guestsN',{n:party}); $('#partyMinus').disabled=party<=1; $('#partyPlus').disabled=party>=8; $('#bigParty').hidden=party<8; }
  $('#partyMinus').addEventListener('click',()=>{party=Math.max(1,party-1);renderParty();renderSlots();});
  $('#partyPlus').addEventListener('click',()=>{party=Math.min(8,party+1);renderParty();renderSlots();});
  function windowFor(dow){
    const h=HOURS[dow]; if(!h) return null;
    if(forIn.value==='brunch'){ const b=brunchFor(dow); return b ? [b[0], b[1]-60] : 'nobrunch'; }
    return [h[0], h[1]-60];
  }
  function renderSlots(){
    const box=$('#slots'), v=dateIn.value; if(!v){ box.innerHTML=''; $('#slotHint').textContent=''; return; }
    const now=cafeNow(), dow=ymdToDate(v).getDay(), w=windowFor(dow);
    const resBtn=$('#reserveForm button[type=submit]'); if(!booking) resBtn.disabled=!!liveSettings().bookingsPaused;
    if(liveSettings().bookingsPaused){ box.innerHTML=`<p class="form-err" role="alert">${t('res.paused')}</p>`; chosen=null; $('#slotHint').textContent=''; return; }
    if(isClosedDay(v)){ box.innerHTML=`<p class="fine">${t('res.closed')}</p>`; chosen=null; $('#slotHint').textContent=''; return; }
    if(w===null){ box.innerHTML=`<p class="fine">${t('res.closed')}</p>`; chosen=null; $('#slotHint').textContent=''; return; }
    if(w==='nobrunch'){ box.innerHTML=`<p class="fine">${t('res.brunchOnly')}</p>`; chosen=null; $('#slotHint').textContent=''; return; }
    const isToday=v===now.ymd; let html='', any=false;
    if(chosen!=null && (chosen<w[0]||chosen>w[1]||(isToday&&chosen<now.mins+30))) chosen=null;
    const cap=capacity();
    if(chosen!=null && (slotCounts[String(chosen)]||0)+party>cap) chosen=null;
    for(let m=w[0];m<=w[1];m+=30){ const past=isToday&&m<now.mins+30, full=!past&&(slotCounts[String(m)]||0)+party>cap; if(!past&&!full) any=true;
      html+=`<button type="button" class="opt${full?' full':''}" data-slot="${m}" aria-pressed="${chosen===m}" ${past||full?'disabled':''}${full?` title="${esc(t('slot.full'))}" aria-label="${fmt(m)}, ${esc(t('slot.full'))}"`:''}>${fmt(m)}</button>`; }
    const sl=box.scrollLeft; box.innerHTML = any ? html : `<p class="fine">${t('res.nomore')}</p>`; box.scrollLeft=sl;
    $('#slotHint').textContent = `(${DAYS[lang][dow]}, ${fmt(w[0])} – ${fmt(w[1])})`;
  }
  function watchDay(){ const be=backend(); slotCounts={}; if(be && dateIn.value) be.watchSlots(dateIn.value, g=>{ slotCounts=g; renderSlots(); }); }
  window.addEventListener('aisu:backend', ()=>{ watchDay(); renderTrackChip(); openFromLink(); backend().onSettings(()=>{ renderNotice(); renderSlots(); renderParfait(false); renderPCards(); renderCarte(); markExtras(); if(dlg.open) renderCart(); }); });
  dateIn.addEventListener('change',()=>{ setErr('f-date',''); $('#brunchNote').hidden=true; watchDay(); renderSlots(); });

  // Brunch is weekend-only: picking it moves a weekday date to the next Saturday or Sunday.
  function occasionChanged(){
    setErr('f-time','');
    const note=$('#brunchNote'); note.hidden=true;
    if(forIn.value==='brunch' && dateIn.value){
      const dow=ymdToDate(dateIn.value).getDay();
      if(dow!==0 && dow!==6){
        let d=dateIn.value;
        for(let i=0;i<7;i++){ d=addDays(d,1); const w=ymdToDate(d).getDay(); if(w===6||w===0) break; }
        if(d<=dateIn.max){
          dateIn.value=d; chosen=null;
          if(typeof watchDay==='function') watchDay();
          note.textContent=t('res.brunchMoved',{d:niceDate(d)}); note.hidden=false;
        }
      }
    }
    renderSlots();
  }
  forIn.addEventListener('change', occasionChanged);
  $('#slots').addEventListener('click',e=>{ const b=e.target.closest('[data-slot]'); if(!b||b.disabled) return; chosen=Number(b.dataset.slot); setErr('f-time',''); renderSlots(); const a=document.querySelector(`[data-slot="${chosen}"]`); if(a) a.focus(); });
  let booking=false;
  $('#reserveForm').addEventListener('submit',async e=>{
    e.preventDefault();
    if(booking) return;
    $('#resErr').hidden=true;
    const name=cleanLine($('#r-name').value,80), phone=cleanPhone($('#r-phone').value), email=cleanLine($('#r-email').value,120), dv=dateIn.value, errs=[];
    const dateOk = dv && dv>=dateIn.min && dv<=dateIn.max;
    setErr('f-date',dateOk?'':t('err.date')); if(!dateOk) errs.push(dateIn);
    setErr('f-time',chosen!=null?'':t('err.time')); if(chosen==null) errs.push($('#slots').querySelector('button:not([disabled])')||forIn);
    setErr('f-name',name?'':t('err.name')); if(!name) errs.push($('#r-name'));
    setErr('f-phone',phoneOk(phone)?'':t('err.phone')); if(!phoneOk(phone)) errs.push($('#r-phone'));
    const emailOk=!email||/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    setErr('f-email',emailOk?'':t('err.email')); if(!emailOk) errs.push($('#r-email'));
    if(errs.length){ errs[0].focus(); return; }
    if(isBot($('#reserveForm'))) return;
    if(recentCount('aisu-sent-bookings',60)>=4){ $('#resErr').textContent=t('spam.bookings',{p:CAFE_PHONE}); $('#resErr').hidden=false; return; }
    const seatVal=document.querySelector('input[name="seat"]:checked').value, done=$('#reserveDone');
    const occasion = forIn.selectedOptions[0].textContent, bookingRef=ref(), notes=cleanText($('#r-notes').value,500);
    const be=backend(); let live=false;
    if(be){
      const btn=$('#reserveForm button[type=submit]');
      booking=true; btn.disabled=true; btn.setAttribute('aria-busy','true'); btn.textContent=t('send.sending');
      try{
        await be.createReservation({ref:bookingRef, date:dv, time:chosen, guests:party, occasion:forIn.value, seat:seatVal,
          name:name.slice(0,80), phone:phone.slice(0,30), email:email.slice(0,120), notes:notes.slice(0,500), lang});
        live=true; noteSent('aisu-sent-bookings');
      }catch(err){
        const code=err&&err.code;
        if(code==='aisu/full'){ setErr('f-time',t('err.full')); chosen=null; renderSlots(); }
        else if(code==='aisu/paused'||code==='aisu/closed'){ renderSlots(); $('#resErr').textContent=t(code==='aisu/paused'?'res.paused':'err.closed'); $('#resErr').hidden=false; }
        else { $('#resErr').textContent=t(code==='aisu/refused'?'err.resRefused':'err.resOffline'); $('#resErr').hidden=false; }
        return;
      }finally{
        booking=false; btn.disabled=!!liveSettings().bookingsPaused; btn.removeAttribute('aria-busy'); btn.textContent=t('res.submit');
      }
    }
    done.innerHTML=`<img class="done-parfi" src="img/parfi/parfi-yay-sticker.webp" alt="" width="234" height="260"><p class="fine">${t('done.ref')}</p><div class="ref">${bookingRef}</div>
      <dl class="summary"><dt>${t('done.date')}</dt><dd>${esc(niceDate(dv))}</dd><dt>${t('done.time')}</dt><dd>${fmt(chosen)}</dd><dt>${t('done.guests')}</dt><dd>${party}</dd>
      <dt>${t('done.for')}</dt><dd>${esc(occasion)}</dd><dt>${t('done.seat')}</dt><dd>${t('seat.'+seatVal)}</dd><dt>${t('done.name')}</dt><dd>${esc(name)}</dd></dl>
      <p class="fine">${t(live?'done.noteLive':'done.note')}</p>
      <button class="btn btn-ring" type="button" id="newBooking" style="justify-self:start">${t('done.again')}</button>`;
    $('#reserveForm').hidden=true; done.hidden=false; done.focus();
  });
  document.addEventListener('click',e=>{ if(e.target.id==='newBooking'){ $('#reserveDone').hidden=true; $('#reserveForm').hidden=false; chosen=null; renderSlots(); dateIn.focus(); } });

  /* ================= copy, preview strip ================= */
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-copy]'); if(!b) return;
    const src=document.getElementById(b.dataset.copy), text=src.textContent;
    const ok=()=>{ b.textContent=t('copied'); setTimeout(()=>b.textContent=t('copy'),1600); };
    const fallback=()=>{ const s=getSelection(), r=document.createRange(); r.selectNodeContents(src); s.removeAllRanges(); s.addRange(r); b.textContent=t('selected'); setTimeout(()=>b.textContent=t('copy'),1600); };
    try{ navigator.clipboard.writeText(text).then(ok,fallback); }catch(err){ fallback(); }
  });


  /* ================= mobile navigation drawer ================= */
  const mnav=$('#mnav'), openNav=$('#openNav');
  openNav.addEventListener('click',()=>{ mnav.showModal(); openNav.setAttribute('aria-expanded','true'); });
  $('#closeNav').addEventListener('click',()=>mnav.close());
  mnav.addEventListener('close',()=>openNav.setAttribute('aria-expanded','false'));
  mnav.addEventListener('click',e=>{ if(e.target===mnav || e.target.closest('a[href^="#"]')) mnav.close(); });


  /* ================= phone layout helpers ================= */
  const mq = matchMedia('(max-width:760px)');
  function syncFolds(force){
    document.querySelectorAll('details[data-fold]').forEach(d=>{
      if(!force && d.dataset.synced) return;
      d.open = !mq.matches || d.hasAttribute('data-fold-open'); d.dataset.synced = '1';
    });
  }
  document.addEventListener('click', e=>{ const s=e.target.closest('details[data-fold] > summary'); if(s && !mq.matches) e.preventDefault(); });
  window.addEventListener('resize', ()=>{ if(!$('#siteNotice').hidden) document.documentElement.style.setProperty('--notice-h', $('#siteNotice').offsetHeight+'px'); });
  mq.addEventListener('change', ()=>{ syncFolds(true); document.querySelectorAll('.snap').forEach(setupDots); });
  function setupDots(el){
    let d = el.nextElementSibling;
    if(!d || !d.classList.contains('dots')){ d=document.createElement('div'); d.className='dots'; d.setAttribute('aria-hidden','true'); el.after(d); }
    const n = el.children.length; if(d.children.length!==n) d.innerHTML = '<i></i>'.repeat(n);
    const upd = ()=>{ const c=el.children[0]; if(!c) return; const w=c.getBoundingClientRect().width+14; const i=Math.min(n-1, Math.round(el.scrollLeft/w)); [...d.children].forEach((x,k)=>x.classList.toggle('on', k===i)); };
    if(!el._dots){ el.addEventListener('scroll', ()=>requestAnimationFrame(upd), {passive:true}); el._dots = true; }
    upd();
  }
  function renderPCards(){
    $('#pCards').innerHTML = PARFAITS.map((p,i)=>`<article class="pcard">
      <div class="pcard-img"><img src="img/${p.img}.webp" alt="${esc(p.name)}" loading="lazy"></div>
      <div class="pcard-body"><span class="no">No. ${p.no}</span><h3>${p.name}</h3><span class="flav">${p.flav[lang]}</span>
        <details class="m-fold"><summary><span>${t('col.layersShow')}</span></summary><ul class="layers">${p.layers.map(l=>`<li>${heartSm}<span lang="fr">${esc(l)}</span></li>`).join('')}</ul></details>
        <div class="pcard-foot"><span class="big-price">${arBig(p.price)}</span><button class="btn btn-fill${isSold(p.id)?' is-sold':''}" type="button" data-padd="${i}" ${isSold(p.id)?'aria-disabled="true"':''}>${isSold(p.id)?t('so.tag'):t('add')}</button></div>
      </div></article>`).join('');
    setupDots($('#pCards'));
  }
  document.addEventListener('click', e=>{ const b=e.target.closest('[data-padd]'); if(!b) return; const p=PARFAITS[Number(b.dataset.padd)]; addToCart({key:p.id,name:p.name,price:p.price,img:p.img,sub:''}); });
  // highlight the bottom-bar item for the section on screen
  const spyLinks = document.querySelectorAll('.tabbar [data-sec]');
  const spy = new IntersectionObserver(es=>{ es.forEach(en=>{ if(en.isIntersecting){ const id=en.target.id; spyLinks.forEach(a=>a.classList.toggle('on', a.dataset.sec===id)); } }); }, {rootMargin:'-45% 0px -50% 0px'});
  document.querySelectorAll('.hero, #parfaits, #offers, #carte, #brunch, #reserve, .closing, footer').forEach(s=>spy.observe(s));

  function markExtras(){ document.querySelectorAll('[data-add]').forEach(b=>markSold(b, b.dataset.add)); }
  function renderAll(){
    applyStatic(); renderNotice(); markExtras(); renderStatus(); renderTrackChip(); renderParfait(false); renderPCards(); renderCarte(); renderTeas(); renderParty(); renderSlots(); saveCart();
    syncFolds();
    if(dlg.open) renderCart();
    if(!$('#reserveDone').hidden){ /* keep confirmation as written */ }
  }
  renderAll(); setInterval(()=>{ renderStatus(); renderTrackChip(); if(dlg.open && view==='track') renderCart(); },60000);
})();
