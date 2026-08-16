import React, { useState, useEffect, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import { ref, get, update, remove } from "firebase/database";
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
  backButton: {
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
  card: {
    background: "#fff",
    borderRadius: "18px",
    padding: "20px 18px",
    marginBottom: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
    borderLeft: "6px solid #2E7D32",
    borderTop: "1px solid #E8F5E9",
    borderRight: "1px solid #E8F5E9",
    borderBottom: "1px solid #E8F5E9",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #E8F5E9",
    paddingBottom: "10px",
    marginBottom: "14px",
    flexWrap: "wrap",
    gap: "8px",
  },
  pelaporInfo: { fontSize: "16px", fontWeight: "800", color: "#1B5E20" },
  badge: { padding: "6px 12px", borderRadius: "15px", fontSize: "12px", fontWeight: "800" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "10px",
    marginBottom: "12px",
    fontSize: "13px",
    color: "#556B4D",
  },
  ceritaBox: {
    background: "#FAFAFA",
    padding: "12px",
    borderRadius: "10px",
    border: "1px dashed #C8E6C9",
    fontSize: "13px",
    lineHeight: "1.5",
    color: "#2E3D29",
    marginTop: "6px",
    marginBottom: "14px",
  },
  interventionBox: {
    background: "#FFFDE7",
    border: "2px solid #FFF59D",
    borderRadius: "14px",
    padding: "18px",
    marginTop: "16px",
    marginBottom: "16px",
  },
  interventionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "16px",
    alignItems: "start",
  },
  interventionField: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
  },
  fieldLabel: {
    display: "block",
    minHeight: "30px",
    fontSize: "12px",
    fontWeight: "700",
    lineHeight: "1.3",
    color: "#1B5E20",
    marginBottom: "6px",
  },
  fieldControl: {
    width: "100%",
    minHeight: "42px",
    boxSizing: "border-box",
  },
  inputSmall: {
    width: "100%",
    height: "42px",
    padding: "9px 12px",
    borderRadius: "10px",
    border: "1.5px solid #C8E6C9",
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none",
    background: "#fff",
    color: "#263238",
    fontFamily: "inherit",
    boxShadow: "0 1px 3px rgba(46,125,50,0.08)",
  },
  saveBtn: {
    width: "100%",
    height: "42px",
    padding: "0 16px",
    background: "#2E7D32",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "800",
    fontSize: "13px",
    boxSizing: "border-box",
    boxShadow: "0 3px 0 #1B5E20",
    textTransform: "uppercase",
  },
  chipButtonGroup: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
    marginTop: "6px",
  },
  chipItem: (selected, opt) => ({
    padding: "7px 12px",
    borderRadius: "8px",
    border: `1.5px solid ${selected ? opt.border || "#2E7D32" : "#E0E0E0"}`,
    background: selected ? opt.bg || "#E8F5E9" : "#fff",
    color: selected ? opt.color || "#1B5E20" : "#444",
    fontWeight: selected ? "800" : "600",
    fontSize: "12px",
    cursor: "pointer",
    transition: "all 0.15s ease",
  }),
  actionArea: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    marginTop: "16px",
    paddingTop: "16px",
    borderTop: "1px solid #E8F5E9",
  },
  actionButtons: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "10px",
    width: "100%",
  },
  statusField: {
    width: "100%",
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
  },
  actionMeta: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    minHeight: "20px",
  },
  filterBox: {
    background: "#fff",
    border: "1px solid #C8E6C9",
    borderRadius: "14px",
    padding: "14px 16px",
    marginBottom: "20px",
    boxShadow: "0 3px 10px rgba(46,125,50,0.05)",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
  filterLabel: {
    color: "#1B5E20",
    fontSize: "13px",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },
  filterSelect: {
    flex: "1 1 240px",
    minWidth: "220px",
    maxWidth: "360px",
    height: "42px",
    padding: "0 12px",
    borderRadius: "10px",
    border: "1.5px solid #A5D6A7",
    background: "#F8FFF6",
    color: "#263238",
    fontSize: "14px",
    fontWeight: "600",
    fontFamily: "inherit",
    outline: "none",
    cursor: "pointer",
    boxSizing: "border-box",
  },
  studentSearch: {
    flex: "1 1 280px",
    minWidth: "240px",
    maxWidth: "420px",
    height: "42px",
    padding: "0 14px",
    borderRadius: "10px",
    border: "1.5px solid #A5D6A7",
    background: "#F8FFF6",
    color: "#263238",
    fontSize: "14px",
    fontWeight: "600",
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
  },
  reportedAt: {
    fontSize: "12px",
    color: "#556B4D",
    lineHeight: "1.4",
  },
  deleteBtn: {
    width: "100%",
    height: "42px",
    padding: "0 16px",
    background: "#D32F2F",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "800",
    fontSize: "13px",
    boxSizing: "border-box",
    boxShadow: "0 3px 0 #9A0007",
  },
  thumbFoto: {
    width: "80px",
    height: "80px",
    objectFit: "cover",
    borderRadius: "10px",
    cursor: "pointer",
    border: "2px solid #2E7D32",
    marginTop: "6px",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.8)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: "20px",
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
  modalBtnGroup: { display: "flex", gap: "10px", marginTop: "20px" },
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
      type === "success" ? "#E8F5E9" : type === "error" ? "#FFEBEE" : "#FFFDE7",
    border: `2px solid ${
      type === "success" ? "#2E7D32" : type === "error" ? "#D32F2F" : "#FBC02D"
    }`,
    color:
      type === "success" ? "#2E7D32" : type === "error" ? "#D32F2F" : "#F57F17",
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
      type === "success" ? "#2E7D32" : type === "error" ? "#D32F2F" : "#FFEB3B",
    boxShadow:
      type === "success" ? "0 3px 0 #1B5E20" : type === "error" ? "0 3px 0 #9A0007" : "0 3px 0 #FBC02D",
  }),
};

