import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  Html5Qrcode,
} from "html5-qrcode";

import {
  ref,
  get,
  query,
  orderByChild,
  equalTo,
} from "firebase/database";

import { db } from "../firebase";

// ======================================================
// STYLE
// ======================================================

const styles = {
  page: {
    minHeight: "100dvh",
    background: "#F4FBEE",
    fontFamily:
      "'Segoe UI', Roboto, sans-serif",
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
    boxShadow:
      "0 10px 25px rgba(0,0,0,0.08)",
    border:
      "2px solid #C8E6C9",
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
    minHeight: "280px",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
  },

  scannerContainer: {
    width: "100%",
    minHeight: "274px",
    position: "relative",
  },

  flipBtn: {
    position: "absolute",
    bottom: "12px",
    right: "12px",
    width: "46px",
    height: "46px",
    background: "#FFEB3B",
    color: "#1B5E20",
    border:
      "2px solid #2E7D32",
    borderRadius: "12px",
    fontSize: "22px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow:
      "0 4px 10px rgba(0,0,0,0.3)",
    zIndex: 20,
  },

  cameraStatus: {
    color: "#fff",
    background:
      "rgba(0,0,0,0.65)",
    borderRadius: "10px",
    padding: "10px 14px",
    fontSize: "13px",
    fontWeight: "600",
    position: "absolute",
    left: "50%",
    top: "50%",
    transform:
      "translate(-50%, -50%)",
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
    boxShadow:
      "0 4px 0 #1B5E20",
    textTransform: "uppercase",
    boxSizing: "border-box",
    margin: "15px 0",
    border:
      "2px solid #A5D6A7",
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
    border:
      "1px solid #C8E6C9",
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
    border:
      "1px solid #FFCDD2",
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
    border:
      "2px solid #C8E6C9",
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
    background: loading
      ? "#FFE082"
      : "#FFEB3B",
    color: "#1B5E20",
    border: "none",
    borderRadius: "12px",
    fontWeight: "800",
    fontSize: "13px",
    cursor: loading
      ? "not-allowed"
      : "pointer",
    boxShadow:
      "0 3px 0 #FBC02D",
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
    boxShadow:
      "0 3px 0 #9E9E9E",
    textTransform: "uppercase",
  },

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      "rgba(0,0,0,0.6)",
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
    boxShadow:
      "0 8px 24px rgba(0,0,0,0.15)",
    border:
      "2px solid #C8E6C9",
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

    color:
      type === "warning"
        ? "#1B5E20"
        : "#fff",

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

// ======================================================
// SCAN QR
// ======================================================

function ScanQR() {
  const navigate =
    useNavigate();

  // ====================================================
  // STATE
  // ====================================================

  const [
    scanResult,
    setScanResult,
  ] = useState(null);

  const [
    errorMsg,
    setErrorMsg,
  ] = useState("");

  const [
    manualNis,
    setManualNis,
  ] = useState("");

  const [
    loadingManual,
    setLoadingManual,
  ] = useState(false);

  const [
    cameraLoading,
    setCameraLoading,
  ] = useState(true);

  const [
    cameras,
    setCameras,
  ] = useState([]);

  const [
    currentCameraIndex,
    setCurrentCameraIndex,
  ] = useState(0);

  const [
    alertConfig,
    setAlertConfig,
  ] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
    onCloseCallback: null,
  });

  // ====================================================
  // REFS
  // ====================================================

  const scannerRef =
    useRef(null);

  const mountedRef =
    useRef(false);

  const startingRef =
    useRef(false);

  const stoppingRef =
    useRef(false);

  const scanHandledRef =
    useRef(false);

  const loginProcessingRef =
    useRef(false);

  // ====================================================
  // ALERT
  // ====================================================

  const showAlert =
    useCallback(
      (
        type,
        title,
        message,
        onCloseCallback = null
      ) => {
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

  // ====================================================
  // CLOSE ALERT
  // ====================================================

  const handleCloseAlert =
    useCallback(() => {
      const callback =
        alertConfig.onCloseCallback;

      setAlertConfig(
        (prev) => ({
          ...prev,
          isOpen: false,
          onCloseCallback:
            null,
        })
      );

      if (callback) {
        callback();
      }
    }, [
      alertConfig.onCloseCallback,
    ]);

  // ====================================================
  // NORMALIZE NIS
  // ====================================================

  const normalizeNis =
    useCallback(
      (value) => {
        return String(
          value || ""
        ).trim();
      },
      []
    );

  // ====================================================
  // SAVE STUDENT SESSION
  // ====================================================

  const saveStudentSession =
    useCallback(
      (student) => {
        const nama =
          String(
            student?.nama ||
              ""
          ).trim();

        const nis =
          String(
            student?.nis ||
              ""
          ).trim();

        const kelas =
          String(
            student?.kelas ||
              ""
          ).trim();

        // ----------------------------------------------
        // HAPUS SESI LAMA
        // ----------------------------------------------

        localStorage.removeItem(
          "namaSiswa"
        );

        localStorage.removeItem(
          "nisSiswa"
        );

        localStorage.removeItem(
          "kelasSiswa"
        );

        // ----------------------------------------------
        // SIMPAN SESI BARU
        // ----------------------------------------------

        localStorage.setItem(
          "namaSiswa",
          nama
        );

        localStorage.setItem(
          "nisSiswa",
          nis
        );

        localStorage.setItem(
          "kelasSiswa",
          kelas
        );

        return {
          nama,
          nis,
          kelas,
        };
      },
      []
    );

  // ====================================================
  // STOP SCANNER
  // ====================================================

  const stopScanner =
    useCallback(
      async (
        clear = false
      ) => {
        const scanner =
          scannerRef.current;

        if (!scanner) {
          return;
        }

        if (
          stoppingRef.current
        ) {
          return;
        }

        stoppingRef.current =
          true;

        try {
          if (
            scanner.isScanning
          ) {
            await scanner.stop();
          }
        } catch (error) {
          console.warn(
            "Scanner sudah berhenti:",
            error
          );
        }

        if (clear) {
          try {
            scanner.clear();
          } catch (error) {
            console.warn(
              "Gagal clear scanner:",
              error
            );
          }
        }

        stoppingRef.current =
          false;
      },
      []
    );

  // ====================================================
  // CARI SISWA
  // ====================================================

  const findStudent =
    useCallback(
      async (nis) => {
        const siswaRef =
          ref(
            db,
            "siswa"
          );

        // ==============================================
        // PRIORITAS 1
        //
        // siswa/{firebaseKey}/nis
        // ==============================================

        try {
          const siswaQuery =
            query(
              siswaRef,
              orderByChild(
                "nis"
              ),
              equalTo(
                nis
              )
            );

          const snapshot =
            await get(
              siswaQuery
            );

          if (
            snapshot.exists()
          ) {
            const data =
              snapshot.val();

            const entries =
              Object.entries(
                data
              );

            if (
              entries.length >
              0
            ) {
              return entries[0];
            }
          }
        } catch (error) {
          console.warn(
            "Pencarian berdasarkan field nis gagal:",
            error
          );
        }

        // ==============================================
        // PRIORITAS 2
        //
        // Untuk struktur lama:
        //
        // siswa/{NIS}
        // ==============================================

        try {
          const snapshot =
            await get(
              siswaRef
            );

          if (
            !snapshot.exists()
          ) {
            return null;
          }

          const data =
            snapshot.val();

          const found =
            Object.entries(
              data
            ).find(
              ([
                key,
                value,
              ]) => {
                const dbNis =
                  normalizeNis(
                    value?.nis
                  );

                return (
                  dbNis ===
                    nis ||
                  String(
                    key
                  ).trim() ===
                    nis
                );
              }
            );

          return found ||
            null;
        } catch (error) {
          console.error(
            "Fallback pencarian siswa gagal:",
            error
          );

          throw error;
        }
      },
      [normalizeNis]
    );

  // ====================================================
  // VERIFIKASI SISWA
  // ====================================================

  const verifyStudentData =
    useCallback(
      async (qrData) => {
        if (
          loginProcessingRef.current
        ) {
          return;
        }

        const cleanNis =
          normalizeNis(
            qrData
          );

        if (!cleanNis) {
          setErrorMsg(
            "QR Code / NIS tidak valid."
          );

          scanHandledRef.current =
            false;

          return;
        }

        if (
          !mountedRef.current
        ) {
          return;
        }

        loginProcessingRef.current =
          true;

        setErrorMsg("");
        setLoadingManual(true);

        try {
          // ==========================================
          // CARI SISWA
          // ==========================================

          const studentEntry =
            await findStudent(
              cleanNis
            );

          // ==========================================
          // TIDAK DITEMUKAN
          // ==========================================

          if (
            !studentEntry
          ) {
            if (
              mountedRef.current
            ) {
              setErrorMsg(
                "QR Code atau NIS tidak terdaftar di sistem sekolah."
              );
            }

            scanHandledRef.current =
              false;

            return;
          }

          const [
            studentId,
            studentData,
          ] =
            studentEntry;

          // ==========================================
          // DATA DATABASE
          // ==========================================

          const nama =
            String(
              studentData?.nama ||
                ""
            ).trim();

          const nisDatabase =
            normalizeNis(
              studentData?.nis
            );

          const kelas =
            String(
              studentData?.kelas ||
                ""
            ).trim();

          // ==========================================
          // NIS FINAL
          //
          // Field nis menjadi prioritas.
          // ==========================================

          const nisFinal =
            nisDatabase ||
            String(
              studentId
            ).trim();

          // ==========================================
          // VALIDASI
          // ==========================================

          if (!nama) {
            showAlert(
              "error",
              "Data Siswa Tidak Lengkap",
              "Nama siswa belum tersedia di database. Silakan hubungi admin."
            );

            return;
          }

          if (!nisFinal) {
            showAlert(
              "error",
              "NIS Tidak Ditemukan",
              "NIS siswa tidak tersedia di database."
            );

            return;
          }

          // ==========================================
          // PENTING:
          //
          // QR harus cocok dengan NIS siswa.
          // ==========================================

          const nisCocok =
            nisFinal ===
              cleanNis ||
            String(
              studentId
            ).trim() ===
              cleanNis;

          if (!nisCocok) {
            showAlert(
              "error",
              "QR Tidak Cocok",
              "QR Code terbaca, tetapi NIS di dalam QR tidak cocok dengan data siswa."
            );

            return;
          }

          // ==========================================
          // SIMPAN SESI
          // ==========================================

          const session =
            saveStudentSession({
              nama,
              nis:
                nisFinal,
              kelas,
            });

          // ==========================================
          // VERIFIKASI LOCAL STORAGE
          // ==========================================

          const savedNama =
            localStorage.getItem(
              "namaSiswa"
            );

          const savedNis =
            localStorage.getItem(
              "nisSiswa"
            );

          const savedKelas =
            localStorage.getItem(
              "kelasSiswa"
            );

          if (
            savedNama !==
              session.nama ||
            savedNis !==
              session.nis ||
            savedKelas !==
              session.kelas
          ) {
            throw new Error(
              "Gagal menyimpan sesi siswa."
            );
          }

          // ==========================================
          // SUKSES
          // ==========================================

          if (
            mountedRef.current
          ) {
            setScanResult(
              nisFinal
            );

            setErrorMsg("");
          }

          showAlert(
            "success",
            "Login Berhasil!",
            `Selamat datang, ${nama}! Kamu berhasil masuk ke sistem pengaduan.`,
            () => {
              navigate(
                "/dashboard-siswa",
                {
                  replace:
                    true,
                }
              );
            }
          );
        } catch (error) {
          console.error(
            "Gagal verifikasi siswa:",
            error
          );

          if (
            mountedRef.current
          ) {
            setErrorMsg(
              error?.message ||
                "Terjadi kendala koneksi saat memverifikasi data siswa."
            );

            scanHandledRef.current =
              false;
          }
        } finally {
          loginProcessingRef.current =
            false;

          if (
            mountedRef.current
          ) {
            setLoadingManual(
              false
            );
          }
        }
      },
      [
        findStudent,
        navigate,
        normalizeNis,
        saveStudentSession,
        showAlert,
      ]
    );

  // ====================================================
  // QR BERHASIL DIBACA
  // ====================================================

  const handleSuccessScan =
    useCallback(
      async (
        decodedText
      ) => {
        if (
          scanHandledRef.current ||
          loginProcessingRef.current
        ) {
          return;
        }

        const cleanData =
          normalizeNis(
            decodedText
          );

        if (!cleanData) {
          return;
        }

        // ----------------------------------------------
        // LOCK
        // ----------------------------------------------

        scanHandledRef.current =
          true;

        setScanResult(
          cleanData
        );

        setErrorMsg("");

        // ----------------------------------------------
        // STOP CAMERA
        // ----------------------------------------------

        await stopScanner(
          false
        );

        if (
          !mountedRef.current
        ) {
          return;
        }

        // ----------------------------------------------
        // VERIFIKASI
        // ----------------------------------------------

        await verifyStudentData(
          cleanData
        );
      },
      [
        normalizeNis,
        stopScanner,
        verifyStudentData,
      ]
    );

  // ====================================================
  // START SCANNER
  // ====================================================

  const startScanner =
    useCallback(
      async (
        cameraConfig
      ) => {
        const scanner =
          scannerRef.current;

        if (
          !scanner ||
          !mountedRef.current
        ) {
          return false;
        }

        if (
          startingRef.current ||
          stoppingRef.current
        ) {
          return false;
        }

        startingRef.current =
          true;

        scanHandledRef.current =
          false;

        try {
          // ==========================================
          // PASTIKAN BERHENTI
          // ==========================================

          if (
            scanner.isScanning
          ) {
            await scanner.stop();
          }

          if (
            !mountedRef.current
          ) {
            return false;
          }

          // ==========================================
          // START
          // ==========================================

          await scanner.start(
            cameraConfig,
            {
              fps: 8,

              qrbox: {
                width: 220,
                height: 220,
              },

              aspectRatio:
                1.0,

              disableFlip:
                false,

              experimentalFeatures:
                {
                  useBarCodeDetectorIfSupported:
                    true,
                },
            },

            async (
              decodedText
            ) => {
              await handleSuccessScan(
                decodedText
              );
            },

            () => {
              // Jangan menampilkan error
              // setiap frame.
            }
          );

          if (
            mountedRef.current
          ) {
            setCameraLoading(
              false
            );

            setErrorMsg("");
          }

          return true;
        } catch (error) {
          console.error(
            "Gagal menjalankan kamera:",
            error
          );

          if (
            mountedRef.current
          ) {
            setCameraLoading(
              false
            );

            setErrorMsg(
              "Kamera tidak dapat diakses. Pastikan izin kamera diberikan dan website dibuka menggunakan HTTPS."
            );
          }

          return false;
        } finally {
          startingRef.current =
            false;
        }
      },
      [handleSuccessScan]
    );

  // ====================================================
  // INITIALIZE SCANNER
  // ====================================================

  useEffect(() => {
    mountedRef.current =
      true;

    let cancelled =
      false;

    const initializeScanner =
      async () => {
        try {
          setCameraLoading(
            true
          );

          setErrorMsg("");

          // ==========================================
          // BUAT SCANNER SATU KALI
          // ==========================================

          if (
            !scannerRef.current
          ) {
            scannerRef.current =
              new Html5Qrcode(
                "reader-canvas",
                {
                  verbose:
                    false,
                }
              );
          }

          if (
            cancelled ||
            !mountedRef.current
          ) {
            return;
          }

          // ==========================================
          // CARI KAMERA
          // ==========================================

          let devices =
            [];

          try {
            devices =
              await Html5Qrcode.getCameras();
          } catch (error) {
            console.warn(
              "Tidak dapat mengambil kamera:",
              error
            );
          }

          if (
            cancelled ||
            !mountedRef.current
          ) {
            return;
          }

          // ==========================================
          // KAMERA DITEMUKAN
          // ==========================================

          if (
            Array.isArray(
              devices
            ) &&
            devices.length > 0
          ) {
            setCameras(
              devices
            );

            // ----------------------------------------
            // CARI KAMERA BELAKANG
            // ----------------------------------------

            let defaultIndex =
              devices.findIndex(
                (device) => {
                  const label =
                    String(
                      device?.label ||
                        ""
                    ).toLowerCase();

                  return (
                    label.includes(
                      "back"
                    ) ||
                    label.includes(
                      "rear"
                    ) ||
                    label.includes(
                      "environment"
                    ) ||
                    label.includes(
                      "belakang"
                    )
                  );
                }
              );

            // ----------------------------------------
            // Kalau tidak ada, gunakan kamera terakhir
            // ----------------------------------------

            if (
              defaultIndex <
              0
            ) {
              defaultIndex =
                devices.length -
                1;
            }

            setCurrentCameraIndex(
              defaultIndex
            );

            const started =
              await startScanner(
                devices[
                  defaultIndex
                ].id
              );

            // ----------------------------------------
            // FALLBACK
            // ----------------------------------------

            if (
              !started &&
              mountedRef.current
            ) {
              await startScanner(
                {
                  facingMode:
                    "environment",
                }
              );
            }

            return;
          }

          // ==========================================
          // FALLBACK TANPA DAFTAR KAMERA
          // ==========================================

          await startScanner(
            {
              facingMode:
                "environment",
            }
          );
        } catch (error) {
          console.error(
            "Gagal inisialisasi scanner:",
            error
          );

          if (
            mountedRef.current
          ) {
            setCameraLoading(
              false
            );

            setErrorMsg(
              "Kamera tidak dapat digunakan. Silakan izinkan akses kamera pada browser."
            );
          }
        }
      };

    initializeScanner();

    // ==================================================
    // CLEANUP
    // ==================================================

    return () => {
      cancelled = true;

      mountedRef.current =
        false;

      scanHandledRef.current =
        true;

      startingRef.current =
        false;

      const scanner =
        scannerRef.current;

      scannerRef.current =
        null;

      if (scanner) {
        const cleanup =
          async () => {
            try {
              if (
                scanner.isScanning
              ) {
                await scanner.stop();
              }
            } catch (error) {
              console.warn(
                "Gagal stop scanner:",
                error
              );
            }

            try {
              scanner.clear();
            } catch (error) {
              console.warn(
                "Gagal clear scanner:",
                error
              );
            }
          };

        cleanup();
      }
    };
  }, [startScanner]);

  // ====================================================
  // FLIP CAMERA
  // ====================================================

  const handleFlipCamera =
    async () => {
      if (
        cameras.length <
        2
      ) {
        showAlert(
          "warning",
          "Kamera Tunggal",
          "Hanya satu kamera yang terdeteksi pada perangkat ini."
        );

        return;
      }

      if (
        startingRef.current ||
        stoppingRef.current ||
        loginProcessingRef.current
      ) {
        return;
      }

      const nextIndex =
        (currentCameraIndex +
          1) %
        cameras.length;

      setCurrentCameraIndex(
        nextIndex
      );

      setCameraLoading(
        true
      );

      setErrorMsg("");

      await stopScanner(
        false
      );

      if (
        !mountedRef.current
      ) {
        return;
      }

      await startScanner(
        cameras[nextIndex].id
      );
    };

  // ====================================================
  // UPLOAD QR IMAGE
  // ====================================================

  const handleFileUpload =
    async (e) => {
      const file =
        e.target.files?.[0];

      // ================================================
      // RESET INPUT
      // ================================================

      e.target.value = "";

      if (
        !file ||
        !scannerRef.current
      ) {
        return;
      }

      // ================================================
      // VALIDASI FILE
      // ================================================

      if (
        !file.type.startsWith(
          "image/"
        )
      ) {
        setErrorMsg(
          "File yang dipilih bukan gambar."
        );

        return;
      }

      if (
        file.size >
        10 * 1024 * 1024
      ) {
        setErrorMsg(
          "Ukuran gambar terlalu besar. Maksimal 10 MB."
        );

        return;
      }

      const scanner =
        scannerRef.current;

      try {
        setErrorMsg("");

        setCameraLoading(
          true
        );

        scanHandledRef.current =
          true;

        // ==========================================
        // STOP CAMERA
        // ==========================================

        await stopScanner(
          false
        );

        // ==========================================
        // BACA QR DARI FILE
        // ==========================================

        const decodedText =
          await scanner.scanFile(
            file,
            true
          );

        if (
          !mountedRef.current
        ) {
          return;
        }

        const cleanData =
          normalizeNis(
            decodedText
          );

        if (!cleanData) {
          throw new Error(
            "QR kosong"
          );
        }

        setScanResult(
          cleanData
        );

        setErrorMsg("");

        // ==========================================
        // VERIFIKASI
        // ==========================================

        await verifyStudentData(
          cleanData
        );
      } catch (error) {
        console.error(
          "Gagal membaca file QR:",
          error
        );

        if (
          !mountedRef.current
        ) {
          return;
        }

        setErrorMsg(
          "QR Code tidak dapat dibaca dari gambar. Pastikan QR jelas, tidak buram, tidak terpotong, dan memiliki kontras yang cukup."
        );

        scanHandledRef.current =
          false;

        setCameraLoading(
          false
        );

        // ==========================================
        // HIDUPKAN KAMERA KEMBALI
        // ==========================================

        if (
          cameras.length > 0
        ) {
          await startScanner(
            cameras[
              currentCameraIndex
            ].id
          );
        } else {
          await startScanner(
            {
              facingMode:
                "environment",
            }
          );
        }
      }
    };

  // ====================================================
  // MANUAL NIS
  // ====================================================

  const handleManualSubmit =
    async (e) => {
      e.preventDefault();

      if (
        loadingManual ||
        loginProcessingRef.current
      ) {
        return;
      }

      const nis =
        normalizeNis(
          manualNis
        );

      if (!nis) {
        setErrorMsg(
          "Silakan masukkan NIS siswa."
        );

        return;
      }

      setLoadingManual(
        true
      );

      scanHandledRef.current =
        true;

      await stopScanner(
        false
      );

      await verifyStudentData(
        nis
      );
    };

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div
      style={
        styles.page
      }
    >
      <div
        style={
          styles.card
        }
      >

        {/* ==========================================
            TITLE
        =========================================== */}

        <h2
          style={
            styles.title
          }
        >
          Scan QR Code Siswa
        </h2>

        <p
          style={
            styles.desc
          }
        >
          Arahkan QR Code Kartu
          Siswa ke dalam kotak
          kamera.
        </p>

        {/* ==========================================
            CAMERA
        =========================================== */}

        <div
          style={
            styles.scannerWrapper
          }
        >
          <div
            id="reader-canvas"
            style={
              styles.scannerContainer
            }
          />

          {cameraLoading && (
            <div
              style={
                styles.cameraStatus
              }
            >
              Membuka kamera...
            </div>
          )}

          {cameras.length >
            1 && (
            <button
              type="button"
              style={
                styles.flipBtn
              }
              onClick={
                handleFlipCamera
              }
              disabled={
                cameraLoading ||
                loadingManual
              }
              title="Putar Kamera"
              aria-label="Putar kamera"
            >
              🔄
            </button>
          )}
        </div>

        {/* ==========================================
            UPLOAD QR
        =========================================== */}

        <label
          htmlFor="qr-file-input"
          style={
            styles.uploadBtnLabel
          }
        >
          🖼️ UNGGAH GAMBAR QR CODE
        </label>

        <input
          id="qr-file-input"
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          onChange={
            handleFileUpload
          }
          style={
            styles.hiddenFileInput
          }
          disabled={
            loadingManual
          }
        />

        {/* ==========================================
            HASIL SCAN
        =========================================== */}

        {scanResult && (
          <div
            style={
              styles.successBox
            }
          >
            QR Code Terdeteksi:{" "}
            <strong>
              {scanResult}
            </strong>
          </div>
        )}

        {/* ==========================================
            ERROR
        =========================================== */}

        {errorMsg && (
          <div
            style={
              styles.errorBox
            }
          >
            {errorMsg}
          </div>
        )}

        {/* ==========================================
            MANUAL NIS
        =========================================== */}

        <div
          style={
            styles.divider
          }
        >
          <div
            style={
              styles.dividerLine
            }
          />

          <span
            style={{
              padding:
                "0 10px",
            }}
          >
            ATAU MASUKKAN NIS
          </span>

          <div
            style={
              styles.dividerLine
            }
          />
        </div>

        <form
          onSubmit={
            handleManualSubmit
          }
        >
          <input
            type="text"
            placeholder="Ketik NIS Siswa di sini..."
            value={
              manualNis
            }
            onChange={(e) =>
              setManualNis(
                e.target.value
              )
            }
            style={
              styles.inputManual
            }
            inputMode="numeric"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            disabled={
              loadingManual
            }
          />

          <button
            type="submit"
            style={
              styles.submitBtn(
                loadingManual
              )
            }
            disabled={
              loadingManual
            }
          >
            {loadingManual
              ? "MEMERIKSA..."
              : "MASUK DENGAN NIS"}
          </button>
        </form>

        {/* ==========================================
            KEMBALI
        =========================================== */}

        <button
          type="button"
          style={
            styles.backBtn
          }
          onClick={() =>
            navigate(
              "/login-siswa"
            )
          }
          disabled={
            loadingManual
          }
        >
          Kembali ke Login
        </button>
      </div>

      {/* ==============================================
          ALERT
      =============================================== */}

      {alertConfig.isOpen && (
        <div
          style={
            styles.modalOverlay
          }
          role="presentation"
        >
          <div
            style={
              styles.modalCard
            }
            role="dialog"
            aria-modal="true"
            aria-labelledby="scan-alert-title"
          >
            <div
              style={
                styles.alertIconWrapper(
                  alertConfig.type
                )
              }
            >
              {alertConfig.type ===
              "success"
                ? "✓"
                : alertConfig.type ===
                  "error"
                ? "✕"
                : "ℹ"}
            </div>

            <h3
              id="scan-alert-title"
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
              {
                alertConfig.title
              }
            </h3>

            <p
              style={
                styles.modalText
              }
            >
              {
                alertConfig.message
              }
            </p>

            <button
              type="button"
              style={
                styles.alertBtn(
                  alertConfig.type
                )
              }
              onClick={
                handleCloseAlert
              }
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