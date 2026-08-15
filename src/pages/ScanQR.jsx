import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import { ref, get } from "firebase/database";
import { db } from "../firebase";

const styles = {
  page: {
    minHeight: "100dvh",
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
    minHeight: "260px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  flipBtn: {
    position: "absolute",
    bottom: "12px",
    right: "12px",
    width: "46px",
    height: "46px",
    background: "#FFEB3B",
    color: "#1B5E20",
    border: "2px solid #2E7D32",
    borderRadius: "12px",
    fontSize: "22px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
    zIndex: 10,
  },
  uploadBtnLabel: {
    display: "block",
    width: "100%",
    padding: "14px",
    background: "#2E7D32",
    color: "#fff",
    borderRadius: "14px",
    fontWeight: "800",
    fontSize: "14px",
    cursor: "pointer",
    boxShadow: "0 4px 0 #1B5E20",
    textTransform: "uppercase",
    boxSizing: "border-box",
    margin: "15px 0",
    border: "2px solid #A5D6A7",
  },
  hiddenFileInput: {
    display: "none",
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
    fontSize: "16px",
    boxSizing: "border-box",
    outline: "none",
    textAlign: "center",
    marginBottom: "10px",
    fontWeight: "700",
    color: "#1B5E20",
    background: "#FAFAFA",
  },
  submitBtn: (loading) => ({
    width: "100%",
    padding: "12px",
    background: loading ? "#FFE082" : "#FFEB3B",
    color: "#1B5E20",
    border: "none",
    borderRadius: "12px",
    fontWeight: "800",
    fontSize: "13px",
    cursor: loading ? "not-allowed" : "pointer",
    boxShadow: "0 3px 0 #FBC02D",
    textTransform: "uppercase",
    marginBottom: "15px",
  }),
  backBtn: {
    width: "100%",
    padding: "12px",
    background: "#E0E0E0",
    color: "#333",
    border: "none",
    borderRadius: "12px",
    fontWeight: "800",
    fontSize: "13px",
    cursor: "pointer",
    boxShadow: "0 3px 0 #9E9E9E",
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
    border: "2px solid #C8E6C9",
    boxSizing: "border-box",
  },
  modalTitle: {
    marginBottom: "8px",
    fontSize: "20px",
    fontWeight: "800",
  },
  modalText: {
    color: "#556B4D",
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
      type === "success" ? "#E8F5E9" : type === "error" ? "#FFEBEE" : "#FFFDE7",
    border: `2px solid ${
      type === "success" ? "#2E7D32" : type === "error" ? "#D32F2F" : "#FBC02D"
    }`,
    color:
      type === "success" ? "#2E7D32" : type === "error" ? "#D32F2F" : "#F57F17",
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
    color: type === "warning" ? "#1B5E20" : "#fff",
    background:
      type === "success" ? "#2E7D32" : type === "error" ? "#D32F2F" : "#FFEB3B",
    boxShadow:
      type === "success" ? "0 3px 0 #1B5E20" : type === "error" ? "0 3px 0 #9A0007" : "0 3px 0 #FBC02D",
  }),
};

