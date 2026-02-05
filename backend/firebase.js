const admin = require('firebase-admin');

if (!admin.apps.length) {
  try {
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
      console.log('Firebase Admin Initialized with Environment Variables');
    } else {
      // Fallback to ADC if available or emulators
      admin.initializeApp();
      console.log('Firebase Admin Initialized (ADC or Default)');
    }
  } catch (error) {
    console.error('Firebase Admin Initialization Error:', error);
  }
}

module.exports = admin;
