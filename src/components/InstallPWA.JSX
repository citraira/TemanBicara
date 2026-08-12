import { useState, useEffect } from "react";

function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Tangkap event bawaan browser sebelum install prompt muncul
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Cek apakah pengguna pernah menutup modal ini sebelumnya di sesi ini
      const hasDismissed = sessionStorage.getItem("pwa_install_dismissed");
      if (!hasDismissed) {
        setShowModal(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  // Handler saat tombol "Install Aplikasi" diklik
  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Tampilkan prompt install bawaan browser
    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      console.log("Pengguna menerima instalasi PWA");
    } else {
      console.log("Pengguna menolak instalasi PWA");
    }

    setDeferredPrompt(null);
    setShowModal(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    sessionStorage.setItem("pwa_install_dismissed", "true");
  };

  if (!showModal) return null;

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

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={styles.iconBox}>
          <img src="/pwa-192x192.png" alt="TemanBicara Logo" style={styles.iconImg} />
        </div>
        <h3 style={styles.title}>Install TemanBicara</h3>
        <p style={styles.desc}>
          Install aplikasi TemanBicara di HP kamu agar bisa diakses langsung dari layar utama tanpa membuka browser!
        </p>

        <button style={styles.installBtn} onClick={handleInstallClick}>
          📲 Install Aplikasi Sekarang
        </button>
        <button style={styles.cancelBtn} onClick={handleCloseModal}>
          Nanti Saja
        </button>
      </div>
    </div>
  );
}

export default InstallPWA;