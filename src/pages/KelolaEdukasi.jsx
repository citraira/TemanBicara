import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ref, onValue, push, update, remove } from "firebase/database";
import { db } from "../firebase";

function KelolaEdukasi() {
  const navigate = useNavigate();
  const [edukasiList, setEdukasiList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [judul, setJudul] = useState("");
  const [kategori, setKategori] = useState("Pencegahan");
  const [ringkasan, setRingkasan] = useState("");
  const [isi, setIsi] = useState("");
  const [editId, setEditId] = useState(null);

  // Read Data Edukasi dari Firebase
  useEffect(() => {
    const edukasiRef = ref(db, "edukasi");
    const unsubscribe = onValue(edukasiRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formatted = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        formatted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setEdukasiList(formatted);
      } else {
        setEdukasiList([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Reset Form Input
  const resetForm = () => {
    setJudul("");
    setKategori("Pencegahan");
    setRingkasan("");
    setIsi("");
    setEditId(null);
  };

  // Tambah atau Update Edukasi
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!judul.trim() || !isi.trim()) {
      alert("Judul dan Isi Konten wajib diisi!");
      return;
    }

    try {
      if (editId) {
        // Mode Edit
        await update(ref(db, `edukasi/${editId}`), {
          judul,
          kategori,
          ringkasan,
          isi,
          updatedAt: new Date().toISOString(),
        });
        alert("Konten edukasi berhasil diperbarui!");
      } else {
        // Mode Tambah
        await push(ref(db, "edukasi"), {
          judul,
          kategori,
          ringkasan,
          isi,
          createdAt: new Date().toISOString(),
        });
        alert("Konten edukasi baru berhasil diterbitkan!");
      }
      resetForm();
    } catch (error) {
      alert("Gagal menyimpan data: " + error.message);
    }
  };

  // Persiapan Edit
  const handleEditClick = (item) => {
    setEditId(item.id);
    setJudul(item.judul);
    setKategori(item.kategori || "Pencegahan");
    setRingkasan(item.ringkasan || "");
    setIsi(item.isi);
  };

  // Hapus Konten
  const handleHapus = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus konten edukasi ini?")) {
      try {
        await remove(ref(db, `edukasi/${id}`));
        alert("Konten berhasil dihapus.");
      } catch (error) {
        alert("Gagal menghapus: " + error.message);
      }
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
      padding: "20px",
      borderRadius: "20px",
      marginBottom: "20px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
      flexWrap: "wrap",
      gap: "12px",
    },
    title: { fontSize: "22px", fontWeight: "800", margin: 0 },
    subtitle: { margin: "4px 0 0 0", fontSize: "13px", opacity: 0.95 },
    backBtn: {
      padding: "10px 16px",
      background: "#FFEB3B",
      color: "#1B5E20",
      border: "none",
      borderRadius: "12px",
      cursor: "pointer",
      fontWeight: "800",
      fontSize: "13px",
      boxShadow: "0 3px 0 #FBC02D",
    },
    formCard: {
      background: "#fff",
      padding: "20px 18px",
      borderRadius: "18px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
      border: "2px solid #C8E6C9",
      marginBottom: "25px",
    },
    formTitle: {
      marginTop: 0,
      color: "#1B5E20",
      fontSize: "18px",
      fontWeight: "800",
      marginBottom: "15px",
    },
    group: { marginBottom: "15px" },
    label: { display: "block", fontWeight: "700", marginBottom: "6px", color: "#1B5E20", fontSize: "13px" },
    input: {
      width: "100%",
      padding: "10px 12px",
      borderRadius: "10px",
      border: "2px solid #C8E6C9",
      fontSize: "14px",
      boxSizing: "border-box",
      outline: "none",
      background: "#FAFAFA",
    },
    textarea: {
      width: "100%",
      minHeight: "120px",
      padding: "10px 12px",
      borderRadius: "10px",
      border: "2px solid #C8E6C9",
      fontSize: "14px",
      resize: "vertical",
      boxSizing: "border-box",
      outline: "none",
      background: "#FAFAFA",
    },
    btnContainer: {
      display: "flex",
      gap: "10px",
      flexWrap: "wrap",
    },
    btnSubmit: {
      padding: "12px 18px",
      background: editId ? "#FFEB3B" : "#2E7D32",
      color: editId ? "#1B5E20" : "#fff",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      fontWeight: "800",
      fontSize: "13px",
      boxShadow: editId ? "0 3px 0 #FBC02D" : "0 3px 0 #1B5E20",
      textTransform: "uppercase",
    },
    btnCancel: {
      padding: "12px 18px",
      background: "#E0E0E0",
      color: "#333",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      fontWeight: "800",
      fontSize: "13px",
    },
    sectionHeading: {
      color: "#1B5E20",
      fontSize: "18px",
      fontWeight: "800",
      marginBottom: "15px",
    },
    card: {
      background: "#fff",
      padding: "18px 16px",
      borderRadius: "16px",
      marginBottom: "15px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
      borderLeft: "6px solid #2E7D32",
      borderTop: "1px solid #E8F5E9",
      borderRight: "1px solid #E8F5E9",
      borderBottom: "1px solid #E8F5E9",
    },
    kategoriBadge: {
      background: "#FFEB3B",
      color: "#1B5E20",
      padding: "4px 10px",
      borderRadius: "8px",
      fontSize: "12px",
      fontWeight: "800",
    },
    btnEdit: {
      padding: "6px 14px",
      background: "#FFEB3B",
      color: "#1B5E20",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "800",
      fontSize: "12px",
      boxShadow: "0 2px 0 #FBC02D",
    },
    btnHapus: {
      padding: "6px 14px",
      background: "#D32F2F",
      color: "#fff",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "800",
      fontSize: "12px",
    },
  };

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Kelola Konten Edukasi</h2>
          <p style={styles.subtitle}>
            Tambah dan edit artikel / panduan edukasi anti-bullying
          </p>
        </div>
        <button style={styles.backBtn} onClick={() => navigate("/dashboard-admin")}>
          Kembali ke Dashboard
        </button>
      </div>

      {/* FORM EDIT / TAMBAH */}
      <div style={styles.formCard}>
        <h3 style={styles.formTitle}>
          {editId ? "Edit Konten Edukasi" : "Tambah Konten Edukasi Baru"}
        </h3>
        <form onSubmit={handleSubmit}>
          <div style={styles.group}>
            <label style={styles.label}>Judul Artikel / Materi</label>
            <input
              type="text"
              placeholder="Contoh: Mengenal Bentuk-Bentuk Bullying"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
            <div style={styles.group}>
              <label style={styles.label}>Kategori</label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                style={styles.input}
              >
                <option value="Pencegahan">Pencegahan</option>
                <option value="Panduan Korban">Panduan Korban</option>
                <option value="Peran Saksi">Peran Saksi Mata</option>
                <option value="Hukum & Aturan">Hukum & Aturan Sekolah</option>
              </select>
            </div>

            <div style={styles.group}>
              <label style={styles.label}>Ringkasan Singkat (Opsional)</label>
              <input
                type="text"
                placeholder="Rangkuman 1 kalimat tentang artikel ini"
                value={ringkasan}
                onChange={(e) => setRingkasan(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.group}>
            <label style={styles.label}>Isi Lengkap Artikel / Materi</label>
            <textarea
              placeholder="Tuliskan materi edukasi di sini secara detail..."
              value={isi}
              onChange={(e) => setIsi(e.target.value)}
              style={styles.textarea}
            />
          </div>

          <div style={styles.btnContainer}>
            <button type="submit" style={styles.btnSubmit}>
              {editId ? "Simpan Perubahan" : "Terbitkan Konten"}
            </button>
            {editId && (
              <button type="button" style={styles.btnCancel} onClick={resetForm}>
                Batal Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* LIST KONTEN YANG SUDAH DIPUBLIKASIKAN */}
      <h3 style={styles.sectionHeading}>Daftar Konten Edukasi Terpublikasi</h3>
      {loading ? (
        <div style={{ color: "#1B5E20", fontWeight: "600" }}>Memuat materi edukasi...</div>
      ) : edukasiList.length === 0 ? (
        <div style={{ color: "#556B4D", fontStyle: "italic" }}>
          Belum ada materi edukasi. Silakan buat materi baru di atas.
        </div>
      ) : (
        edukasiList.map((item) => (
          <div key={item.id} style={styles.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "6px" }}>
              <span style={styles.kategoriBadge}>
                {item.kategori}
              </span>
              <span style={{ fontSize: "12px", color: "#556B4D" }}>
                {new Date(item.createdAt).toLocaleDateString("id-ID")}
              </span>
            </div>
            <h4 style={{ margin: "6px 0", fontSize: "16px", color: "#1B5E20", fontWeight: "800" }}>{item.judul}</h4>
            <p style={{ color: "#556B4D", fontSize: "13px", lineHeight: "1.5", margin: "4px 0 12px 0" }}>
              {item.ringkasan || item.isi.substring(0, 120) + "..."}
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                style={styles.btnEdit}
                onClick={() => handleEditClick(item)}
              >
                Edit
              </button>
              <button
                style={styles.btnHapus}
                onClick={() => handleHapus(item.id)}
              >
                Hapus
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default KelolaEdukasi;