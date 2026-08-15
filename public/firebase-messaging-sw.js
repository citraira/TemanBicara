importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyADrtZareYXSNpyL4pAkCp-7bB604x9Krc",
  authDomain: "webbullying-57509.firebaseapp.com",
  projectId: "webbullying-57509",
  storageBucket: "webbullying-57509.firebasestorage.app",
  messagingSenderId: "665717016402",
  appId: "1:665717016402:web:41efdbb315a9c6fc311c8b",
});

const messaging = firebase.messaging();

// Menampilkan notifikasi saat aplikasi berada di latar belakang
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || payload.data?.title || "Teman Bicara";
  const options = {
    body: payload.notification?.body || payload.data?.body || "Ada pembaruan status laporan.",
    icon: "/pwa-192x192.png",
    badge: "/pwa-192x192.png",
    vibrate: [200, 100, 200],
    data: payload.data || {},
  };

  self.registration.showNotification(title, options);
});

// Aksi saat notifikasi di status bar HP diklik
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url.includes('/') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/dashboard-siswa');
      }
    })
  );
});