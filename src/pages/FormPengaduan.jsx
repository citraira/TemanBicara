import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ref as dbRef, push } from "firebase/database";
import { db } from "../firebase";

const styles = {
  page: {
    minHeight: "100dvh",
    background: "#F4FBEE",
    padding: "20px 15px 40px",
    fontFamily: "'Segoe UI', Roboto, sans-serif",
    boxSizing: "border-box",
  },
  header: {
    background: "#2E7D32",
    color: "#fff",
    padding: "22px 20px",
    borderRadius: "18px",
    marginBottom: "16px",
    textAlign: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  },
  title: { fontSize: "22px", fontWeight: "800", margin: "0 0 6px 0" },
  subtitle: { fontSize: "13px", lineHeight: "1.5", margin: 0, opacity: 0.95 },
  hotlineBox: {
    background: "#FFFDE7",
    border: "1.5px solid #FFF59D",
    borderRadius: "14px",
    padding: "14px 18px",
    maxWidth: "750px",
    margin: "0 auto 16px auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
    boxSizing: "border-box",
  },
  hotlineText: { color: "#1B5E20", fontSize: "13px", lineHeight: "1.4" },
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
    padding: "24px 20px",
    borderRadius: "18px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
    border: "1.5px solid #C8E6C9",
    boxSizing: "border-box",
  },
  group: { marginBottom: "20px" },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "700",
    color: "#1B5E20",
    fontSize: "13.5px",
  },
  input: {
    width: "100%",
    padding: "11px 14px",
    borderRadius: "10px",
    border: "1.5px solid #C8E6C9",
    fontSize: "16px",
    boxSizing: "border-box",
    outline: "none",
    background: "#FAFAFA",
  },
  textarea: {
    width: "100%",
    minHeight: "110px",
    padding: "11px 14px",
    borderRadius: "10px",
    border: "1.5px solid #C8E6C9",
    fontSize: "16px",
    resize: "vertical",
    boxSizing: "border-box",
    outline: "none",
    background: "#FAFAFA",
  },
  gridKelas: {
    display: "grid",
    gridTemplateColumns: "repeat(6, 1fr)",
    gap: "8px",
  },
  btnKelas: (selected) => ({
    padding: "10px 0",
    textAlign: "center",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "14px",
    border: `1.5px solid ${selected ? "#2E7D32" : "#E0E0E0"}`,
    background: selected ? "#2E7D32" : "#FAFAFA",
    color: selected ? "#fff" : "#333",
  }),
  gridPeran: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },
  btnPeran: (selected) => ({
    padding: "12px",
    textAlign: "center",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "13px",
    border: `1.5px solid ${selected ? "#2E7D32" : "#E0E0E0"}`,
    background: selected ? "#E8F5E9" : "#FAFAFA",
    color: selected ? "#1B5E20" : "#444",
  }),
  gridLokasi: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
    gap: "8px",
  },
  btnLokasi: (selected) => ({
    padding: "10px 8px",
    textAlign: "center",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "12.5px",
    border: `1.5px solid ${selected ? "#2E7D32" : "#E0E0E0"}`,
    background: selected ? "#2E7D32" : "#FAFAFA",
    color: selected ? "#fff" : "#333",
  }),
  gridJenis: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "10px",
  },
  cardJenis: (selected) => ({
    padding: "12px 14px",
    borderRadius: "12px",
    cursor: "pointer",
    border: `1.5px solid ${selected ? "#2E7D32" : "#E0E0E0"}`,
    background: selected ? "#E8F5E9" : "#FAFAFA",
    boxSizing: "border-box",
  }),
  gridSaksi: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },
  btnSaksi: (selected) => ({
    padding: "11px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "13px",
    textAlign: "center",
    border: `1.5px solid ${selected ? "#2E7D32" : "#E0E0E0"}`,
    background: selected ? "#2E7D32" : "#FAFAFA",
    color: selected ? "#fff" : "#333",
  }),
  antiFitnahBox: {
    background: "#FFFDE7",
    border: "1.5px solid #FFF59D",
    borderRadius: "12px",
    padding: "12px 14px",
    marginBottom: "20px",
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
  },
  btnContainer: { display: "flex", gap: "10px", flexWrap: "wrap" },
  submitBtn: (disabled) => ({
    flex: "1 1 180px",
    padding: "13px",
    background: disabled ? "#A5D6A7" : "#2E7D32",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: "14px",
    fontWeight: "800",
    boxShadow: disabled ? "none" : "0 3px 0 #1B5E20",
    textTransform: "uppercase",
  }),
  backBtn: {
    flex: "1 1 180px",
    padding: "13px",
    background: "#FFEB3B",
    color: "#1B5E20",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "800",
    boxShadow: "0 3px 0 #FBC02D",
    textTransform: "uppercase",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
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
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
    border: "1.5px solid #C8E6C9",
    boxSizing: "border-box",
  },
  modalTitle: { fontSize: "18px", fontWeight: "800", margin: "0 0 8px 0" },
  modalMsg: { fontSize: "13px", color: "#556B4D", lineHeight: "1.5", margin: "0 0 18px 0" },
  alertBtn: (type) => ({
    width: "100%",
    padding: "11px",
    border: "none",
    borderRadius: "10px",
    fontWeight: "800",
    fontSize: "13px",
    cursor: "pointer",
    textTransform: "uppercase",
    color: type === "warning" ? "#1B5E20" : "#fff",
    background: type === "success" ? "#2E7D32" : type === "error" ? "#D32F2F" : "#FFEB3B",
    boxShadow: type === "success" ? "0 3px 0 #1B5E20" : type === "error" ? "0 3px 0 #9A0007" : "0 3px 0 #FBC02D",
  }),
};

