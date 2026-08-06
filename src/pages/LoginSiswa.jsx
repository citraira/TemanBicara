import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ref, get } from "firebase/database";
import { db } from "../firebase";

function LoginSiswa() {
  const navigate = useNavigate();

  const [nama, setNama] = useState("");
  const [nis, setNis] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (nama.trim() === "") {
      alert("Silakan masukkan Nama Lengkap!");
      return;
    }

    if (nis.trim() === "") {
      alert("Silakan masukkan Nomor Induk Siswa (NIS)!");
      return;
    }

    setLoading(true);

    try {
      const siswaRef = ref(db, "siswa");
      const snapshot = await get(siswaRef);

      if (snapshot.exists()) {
        const data = snapshot.val();

        const siswaDitemukan = Object.entries(data).find(([key, item]) => {
          const matchNama = item.nama?.trim().toLowerCase() === nama.trim().toLowerCase();
          const matchNis = (item.nis?.trim() === nis.trim()) || (key === nis.trim());
          return matchNama && matchNis;
        });

        if (siswaDitemukan) {
          const [, item] = siswaDitemukan;

          localStorage.setItem("namaSiswa", item.nama);
          localStorage.setItem("nisSiswa", item.nis || nis);
          localStorage.setItem("kelasSiswa", item.kelas || "");

          alert(`Login Berhasil! Selamat datang, ${item.nama}`);
          navigate("/dashboard-siswa");
        } else {
          alert("Nama atau NIS tidak terdaftar! Silakan hubungi guru/admin.");
        }
      } else {
        alert("Belum ada data siswa yang terdaftar di sistem.");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat memeriksa data login.");
    } finally {
      setLoading(false);
    }
  };

  const handleScanQR = () => {
    navigate("/scan-qr");
  };

  const styles = {
    page: {
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#F4FBEE", // Hijau muda segar
      padding: "15px",
      fontFamily: "'Segoe UI', Roboto, sans-serif",
    },

    card: {
      width: "100%",
      maxWidth: "900px",
      background: "#fff",
      borderRadius: "24px",
      display: "flex",
      flexWrap: "wrap",
      overflow: "hidden",
      boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
      border: "2px solid #C8E6C9",
    },

    left: {
      flex: "1 1 320px",
      padding: "35px 25px",
    },

    right: {
      flex: "1 1 320px",
      background: "#2E7D32", // Hijau utama
      color: "#fff",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
      padding: "35px 25px",
    },

    title: {
      fontSize: "28px",
      color: "#1B5E20",
      fontWeight: "800",
      marginBottom: "8px",
    },

    subtitle: {
      color: "#556B4D",
      fontSize: "14px",
      lineHeight: "1.5",
      marginBottom: "25px",
      fontWeight: "500",
    },

    qrButton: {
      width: "100%",
      padding: "14px",
      background: "#FFEB3B", // Kuning
      color: "#1B5E20",
      border: "none",
      borderRadius: "14px",
      fontSize: "16px",
      cursor: "pointer",
      marginBottom: "20px",
      fontWeight: "800",
      boxShadow: "0 4px 0 #FBC02D",
    },

    divider: {
      textAlign: "center",
      color: "#888",
      marginBottom: "20px",
      fontWeight: "bold",
      fontSize: "13px",
    },

    label: {
      display: "block",
      marginBottom: "6px",
      fontWeight: "700",
      color: "#2E3D29",
      fontSize: "14px",
    },

    input: {
      width: "100%",
      padding: "14px",
      borderRadius: "12px",
      border: "2px solid #C8E6C9",
      marginBottom: "18px",
      fontSize: "15px",
      boxSizing: "border-box",
      outline: "none",
      background: "#FAFAFA",
    },

    loginButton: {
      width: "100%",
      padding: "15px",
      border: "none",
      borderRadius: "14px",
      background: loading ? "#A5D6A7" : "#2E7D32",
      color: "#fff",
      fontSize: "16px",
      cursor: loading ? "not-allowed" : "pointer",
      fontWeight: "800",
      boxShadow: loading ? "none" : "0 4px 0 #1B5E20",
      textTransform: "uppercase",
    },

    back: {
      marginTop: "20px",
      textAlign: "center",
      color: "#2E7D32",
      cursor: "pointer",
      fontWeight: "700",
      fontSize: "14px",
    },

    stop: {
      fontSize: "32px",
      fontWeight: "800",
      marginBottom: "15px",
      color: "#FFEB3B",
    },

    desc: {
      fontSize: "15px",
      lineHeight: "1.6",
      fontWeight: "500",
      opacity: 0.95,
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* BAGIAN KIRI - FORM LOGIN */}
        <div style={styles.left}>
          <div style={styles.title}>Login Siswa</div>

          <div style={styles.subtitle}>
            Selamat datang di Sistem Pengaduan Bullying SD.
          </div>

          <button style={styles.qrButton} onClick={handleScanQR}>
            SCAN QR CODE LOGIN
          </button>

          <div style={styles.divider}>— ATAU MASUK DENGAN NIS —</div>

          <form onSubmit={handleLogin}>
            <label style={styles.label}>Nama Lengkap</label>
            <input
              type="text"
              placeholder="Ketik nama lengkapmu"
              style={styles.input}
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              disabled={loading}
            />

            <label style={styles.label}>Nomor Induk Siswa (NIS)</label>
            <input
              type="text"
              placeholder="Ketik nomor NIS"
              style={styles.input}
              value={nis}
              onChange={(e) => setNis(e.target.value)}
              disabled={loading}
            />

            <button
              type="submit"
              style={styles.loginButton}
              disabled={loading}
            >
              {loading ? "Memeriksa..." : "MASUK SEKARANG"}
            </button>
          </form>

          <div style={styles.back} onClick={() => navigate("/")}>
            Kembali ke Beranda
          </div>
        </div>

        {/* BAGIAN KANAN - PESAN EDUKASI */}
        <div style={styles.right}>
          <div>
            <div style={styles.stop}>Stop Bullying!</div>
            <div style={styles.desc}>
              Jadilah teman yang baik, saling menghargai, dan berani melapor apabila melihat atau mengalami tindakan bullying di sekolah.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginSiswa;