import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

// Import PWA Auto Register
import { registerSW } from "virtual:pwa-register";

registerSW({ immediate: true });

// Daftarkan Service Worker Firebase untuk Notifikasi Background
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/firebase-messaging-sw.js")
    .then((registration) => {
      console.log("FCM Service Worker aktif:", registration.scope);
    })
    .catch((err) => {
      console.error("Gagal registrasi FCM Service Worker:", err);
    });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);