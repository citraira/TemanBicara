import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { ref, get, query, orderByChild, equalTo } from "firebase/database";
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
    height: "260px",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
  },
  videoElement: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  scannerOverlay: {
    position: "absolute",
    width: "180px",
    height: "180px",
    border: "2px dashed #FFEB3B",
    borderRadius: "12px",
    pointerEvents: "none",
    boxShadow: "0 0 0 9999px rgba(0,0,0,0.35)",
  },
  flipBtn: {
    position: "absolute",
    bottom: "12px",
    right: "12px",
    width: "44px",
    height: "44px",
    background: "#FFEB3B",
    color: "#1B5E20",
    border: "2px solid #2E7D32",
    borderRadius: "12px",
    fontSize: "20px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
    zIndex: 20,
  },
  cameraStatus: {
    color: "#fff",
    background: "rgba(0,0,0,0.65)",
    borderRadius: "10px",
    padding: "8px 14px",
    fontSize: "13px",
    fontWeight: "600",
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: 5,
    pointerEvents: "none",
    whiteSpace: "nowrap",
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
    wordBreak: "break-word",
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
  const [cameraLoading, setCameraLoading] = useState(true);
  const [facingMode, setFacingMode] = useState("environment");

  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
    onCloseCallback: null,
  });

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const isHandlingScan = useRef(false);

  const showAlert = useCallback((type, title, message, onCloseCallback = null) => {
    setAlertConfig({
      isOpen: true,
      type,
      title,
      message,
      onCloseCallback,
    });
  }, []);

  const handleCloseAlert = useCallback(() => {
    const callback = alertConfig.onCloseCallback;
    setAlertConfig((prev) => ({
      ...prev,
      isOpen: false,
      onCloseCallback: null,
    }));
    if (callback) callback();
  }, [alertConfig.onCloseCallback]);

  const normalizeNis = (value) => String(value || "").trim();

  // Pencarian Siswa di Firebase
  const findStudent = useCallback(async (nis) => {
    const cleanNis = normalizeNis(nis);
    const siswaRef = ref(db, "siswa");

    try {
      const q = query(siswaRef, orderByChild("nis"), equalTo(cleanNis));
      const snapshot = await get(q);
      if (snapshot.exists()) {
        const entries = Object.entries(snapshot.val());
        if (entries.length > 0) return entries[0];
      }
    } catch (err) {
      console.warn("Query NIS:", err);
    }

    try {
      const allSnapshot = await get(siswaRef);
      if (allSnapshot.exists()) {
        const data = allSnapshot.val();
        const found = Object.entries(data).find(([key, val]) => {
          const dbNis = normalizeNis(val?.nis);
          return dbNis === cleanNis || String(key).trim() === cleanNis;
        });
        if (found) return found;
      }
    } catch (err) {
      console.error("Fallback search:", err);
    }

    return null;
  }, []);

  // Hentikan Stream Kamera
  const stopMediaStream = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Verifikasi Data Siswa & Login
  const verifyStudentData = useCallback(async (qrData) => {
    const cleanNis = normalizeNis(qrData);
    if (!cleanNis) {
      setErrorMsg("QR Code atau NIS tidak valid.");
      isHandlingScan.current = false;
      return;
    }

    setErrorMsg("");
    setLoadingManual(true);

    try {
      const studentEntry = await findStudent(cleanNis);

      if (!studentEntry) {
        setErrorMsg("NIS / Barcode (" + cleanNis + ") tidak terdaftar di sekolah.");
        isHandlingScan.current = false;
        return;
      }

      const [studentId, studentData] = studentEntry;
      const nama = String(studentData?.nama || "Siswa").trim();
      const nisFinal = normalizeNis(studentData?.nis) || String(studentId).trim();
      const kelas = String(studentData?.kelas || "-").trim();

      localStorage.removeItem("namaSiswa");
      localStorage.removeItem("nisSiswa");
      localStorage.removeItem("kelasSiswa");

      localStorage.setItem("namaSiswa", nama);
      localStorage.setItem("nisSiswa", nisFinal);
      localStorage.setItem("kelasSiswa", kelas);

      setScanResult(nisFinal);
      stopMediaStream();

      showAlert(
        "success",
        "Login Berhasil!",
        `Selamat datang, ${nama}! Kamu berhasil masuk ke sistem.`,
        () => {
          navigate("/dashboard-siswa", { replace: true });
        }
      );
    } catch (err) {
      console.error("Verifikasi error:", err);
      setErrorMsg("Kendala koneksi saat memeriksa data siswa.");
      isHandlingScan.current = false;
    } finally {
      setLoadingManual(false);
    }
  }, [findStudent, navigate, showAlert, stopMediaStream]);

  // Handler Deteksi QR
  const handleDetectedQR = useCallback(async (decodedText) => {
    if (isHandlingScan.current) return;
    isHandlingScan.current = true;

    const cleanData = normalizeNis(decodedText);
    if (!cleanData) return;

    setScanResult(cleanData);
    setErrorMsg("");
    stopMediaStream();

    await verifyStudentData(cleanData);
  }, [verifyStudentData, stopMediaStream]);

  // Memulai Kamera Native (Sangat Cepat & Tanpa Lag)
  const startNativeCamera = useCallback(async (mode) => {
    stopMediaStream();
    setCameraLoading(true);
    setErrorMsg("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 640 },
          height: { ideal: 640 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraLoading(false);

        // Jika browser mendukung native BarcodeDetector
        if ("BarcodeDetector" in window) {
          const barcodeDetector = new window.BarcodeDetector({
            formats: ["qr_code"],
          });

          intervalRef.current = setInterval(async () => {
            if (
              videoRef.current &&
              videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA &&
              !isHandlingScan.current
            ) {
              try {
                const barcodes = await barcodeDetector.detect(videoRef.current);
                if (barcodes.length > 0 && barcodes[0].rawValue) {
                  handleDetectedQR(barcodes[0].rawValue);
                }
              } catch (e) {}
            }
          }, 300);
        }
      }
    } catch (err) {
      console.error("Kamera native error:", err);
      setCameraLoading(false);
      setErrorMsg("Kamera tidak dapat dibuka. Berikan izin akses kamera pada browser.");
    }
  }, [stopMediaStream, handleDetectedQR]);

  useEffect(() => {
    isHandlingScan.current = false;
    startNativeCamera("environment");

    return () => {
      stopMediaStream();
    };
  }, [startNativeCamera, stopMediaStream]);

  const handleFlipCamera = () => {
    const nextMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextMode);
    startNativeCamera(nextMode);
  };

  // Upload Gambar QR
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    try {
      setLoadingManual(true);
      setErrorMsg("");

      // Jika browser mendukung native BarcodeDetector
      if ("BarcodeDetector" in window) {
        const barcodeDetector = new window.BarcodeDetector({ formats: ["qr_code"] });
        const img = await createImageBitmap(file);
        const barcodes = await barcodeDetector.detect(img);
        if (barcodes.length > 0 && barcodes[0].rawValue) {
          handleDetectedQR(barcodes[0].rawValue);
          return;
        }
      }

      setErrorMsg("Tidak dapat membaca QR Code dari gambar. Coba scan langsung dengan kamera atau ketik NIS.");
    } catch (err) {
      console.error("Gagal baca gambar QR:", err);
      setErrorMsg("Format gambar QR tidak terbaca.");
    } finally {
      setLoadingManual(false);
    }
  };

  // Input NIS Manual
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (loadingManual || isHandlingScan.current) return;

    const nis = normalizeNis(manualNis);
    if (!nis) {
      setErrorMsg("Silakan masukkan NIS siswa.");
      return;
    }

    isHandlingScan.current = true;
    stopMediaStream();
    await verifyStudentData(nis);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Scan QR Code Siswa</h2>
        <p style={styles.desc}>Arahkan QR Code Kartu Siswa ke dalam kotak kamera.</p>

        {/* AREA KAMERA NATIVE LANGSUNG */}
        <div style={styles.scannerWrapper}>
          <video
            ref={videoRef}
            style={styles.videoElement}
            playsInline
            muted
            autoPlay
          />

          <div style={styles.scannerOverlay} />

          {cameraLoading && (
            <div style={styles.cameraStatus}>Membuka kamera...</div>
          )}

          <button
            type="button"
            style={styles.flipBtn}
            onClick={handleFlipCamera}
            disabled={cameraLoading || loadingManual}
            title="Putar Kamera"
          >
            🔄
          </button>
        </div>

        {/* TOMBOL UNGGAH GAMBAR */}
        <label htmlFor="qr-file-input" style={styles.uploadBtnLabel}>
          🖼️ UNGGAH GAMBAR QR CODE
        </label>
        <input
          id="qr-file-input"
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          style={styles.hiddenFileInput}
          disabled={loadingManual}
        />

        {scanResult && (
          <div style={styles.successBox}>
            QR Code Terdeteksi: <strong>{scanResult}</strong>
          </div>
        )}

        {errorMsg && <div style={styles.errorBox}>{errorMsg}</div>}

        {/* INPUT NIS MANUAL */}
        <div style={styles.divider}>
          <div style={styles.dividerLine} />
          <span style={{ padding: "0 10px" }}>ATAU MASUKKAN NIS</span>
          <div style={styles.dividerLine} />
        </div>

        <form onSubmit={handleManualSubmit}>
          <input
            type="text"
            placeholder="Ketik NIS Siswa di sini..."
            value={manualNis}
            onChange={(e) => setManualNis(e.target.value)}
            style={styles.inputManual}
            inputMode="numeric"
            autoComplete="off"
            disabled={loadingManual}
          />

          <button
            type="submit"
            style={styles.submitBtn(loadingManual)}
            disabled={loadingManual}
          >
            {loadingManual ? "MEMERIKSA..." : "MASUK DENGAN NIS"}
          </button>
        </form>

        <button
          type="button"
          style={styles.backBtn}
          onClick={() => navigate("/login-siswa")}
          disabled={loadingManual}
        >
          Kembali ke Login
        </button>
      </div>

      {/* POP-UP NOTIFIKASI */}
      {alertConfig.isOpen && (
        <div style={styles.modalOverlay} role="presentation">
          <div style={styles.modalCard} role="dialog" aria-modal="true">
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

            <button
              type="button"
              style={styles.alertBtn(alertConfig.type)}
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

export default ScanQR;