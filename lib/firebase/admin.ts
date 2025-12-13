import "server-only";
import admin from "firebase-admin";

interface FirebaseAdminConfig {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

function formatPrivateKey(key: string) {
  return key.replace(/\\n/g, "\n");
}

export function createFirebaseAdminApp(config: FirebaseAdminConfig) {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const cert = admin.credential.cert({
    projectId: config.projectId,
    clientEmail: config.clientEmail,
    privateKey: formatPrivateKey(config.privateKey),
  });

  return admin.initializeApp({
    credential: cert,
    projectId: config.projectId,
  });
}

export const adminApp = createFirebaseAdminApp({
  projectId: process.env.FIREBASE_PROJECT_ID!,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
  privateKey: process.env.FIREBASE_PRIVATE_KEY!,
});

export const adminAuth = adminApp.auth();
export const adminDb = adminApp.firestore();
