import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";

function LupaPassword() {
  const navigate = useNavigate();
  const emailRef = useRef(null);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // State Pop-Up Notifikasi Kustom (Pengganti alert())
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    type: "success", // 'success' | 'error' | 'warning'
    title: "",
    message: "",
    onCloseCallback: null,
  });

  const showAlert = useCallback(
    (type, title, message, onCloseCallback = null) => {
      setAlertConfig({
        isOpen: true,
        type,
        title,
        message,
        onCloseCallback,
      });
    },
    []
  );

  const handleCloseAlert = useCallback(() => {
    const callback = alertConfig.onCloseCallback;

    setAlertConfig((prev) => ({
      ...prev,
      isOpen: false,
    }));

    if (callback) {
      callback();
    }
  }, [alertConfig.onCloseCallback]);

  const handleReset = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!email.trim()) {
      showAlert(
        "warning",
        "Email Diperlukan",
        "Masukkan email admin terlebih dahulu."
      );

      requestAnimationFrame(() => {
        emailRef.current?.focus({ preventScroll: true });
      });

      return;
    }

    try {
      setLoading(true);

      await sendPasswordResetEmail(auth, email.trim());

      showAlert(
        "success",
        "Email Terkirim!",
        "Tautan reset kata sandi telah dikirim. Silakan cek kotak masuk (Inbox) atau folder Spam pada email Anda.",
        () => {
          navigate("/login-admin");
        }
      );
    } catch (error) {
      console.error(error);

      if (error.code === "auth/invalid-email") {
        showAlert("error", "Format Tidak Valid", "Format penulisan email admin tidak valid.");
      } else if (error.code === "auth/user-not-found") {
        showAlert("error", "Akun Tidak Ditemukan", "Email tersebut belum terdaftar sebagai akun admin.");
      } else {
        showAlert("error", "Gagal Mengirim", "Gagal mengirim email reset: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#F5F9FF", // Tema hijau muda serasi
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
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
      border: "2px solid #BBDEFB",
      boxSizing: "border-box",
      textAlign: "center",
    },

    icon: {
      fontSize: "50px",
      marginBottom: "8px",
    },

    title: {
      color: "#0D47A1",
      fontSize: "24px",
      fontWeight: "800",
      marginBottom: "8px",
      marginTop: 0,
    },

    subtitle: {
      color: "#526579",
      lineHeight: "1.5",
      fontSize: "13px",
      marginBottom: "25px",
      fontWeight: "500",
    },

    label: {
      display: "block",
      fontWeight: "700",
      marginBottom: "6px",
      color: "#0D47A1",
      fontSize: "14px",
      textAlign: "left",
    },

    input: {
      width: "100%",
      padding: "12px 14px",
      borderRadius: "12px",
      border: "2px solid #BBDEFB",
      fontSize: "14px",
      boxSizing: "border-box",
      outline: "none",
      background: "#FAFCFF",
      marginBottom: "18px",
    },

    button: {
      width: "100%",
      background: loading ? "#90CAF9" : "#1565C0",
      color: "#fff",
      border: "none",
      padding: "14px",
      borderRadius: "12px",
      fontSize: "15px",
      fontWeight: "800",
      cursor: loading ? "not-allowed" : "pointer",
      boxShadow: loading ? "none" : "0 3px 0 #0D47A1",
      textTransform: "uppercase",
    },

    back: {
      width: "100%",
      background: "#FFFFFF",
      color: "#0D47A1",
      border: "none",
      padding: "12px",
      borderRadius: "12px",
      fontSize: "13px",
      fontWeight: "800",
      cursor: "pointer",
      marginTop: "12px",
      boxShadow: "0 3px 0 #90CAF9",
      textTransform: "uppercase",
    },

    // Gaya Pop-up Modal Kustom
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
      border: "2px solid #BBDEFB",
      boxSizing: "border-box",
    },
    modalTitle: {
      marginBottom: "8px",
      fontSize: "20px",
      fontWeight: "800",
    },
    modalText: {
      color: "#526579",
      fontSize: "13px",
      marginBottom: "20px",
      lineHeight: "1.5",
    },
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
          ? "#E3F2FD"
          : type === "error"
          ? "#FFEBEE"
          : "#F5F9FF",
      border: `2px solid ${
        type === "success"
          ? "#1565C0"
          : type === "error"
          ? "#D32F2F"
          : "#90CAF9"
      }`,
      color:
        type === "success"
          ? "#1565C0"
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
      color: type === "warning" ? "#0D47A1" : "#fff",
      background:
        type === "success"
          ? "#1565C0"
          : type === "error"
          ? "#D32F2F"
          : "#FFFFFF",
      boxShadow:
        type === "success"
          ? "0 3px 0 #0D47A1"
          : type === "error"
          ? "0 3px 0 #9A0007"
          : "0 3px 0 #90CAF9",
    }),
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.icon}>🔐</div>

        <h1 style={styles.title}>Lupa Kata Sandi?</h1>

        <p style={styles.subtitle}>
          Masukkan email akun admin. Kami akan mengirimkan tautan untuk membuat kata sandi baru.
        </p>

        <form onSubmit={handleReset}>
          <label style={styles.label}>📧 Email Admin</label>

          <input
            ref={emailRef}
            type="email"
            placeholder="contoh@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              ...styles.input,
              fontSize: "16px",
            }}
            disabled={loading}
            autoComplete="email"
            inputMode="email"
            enterKeyHint="send"
            autoFocus
          />

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Mengirim..." : "📨 Kirim Link Reset"}
          </button>
        </form>

        <button
          type="button"
          style={styles.back}
          onClick={() => navigate("/login-admin")}
          disabled={loading}
        >
          ← Kembali ke Login
        </button>
      </div>

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
                ...styles.modalTitle,
                color:
                  alertConfig.type === "success"
                    ? "#0D47A1"
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

export default LupaPassword;