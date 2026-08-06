import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function HubungiGuru() {
  const navigate = useNavigate();

  // State data guru dinamis dari localStorage
  const [guru, setGuru] = useState({
    nama: "Guru BK / Konselor",
    telepon: "",
  });

  const [pesanWa, setPesanWa] = useState("");

  useEffect(() => {
    // Ambil data terbaru yang diatur oleh Admin di Dashboard
    const savedNama = localStorage.getItem("namaGuru");
    const savedWa = localStorage.getItem("noWaGuru") || "";
    const savedPesan = localStorage.getItem("pesanWa") || "";

    let formattedWa = savedWa;
    if (formattedWa.startsWith("0")) {
      formattedWa = "62" + formattedWa.slice(1);
    }
    formattedWa = formattedWa.replace(/[^0-9]/g, "");

    setGuru({
      nama: savedNama || "Guru BK / Konselor",
      telepon: formattedWa,
    });

    setPesanWa(savedPesan);
  }, []);

  const handleChatWhatsApp = () => {
    if (!guru.telepon) {
      alert("Nomor WhatsApp guru belum diatur oleh admin.");
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
      background: "#F4FBEE",
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
      background: "#2E7D32",
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
      border: "2px solid #C8E6C9",
      marginBottom: "18px",
    },
    avatar: {
      width: "80px",
      height: "80px",
      borderRadius: "50%",
      background: "#FFEB3B",
      color: "#1B5E20",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: "32px",
      fontWeight: "800",
      margin: "0 auto 15px",
      border: "3px solid #2E7D32",
    },
    nama: {
      fontSize: "22px",
      fontWeight: "800",
      color: "#1B5E20",
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
      color: "#1B5E20",
      fontSize: "18px",
      fontWeight: "800",
      marginBottom: "12px",
    },
    cardText: {
      fontSize: "14px",
      lineHeight: "1.7",
      color: "#556B4D",
    },
    back: {
      width: "100%",
      padding: "14px",
      marginTop: "10px",
      background: "#FFEB3B",
      color: "#1B5E20",
      border: "none",
      borderRadius: "12px",
      fontSize: "15px",
      cursor: "pointer",
      fontWeight: "800",
      boxShadow: "0 3px 0 #FBC02D",
      textTransform: "uppercase",
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
    </div>
  );
}

export default HubungiGuru;
