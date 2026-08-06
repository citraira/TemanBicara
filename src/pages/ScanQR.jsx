import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";
import { ref, get } from "firebase/database";
import { db } from "../firebase";

function ScanQR() {
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: { width: 220, height: 220 },
      },
      /* verbose= */ false
    );

    scanner.render(onScanSuccess, onScanFailure);

    function onScanSuccess(decodedText) {
      scanner.clear();
      setScanResult(decodedText);
      verifyStudentData(decodedText);
    }

    function onScanFailure(error) {
      // Abaikan error per frame
    }

    return () => {
      scanner.clear().catch((err) => console.error("Gagal membersihkan scanner", err));
    };
  }, []);

  const verifyStudentData = async (qrData) => {
    try {
      const studentRef = ref(db, `siswa/${qrData}`);
      const snapshot = await get(studentRef);

      if (snapshot.exists()) {
        const dataSiswa = snapshot.val();
        
        localStorage.setItem("namaSiswa", dataSiswa.nama);
        localStorage.setItem("kelasSiswa", dataSiswa.kelas);
        localStorage.setItem("nisnSiswa", qrData);

        alert(`Login Berhasil! Selamat datang, ${dataSiswa.nama}`);
        navigate("/dashboard-siswa");
      } else {
        setErrorMsg("Data QR Code tidak terdaftar dalam sistem!");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Terjadi kesalahan saat verifikasi data.");
    }
  };

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#F4FBEE", // Hijau muda segar
      fontFamily: "'Segoe UI', Roboto, sans-serif",
      padding: "20px 15px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      boxSizing: "border-box",
    },

    card: {
      width: "100%",
      maxWidth: "420px",
      background: "#fff",
      borderRadius: "24px",
      padding: "25px 20px",
      boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
      border: "2px solid #C8E6C9",
      textAlign: "center",
    },

    title: {
      color: "#1B5E20",
      fontSize: "24px",
      fontWeight: "800",
      marginBottom: "8px",
    },

    desc: {
      color: "#556B4D",
      fontSize: "14px",
      lineHeight: "1.5",
      marginBottom: "15px",
      fontWeight: "500",
    },

    scannerContainer: {
      margin: "15px 0",
      overflow: "hidden",
      borderRadius: "18px",
      border: "3px dashed #81C784",
      background: "#FAFAFA",
    },

    successBox: {
      color: "#2E7D32",
      background: "#E8F5E9",
      padding: "10px",
      borderRadius: "10px",
      fontWeight: "700",
      fontSize: "14px",
      margin: "10px 0",
    },

    errorBox: {
      color: "#C62828",
      background: "#FFEBEE",
      padding: "10px",
      borderRadius: "10px",
      fontWeight: "700",
      fontSize: "14px",
      margin: "10px 0",
    },

    backBtn: {
      width: "100%",
      padding: "14px",
      background: "#2E7D32",
      color: "#fff",
      border: "none",
      borderRadius: "14px",
      fontWeight: "800",
      fontSize: "15px",
      cursor: "pointer",
      marginTop: "15px",
      boxShadow: "0 4px 0 #1B5E20",
      textTransform: "uppercase",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Scan QR Code Siswa</h2>
        <p style={styles.desc}>
          Arahkan QR Code pada Kartu Siswa ke kotak kamera untuk masuk.
        </p>

        {/* CONTAINER AREA KAMERA */}
        <div id="reader" style={styles.scannerContainer}></div>

        {/* PESAN STATUS */}
        {scanResult && (
          <div style={styles.successBox}>
            QR Code Terdeteksi: {scanResult}
          </div>
        )}

        {errorMsg && (
          <div style={styles.errorBox}>
            {errorMsg}
          </div>
        )}

        <button style={styles.backBtn} onClick={() => navigate("/login-siswa")}>
          Kembali ke Login
        </button>
      </div>
    </div>
  );
}

export default ScanQR;