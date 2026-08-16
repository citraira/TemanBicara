import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ref, get, push, update, remove } from "firebase/database";
import { db } from "../firebase";

function KelolaEdukasi() {
  const navigate = useNavigate();
  const [edukasiList, setEdukasiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Form State
  const [judul, setJudul] = useState("");
  const [kategori, setKategori] = useState("Pencegahan");
  const [ringkasan, setRingkasan] = useState("");
  const [isi, setIsi] = useState("");
  const [editId, setEditId] = useState(null);

  // State Modal Konfirmasi Hapus
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // State Pop-Up Notifikasi Kustom (Pengganti alert())
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    type: "success", // 'success' | 'error' | 'warning'
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

  // Data edukasi tidak membutuhkan listener realtime pada halaman admin.
  // Ambil sekali saat dibuka dan ulangi hanya ketika Refresh diperlukan.
  const loadEdukasi = useCallback(
    async (showInitialLoading = false) => {
      try {
        if (showInitialLoading) {
          setLoading(true);
        }

        const snapshot = await get(ref(db, "edukasi"));

        if (!snapshot.exists()) {
          setEdukasiList([]);
          return;
        }

        const data = snapshot.val();

        const formatted = Object.keys(data)
          .map((key) => ({
            id: key,
            ...data[key],
          }))
          .sort(
            (a, b) =>
              new Date(b.updatedAt || b.createdAt || 0) -
              new Date(a.updatedAt || a.createdAt || 0)
          );

        setEdukasiList(formatted);
      } catch (error) {
        console.error("Gagal mengambil data edukasi:", error);

        showAlert(
          "error",
          "Gagal Memuat Data",
          error.message || "Terjadi kesalahan saat mengambil materi edukasi."
        );
      } finally {
        if (showInitialLoading) {
          setLoading(false);
        }
      }
    },
    [showAlert]
  );

  useEffect(() => {
    loadEdukasi(true);
  }, [loadEdukasi]);

  const refreshEdukasi = useCallback(async () => {
    try {
      setRefreshing(true);
      await loadEdukasi(false);
    } finally {
      setRefreshing(false);
    }
  }, [loadEdukasi]);

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

    if (saving) return;

    const judulFinal = judul.trim();
    const ringkasanFinal = ringkasan.trim();
    const isiFinal = isi.trim();

    if (!judulFinal || !isiFinal) {
      showAlert(
        "warning",
        "Data Belum Lengkap",
        "Judul dan Isi Konten edukasi wajib diisi!"
      );
      return;
    }

    setSaving(true);

    try {
      if (editId) {
        await update(ref(db, `edukasi/${editId}`), {
          judul: judulFinal,
          kategori,
          ringkasan: ringkasanFinal,
          isi: isiFinal,
          updatedAt: new Date().toISOString(),
        });

        // Optimistic UI update agar kartu berubah tanpa membaca seluruh
        // node edukasi sekali lagi.
        setEdukasiList((prev) =>
          prev
            .map((item) =>
              item.id === editId
                ? {
                    ...item,
                    judul: judulFinal,
                    kategori,
                    ringkasan: ringkasanFinal,
                    isi: isiFinal,
                    updatedAt: new Date().toISOString(),
                  }
                : item
            )
            .sort(
              (a, b) =>
                new Date(b.updatedAt || b.createdAt || 0) -
                new Date(a.updatedAt || a.createdAt || 0)
            )
        );

        showAlert(
          "success",
          "Berhasil Diperbarui",
          "Konten edukasi anti-bullying berhasil diperbarui!"
        );
      } else {
        const createdAt = new Date().toISOString();

        const newRef = await push(ref(db, "edukasi"), {
          judul: judulFinal,
          kategori,
          ringkasan: ringkasanFinal,
          isi: isiFinal,
          createdAt,
          updatedAt: createdAt,
        });

        // Tambahkan item baru langsung ke state agar tidak perlu
        // membaca seluruh database kembali.
        setEdukasiList((prev) => [
          {
            id: newRef.key,
            judul: judulFinal,
            kategori,
            ringkasan: ringkasanFinal,
            isi: isiFinal,
            createdAt,
            updatedAt: createdAt,
          },
          ...prev,
        ]);

        showAlert(
          "success",
          "Berhasil Diterbitkan",
          "Konten edukasi baru berhasil diterbitkan untuk siswa!"
        );
      }

      resetForm();
    } catch (error) {
      showAlert(
        "error",
        "Gagal Menyimpan",
        error.message || "Terjadi kesalahan saat menyimpan materi."
      );
    } finally {
      setSaving(false);
    }
  };

  // Persiapan Edit
  const handleEditClick = (item) => {
    setEditId(item.id);
    setJudul(item.judul);
    setKategori(item.kategori || "Pencegahan");
    setRingkasan(item.ringkasan || "");
    setIsi(item.isi);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Buka Modal Konfirmasi Hapus
  const handleHapusClick = (id) => {
    setDeleteTargetId(id);
  };

  // Eksekusi Hapus Konten
  const executeDelete = async () => {
    const id = deleteTargetId;

    if (!id) return;

    setDeleteTargetId(null);

    // Simpan state sebelumnya untuk rollback jika Firebase gagal.
    const previousList = edukasiList;

    setEdukasiList((prev) =>
      prev.filter((item) => item.id !== id)
    );

    try {
      await remove(ref(db, `edukasi/${id}`));

      showAlert(
        "success",
        "Berhasil Dihapus",
        "Konten edukasi berhasil dihapus dari sistem."
      );
    } catch (error) {
      setEdukasiList(previousList);

      showAlert(
        "error",
        "Gagal Menghapus",
        error.message || "Terjadi kesalahan saat menghapus materi."
      );
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
      boxShadow: "0 2px 0 #9A0007",
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
    modalBtnGroup: {
      display: "flex",
      gap: "10px",
      marginTop: "20px",
    },
    confirmYesBtn: {
      flex: 1,
      background: "#D32F2F",
      color: "#fff",
      border: "none",
      padding: "11px",
      borderRadius: "10px",
      fontWeight: "800",
      fontSize: "13px",
      cursor: "pointer",
      boxShadow: "0 3px 0 #9A0007",
      textTransform: "uppercase",
    },
    confirmNoBtn: {
      flex: 1,
      background: "#FFEB3B",
      color: "#1B5E20",
      border: "none",
      padding: "11px",
      borderRadius: "10px",
      fontWeight: "800",
      fontSize: "13px",
      cursor: "pointer",
      boxShadow: "0 3px 0 #FBC02D",
      textTransform: "uppercase",
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
        <div>
          <h2 style={styles.title}>Kelola Konten Edukasi</h2>
          <p style={styles.subtitle}>
            Tambah dan edit artikel / panduan edukasi anti-bullying
          </p>
        </div>
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            style={{
              ...styles.backBtn,
              opacity: refreshing ? 0.6 : 1,
              cursor: refreshing ? "not-allowed" : "pointer",
            }}
            onClick={refreshEdukasi}
            disabled={refreshing}
          >
            {refreshing ? "Memuat..." : "↻ Refresh"}
          </button>

          <button
            type="button"
            style={styles.backBtn}
            onClick={() => navigate("/dashboard-admin")}
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>

      {/* FORM EDIT / TAMBAH */}
      <div style={styles.formCard}>
        <h3 style={styles.formTitle}>
          {editId ? "Edit Konten Edukasi" : "Tambah Konten Edukasi Baru"}
        </h3>
        <form onSubmit={handleSubmit}>
          <div style={styles.group}>
            <label style={styles.label}>Judul Artikel / Materi *</label>
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
              <label style={styles.label}>Kategori *</label>
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
            <label style={styles.label}>Isi Lengkap Artikel / Materi *</label>
            <textarea
              placeholder="Tuliskan materi edukasi di sini secara detail..."
              value={isi}
              onChange={(e) => setIsi(e.target.value)}
              style={styles.textarea}
            />
          </div>

          <div style={styles.btnContainer}>
            <button
              type="submit"
              style={{
                ...styles.btnSubmit,
                opacity: saving ? 0.6 : 1,
                cursor: saving ? "not-allowed" : "pointer",
              }}
              disabled={saving}
            >
              {saving
                ? "Menyimpan..."
                : editId
                ? "Simpan Perubahan"
                : "Terbitkan Konten"}
            </button>
            {editId && (
              <button
                type="button"
                style={{
                  ...styles.btnCancel,
                  opacity: saving ? 0.6 : 1,
                  cursor: saving ? "not-allowed" : "pointer",
                }}
                onClick={resetForm}
                disabled={saving}
              >
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
        edukasiList.slice(0, 100).map((item) => (
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
                onClick={() => handleHapusClick(item.id)}
              >
                Hapus
              </button>
            </div>
          </div>
        ))
      )}

      {!loading && edukasiList.length > 100 && (
        <div
          style={{
            textAlign: "center",
            padding: "12px",
            color: "#556B4D",
            fontSize: "12px",
            fontWeight: "700",
          }}
        >
          Menampilkan 100 konten terbaru dari {edukasiList.length} konten.
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS KONTEN EDUKASI */}
      {deleteTargetId && (
        <div style={styles.modalOverlay} onClick={() => setDeleteTargetId(null)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.alertIconWrapper("warning")}>⚠️</div>
            <h3 style={{ color: "#C62828", fontSize: "18px", fontWeight: "800", marginBottom: "8px" }}>
              Konfirmasi Hapus Konten
            </h3>
            <p style={{ color: "#556B4D", fontSize: "13px", marginBottom: "15px", lineHeight: "1.5" }}>
              Apakah Anda yakin ingin menghapus materi edukasi ini dari sistem?
            </p>
            <div style={styles.modalBtnGroup}>
              <button style={styles.confirmYesBtn} onClick={executeDelete}>
                Ya, Hapus
              </button>
              <button style={styles.confirmNoBtn} onClick={() => setDeleteTargetId(null)}>
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

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

            <p style={{ color: "#556B4D", fontSize: "13px", marginBottom: "18px", lineHeight: "1.5" }}>
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

export default KelolaEdukasi;