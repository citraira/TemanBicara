import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail 
} from "firebase/auth";
import { auth } from "../firebase";

function LoginAdmin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // State untuk Modal Lupa Password
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  // Fungsi Handler Login Admin
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      alert("Silakan isi Email dan Kata Sandi!");
      return;
    }

    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Login Admin Berhasil!");
      navigate("/dashboard-admin");
    } catch (error) {
      console.error(error);
      if (error.code === "auth/invalid-credential" || error.code === "auth/user-not-found") {
        alert("Email atau kata sandi salah!");
      } else {
        alert("Gagal login: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fungsi Handler Kirim Email Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!resetEmail.trim()) {
      alert("Silakan masukkan email akun Admin Anda!");
      return;
    }

    setResetLoading(true);

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      alert(
        `Link untuk meriset kata sandi telah dikirimkan ke email:\n${resetEmail}\n\nSilakan periksa kotak masuk atau folder Spam email Anda.`
      );
      setShowResetModal(false);
      setResetEmail("");
    } catch (error) {
      console.error(error);
      if (error.code === "auth/user-not-found") {
        alert("Email tidak terdaftar dalam sistem!");
      } else {
        alert("Gagal mengirim email reset: " + error.message);
      }
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
      boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
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
          {/* EMAIL */}
          <label style={styles.label}>Email Admin</label>
          <input
            type="email"
            placeholder="Masukkan email admin"
            style={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />

          {/* PASSWORD */}
          <label style={styles.label}>Kata Sandi</label>
          <input
            type="password"
            placeholder="Masukkan kata sandi"
            style={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />

          {/* TOMBOL LUPA KATA SANDI */}
          <div style={styles.forgotContainer}>
            <button
              type="button"
              style={styles.forgotBtn}
              onClick={() => setShowResetModal(true)}
            >
              Lupa Kata Sandi?
            </button>
          </div>

          <button type="submit" style={styles.loginBtn} disabled={loading}>
            {loading ? "Memproses..." : "Login Admin"}
          </button>
        </form>

        <div style={styles.back} onClick={() => navigate("/")}>
          Kembali ke Halaman Utama
        </div>
      </div>

      {/* MODAL POP-UP RESET PASSWORD */}
      {showResetModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <h3 style={{ color: "#1B5E20", marginBottom: "8px", fontSize: "18px", fontWeight: "800" }}>
              Lupa Kata Sandi?
            </h3>
            <p style={{ color: "#556B4D", fontSize: "13px", marginBottom: "18px", lineHeight: "1.5" }}>
              Masukkan email akun admin Anda. Tautan untuk meriset kata sandi akan dikirimkan ke email tersebut.
            </p>

            <form onSubmit={handleResetPassword}>
              <input
                type="email"
                placeholder="Contoh: admin@sekolah.sch.id"
                style={styles.input}
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                disabled={resetLoading}
              />

              <button
                type="submit"
                style={{ ...styles.loginBtn, marginTop: 0 }}
                disabled={resetLoading}
              >
                {resetLoading ? "Mengirim..." : "Kirim Email Reset"}
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
