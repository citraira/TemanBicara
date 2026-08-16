import { useCallback, useEffect, useRef, useState } from "react";
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
  const scannerStartingRef = useRef(false);
  const scanHandledRef = useRef(false);
  const isMountedRef = useRef(true);

  const showAlert = useCallback(
    (type, title, message, onCloseCallback = null) => {
      setAlertConfig({
        isOpen: true,
        type,
        title,
        message,
        onCloseCallback,
      });
    },
    []
  );

  const handleCloseAlert = useCallback(() => {
    const callback = alertConfig.onCloseCallback;

    setAlertConfig((prev) => ({
      ...prev,
      isOpen: false,
    }));

    if (callback) {
      callback();
    }
  }, [alertConfig.onCloseCallback]);

  useEffect(() => {
    isMountedRef.current = true;

    const initScanner = async () => {
      try {
        if (!html5QrCodeRef.current) {
          html5QrCodeRef.current = new Html5Qrcode("reader-canvas");
        }

        const devices = await Html5Qrcode.getCameras();

        if (!isMountedRef.current) return;

        if (devices && devices.length > 0) {
          setCameras(devices);

          let defaultIndex = devices.findIndex((device) => {
            const label = (device.label || "").toLowerCase();

            return (
              label.includes("back") ||
              label.includes("belakang") ||
              label.includes("environment") ||
              label.includes("rear")
            );
          });

          if (defaultIndex === -1) {
            defaultIndex = devices.length - 1;
          }

          setCurrentCameraIndex(defaultIndex);

          await startScanner(devices[defaultIndex].id);
        } else {
          await startScanner({ facingMode: "environment" });
        }
      } catch (err) {
        console.warn("Mencoba fallback kamera:", err);

        if (!isMountedRef.current) return;

        try {
          await startScanner({ facingMode: "environment" });
        } catch (_) {
          if (isMountedRef.current) {
            setErrorMsg(
              "Izin kamera belum aktif. Berikan izin kamera di pengaturan browser."
            );
          }
        }
      }
    };

    initScanner();

    return () => {
      isMountedRef.current = false;
      scannerStartingRef.current = false;
      scanHandledRef.current = true;

      const scanner = html5QrCodeRef.current;
      html5QrCodeRef.current = null;

      if (scanner) {
        try {
          if (scanner.isScanning) {
            scanner.stop().catch(() => {});
          }

          setTimeout(() => {
            try {
              scanner.clear();
            } catch (_) {}
          }, 0);
        } catch (_) {}
      }
    };
  }, []);

  const startScanner = useCallback(async (cameraConfig) => {
    const scanner = html5QrCodeRef.current;

    if (!scanner || !isMountedRef.current) return;
    if (scannerStartingRef.current) return;

    scannerStartingRef.current = true;
    scanHandledRef.current = false;

    try {
      if (scanner.isScanning) {
        await scanner.stop();
      }

      if (!isMountedRef.current) return;

      await scanner.start(
        cameraConfig,
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          if (scanHandledRef.current) return;

          scanHandledRef.current = true;
          handleSuccessScan(decodedText);
        },
        () => {}
      );

      if (isMountedRef.current) {
        setErrorMsg("");
      }
    } catch (err) {
      console.error("Gagal start kamera:", err);

      if (isMountedRef.current) {
        setErrorMsg(
          "Kamera tidak dapat diakses. Pastikan izin kamera aktif dan web menggunakan HTTPS."
        );
      }
    } finally {
      scannerStartingRef.current = false;
    }
  }, []);

  const handleFlipCamera = async () => {
    if (cameras.length < 2) {
      showAlert(
        "warning",
        "Kamera Tunggal",
        "Hanya 1 kamera yang terdeteksi di perangkat Anda."
      );
      return;
    }

    if (scannerStartingRef.current) return;

    const nextIndex =
      (currentCameraIndex + 1) % cameras.length;

    setCurrentCameraIndex(nextIndex);
    scanHandledRef.current = false;

    await startScanner(cameras[nextIndex].id);
  };

  const handleSuccessScan = useCallback(async (qrData) => {
    const cleanQrData = String(qrData || "").trim();

    if (!cleanQrData || !isMountedRef.current) return;

    scanHandledRef.current = true;

    const scanner = html5QrCodeRef.current;

    if (scanner?.isScanning) {
      try {
        await scanner.stop();
      } catch (_) {}
    }

    if (!isMountedRef.current) return;

    setScanResult(cleanQrData);
    setErrorMsg("");

    await verifyStudentData(cleanQrData);
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];

    // Izinkan memilih file yang sama kembali.
    e.target.value = "";

    if (!file || !html5QrCodeRef.current) return;

    const scanner = html5QrCodeRef.current;

    try {
      if (scanner.isScanning) {
        await scanner.stop();
      }

      scanHandledRef.current = true;

      const decodedText = await scanner.scanFile(file, true);

      if (!isMountedRef.current) return;

      setScanResult(decodedText);
      setErrorMsg("");

      await verifyStudentData(decodedText);
    } catch (err) {
      console.error("Gagal baca file:", err);

      if (!isMountedRef.current) return;

      setErrorMsg(
        "Tidak dapat membaca QR Code dari foto ini. Pastikan gambar jelas!"
      );

      scanHandledRef.current = false;

      if (cameras.length > 0) {
        await startScanner(cameras[currentCameraIndex].id);
      } else {
        await startScanner({ facingMode: "environment" });
      }
    }
  };

  const verifyStudentData = async (qrData) => {
    const cleanQrData = String(qrData || "").trim();

    if (!cleanQrData) {
      if (isMountedRef.current) {
        setErrorMsg("QR Code / NIS tidak valid.");
      }
      return;
    }

    try {
      setErrorMsg("");

      const studentRef = ref(db, `siswa/${cleanQrData}`);
      const snapshot = await get(studentRef);

      if (!isMountedRef.current) return;

      if (snapshot.exists()) {
        const dataSiswa = snapshot.val();

        localStorage.setItem(
          "namaSiswa",
          dataSiswa.nama || ""
        );
        localStorage.setItem(
          "nisSiswa",
          dataSiswa.nis || cleanQrData
        );
        localStorage.setItem(
          "kelasSiswa",
          dataSiswa.kelas || "-"
        );

        showAlert(
          "success",
          "Login Berhasil!",
          `Selamat datang, ${dataSiswa.nama}! Kamu berhasil masuk ke sistem pengaduan.`,
          () => {
            navigate("/dashboard-siswa");
          }
        );
      } else {
        setErrorMsg(
          "QR Code atau NISN tidak terdaftar di sistem sekolah!"
        );

        scanHandledRef.current = false;

        if (cameras.length > 0) {
          await startScanner(cameras[currentCameraIndex].id);
        } else {
          await startScanner({ facingMode: "environment" });
        }
      }
    } catch (err) {
      console.error("Gagal verifikasi siswa:", err);

      if (isMountedRef.current) {
        setErrorMsg(
          "Terjadi kendala koneksi saat verifikasi data."
        );
        scanHandledRef.current = false;
      }
    } finally {
      if (isMountedRef.current) {
        setLoadingManual(false);
      }
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();

    if (loadingManual) return;

    const nis = manualNis.trim();

    if (!nis) {
      setErrorMsg("Silakan masukkan NISN / NIS Siswa!");
      return;
    }

    setLoadingManual(true);
    scanHandledRef.current = true;

    verifyStudentData(nis);
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

        <button
          type="button"
          style={styles.backBtn}
          onClick={() => navigate("/login-siswa")}
        >
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