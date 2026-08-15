import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../firebase";

const styles = {
  page: {
    minHeight: "100dvh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#F4FBEE",
    padding: "20px 15px",
    fontFamily: "'Segoe UI', Roboto, sans-serif",
    boxSizing: "border-box",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "#fff",
    borderRadius: "20px",
    padding: "30px 20px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
    border: "2px solid #C8E6C9",
    boxSizing: "border-box",
  },
  logo: {
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    background: "#FFEB3B",
    color: "#1B5E20",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "28px",
    fontWeight: "800",
    margin: "0 auto 15px",
    border: "3px solid #2E7D32",
  },
  title: {
    fontSize: "24px",
    color: "#1B5E20",
    fontWeight: "800",
    textAlign: "center",
    marginBottom: "5px",
  },
  subtitle: {
    color: "#556B4D",
    textAlign: "center",
    fontSize: "13px",
    marginBottom: "25px",
    fontWeight: "500",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontWeight: "700",
    color: "#1B5E20",
    fontSize: "14px",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "2px solid #C8E6C9",
    marginBottom: "18px",
    fontSize: "16px",
    boxSizing: "border-box",
    outline: "none",
    background: "#FAFAFA",
  },
  passwordWrapper: {
    position: "relative",
    width: "100%",
    marginBottom: "18px",
    display: "flex",
    alignItems: "center",
  },
  passwordInput: {
    width: "100%",
    padding: "12px 45px 12px 14px",
    borderRadius: "12px",
    border: "2px solid #C8E6C9",
    fontSize: "16px",
    boxSizing: "border-box",
    outline: "none",
    background: "#FAFAFA",
  },
  eyeBtn: {
    position: "absolute",
    right: "12px",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#2E7D32",
  },
  forgotContainer: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "20px",
  },
  forgotBtn: {
    background: "none",
    border: "none",
    color: "#1B5E20",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "700",
    padding: 0,
    textDecoration: "underline",
  },
  loginBtn: (loading) => ({
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "12px",
    background: loading ? "#A5D6A7" : "#2E7D32",
    color: "#fff",
    fontSize: "16px",
    cursor: loading ? "not-allowed" : "pointer",
    fontWeight: "800",
    boxShadow: loading ? "none" : "0 3px 0 #1B5E20",
    textTransform: "uppercase",
  }),
  back: {
    marginTop: "20px",
    textAlign: "center",
    color: "#1B5E20",
    cursor: "pointer",
    fontWeight: "800",
    fontSize: "13px",
    textTransform: "uppercase",
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
    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
    border: "2px solid #C8E6C9",
    boxSizing: "border-box",
  },
  modalTitle: {
    color: "#1B5E20",
    marginBottom: "8px",
    fontSize: "20px",
    fontWeight: "800",
    textAlign: "center",
  },
  modalText: {
    color: "#556B4D",
    fontSize: "13px",
    marginBottom: "18px",
    lineHeight: "1.5",
    textAlign: "center",
  },
  cancelBtn: (resetLoading) => ({
    width: "100%",
    padding: "12px",
    background: "#FFEB3B",
    color: "#1B5E20",
    border: "none",
    borderRadius: "12px",
    fontWeight: "800",
    cursor: resetLoading ? "not-allowed" : "pointer",
    marginTop: "10px",
    fontSize: "13px",
    boxShadow: "0 3px 0 #FBC02D",
    textTransform: "uppercase",
  }),
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