const statusOptions = [
  { label: "Diproses (Guru/BK)", color: "#F57F17", bg: "#FFFDE7", border: "#FFF59D" },
  { label: "Eskalasi: Kepala Sekolah", color: "#512DA8", bg: "#EDE7F6", border: "#B39DDB" },
  { label: "Eskalasi: Dinas/Pengawas", color: "#8E24AA", bg: "#F3E5F5", border: "#CE93D8" },
  { label: "Selesai", color: "#2E7D32", bg: "#E8F5E9", border: "#A5D6A7" },
  { label: "Ditolak (Fitnah / Tidak Valid)", color: "#C62828", bg: "#FFEBEE", border: "#EF9A9A" },
];

// Menyamakan status lama "Diproses" dengan status tampilan "Diproses (Guru/BK)".
// Ini membuat data lama dan data baru tetap terbaca oleh filter dan dropdown.
const normalizeStatus = (status) => {
  const value = String(status || "").trim();

  if (
    value === "" ||
    value === "Diproses" ||
    value === "Diproses (Guru/BK)"
  ) {
    return "Diproses (Guru/BK)";
  }

  return value;
};

const metodePenanganan = [
  { id: "Dipisahkan", label: "Dipisahkan (Perlindungan Korban)" },
  { id: "Dipertemukan", label: "Dipertemukan (Mediasi)" },
  { id: "Pembinaan Terpisah", label: "Pembinaan Terpisah" },
  { id: "Pendampingan Korban", label: "Pendampingan Korban" },
  { id: "Konseling", label: "Konseling" },
  { id: "Pemanggilan Orang Tua", label: "Pemanggilan Orang Tua" },
  { id: "Lainnya", label: "Ketik sendiri" },
];

const getStatusBadgeStyle = (status) => {
  switch (status) {
    case "Selesai":
      return { background: "#E8F5E9", color: "#2E7D32", border: "1px solid #A5D6A7" };
    case "Ditolak (Fitnah / Tidak Valid)":
      return { background: "#FFEBEE", color: "#C62828", border: "1px solid #EF9A9A" };
    case "Eskalasi: Kepala Sekolah":
      return { background: "#EDE7F6", color: "#512DA8", border: "1px solid #B39DDB" };
    case "Eskalasi: Dinas/Pengawas":
      return { background: "#F3E5F5", color: "#8E24AA", border: "1px solid #CE93D8" };
    default:
      return { background: "#FFFDE7", color: "#F57F17", border: "1px solid #FFF59D" };
  }
};

