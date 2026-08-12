import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";
import { ref, get } from "firebase/database";
import { db } from "../firebase";

function ScanQR() {
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [manualNis, setManualNis] = useState("");
  const [loadingManual, setLoadingManual] = useState(false);

  const scannerRef = useRef(null);

  useEffect(() => {
    // Inisialisasi QR Scanner dengan konfigurasi lebih fleksibel & responsif
    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 15, // Lebih cepat merespons (dari 10 fps)
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          // Kotak scan otomatis menyesuaikan 70% dari ukuran layar HP/Komputer
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          const qrboxSize = Math.floor(minEdge * 0.7);
          return {
            width: Math.max(qrboxSize, 200),
            height: Math.max(qrboxSize, 200),
          };
        },
        aspectRatio: 1.0,
      },
      /* verbose= */ false
    );

    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        scanner.clear();
        setScanResult(decodedText);
        verifyStudentData(decodedText);
      },
      (error) => {
        // Meredam error per-frame kamera
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .clear()
          .catch((err) => console.error("Gagal membersihkan scanner:", err));
      }
    };
  }, []);

  // VERIFIKASI DATA SISWA DARI FIREBASE
  const verifyStudentData = async (qrData) => {
    setErrorMsg("");
    try {
      const cleanQrData = qrData.trim();
      const studentRef = ref(db, `siswa/${cleanQrData}`);
      const snapshot = await get(studentRef);

      if (snapshot.exists()) {
        const dataSiswa = snapshot.val();
        
        localStorage.setItem("namaSiswa", dataSiswa.nama);
        localStorage.setItem("kelasSiswa", dataSiswa.kelas || "-");
        localStorage.setItem("nisnSiswa", cleanQrData);

        alert(`Login Berhasil!\nSelamat datang, ${dataSiswa.nama}`);
        navigate("/dashboard-siswa");
      } else {
        setErrorMsg("QR Code atau NISN tidak terdaftar dalam sistem!");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Terjadi kesalahan koneksi saat verifikasi data.");
    } finally {
      setLoadingManual(false);
    }
  };

  // HANDLER INPUT NIS MANUAL JIKA KAMERA EROR/SUSAH FOKUS
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualNis.trim()) {
      setErrorMsg("Silakan masukkan NISN/Kode Siswa!");
      return;
    }
    setLoadingManual(true);
    verifyStudentData(manualNis.trim());
  };

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#F4FBEE",
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
      boxSizing: "border-box",
    },
    title: {
      color: "#1B5E20",
      fontSize: "22px",
      fontWeight: "800",
      marginBottom: "6px",
      marginTop: 0,
    },
    desc: {
      color: "#556B4D",
      fontSize: "13px",
      lineHeight: "1.5",
      marginBottom: "15px",
      fontWeight: "500",
    },
    scannerWrapper: {
      position: "relative",
      margin: "15px 0",
      borderRadius: "18px",
      overflow: "hidden",
      border: "3px solid #2E7D32",
      background: "#000",
    },
    successBox: {
      color: "#1B5E20",
      background: "#E8F5E9",
      padding: "12px",
      borderRadius: "12px",
      fontWeight: "700",
      fontSize: "13px",
      margin: "12px 0",
      border: "1px solid #C8E6C9",
    },
    errorBox: {
      color: "#C62828",
      background: "#FFEBEE",
      padding: "12px",
      borderRadius: "12px",
      fontWeight: "700",
      fontSize: "13px",
      margin: "12px 0",
      border: "1px solid #FFCDD2",
    },
    divider: {
      display: "flex",
      alignItems: "center",
      margin: "20px 0 15px 0",
      color: "#81C784",
      fontSize: "12px",
      fontWeight: "700",
    },
    dividerLine: {
      flex: 1,
      height: "1px",
      background: "#C8E6C9",
    },
    inputManual: {
      width: "100%",
      padding: "12px",
      borderRadius: "12px",
      border: "2px solid #C8E6C9",
      fontSize: "14px",
      boxSizing: "border-box",
      outline: "none",
      textAlign: "center",
      marginBottom: "10px",
      fontWeight: "700",
      color: "#1B5E20",
      background: "#FAFAFA",
    },
    submitBtn: {
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
      marginBottom: "15px",
    },
    backBtn: {
      width: "100%",
      padding: "12px",
      background: "#2E7D32",
      color: "#fff",
      border: "none",
      borderRadius: "12px",
      fontWeight: "800",
      fontSize: "13px",
      cursor: "pointer",
      boxShadow: "0 3px 0 #1B5E20",
      textTransform: "uppercase",
    },
  };

  return (
    <div style={styles.page}>
      {/* OVERRIDE STYLE CSS BAWAAN HTML5-QRCODE SUPAYA BAGUS & RAPI */}
      <style>{`
        #reader {
          border: none !important;
        }
        #reader video {
          border-radius: 14px;
          object-fit: cover !important;
        }
        #reader__dashboard_section_csr button {
          background-color: #2E7D32 !important;
          color: white !important;
          border: none !important;
          padding: 10px 16px !important;
          border-radius: 10px !important;
          font-weight: bold !important;
          font-size: 13px !important;
          cursor: pointer !important;
          margin: 8px 0 !important;
          box-shadow: 0 3px 0 #1B5E20 !important;
        }
        #reader__dashboard_section_swaplink {
          color: #2E7D32 !important;
          font-weight: 700 !important;
          text-decoration: underline !important;
          font-size: 12px !important;
        }
        #reader__camera_selection {
          padding: 8px !important;
          border-radius: 8px !important;
          border: 2px solid #C8E6C9 !important;
          margin-bottom: 10px !important;
          outline: none !important;
          font-size: 13px !important;
        }
      `}</style>

      <div style={styles.card}>
        <h2 style={styles.title}>Scan QR Code Siswa</h2>
        <p style={styles.desc}>
          Arahkan QR Code Kartu Siswa tepat di tengah kotak kamera.
        </p>

        {/* CONTAINER KAMERA UTAMA */}
        <div style={styles.scannerWrapper}>
          <div id="reader"></div>
        </div>

        {/* NOTIFIKASI HASIL */}
        {scanResult && (
          <div style={styles.successBox}>
            QR Code Terdeteksi: <strong>{scanResult}</strong>
          </div>
        )}

        {errorMsg && <div style={styles.errorBox}>{errorMsg}</div>}

        {/* OPSIONAL: INPUT NIS MANUAL */}
        <div style={styles.divider}>
          <div style={styles.dividerLine}></div>
          <span style={{ padding: "0 10px" }}>ATAU MASUKKAN NISN</span>
          <div style={styles.dividerLine}></div>
        </div>

        <form onSubmit={handleManualSubmit}>
          <input
            type="text"
            placeholder="Ketik NISN Siswa di sini..."
            value={manualNis}
            onChange={(e) => setManualNis(e.target.value)}
            style={styles.inputManual}
          />
          <button type="submit" style={styles.submitBtn} disabled={loadingManual}>
            {loadingManual ? "Memeriksa..." : "Masuk dengan NISN"}
          </button>
        </form>

        <button style={styles.backBtn} onClick={() => navigate("/login-siswa")}>
          Kembali ke Login
        </button>
      </div>
    </div>
  );
}

export default ScanQR;