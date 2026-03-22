import * as admin from 'firebase-admin';

// Check if we have the required environment variables before initializing
const canInitialize = 
  process.env.FIREBASE_PROJECT_ID && 
  process.env.FIREBASE_CLIENT_EMAIL && 
  process.env.FIREBASE_PRIVATE_KEY;

if (canInitialize && !admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    console.log('[Firebase] Admin initialized successfully');
  } catch (error) {
    console.error('[Firebase] Admin initialization error:', error);
  }
}

// Export messaging only if apps are initialized, otherwise return null or a proxy
export const messaging = (canInitialize && admin.apps.length) ? admin.messaging() : null;