// SUB-KOMPONEN KARTU TERISOLASI AGAR MENGETIK TIDAK MACET
const ItemPengaduanCard = memo(({ item, onStatusChange, onSavePenanganan, onDelete, onFotoClick }) => {
  const [penanganan, setPenanganan] = useState(item.penanganan || "Dipisahkan");
  const [penangananLainnya, setPenangananLainnya] = useState(
    item.penangananLainnya || ""
  );
  const [responOrangTua, setResponOrangTua] = useState(item.responOrangTua || "");
  const [tindakanSanksi, setTindakanSanksi] = useState(item.tindakanSanksi || "");

  // State form sengaja hanya diinisialisasi saat kartu dibuat.
  // Jangan sinkronkan ulang setiap kali props berubah, karena itu dapat
  // membuat cursor/input terasa macet atau teks ter-reset saat mengetik.
  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div style={styles.pelaporInfo}>
          {item.nama || "Anonim"} (Kelas {item.kelas || "-"})
          <span
            style={{
              fontSize: "12px",
              marginLeft: "8px",
              padding: "3px 8px",
              background: "#FFEB3B",
              color: "#1B5E20",
              borderRadius: "6px",
              fontWeight: "800",
            }}
          >
            {item.peran || "Korban"}
          </span>
        </div>
        <div style={{ ...styles.badge, ...getStatusBadgeStyle(item.status) }}>
          {item.status || "Diproses (Guru/BK)"}
        </div>
      </div>

      <div style={styles.grid}>
        <div>
          <strong style={{ color: "#1B5E20" }}>Tanggal Kejadian:</strong> <br />
          {item.tanggal || "-"}
        </div>
        <div>
          <strong style={{ color: "#1B5E20" }}>Lokasi:</strong> <br />
          {item.lokasi || "-"}
        </div>
        <div>
          <strong style={{ color: "#1B5E20" }}>Jenis Bullying:</strong> <br />
          {item.jenis || "-"}
        </div>
        <div>
          <strong style={{ color: "#1B5E20" }}>Terduga Pelaku:</strong> <br />
          {item.pelaku || "Tidak disebutkan"}
        </div>
        <div>
          <strong style={{ color: "#1B5E20" }}>Saksi Mata:</strong> <br />
          {item.saksi === "Ya"
            ? `${item.namaSaksi || "Ada Saksi"} (${item.kelasSaksi || "Kelas -"})`
            : "Tidak ada"}
        </div>
      </div>

      <div>
        <strong style={{ color: "#1B5E20", fontSize: "13px" }}>Kronologi Kejadian:</strong>
        <div style={styles.ceritaBox}>{item.cerita}</div>
      </div>

      {item.fotoUrl && item.fotoUrl !== "-" && (
        <div style={{ marginBottom: "14px" }}>
          <strong style={{ color: "#1B5E20", fontSize: "13px" }}>Bukti Foto:</strong>
          <div>
            <img
              src={item.fotoUrl}
              alt="Bukti Pengaduan"
              style={styles.thumbFoto}
              onClick={() => onFotoClick(item.fotoUrl)}
              title="Klik untuk memperbesar"
            />
          </div>
        </div>
      )}

      <div style={styles.interventionBox}>
        <div style={{ fontWeight: "800", fontSize: "14px", color: "#1B5E20", marginBottom: "12px" }}>
          Modul Penanganan & Intervensi Kasus
        </div>

        <div style={styles.interventionGrid}>
          <div style={styles.interventionField}>
            <label style={styles.fieldLabel}>
              Penanganan Pelaku & Korban:
            </label>

            <select
              value={penanganan}
              onChange={(e) => {
                const value = e.target.value;
                setPenanganan(value);

                if (value !== "Lainnya") {
                  setPenangananLainnya("");
                }
              }}
              style={{
                ...styles.inputSmall,
                ...styles.fieldControl,
              }}
            >
              {metodePenanganan.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>

            {penanganan === "Lainnya" && (
              <input
                type="text"
                placeholder="Ketik penanganan lainnya..."
                value={penangananLainnya}
                onChange={(e) => setPenangananLainnya(e.target.value)}
                style={styles.inputSmall}
              />
            )}
          </div>

          <div style={styles.interventionField}>
            <label style={styles.fieldLabel}>
              Konfirmasi & Respon Orang Tua:
            </label>
            <input
              type="text"
              placeholder="Catatan respon orang tua..."
              value={responOrangTua}
              onChange={(e) => setResponOrangTua(e.target.value)}
              style={styles.inputSmall}
            />
          </div>

          <div style={styles.interventionField}>
            <label style={styles.fieldLabel}>
              Tahapan Hukuman / Ganti Rugi:
            </label>
            <input
              type="text"
              placeholder="Pembinaan / Skorsing..."
              value={tindakanSanksi}
              onChange={(e) => setTindakanSanksi(e.target.value)}
              style={styles.inputSmall}
            />
          </div>
        </div>

      </div>

      <div style={styles.actionArea}>
        <div style={styles.statusField}>
          <label style={styles.fieldLabel}>
            Ubah Status Kasus:
          </label>

          <select
            value={normalizeStatus(item.status)}
            onChange={(e) => onStatusChange(item.id, e.target.value)}
            style={{ ...styles.inputSmall, ...styles.fieldControl }}
          >
            {statusOptions.map((opt) => (
              <option key={opt.label} value={opt.label}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.actionMeta}>
          <div style={styles.reportedAt}>
            Dilaporkan pada:{" "}
            {item.createdAt
              ? new Date(item.createdAt).toLocaleString("id-ID")
              : "-"}
          </div>
        </div>

        <div style={styles.actionButtons}>
          <button
            style={styles.saveBtn}
            onClick={() =>
              onSavePenanganan(item.id, {
                penanganan,
                penangananLainnya,
                responOrangTua,
                tindakanSanksi,
              })
            }
          >
            Simpan
          </button>

          <button
            style={styles.deleteBtn}
            onClick={() => onDelete(item.id)}
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
});

function DaftarPengaduan() {
  const navigate = useNavigate();
  const [laporanList, setLaporanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFoto, setSelectedFoto] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Filter status dan pencarian siswa/NIS untuk memudahkan guru menemukan riwayat laporan siswa.
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [studentSearch, setStudentSearch] = useState("");

  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
    onCloseCallback: null,
  });

  const showAlert = useCallback((type, title, message, onCloseCallback = null) => {
    setAlertConfig({ isOpen: true, type, title, message, onCloseCallback });
  }, []);

  const handleCloseAlert = useCallback(() => {
    setAlertConfig((prev) => {
      if (prev.onCloseCallback) prev.onCloseCallback();
      return { ...prev, isOpen: false };
    });
  }, []);

  // Memuat pengaduan hanya saat halaman dibuka.
  // Tidak memakai onValue() agar halaman daftar tidak terus menerima
  // seluruh data pengaduan setiap ada perubahan di Firebase.
  const loadPengaduan = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);

      const snapshot = await get(ref(db, "pengaduan"));

      if (!snapshot.exists()) {
        setLaporanList([]);
        return;
      }

      const data = snapshot.val();

      const formattedList = Object.keys(data)
        .map((key) => ({
          id: key,
          ...data[key],
        }))
        .sort(
          (a, b) =>
            new Date(b.updatedAt || b.createdAt || 0) -
            new Date(a.updatedAt || a.createdAt || 0)
        );

      setLaporanList(formattedList);
    } catch (error) {
      console.error("Gagal mengambil data pengaduan:", error);

      showAlert(
        "error",
        "Gagal Memuat Data",
        error.message || "Terjadi kesalahan saat mengambil data pengaduan."
      );
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [showAlert]);

  useEffect(() => {
    let mounted = true;

    const loadInitialData = async () => {
      if (!mounted) return;
      await loadPengaduan(true);
    };

    loadInitialData();

    return () => {
      mounted = false;
    };
  }, [loadPengaduan]);

  // Update Status Instan (Optimistic)
  const handleStatusChange = useCallback(async (id, statusBaru) => {
    const updatedAt = new Date().toISOString();

    setLaporanList((prevList) =>
      prevList.map((item) =>
        item.id === id
          ? { ...item, status: statusBaru, updatedAt }
          : item
      )
    );

    try {
      await update(ref(db, `pengaduan/${id}`), {
        status: statusBaru,
        updatedAt,
      });
      showAlert("success", "Status Diperbarui", `Status kasus berhasil diubah menjadi "${statusBaru}".`);
    } catch (error) {
      showAlert("error", "Gagal Mengubah Status", error.message || "Terjadi kendala saat memperbarui status.");
    }
  }, [showAlert]);

  // Simpan
  const handleSavePenanganan = useCallback(async (id, formData) => {
    try {
      await update(ref(db, `pengaduan/${id}`), {
        penanganan: formData.penanganan,
        penangananLainnya:
          formData.penanganan === "Lainnya"
            ? formData.penangananLainnya
            : "",
        responOrangTua: formData.responOrangTua,
        tindakanSanksi: formData.tindakanSanksi,
        updatedAt: new Date().toISOString(),
      });
      showAlert("success", "Catatan Tersimpan", "Catatan penanganan kasus berhasil diperbarui!");
      setTimeout(() => handleCloseAlert(), 1600);
    } catch (error) {
      showAlert("error", "Gagal Menyimpan", error.message || "Terjadi kesalahan saat menyimpan catatan.");
    }
  }, [showAlert, handleCloseAlert]);

  // Hapus Laporan
  const executeDelete = useCallback(async () => {
    if (!deleteTargetId) return;
    const id = deleteTargetId;
    setDeleteTargetId(null);

    setLaporanList((prev) => prev.filter((item) => item.id !== id));

    try {
      await remove(ref(db, `pengaduan/${id}`));
      showAlert("success", "Berhasil Dihapus", "Laporan pengaduan berhasil dihapus.");
      setTimeout(() => handleCloseAlert(), 1600);
    } catch (error) {
      showAlert("error", "Gagal Menghapus", error.message || "Terjadi kesalahan saat menghapus laporan.");
    }
  }, [deleteTargetId, showAlert, handleCloseAlert]);


  const refreshPengaduan = useCallback(async () => {
    try {
      setRefreshing(true);
      await loadPengaduan(false);
    } finally {
      setRefreshing(false);
    }
  }, [loadPengaduan]);

  const normalizedStudentSearch = studentSearch.trim().toLowerCase();

  const filteredLaporanList = laporanList.filter((item) => {
    const matchesStatus =
      statusFilter === "Semua" ||
      normalizeStatus(item.status) === statusFilter;

    const namaSiswa = String(item.nama || "").toLowerCase();
    const nisSiswa = String(item.nis || item.NIS || "").toLowerCase();

    const matchesStudent =
      !normalizedStudentSearch ||
      namaSiswa.includes(normalizedStudentSearch) ||
      nisSiswa.includes(normalizedStudentSearch);

    return matchesStatus && matchesStudent;
  });

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <div style={styles.title}>Daftar Laporan Pengaduan</div>

          <p
            style={{
              color: "#fff",
              margin: "4px 0 0 0",
              fontSize: "13px",
              opacity: 0.95,
            }}
          >
            Total Laporan Masuk:{" "}
            <strong>{laporanList.length}</strong>
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
            onClick={refreshPengaduan}
            disabled={refreshing}
            style={{
              ...styles.backButton,
              opacity: refreshing ? 0.6 : 1,
              cursor: refreshing ? "not-allowed" : "pointer",
            }}
          >
            {refreshing ? "Memuat..." : " Refresh"}
          </button>

          <button
            type="button"
            style={styles.backButton}
            onClick={() => navigate("/dashboard-admin")}
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>

      {!loading && laporanList.length > 0 && (
        <div style={styles.filterBox}>
          <div style={styles.filterLabel}>Status:</div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={styles.filterSelect}
            aria-label="Filter status pengaduan"
          >
            <option value="Semua">Semua Status ({laporanList.length})</option>

            {statusOptions.map((opt) => {
              const jumlah = laporanList.filter(
                (item) =>
                  normalizeStatus(item.status) === opt.label
              ).length;

              return (
                <option key={opt.label} value={opt.label}>
                  {opt.label} ({jumlah})
                </option>
              );
            })}
          </select>

          <div style={styles.filterLabel}>Cari Siswa:</div>

          <input
            type="text"
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            placeholder="Ketik nama siswa atau NIS..."
            style={styles.studentSearch}
            aria-label="Cari siswa berdasarkan nama atau NIS"
          />

          {(studentSearch || statusFilter !== "Semua") && (
            <button
              type="button"
              onClick={() => {
                setStudentSearch("");
                setStatusFilter("Semua");
              }}
              style={{
                height: "42px",
                padding: "0 14px",
                borderRadius: "10px",
                border: "1px solid #C8E6C9",
                background: "#fff",
                color: "#2E7D32",
                fontWeight: "800",
                fontSize: "12px",
                cursor: "pointer",
                boxSizing: "border-box",
              }}
            >
              Reset Filter
            </button>
          )}

          <div
            style={{
              width: "100%",
              color: "#556B4D",
              fontSize: "12px",
              fontWeight: "600",
              marginTop: "2px",
            }}
          >
            Menampilkan {filteredLaporanList.length} dari {laporanList.length} laporan
            {studentSearch.trim()
              ? ` untuk "${studentSearch.trim()}"`
              : ""}
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#1B5E20", fontWeight: "700" }}>
          Memuat data laporan...
        </div>
      ) : laporanList.length === 0 ? (
        <div
          style={{
            background: "#fff",
            padding: "35px 20px",
            borderRadius: "18px",
            textAlign: "center",
            color: "#556B4D",
            border: "2px solid #C8E6C9",
            fontWeight: "600",
          }}
        >
          Belum ada laporan pengaduan yang masuk.
        </div>
      ) : filteredLaporanList.length === 0 ? (
        <div
          style={{
            background: "#fff",
            padding: "35px 20px",
            borderRadius: "18px",
            textAlign: "center",
            color: "#556B4D",
            border: "2px solid #C8E6C9",
            fontWeight: "600",
          }}
        >
          {statusFilter !== "Semua" && studentSearch.trim()
            ? `Tidak ada laporan dengan status "${statusFilter}" untuk "${studentSearch.trim()}".`
            : statusFilter !== "Semua"
            ? `Tidak ada laporan dengan status "${statusFilter}".`
            : `Tidak ada laporan untuk "${studentSearch.trim()}".`}
        </div>
      ) : (
        filteredLaporanList.slice(0, 100).map((item) => (
          <ItemPengaduanCard
            key={item.id}
            item={item}
            onStatusChange={handleStatusChange}
            onSavePenanganan={handleSavePenanganan}
            onDelete={setDeleteTargetId}
            onFotoClick={setSelectedFoto}
          />
        ))
      )}

      {!loading &&
        statusFilter === "Semua" &&
        !studentSearch.trim() &&
        laporanList.length > 100 && (
        <div
          style={{
            textAlign: "center",
            padding: "12px",
            marginBottom: "16px",
            color: "#556B4D",
            fontSize: "12px",
            fontWeight: "700",
          }}
        >
          Menampilkan 100 laporan terbaru dari {laporanList.length} laporan.
          Gunakan filter status atau pencarian siswa untuk mempersempit daftar.
        </div>
      )}

      {selectedFoto && (
        <div style={styles.modalOverlay} onClick={() => setSelectedFoto(null)}>
          <div style={{ position: "relative", maxWidth: "90%", maxHeight: "90%" }}>
            <img
              src={selectedFoto}
              alt="Bukti Besar"
              style={{ width: "100%", maxHeight: "80vh", objectFit: "contain", borderRadius: "12px" }}
            />
            <div style={{ color: "#fff", textAlign: "center", marginTop: "10px", fontSize: "13px" }}>
              Klik di mana saja untuk menutup gambar
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div style={{ ...styles.modalOverlay, background: "rgba(0,0,0,0.6)" }} onClick={() => setDeleteTargetId(null)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.alertIconWrapper("warning")}></div>
              <div
                style={
                  styles.alertIconWrapper(
                    "warning"
                  )
                }
              >
                ⚠️
              </div>
            <h3 style={{ color: "#C62828", fontSize: "18px", fontWeight: "800", marginBottom: "8px" }}>
              Konfirmasi Hapus Laporan
            </h3>
            <p style={{ color: "#556B4D", fontSize: "13px", marginBottom: "15px", lineHeight: "1.5" }}>
              Apakah Anda yakin ingin menghapus laporan pengaduan ini secara permanen?
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

      {alertConfig.isOpen && (
        <div style={{ ...styles.modalOverlay, background: "rgba(0,0,0,0.6)" }} onClick={handleCloseAlert}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.alertIconWrapper(alertConfig.type)}>
              <span
                style={{
                  fontSize: "34px",
                  fontWeight: "900",
                  lineHeight: 1,
                }}
              >
                {alertConfig.type === "success" ? "✓" : alertConfig.type === "error" ? "×" : "!"}
              </span>
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

            <button style={styles.alertBtn(alertConfig.type)} onClick={handleCloseAlert}>
              Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DaftarPengaduan;