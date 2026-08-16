import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import "./index.css";

import { registerSW } from "virtual:pwa-register";

// ========================================
// REGISTER PWA SERVICE WORKER
// ========================================

registerSW({
  immediate: true,
});

// ========================================
// REGISTER FIREBASE MESSAGING SERVICE WORKER
// ========================================

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration =
        await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js"
        );

      console.log(
        "FCM Service Worker aktif:",
        registration.scope
      );
    } catch (error) {
      console.error(
        "Gagal registrasi FCM Service Worker:",
        error
      );
    }
  });
}

// ========================================
// RENDER APPLICATION
// ========================================

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);