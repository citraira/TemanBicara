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

  speakButton: {
    border: "none",
    background: "#E8F5E9",
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

  const [hariKejadian, setHariKejadian] =
    useState("");

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
  // TTS
  // ====================================================

  const [
    isSpeaking,
    setIsSpeaking,
  ] = useState(false);

  const audioRef =
    useRef(null);

  const audioUrlRef =
    useRef(null);

  // ====================================================
  // SPEECH TO TEXT
  // ====================================================

  const [
    isListening,
    setIsListening,
  ] = useState(false);

  const recognitionRef =
    useRef(null);

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

  const submitLockRef =
    useRef(false);

  // ====================================================
  // DATA
  // ====================================================

  const listKelas = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
  ];

  const listHari = [
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
    "Minggu",
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
      label: "🏫 Ruang Kelas",
    },
    {
      value: "Halaman Sekolah",
      label: "🌳 Halaman Sekolah",
    },
    {
      value: "Kantin",
      label: "🍜 Kantin",
    },
    {
      value: "Lapangan",
      label: "⚽ Lapangan",
    },
    {
      value: "Perpustakaan",
      label: "📚 Perpustakaan",
    },
    {
      value: "Toilet",
      label: "🚻 Toilet",
    },
    {
      value: "Depan Gerbang",
      label: "🚪 Depan Gerbang",
    },
    {
      value: "Lainnya",
      label: "❓ Tempat lainnya",
    },
  ];

  const listJenisBullying = [
    {
      value: "Kekerasan Fisik",
      label:
        "👊 Dipukul / ditendang",
      sub:
        "Dipukul, ditendang, didorong",
    },
    {
      value: "Kekerasan Verbal",
      label:
        "😡 Diejek / dihina",
      sub:
        "Diejek, dihina, dipanggil nama buruk",
    },
    {
      value: "Pengucilan Sosial",
      label:
        "🙁 Dijauhi teman",
      sub:
        "Dijauhi teman atau disebarkan fitnah",
    },
    {
      value:
        "Pemalakan / Ancaman",
      label:
        "😨 Diancam / diminta uang",
      sub:
        "Uang atau barang diambil paksa",
    },
    {
      value: "Cyberbullying",
      label:
        "📱 Diganggu lewat HP",
      sub:
        "Melalui chat atau media sosial",
    },
    {
      value: "Lainnya",
      label:
        "❓ Kejadian lainnya",
      sub:
        "Ketik jenis kejadian lainnya",
    },
  ];

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

  const closeAlert =
    useCallback(() => {
      const callback =
        alertConfig.onCloseCallback;

      setAlertConfig(
        (prev) => ({
          ...prev,
          isOpen: false,
          onCloseCallback: null,
        })
      );

      if (callback) {
        callback();
      }
    }, [
      alertConfig.onCloseCallback,
    ]);

  // ====================================================
  // IDENTITAS SISWA
  // ====================================================

  useEffect(() => {
    const savedNama =
      localStorage.getItem(
        "namaSiswa"
      ) || "";

    const savedNis =
      localStorage.getItem(
        "nisSiswa"
      ) || "";

    const savedKelas =
      localStorage.getItem(
        "kelasSiswa"
      ) || "";

    setNama(
      savedNama.trim()
    );

    setNis(
      savedNis.trim()
    );

    setKelas(
      savedKelas.trim()
    );

    // Hari kejadian wajib dipilih dari dropdown.
    // Tanggal kalender sengaja dibiarkan kosong karena bersifat opsional.
    setHariKejadian("");
    setTanggal("");
  }, []);

  // ====================================================
  // TTS BAHASA INDONESIA - TANPA API / TANPA AUDIO FILE
  // ====================================================

  const getIndonesianVoice = useCallback(() => {
    if (!("speechSynthesis" in window)) {
      return null;
    }

    const voices =
      window.speechSynthesis.getVoices() || [];

    if (!voices.length) {
      return null;
    }

    // Prioritas utama: voice Indonesia yang benar-benar id-ID.
    const exactId = voices.find(
      (voice) =>
        String(voice.lang || "")
          .toLowerCase()
          .replace(/_/g, "-") === "id-id"
    );

    if (exactId) {
      return exactId;
    }

    // Cadangan: semua voice yang diawali id-
    const indonesiaVoice = voices.find(
      (voice) =>
        String(voice.lang || "")
          .toLowerCase()
          .replace(/_/g, "-")
          .startsWith("id-")
    );

    return indonesiaVoice || null;
  }, []);

  const speakText = useCallback(
    (text) => {
      if (!("speechSynthesis" in window)) {
        showAlert(
          "warning",
          "Suara Tidak Tersedia",
          "Browser ini belum mendukung fitur suara. Silakan gunakan Chrome atau Edge terbaru."
        );
        return;
      }

      const cleanText = String(text || "").trim();

      if (!cleanText) {
        return;
      }

      // Hentikan bacaan sebelumnya.
      window.speechSynthesis.cancel();
      setIsSpeaking(false);

      const startSpeaking = () => {
        const voice = getIndonesianVoice();

        // Jangan diam-diam menggunakan voice Inggris.
        if (!voice) {
          setIsSpeaking(false);

          showAlert(
            "warning",
            "Suara Bahasa Indonesia Tidak Ditemukan",
            "Perangkat atau browser ini belum menyediakan voice Bahasa Indonesia (id-ID). Coba buka aplikasi di Chrome atau Edge dan pastikan voice Bahasa Indonesia tersedia di perangkat."
          );

          return;
        }

        const utterance =
          new SpeechSynthesisUtterance(
            cleanText
          );

        utterance.lang = "id-ID";
        utterance.voice = voice;

        // Kecepatan sedikit diperlambat agar lebih mudah
        // dipahami oleh anak SD.
        utterance.rate = 0.88;
        utterance.pitch = 1.05;
        utterance.volume = 1;

        utterance.onstart = () => {
          setIsSpeaking(true);
        };

        utterance.onend = () => {
          setIsSpeaking(false);
        };

        utterance.onerror = (event) => {
          console.warn(
            "Speech synthesis error:",
            event.error
          );

          setIsSpeaking(false);
        };

        window.speechSynthesis.speak(
          utterance
        );
      };

      // Pada beberapa browser, getVoices() kosong pada pemanggilan pertama.
      // Beri kesempatan browser memuat daftar voice terlebih dahulu.
      const voices =
        window.speechSynthesis.getVoices();

      if (voices.length > 0) {
        startSpeaking();
        return;
      }

      let finished = false;

      const handleVoicesChanged = () => {
        if (finished) return;

        finished = true;

        window.speechSynthesis.removeEventListener(
          "voiceschanged",
          handleVoicesChanged
        );

        startSpeaking();
      };

      window.speechSynthesis.addEventListener(
        "voiceschanged",
        handleVoicesChanged
      );

      // Fallback jika browser tidak menembakkan voiceschanged.
      setTimeout(() => {
        if (finished) return;

        finished = true;

        window.speechSynthesis.removeEventListener(
          "voiceschanged",
          handleVoicesChanged
        );

        startSpeaking();
      }, 1000);
    },
    [getIndonesianVoice, showAlert]
  );

  // ====================================================
  // STOP TTS
  // ====================================================

  const stopAudio = useCallback(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(false);
  }, []);

  // ====================================================
  // SPEECH TO TEXT
  // ====================================================

  const startVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showAlert(
        "warning",
        "Fitur Bicara Tidak Tersedia",
        "Browser ini belum mendukung input suara. Kamu masih bisa mengetik ceritamu."
      );

      return;
    }

    if (isListening) {
      stopVoiceInput();

      return;
    }

    try {
      const recognition =
        new SpeechRecognition();

      /*
       * Input suara tetap diarahkan
       * ke Bahasa Indonesia.
       */

      recognition.lang =
        "id-ID";

      recognition.continuous =
        false;

      recognition.interimResults =
        false;

      recognition.maxAlternatives =
        1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (
        event
      ) => {
        const transcript =
          event.results?.[0]?.[0]
            ?.transcript || "";

        if (!transcript.trim()) {
          return;
        }

        setCerita(
          (previous) => {
            const oldText =
              previous.trim();

            if (!oldText) {
              return transcript.trim();
            }

            return (
              oldText +
              " " +
              transcript.trim()
            );
          }
        );
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
            "Mikrofon Belum Diizinkan",
            "Izinkan akses mikrofon agar kamu bisa bercerita dengan suara."
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
      console.error(error);

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
      console.warn(error);
    }

    setIsListening(false);
  };

  // ====================================================
  // CLEANUP
  // ====================================================

  useEffect(() => {
    return () => {
      stopAudio();

      try {
        if (
          recognitionRef.current
        ) {
          recognitionRef.current.stop();
        }
      } catch (error) {
        console.warn(error);
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
        !hariKejadian ||
        !lokasiFinal ||
        !jenisFinal ||
        !ceritaFinal
      ) {
        submitLockRef.current =
          false;

        showAlert(
          "warning",
          "Form Belum Lengkap",
          "Yuk pilih hari kejadian, tempat kejadian, jenis kejadian, dan ceritamu."
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

          hariKejadian,

          // Tanggal tetap disimpan agar data lama tetap kompatibel.
          // Jika kalender tidak dipilih, nilainya "-".
          tanggal: tanggal || "-",

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

        <div
          style={{
            marginTop: "12px",
          }}
        >
          <button
            type="button"
            style={
              isSpeaking
                ? styles.speakingButton
                : styles.speakButton
            }
            onClick={() => {
              if (isSpeaking) {
                stopAudio();
              } else {
                speakText(
                  "Ceritakan yuk. Kamu boleh bercerita tentang hal yang membuatmu tidak nyaman. Kami akan mendengarkanmu."
                );
              }
            }}
          >
            {isSpeaking
              ? "⏹️ Berhenti"
              : "🔊 Dengarkan"}
          </button>
        </div>
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

              <button
                type="button"
                style={
                  styles.speakButton
                }
                onClick={() =>
                  speakText(
                    "Nama kamu."
                  )
                }
              >
                🔊
              </button>
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

              <button
                type="button"
                style={
                  styles.speakButton
                }
                onClick={() =>
                  speakText(
                    "Nomor NIS."
                  )
                }
              >
                🔊
              </button>
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
                style={
                  styles.childSelect
                }
                disabled={loading}
              >
                <option value="">
                  Pilih kelas kamu
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

          {/* PERAN */}

          <div style={styles.group}>
            <div
              style={
                styles.labelRow
              }
            >
              <label
                style={styles.label}
              >
                👀 Kamu mengalami atau
                melihat?
              </label>

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

          {/* HARI & TANGGAL KEJADIAN */}

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
                  📅 Kapan kejadiannya?
                </label>

                <div
                  style={
                    styles.helperText
                  }
                >
                  Pilih hari kejadiannya. Tanggal kalender boleh diisi kalau kamu ingat.
                </div>
              </div>

              <button
                type="button"
                style={
                  styles.speakButton
                }
                onClick={() =>
                  speakText(
                    "Kapan kejadiannya? Pilih hari dari Senin sampai Minggu. Kalau kamu ingat tanggal tepatnya, kamu boleh memilih tanggal di kalender."
                  )
                }
              >
                🔊
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
                📅
              </span>

              <select
                value={hariKejadian}
                onChange={(e) =>
                  setHariKejadian(
                    e.target.value
                  )
                }
                style={
                  styles.childSelect
                }
                disabled={loading}
              >
                <option value="">
                  Pilih hari kejadian
                </option>

                {listHari.map(
                  (hari) => (
                    <option
                      key={hari}
                      value={hari}
                    >
                      {hari}
                    </option>
                  )
                )}
              </select>
            </div>

            <div
              style={{
                marginTop: "10px",
                padding: "10px 12px",
                borderRadius: "12px",
                background: "#F8FFF6",
                border: "1.5px solid #E0EEDB",
              }}
            >
              <label
                style={{
                  ...styles.label,
                  fontSize: "13px",
                  marginBottom: "6px",
                }}
              >
                Tanggal tepat (opsional)
              </label>

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

              <div
                style={{
                  ...styles.helperText,
                  marginTop: "6px",
                }}
              >
                Boleh dikosongkan kalau kamu tidak ingat tanggal pastinya.
              </div>
            </div>
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
                🔊
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
                🔊
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

            {jenis &&
              jenis !==
                "Lainnya" && (
              <div
                style={
                  styles.voiceHelp
                }
              >
                💡{" "}
                {
                  listJenisBullying.find(
                    (item) =>
                      item.value ===
                      jenis
                  )?.sub
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
                  value={
                    jenisLainnya
                  }
                  onChange={(e) =>
                    setJenisLainnya(
                      e.target.value
                    )
                  }
                  placeholder="Ceritakan jenis kejadian..."
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

              <div
                style={{
                  display: "flex",
                  gap: "6px",
                }}
              >
                <button
                  type="button"
                  style={
                    isSpeaking
                      ? styles.speakingButton
                      : styles.speakButton
                  }
                  onClick={() => {
                    if (isSpeaking) {
                      stopAudio();
                    } else {
                      speakText(
                        "Ceritakan dengan kata-katamu. Tidak perlu panjang. Tulis apa yang kamu ingat."
                      );
                    }
                  }}
                >
                  {isSpeaking
                    ? "⏹️"
                    : "🔊"}
                </button>

                <button
                  type="button"
                  style={
                    isListening
                      ? styles.listeningButton
                      : styles.voiceButton
                  }
                  onClick={
                    startVoiceInput
                  }
                  disabled={loading}
                >
                  {isListening
                    ? "⏹️ Stop"
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

            <div
              style={
                styles.voiceHelp
              }
            >
              💡 Kalau sulit mengetik,
              tekan <strong>🎤 Bicara</strong>{" "}
              lalu ceritakan dengan suaramu.
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
                    color: "#667C5E",
                    fontWeight: "600",
                  }}
                >
                  {" "}
                  (boleh dikosongkan)
                </span>
              </label>

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
              value={pelaku}
              onChange={(e) =>
                setPelaku(
                  e.target.value
                )
              }
              placeholder="Nama teman atau orangnya..."
              style={styles.input}
              disabled={loading}
            />
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

              <button
                type="button"
                style={
                  styles.speakButton
                }
                onClick={() =>
                  speakText(
                    "Ada teman yang melihat? Pilih ada teman atau tidak ada teman."
                  )
                }
              >
                🔊
              </button>
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
                  value={
                    namaSaksi
                  }
                  onChange={(e) =>
                    setNamaSaksi(
                      e.target.value
                    )
                  }
                  placeholder="Nama teman..."
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