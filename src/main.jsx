import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

// Import pendaftar Service Worker otomatis dari plugin PWA
import { registerSW } from "virtual:pwa-register";

// Daftarkan service worker dengan auto update
registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);