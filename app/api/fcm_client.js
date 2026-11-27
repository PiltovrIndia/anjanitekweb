import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

const appName = 'anjanitek-fcm';

export function fcmMessaging() {
  let app = getApps().find((existing) => existing.name === appName);
  if (!app) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not configured');
    let credentials;
    try {
      credentials = JSON.parse(raw);
    } catch (_) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON');
    }
    app = initializeApp({ credential: cert(credentials) }, appName);
  }
  return getMessaging(app);
}