function LoginAdmin() {
  const navigate = useNavigate();

  // Menggunakan Ref
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const resetEmailRef = useRef(null);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    type: "success",
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
    if (callback) callback();
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const emailVal = emailRef.current?.value || "";
    const passwordVal = passwordRef.current?.value || "";

    if (!emailVal.trim()) {
      showAlert("warning", "Email Kosong", "Silakan masukkan email admin terlebih dahulu.");
      return;
    }

    if (!passwordVal) {
      showAlert("warning", "Kata Sandi Kosong", "Silakan masukkan kata sandi Anda.");
      return;
    }

    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, emailVal.trim(), passwordVal);
      showAlert(
        "success",
        "Login Berhasil!",
        "Selamat datang kembali di Dashboard Admin SDN 33 Parepare.",
        () => {
          navigate("/dashboard-admin");
        }
      );
    } catch (error) {
      console.error("Login Error:", error);

      switch (error.code) {
        case "auth/invalid-email":
          showAlert("error", "Format Tidak Valid", "Format penulisan email admin tidak valid.");
          break;
        case "auth/invalid-credential":
        case "auth/wrong-password":
          showAlert("error", "Login Gagal", "Email atau kata sandi yang Anda masukkan salah.");
          break;
        case "auth/user-not-found":
          showAlert("error", "Akun Tidak Ditemukan", "Akun admin dengan email tersebut tidak terdaftar.");
          break;
        case "auth/user-disabled":
          showAlert("error", "Akun Dinonaktifkan", "Akun admin telah dinonaktifkan oleh administrator.");
          break;
        case "auth/too-many-requests":
          showAlert("warning", "Terlalu Banyak Percobaan", "Terlalu banyak percobaan login yang gagal. Silakan coba lagi nanti.");
          break;
        default:
          showAlert("error", "Gagal Login", error.message || "Terjadi kesalahan saat proses login.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    const resetEmailVal = resetEmailRef.current?.value || "";

    if (!resetEmailVal.trim()) {
      showAlert("warning", "Email Diperlukan", "Silakan masukkan email admin untuk mereset kata sandi.");
      return;
    }

    setResetLoading(true);

    try {
      await sendPasswordResetEmail(auth, resetEmailVal.trim());
      setShowResetModal(false);
      showAlert(
        "success",
        "Email Terkirim!",
        "Tautan reset kata sandi berhasil dikirim ke email Anda. Silakan periksa kotak masuk (Inbox) atau folder Spam."
      );
    } catch (error) {
      console.error("Reset Password Error:", error);
      showAlert("error", "Gagal Mengirim Email", error.message || "Terjadi kendala saat mengirim email reset.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>A</div>

        <h2 style={styles.title}>Login Admin</h2>
        <p style={styles.subtitle}>Sistem Pengaduan Bullying Sekolah</p>

        <form onSubmit={handleLogin}>
          <label style={styles.label}>Email Admin</label>
          <input
            ref={emailRef}
            type="email"
            placeholder="Masukkan email admin"
            style={styles.input}
            disabled={loading}
            autoComplete="email"
          />

          <label style={styles.label}>Kata Sandi</label>

          <div style={styles.passwordWrapper}>
            <input
              ref={passwordRef}
              type={showPassword ? "text" : "password"}
              placeholder="Masukkan kata sandi"
              style={styles.passwordInput}
              disabled={loading}
              autoComplete="current-password"
            />
            <button
              type="button"
              style={styles.eyeBtn}
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Tampilkan atau sembunyikan kata sandi"
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              )}
            </button>
          </div>

          <div style={styles.forgotContainer}>
            <button
              type="button"
              style={styles.forgotBtn}
              onClick={() => setShowResetModal(true)}
              disabled={loading}
            >
              Lupa Kata Sandi?
            </button>
          </div>

          <button type="submit" style={styles.loginBtn(loading)} disabled={loading}>
            {loading ? "Memproses..." : "Login Admin"}
          </button>
        </form>

        <div style={styles.back} onClick={() => navigate("/")}>
          ← Kembali ke Halaman Utama
        </div>
      </div>

      {showResetModal && (
        <div
          style={styles.modalOverlay}
          onClick={() => !resetLoading && setShowResetModal(false)}
        >
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: "center", fontSize: "45px", marginBottom: "5px" }}>
              🔐
            </div>
            <h3 style={styles.modalTitle}>Lupa Kata Sandi?</h3>
            <p style={styles.modalText}>
              Masukkan email akun admin Anda. Firebase akan mengirimkan tautan untuk membuat kata sandi baru.
            </p>

            <form onSubmit={handleResetPassword}>
              <label style={styles.label}>📧 Email Admin</label>
              <input
                ref={resetEmailRef}
                type="email"
                placeholder="admin@email.com"
                style={styles.input}
                disabled={resetLoading}
                autoComplete="email"
              />

              <button
                type="submit"
                style={{
                  ...styles.loginBtn(resetLoading),
                  marginTop: 0,
                  background: resetLoading ? "#A5D6A7" : "#2E7D32",
                }}
                disabled={resetLoading}
              >
                {resetLoading ? "Mengirim Email..." : "📨 Kirim Email Reset"}
              </button>

              <button
                type="button"
                style={styles.cancelBtn(resetLoading)}
                onClick={() => setShowResetModal(false)}
                disabled={resetLoading}
              >
                Batal
              </button>
            </form>
          </div>
        </div>
      )}

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
                ...styles.modalTitle,
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

            <p style={styles.modalText}>{alertConfig.message}</p>

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

export default LoginAdmin;