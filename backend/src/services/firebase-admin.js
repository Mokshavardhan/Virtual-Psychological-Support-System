import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

let app;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    // Load from file if path is provided
    app = admin.initializeApp({
      credential: admin.credential.cert(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
    });
    console.log('[Firebase Admin] Initialized with service account file');
  } else if (process.env.FIREBASE_PRIVATE_KEY) {
    // Fallback to env variables (useful for platforms like Heroku/Render)
    app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
    console.log('[Firebase Admin] Initialized with explicit environment variables');
  } else if (process.env.FIREBASE_PROJECT_ID) {
    // In Google Cloud environments (like App Hosting), ADC works automatically
    app = admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.FIREBASE_PROJECT_ID
    });
    console.log('[Firebase Admin] Initialized with Application Default Credentials');
  } else {
    console.warn('[Firebase Admin] Not initialized. Missing credentials.');
  }
} catch (error) {
  console.error('[Firebase Admin] Initialization error:', error.message);
}

import jwt from 'jsonwebtoken';

export const verifyIdToken = async (idToken) => {
  if (!app) {
    // DEVELOPMENT BYPASS: If Firebase Admin is not setup, decode the token without verification
    // This allows the user to test the app flow without needing a service account key immediately.
    console.warn('[Firebase Admin] Not initialized. Using development bypass (unverified decode).');
    
    try {
      const decoded = jwt.decode(idToken);
      if (decoded) {
        return {
          uid: decoded.sub || decoded.user_id,
          email: decoded.email,
          phoneNumber: decoded.phone_number,
          name: decoded.name || decoded.email?.split('@')[0],
          picture: decoded.picture
        };
      }
    } catch (e) {
      console.error('[Firebase Admin] Bypass failed to decode token:', e.message);
    }

    if (idToken.startsWith('mock_')) {
        return {
            uid: idToken.replace('mock_', ''),
            email: 'mock_user@example.com',
            name: 'Mock User'
        };
    }
    throw new Error('Firebase Admin not initialized and token could not be decoded.');
  }
  return admin.auth().verifyIdToken(idToken);
};

export default app;
