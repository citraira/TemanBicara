importScripts(
  "https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js"
);

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
  const title =
    payload.notification?.title ||
    payload.data?.title ||
    "Teman Bicara";

  const options = {
    body:
      payload.notification?.body ||
      payload.data?.body ||
      "Ada pembaruan status laporan.",

    icon: "/pwa-192x192.png",
    badge: "/pwa-192x192.png",

    vibrate: [200, 100, 200],

    data: {
      ...(payload.data || {}),
      url: payload.data?.url || "/dashboard-siswa",
    },
  };

  self.registration
    .showNotification(title, options)
    .catch((error) => {
      console.error(
        "Gagal menampilkan notifikasi background:",
        error
      );
    });
});

// Aksi saat notifikasi di status bar HP diklik
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl =
    event.notification?.data?.url ||
    "/dashboard-siswa";

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then(async (windowClients) => {
        const target = new URL(
          targetUrl,
          self.location.origin
        );

        // Jika aplikasi sudah terbuka
        if (windowClients.length > 0) {
          const client = windowClients[0];

          try {
            if ("navigate" in client) {
              await client.navigate(target.href);
            }

            if ("focus" in client) {
              await client.focus();
            }

            return;
          } catch (error) {
            console.error(
              "Gagal mengarahkan tab yang sudah terbuka:",
              error
            );
          }
        }

        // Jika aplikasi belum terbuka
        if (clients.openWindow) {
          return clients.openWindow(target.href);
        }

        return undefined;
      })
      .catch((error) => {
        console.error(
          "Gagal menangani klik notifikasi:",
          error
        );
      })
  );
});