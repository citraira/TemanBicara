import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../firebase";

function LoginAdmin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const handleOpenResetModal = () => {
    if (email.trim()) {
      setResetEmail(email.trim());
    }
    setShowResetModal(true);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      alert("Silakan masukkan email admin.");
      return;
    }

    if (!password) {
      alert("Silakan masukkan kata sandi.");
      return;
    }

    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      alert("Login Admin Berhasil!");
      navigate("/dashboard-admin");
    } catch (error) {
      console.error("Login Error:", error);

      switch (error.code) {
        case "auth/invalid-email":
          alert("Format email tidak valid.");
          break;
        case "auth/invalid-credential":
          alert("Email atau kata sandi salah.");
          break;
        case "auth/user-not-found":
          alert("Akun admin tidak ditemukan.");
          break;
        case "auth/wrong-password":
          alert("Kata sandi salah.");
          break;
        case "auth/user-disabled":
          alert("Akun admin telah dinonaktifkan.");
          break;
        case "auth/too-many-requests":
          alert("Terlalu banyak percobaan login. Silakan coba lagi nanti.");
          break;
        default:
          alert("Gagal login. Silakan coba lagi.\n\n" + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!resetEmail.trim()) {
      alert("Silakan masukkan email admin.");
      return;
    }

    setResetLoading(true);

    try {
      await sendPasswordResetEmail(auth, resetEmail.trim());
      alert(
        "Email reset kata sandi berhasil dikirim!\n\nSilakan buka email Anda dan klik link reset kata sandi."
      );
      setShowResetModal(false);
      setResetEmail("");
    } catch (error) {
      console.error("Reset Password Error:", error);
      alert("Gagal mengirim email reset: " + error.message);
    } finally {
      setResetLoading(false);
    }
  };

  const styles = {
    page: {
      minHeight: "100vh",
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
      fontSize: "14px",
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
      fontSize: "14px",
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
    loginBtn: {
      width: "100%",
      padding: "14px",
      border: "none",
      borderRadius: "12px",
      background: loading ? "#A5D6A7" : "#2E7D32",
      color: "#fff",
      fontSize: "15px",
      cursor: loading ? "not-allowed" : "pointer",
      fontWeight: "800",
      boxShadow: loading ? "none" : "0 3px 0 #1B5E20",
      textTransform: "uppercase",
    },
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
    cancelBtn: {
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
    },
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
            type="email"
            placeholder="Masukkan email admin"
            style={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            autoComplete="email"
          />

          <label style={styles.label}>Kata Sandi</label>
          
          {/* INPUT PASSWORD DENGAN IKON VECTOR SVG */}
          <div style={styles.passwordWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Masukkan kata sandi"
              style={styles.passwordInput}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
                /* IKON MATA TERBUKA */
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              ) : (
                /* IKON MATA TERTUTUP / DICORET */
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
              onClick={handleOpenResetModal}
              disabled={loading}
            >
              Lupa Kata Sandi?
            </button>
          </div>

          <button type="submit" style={styles.loginBtn} disabled={loading}>
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
              Masukkan email akun admin Anda. Firebase akan mengirimkan link untuk membuat kata sandi baru.
            </p>

            <form onSubmit={handleResetPassword}>
              <label style={styles.label}>📧 Email Admin</label>
              <input
                type="email"
                placeholder="admin@email.com"
                style={styles.input}
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                disabled={resetLoading}
                autoComplete="email"
                autoFocus
              />

              <button
                type="submit"
                style={{
                  ...styles.loginBtn,
                  marginTop: 0,
                  background: resetLoading ? "#A5D6A7" : "#2E7D32",
                }}
                disabled={resetLoading}
              >
                {resetLoading ? "Mengirim Email..." : "📨 Kirim Email Reset"}
              </button>

              <button
                type="button"
                style={styles.cancelBtn}
                onClick={() => setShowResetModal(false)}
                disabled={resetLoading}
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

export default LoginAdmin;