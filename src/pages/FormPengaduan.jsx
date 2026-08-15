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
    type: "success", // 'success' | 'error' | 'warning'
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
    if (callback) {
      callback();
    }
  };

  useEffect(() => {
    const namaSaved = localStorage.getItem("namaSiswa");
    const kelasSaved = localStorage.getItem("kelasSiswa");

    if (namaSaved) setNama(namaSaved);
    if (kelasSaved) setKelas(kelasSaved);
  }, []);

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
        console.error("Cloudinary Error Response:", data);
        throw new Error(data.error?.message || "Gagal unggah ke Cloudinary");
      }

      return data.secure_url;
    } catch (err) {
      console.warn("Proses Cloudinary kendala/timeout, beralih ke Base64...", err);
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
        "Laporanmu berhasil dikirim dan tersimpan dengan aman.\n\nTerima kasih sudah berani bercerita! Bapak/Ibu Guru BK akan segera menindaklanjuti.",
        () => {
          navigate("/dashboard-siswa");
        }
      );
    } catch (error) {
      console.error("Submit Error:", error);
      showAlert(
        "error",
        "Gagal Mengirim",
        error.message || "Terjadi kesalahan saat mengirim laporan. Silakan periksa koneksi internet."
      );
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#F4FBEE", // Hijau muda segar
      padding: "20px 15px",
      fontFamily: "'Segoe UI', Roboto, sans-serif",
      boxSizing: "border-box",
    },

    header: {
      background: "#2E7D32", // Hijau utama
      color: "#fff",
      padding: "25px 20px",
      borderRadius: "20px",
      marginBottom: "20px",
      textAlign: "center",
      boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    },

    title: {
      fontSize: "26px",
      fontWeight: "800",
      marginBottom: "8px",
    },

    subtitle: {
      fontSize: "14px",
      lineHeight: "1.5",
      opacity: 0.95,
    },

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

    hotlineText: {
      color: "#1B5E20",
      fontSize: "14px",
      fontWeight: "600",
    },

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

    group: {
      marginBottom: "18px",
    },

    label: {
      display: "block",
      marginBottom: "6px",
      fontWeight: "700",
      color: "#1B5E20",
      fontSize: "14px",
    },

    input: {
      width: "100%",
      padding: "12px 14px",
      borderRadius: "12px",
      border: "2px solid #C8E6C9",
      fontSize: "15px",
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
      fontSize: "15px",
      resize: "vertical",
      boxSizing: "border-box",
      outline: "none",
      background: "#FAFAFA",
    },

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

    // Gaya Modal Pop-up Notifikasi Kustom
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
      whiteSpace: "pre-line",
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
          Jangan takut bercerita. Semua laporan akan dijaga kerahasiaannya oleh guru BK.
        </div>
      </div>

      {/* HOTLINE PENGADUAN LANGSUNG */}
      <div style={styles.hotlineBox}>
        <div style={styles.hotlineText}>
          <strong>Butuh Bantuan Cepat?</strong>
          <br />
          Kamu bisa menghubungi Tim Pengaduan Guru langsung via WhatsApp.
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

      {/* FORM PENGADUAN */}
      <div style={styles.container}>
        {/* NAMA */}
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

        {/* KELAS */}
        <div style={styles.group}>
          <label style={styles.label}>Kelas *</label>
          <select
            value={kelas}
            onChange={(e) => setKelas(e.target.value)}
            style={styles.input}
            disabled={loading}
          >
            <option value="">Pilih Kelas</option>
            <option>1</option>
            <option>2</option>
            <option>3</option>
            <option>4</option>
            <option>5</option>
            <option>6</option>
          </select>
        </div>

        {/* PERAN / STATUS PELAPOR */}
        <div style={styles.group}>
          <label style={styles.label}>Kamu Melaporkan Sebagai Apa? *</label>
          <select
            value={peran}
            onChange={(e) => setPeran(e.target.value)}
            style={styles.input}
            disabled={loading}
          >
            <option value="Korban">
              Saya sendiri yang mengalami (Korban)
            </option>
            <option value="Saksi / Teman">
              Saya melihat / melaporkan teman saya (Saksi Mata)
            </option>
          </select>
        </div>

        {/* TANGGAL */}
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

        {/* LOKASI */}
        <div style={styles.group}>
          <label style={styles.label}>Di Mana Kejadiannya? *</label>
          <select
            value={lokasi}
            onChange={(e) => setLokasi(e.target.value)}
            style={styles.input}
            disabled={loading}
          >
            <option value="">Pilih Lokasi</option>
            <option value="Ruang Kelas">Ruang Kelas</option>
            <option value="Halaman Sekolah">Halaman Sekolah</option>
            <option value="Kantin">Kantin</option>
            <option value="Lapangan">Lapangan</option>
            <option value="Perpustakaan">Perpustakaan</option>
            <option value="Toilet">Toilet</option>
            <option value="Depan Sekolah">Depan Sekolah</option>
            <option value="Lainnya">Tempat Lain / Ketik Sendiri</option>
          </select>

          {lokasi === "Lainnya" && (
            <input
              type="text"
              placeholder="Tuliskan lokasi kejadian..."
              value={lokasiLainnya}
              onChange={(e) => setLokasiLainnya(e.target.value)}
              style={{ ...styles.input, marginTop: "10px" }}
              disabled={loading}
            />
          )}
        </div>

        {/* JENIS BULLYING */}
        <div style={styles.group}>
          <label style={styles.label}>Apa yang Terjadi? *</label>
          <select
            value={jenis}
            onChange={(e) => setJenis(e.target.value)}
            style={styles.input}
            disabled={loading}
          >
            <option value="">Pilih Jenis Bullying</option>
            <option value="Dipukul / Ditendang">Dipukul / Ditendang</option>
            <option value="Diejek / Dihina">Diejek / Dihina</option>
            <option value="Dikucilkan Teman">Dikucilkan Teman</option>
            <option value="Diancam / Diperas">Diancam / Diperas (Uang/Barang)</option>
            <option value="Bullying di Media Sosial">Bullying di Media Sosial</option>
            <option value="Lainnya">Lainnya / Ketik Sendiri</option>
          </select>

          {jenis === "Lainnya" && (
            <input
              type="text"
              placeholder="Tuliskan tindakan bullying yang dialami..."
              value={jenisLainnya}
              onChange={(e) => setJenisLainnya(e.target.value)}
              style={{ ...styles.input, marginTop: "10px" }}
              disabled={loading}
            />
          )}
        </div>

        {/* CERITA */}
        <div style={styles.group}>
          <label style={styles.label}>Ceritakan Apa yang Terjadi *</label>
          <textarea
            value={cerita}
            onChange={(e) => setCerita(e.target.value)}
            placeholder="Ceritakan kejadian secara rinci dan jujur..."
            style={styles.textarea}
            disabled={loading}
          />
        </div>

        {/* PELAKU */}
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

        {/* SAKSI MATA */}
        <div style={styles.group}>
          <label style={styles.label}>Apakah Ada Saksi Mata Lain yang Melihat?</label>
          <select
            value={saksi}
            onChange={(e) => setSaksi(e.target.value)}
            style={styles.input}
            disabled={loading}
          >
            <option value="Tidak">Tidak Ada</option>
            <option value="Ya">Ya, Ada Saksi Mata</option>
          </select>
        </div>

        {/* DETAIL SAKSI */}
        {saksi === "Ya" && (
          <div style={{ background: "#F8F9FA", padding: "15px", borderRadius: "12px", marginBottom: "18px", border: "2px dashed #C8E6C9" }}>
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
                placeholder="Contoh: Kelas 5B"
                style={styles.input}
                disabled={loading}
              />
            </div>
          </div>
        )}

        {/* FOTO */}
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
            style={{ width: "18px", height: "18px", cursor: "pointer", marginTop: "2px" }}
            disabled={loading}
          />
          <label htmlFor="jujurCheck" style={{ fontSize: "13px", color: "#1B5E20", cursor: "pointer", lineHeight: "1.4", fontWeight: "600" }}>
            <strong>Pernyataan Kejujuran:</strong> Saya menyatakan bahwa laporan ini dibuat dengan sebenar-benarnya tanpa merekayasa cerita atau memfitnah pihak mana pun.
          </label>
        </div>

        {/* PESAN TERIMA KASIH */}
        <div
          style={{
            background: "#E8F5E9",
            padding: "15px",
            borderRadius: "12px",
            color: "#1B5E20",
            marginBottom: "20px",
            lineHeight: "1.5",
            fontSize: "13px",
            fontWeight: "600",
          }}
        >
          Terima kasih sudah berani melapor. Guru akan menjaga kerahasiaan laporanmu dan membantu menyelesaikan masalah ini.
        </div>

        {/* TOMBOL */}
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