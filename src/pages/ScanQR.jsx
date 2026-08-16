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
    display: "block",
    background: "#000",
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
      type === "success"
        ? "#E8F5E9"
        : type === "error"
        ? "#FFEBEE"
        : "#FFFDE7",
    border: `2px solid ${
      type === "success"
        ? "#2E7D32"
        : type === "error"
        ? "#D32F2F"
        : "#FBC02D"
    }`,
    color:
      type === "success"
        ? "#2E7D32"
        : type === "error"
        ? "#D32F2F"
        : "#F57F17",
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
      type === "success"
        ? "#2E7D32"
        : type === "error"
        ? "#D32F2F"
        : "#FFEB3B",
    boxShadow:
      type === "success"
        ? "0 3px 0 #1B5E20"
        : type === "error"
        ? "0 3px 0 #9A0007"
        : "0 3px 0 #FBC02D",
  }),
};

function ScanQR() {
  const navigate = useNavigate();

  const [scanResult, setScanResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [manualNis, setManualNis] = useState("");
  const [loadingManual, setLoadingManual] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(true);

  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
    onCloseCallback: null,
  });

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // ID sesi kamera untuk mencegah stream lama mengambil alih stream baru
  const cameraSessionRef = useRef(0);

  // requestAnimationFrame ID
  const scanAnimationRef = useRef(null);

  // Mencegah detect() berjalan bersamaan
  const detectingRef = useRef(false);

  // Mencegah proses login dipanggil berkali-kali
  const isHandlingScan = useRef(false);

  const currentModeRef = useRef("environment");

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
      onCloseCallback: null,
    }));

    if (callback) callback();
  }, [alertConfig.onCloseCallback]);

  const normalizeNis = useCallback((value) => {
    return String(value || "").trim();
  }, []);

  // =========================================================
  // CARI DATA SISWA
  // =========================================================
  const findStudent = useCallback(
    async (nis) => {
      const cleanNis = normalizeNis(nis);
      const siswaRef = ref(db, "siswa");

      try {
        const q = query(
          siswaRef,
          orderByChild("nis"),
          equalTo(cleanNis)
        );

        const snapshot = await get(q);

        if (snapshot.exists()) {
          const entries = Object.entries(snapshot.val());

          if (entries.length > 0) {
            return entries[0];
          }
        }
      } catch (err) {
        console.warn("Query NIS:", err);
      }

      try {
        const allSnapshot = await get(siswaRef);

        if (allSnapshot.exists()) {
          const data = allSnapshot.val();

          const found = Object.entries(data).find(
            ([key, val]) => {
              const dbNis = normalizeNis(val?.nis);

              return (
                dbNis === cleanNis ||
                String(key).trim() === cleanNis
              );
            }
          );

          if (found) {
            return found;
          }
        }
      } catch (err) {
        console.error("Fallback search:", err);
      }

      return null;
    },
    [normalizeNis]
  );

  // =========================================================
  // STOP SEMUA PROSES KAMERA
  // =========================================================
  const stopMediaStream = useCallback(() => {
    // Batalkan animation frame
    if (scanAnimationRef.current) {
      cancelAnimationFrame(scanAnimationRef.current);
      scanAnimationRef.current = null;
    }

    detectingRef.current = false;

    // Hentikan stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (err) {
          console.warn("Gagal menghentikan track:", err);
        }
      });

      streamRef.current = null;
    }

    // Bersihkan video
    if (videoRef.current) {
      try {
        videoRef.current.pause();
      } catch (err) {
        // ignore
      }

      videoRef.current.srcObject = null;
    }
  }, []);

  // =========================================================
  // VERIFIKASI SISWA
  // =========================================================
  const verifyStudentData = useCallback(
    async (qrData) => {
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
          setErrorMsg(
            "NIS / Barcode (" +
              cleanNis +
              ") tidak terdaftar di database sekolah."
          );

          isHandlingScan.current = false;
          return;
        }

        const [studentId, studentData] = studentEntry;

        const nama = String(
          studentData?.nama || "Siswa"
        ).trim();

        const nisFinal =
          normalizeNis(studentData?.nis) ||
          String(studentId).trim();

        const kelas = String(
          studentData?.kelas || "-"
        ).trim();

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
            navigate("/dashboard-siswa", {
              replace: true,
            });
          }
        );
      } catch (err) {
        console.error("Verifikasi error:", err);

        setErrorMsg(
          "Kendala koneksi saat memeriksa data siswa."
        );

        isHandlingScan.current = false;
      } finally {
        setLoadingManual(false);
      }
    },
    [
      findStudent,
      navigate,
      normalizeNis,
      showAlert,
      stopMediaStream,
    ]
  );

  // =========================================================
  // QR TERDETEKSI
  // =========================================================
  const handleDetectedQR = useCallback(
    async (decodedText) => {
      if (isHandlingScan.current) return;

      const cleanData = normalizeNis(decodedText);

      if (!cleanData) return;

      // Lock SEBELUM melakukan proses apa pun
      isHandlingScan.current = true;

      setScanResult(cleanData);
      setErrorMsg("");

      // Hentikan kamera segera setelah QR ditemukan
      stopMediaStream();

      await verifyStudentData(cleanData);
    },
    [
      normalizeNis,
      stopMediaStream,
      verifyStudentData,
    ]
  );

  // =========================================================
  // LOOP SCAN QR YANG STABIL
  // =========================================================
  const startBarcodeDetection = useCallback(
    (sessionId) => {
      if (!("BarcodeDetector" in window)) {
        console.warn(
          "BarcodeDetector tidak tersedia di browser ini."
        );
        return;
      }

      const barcodeDetector =
        new window.BarcodeDetector({
          formats: ["qr_code"],
        });

      const scanLoop = async () => {
        // Jangan lanjut kalau sesi kamera sudah berubah
        if (sessionId !== cameraSessionRef.current) {
          return;
        }

        // Jangan lanjut kalau kamera sudah dihentikan
        if (!streamRef.current) {
          return;
        }

        const video = videoRef.current;

        if (!video) {
          scanAnimationRef.current =
            requestAnimationFrame(scanLoop);
          return;
        }

        // Pastikan video sudah benar-benar siap
        if (
          video.readyState >=
          HTMLMediaElement.HAVE_ENOUGH_DATA
        ) {
          // Jangan jalankan detect kedua sebelum detect pertama selesai
          if (!detectingRef.current) {
            detectingRef.current = true;

            try {
              const barcodes =
                await barcodeDetector.detect(video);

              if (
                sessionId === cameraSessionRef.current &&
                !isHandlingScan.current &&
                barcodes.length > 0
              ) {
                const rawValue =
                  barcodes[0]?.rawValue;

                if (rawValue) {
                  await handleDetectedQR(rawValue);
                  return;
                }
              }
            } catch (err) {
              // BarcodeDetector kadang gagal satu frame.
              // Tidak perlu mematikan kamera.
              console.debug(
                "QR detect frame error:",
                err
              );
            } finally {
              detectingRef.current = false;
            }
          }
        }

        if (
          sessionId === cameraSessionRef.current &&
          streamRef.current &&
          !isHandlingScan.current
        ) {
          scanAnimationRef.current =
            requestAnimationFrame(scanLoop);
        }
      };

      scanAnimationRef.current =
        requestAnimationFrame(scanLoop);
    },
    [handleDetectedQR]
  );

  // =========================================================
  // START CAMERA
  // =========================================================
  const startCameraStream = useCallback(
    async (mode) => {
      // Buat sesi baru
      const sessionId =
        cameraSessionRef.current + 1;

      cameraSessionRef.current = sessionId;

      // Stop stream sebelumnya
      stopMediaStream();

      setCameraLoading(true);
      setErrorMsg("");

      try {
        if (
          !navigator.mediaDevices ||
          !navigator.mediaDevices.getUserMedia
        ) {
          throw new Error(
            "Browser tidak mendukung kamera."
          );
        }

        // Jangan menggunakan { exact: mode }
        // karena beberapa HP akan gagal/restart kamera.
        const constraints = {
          video: {
            facingMode: {
              ideal: mode || "environment",
            },
            width: {
              ideal: 640,
            },
            height: {
              ideal: 480,
            },
            frameRate: {
              ideal: 24,
              max: 30,
            },
          },
          audio: false,
        };

        const stream =
          await navigator.mediaDevices.getUserMedia(
            constraints
          );

        // Jika request ini sudah bukan sesi terbaru,
        // jangan pasang stream ke video.
        if (
          sessionId !== cameraSessionRef.current
        ) {
          stream
            .getTracks()
            .forEach((track) => track.stop());

          return;
        }

        streamRef.current = stream;

        const video = videoRef.current;

        if (!video) {
          stream
            .getTracks()
            .forEach((track) => track.stop());

          streamRef.current = null;
          return;
        }

        // Pasang stream SEKALI
        video.srcObject = stream;

        video.setAttribute(
          "playsinline",
          "true"
        );

        video.setAttribute(
          "webkit-playsinline",
          "true"
        );

        video.muted = true;

        try {
          await video.play();
        } catch (playError) {
          console.warn(
            "Video play ditunda:",
            playError
          );
        }

        // Pastikan sesi masih sama
        if (
          sessionId !== cameraSessionRef.current
        ) {
          return;
        }

        setCameraLoading(false);

        // Mulai detector setelah video aktif
        startBarcodeDetection(sessionId);
      } catch (err) {
        console.error(
          "Kamera error:",
          err
        );

        // Jangan tampilkan error kalau request
        // memang sudah digantikan sesi baru.
        if (
          sessionId !== cameraSessionRef.current
        ) {
          return;
        }

        setCameraLoading(false);

        setErrorMsg(
          "Kamera tidak dapat dibuka. Pastikan izin kamera sudah diberikan pada browser."
        );
      }
    },
    [startBarcodeDetection, stopMediaStream]
  );

  // =========================================================
  // INIT CAMERA
  // =========================================================
  useEffect(() => {
    let mounted = true;

    isHandlingScan.current = false;
    currentModeRef.current = "environment";

    if (mounted) {
      startCameraStream("environment");
    }

    return () => {
      mounted = false;

      // Invalidasi sesi kamera
      cameraSessionRef.current += 1;

      stopMediaStream();
    };
  }, [startCameraStream, stopMediaStream]);

  // =========================================================
  // FLIP CAMERA
  // =========================================================
  const handleFlipCamera = useCallback(() => {
    if (
      cameraLoading ||
      loadingManual ||
      isHandlingScan.current
    ) {
      return;
    }

    const nextMode =
      currentModeRef.current === "environment"
        ? "user"
        : "environment";

    currentModeRef.current = nextMode;

    startCameraStream(nextMode);
  }, [
    cameraLoading,
    loadingManual,
    startCameraStream,
  ]);

  // =========================================================
  // UPLOAD QR IMAGE
  // =========================================================
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];

    e.target.value = "";

    if (!file) return;

    try {
      setLoadingManual(true);
      setErrorMsg("");

      if ("BarcodeDetector" in window) {
        const barcodeDetector =
          new window.BarcodeDetector({
            formats: ["qr_code"],
          });

        const img =
          await createImageBitmap(file);

        const barcodes =
          await barcodeDetector.detect(img);

        img.close?.();

        if (
          barcodes.length > 0 &&
          barcodes[0]?.rawValue
        ) {
          await handleDetectedQR(
            barcodes[0].rawValue
          );

          return;
        }
      }

      setErrorMsg(
        "Tidak dapat membaca QR Code dari gambar. Coba scan langsung dengan kamera atau ketik NIS."
      );
    } catch (err) {
      console.error(
        "Gagal baca gambar QR:",
        err
      );

      setErrorMsg(
        "Format gambar QR tidak terbaca."
      );
    } finally {
      setLoadingManual(false);
    }
  };

  // =========================================================
  // INPUT NIS MANUAL
  // =========================================================
  const handleManualSubmit = async (e) => {
    e.preventDefault();

    if (
      loadingManual ||
      isHandlingScan.current
    ) {
      return;
    }

    const nis = normalizeNis(manualNis);

    if (!nis) {
      setErrorMsg(
        "Silakan masukkan NIS siswa."
      );

      return;
    }

    isHandlingScan.current = true;

    stopMediaStream();

    await verifyStudentData(nis);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>
          Scan QR Code Siswa
        </h2>

        <p style={styles.desc}>
          Arahkan QR Code Kartu Siswa ke dalam
          kotak kamera.
        </p>

        {/* AREA KAMERA */}
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
            <div style={styles.cameraStatus}>
              Membuka kamera...
            </div>
          )}

          <button
            type="button"
            style={styles.flipBtn}
            onClick={handleFlipCamera}
            disabled={
              cameraLoading ||
              loadingManual ||
              isHandlingScan.current
            }
            title="Putar Kamera"
          >
            🔄
          </button>
        </div>

        {/* UPLOAD QR */}
        <label
          htmlFor="qr-file-input"
          style={styles.uploadBtnLabel}
        >
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
            QR Code Terdeteksi:{" "}
            <strong>{scanResult}</strong>
          </div>
        )}

        {errorMsg && (
          <div style={styles.errorBox}>
            {errorMsg}
          </div>
        )}

        {/* INPUT NIS */}
        <div style={styles.divider}>
          <div style={styles.dividerLine} />

          <span style={{ padding: "0 10px" }}>
            ATAU MASUKKAN NIS
          </span>

          <div style={styles.dividerLine} />
        </div>

        <form onSubmit={handleManualSubmit}>
          <input
            type="text"
            placeholder="Ketik NIS Siswa di sini..."
            value={manualNis}
            onChange={(e) =>
              setManualNis(e.target.value)
            }
            style={styles.inputManual}
            inputMode="numeric"
            autoComplete="off"
            disabled={loadingManual}
          />

          <button
            type="submit"
            style={styles.submitBtn(
              loadingManual
            )}
            disabled={loadingManual}
          >
            {loadingManual
              ? "MEMERIKSA..."
              : "MASUK DENGAN NIS"}
          </button>
        </form>

        <button
          type="button"
          style={styles.backBtn}
          onClick={() =>
            navigate("/login-siswa")
          }
          disabled={loadingManual}
        >
          Kembali ke Login
        </button>
      </div>

      {/* POP-UP */}
      {alertConfig.isOpen && (
        <div
          style={styles.modalOverlay}
          role="presentation"
        >
          <div
            style={styles.modalCard}
            role="dialog"
            aria-modal="true"
          >
            <div
              style={styles.alertIconWrapper(
                alertConfig.type
              )}
            >
              {alertConfig.type === "success"
                ? "✓"
                : alertConfig.type === "error"
                ? "✕"
                : "ℹ"}
            </div>

            <h3
              style={{
                ...styles.modalTitle,
                color:
                  alertConfig.type ===
                  "success"
                    ? "#1B5E20"
                    : alertConfig.type ===
                      "error"
                    ? "#C62828"
                    : "#E65100",
              }}
            >
              {alertConfig.title}
            </h3>

            <p style={styles.modalText}>
              {alertConfig.message}
            </p>

            <button
              type="button"
              style={styles.alertBtn(
                alertConfig.type
              )}
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