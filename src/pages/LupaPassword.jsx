import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";

function LupaPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();

    if (!email) {
      alert("Masukkan email admin terlebih dahulu.");
      return;
    }

    try {
      setLoading(true);

      await sendPasswordResetEmail(auth, email);

      alert(
        "Email reset kata sandi telah dikirim. Silakan cek Inbox atau folder Spam."
      );

      navigate("/login-admin");
    } catch (error) {
      console.error(error);

      if (error.code === "auth/invalid-email") {
        alert("Format email tidak valid.");
      } else if (error.code === "auth/user-not-found") {
        alert("Email tersebut belum terdaftar sebagai akun admin.");
      } else {
        alert("Gagal mengirim email reset: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#F4F8FC",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "20px",
      fontFamily: "Segoe UI, sans-serif",
    },

    card: {
      width: "100%",
      maxWidth: "450px",
      background: "#fff",
      borderRadius: "20px",
      padding: "35px",
      boxShadow: "0 10px 30px rgba(0,0,0,.1)",
    },

    icon: {
      textAlign: "center",
      fontSize: "60px",
      marginBottom: "10px",
    },

    title: {
      textAlign: "center",
      color: "#1565C0",
      fontSize: "28px",
      fontWeight: "bold",
      marginBottom: "10px",
    },

    subtitle: {
      textAlign: "center",
      color: "#666",
      lineHeight: "1.6",
      marginBottom: "30px",
    },

    label: {
      display: "block",
      fontWeight: "bold",
      marginBottom: "8px",
      color: "#333",
    },

    input: {
      width: "100%",
      padding: "14px",
      borderRadius: "10px",
      border: "1px solid #ccc",
      fontSize: "16px",
      boxSizing: "border-box",
      outline: "none",
    },

    button: {
      width: "100%",
      background: "#1565C0",
      color: "#fff",
      border: "none",
      padding: "14px",
      borderRadius: "10px",
      fontSize: "16px",
      fontWeight: "bold",
      cursor: "pointer",
      marginTop: "20px",
    },

    back: {
      width: "100%",
      background: "#757575",
      color: "#fff",
      border: "none",
      padding: "14px",
      borderRadius: "10px",
      fontSize: "16px",
      fontWeight: "bold",
      cursor: "pointer",
      marginTop: "10px",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <div style={styles.icon}>
          🔐
        </div>

        <h1 style={styles.title}>
          Lupa Kata Sandi?
        </h1>

        <p style={styles.subtitle}>
          Masukkan email akun admin. Kami akan mengirimkan
          link untuk membuat kata sandi baru.
        </p>

        <form onSubmit={handleReset}>

          <label style={styles.label}>
            📧 Email Admin
          </label>

          <input
            type="email"
            placeholder="contoh@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />

          <button
            type="submit"
            style={styles.button}
            disabled={loading}
          >
            {loading
              ? "Mengirim..."
              : "📨 Kirim Link Reset"}
          </button>

        </form>

        <button
          style={styles.back}
          onClick={() => navigate("/login-admin")}
        >
          ← Kembali ke Login
        </button>

      </div>
    </div>
  );
}

export default LupaPassword;