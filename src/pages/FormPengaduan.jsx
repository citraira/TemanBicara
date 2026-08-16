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
    opacity: 0.96,
  },

  // ====================================================
  // BANTUAN SUARA
  // ====================================================

  speakButton: {
    border: "none",
    background: "#FFFDE7",
    color: "#1B5E20",
    borderRadius: "12px",
    padding: "8px 10px",
    fontSize: "14px",
    fontWeight: "800",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    flexShrink: 0,
  },

  speakingButton: {
    border: "none",
    background: "#FFEB3B",
    color: "#1B5E20",
    borderRadius: "12px",
    padding: "8px 10px",
    fontSize: "14px",
    fontWeight: "800",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    flexShrink: 0,
  },

  // ====================================================
  // HOTLINE
  // ====================================================

  hotlineBox: {
    background: "#FFFDE7",
    border: "1.5px solid #FFF59D",
    borderRadius: "14px",
    padding: "12px 14px",
    maxWidth: "750px",
    margin: "0 auto 14px auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
    boxSizing: "border-box",
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
    whiteSpace: "nowrap",
  },

  // ====================================================
  // CONTAINER
  // ====================================================

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
    outline: "none",
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

  // ====================================================
  // DROPDOWN RAMAH ANAK
  // ====================================================

  selectWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "100%",
    boxSizing: "border-box",
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
    border:
      "1.5px solid #C8E6C9",
  },

  childSelect: {
    flex: 1,
    width: "100%",
    minWidth: 0,
    padding: "12px 13px",
    borderRadius: "12px",
    border:
      "1.5px solid #C8E6C9",
    background: "#FAFAFA",
    color: "#1B5E20",
    fontSize: "16px",
    fontWeight: "700",
    boxSizing: "border-box",
    outline: "none",
    cursor: "pointer",
  },

  // ====================================================
  // PERAN
  // ====================================================

  gridPeran: {
    display: "grid",
    gridTemplateColumns:
      "1fr 1fr",
    gap: "10px",
  },

  btnPeran: (selected) => ({
    padding: "13px 10px",
    textAlign: "center",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "800",
    fontSize: "14px",
    border: `1.5px solid ${
      selected
        ? "#2E7D32"
        : "#E0E0E0"
    }`,
    background: selected
      ? "#E8F5E9"
      : "#FAFAFA",
    color: selected
      ? "#1B5E20"
      : "#444",
    minHeight: "52px",
  }),

  // ====================================================
  // SAKSI
  // ====================================================

  gridSaksi: {
    display: "grid",
    gridTemplateColumns:
      "1fr 1fr",
    gap: "10px",
  },

  btnSaksi: (selected) => ({
    padding: "13px 10px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "800",
    fontSize: "14px",
    textAlign: "center",
    border: `1.5px solid ${
      selected
        ? "#2E7D32"
        : "#E0E0E0"
    }`,
    background: selected
      ? "#2E7D32"
      : "#FAFAFA",
    color: selected
      ? "#fff"
      : "#333",
  }),

  // ====================================================
  // INFO RAMAH ANAK
  // ====================================================

  childInfoBox: {
    background:
      "linear-gradient(135deg, #E8F5E9, #F1F8E9)",
    border:
      "1.5px solid #A5D6A7",
    borderRadius: "14px",
    padding: "13px 14px",
    marginBottom: "18px",
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
  },

  childInfoIcon: {
    fontSize: "25px",
    flexShrink: 0,
  },

  childInfoText: {
    fontSize: "13px",
    lineHeight: "1.5",
    color: "#1B5E20",
    fontWeight: "600",
    margin: 0,
  },

  // ====================================================
  // CERITA
  // ====================================================

  storyHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    gap: "8px",
    marginBottom: "8px",
  },

  voiceButton: (active) => ({
    border: "none",
    background: active
      ? "#FFEB3B"
      : "#E8F5E9",
    color: "#1B5E20",
    borderRadius: "12px",
    padding: "9px 11px",
    fontSize: "13px",
    fontWeight: "800",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    whiteSpace: "nowrap",
  }),

  voiceHelp: {
    background: "#FFFDE7",
    border:
      "1.5px solid #FFF59D",
    borderRadius: "12px",
    padding: "10px 12px",
    marginTop: "8px",
    fontSize: "12px",
    color: "#5D5D32",
    lineHeight: "1.5",
  },

  // ====================================================
  // LAINNYA
  // ====================================================

  otherInputBox: {
    marginTop: "9px",
    padding: "10px",
    background: "#F1F8E9",
    borderRadius: "12px",
    border:
      "1.5px dashed #A5D6A7",
  },

  // ====================================================
  // FOTO
  // ====================================================

  fileBox: {
    background: "#FAFAFA",
    border:
      "1.5px dashed #A5D6A7",
    borderRadius: "12px",
    padding: "12px",
  },

  // ====================================================
  // PERNYATAAN
  // ====================================================

  antiFitnahBox: {
    background: "#FFFDE7",
    border:
      "1.5px solid #FFF59D",
    borderRadius: "12px",
    padding: "12px 13px",
    marginBottom: "18px",
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
  },

  // ====================================================
  // BUTTON
  // ====================================================

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
    boxShadow: disabled
      ? "none"
      : "0 3px 0 #1B5E20",
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
    boxShadow:
      "0 3px 0 #FBC02D",
  },

  // ====================================================
  // MODAL
  // ====================================================

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: "15px",
    boxSizing: "border-box",
  },

  modalCard: {
    background: "#fff",
    padding: "24px 20px",
    borderRadius: "18px",
    maxWidth: "360px",
    width: "100%",
    textAlign: "center",
    boxShadow:
      "0 8px 24px rgba(0,0,0,0.12)",
    border:
      "1.5px solid #C8E6C9",
    boxSizing: "border-box",
  },

  modalTitle: {
    fontSize: "18px",
    fontWeight: "800",
    margin:
      "0 0 8px 0",
  },

  modalMsg: {
    fontSize: "13px",
    color: "#556B4D",
    lineHeight: "1.5",
    margin:
      "0 0 18px 0",
  },

  alertBtn: (type) => ({
    width: "100%",
    padding: "12px",
    border: "none",
    borderRadius: "10px",
    fontWeight: "800",
    fontSize: "13px",
    cursor: "pointer",
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
// FORM PENGADUAN
// ======================================================

function FormPengaduan() {
  const navigate = useNavigate();

  // ====================================================
  // CONFIG
  // ====================================================

  const CLOUD_NAME = "r61tomq9";

  const UPLOAD_PRESET =
    "ml_default";

  const NOMOR_WA_GURU =
    "6281234567890";

  // ====================================================
  // IDENTITAS
  // ====================================================

  const [nama, setNama] =
    useState("");

  const [nis, setNis] =
    useState("");

  const [kelas, setKelas] =
    useState("");

  // ====================================================
  // FORM
  // ====================================================

  const [peran, setPeran] =
    useState("Korban");

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

  // ====================================================
  // ALERT
  // ====================================================

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
  // SPEECH
  // ====================================================

  const [
    isSpeakingText,
    setIsSpeakingText,
  ] = useState(false);

  const [
    isListening,
    setIsListening,
  ] = useState(false);

  const recognitionRef =
    useRef(null);

  // ====================================================
  // SUBMIT LOCK
  // ====================================================

  const submitLockRef =
    useRef(false);

  // ====================================================
  // SHOW ALERT
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
  // LOAD IDENTITAS SISWA
  // ====================================================

  useEffect(() => {
    const namaSaved =
      localStorage.getItem(
        "namaSiswa"
      ) || "";

    const nisSaved =
      localStorage.getItem(
        "nisSiswa"
      ) || "";

    const kelasSaved =
      localStorage.getItem(
        "kelasSiswa"
      ) || "";

    setNama(
      namaSaved.trim()
    );

    setNis(
      nisSaved.trim()
    );

    /*
     * Kalau kelas siswa sudah tersimpan
     * dari login, otomatis pilih kelas tersebut.
     *
     * Anak masih bisa menggantinya jika memang
     * diperlukan.
     */
    setKelas(
      kelasSaved.trim()
    );

    // Tanggal otomatis hari ini
    const today =
      new Date()
        .toISOString()
        .split("T")[0];

    setTanggal(today);
  }, []);

  // ====================================================
  // DATA PILIHAN
  // ====================================================

  const listKelas = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
  ];

  const listPeran = [
    {
      id: "Korban",
      label:
        "😟 Saya yang mengalami",
    },
    {
      id: "Saksi / Teman",
      label:
        "👀 Saya melihat teman",
    },
  ];

  const listLokasi = [
    {
      value: "Ruang Kelas",
      label:
        "🏫 Ruang Kelas",
    },
    {
      value: "Halaman Sekolah",
      label:
        "🌳 Halaman Sekolah",
    },
    {
      value: "Kantin",
      label:
        "🍜 Kantin",
    },
    {
      value: "Lapangan",
      label:
        "⚽ Lapangan",
    },
    {
      value: "Perpustakaan",
      label:
        "📚 Perpustakaan",
    },
    {
      value: "Toilet",
      label:
        "🚻 Toilet",
    },
    {
      value: "Depan Gerbang",
      label:
        "🚪 Depan Gerbang",
    },
    {
      value: "Lainnya",
      label:
        "❓ Tempat lainnya",
    },
  ];

  const listJenisBullying = [
    {
      value:
        "Kekerasan Fisik",
      label:
        "👊 Dipukul atau ditendang",
      description:
        "Contoh: dipukul, ditendang, didorong",
    },

    {
      value:
        "Kekerasan Verbal",
      label:
        "😡 Diejek atau dihina",
      description:
        "Contoh: diejek, dihina, dipanggil nama buruk",
    },

    {
      value:
        "Pengucilan Sosial",
      label:
        "🙁 Dijauhi teman",
      description:
        "Contoh: tidak diajak bermain atau disebarkan fitnah",
    },

    {
      value:
        "Pemalakan / Ancaman",
      label:
        "😨 Diancam atau diminta uang",
      description:
        "Contoh: uang atau barang diminta paksa",
    },

    {
      value:
        "Cyberbullying",
      label:
        "📱 Diganggu lewat HP",
      description:
        "Contoh: chat atau media sosial",
    },

    {
      value: "Lainnya",
      label:
        "❓ Kejadian lainnya",
      description:
        "Kamu bisa menuliskannya sendiri",
    },
  ];

  // ====================================================
  // TEXT TO SPEECH
  // ====================================================

  const speakText = (
    text
  ) => {
    if (
      typeof window ===
        "undefined" ||
      !("speechSynthesis" in
        window)
    ) {
      showAlert(
        "warning",
        "Fitur Suara Belum Tersedia",
        "Browser ini belum mendukung fitur membaca dengan suara."
      );

      return;
    }

    // Hentikan suara sebelumnya
    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(
        text
      );

    utterance.lang =
      "id-ID";

    utterance.rate = 0.9;

    utterance.pitch = 1;

    utterance.volume = 1;

    utterance.onstart = () => {
      setIsSpeakingText(true);
    };

    utterance.onend = () => {
      setIsSpeakingText(false);
    };

    utterance.onerror = () => {
      setIsSpeakingText(false);
    };

    window.speechSynthesis.speak(
      utterance
    );
  };

  const stopSpeaking = () => {
    if (
      "speechSynthesis" in
      window
    ) {
      window.speechSynthesis.cancel();
    }

    setIsSpeakingText(false);
  };

  // ====================================================
  // SPEECH TO TEXT
  // ====================================================

  const startVoiceInput = () => {
    if (
      typeof window ===
        "undefined"
    ) {
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showAlert(
        "warning",
        "Fitur Bicara Belum Tersedia",
        "Browser ini belum mendukung fitur bicara. Kamu masih bisa mengetik ceritamu."
      );

      return;
    }

    // Kalau sedang mendengarkan,
    // hentikan.
    if (isListening) {
      stopVoiceInput();
      return;
    }

    try {
      const recognition =
        new SpeechRecognition();

      recognition.lang =
        "id-ID";

      recognition.continuous =
        false;

      recognition.interimResults =
        true;

      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (
        event
      ) => {
        let finalText = "";
        let interimText = "";

        for (
          let i = 0;
          i <
          event.results.length;
          i++
        ) {
          const transcript =
            event.results[i][0]
              .transcript;

          if (
            event.results[i]
              .isFinal
          ) {
            finalText +=
              transcript;
          } else {
            interimText +=
              transcript;
          }
        }

        /*
         * Tambahkan hasil suara ke cerita.
         */
        if (finalText) {
          setCerita(
            (previous) => {
              const separator =
                previous.trim()
                  ? " "
                  : "";

              return (
                previous.trim() +
                separator +
                finalText.trim()
              );
            }
          );
        }

        /*
         * interimText tidak dimasukkan ke state
         * agar tidak mengacaukan teks yang sudah ada.
         */
      };

      recognition.onerror = (
        event
      ) => {
        console.warn(
          "Speech recognition:",
          event.error
        );

        setIsListening(false);

        if (
          event.error ===
          "not-allowed"
        ) {
          showAlert(
            "warning",
            "Mikrofon Tidak Diizinkan",
            "Izinkan akses mikrofon pada browser agar kamu bisa bercerita dengan suara."
          );
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current =
          null;
      };

      recognitionRef.current =
        recognition;

      recognition.start();
    } catch (error) {
      console.error(
        "Gagal memulai suara:",
        error
      );

      setIsListening(false);
    }
  };

  const stopVoiceInput = () => {
    try {
      if (
        recognitionRef.current
      ) {
        recognitionRef.current.stop();
        recognitionRef.current =
          null;
      }
    } catch (error) {
      console.warn(
        "Gagal menghentikan suara:",
        error
      );
    }

    setIsListening(false);
  };

  // ====================================================
  // CLEANUP SPEECH
  // ====================================================

  useEffect(() => {
    return () => {
      if (
        typeof window !==
          "undefined" &&
        "speechSynthesis" in
          window
      ) {
        window.speechSynthesis.cancel();
      }

      try {
        if (
          recognitionRef.current
        ) {
          recognitionRef.current.stop();
        }
      } catch (error) {
        // Abaikan
      }
    };
  }, []);

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
                "Gagal membaca file gambar."
              )
            );
          };

          reader.onload = (e) => {
            const img =
              new Image();

            img.onerror = () => {
              reject(
                new Error(
                  "File gambar tidak dapat diproses."
                )
              );
            };

            img.onload = () => {
              const canvas =
                document.createElement(
                  "canvas"
                );

              const MAX_WIDTH =
                640;

              const MAX_HEIGHT =
                640;

              const scale =
                Math.min(
                  1,
                  MAX_WIDTH /
                    img.width,
                  MAX_HEIGHT /
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
                    "Browser tidak mendukung pemrosesan gambar."
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
  // UPLOAD CLOUDINARY
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

        const timeoutId =
          setTimeout(() => {
            controller.abort();
          }, 6000);

        const res =
          await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            {
              method: "POST",
              body: formData,
              signal:
                controller.signal,
            }
          );

        clearTimeout(
          timeoutId
        );

        const data =
          await res.json();

        if (!res.ok) {
          throw new Error(
            data.error?.message ||
              "Gagal upload"
          );
        }

        return data.secure_url;
      } catch (error) {
        console.warn(
          "Upload Cloudinary gagal/lambat. Menggunakan kompresi lokal:",
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
      if (e) {
        e.preventDefault();
      }

      // ==============================================
      // CEGAH SUBMIT GANDA
      // ==============================================

      if (
        loading ||
        submitLockRef.current
      ) {
        return;
      }

      submitLockRef.current =
        true;

      // ==============================================
      // NORMALISASI DATA
      // ==============================================

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

      // ==============================================
      // VALIDASI IDENTITAS
      // ==============================================

      if (!namaFinal) {
        submitLockRef.current =
          false;

        showAlert(
          "warning",
          "Nama Belum Ada",
          "Nama siswa belum tersedia. Silakan login ulang sebagai siswa."
        );

        return;
      }

      if (!nisFinal) {
        submitLockRef.current =
          false;

        showAlert(
          "warning",
          "NIS Belum Ada",
          "NIS siswa tidak ditemukan. Silakan login ulang."
        );

        return;
      }

      if (!kelasFinal) {
        submitLockRef.current =
          false;

        showAlert(
          "warning",
          "Kelas Belum Dipilih",
          "Yuk pilih kelasmu terlebih dahulu."
        );

        return;
      }

      // ==============================================
      // VALIDASI FORM
      // ==============================================

      if (
        tanggal === "" ||
        !lokasiFinal ||
        !jenisFinal ||
        !ceritaFinal
      ) {
        submitLockRef.current =
          false;

        showAlert(
          "warning",
          "Masih Ada yang Kosong",
          "Yuk cek lagi. Pastikan tempat kejadian, kejadian, dan ceritamu sudah diisi."
        );

        return;
      }

      // ==============================================
      // VALIDASI PERNYATAAN
      // ==============================================

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

      // ==============================================
      // VALIDASI SAKSI
      // ==============================================

      if (
        saksi === "Ya" &&
        !namaSaksi.trim()
      ) {
        submitLockRef.current =
          false;

        showAlert(
          "warning",
          "Nama Saksi Belum Diisi",
          "Kalau ada saksi, tuliskan nama teman yang melihat kejadian."
        );

        return;
      }

      setLoading(true);

      try {
        // ============================================
        // FOTO
        // ============================================

        let imageUrl = "-";

        if (foto) {
          imageUrl =
            await uploadToCloudinary(
              foto
            );
        }

        // ============================================
        // DATA LAPORAN
        // ============================================

        const laporan = {
          // IDENTITAS
          nama: namaFinal,

          nis: nisFinal,

          kelas: kelasFinal,

          // PENGADUAN
          peran,

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

          // FOTO
          fotoUrl:
            imageUrl,

          // STATUS
          status:
            "Diproses",

          // WAKTU
          createdAt:
            new Date().toISOString(),

          createdAtMs:
            Date.now(),
        };

        // ============================================
        // SIMPAN KE FIREBASE
        // ============================================

        await push(
          dbRef(
            db,
            "pengaduan"
          ),
          laporan
        );

        // ============================================
        // SUKSES
        // ============================================

        showAlert(
          "success",
          "Laporan Berhasil Terkirim 💚",
          "Terima kasih sudah berani bercerita. Laporanmu sudah diterima oleh guru BK dan akan ditangani dengan aman.",
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
        console.error(
          "Gagal mengirim laporan:",
          error
        );

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
      {/* ==================================================
          HEADER
      ================================================== */}

      <div style={styles.header}>
        <h1 style={styles.title}>
          🛡️ Ceritakan Yuk!
        </h1>

        <p style={styles.subtitle}>
          Kamu boleh bercerita tentang
          hal yang membuatmu tidak nyaman.
          Kami akan mendengarkanmu. 💚
        </p>

        <div
          style={{
            marginTop: "12px",
          }}
        >
          <button
            type="button"
            style={
              isSpeakingText
                ? styles.speakingButton
                : styles.speakButton
            }
            onClick={() => {
              if (isSpeakingText) {
                stopSpeaking();
              } else {
                speakText(
                  "Ceritakan yuk. Kamu boleh bercerita tentang hal yang membuatmu tidak nyaman. Kami akan mendengarkanmu."
                );
              }
            }}
          >
            {isSpeakingText
              ? "⏹️ Berhenti"
              : "🔊 Dengarkan"}
          </button>
        </div>
      </div>

      {/* ==================================================
          HOTLINE
      ================================================== */}

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

      {/* ==================================================
          FORM
      ================================================== */}

      <div style={styles.container}>
        <form
          onSubmit={handleSubmit}
        >
          {/* ============================================
              PETUNJUK ANAK
          ============================================= */}

          <div
            style={
              styles.childInfoBox
            }
          >
            <div
              style={
                styles.childInfoIcon
              }
            >
              💚
            </div>

            <p
              style={
                styles.childInfoText
              }
            >
              Tidak perlu takut atau
              malu. Isi sesuai yang kamu
              ingat. Kalau sulit membaca,
              tekan tombol 🔊 untuk
              mendengarkan.
            </p>
          </div>

          {/* ============================================
              IDENTITAS
          ============================================= */}

          <div
            style={styles.group}
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
                👤 Nama kamu
              </label>

              <button
                type="button"
                style={
                  styles.speakButton
                }
                onClick={() =>
                  speakText(
                    "Nama kamu"
                  )
                }
              >
                🔊
              </button>
            </div>

            <input
              type="text"
              value={nama}
              style={
                styles.readonlyInput
              }
              disabled={loading}
              readOnly
            />
          </div>

          <div
            style={styles.group}
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
                🪪 Nomor NIS
              </label>

              <button
                type="button"
                style={
                  styles.speakButton
                }
                onClick={() =>
                  speakText(
                    "Nomor NIS"
                  )
                }
              >
                🔊
              </button>
            </div>

            <input
              type="text"
              value={nis}
              style={
                styles.readonlyInput
              }
              disabled={loading}
              readOnly
              inputMode="numeric"
            />
          </div>

          {/* ============================================
              KELAS
          ============================================= */}

          <div
            style={styles.group}
          >
            <div
              style={
                styles.labelRow
              }
            >
              <div>
                <label
                  style={
                    styles.label
                  }
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

              <button
                type="button"
                style={
                  styles.speakButton
                }
                onClick={() =>
                  speakText(
                    "Kamu kelas berapa? Pilih kelas satu sampai enam."
                  )
                }
              >
                🔊 Dengarkan
              </button>
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
                🎒
              </span>

              <select
                value={kelas}
                onChange={(e) =>
                  setKelas(
                    e.target.value
                  )
                }
                disabled={loading}
                style={
                  styles.childSelect
                }
                aria-label="Pilih kelas"
              >
                <option value="">
                  Pilih kelas kamu
                </option>

                {listKelas.map(
                  (k) => (
                    <option
                      key={k}
                      value={k}
                    >
                      🎒 Kelas {k}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          {/* ============================================
              PERAN
          ============================================= */}

          <div
            style={styles.group}
          >
            <div
              style={
                styles.labelRow
              }
            >
              <div>
                <label
                  style={
                    styles.label
                  }
                >
                  👀 Kamu mengalami atau
                  melihat?
                </label>

                <div
                  style={
                    styles.helperText
                  }
                >
                  Pilih yang sesuai.
                </div>
              </div>

              <button
                type="button"
                style={
                  styles.speakButton
                }
                onClick={() =>
                  speakText(
                    "Kamu mengalami atau melihat? Pilih saya yang mengalami, atau saya melihat teman."
                  )
                }
              >
                🔊
              </button>
            </div>

            <div
              style={
                styles.gridPeran
              }
            >
              {listPeran.map(
                (item) => (
                  <button
                    key={item.id}
                    type="button"
                    style={
                      styles.btnPeran(
                        peran ===
                          item.id
                      )
                    }
                    onClick={() =>
                      setPeran(
                        item.id
                      )
                    }
                    disabled={
                      loading
                    }
                  >
                    {item.label}
                  </button>
                )
              )}
            </div>
          </div>

          {/* ============================================
              TANGGAL
          ============================================= */}

          <div
            style={styles.group}
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
                📅 Kapan kejadiannya?
              </label>

              <button
                type="button"
                style={
                  styles.speakButton
                }
                onClick={() =>
                  speakText(
                    "Kapan kejadiannya? Pilih tanggal kejadian."
                  )
                }
              >
                🔊
              </button>
            </div>

            <input
              type="date"
              value={tanggal}
              onChange={(e) =>
                setTanggal(
                  e.target.value
                )
              }
              style={
                styles.input
              }
              disabled={loading}
            />
          </div>

          {/* ============================================
              LOKASI DROPDOWN
          ============================================= */}

          <div
            style={styles.group}
          >
            <div
              style={
                styles.labelRow
              }
            >
              <div>
                <label
                  style={
                    styles.label
                  }
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

              <button
                type="button"
                style={
                  styles.speakButton
                }
                onClick={() =>
                  speakText(
                    "Kejadiannya di mana? Pilih tempat kejadian."
                  )
                }
              >
                🔊 Dengarkan
              </button>
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
                    e.target
                      .value;

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
                disabled={loading}
                style={
                  styles.childSelect
                }
                aria-label="Pilih tempat kejadian"
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
                <input
                  type="text"
                  placeholder="Tulis tempatnya di sini..."
                  value={
                    lokasiLainnya
                  }
                  onChange={(e) =>
                    setLokasiLainnya(
                      e.target
                        .value
                    )
                  }
                  style={
                    styles.input
                  }
                  disabled={
                    loading
                  }
                />
              </div>
            )}
          </div>

          {/* ============================================
              BENTUK TINDAKAN
          ============================================= */}

          <div
            style={styles.group}
          >
            <div
              style={
                styles.labelRow
              }
            >
              <div>
                <label
                  style={
                    styles.label
                  }
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

              <button
                type="button"
                style={
                  styles.speakButton
                }
                onClick={() =>
                  speakText(
                    "Apa yang terjadi? Pilih kejadian yang paling sesuai."
                  )
                }
              >
                🔊 Dengarkan
              </button>
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
                    e.target
                      .value;

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
                disabled={loading}
                style={
                  styles.childSelect
                }
                aria-label="Pilih kejadian"
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

            {/* PENJELASAN PILIHAN */}

            {jenis &&
              jenis !==
                "Lainnya" && (
                <div
                  style={{
                    ...styles.voiceHelp,
                    marginTop:
                      "8px",
                  }}
                >
                  💡{" "}
                  {
                    listJenisBullying.find(
                      (item) =>
                        item.value ===
                        jenis
                    )?.description
                  }
                </div>
              )}

            {jenis ===
              "Lainnya" && (
              <div
                style={
                  styles.otherInputBox
                }
              >
                <input
                  type="text"
                  placeholder="Ceritakan jenis kejadiannya..."
                  value={
                    jenisLainnya
                  }
                  onChange={(e) =>
                    setJenisLainnya(
                      e.target
                        .value
                    )
                  }
                  style={
                    styles.input
                  }
                  disabled={
                    loading
                  }
                />
              </div>
            )}
          </div>

          {/* ============================================
              CERITA
          ============================================= */}

          <div
            style={styles.group}
          >
            <div
              style={
                styles.storyHeader
              }
            >
              <div>
                <label
                  style={
                    styles.label
                  }
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
                  Tulis apa yang kamu
                  ingat.
                </div>
              </div>

              <div
                style={{
                  display:
                    "flex",
                  gap: "6px",
                  flexShrink: 0,
                }}
              >
                <button
                  type="button"
                  style={
                    styles.speakButton
                  }
                  onClick={() =>
                    speakText(
                      "Ceritakan dengan kata-katamu. Tidak perlu panjang. Tulis apa yang kamu ingat."
                    )
                  }
                >
                  🔊
                </button>

                <button
                  type="button"
                  style={
                    styles.voiceButton(
                      isListening
                    )
                  }
                  onClick={
                    startVoiceInput
                  }
                  disabled={
                    loading
                  }
                >
                  {isListening
                    ? "⏹️ Berhenti"
                    : "🎤 Bicara"}
                </button>
              </div>
            </div>

            <textarea
              value={cerita}
              onChange={(e) =>
                setCerita(
                  e.target.value
                )
              }
              placeholder="Contoh: Tadi saya diejek teman di kantin..."
              style={
                styles.textarea
              }
              disabled={loading}
            />

            {isListening && (
              <div
                style={
                  styles.voiceHelp
                }
              >
                🎤 Silakan bicara...
                <br />
                Ceritakan dengan pelan.
                Setelah selesai, teks
                akan ditulis otomatis.
              </div>
            )}

            {!isListening && (
              <div
                style={
                  styles.voiceHelp
                }
              >
                💡 Sulit mengetik?
                Tekan <strong>
                  🎤 Bicara
                </strong>{" "}
                lalu ceritakan dengan
                suaramu.
              </div>
            )}
          </div>

          {/* ============================================
              PELAKU
          ============================================= */}

          <div
            style={styles.group}
          >
            <div
              style={
                styles.labelRow
              }
            >
              <div>
                <label
                  style={
                    styles.label
                  }
                >
                  👤 Siapa yang melakukan?
                  <span
                    style={{
                      fontWeight:
                        "600",
                      color:
                        "#667C5E",
                      marginLeft:
                        "5px",
                    }}
                  >
                    (boleh dikosongkan)
                  </span>
                </label>

                <div
                  style={
                    styles.helperText
                  }
                >
                  Kalau kamu tahu namanya,
                  boleh ditulis.
                </div>
              </div>

              <button
                type="button"
                style={
                  styles.speakButton
                }
                onClick={() =>
                  speakText(
                    "Siapa yang melakukan? Kalau kamu tahu namanya, boleh ditulis. Bagian ini boleh dikosongkan."
                  )
                }
              >
                🔊
              </button>
            </div>

            <input
              type="text"
              value={pelaku}
              onChange={(e) =>
                setPelaku(
                  e.target.value
                )
              }
              placeholder="Nama teman atau orangnya..."
              style={
                styles.input
              }
              disabled={loading}
            />
          </div>

          {/* ============================================
              SAKSI
          ============================================= */}

          <div
            style={styles.group}
          >
            <div
              style={
                styles.labelRow
              }
            >
              <div>
                <label
                  style={
                    styles.label
                  }
                >
                  👀 Ada teman yang
                  melihat?
                </label>

                <div
                  style={
                    styles.helperText
                  }
                >
                  Pilih ada atau tidak.
                </div>
              </div>

              <button
                type="button"
                style={
                  styles.speakButton
                }
                onClick={() =>
                  speakText(
                    "Ada teman yang melihat? Pilih ada saksi atau tidak ada saksi."
                  )
                }
              >
                🔊
              </button>
            </div>

            <div
              style={
                styles.gridSaksi
              }
            >
              <button
                type="button"
                style={
                  styles.btnSaksi(
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
                  styles.btnSaksi(
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

          {/* ============================================
              DATA SAKSI
          ============================================= */}

          {saksi === "Ya" && (
            <div
              style={{
                background:
                  "#FAFAFA",
                padding: "14px",
                borderRadius:
                  "12px",
                border:
                  "1.5px dashed #C8E6C9",
                marginBottom:
                  "18px",
              }}
            >
              <div
                style={{
                  marginBottom:
                    "12px",
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

                  <button
                    type="button"
                    style={
                      styles.speakButton
                    }
                    onClick={() =>
                      speakText(
                        "Nama teman yang melihat."
                      )
                    }
                  >
                    🔊
                  </button>
                </div>

                <input
                  type="text"
                  value={
                    namaSaksi
                  }
                  onChange={(e) =>
                    setNamaSaksi(
                      e.target
                        .value
                    )
                  }
                  placeholder="Nama teman yang melihat..."
                  style={
                    styles.input
                  }
                  disabled={
                    loading
                  }
                />
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
                    (boleh dikosongkan)
                  </label>

                  <button
                    type="button"
                    style={
                      styles.speakButton
                    }
                    onClick={() =>
                      speakText(
                        "Kelas teman. Bagian ini boleh dikosongkan."
                      )
                    }
                  >
                    🔊
                  </button>
                </div>

                <select
                  value={
                    kelasSaksi
                  }
                  onChange={(e) =>
                    setKelasSaksi(
                      e.target
                        .value
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
                    (k) => (
                      <option
                        key={k}
                        value={k}
                      >
                        🎒 Kelas {k}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>
          )}

          {/* ============================================
              FOTO
          ============================================= */}

          <div
            style={styles.group}
          >
            <div
              style={
                styles.labelRow
              }
            >
              <div>
                <label
                  style={
                    styles.label
                  }
                >
                  📷 Foto bukti
                  <span
                    style={{
                      fontWeight:
                        "600",
                      color:
                        "#667C5E",
                      marginLeft:
                        "5px",
                    }}
                  >
                    (boleh dikosongkan)
                  </span>
                </label>

                <div
                  style={
                    styles.helperText
                  }
                >
                  Kalau punya foto, kamu
                  boleh memasukkannya.
                </div>
              </div>

              <button
                type="button"
                style={
                  styles.speakButton
                }
                onClick={() =>
                  speakText(
                    "Foto bukti. Kalau punya foto, kamu boleh memasukkannya. Bagian ini boleh dikosongkan."
                  )
                }
              >
                🔊
              </button>
            </div>

            <div
              style={
                styles.fileBox
              }
            >
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/*"
                onChange={(e) =>
                  setFoto(
                    e.target
                      .files?.[0] ||
                      null
                  )
                }
                style={{
                  ...styles.input,
                  background:
                    "#fff",
                }}
                disabled={
                  loading
                }
              />

              {foto && (
                <div
                  style={{
                    marginTop:
                      "8px",
                    fontSize:
                      "12px",
                    color:
                      "#2E7D32",
                    fontWeight:
                      "700",
                  }}
                >
                  ✅ Foto sudah
                  dipilih
                </div>
              )}
            </div>
          </div>

          {/* ============================================
              PERNYATAAN
          ============================================= */}

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
                  e.target
                    .checked
                )
              }
              style={{
                width: "20px",
                height: "20px",
                cursor:
                  "pointer",
                marginTop:
                  "2px",
                flexShrink: 0,
              }}
              disabled={
                loading
              }
            />

            <label
              htmlFor="jujurCheck"
              style={{
                fontSize:
                  "12.5px",
                color:
                  "#1B5E20",
                cursor:
                  "pointer",
                lineHeight:
                  "1.5",
                fontWeight:
                  "600",
              }}
            >
              <strong>
                💚 Saya jujur
              </strong>
              <br />
              Saya menyatakan bahwa
              cerita ini benar sesuai
              yang saya ingat.
            </label>

            <button
              type="button"
              style={
                styles.speakButton
              }
              onClick={() =>
                speakText(
                  "Saya jujur. Saya menyatakan bahwa cerita ini benar sesuai yang saya ingat."
                )
              }
            >
              🔊
            </button>
          </div>

          {/* ============================================
              BUTTON
          ============================================= */}

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
              disabled={
                loading
              }
            >
              ← Kembali
            </button>
          </div>
        </form>
      </div>

      {/* ==================================================
          ALERT
      ================================================== */}

      {alertConfig.isOpen && (
        <div
          style={
            styles.modalOverlay
          }
          role="presentation"
          onClick={
            handleCloseAlert
          }
        >
          <div
            style={
              styles.modalCard
            }
            role="dialog"
            aria-modal="true"
            aria-labelledby="pengaduan-alert-title"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div
              style={{
                fontSize: "38px",
                marginBottom:
                  "8px",
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
              id="pengaduan-alert-title"
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

export default FormPengaduan;