import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { updateEmail } from "firebase/auth";
import { ref, set } from "firebase/database";

function PengaturanAdmin() {
  const navigate = useNavigate();

  const [emailGuru, setEmailGuru] = useState("");
  const [namaGuru, setNamaGuru] = useState("");
  const [noWaGuru, setNoWaGuru] = useState("");
  const [loading, setLoading] = useState(false);

  // State untuk Modal & Verifikasi OTP
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [inputOtp, setInputOtp] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");

  useEffect(() => {
    const savedEmail = localStorage.getItem("emailGuru") || auth.currentUser?.email || "";
    const savedNama = localStorage.getItem("namaGuru") || "";
    const savedWa = localStorage.getItem("noWaGuru") || "";

    setEmailGuru(savedEmail);
    setNamaGuru(savedNama);
    setNoWaGuru(savedWa);
  }, []);

  // 1. FUNGSI KIRIM KODE OTP KE EMAIL BARU
  const sendOtpToEmail = async (targetEmail, otpCode) => {
    console.log(`[MOCK EMAIL SERVICE] Kode OTP dikirim ke ${targetEmail}: ${otpCode}`);

    // Simulasi Alert untuk testing lokal
    alert(`[SIMULASI EMAIL]\nKode OTP verifikasi Anda adalah: ${otpCode}\n(Kode ini dikirim ke ${targetEmail})`);
  };

  // 2. HANDLER KLIK SIMPAN PENGATURAN
  const handleSimpanPengaturan = async (e) => {
    e.preventDefault();
    setLoading(true);

    const currentUser = auth.currentUser;
    const oldEmail = localStorage.getItem("emailGuru") || currentUser?.email;

    // CEK JIKA EMAIL DIUBAH
    if (currentUser && emailGuru.trim() !== oldEmail) {
      // Generate 6 digit angka acak OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(otp);
      setPendingEmail(emailGuru.trim());

      // Kirim OTP ke email baru
      await sendOtpToEmail(emailGuru.trim(), otp);

      // Tampilkan Modal Popup
      setShowOtpModal(true);
      setLoading(false);
      return;
    }

    // JIKA EMAIL TIDAK DIUBAH, LANGSUNG SIMPAN NAMA & WA
    await saveOtherData();
    setLoading(false);
  };

  // 3. FUNGSI VERIFIKASI KODE OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (inputOtp.trim() !== generatedOtp) {
      alert("Kode OTP yang Anda masukkan salah! Silakan periksa kembali.");
      return;
    }

    setLoading(true);

    try {
      const currentUser = auth.currentUser;

      // Update Email di Firebase Authentication (Login Email)
      if (currentUser) {
        await updateEmail(currentUser, pendingEmail);
      }

      // Simpan data terbaru
      await saveOtherData(pendingEmail);

      alert("Email login berhasil diperbarui!");
      setShowOtpModal(false);
      setInputOtp("");
    } catch (error) {
      console.error(error);
      if (error.code === "auth/requires-recent-login") {
        alert("Demi keamanan, silakan Logout dan Login ulang sebelum mengubah email login!");
      } else {
        alert("Gagal memperbarui email login: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // FUNGSI SIMPAN KE LOCALSTORAGE & FIREBASE DATABASE
  const saveOtherData = async (newEmail = emailGuru) => {
    localStorage.setItem("emailGuru", newEmail);
    localStorage.setItem("namaGuru", namaGuru.trim());
    localStorage.setItem("noWaGuru", noWaGuru.trim());

    await set(ref(db, "pengaturan/admin"), {
      email: newEmail,
      nama: namaGuru.trim(),
      noWa: noWaGuru.trim(),
    });

    alert("Pengaturan berhasil disimpan!");
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
      marginBottom: "18px",
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
    },
    // Styling Modal OTP
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
    },
    otpInput: {
      width: "100%",
      padding: "12px",
      fontSize: "22px",
      letterSpacing: "6px",
      textAlign: "center",
      borderRadius: "12px",
      border: "2px solid #2E7D32",
      marginBottom: "18px",
      boxSizing: "border-box",
      outline: "none",
      fontWeight: "800",
      color: "#1B5E20",
      background: "#FAFAFA",
    },
    cancelBtn: {
      width: "100%",
      padding: "12px",
      background: "#FFEB3B",
      color: "#1B5E20",
      border: "none",
      borderRadius: "12px",
      fontWeight: "800",
      cursor: "pointer",
      marginTop: "10px",
      fontSize: "13px",
      boxShadow: "0 3px 0 #FBC02D",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* TOMBOL KEMBALI KE DASHBOARD */}
        <button
          type="button"
          style={styles.backBtn}
          onClick={() => navigate("/dashboard-admin")}
        >
          Kembali ke Dashboard
        </button>

        <h2 style={styles.title}>
          Pengaturan Akun Admin
        </h2>

        <form onSubmit={handleSimpanPengaturan}>
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

          <label style={styles.label}>Email Login Admin & Kontak</label>
          <input
            type="email"
            value={emailGuru}
            onChange={(e) => setEmailGuru(e.target.value)}
            placeholder="admin@sekolah.sch.id"
            style={styles.input}
            required
          />

          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? "Memproses..." : "Simpan Pengaturan"}
          </button>
        </form>
      </div>

      {/* MODAL POPUP VERIFIKASI KODE OTP */}
      {showOtpModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <h3 style={{ color: "#1B5E20", marginBottom: "10px", fontSize: "18px", fontWeight: "800" }}>
              Masukkan Kode Verifikasi
            </h3>
            <p style={{ color: "#556B4D", fontSize: "13px", marginBottom: "18px" }}>
              Kami telah mengirimkan kode verifikasi 6-digit ke email baru Anda:
              <br />
              <strong style={{ color: "#1B5E20" }}>{pendingEmail}</strong>
            </p>

            <form onSubmit={handleVerifyOtp}>
              <input
                type="text"
                maxLength="6"
                placeholder="123456"
                value={inputOtp}
                onChange={(e) => setInputOtp(e.target.value)}
                style={styles.otpInput}
                required
              />

              <button type="submit" style={styles.btn} disabled={loading}>
                {loading ? "Memeriksa..." : "Verifikasi & Ganti Email"}
              </button>

              <button
                type="button"
                style={styles.cancelBtn}
                onClick={() => setShowOtpModal(false)}
                disabled={loading}
              >
                Batal
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PengaturanAdmin;