function FormPengaduan() {
  const navigate = useNavigate();

  const CLOUD_NAME = "r61tomq9";
  const UPLOAD_PRESET = "ml_default";
  const NOMOR_WA_GURU = "6281234567890";

  const [nama, setNama] = useState("");
  const [kelas, setKelas] = useState("");
  const [peran, setPeran] = useState("Korban");
  const [tanggal, setTanggal] = useState("");

  const [lokasi, setLokasi] = useState("");
  const [lokasiLainnya, setLokasiLainnya] = useState("");

  const [jenis, setJenis] = useState("");
  const [jenisLainnya, setJenisLainnya] = useState("");

  const [cerita, setCerita] = useState("");
  const [pelaku, setPelaku] = useState("");

  const [saksi, setSaksi] = useState("Tidak");
  const [namaSaksi, setNamaSaksi] = useState("");
  const [kelasSaksi, setKelasSaksi] = useState("");

  const [setujuJujur, setSetujuJujur] = useState(false);
  const [foto, setFoto] = useState(null);
  const [loading, setLoading] = useState(false);

  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
    onCloseCallback: null,
  });

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
    const namaSaved = localStorage.getItem("namaSiswa") || "";
    const kelasSaved = localStorage.getItem("kelasSiswa") || "";

    // Nilai dari localStorage hanya digunakan saat state masih kosong.
    // Tidak ada effect yang bergantung pada state input, sehingga mengetik
    // tidak akan memicu pengisian ulang form.
    setNama((current) => (current ? current : namaSaved));
    setKelas((current) => (current ? current : kelasSaved));
  }, []);

  const listKelas = ["1", "2", "3", "4", "5", "6"];
  const listPeran = [
    { id: "Korban", label: "Saya Sendiri (Korban)" },
    { id: "Saksi / Teman", label: "Teman Saya (Saksi Mata)" },
  ];
  const listLokasi = [
    "Ruang Kelas",
    "Halaman Sekolah",
    "Kantin",
    "Lapangan",
    "Perpustakaan",
    "Toilet",
    "Depan Gerbang",
    "Lainnya",
  ];
  const listJenisBullying = [
    { label: "Kekerasan Fisik", sub: "Dipukul, ditendang, didorong" },
    { label: "Kekerasan Verbal", sub: "Diejek, dihina, dipanggil nama buruk" },
    { label: "Pengucilan Sosial", sub: "Dijauhi teman, disebarkan fitnah" },
    { label: "Pemalakan / Ancaman", sub: "Uang atau barang diambil paksa" },
    { label: "Cyberbullying", sub: "Melalui pesan chat / media sosial" },
    { label: "Lainnya", sub: "Ketik jenis kejadian lainnya" },
  ];

  // Kompresi Gambar Cepat agar Ringan di Jaringan Lambat
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onerror = () => {
        reject(new Error("Gagal membaca file gambar."));
      };

      reader.onload = (e) => {
        const img = new Image();

        img.onerror = () => {
          reject(new Error("File gambar tidak dapat diproses."));
        };

        img.onload = () => {
          const canvas = document.createElement("canvas");

          // Batas resolusi supaya fallback tidak membuat data Firebase terlalu besar.
          const MAX_WIDTH = 640;
          const MAX_HEIGHT = 640;

          const scale = Math.min(
            1,
            MAX_WIDTH / img.width,
            MAX_HEIGHT / img.height
          );

          canvas.width = Math.max(1, Math.round(img.width * scale));
          canvas.height = Math.max(1, Math.round(img.height * scale));

          const ctx = canvas.getContext("2d");

          if (!ctx) {
            reject(new Error("Browser tidak mendukung pemrosesan gambar."));
            return;
          }

          ctx.drawImage(
            img,
            0,
            0,
            canvas.width,
            canvas.height
          );

          // Kualitas 55% cukup untuk bukti foto dan jauh lebih ringan.
          resolve(
            canvas.toDataURL("image/jpeg", 0.55)
          );
        };

        img.src = e.target.result;
      };

      reader.readAsDataURL(file);
    });
  };

  const uploadToCloudinary = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6 detik batas timeout

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Gagal upload");
      return data.secure_url;
    } catch (err) {
      console.warn("Upload lambat, kompres lokal:", err);
      return await compressImage(file);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    // Cegah submit ganda ketika tombol ditekan berkali-kali.
    if (loading) return;

    const lokasiFinal = lokasi === "Lainnya" ? lokasiLainnya : lokasi;
    const jenisFinal = jenis === "Lainnya" ? jenisLainnya : jenis;

    const nisSiswa = localStorage.getItem("nisSiswa") || "";

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
      showAlert("warning", "Form Belum Lengkap", "Mohon lengkapi seluruh data wajib sebelum mengirimkan laporan.");
      return;
    }

    if (!setujuJujur) {
      showAlert("warning", "Pernyataan Kejujuran", "Harap centang konfirmasi kejujuran di bagian bawah.");
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
        nis: nisSiswa,
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
        "Laporan Berhasil Terkirim",
        "Laporanmu telah diterima oleh guru BK. Identitas dan ceritamu dijamin aman.",
        () => {
          navigate("/dashboard-siswa");
        }
      );
    } catch (error) {
      showAlert("error", "Gagal Mengirim", error.message || "Terjadi kendala jaringan saat mengirim laporan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Formulir Pengaduan Siswa</h1>
        <p style={styles.subtitle}>Ceritakan kejadian yang dialami atau disaksikan secara jujur dan aman.</p>
      </div>

      <div style={styles.hotlineBox}>
        <div style={styles.hotlineText}>
          <strong>Perlu bantuan langsung?</strong> Hubungi Guru BK melalui WhatsApp.
        </div>
        <a
          href={`https://wa.me/${NOMOR_WA_GURU}?text=Halo%20Bapak/Ibu%20Guru,%20saya%20ingin%20berkonsultasi.`}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.hotlineBtn}
        >
          Chat Guru
        </a>
      </div>

      <div style={styles.container}>
        <form onSubmit={handleSubmit}>
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

          <div style={styles.group}>
            <label style={styles.label}>Pilih Kelas *</label>
            <div style={styles.gridKelas}>
              {listKelas.map((k) => (
                <button
                  key={k}
                  type="button"
                  style={styles.btnKelas(kelas === k)}
                  onClick={() => setKelas(k)}
                >
                  Kelas {k}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.group}>
            <label style={styles.label}>Melaporkan Sebagai *</label>
            <div style={styles.gridPeran}>
              {listPeran.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  style={styles.btnPeran(peran === item.id)}
                  onClick={() => setPeran(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.group}>
            <label style={styles.label}>Tanggal Kejadian *</label>
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              style={styles.input}
              disabled={loading}
            />
          </div>

          <div style={styles.group}>
            <label style={styles.label}>Lokasi Kejadian *</label>
            <div style={styles.gridLokasi}>
              {listLokasi.map((item) => (
                <button
                  key={item}
                  type="button"
                  style={styles.btnLokasi(lokasi === item)}
                  onClick={() => setLokasi(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            {lokasi === "Lainnya" && (
              <input
                type="text"
                placeholder="Tuliskan lokasi tempat kejadian..."
                value={lokasiLainnya}
                onChange={(e) => setLokasiLainnya(e.target.value)}
                style={{ ...styles.input, marginTop: "10px" }}
                disabled={loading}
              />
            )}
          </div>

          <div style={styles.group}>
            <label style={styles.label}>Bentuk Tindakan yang Terjadi *</label>
            <div style={styles.gridJenis}>
              {listJenisBullying.map((item) => (
                <div
                  key={item.label}
                  style={styles.cardJenis(jenis === item.label)}
                  onClick={() => setJenis(item.label)}
                >
                  <div
                    style={{
                      fontWeight: "700",
                      fontSize: "13.5px",
                      color: jenis === item.label ? "#1B5E20" : "#2E3D29",
                    }}
                  >
                    {item.label}
                  </div>
                  <div style={{ fontSize: "12px", color: "#667C5E", marginTop: "3px" }}>
                    {item.sub}
                  </div>
                </div>
              ))}
            </div>

            {jenis === "Lainnya" && (
              <input
                type="text"
                placeholder="Tuliskan tindakan yang dialami..."
                value={jenisLainnya}
                onChange={(e) => setJenisLainnya(e.target.value)}
                style={{ ...styles.input, marginTop: "10px" }}
                disabled={loading}
              />
            )}
          </div>

          <div style={styles.group}>
            <label style={styles.label}>Kronologi / Cerita Kejadian *</label>
            <textarea
              value={cerita}
              onChange={(e) => setCerita(e.target.value)}
              placeholder="Ceritakan kejadian secara jelas dan rinci..."
              style={styles.textarea}
              disabled={loading}
            />
          </div>

          <div style={styles.group}>
            <label style={styles.label}>Pihak yang Terlibat / Pelaku (Opsional)</label>
            <input
              type="text"
              value={pelaku}
              onChange={(e) => setPelaku(e.target.value)}
              placeholder="Nama siswa atau pihak yang melakukan (jika tahu)"
              style={styles.input}
              disabled={loading}
            />
          </div>

          <div style={styles.group}>
            <label style={styles.label}>Apakah Ada Saksi Mata?</label>
            <div style={styles.gridSaksi}>
              <button
                type="button"
                style={styles.btnSaksi(saksi === "Tidak")}
                onClick={() => setSaksi("Tidak")}
              >
                Tidak Ada
              </button>
              <button
                type="button"
                style={styles.btnSaksi(saksi === "Ya")}
                onClick={() => setSaksi("Ya")}
              >
                Ada Saksi
              </button>
            </div>
          </div>

          {saksi === "Ya" && (
            <div
              style={{
                background: "#FAFAFA",
                padding: "14px",
                borderRadius: "12px",
                border: "1.5px dashed #C8E6C9",
                marginBottom: "20px",
              }}
            >
              <div style={{ marginBottom: "10px" }}>
                <label style={styles.label}>Nama Saksi Mata</label>
                <input
                  type="text"
                  value={namaSaksi}
                  onChange={(e) => setNamaSaksi(e.target.value)}
                  placeholder="Nama teman yang melihat"
                  style={styles.input}
                  disabled={loading}
                />
              </div>
              <div>
                <label style={styles.label}>Kelas Saksi Mata (Opsional)</label>
                <input
                  type="text"
                  value={kelasSaksi}
                  onChange={(e) => setKelasSaksi(e.target.value)}
                  style={styles.input}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <div style={styles.group}>
            <label style={styles.label}>Unggah Foto Bukti (Opsional)</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/*"
              onChange={(e) => setFoto(e.target.files[0])}
              style={styles.input}
              disabled={loading}
            />
          </div>

          <div style={styles.antiFitnahBox}>
            <input
              type="checkbox"
              id="jujurCheck"
              checked={setujuJujur}
              onChange={(e) => setSetujuJujur(e.target.checked)}
              style={{ width: "18px", height: "18px", cursor: "pointer", marginTop: "2px" }}
              disabled={loading}
            />
            <label
              htmlFor="jujurCheck"
              style={{
                fontSize: "12.5px",
                color: "#1B5E20",
                cursor: "pointer",
                lineHeight: "1.4",
                fontWeight: "600",
              }}
            >
              <strong>Pernyataan:</strong> Saya menyatakan bahwa laporan ini dibuat dengan sebenar-benarnya tanpa merekayasa cerita.
            </label>
          </div>

          <div style={styles.btnContainer}>
            <button
              type="submit"
              style={styles.submitBtn(loading || !setujuJujur)}
              disabled={loading || !setujuJujur}
            >
              {loading ? "Mengirim..." : "Kirim Laporan"}
            </button>

            <button
              type="button"
              style={styles.backBtn}
              onClick={() => navigate("/dashboard-siswa")}
              disabled={loading}
            >
              Kembali
            </button>
          </div>
        </form>
      </div>

      {alertConfig.isOpen && (
        <div style={styles.modalOverlay} onClick={handleCloseAlert}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
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

            <p style={styles.modalMsg}>{alertConfig.message}</p>

            <button style={styles.alertBtn(alertConfig.type)} onClick={handleCloseAlert}>
              Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FormPengaduan;