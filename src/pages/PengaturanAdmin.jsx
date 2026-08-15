import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { 
  verifyBeforeUpdateEmail, 
  updatePassword
} from "firebase/auth";
import { ref, set, get } from "firebase/database";

function PengaturanAdmin() {
  const navigate = useNavigate();

  const [emailGuru, setEmailGuru] = useState("");
  const [namaGuru, setNamaGuru] = useState("");
  const [noWaGuru, setNoWaGuru] = useState("");
  
  // State untuk Ubah Kata Sandi
  const [sandiBaru, setSandiBaru] = useState("");
  
  const [loading, setLoading] = useState(false);

  // State untuk Modal Informasi Pengiriman Link Verifikasi Email
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");

  // State Pop-Up Notifikasi Kustom (Pengganti alert())
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    type: "success", // 'success' | 'error' | 'warning'
    title: "",
    message: "",
    onCloseCallback: null,
  });

  const showAlert = (type, title, message, onCloseCallback = null) => {
    setAlertConfig({
      isOpen: true,
      type,
      title,
      message,
      onCloseCallback,
    });
  };

  const handleCloseAlert = () => {
    const callback = alertConfig.onCloseCallback;
    setAlertConfig((prev) => ({ ...prev, isOpen: false }));
    if (callback) {
      callback();
    }
  };

  useEffect(() => {
    const loadAdminData = async () => {
      const currentUser = auth.currentUser;
      
      const activeEmail = currentUser?.email || localStorage.getItem("emailGuru") || "";
      setEmailGuru(activeEmail);

      try {
        const snapshot = await get(ref(db, "pengaturan/admin"));
        if (snapshot.exists()) {
          const data = snapshot.val();
          setNamaGuru(data.nama || localStorage.getItem("namaGuru") || "");
          setNoWaGuru(data.noWa || localStorage.getItem("noWaGuru") || "");
        } else {
          setNamaGuru(localStorage.getItem("namaGuru") || "");
          setNoWaGuru(localStorage.getItem("noWaGuru") || "");
        }
      } catch (err) {
        console.error("Gagal memuat data database:", err);
        setNamaGuru(localStorage.getItem("namaGuru") || "");
        setNoWaGuru(localStorage.getItem("noWaGuru") || "");
      }
    };

    loadAdminData();
  }, []);

  const handleSimpanPengaturan = async (e) => {
    e.preventDefault();
    setLoading(true);

    const currentUser = auth.currentUser;

    if (!currentUser) {
      setLoading(false);
      showAlert(
        "warning",
        "Sesi Berakhir",
        "Sesi login Anda telah berakhir demi keamanan. Silakan login kembali!",
        () => navigate("/login-admin")
      );
      return;
    }

    const currentEmail = currentUser.email;
    const isEmailChanged = emailGuru.trim().toLowerCase() !== currentEmail.toLowerCase();
    const isPasswordChanged = sandiBaru.trim().length > 0;

    try {
      // 1. JIKA KATA SANDI DIUBAH
      if (isPasswordChanged) {
        if (sandiBaru.trim().length < 6) {
          setLoading(false);
          showAlert("warning", "Kata Sandi Kurang", "Kata sandi baru minimal harus terdiri dari 6 karakter!");
          return;
        }

        await updatePassword(currentUser, sandiBaru.trim());
      }

      // 2. JIKA EMAIL DIUBAH
      if (isEmailChanged) {
        await verifyBeforeUpdateEmail(currentUser, emailGuru.trim());
        setPendingEmail(emailGuru.trim());
        setShowEmailModal(true);
      }

      // 3. SIMPAN NAMA & NO WA KE FIREBASE REALTIME DATABASE & LOCALSTORAGE
      await saveOtherData(currentEmail);

      let message = "Pengaturan profil admin berhasil diperbarui!";
      if (isPasswordChanged && isEmailChanged) {
        message = "Kata sandi berhasil diubah dan tautan verifikasi telah dikirim ke email baru Anda.";
      } else if (isPasswordChanged) {
        message = "Kata sandi berhasil diubah! Silakan gunakan kata sandi baru saat login berikutnya.";
      } else if (isEmailChanged) {
        message = "Tautan verifikasi telah dikirim ke email baru Anda!";
      }

      showAlert("success", "Pengaturan Disimpan", message);
      setSandiBaru("");
    } catch (error) {
      console.error("Gagal menyimpan pengaturan:", error);

      if (
        error.code === "auth/requires-recent-login" || 
        error.code === "auth/user-token-expired"
      ) {
        showAlert(
          "warning",
          "Sesi Kedaluwarsa",
          "Untuk mengubah data sensitif, Anda perlu keluar dan login ulang demi alasan keamanan.",
          () => navigate("/login-admin")
        );
      } else if (error.code === "auth/invalid-email") {
        showAlert("error", "Email Tidak Valid", "Format penulisan email admin tidak valid!");
      } else if (error.code === "auth/weak-password") {
        showAlert("error", "Kata Sandi Lemah", "Kata sandi terlalu lemah! Gunakan minimal 6 karakter kombinasi.");
      } else {
        showAlert("error", "Gagal Menyimpan", "Gagal menyimpan pengaturan: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const saveOtherData = async (emailToSave) => {
    localStorage.setItem("emailGuru", emailToSave);
    localStorage.setItem("namaGuru", namaGuru.trim());
    localStorage.setItem("noWaGuru", noWaGuru.trim());

    // PENTING: Menyimpan ke node 'pengaturan/admin' agar dapat dibaca oleh 'HubungiGuru.jsx'
    await set(ref(db, "pengaturan/admin"), {
      email: emailToSave,
      nama: namaGuru.trim(),
      noWa: noWaGuru.trim(),
    });
  };

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#F4FBEE",
      padding: "20px 15px",
      fontFamily: "'Segoe UI', Roboto, sans-serif",
      boxSizing: "border-box",
    },
    card: {
      background: "#fff",
      padding: "25px 20px",
      borderRadius: "20px",
      maxWidth: "480px",
      margin: "0 auto",
      boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
      border: "2px solid #C8E6C9",
    },
    backBtn: {
      background: "#FFEB3B",
      border: "none",
      color: "#1B5E20",
      fontSize: "13px",
      fontWeight: "800",
      cursor: "pointer",
      padding: "8px 14px",
      borderRadius: "10px",
      marginBottom: "20px",
      boxShadow: "0 3px 0 #FBC02D",
    },
    title: {
      color: "#1B5E20",
      marginBottom: "20px",
      marginTop: 0,
      fontSize: "20px",
      fontWeight: "800",
    },
    sectionTitle: {
      color: "#2E7D32",
      fontSize: "14px",
      fontWeight: "800",
      marginTop: "15px",
      marginBottom: "10px",
      borderBottom: "1px solid #E8F5E9",
      paddingBottom: "5px",
    },
    label: {
      display: "block",
      fontWeight: "700",
      marginBottom: "6px",
      color: "#1B5E20",
      fontSize: "13px",
    },
    input: {
      width: "100%",
      padding: "10px 12px",
      borderRadius: "10px",
      border: "2px solid #C8E6C9",
      marginBottom: "16px",
      fontSize: "14px",
      boxSizing: "border-box",
      outline: "none",
      background: "#FAFAFA",
    },
    btn: {
      width: "100%",
      padding: "12px",
      background: loading ? "#A5D6A7" : "#2E7D32",
      color: "#fff",
      border: "none",
      borderRadius: "12px",
      fontWeight: "800",
      fontSize: "14px",
      cursor: loading ? "not-allowed" : "pointer",
      boxShadow: loading ? "none" : "0 3px 0 #1B5E20",
      textTransform: "uppercase",
      marginTop: "10px",
    },
    modalOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.6)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
      padding: "15px",
      boxSizing: "border-box",
    },
    modalCard: {
      background: "#fff",
      padding: "25px 20px",
      borderRadius: "20px",
      maxWidth: "380px",
      width: "100%",
      textAlign: "center",
      boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
      border: "2px solid #C8E6C9",
      boxSizing: "border-box",
    },
    okBtn: {
      width: "100%",
      padding: "12px",
      background: "#2E7D32",
      color: "#fff",
      border: "none",
      borderRadius: "12px",
      fontWeight: "800",
      cursor: "pointer",
      fontSize: "13px",
      boxShadow: "0 3px 0 #1B5E20",
      textTransform: "uppercase",
      marginTop: "15px",
    },
    // Gaya Pop-up Modal Kustom Notifikasi
    alertIconWrapper: (type) => ({
      width: "60px",
      height: "60px",
      borderRadius: "50%",
      margin: "0 auto 12px auto",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: "28px",
      background:
        type === "success"
          ? "#E8F5E9"
          : type === "error"
          ? "#FFEBEE"
          : "#FFFDE7",
      border: `2px solid ${
        type === "success"
          ? "#2E7D32"
          : type === "error"
          ? "#D32F2F"
          : "#FBC02D"
      }`,
      color:
        type === "success"
          ? "#2E7D32"
          : type === "error"
          ? "#D32F2F"
          : "#F57F17",
    }),
    alertBtn: (type) => ({
      width: "100%",
      padding: "12px",
      border: "none",
      borderRadius: "12px",
      fontWeight: "800",
      fontSize: "14px",
      cursor: "pointer",
      textTransform: "uppercase",
      color: type === "warning" ? "#1B5E20" : "#fff",
      background:
        type === "success"
          ? "#2E7D32"
          : type === "error"
          ? "#D32F2F"
          : "#FFEB3B",
      boxShadow:
        type === "success"
          ? "0 3px 0 #1B5E20"
          : type === "error"
          ? "0 3px 0 #9A0007"
          : "0 3px 0 #FBC02D",
    }),
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <button
          type="button"
          style={styles.backBtn}
          onClick={() => navigate("/dashboard-admin")}
        >
          Kembali ke Dashboard
        </button>

        <h2 style={styles.title}>Pengaturan Akun Admin</h2>

        <form onSubmit={handleSimpanPengaturan}>
          {/* INFORMASI PROFIL */}
          <div style={styles.sectionTitle}>INFORMASI PROFIL</div>

          <label style={styles.label}>Nama Guru / Admin</label>
          <input
            type="text"
            value={namaGuru}
            onChange={(e) => setNamaGuru(e.target.value)}
            placeholder="Nama Lengkap"
            style={styles.input}
          />

          <label style={styles.label}>No. WhatsApp</label>
          <input
            type="text"
            value={noWaGuru}
            onChange={(e) => setNoWaGuru(e.target.value)}
            placeholder="08123456789"
            style={styles.input}
          />

          {/* AKUN LOGIN */}
          <div style={styles.sectionTitle}>KREDENSIAL LOGIN</div>

          <label style={styles.label}>Email Login Admin & Kontak</label>
          <input
            type="email"
            value={emailGuru}
            onChange={(e) => setEmailGuru(e.target.value)}
            placeholder="admin@sekolah.sch.id"
            style={styles.input}
            required
          />

          <label style={styles.label}>Kata Sandi Baru (Opsional)</label>
          <input
            type="password"
            value={sandiBaru}
            onChange={(e) => setSandiBaru(e.target.value)}
            placeholder="Biarkan kosong jika tidak diubah"
            style={styles.input}
          />

          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? "Memproses..." : "Simpan Pengaturan"}
          </button>
        </form>
      </div>

      {/* MODAL POPUP INFORMASI VERIFIKASI EMAIL */}
      {showEmailModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <h3 style={{ color: "#1B5E20", marginBottom: "10px", fontSize: "18px", fontWeight: "800" }}>
              Verifikasi Email Dikirim!
            </h3>
            <p style={{ color: "#556B4D", fontSize: "13px", lineHeight: "1.6" }}>
              Tautan konfirmasi telah dikirimkan ke email baru Anda:
              <br />
              <strong style={{ color: "#1B5E20" }}>{pendingEmail}</strong>
              <br /><br />
              Silakan buka email Anda (cek juga folder Spam) lalu klik link verifikasi tersebut agar email login resmi diperbarui.
            </p>

            <button
              type="button"
              style={styles.okBtn}
              onClick={() => setShowEmailModal(false)}
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}

      {/* POP-UP NOTIFIKASI KUSTOM BERDESAIN (PENGGANTI ALERT) */}
      {alertConfig.isOpen && (
        <div style={styles.modalOverlay} onClick={handleCloseAlert}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.alertIconWrapper(alertConfig.type)}>
              {alertConfig.type === "success"
                ? "✓"
                : alertConfig.type === "error"
                ? "✕"
                : "ℹ"}
            </div>

            <h3
              style={{
                fontSize: "18px",
                fontWeight: "800",
                marginBottom: "8px",
                color:
                  alertConfig.type === "success"
                    ? "#1B5E20"
                    : alertConfig.type === "error"
                    ? "#C62828"
                    : "#E65100",
              }}
            >
              {alertConfig.title}
            </h3>

            <p style={{ color: "#556B4D", fontSize: "13px", marginBottom: "18px", lineHeight: "1.5" }}>
              {alertConfig.message}
            </p>

            <button
              style={styles.alertBtn(alertConfig.type)}
              onClick={handleCloseAlert}
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PengaturanAdmin;