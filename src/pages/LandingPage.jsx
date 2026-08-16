import { useNavigate } from "react-router-dom";

function LandingPage() {
  const navigate = useNavigate();

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#F4FBEE", // Hijau sangat muda
      fontFamily: "'Segoe UI', Roboto, sans-serif",
      color: "#2E3D29",
    },

    navbar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "15px 5%",
      background: "#2E7D32", // Hijau Utama
      color: "#fff",
      position: "sticky",
      top: 0,
      zIndex: 100,
      boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      flexWrap: "wrap",
      gap: "10px",
    },

    logo: {
      fontSize: "22px",
      fontWeight: "800",
      letterSpacing: "0.5px",
    },

    navButton: {
      display: "flex",
      gap: "10px",
    },

    buttonNav: {
      padding: "10px 18px",
      borderRadius: "25px",
      border: "none",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "bold",
    },

    loginSiswaNav: {
      background: "#FFEB3B", // Kuning Cerah
      color: "#1B5E20",
    },

    loginGuruNav: {
      background: "#ffffff",
      color: "#2E7D32",
    },

    hero: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "40px 5%",
      flexWrap: "wrap",
      gap: "30px",
      maxWidth: "1100px",
      margin: "0 auto",
    },

    left: {
      flex: "1 1 300px",
    },

    title: {
      fontSize: "36px",
      color: "#1B5E20",
      fontWeight: "800",
      lineHeight: "1.2",
      marginBottom: "15px",
    },

    highlight: {
      color: "#F57F17", // Kuning/Oranye hangat
      background: "#FFF9C4",
      padding: "0 8px",
      borderRadius: "8px",
    },

    desc: {
      fontSize: "16px",
      color: "#4A5D43",
      lineHeight: "1.6",
      marginBottom: "25px",
      fontWeight: "500",
    },

    heroButton: {
      display: "flex",
      gap: "15px",
      flexWrap: "wrap",
    },

    btnMainSiswa: {
      flex: "1 1 180px",
      padding: "16px 20px",
      border: "none",
      borderRadius: "15px",
      background: "#FFEB3B",
      color: "#1B5E20",
      fontSize: "18px",
      cursor: "pointer",
      fontWeight: "800",
      boxShadow: "0 6px 0 #FBC02D",
      textAlign: "center",
      textTransform: "uppercase",
    },

    btnMainGuru: {
      flex: "1 1 180px",
      padding: "16px 20px",
      border: "none",
      borderRadius: "15px",
      background: "#2E7D32",
      color: "#fff",
      fontSize: "18px",
      cursor: "pointer",
      fontWeight: "800",
      boxShadow: "0 6px 0 #1B5E20",
      textAlign: "center",
    },

    right: {
      flex: "1 1 300px",
      display: "flex",
      justifyContent: "center",
    },

    heroCard: {
      width: "100%",
      maxWidth: "360px",
      background: "#FFFDE7",
      borderRadius: "20px",
      padding: "25px",
      boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
      textAlign: "center",
      border: "3px solid #FFF59D",
    },

    cardTitle: {
      fontSize: "24px",
      color: "#1B5E20",
      marginBottom: "12px",
      fontWeight: "800",
    },

    cardText: {
      color: "#556B4D",
      fontSize: "15px",
      lineHeight: "1.6",
      fontWeight: "500",
    },

    section: {
      padding: "40px 5%",
      maxWidth: "1100px",
      margin: "0 auto",
    },

    sectionTitle: {
      textAlign: "center",
      fontSize: "26px",
      color: "#1B5E20",
      marginBottom: "30px",
      fontWeight: "800",
    },

    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
      gap: "20px",
    },

    card: {
      background: "#fff",
      padding: "25px 20px",
      borderRadius: "18px",
      boxShadow: "0 6px 15px rgba(0,0,0,0.04)",
      textAlign: "center",
      borderTop: "6px solid #81C784",
    },

    cardHeading: {
      fontSize: "20px",
      color: "#1B5E20",
      marginBottom: "10px",
      fontWeight: "700",
    },

    cardDesc: {
      color: "#667C5E",
      fontSize: "14px",
      lineHeight: "1.5",
    },

    stepGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: "15px",
    },

    stepCard: {
      background: "#fff",
      border: "2px solid #C8E6C9",
      color: "#2E3D29",
      borderRadius: "16px",
      padding: "20px 15px",
      textAlign: "center",
    },

    stepBadge: {
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      background: "#FFEB3B",
      color: "#1B5E20",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "20px",
      fontWeight: "800",
      margin: "0 auto 12px",
    },

    footer: {
      marginTop: "40px",
      padding: "25px 15px",
      background: "#1B5E20",
      color: "#fff",
      textAlign: "center",
      fontSize: "14px",
    },
  };

  return (
    <div style={styles.page}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.logo}>
          SDN 33 PAREPARE
        </div>

        <div style={styles.navButton}>
          <button
            style={{ ...styles.buttonNav, ...styles.loginSiswaNav }}
            onClick={() => navigate("/login-siswa")}
          >
            Siswa
          </button>

          <button
            style={{ ...styles.buttonNav, ...styles.loginGuruNav }}
            onClick={() => navigate("/login-admin")}
          >
            Admin
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.left}>
          <h1 style={styles.title}>
            Berani Bicara!
            <br />
            Bersama Ciptakan
            <br />
            <span style={styles.highlight}>Sekolah Aman</span>
          </h1>

          <p style={styles.desc}>
            Tempat aman untuk siswa SD melaporkan kejadian bullying.
            Laporanmu langsung diterima oleh Guru BK agar bisa dibantu dengan cepat.
          </p>

          <div style={styles.heroButton}>
            <button
              type="button"
              aria-label="Lapor sekarang sebagai siswa"
              style={styles.btnMainSiswa}
              onClick={() => navigate("/login-siswa")}
            >
              Lapor Sekarang
            </button>

            <button
              type="button"
              aria-label="Masuk ke halaman admin"
              style={styles.btnMainGuru}
              onClick={() => navigate("/login-admin")}
            >
              Masuk Admin
            </button>
          </div>
        </div>

        <div style={styles.right}>
          <div style={styles.heroCard}>
            <h2 style={styles.cardTitle}>Stop Bullying!</h2>
            <p style={styles.cardText}>
              Jadilah teman yang baik, saling menyayangi, dan jangan takut untuk meminta bantuan jika ada yang mengganggumu.
            </p>
          </div>
        </div>
      </section>

      {/* Fitur Utama */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Mengapa Harus Melapor?</h2>

        <div style={styles.grid}>
          <div style={styles.card}>
            <h3 style={styles.cardHeading}>Aman & Rahasia</h3>
            <p style={styles.cardDesc}>
              Identitas kamu dijaga dengan aman, jadi tidak perlu takut untuk melapor.
            </p>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardHeading}>Guru Siap Membantu</h3>
            <p style={styles.cardDesc}>
              Guru BK akan segera membaca laporanmu dan membantu menyelesaikan masalah.
            </p>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardHeading}>Belajar Saling Hormat</h3>
            <p style={styles.cardDesc}>
              Membantu kita semua belajar menjadi teman yang baik dan saling menyayangi.
            </p>
          </div>
        </div>
      </section>

      {/* Langkah Penggunaan */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Cara Menggunakan</h2>

        <div style={styles.stepGrid}>
          <div style={styles.stepCard}>
            <div style={styles.stepBadge}>1</div>
            <h4 style={{ margin: "5px 0", color: "#1B5E20" }}>Masuk Akun</h4>
            <p style={{ fontSize: "13px", color: "#555", margin: 0 }}>Scan QR atau masukan NISN</p>
          </div>

          <div style={styles.stepCard}>
            <div style={styles.stepBadge}>2</div>
            <h4 style={{ margin: "5px 0", color: "#1B5E20" }}>Isi Laporan</h4>
            <p style={{ fontSize: "13px", color: "#555", margin: 0 }}>Ceritakan apa yang terjadi</p>
          </div>

          <div style={styles.stepCard}>
            <div style={styles.stepBadge}>3</div>
            <h4 style={{ margin: "5px 0", color: "#1B5E20" }}>Kirim</h4>
            <p style={{ fontSize: "13px", color: "#555", margin: 0 }}>Tekan tombol kirim laporan</p>
          </div>

          <div style={styles.stepCard}>
            <div style={styles.stepBadge}>4</div>
            <h4 style={{ margin: "5px 0", color: "#1B5E20" }}>Diproses</h4>
            <p style={{ fontSize: "13px", color: "#555", margin: 0 }}>Guru akan membantu kamu</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <strong style={{ fontSize: "16px" }}>Sistem Pengaduan Bullying SD</strong>
        <p style={{ margin: "5px 0 0", opacity: 0.8 }}>Program Kerja KKN ITH 2026</p>
      </footer>
    </div>
  );
}


export default LandingPage;