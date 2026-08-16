import admin from "firebase-admin";

const PROJECT_ID = "webbullying-57509";

function getFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT belum disetel di Environment Variables Vercel."
    );
  }

  let serviceAccount;

  try {
    serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT
    );
  } catch (error) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT bukan JSON yang valid."
    );
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: PROJECT_ID,
  });

  return admin.app();
}

export default async function handler(req, res) {
  // Hanya menerima POST
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method tidak diizinkan.",
    });
  }

  try {
    const app = getFirebaseAdmin();
    const messaging = admin.messaging(app);

    const {
      token,
      nama,
      kelas,
      jenis,
    } = req.body || {};

    // Validasi token FCM
    if (!token || typeof token !== "string") {
      return res.status(400).json({
        success: false,
        message: "Token FCM tidak ditemukan.",
      });
    }

    const namaSiswa =
      String(nama || "Siswa").trim();

    const kelasSiswa =
      String(kelas || "-").trim();

    const jenisLaporan =
      String(jenis || "Pengaduan").trim();

    const message = {
      token,

      notification: {
        title: "Laporan Pengaduan Baru",
        body: `Dari ${namaSiswa} (Kelas ${kelasSiswa}): ${jenisLaporan}`,
      },

      data: {
        title: "Laporan Pengaduan Baru",
        body: `Dari ${namaSiswa} (Kelas ${kelasSiswa}): ${jenisLaporan}`,
        url: "/daftar-pengaduan",
      },

      webpush: {
        notification: {
          title: "Laporan Pengaduan Baru",
          body: `Dari ${namaSiswa} (Kelas ${kelasSiswa}): ${jenisLaporan}`,
          icon: "/pwa-192x192.png",
          badge: "/pwa-192x192.png",
        },

        fcmOptions: {
          link: "/daftar-pengaduan",
        },
      },
    };

    const response =
      await messaging.send(message);

    return res.status(200).json({
      success: true,
      message: "Notifikasi berhasil dikirim.",
      messageId: response,
    });
  } catch (error) {
    console.error(
      "Gagal mengirim FCM:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Gagal mengirim notifikasi.",
    });
  }
}