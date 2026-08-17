import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  ref as dbRef,
  push,
} from "firebase/database";

import { db } from "../firebase";

// ======================================================
// STYLE
// ======================================================

const styles = {
  page: {
    minHeight: "100dvh",
    background: "#F4FBEE",
    padding: "16px 12px 40px",
    fontFamily:
      "'Segoe UI', Roboto, sans-serif",
    boxSizing: "border-box",
  },

  header: {
    background: "#2E7D32",
    color: "#fff",
    padding: "20px 18px",
    borderRadius: "18px",
    marginBottom: "14px",
    textAlign: "center",
    boxShadow:
      "0 4px 12px rgba(0,0,0,0.06)",
  },

  title: {
    fontSize: "22px",
    fontWeight: "800",
    margin: "0 0 6px 0",
  },

  subtitle: {
    fontSize: "14px",
    lineHeight: "1.5",
    margin: 0,
  },

  hotlineBox: {
    background: "#FFFDE7",
    border: "1.5px solid #FFF59D",
    borderRadius: "14px",
    padding: "12px 14px",
    maxWidth: "750px",
    margin: "0 auto 14px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
  },

  hotlineText: {
    color: "#1B5E20",
    fontSize: "13px",
    lineHeight: "1.4",
    flex: 1,
  },

  hotlineBtn: {
    background: "#25D366",
    color: "#fff",
    padding: "8px 14px",
    borderRadius: "10px",
    textDecoration: "none",
    fontWeight: "700",
    fontSize: "13px",
  },

  container: {
    background: "#fff",
    maxWidth: "750px",
    margin: "0 auto",
    padding: "20px 16px",
    borderRadius: "18px",
    boxShadow:
      "0 4px 14px rgba(0,0,0,0.04)",
    border: "1.5px solid #C8E6C9",
    boxSizing: "border-box",
  },

  group: {
    marginBottom: "18px",
  },

  labelRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    marginBottom: "8px",
  },

  label: {
    display: "block",
    fontWeight: "800",
    color: "#1B5E20",
    fontSize: "14px",
    lineHeight: "1.4",
  },

  helperText: {
    fontSize: "12px",
    color: "#667C5E",
    marginTop: "4px",
    lineHeight: "1.4",
  },

  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1.5px solid #C8E6C9",
    fontSize: "16px",
    boxSizing: "border-box",
    outline: "none",
    background: "#FAFAFA",
  },

  readonlyInput: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1.5px solid #C8E6C9",
    fontSize: "16px",
    boxSizing: "border-box",
    background: "#F1F8E9",
    color: "#33691E",
    fontWeight: "700",
  },

  textarea: {
    width: "100%",
    minHeight: "130px",
    padding: "13px 14px",
    borderRadius: "12px",
    border: "1.5px solid #C8E6C9",
    fontSize: "16px",
    resize: "vertical",
    boxSizing: "border-box",
    outline: "none",
    background: "#FAFAFA",
    lineHeight: "1.5",
    fontFamily:
      "'Segoe UI', Roboto, sans-serif",
  },

  selectWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "100%",
  },

  selectEmoji: {
    width: "46px",
    height: "46px",
    flexShrink: 0,
    borderRadius: "13px",
    background: "#E8F5E9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    border: "1.5px solid #C8E6C9",
  },

  childSelect: {
    flex: 1,
    minWidth: 0,
    padding: "12px 13px",
    borderRadius: "12px",
    border: "1.5px solid #C8E6C9",
    background: "#FAFAFA",
    color: "#1B5E20",
    fontSize: "16px",
    fontWeight: "700",
    boxSizing: "border-box",
  },

  speakingButton: {
    border: "none",
    background: "#FFEB3B",
    color: "#1B5E20",
    borderRadius: "11px",
    padding: "8px 10px",
    fontSize: "13px",
    fontWeight: "800",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    flexShrink: 0,
  },

  voiceButton: {
    border: "none",
    background: "#E3F2FD",
    color: "#1565C0",
    borderRadius: "11px",
    padding: "8px 10px",
    fontSize: "13px",
    fontWeight: "800",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    flexShrink: 0,
  },

  listeningButton: {
    border: "none",
    background: "#FFEB3B",
    color: "#1B5E20",
    borderRadius: "11px",
    padding: "8px 10px",
    fontSize: "13px",
    fontWeight: "800",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    flexShrink: 0,
  },

  voiceHelp: {
    background: "#FFFDE7",
    border: "1.5px solid #FFF59D",
    borderRadius: "12px",
    padding: "10px 12px",
    marginTop: "8px",
    fontSize: "12px",
    color: "#5D5D32",
    lineHeight: "1.5",
  },

  childInfoBox: {
    background:
      "linear-gradient(135deg,#E8F5E9,#F1F8E9)",
    border: "1.5px solid #A5D6A7",
    borderRadius: "14px",
    padding: "13px 14px",
    marginBottom: "18px",
    display: "flex",
    gap: "10px",
  },

  gridTwo: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },

  choiceButton: (selected) => ({
    width: "100%",
    padding: "13px 10px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "800",
    fontSize: "14px",
    border: `1.5px solid ${
      selected ? "#2E7D32" : "#E0E0E0"
    }`,
    background: selected
      ? "#E8F5E9"
      : "#FAFAFA",
    color: selected
      ? "#1B5E20"
      : "#444",
    minHeight: "52px",
  }),

  otherInputBox: {
    marginTop: "9px",
    padding: "10px",
    background: "#F1F8E9",
    borderRadius: "12px",
    border: "1.5px dashed #A5D6A7",
  },

  fileBox: {
    background: "#FAFAFA",
    border: "1.5px dashed #A5D6A7",
    borderRadius: "12px",
    padding: "12px",
  },

  antiFitnahBox: {
    background: "#FFFDE7",
    border: "1.5px solid #FFF59D",
    borderRadius: "12px",
    padding: "12px 13px",
    marginBottom: "18px",
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
  },

  btnContainer: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  submitBtn: (disabled) => ({
    flex: "1 1 180px",
    padding: "14px",
    background: disabled
      ? "#A5D6A7"
      : "#2E7D32",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    cursor: disabled
      ? "not-allowed"
      : "pointer",
    fontSize: "14px",
    fontWeight: "800",
  }),

  backBtn: {
    flex: "1 1 180px",
    padding: "14px",
    background: "#FFEB3B",
    color: "#1B5E20",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "800",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: "15px",
  },

  modalCard: {
    background: "#fff",
    padding: "24px 20px",
    borderRadius: "18px",
    maxWidth: "360px",
    width: "100%",
    textAlign: "center",
  },

  modalTitle: {
    fontSize: "18px",
    fontWeight: "800",
    margin: "0 0 8px",
  },

  modalMsg: {
    fontSize: "13px",
    color: "#556B4D",
    lineHeight: "1.5",
    margin: "0 0 18px",
  },

  alertBtn: (type) => ({
    width: "100%",
    padding: "12px",
    border: "none",
    borderRadius: "10px",
    fontWeight: "800",
    cursor: "pointer",
    background:
      type === "success"
        ? "#2E7D32"
        : type === "error"
        ? "#D32F2F"
        : "#FFEB3B",
    color:
      type === "warning"
        ? "#1B5E20"
        : "#fff",
  }),
};

