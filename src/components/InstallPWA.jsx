import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

// Objek Styles di Luar Komponen
const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
    padding: "20px",
    boxSizing: "border-box",
  },

  card: {
    background: "#fff",
    borderRadius: "24px",
    padding: "25px 20px",
    maxWidth: "380px",
    width: "100%",
    textAlign: "center",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
    border: "2px solid #C8E6C9",
  },

  iconBox: {
    width: "70px",
    height: "70px",
    borderRadius: "20px",
    margin: "0 auto 15px",
    overflow: "hidden",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },

  iconImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  title: {
    color: "#1B5E20",
    fontSize: "20px",
    fontWeight: "800",
    margin: "0 0 8px 0",
  },

  desc: {
    color: "#556B4D",
    fontSize: "13px",
    lineHeight: "1.5",
    marginBottom: "20px",
  },

  installBtn: {
    width: "100%",
    padding: "12px",
    background: "#2E7D32",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    fontWeight: "800",
    fontSize: "14px",
    cursor: "pointer",
    boxShadow: "0 3px 0 #1B5E20",
    textTransform: "uppercase",
    marginBottom: "10px",
  },

  cancelBtn: {
    width: "100%",
    padding: "12px",
    background: "#FFEB3B",
    color: "#1B5E20",
    border: "none",
    borderRadius: "12px",
    fontWeight: "800",
    fontSize: "13px",
    cursor: "pointer",
    boxShadow: "0 3px 0 #FBC02D",
    textTransform: "uppercase",
  },
};

function InstallPWA() {
  const location = useLocation();

  const [deferredPrompt, setDeferredPrompt] =
    useState(null);

  const [showModal, setShowModal] =
    useState(false);

  const isLoginPage =
    location.pathname === "/login-siswa" ||
    location.pathname === "/login-admin" ||
    location.pathname === "/lupa-password";

  useEffect(() => {
    const isStandalone =
      window.matchMedia(
        "(display-mode: standalone)"
      ).matches ||
      window.navigator.standalone === true;

    // Jangan tampilkan prompt jika sudah menjadi PWA.
    if (isStandalone) {
      setShowModal(false);
      return;
    }

    // Jangan pasang listener PWA di halaman login.
    // Ini penting agar keyboard login tidak terganggu.
    if (isLoginPage) {
      setShowModal(false);
      return;
    }

    const hasDismissed =
      sessionStorage.getItem(
        "pwa_install_dismissed"
      );

    if (hasDismissed) {
      return;
    }

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();

      setDeferredPrompt(event);
      setShowModal(true);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, [isLoginPage]);

  const handleInstallClick = async () => {
    const promptEvent = deferredPrompt;

    if (!promptEvent) return;

    try {
      promptEvent.prompt();

      const { outcome } =
        await promptEvent.userChoice;

      if (outcome === "accepted") {
        console.log(
          "PWA Berhasil Terinstall"
        );
      }
    } catch (error) {
      console.error(
        "Gagal menampilkan install prompt:",
        error
      );
    } finally {
      setDeferredPrompt(null);
      setShowModal(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);

    sessionStorage.setItem(
      "pwa_install_dismissed",
      "true"
    );

    setDeferredPrompt(null);
  };

  // Jangan render popup di halaman login.
  if (!showModal || isLoginPage) {
    return null;
  }

  return (
    <div
      style={styles.overlay}
      role="presentation"
    >
      <div
        style={styles.card}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pwa-install-title"
      >
        <div style={styles.iconBox}>
          <img
            src="/pwa-192x192.png"
            alt="TemanBicara Logo"
            style={styles.iconImg}
          />
        </div>

        <h3
          id="pwa-install-title"
          style={styles.title}
        >
          Install TemanBicara
        </h3>

        <p style={styles.desc}>
          Install aplikasi TemanBicara di HP kamu
          agar bisa diakses langsung dari layar
          utama tanpa membuka browser!
        </p>

        <button
          type="button"
          style={styles.installBtn}
          onClick={handleInstallClick}
        >
          📲 Install Aplikasi Sekarang
        </button>

        <button
          type="button"
          style={styles.cancelBtn}
          onClick={handleCloseModal}
        >
          Nanti Saja
        </button>
      </div>
    </div>
  );
}

export default InstallPWA;