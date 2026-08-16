import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import {
  getMessaging,
  isSupported,
} from "firebase/messaging";

// ========================================
// FIREBASE CONFIGURATION
// ========================================

const firebaseConfig = {
  apiKey:
    "AIzaSyADrtZareYXSNpyL4pAkCp-7bB604x9Krc",

  authDomain:
    "webbullying-57509.firebaseapp.com",

  databaseURL:
    "https://webbullying-57509-default-rtdb.asia-southeast1.firebasedatabase.app",

  projectId:
    "webbullying-57509",

  storageBucket:
    "webbullying-57509.firebasestorage.app",

  messagingSenderId:
    "665717016402",

  appId:
    "1:665717016402:web:41efdbb315a9c6fc311c8b",
};

// ========================================
// INITIALIZE FIREBASE
// ========================================

const app = initializeApp(firebaseConfig);

// ========================================
// FIREBASE SERVICES
// ========================================

export const db = getDatabase(app);

export const storage = getStorage(app);

export const auth = getAuth(app);

// ========================================
// FIREBASE CLOUD MESSAGING
// ========================================

export const messaging = async () => {
  try {
    const supported = await isSupported();

    if (!supported) {
      console.warn(
        "Firebase Messaging tidak didukung oleh browser ini."
      );

      return null;
    }

    return getMessaging(app);
  } catch (error) {
    console.warn(
      "Firebase Messaging tidak dapat diinisialisasi:",
      error
    );

    return null;
  }
};

// ========================================
// DEFAULT EXPORT
// ========================================

export default app;