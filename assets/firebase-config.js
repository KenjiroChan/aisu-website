/* Firebase connection for AISU.
   Paste the firebaseConfig block from the Firebase console (Project settings → General → Your apps → Web app)
   below. Example shape:

   window.AISU_FIREBASE_CONFIG = {
     apiKey: "AIza...",
     authDomain: "aisu-cafe.firebaseapp.com",
     projectId: "aisu-cafe",
     storageBucket: "aisu-cafe.firebasestorage.app",
     messagingSenderId: "1234567890",
     appId: "1:1234567890:web:abc123"
   };

   This block isn't a password: it only tells the site which database to use. The security rules in
   firestore.rules decide who can read or write. If it's set to `null`, the site runs in preview mode and
   forms show a confirmation without sending anything. */
window.AISU_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDlSpuOCc6diwyXimkV6bZKk9iP0H1iqck",
  authDomain: "aisukurimu.firebaseapp.com",
  projectId: "aisukurimu",
  storageBucket: "aisukurimu.firebasestorage.app",
  messagingSenderId: "46502066456",
  appId: "1:46502066456:web:36b11e9ad81e85eff7066d"
};

/* Spam protection (Firebase App Check with reCAPTCHA Enterprise, free on the Spark plan), off while empty.
   To switch it on: create a score-based Web key in Google Cloud console → Security → reCAPTCHA (for the
   site's real address, never localhost), register it in Firebase → Security → App Check → Apps, paste the
   KEY ID here, and only after a few days of traffic showing as verified, press Enforce for Cloud Firestore.
   The website and the staff dashboard both read this. */
window.AISU_APPCHECK_SITE_KEY = '';
