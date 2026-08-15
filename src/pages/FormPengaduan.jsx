import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ref as dbRef, push } from "firebase/database";
import { db } from "../firebase";

function FormPengaduan() {
  const navigate = useNavigate();

  // --- KONFIGURASI CLOUDINARY ---
  const CLOUD_NAME = "r61tomq9";
  const UPLOAD_PRESET = "ml_default";

  // Nomor Hotline Sekolah
  const NOMOR_WA_GURU = "6281234567890";

  const [nama, setNama] = useState("");
  const [kelas, setKelas] = useState("");
  const [peran, setPeran] = useState("Korban");
  const [tanggal, setTanggal] = useState("");

  // Lokasi & Lokasi Lainnya
  const [lokasi, setLokasi] = useState("");
  const [lokasiLainnya, setLokasiLainnya] = useState("");

  // Jenis Bullying & Jenis Lainnya
  const [jenis, setJenis] = useState("");
  const [jenisLainnya, setJenisLainnya] = useState("");

  const [cerita, setCerita] = useState("");
  const [pelaku, setPelaku] = useState("");

  // Saksi Mata Detail
  const [saksi, setSaksi] = useState("Tidak");
  const [namaSaksi, setNamaSaksi] = useState("");
  const [kelasSaksi, setKelasSaksi] = useState("");

  // Pernyataan Kejujuran
  const [setujuJujur, setSetujuJujur] = useState(false);

  const [foto, setFoto] = useState(null);
  const [loading, setLoading] = useState(false);

  // State Pop-Up Notifikasi Kustom (Pengganti alert())
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
    onCloseCallback: null,
  });

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
    const namaSaved = localStorage.getItem("namaSiswa");
    const kelasSaved = localStorage.getItem("kelasSiswa");

    if (namaSaved) setNama(namaSaved);
    if (kelasSaved) setKelas(kelasSaved);
  }, []);

  // DAFTAR PILIHAN KUSTOM
  const listKelas = ["1", "2", "3", "4", "5", "6"];

  const listPeran = [
    { id: "Korban", label: "Saya sendiri yang mengalami (Korban)", icon: "🛡️" },
    { id: "Saksi / Teman", label: "Saya melihat teman saya (Saksi Mata)", icon: "👁️" },
  ];

  const listLokasi = [
    { label: "Ruang Kelas", icon: "🏫" },
    { label: "Halaman Sekolah", icon: "🌳" },
    { label: "Kantin", icon: "🍱" },
    { label: "Lapangan", icon: "⚽" },
    { label: "Perpustakaan", icon: "📚" },
    { label: "Toilet", icon: "🚪" },
    { label: "Depan Gerbang", icon: "🏢" },
    { label: "Lainnya", icon: "✏️" },
  ];

  const listJenisBullying = [
    { label: "Dipukul / Ditendang", desc: "Bullying Fisik", icon: "🥊" },
    { label: "Diejek / Dihina", desc: "Bullying Verbal / Kata-kata", icon: "🗣️" },
    { label: "Dikucilkan Teman", desc: "Bullying Sosial / Dijauhi", icon: "😔" },
    { label: "Diancam / Diperas", desc: "Uang / Barang diambil paksa", icon: "⚠️" },
    { label: "Bullying di Media Sosial", desc: "WhatsApp / Chat / Medsos", icon: "📱" },
    { label: "Lainnya", desc: "Ketik tindakan lainnya", icon: "✏️" },
  ];

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const uploadToCloudinary = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || "Gagal unggah ke Cloudinary");
      }
      return data.secure_url;
    } catch (err) {
      console.warn("Proses Cloudinary kendala, beralih ke Base64...", err);
      return await convertToBase64(file);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    const lokasiFinal = lokasi === "Lainnya" ? lokasiLainnya : lokasi;
    const jenisFinal = jenis === "Lainnya" ? jenisLainnya : jenis;

    if (
      nama.trim() === "" ||
      kelas.trim() === "" ||
      tanggal === "" ||
      lokasi === "" ||
      (lokasi === "Lainnya" && lokasiLainnya.trim() === "") ||
      jenis === "" ||
      (jenis === "Lainnya" && jenisLainnya.trim() === "") ||
      cerita.trim() === ""
    ) {
      showAlert(
        "warning",
        "Data Belum Lengkap",
        "Mohon lengkapi kolom Nama, Kelas, Tanggal, Lokasi, Jenis Kejadian, dan Cerita terlebih dahulu."
      );
      return;
    }

    if (!setujuJujur) {
      showAlert(
        "warning",
        "Pernyataan Kejujuran",
        "Harap centang kotak pernyataan kejujuran sebelum mengirimkan laporan pengaduan."
      );
      return;
    }

    setLoading(true);

    try {
      let imageUrl = "-";

      if (foto) {
        imageUrl = await uploadToCloudinary(foto);
      }

      await push(dbRef(db, "pengaduan"), {
        nama: nama.trim(),
        kelas: kelas.trim(),
        peran,
        tanggal,
        lokasi: lokasiFinal.trim(),
        jenis: jenisFinal.trim(),
        cerita: cerita.trim(),
        pelaku: pelaku.trim() || "Tidak disebutkan",
        saksi: saksi || "Tidak",
        namaSaksi: saksi === "Ya" ? namaSaksi.trim() : "-",
        kelasSaksi: saksi === "Ya" ? kelasSaksi.trim() : "-",
        fotoUrl: imageUrl,
        status: "Diproses",
        createdAt: new Date().toISOString(),
      });

      showAlert(
        "success",
        "Laporan Terkirim!",
        "Laporanmu berhasil dikirim dan tersimpan dengan aman.\n\nTerima kasih sudah berani melapor! Bapak/Ibu Guru BK akan segera menindaklanjuti.",
        () => {
          navigate("/dashboard-siswa");
        }
      );
    } catch (error) {
      showAlert(
        "error",
        "Gagal Mengirim",
        error.message || "Terjadi kesalahan saat mengirim laporan."
      );
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#F4FBEE",
      padding: "20px 15px",
      fontFamily: "'Segoe UI', Roboto, sans-serif",
      boxSizing: "border-box",
    },
    header: {
      background: "#2E7D32",
      color: "#fff",
      padding: "25px 20px",
      borderRadius: "20px",
      marginBottom: "20px",
      textAlign: "center",
      boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    },
    title: { fontSize: "26px", fontWeight: "800", marginBottom: "8px" },
    subtitle: { fontSize: "14px", lineHeight: "1.5", opacity: 0.95 },
    hotlineBox: {
      background: "#FFFDE7",
      border: "2px solid #FFF59D",
      borderRadius: "16px",
      padding: "16px 20px",
      maxWidth: "800px",
      margin: "0 auto 20px auto",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      boxSizing: "border-box",
      flexWrap: "wrap",
      gap: "12px",
    },
    hotlineText: { color: "#1B5E20", fontSize: "14px", fontWeight: "600" },
    hotlineButton: {
      background: "#25D366",
      color: "#fff",
      padding: "10px 16px",
      borderRadius: "12px",
      textDecoration: "none",
      fontWeight: "800",
      fontSize: "13px",
      display: "inline-block",
    },
    container: {
      background: "#fff",
      maxWidth: "800px",
      margin: "auto",
      padding: "25px 20px",
      borderRadius: "20px",
      boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
      border: "2px solid #C8E6C9",
      boxSizing: "border-box",
    },
    group: { marginBottom: "22px" },
    label: {
      display: "block",
      marginBottom: "8px",
      fontWeight: "800",
      color: "#1B5E20",
      fontSize: "14px",
    },
    input: {
      width: "100%",
      padding: "12px 14px",
      borderRadius: "12px",
      border: "2px solid #C8E6C9",
      fontSize: "14px",
      boxSizing: "border-box",
      outline: "none",
      background: "#FAFAFA",
    },
    textarea: {
      width: "100%",
      minHeight: "120px",
      padding: "12px 14px",
      borderRadius: "12px",
      border: "2px solid #C8E6C9",
      fontSize: "14px",
      resize: "vertical",
      boxSizing: "border-box",
      outline: "none",
      background: "#FAFAFA",
    },

    // PILIHAN KELAS (CHIPS/BULATAN)
    kelasGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(6, 1fr)",
      gap: "8px",
    },
    kelasBtn: (selected) => ({
      padding: "12px 0",
      textAlign: "center",
      borderRadius: "12px",
      cursor: "pointer",
      fontWeight: "800",
      fontSize: "15px",
      border: `2px solid ${selected ? "#2E7D32" : "#C8E6C9"}`,
      background: selected ? "#2E7D32" : "#FAFAFA",
      color: selected ? "#fff" : "#1B5E20",
      boxShadow: selected ? "0 3px 0 #1B5E20" : "none",
      transition: "all 0.2s ease",
    }),

    // PILIHAN KARTU DENGAN IKON
    cardOptionGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: "10px",
    },
    optionCard: (selected) => ({
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "12px 14px",
      borderRadius: "14px",
      cursor: "pointer",
      border: `2px solid ${selected ? "#2E7D32" : "#E0E0E0"}`,
      background: selected ? "#E8F5E9" : "#FAFAFA",
      boxShadow: selected ? "0 3px 0 #2E7D32" : "none",
      transition: "all 0.2s ease",
      boxSizing: "border-box",
    }),

    // PILIHAN LOKASI & JENIS BULLYING (GRID CHIPS)
    chipsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
      gap: "8px",
    },
    chipItem: (selected) => ({
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "6px",
      padding: "10px 12px",
      borderRadius: "12px",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: "700",
      border: `2px solid ${selected ? "#2E7D32" : "#C8E6C9"}`,
      background: selected ? "#2E7D32" : "#FAFAFA",
      color: selected ? "#fff" : "#2E3D29",
      boxShadow: selected ? "0 3px 0 #1B5E20" : "none",
      transition: "all 0.2s ease",
      textAlign: "center",
    }),

    // TOGGLE YES/NO SAKSI
    toggleGroup: {
      display: "flex",
      gap: "10px",
    },
    toggleBtn: (selected) => ({
      flex: 1,
      padding: "12px",
      borderRadius: "12px",
      border: `2px solid ${selected ? "#2E7D32" : "#C8E6C9"}`,
      background: selected ? "#2E7D32" : "#FAFAFA",
      color: selected ? "#fff" : "#1B5E20",
      fontWeight: "800",
      fontSize: "14px",
      cursor: "pointer",
      boxShadow: selected ? "0 3px 0 #1B5E20" : "none",
    }),

    antiFitnahBox: {
      background: "#FFFDE7",
      border: "2px solid #FFF59D",
      borderRadius: "12px",
      padding: "14px",
      marginBottom: "20px",
      display: "flex",
      alignItems: "flex-start",
      gap: "10px",
    },
    buttonContainer: {
      display: "flex",
      gap: "12px",
      flexWrap: "wrap",
    },
    submitButton: {
      flex: "1 1 180px",
      padding: "14px",
      background: loading || !setujuJujur ? "#A5D6A7" : "#2E7D32",
      color: "#fff",
      border: "none",
      borderRadius: "12px",
      cursor: loading || !setujuJujur ? "not-allowed" : "pointer",
      fontSize: "15px",
      fontWeight: "800",
      boxShadow: loading || !setujuJujur ? "none" : "0 4px 0 #1B5E20",
      textTransform: "uppercase",
    },
    backButton: {
      flex: "1 1 180px",
      padding: "14px",
      background: "#FFEB3B",
      color: "#1B5E20",
      border: "none",
      borderRadius: "12px",
      cursor: "pointer",
      fontSize: "15px",
      fontWeight: "800",
      boxShadow: "0 4px 0 #FBC02D",
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

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.title}>Form Pengaduan Bullying</div>
        <div style={styles.subtitle}>
          Jangan takut bercerita. Semua laporan akan dijaga kerahasiaannya oleh Guru BK.
        </div>
      </div>

      {/* HOTLINE WA */}
      <div style={styles.hotlineBox}>
        <div style={styles.hotlineText}>
          <strong>Butuh Bantuan Cepat?</strong>
          <br />
          Hubungi Tim Pengaduan Guru langsung via WhatsApp.
        </div>
        <a
          href={`https://wa.me/${NOMOR_WA_GURU}?text=Halo%20Bapak/Ibu%20Guru,%20saya%20ingin%20melaporkan%20kejadian%20bullying.`}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.hotlineButton}
        >
          Chat WhatsApp Guru
        </a>
      </div>

      {/* FORM PENGADUAN DENGAN DESAIN KUSTOM */}
      <div style={styles.container}>
        {/* 1. NAMA SISWA */}
        <div style={styles.group}>
          <label style={styles.label}>Nama Siswa (Pelapor) *</label>
          <input
            type="text"
            placeholder="Masukkan nama lengkap"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            style={styles.input}
            disabled={loading}
          />
        </div>

        {/* 2. PILIHAN KELAS (CHIPS/TOMBOL MODERN) */}
        <div style={styles.group}>
          <label style={styles.label}>Kelas Berapa? *</label>
          <div style={styles.kelasGrid}>
            {listKelas.map((k) => (
              <button
                key={k}
                type="button"
                style={styles.kelasBtn(kelas === k)}
                onClick={() => setKelas(k)}
              >
                Kelas {k}
              </button>
            ))}
          </div>
        </div>

        {/* 3. PERAN PELAPOR (KARTU INTERAKTIF) */}
        <div style={styles.group}>
          <label style={styles.label}>Kamu Melaporkan Sebagai Apa? *</label>
          <div style={styles.cardOptionGrid}>
            {listPeran.map((item) => (
              <div
                key={item.id}
                style={styles.optionCard(peran === item.id)}
                onClick={() => setPeran(item.id)}
              >
                <span style={{ fontSize: "24px" }}>{item.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "800", fontSize: "13px", color: peran === item.id ? "#1B5E20" : "#333" }}>
                    {item.label}
                  </div>
                </div>
                <div
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    border: `2px solid ${peran === item.id ? "#2E7D32" : "#999"}`,
                    background: peran === item.id ? "#2E7D32" : "#fff",
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* 4. TANGGAL */}
        <div style={styles.group}>
          <label style={styles.label}>Kapan Kejadiannya? *</label>
          <input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            style={styles.input}
            disabled={loading}
          />
        </div>

        {/* 5. LOKASI KEJADIAN (CHIPS BERIKON) */}
        <div style={styles.group}>
          <label style={styles.label}>Di Mana Kejadiannya? *</label>
          <div style={styles.chipsGrid}>
            {listLokasi.map((item) => (
              <button
                key={item.label}
                type="button"
                style={styles.chipItem(lokasi === item.label)}
                onClick={() => setLokasi(item.label)}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {lokasi === "Lainnya" && (
            <input
              type="text"
              placeholder="Tuliskan tempat kejadian di sini..."
              value={lokasiLainnya}
              onChange={(e) => setLokasiLainnya(e.target.value)}
              style={{ ...styles.input, marginTop: "12px" }}
              disabled={loading}
            />
          )}
        </div>

        {/* 6. JENIS BULLYING (KARTU PILIHAN INTERAKTIF) */}
        <div style={styles.group}>
          <label style={styles.label}>Apa yang Terjadi? *</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "10px" }}>
            {listJenisBullying.map((item) => (
              <div
                key={item.label}
                style={styles.optionCard(jenis === item.label)}
                onClick={() => setJenis(item.label)}
              >
                <span style={{ fontSize: "26px" }}>{item.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "800", fontSize: "13px", color: jenis === item.label ? "#1B5E20" : "#2E3D29" }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: "11px", color: "#667C5E", marginTop: "2px" }}>
                    {item.desc}
                  </div>
                </div>
                <div
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    border: `2px solid ${jenis === item.label ? "#2E7D32" : "#999"}`,
                    background: jenis === item.label ? "#2E7D32" : "#fff",
                  }}
                />
              </div>
            ))}
          </div>

          {jenis === "Lainnya" && (
            <input
              type="text"
              placeholder="Tuliskan tindakan yang dialami..."
              value={jenisLainnya}
              onChange={(e) => setJenisLainnya(e.target.value)}
              style={{ ...styles.input, marginTop: "12px" }}
              disabled={loading}
            />
          )}
        </div>

        {/* 7. CERITA */}
        <div style={styles.group}>
          <label style={styles.label}>Ceritakan Kejadian Secara Rinci *</label>
          <textarea
            value={cerita}
            onChange={(e) => setCerita(e.target.value)}
            placeholder="Ceritakan apa yang terjadi secara jujur dan lengkap..."
            style={styles.textarea}
            disabled={loading}
          />
        </div>

        {/* 8. PELAKU */}
        <div style={styles.group}>
          <label style={styles.label}>Siapa yang Melakukan? (Jika Tahu)</label>
          <input
            type="text"
            value={pelaku}
            onChange={(e) => setPelaku(e.target.value)}
            placeholder="Nama teman / orang yang melakukan (boleh dikosongkan)"
            style={styles.input}
            disabled={loading}
          />
        </div>

        {/* 9. SAKSI MATA (DUAL TOGGLE BUTTON) */}
        <div style={styles.group}>
          <label style={styles.label}>Apakah Ada Saksi Mata yang Melihat?</label>
          <div style={styles.toggleGroup}>
            <button
              type="button"
              style={styles.toggleBtn(saksi === "Tidak")}
              onClick={() => setSaksi("Tidak")}
            >
              🙅‍♂️ Tidak Ada Saksi
            </button>
            <button
              type="button"
              style={styles.toggleBtn(saksi === "Ya")}
              onClick={() => setSaksi("Ya")}
            >
              👀 Ya, Ada Teman yang Melihat
            </button>
          </div>
        </div>

        {/* DETAIL SAKSI */}
        {saksi === "Ya" && (
          <div style={{ background: "#F8F9FA", padding: "15px", borderRadius: "14px", marginBottom: "20px", border: "2px dashed #C8E6C9" }}>
            <div style={{ ...styles.group, marginBottom: "10px" }}>
              <label style={styles.label}>Nama Saksi Mata</label>
              <input
                type="text"
                value={namaSaksi}
                onChange={(e) => setNamaSaksi(e.target.value)}
                placeholder="Nama teman yang melihat kejadian"
                style={styles.input}
                disabled={loading}
              />
            </div>
            <div style={{ ...styles.group, marginBottom: "0" }}>
              <label style={styles.label}>Kelas Saksi Mata (Opsional)</label>
              <input
                type="text"
                value={kelasSaksi}
                onChange={(e) => setKelasSaksi(e.target.value)}
                placeholder="Contoh: Kelas 3"
                style={styles.input}
                disabled={loading}
              />
            </div>
          </div>
        )}

        {/* 10. UNGGAH FOTO */}
        <div style={styles.group}>
          <label style={styles.label}>Unggah Foto Bukti (Opsional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFoto(e.target.files[0])}
            style={styles.input}
            disabled={loading}
          />
        </div>

        {/* ANTISIPASI FITNAH / PERNYATAAN KEJUJURAN */}
        <div style={styles.antiFitnahBox}>
          <input
            type="checkbox"
            id="jujurCheck"
            checked={setujuJujur}
            onChange={(e) => setSetujuJujur(e.target.checked)}
            style={{ width: "20px", height: "20px", cursor: "pointer", marginTop: "2px" }}
            disabled={loading}
          />
          <label htmlFor="jujurCheck" style={{ fontSize: "13px", color: "#1B5E20", cursor: "pointer", lineHeight: "1.4", fontWeight: "600" }}>
            <strong>Pernyataan Kejujuran:</strong> Saya menyatakan bahwa laporan ini dibuat dengan jujur tanpa merekayasa cerita atau memfitnah pihak mana pun.
          </label>
        </div>

        {/* TOMBOL AKSI */}
        <div style={styles.buttonContainer}>
          <button
            style={styles.submitButton}
            onClick={handleSubmit}
            disabled={loading || !setujuJujur}
          >
            {loading ? "Mengirim..." : "Kirim Laporan"}
          </button>

          <button
            style={styles.backButton}
            onClick={() => navigate("/dashboard-siswa")}
            disabled={loading}
          >
            Kembali
          </button>
        </div>
      </div>

      {/* POP-UP NOTIFIKASI KUSTOM BERDESAIN (PENGGANTI ALERT) */}
      {alertConfig.isOpen && (
        <div style={styles.modalOverlay} onClick={handleCloseAlert}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.alertIconWrapper(alertConfig.type)}>
              {alertConfig.type === "success" ? "✓" : alertConfig.type === "error" ? "✕" : "ℹ"}
            </div>

            <h3
              style={{
                fontSize: "18px",
                fontWeight: "800",
                marginBottom: "8px",
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

            <p style={{ color: "#556B4D", fontSize: "13px", marginBottom: "18px", lineHeight: "1.5", whiteSpace: "pre-line" }}>
              {alertConfig.message}
            </p>

            <button
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

export default FormPengaduan;