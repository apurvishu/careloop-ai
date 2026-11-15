import * as admin from "firebase-admin";

export function isFirebaseAdminConfigured(): boolean {
  return (
    !!process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_PROJECT_ID !== "careloop-demo" &&
    !!process.env.FIREBASE_CLIENT_EMAIL &&
    !!process.env.FIREBASE_PRIVATE_KEY
  );
}

export function getAdminApp(): {
  app: admin.app.App | null;
  auth: admin.auth.Auth | null;
  db: admin.firestore.Firestore | null;
} {
  if (!isFirebaseAdminConfigured()) {
    return { app: null, auth: null, db: null };
  }

  try {
    if (!admin.apps.length) {
      const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey,
        }),
      });
    }

    const app = admin.app();
    const auth = admin.auth(app);
    const db = admin.firestore(app);
    return { app, auth, db };
  } catch (error) {
    console.warn("Firebase Admin init skipped or running in mock mode:", error);
    return { app: null, auth: null, db: null };
  }
}