function ScanQR() {
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [manualNis, setManualNis] = useState("");
  const [loadingManual, setLoadingManual] = useState(false);

  const [cameras, setCameras] = useState([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);

  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
    onCloseCallback: null,
  });

  const html5QrCodeRef = useRef(null);

  const showAlert = (type, title, message, onCloseCallback = null) => {
    setAlertConfig({
      isOpen: true,
      type,
      title,
      message,
      onCloseCallback,
    });
  };

  const handleCloseAlert = () => {
    const callback = alertConfig.onCloseCallback;
    setAlertConfig((prev) => ({ ...prev, isOpen: false }));
    if (callback) callback();
  };

  useEffect(() => {
    let isMounted = true;

    const initScanner = async () => {
      try {
        if (!html5QrCodeRef.current) {
          html5QrCodeRef.current = new Html5Qrcode("reader-canvas");
        }

        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0 && isMounted) {
          setCameras(devices);

          let defaultIndex = devices.findIndex(
            (device) =>
              device.label.toLowerCase().includes("back") ||
              device.label.toLowerCase().includes("belakang") ||
              device.label.toLowerCase().includes("environment")
          );
          if (defaultIndex === -1) defaultIndex = devices.length - 1;

          setCurrentCameraIndex(defaultIndex);
          await startScanner(devices[defaultIndex].id);
        } else if (isMounted) {
          // Fallback menggunakan facingMode jika list kamera kosong
          await startScanner({ facingMode: "environment" });
        }
      } catch (err) {
        console.warn("Mencoba fallback kamera:", err);
        if (isMounted) {
          startScanner({ facingMode: "environment" }).catch((error) => {
            setErrorMsg("Izin kamera belum aktif. Berikan izin kamera di pengaturan browser.");
          });
        }
      }
    };

    initScanner();

    return () => {
      isMounted = false;
      if (html5QrCodeRef.current) {
        try {
          if (html5QrCodeRef.current.isScanning) {
            html5QrCodeRef.current.stop().then(() => {
              html5QrCodeRef.current.clear();
            }).catch(() => {});
          } else {
            html5QrCodeRef.current.clear();
          }
        } catch (e) {
          console.error(e);
        }
      }
    };
  }, []);

  const startScanner = async (cameraConfig) => {
    if (!html5QrCodeRef.current) return;

    try {
      if (html5QrCodeRef.current.isScanning) {
        await html5QrCodeRef.current.stop();
      }

      await html5QrCodeRef.current.start(
        cameraConfig,
        {
          fps: 15,
          qrbox: { width: 230, height: 230 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleSuccessScan(decodedText);
        },
        () => {}
      );
      setErrorMsg("");
    } catch (err) {
      console.error("Gagal start kamera:", err);
      setErrorMsg("Kamera tidak dapat diakses. Pastikan izin kamera aktif dan web menggunakan HTTPS.");
    }
  };

  const handleFlipCamera = () => {
    if (cameras.length < 2) {
      showAlert("warning", "Kamera Tunggal", "Hanya 1 kamera yang terdeteksi di perangkat Anda.");
      return;
    }
    const nextIndex = (currentCameraIndex + 1) % cameras.length;
    setCurrentCameraIndex(nextIndex);
    startScanner(cameras[nextIndex].id);
  };

  const handleSuccessScan = (qrData) => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      html5QrCodeRef.current.stop().catch(() => {});
    }
    setScanResult(qrData);
    verifyStudentData(qrData);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      await html5QrCodeRef.current.stop().catch(() => {});
    }

    try {
      const decodedText = await html5QrCodeRef.current.scanFile(file, true);
      handleSuccessScan(decodedText);
    } catch (err) {
      console.error("Gagal baca file:", err);
      setErrorMsg("Tidak dapat membaca QR Code dari foto ini. Pastikan gambar jelas!");
      if (cameras.length > 0) {
        startScanner(cameras[currentCameraIndex].id);
      }
    }
  };

  const verifyStudentData = async (qrData) => {
    setErrorMsg("");
    try {
      const cleanQrData = qrData.trim();
      const studentRef = ref(db, `siswa/${cleanQrData}`);
      const snapshot = await get(studentRef);

      if (snapshot.exists()) {
        const dataSiswa = snapshot.val();

        localStorage.setItem("namaSiswa", dataSiswa.nama);
        localStorage.setItem("nisSiswa", dataSiswa.nis || cleanQrData);
        localStorage.setItem("kelasSiswa", dataSiswa.kelas || "-");

        showAlert(
          "success",
          "Login Berhasil!",
          `Selamat datang, ${dataSiswa.nama}! Kamu berhasil masuk ke sistem pengaduan.`,
          () => {
            navigate("/dashboard-siswa");
          }
        );
      } else {
        setErrorMsg("QR Code atau NISN tidak terdaftar di sistem sekolah!");
        if (cameras.length > 0) {
          startScanner(cameras[currentCameraIndex].id);
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Terjadi kendala koneksi saat verifikasi data.");
    } finally {
      setLoadingManual(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualNis.trim()) {
      setErrorMsg("Silakan masukkan NISN / NIS Siswa!");
      return;
    }
    setLoadingManual(true);
    verifyStudentData(manualNis.trim());
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Scan QR Code Siswa</h2>
        <p style={styles.desc}>Arahkan QR Code Kartu Siswa ke dalam kotak kamera.</p>

        <div style={styles.scannerWrapper}>
          <div id="reader-canvas" style={{ width: "100%" }}></div>

          {cameras.length > 1 && (
            <button
              type="button"
              style={styles.flipBtn}
              onClick={handleFlipCamera}
              title="Putar Kamera"
            >
              🔄
            </button>
          )}
        </div>

        <label htmlFor="qr-file-input" style={styles.uploadBtnLabel}>
          🖼️ UNGGAH GAMBAR QR CODE
        </label>
        <input
          id="qr-file-input"
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          style={styles.hiddenFileInput}
        />

        {scanResult && (
          <div style={styles.successBox}>
            QR Code Terdeteksi: <strong>{scanResult}</strong>
          </div>
        )}

        {errorMsg && <div style={styles.errorBox}>{errorMsg}</div>}

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
            inputMode="numeric"
          />
          <button
            type="submit"
            style={styles.submitBtn(loadingManual)}
            disabled={loadingManual}
          >
            {loadingManual ? "Memeriksa..." : "Masuk dengan NISN"}
          </button>
        </form>

        <button style={styles.backBtn} onClick={() => navigate("/login-siswa")}>
          Kembali ke Login
        </button>
      </div>

      {alertConfig.isOpen && (
        <div style={styles.modalOverlay} onClick={handleCloseAlert}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.alertIconWrapper(alertConfig.type)}>
              {alertConfig.type === "success" ? "✓" : alertConfig.type === "error" ? "✕" : "ℹ"}
            </div>

            <h3
              style={{
                ...styles.modalTitle,
                color:
                  alertConfig.type === "success"
                    ? "#1B5E20"
                    : alertConfig.type === "error"
                    ? "#C62828"
                    : "#E65100",
              }}
            >
              {alertConfig.title}
            </h3>

            <p style={styles.modalText}>{alertConfig.message}</p>

            <button style={styles.alertBtn(alertConfig.type)} onClick={handleCloseAlert}>
              Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScanQR;