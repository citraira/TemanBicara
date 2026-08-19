import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ref, get } from "firebase/database";
import { db } from "../firebase";

function HubungiGuru() {
  const navigate = useNavigate();

  const [guru, setGuru] = useState({
    nama: "Guru BK / Konselor",
    telepon: "",
  });

  const [pesanWa, setPesanWa] = useState("");

  // State Pop-Up Notifikasi Kustom (Pengganti alert())
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    type: "warning",
    title: "",
    message: "",
  });

  const showAlert = (type, title, message) => {
    setAlertConfig({
      isOpen: true,
      type,
      title,
      message,
    });
  };

  const handleCloseAlert = () => {
    setAlertConfig((prev) => ({ ...prev, isOpen: false }));
  };

  useEffect(() => {
    const fetchAdminContact = async () => {
      try {
        // Ambil data langsung dari Realtime Database Firebase
        const snapshot = await get(ref(db, "pengaturan/admin"));
        
        let savedNama = "Guru BK / Konselor";
        let savedWa = "";

        if (snapshot.exists()) {
          const data = snapshot.val();
          savedNama = data.nama || localStorage.getItem("namaGuru") || savedNama;
          savedWa = data.noWa || localStorage.getItem("noWaGuru") || "";
        } else {
          savedNama = localStorage.getItem("namaGuru") || savedNama;
          savedWa = localStorage.getItem("noWaGuru") || "";
        }

        let formattedWa = savedWa;
        if (formattedWa.startsWith("0")) {
          formattedWa = "62" + formattedWa.slice(1);
        }
        formattedWa = formattedWa.replace(/[^0-9]/g, "");

        setGuru({
          nama: savedNama,
          telepon: formattedWa,
        });

        const savedPesan = localStorage.getItem("pesanWa") || "Saya membutuhkan bantuan / konseling.";
        setPesanWa(savedPesan);
      } catch (err) {
        console.error("Gagal mengambil kontak guru dari database:", err);
      }
    };

    fetchAdminContact();
  }, []);

  const handleChatWhatsApp = () => {
    if (!guru.telepon) {
      showAlert(
        "warning",
        "Kontak Belum Diatur",
        "Nomor WhatsApp Guru BK belum diatur oleh admin sekolah. Silakan hubungi langsung di sekolah."
      );
      return;
    }
    const namaSiswa = localStorage.getItem("namaSiswa") || "Siswa";
    const pesanLengkap = `Halo ${guru.nama}, saya ${namaSiswa}.\n\n${pesanWa}`;
    const encodedPesan = encodeURIComponent(pesanLengkap);

    window.open(`https://wa.me/${guru.telepon}?text=${encodedPesan}`, "_blank");
  };

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#F5F9FF",
      fontFamily: "'Segoe UI', Roboto, sans-serif",
      paddingBottom: "40px",
      paddingTop: "20px",
      boxSizing: "border-box",
    },
    container: {
      maxWidth: "800px",
      margin: "0 auto",
      padding: "0 15px",
    },
    header: {
      background: "#1565C0",
      color: "#fff",
      textAlign: "center",
      padding: "25px 20px",
      borderRadius: "20px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
      marginBottom: "20px",
    },
    title: {
      fontSize: "24px",
      fontWeight: "800",
      marginBottom: "8px",
    },
    subtitle: {
      fontSize: "14px",
      lineHeight: "1.5",
      opacity: 0.95,
    },
    card: {
      background: "#fff",
      borderRadius: "18px",
      padding: "22px 20px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
      border: "2px solid #BBDEFB",
      marginBottom: "18px",
    },
    avatar: {
      width: "80px",
      height: "80px",
      borderRadius: "50%",
      background: "#FFFFFF",
      color: "#0D47A1",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: "32px",
      fontWeight: "800",
      margin: "0 auto 15px",
      border: "3px solid #1565C0",
    },
    nama: {
      fontSize: "22px",
      fontWeight: "800",
      color: "#0D47A1",
      textAlign: "center",
      marginBottom: "18px",
    },
    button: {
      width: "100%",
      padding: "14px",
      border: "none",
      borderRadius: "12px",
      background: "#25D366",
      color: "#fff",
      fontSize: "15px",
      cursor: "pointer",
      fontWeight: "800",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      boxShadow: "0 3px 0 #1EBE5D",
      textTransform: "uppercase",
    },
    cardTitle: {
      color: "#0D47A1",
      fontSize: "18px",
      fontWeight: "800",
      marginBottom: "12px",
    },
    cardText: {
      fontSize: "14px",
      lineHeight: "1.7",
      color: "#526579",
    },
    back: {
      width: "100%",
      padding: "14px",
      marginTop: "10px",
      background: "#FFFFFF",
      color: "#0D47A1",
      border: "none",
      borderRadius: "12px",
      fontSize: "15px",
      cursor: "pointer",
      fontWeight: "800",
      boxShadow: "0 3px 0 #90CAF9",
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
      textAlign: "center",
      boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
      border: "2px solid #BBDEFB",
      boxSizing: "border-box",
    },
    alertIconWrapper: {
      width: "60px",
      height: "60px",
      borderRadius: "50%",
      margin: "0 auto 12px auto",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: "28px",
      background: "#F5F9FF",
      border: "2px solid #90CAF9",
      color: "#F57F17",
    },
    alertBtn: {
      width: "100%",
      padding: "12px",
      border: "none",
      borderRadius: "12px",
      fontWeight: "800",
      fontSize: "14px",
      cursor: "pointer",
      textTransform: "uppercase",
      color: "#0D47A1",
      background: "#FFFFFF",
      boxShadow: "0 3px 0 #90CAF9",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* HEADER */}
        <div style={styles.header}>
          <div style={styles.title}>Hubungi Guru</div>
          <div style={styles.subtitle}>
            Jangan takut untuk meminta bantuan. Guru siap mendengarkan dan membantu setiap siswa.
          </div>
        </div>

        {/* KARTU GURU BK */}
        <div style={styles.card}>
          <div style={styles.avatar}>
            {guru.nama ? guru.nama.charAt(0).toUpperCase() : "G"}
          </div>

          <div style={styles.nama}>{guru.nama}</div>

          {/* TOMBOL AKSI WHATSAPP */}
          <button style={styles.button} onClick={handleChatWhatsApp}>
            Hubungi via WhatsApp
          </button>
        </div>

        {/* PESAN MOTIVASI */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Pesan untuk Siswa</div>

          <p style={styles.cardText}>
            Kamu tidak sendirian.
            <br /><br />
            Jika mengalami bullying, jangan memendam masalah sendiri. Ceritakan kepada guru, orang tua, atau orang dewasa yang kamu percaya.
            <br /><br />
            Kami siap membantu agar sekolah menjadi tempat yang aman, nyaman, dan menyenangkan untuk semua.
          </p>
        </div>

        {/* KARTU INFORMASI */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Ingat!</div>

          <p style={styles.cardText}>
            • Jangan takut untuk melapor apabila mengalami bullying.
            <br /><br />
            • Semua laporan akan dijaga kerahasiaannya oleh guru.
            <br /><br />
            • Guru akan membantu menyelesaikan masalah dengan bijaksana agar semua siswa merasa aman di sekolah.
            <br /><br />
            Kamu tidak sendirian. Selalu ada guru yang siap mendengarkan dan membantu.
          </p>
        </div>

        {/* TOMBOL KEMBALI */}
        <button
          style={styles.back}
          onClick={() => navigate("/dashboard-siswa")}
        >
          Kembali ke Dashboard
        </button>
      </div>

      {/* POP-UP NOTIFIKASI KUSTOM BERDESAIN (PENGGANTI ALERT) */}
      {alertConfig.isOpen && (
        <div style={styles.modalOverlay} onClick={handleCloseAlert}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.alertIconWrapper}>
              ℹ
            </div>

            <h3
              style={{
                fontSize: "18px",
                fontWeight: "800",
                marginBottom: "8px",
                color: "#E65100",
              }}
            >
              {alertConfig.title}
            </h3>

            <p style={{ color: "#526579", fontSize: "13px", marginBottom: "18px", lineHeight: "1.5" }}>
              {alertConfig.message}
            </p>

            <button
              style={styles.alertBtn}
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

export default HubungiGuru;