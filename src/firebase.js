import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth"; // 1. Tambahkan ini

const firebaseConfig = {
  apiKey: "AIzaSyADrtZareYXSNpyL4pAkCp-7bB604x9Krc",
  authDomain: "webbullying-57509.firebaseapp.com",
  databaseURL:
    "https://webbullying-57509-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "webbullying-57509",
  storageBucket: "webbullying-57509.firebasestorage.app",
  messagingSenderId: "665717016402",
  appId: "1:665717016402:web:41efdbb315a9c6fc311c8b",
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);
export const storage = getStorage(app);
export const auth = getAuth(app); // 2. Tambahkan export ini!

export default app;