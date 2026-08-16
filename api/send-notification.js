import admin from "firebase-admin";

const PROJECT_ID = "webbullying-57509";

const DATABASE_URL =
  "https://webbullying-57509-default-rtdb.asia-southeast1.firebasedatabase.app";

function getFirebaseAdmin() {
  // Jangan initialize Firebase Admin lebih dari sekali
  if (admin.apps.length) {
    return admin.app();
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (!raw) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT belum disetel di Vercel."
    );
  }

  let serviceAccount;

  try {
    serviceAccount = JSON.parse(raw);
  } catch {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT bukan JSON yang valid."
    );
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: DATABASE_URL,
    projectId: PROJECT_ID,
  });

  return admin.app();
}

// Membersihkan NIS agar aman digunakan sebagai key Firebase
function cleanNis(value) {
  return String(value || "")
    .trim()
    .replace(/[.#$[\]]/g, "_");
}

// Membuat isi notifikasi
function buildPayload({
  type,
  nama,
  kelas,
  jenis,
  status,
  url,
}) {
  const title =
    type === "status_update"
      ? "Pembaruan Status Laporan"
      : "Laporan Pengaduan Baru";

  const body =
    type === "status_update"
      ? `Laporan ${jenis || "pengaduan"} kamu sekarang berstatus: ${
          status || "Diproses"
        }.`
      : `Dari ${nama || "Siswa"} (Kelas ${
          kelas || "-"
        }): ${jenis || "Pengaduan"}`;

  return {
    title,
    body,
    url:
      url ||
      (type === "status_update"
        ? "/dashboard-siswa"
        : "/dashboard-admin"),
    type,
    timestamp: new Date().toISOString(),
    nama: String(nama || ""),
    kelas: String(kelas || ""),
    jenis: String(jenis || ""),
    status: String(status || ""),
  };
}

export default async function handler(req, res) {
  // ============================================
  // CORS OPTIONS
  // ============================================

  if (req.method === "OPTIONS") {
    res.setHeader(
      "Access-Control-Allow-Origin",
      "*"
    );

    res.setHeader(
      "Access-Control-Allow-Methods",
      "POST, OPTIONS"
    );

    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type"
    );

    return res.status(204).end();
  }

  // ============================================
  // HANYA POST
  // ============================================

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method tidak diizinkan.",
    });
  }

  try {
    const app = getFirebaseAdmin();

    const adminDb = admin.database(app);
    const messaging = admin.messaging(app);

    const body = req.body || {};

    const {
      recipient,
      nis,
      nama,
      kelas,
      jenis,
      status,
    } = body;

    // ============================================
    // VALIDASI PENERIMA
    // ============================================

    if (
      recipient !== "admin" &&
      recipient !== "siswa"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "recipient harus 'admin' atau 'siswa'.",
      });
    }

    // ============================================
    // TENTUKAN LOKASI TOKEN
    // ============================================

    let tokenPath;

    if (recipient === "admin") {
      tokenPath = "fcmTokens/admin/utama";
    } else {
      const cleanKey = cleanNis(nis);

      if (!cleanKey) {
        return res.status(400).json({
          success: false,
          message: "NIS siswa diperlukan.",
        });
      }

      tokenPath =
        `fcmTokens/siswa/${cleanKey}`;
    }

    // ============================================
    // AMBIL TOKEN FCM
    // ============================================

    const tokenSnapshot =
      await adminDb
        .ref(tokenPath)
        .once("value");

    const tokenData =
      tokenSnapshot.val();

    const token =
      tokenData?.token;

    if (!token) {
      return res.status(404).json({
        success: false,
        message:
          recipient === "admin"
            ? "Token FCM guru belum tersedia. Buka Dashboard Guru dan izinkan notifikasi."
            : "Token FCM siswa belum tersedia. Buka Dashboard Siswa dan izinkan notifikasi.",
      });
    }

    // ============================================
    // BUAT DATA NOTIFIKASI
    // ============================================

    const messageData =
      buildPayload({
        type:
          recipient === "siswa"
            ? "status_update"
            : "new_report",

        nama,
        kelas,
        jenis,
        status,

        url:
          recipient === "siswa"
            ? "/dashboard-siswa"
            : "/dashboard-admin",
      });

    // ============================================
    // PESAN FCM
    // ============================================

    const message = {
      token,

      data: Object.fromEntries(
        Object.entries(messageData).map(
          ([key, value]) => [
            key,
            String(value ?? ""),
          ]
        )
      ),

      webpush: {
        headers: {
          TTL: "86400",
        },
      },
    };

    // ============================================
    // KIRIM FCM
    // ============================================

    try {
      const messageId =
        await messaging.send(
          message
        );

      return res.status(200).json({
        success: true,
        messageId,
      });
    } catch (sendError) {
      const code =
        sendError?.code || "";

      const staleToken =
        code.includes(
          "registration-token-not-registered"
        ) ||
        code.includes(
          "invalid-registration-token"
        );

      // Hapus token lama jika sudah tidak valid
      if (staleToken) {
        await adminDb
          .ref(tokenPath)
          .remove()
          .catch(() => {});
      }

      throw sendError;
    }
  } catch (error) {
    console.error(
      "FCM error:",
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