// ======================================================
// COMPONENT
// ======================================================

function FormPengaduan() {
  const navigate = useNavigate();

  // ====================================================
  // CLOUDINARY
  // ====================================================

  const CLOUD_NAME = "r61tomq9";

  const UPLOAD_PRESET = "ml_default";

  const NOMOR_WA_GURU =
    "6281234567890";

  // ====================================================
  // FORM STATE
  // ====================================================

  const [nama, setNama] =
    useState("");

  const [nis, setNis] =
    useState("");

  const [kelas, setKelas] =
    useState("");

  const [peran, setPeran] =
    useState("Korban");

  const [
    namaTemanDilihat,
    setNamaTemanDilihat,
  ] = useState("");

  const [tanggal, setTanggal] =
    useState("");

  const [lokasi, setLokasi] =
    useState("");

  const [
    lokasiLainnya,
    setLokasiLainnya,
  ] = useState("");

  const [jenis, setJenis] =
    useState("");

  const [
    jenisLainnya,
    setJenisLainnya,
  ] = useState("");

  const [cerita, setCerita] =
    useState("");

  const [pelaku, setPelaku] =
    useState("");

  const [saksi, setSaksi] =
    useState("Tidak");

  const [
    namaSaksi,
    setNamaSaksi,
  ] = useState("");

  const [
    kelasSaksi,
    setKelasSaksi,
  ] = useState("");

  const [
    setujuJujur,
    setSetujuJujur,
  ] = useState(false);

  const [foto, setFoto] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [isListening, setIsListening] =
    useState(false);

  // ====================================================
  // ALERT / POPUP
  // ====================================================

  const [alertConfig, setAlertConfig] =
    useState({
      isOpen: false,
      type: "success",
      title: "",
      message: "",
      onClose: null,
    });

  const alertTimerRef =
    useRef(null);

  const submitLockRef =
    useRef(false);

  const closeAlert = useCallback(() => {
    if (alertTimerRef.current) {
      clearTimeout(alertTimerRef.current);
      alertTimerRef.current = null;
    }

    const callback =
      alertConfig.onClose;

    setAlertConfig((prev) => ({
      ...prev,
      isOpen: false,
    }));

    if (typeof callback === "function") {
      callback();
    }
  }, [alertConfig.onClose]);

  const showAlert = useCallback(
    (
      type,
      title,
      message,
      onClose = null
    ) => {
      if (alertTimerRef.current) {
        clearTimeout(alertTimerRef.current);
      }

      setAlertConfig({
        isOpen: true,
        type,
        title,
        message,
        onClose,
      });

      // Popup otomatis tertutup tanpa harus menekan "Mengerti".
      // Beri waktu sedikit lebih lama untuk pesan error/warning.
      const delay =
        type === "success" ? 1600 : 2200;

      alertTimerRef.current =
        setTimeout(() => {
          setAlertConfig((prev) => {
            const callback =
              prev.onClose;

            if (typeof callback === "function") {
              setTimeout(callback, 0);
            }

            return {
              ...prev,
              isOpen: false,
              onClose: null,
            };
          });

          alertTimerRef.current = null;
        }, delay);
    },
    []
  );

  useEffect(() => {
    return () => {
      if (alertTimerRef.current) {
        clearTimeout(alertTimerRef.current);
      }
    };
  }, []);

  const recognitionRef =
    useRef(null);

  // ====================================================
  // SPEECH TO TEXT - BICARA UNTUK ISIAN
  // ====================================================

  const startVoiceInput = useCallback(
    (setValue, currentValue = "") => {
      const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        showAlert(
          "warning",
          "Fitur Bicara Tidak Tersedia",
          "Browser ini belum mendukung fitur bicara. Silakan gunakan Chrome/Edge versi terbaru."
        );
        return;
      }

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.warn(error);
        }
        recognitionRef.current = null;
      }

      try {
        const recognition =
          new SpeechRecognition();

        recognition.lang = "id-ID";
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        setIsListening(true);

        recognition.onresult = (event) => {
          const transcript =
            event.results?.[0]?.[0]?.transcript
              ?.trim() || "";

          if (transcript) {
            const previous =
              String(currentValue || "").trim();

            setValue(
              previous
                ? `${previous} ${transcript}`
                : transcript
            );
          }
        };

        recognition.onerror = (event) => {
          console.warn(
            "Speech recognition:",
            event.error
          );

          setIsListening(false);
          recognitionRef.current = null;

          if (
            event.error === "not-allowed" ||
            event.error === "service-not-allowed"
          ) {
            showAlert(
              "warning",
              "Mikrofon Belum Diizinkan",
              "Izinkan akses mikrofon pada browser agar fitur Bicara dapat digunakan."
            );
          } else if (
            event.error !== "aborted"
          ) {
            showAlert(
              "error",
              "Bicara Tidak Berhasil",
              "Suara belum dapat dikenali. Silakan coba lagi."
            );
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          recognitionRef.current = null;
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (error) {
        console.error(
          "Gagal menjalankan Speech Recognition:",
          error
        );

        setIsListening(false);
        recognitionRef.current = null;

        showAlert(
          "error",
          "Bicara Tidak Berhasil",
          "Fitur bicara tidak dapat dijalankan."
        );
      }
    },
    [showAlert]
  );

  const stopVoiceInput = useCallback(() => {
    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } catch (error) {
      console.warn(error);
    }

    recognitionRef.current = null;
    setIsListening(false);
  }, []);

  useEffect(() => {
    return () => {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      } catch (error) {
        console.warn(error);
      }
    };
  }, []);

  // Tombol mikrofon kecil yang ditempatkan di samping
  // setiap kolom yang dapat diketik.
  const VoiceButton = ({
    value,
    onChange,
    disabled = false,
  }) => (
    <button
      type="button"
      disabled={disabled}
      title={
        isListening
          ? "Sedang mendengarkan..."
          : "Tekan untuk bicara"
      }
      onClick={() => {
        if (isListening) {
          stopVoiceInput();
          return;
        }

        startVoiceInput(
          onChange,
          value
        );
      }}
      style={{
        position: "absolute",
        right: "8px",
        top: "50%",
        transform: "translateY(-50%)",
        width: "34px",
        height: "34px",
        borderRadius: "9px",
        border: "1px solid #A5D6A7",
        background: isListening
          ? "#FFEBEE"
          : "#E8F5E9",
        color: isListening
          ? "#C62828"
          : "#1B5E20",
        fontSize: "16px",
        fontWeight: "800",
        cursor: disabled
          ? "not-allowed"
          : "pointer",
        opacity: disabled ? 0.5 : 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2,
      }}
    >
      {isListening ? "■" : "🎤"}
    </button>
  );

  // ====================================================
  // KOMPRESI GAMBAR
  // ====================================================

  const compressImage =
    (file) => {
      return new Promise(
        (resolve, reject) => {
          const reader =
            new FileReader();

          reader.onerror = () => {
            reject(
              new Error(
                "Gagal membaca foto."
              )
            );
          };

          reader.onload = (e) => {
            const img =
              new Image();

            img.onload = () => {
              const canvas =
                document.createElement(
                  "canvas"
                );

              const max =
                640;

              const scale =
                Math.min(
                  1,
                  max /
                    img.width,
                  max /
                    img.height
                );

              canvas.width =
                Math.max(
                  1,
                  Math.round(
                    img.width *
                      scale
                  )
                );

              canvas.height =
                Math.max(
                  1,
                  Math.round(
                    img.height *
                      scale
                  )
                );

              const ctx =
                canvas.getContext(
                  "2d"
                );

              if (!ctx) {
                reject(
                  new Error(
                    "Browser tidak mendukung kompresi foto."
                  )
                );

                return;
              }

              ctx.drawImage(
                img,
                0,
                0,
                canvas.width,
                canvas.height
              );

              resolve(
                canvas.toDataURL(
                  "image/jpeg",
                  0.55
                )
              );
            };

            img.onerror = () => {
              reject(
                new Error(
                  "Foto tidak dapat diproses."
                )
              );
            };

            img.src =
              e.target.result;
          };

          reader.readAsDataURL(
            file
          );
        }
      );
    };

  // ====================================================
  // CLOUDINARY
  // ====================================================

  const uploadToCloudinary =
    async (file) => {
      try {
        const formData =
          new FormData();

        formData.append(
          "file",
          file
        );

        formData.append(
          "upload_preset",
          UPLOAD_PRESET
        );

        const controller =
          new AbortController();

        const timeout =
          setTimeout(
            () =>
              controller.abort(),
            6000
          );

        const response =
          await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            {
              method: "POST",
              body: formData,
              signal:
                controller.signal,
            }
          );

        clearTimeout(timeout);

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error?.message ||
              "Upload foto gagal."
          );
        }

        return data.secure_url;
      } catch (error) {
        console.warn(
          "Cloudinary gagal:",
          error
        );

        return await compressImage(
          file
        );
      }
    };

  // ====================================================
  // SUBMIT
  // ====================================================

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      if (
        loading ||
        submitLockRef.current
      ) {
        return;
      }

      submitLockRef.current =
        true;

      const namaFinal =
        nama.trim();

      const nisFinal =
        nis.trim();

      const kelasFinal =
        kelas.trim();

      const ceritaFinal =
        cerita.trim();

      const pelakuFinal =
        pelaku.trim();

      const lokasiFinal =
        lokasi === "Lainnya"
          ? lokasiLainnya.trim()
          : lokasi.trim();

      const jenisFinal =
        jenis === "Lainnya"
          ? jenisLainnya.trim()
          : jenis.trim();

      // ==================================================
      // VALIDASI
      // ==================================================

      if (!namaFinal) {
        submitLockRef.current =
          false;

        showAlert(
          "warning",
          "Nama Belum Ada",
          "Silakan login ulang sebagai siswa."
        );

        return;
      }

      if (!nisFinal) {
        submitLockRef.current =
          false;

        showAlert(
          "warning",
          "NIS Belum Ada",
          "Silakan login ulang sebagai siswa."
        );

        return;
      }

      if (!kelasFinal) {
        submitLockRef.current =
          false;

        showAlert(
          "warning",
          "Pilih Kelas",
          "Yuk pilih kelasmu terlebih dahulu."
        );

        return;
      }

      if (
        !tanggal ||
        !lokasiFinal ||
        !jenisFinal ||
        !ceritaFinal
      ) {
        submitLockRef.current =
          false;

        showAlert(
          "warning",
          "Form Belum Lengkap",
          "Yuk cek kembali tempat kejadian, jenis kejadian, dan ceritamu."
        );

        return;
      }

      if (!setujuJujur) {
        submitLockRef.current =
          false;

        showAlert(
          "warning",
          "Satu Langkah Lagi",
          "Centang pernyataan bahwa cerita yang kamu tulis adalah benar."
        );

        return;
      }

      if (
        peran === "Saksi / Teman" &&
        !namaTemanDilihat.trim()
      ) {
        submitLockRef.current = false;

        showAlert(
          "warning",
          "Nama Teman Belum Diisi",
          "Tuliskan nama teman yang kamu lihat."
        );

        return;
      }

      if (!pelaku.trim()) {
        submitLockRef.current = false;

        showAlert(
          "warning",
          "Siapa yang melakukan?",
          "Silakan isi siapa yang melakukan tindakan tersebut."
        );

        return;
      }

      if (
        saksi === "Ya" &&
        !namaSaksi.trim()
      ) {
        submitLockRef.current =
          false;

        showAlert(
          "warning",
          "Nama Saksi Belum Diisi",
          "Tuliskan nama teman yang melihat kejadian."
        );

        return;
      }

      setLoading(true);

      try {
        let imageUrl = "-";

        if (foto) {
          imageUrl =
            await uploadToCloudinary(
              foto
            );
        }

        const laporan = {
          nama: namaFinal,

          nis: nisFinal,

          kelas: kelasFinal,

          peran,

          namaTemanDilihat:
            peran === "Saksi / Teman"
              ? namaTemanDilihat.trim()
              : "-",

          tanggal,

          lokasi:
            lokasiFinal,

          jenis:
            jenisFinal,

          cerita:
            ceritaFinal,

          pelaku:
            pelakuFinal ||
            "Tidak disebutkan",

          saksi:
            saksi || "Tidak",

          namaSaksi:
            saksi === "Ya"
              ? namaSaksi.trim()
              : "-",

          kelasSaksi:
            saksi === "Ya"
              ? kelasSaksi.trim()
              : "-",

          fotoUrl:
            imageUrl,

          status:
            "Diproses",

          createdAt:
            new Date().toISOString(),

          createdAtMs:
            Date.now(),
        };

        await push(
          dbRef(
            db,
            "pengaduan"
          ),
          laporan
        );

        showAlert(
          "success",
          "Laporan Berhasil Terkirim 💚",
          "Terima kasih sudah berani bercerita. Laporanmu sudah diterima oleh guru BK.",
          () => {
            navigate(
              "/dashboard-siswa",
              {
                replace: true,
              }
            );
          }
        );
      } catch (error) {
        console.error(error);

        showAlert(
          "error",
          "Belum Berhasil Terkirim",
          error?.message ||
            "Ada masalah dengan jaringan. Silakan coba lagi."
        );
      } finally {
        setLoading(false);

        submitLockRef.current =
          false;
      }
    };

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div style={styles.page}>
      {/* HEADER */}

      <div style={styles.header}>
        <h1 style={styles.title}>
          🛡️ Ceritakan Yuk!
        </h1>

        <p style={styles.subtitle}>
          Kamu boleh bercerita tentang
          hal yang membuatmu tidak nyaman.
          Kami akan mendengarkanmu. 💚
        </p>
      </div>

      {/* HOTLINE */}

      <div style={styles.hotlineBox}>
        <div style={styles.hotlineText}>
          <strong>
            🆘 Butuh bantuan?
          </strong>{" "}
          Kamu juga bisa langsung
          berbicara dengan Guru BK.
        </div>

        <a
          href={`https://wa.me/${NOMOR_WA_GURU}?text=Halo%20Bapak/Ibu%20Guru,%20saya%20ingin%20berkonsultasi.`}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.hotlineBtn}
        >
          💬 Chat Guru
        </a>
      </div>

      {/* FORM */}

      <div style={styles.container}>
        <form
          onSubmit={handleSubmit}
        >
          {/* INFO */}

          <div
            style={
              styles.childInfoBox
            }
          >
            <div
              style={{
                fontSize: "25px",
              }}
            >
              💚
            </div>

            <p
              style={{
                ...styles.helperText,
                margin: 0,
                color: "#1B5E20",
                fontWeight: "600",
              }}
            >
              Tidak perlu takut atau malu.
              Isi sesuai yang kamu ingat.
              Kalau sulit membaca, tekan
              tombol 🔊 untuk mendengarkan.
            </p>
          </div>

          {/* NAMA */}

          <div style={styles.group}>
            <div
              style={
                styles.labelRow
              }
            >
              <label
                style={styles.label}
              >
                👤 Nama kamu
              </label>
            </div>

            <input
              value={nama}
              readOnly
              style={
                styles.readonlyInput
              }
            />
          </div>

          {/* NIS */}

          <div style={styles.group}>
            <div
              style={
                styles.labelRow
              }
            >
              <label
                style={styles.label}
              >
                🪪 Nomor NIS
              </label>
            </div>

            <input
              value={nis}
              readOnly
              style={
                styles.readonlyInput
              }
            />
          </div>

          {/* KELAS */}

          <div style={styles.group}>
            <div
              style={
                styles.labelRow
              }
            >
              <div>
                <label
                  style={styles.label}
                >
                  🎒 Kamu kelas berapa?
                </label>

                <div
                  style={
                    styles.helperText
                  }
                >
                  Pilih kelasmu.
                </div>
              </div>
            </div>

            <div
              style={
                styles.gridTwo
              }
            >
              {listPeran.map(
                (item) => (
                  <button
                    key={item.id}
                    type="button"
                    style={
                      styles.choiceButton(
                        peran ===
                          item.id
                      )
                    }
                    onClick={() =>
                      setPeran(
                        item.id
                      )
                    }
                    disabled={loading}
                  >
                    {item.label}
                  </button>
                )
              )}
            </div>
          </div>

          {/* TEMAN YANG DILIHAT */}

          {peran === "Saksi / Teman" && (
            <div
              style={{
                ...styles.group,
                background: "#F7FFF3",
                padding: "14px",
                borderRadius: "12px",
                border: "1px solid #C8E6C9",
              }}
            >
              <div style={styles.labelRow}>
                <label style={styles.label}>
                  👧 Temanmu itu siapa?
                  <span
                    style={{
                      color: "#D32F2F",
                      marginLeft: "3px",
                      fontWeight: "900",
                    }}
                  >
                    *
                  </span>
                </label>
              </div>

              <div
                style={{
                  ...styles.helperText,
                  marginBottom: "8px",
                }}
              >
                Tuliskan nama teman yang kamu lihat dalam kejadian tersebut.
              </div>

              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  value={namaTemanDilihat}
                  onChange={(e) =>
                    setNamaTemanDilihat(e.target.value)
                  }
                  placeholder="Nama teman yang kamu lihat..."
                  style={{
                    ...styles.input,
                    paddingRight: "50px",
                  }}
                  disabled={loading}
                />
                <VoiceButton
                  value={namaTemanDilihat}
                  onChange={setNamaTemanDilihat}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* TANGGAL */}

          <div style={styles.group}>
            <div
              style={
                styles.labelRow
              }
            >
              <label
                style={styles.label}
              >
                📅 Kapan kejadiannya?
              </label>
            </div>

            <input
              type="date"
              value={tanggal}
              onChange={(e) =>
                setTanggal(
                  e.target.value
                )
              }
              style={styles.input}
              disabled={loading}
            />
          </div>

          {/* LOKASI */}

          <div style={styles.group}>
            <div
              style={
                styles.labelRow
              }
            >
              <div>
                <label
                  style={styles.label}
                >
                  📍 Kejadiannya di mana?
                </label>

                <div
                  style={
                    styles.helperText
                  }
                >
                  Pilih tempat kejadian.
                </div>
              </div>
            </div>

            <div
              style={
                styles.selectWrapper
              }
            >
              <span
                style={
                  styles.selectEmoji
                }
              >
                📍
              </span>

              <select
                value={lokasi}
                onChange={(e) => {
                  const value =
                    e.target.value;

                  setLokasi(value);

                  if (
                    value !==
                    "Lainnya"
                  ) {
                    setLokasiLainnya(
                      ""
                    );
                  }
                }}
                style={
                  styles.childSelect
                }
                disabled={loading}
              >
                <option value="">
                  Pilih tempat kejadian
                </option>

                {listLokasi.map(
                  (item) => (
                    <option
                      key={
                        item.value
                      }
                      value={
                        item.value
                      }
                    >
                      {item.label}
                    </option>
                  )
                )}
              </select>
            </div>

            {lokasi ===
              "Lainnya" && (
              <div
                style={
                  styles.otherInputBox
                }
              >
                <div style={{ position: "relative" }}>
                  <input
                    value={
                      lokasiLainnya
                    }
                    onChange={(e) =>
                      setLokasiLainnya(
                        e.target.value
                      )
                    }
                    placeholder="Tulis tempatnya..."
                    style={{
                      ...styles.input,
                      paddingRight: "50px",
                    }}
                    disabled={
                      loading
                    }
                  />
                  <VoiceButton
                    value={lokasiLainnya}
                    onChange={setLokasiLainnya}
                    disabled={loading}
                  />
                </div>
              </div>
            )}
          </div>

          {/* JENIS */}

          <div style={styles.group}>
            <div
              style={
                styles.labelRow
              }
            >
              <div>
                <label
                  style={styles.label}
                >
                  😟 Apa yang terjadi?
                </label>

                <div
                  style={
                    styles.helperText
                  }
                >
                  Pilih kejadian yang paling
                  sesuai.
                </div>
              </div>
            </div>

            <div
              style={
                styles.selectWrapper
              }
            >
              <span
                style={
                  styles.selectEmoji
                }
              >
                😟
              </span>

              <select
                value={jenis}
                onChange={(e) => {
                  const value =
                    e.target.value;

                  setJenis(value);

                  if (
                    value !==
                    "Lainnya"
                  ) {
                    setJenisLainnya(
                      ""
                    );
                  }
                }}
                style={
                  styles.childSelect
                }
                disabled={loading}
              >
                <option value="">
                  Pilih apa yang terjadi
                </option>

                {listJenisBullying.map(
                  (item) => (
                    <option
                      key={
                        item.value
                      }
                      value={
                        item.value
                      }
                    >
                      {item.label}
                    </option>
                  )
                )}
              </select>
            </div>

            {jenis ===
              "Lainnya" && (
              <div
                style={
                  styles.otherInputBox
                }
              >
                <div style={{ position: "relative" }}>
                  <input
                    value={
                      jenisLainnya
                    }
                    onChange={(e) =>
                      setJenisLainnya(
                        e.target.value
                      )
                    }
                    placeholder="Ceritakan jenis kejadian..."
                    style={{
                      ...styles.input,
                      paddingRight: "50px",
                    }}
                    disabled={
                      loading
                    }
                  />
                  <VoiceButton
                    value={jenisLainnya}
                    onChange={setJenisLainnya}
                    disabled={loading}
                  />
                </div>
              </div>
            )}
          </div>

          {/* CERITA */}

          <div style={styles.group}>
            <div
              style={
                styles.labelRow
              }
            >
              <div>
                <label
                  style={styles.label}
                >
                  🗣️ Ceritakan dengan
                  kata-katamu
                </label>

                <div
                  style={
                    styles.helperText
                  }
                >
                  Tidak perlu panjang.
                  Tulis apa yang kamu ingat.
                </div>
              </div>
            </div>

            <div style={{ position: "relative" }}>
              <textarea
                value={cerita}
                onChange={(e) =>
                  setCerita(
                    e.target.value
                  )
                }
                placeholder="Contoh: Tadi saya diejek teman di kantin..."
                style={{
                  ...styles.textarea,
                  paddingRight: "52px",
                }}
                disabled={loading}
              />
              <div
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "10px",
                }}
              >
                <VoiceButton
                  value={cerita}
                  onChange={setCerita}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* PELAKU */}

          <div style={styles.group}>
            <div
              style={
                styles.labelRow
              }
            >
              <label
                style={styles.label}
              >
                👤 Siapa yang melakukan?
                <span
                  style={{
                    color: "#D32F2F",
                    marginLeft: "3px",
                    fontWeight: "900",
                  }}
                >
                  *
                </span>
              </label>
            </div>

            <div style={{ position: "relative" }}>
              <input
                value={pelaku}
                onChange={(e) =>
                  setPelaku(
                    e.target.value
                  )
                }
                placeholder="Nama teman atau orangnya..."
                style={{
                  ...styles.input,
                  paddingRight: "50px",
                }}
                disabled={loading}
              />
              <VoiceButton
                value={pelaku}
                onChange={setPelaku}
                disabled={loading}
              />
            </div>
          </div>

          {/* SAKSI */}

          <div style={styles.group}>
            <div
              style={
                styles.labelRow
              }
            >
              <label
                style={styles.label}
              >
                👀 Ada teman yang melihat?
              </label>
            </div>

            <div
              style={
                styles.gridTwo
              }
            >
              <button
                type="button"
                style={
                  styles.choiceButton(
                    saksi ===
                      "Tidak"
                  )
                }
                onClick={() =>
                  setSaksi(
                    "Tidak"
                  )
                }
                disabled={loading}
              >
                🙅 Tidak ada
              </button>

              <button
                type="button"
                style={
                  styles.choiceButton(
                    saksi === "Ya"
                  )
                }
                onClick={() =>
                  setSaksi("Ya")
                }
                disabled={loading}
              >
                👀 Ada teman
              </button>
            </div>
          </div>

          {/* DATA SAKSI */}

          {saksi === "Ya" && (
            <div
              style={{
                background: "#FAFAFA",
                padding: "14px",
                borderRadius: "12px",
                marginBottom: "18px",
              }}
            >
              <div
                style={{
                  marginBottom: "12px",
                }}
              >
                <div
                  style={
                    styles.labelRow
                  }
                >
                  <label
                    style={
                      styles.label
                    }
                  >
                    👧 Nama teman yang
                    melihat
                  </label>
                </div>

                <div style={{ position: "relative" }}>
                  <input
                    value={
                      namaSaksi
                    }
                    onChange={(e) =>
                      setNamaSaksi(
                        e.target.value
                      )
                    }
                    placeholder="Nama teman..."
                    style={{
                      ...styles.input,
                      paddingRight: "50px",
                    }}
                    disabled={
                      loading
                    }
                  />
                  <VoiceButton
                    value={namaSaksi}
                    onChange={setNamaSaksi}
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <div
                  style={
                    styles.labelRow
                  }
                >
                  <label
                    style={
                      styles.label
                    }
                  >
                    🎒 Kelas teman
                  </label>
                </div>

                <select
                  value={
                    kelasSaksi
                  }
                  onChange={(e) =>
                    setKelasSaksi(
                      e.target.value
                    )
                  }
                  style={
                    styles.childSelect
                  }
                  disabled={
                    loading
                  }
                >
                  <option value="">
                    Pilih kelas
                  </option>

                  {listKelas.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        🎒 Kelas {item}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>
          )}

          {/* FOTO */}

          <div style={styles.group}>
            <div
              style={
                styles.labelRow
              }
            >
              <label
                style={styles.label}
              >
                📷 Foto bukti
                <span
                  style={{
                    color: "#667C5E",
                    fontWeight: "600",
                  }}
                >
                  {" "}
                  (boleh dikosongkan)
                </span>
              </label>
            </div>

            <div
              style={
                styles.fileBox
              }
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setFoto(
                    e.target
                      .files?.[0] ||
                      null
                  )
                }
                style={styles.input}
                disabled={loading}
              />

              {foto && (
                <div
                  style={{
                    marginTop: "8px",
                    color: "#2E7D32",
                    fontSize: "12px",
                    fontWeight: "700",
                  }}
                >
                  ✅ Foto sudah dipilih
                </div>
              )}
            </div>
          </div>

          {/* PERNYATAAN */}

          <div
            style={
              styles.antiFitnahBox
            }
          >
            <input
              type="checkbox"
              id="jujurCheck"
              checked={
                setujuJujur
              }
              onChange={(e) =>
                setSetujuJujur(
                  e.target.checked
                )
              }
              style={{
                width: "20px",
                height: "20px",
              }}
              disabled={loading}
            />

            <label
              htmlFor="jujurCheck"
              style={{
                fontSize: "12.5px",
                color: "#1B5E20",
                lineHeight: "1.5",
                fontWeight: "600",
                flex: 1,
              }}
            >
              <strong>
                💚 Saya jujur
              </strong>
              <br />
              Saya menyatakan bahwa cerita
              ini benar sesuai yang saya ingat.
            </label>
          </div>

          {/* BUTTON */}

          <div
            style={
              styles.btnContainer
            }
          >
            <button
              type="submit"
              style={
                styles.submitBtn(
                  loading ||
                    !setujuJujur
                )
              }
              disabled={
                loading ||
                !setujuJujur
              }
            >
              {loading
                ? "⏳ Mengirim..."
                : "💚 Kirim Laporan"}
            </button>

            <button
              type="button"
              style={
                styles.backBtn
              }
              onClick={() =>
                navigate(
                  "/dashboard-siswa"
                )
              }
              disabled={loading}
            >
              ← Kembali
            </button>
          </div>
        </form>
      </div>

      {/* ALERT */}

      {alertConfig.isOpen && (
        <div
          style={
            styles.modalOverlay
          }
          onClick={closeAlert}
        >
          <div
            style={
              styles.modalCard
            }
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div
              style={{
                fontSize: "38px",
                marginBottom: "8px",
              }}
            >
              {alertConfig.type ===
              "success"
                ? "🎉"
                : alertConfig.type ===
                  "error"
                ? "😟"
                : "💡"}
            </div>

            <h3
              style={
                styles.modalTitle
              }
            >
              {
                alertConfig.title
              }
            </h3>

            <p
              style={
                styles.modalMsg
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
                closeAlert
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

export default FormPengaduan;