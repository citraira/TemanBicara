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
    padding: "16px",
    marginTop: "16px",
    marginBottom: "16px",
  },
  inputSmall: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1.5px solid #C8E6C9",
    fontSize: "14px",
    marginTop: "6px",
    boxSizing: "border-box",
    outline: "none",
    background: "#fff",
  },
  saveBtn: {
    padding: "10px 16px",
    background: "#2E7D32",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "800",
    fontSize: "13px",
    marginTop: "14px",
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
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexDirection: "column",
    gap: "12px",
    marginTop: "15px",
    paddingTop: "14px",
    borderTop: "1px solid #E8F5E9",
  },
  deleteBtn: {
    padding: "8px 14px",
    background: "#D32F2F",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "800",
    fontSize: "12px",
    boxShadow: "0 2px 0 #9A0007",
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

const metodePenanganan = [
  { id: "Dipisahkan", label: "Dipisahkan (Perlindungan Korban)" },
  { id: "Dipertemukan", label: "Dipertemukan (Mediasi)" },
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
  const [responOrangTua, setResponOrangTua] = useState(item.responOrangTua || "");
  const [tindakanSanksi, setTindakanSanksi] = useState(item.tindakanSanksi || "");

  // Update state lokal jika item props berubah dari luar
  useEffect(() => {
    setPenanganan(item.penanganan || "Dipisahkan");
    setResponOrangTua(item.responOrangTua || "");
    setTindakanSanksi(item.tindakanSanksi || "");
  }, [item.penanganan, item.responOrangTua, item.tindakanSanksi]);

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

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "#1B5E20" }}>
              Penanganan Pelaku & Korban:
            </label>
            <div style={styles.chipButtonGroup}>
              {metodePenanganan.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  style={styles.chipItem(penanganan === m.id, {
                    bg: "#2E7D32",
                    color: "#fff",
                    border: "#1B5E20",
                  })}
                  onClick={() => setPenanganan(m.id)}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "#1B5E20" }}>
              Konfirmasi & Respon Orang Tua:
            </label>
            <input
              type="text"
              placeholder="Catatan respon ortu..."
              value={responOrangTua}
              onChange={(e) => setResponOrangTua(e.target.value)}
              style={styles.inputSmall}
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "#1B5E20" }}>
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

        <button
          style={styles.saveBtn}
          onClick={() => onSavePenanganan(item.id, { penanganan, responOrangTua, tindakanSanksi })}
        >
          Simpan Catatan Penanganan
        </button>
      </div>

      <div style={styles.actionArea}>
        <div style={{ width: "100%" }}>
          <label style={{ fontSize: "13px", fontWeight: "800", color: "#1B5E20", display: "block", marginBottom: "6px" }}>
            Ubah Status Kasus:
          </label>
          <div style={styles.chipButtonGroup}>
            {statusOptions.map((opt) => {
              const isSelected = (item.status || "Diproses (Guru/BK)") === opt.label;
              return (
                <button
                  key={opt.label}
                  type="button"
                  style={styles.chipItem(isSelected, opt)}
                  onClick={() => onStatusChange(item.id, opt.label)}
                >
                  {isSelected ? "✓ " : ""}{opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginTop: "10px" }}>
          <div style={{ fontSize: "12px", color: "#556B4D" }}>
            Dilaporkan pada: {item.createdAt ? new Date(item.createdAt).toLocaleString("id-ID") : "-"}
          </div>

          <button style={styles.deleteBtn} onClick={() => onDelete(item.id)}>
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

  // Ambil data pengaduan satu kali saat halaman dibuka
  useEffect(() => {
    let mounted = true;

    const loadPengaduan = async () => {
      try {
        const pengaduanRef = ref(db, "pengaduan");
        const snapshot = await get(pengaduanRef);

        if (!mounted) return;

        if (snapshot.exists()) {
          const data = snapshot.val();

          const formattedList = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));

          formattedList.sort(
            (a, b) =>
              new Date(b.createdAt || 0) -
              new Date(a.createdAt || 0)
          );

          setLaporanList(formattedList);
        } else {
          setLaporanList([]);
        }
      } catch (error) {
        console.error("Gagal mengambil data pengaduan:", error);

        if (mounted) {
          showAlert(
            "error",
            "Gagal Memuat Data",
            error.message || "Terjadi kesalahan saat mengambil data pengaduan."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadPengaduan();

    return () => {
      mounted = false;
    };
  }, [showAlert]);

  // Update Status Instan (Optimistic)
  const handleStatusChange = useCallback(async (id, statusBaru) => {
    setLaporanList((prevList) =>
      prevList.map((item) =>
        item.id === id ? { ...item, status: statusBaru } : item
      )
    );

    try {
      await update(ref(db, `pengaduan/${id}`), {
        status: statusBaru,
        updatedAt: new Date().toISOString(),
      });
      showAlert("success", "Status Diperbarui", `Status kasus berhasil diubah menjadi "${statusBaru}".`);
    } catch (error) {
      showAlert("error", "Gagal Mengubah Status", error.message || "Terjadi kendala saat memperbarui status.");
    }
  }, [showAlert]);

  // Simpan Catatan Penanganan
  const handleSavePenanganan = useCallback(async (id, formData) => {
    try {
      await update(ref(db, `pengaduan/${id}`), {
        penanganan: formData.penanganan,
        responOrangTua: formData.responOrangTua,
        tindakanSanksi: formData.tindakanSanksi,
        updatedAt: new Date().toISOString(),
      });
      showAlert("success", "Catatan Tersimpan", "Catatan penanganan kasus berhasil diperbarui!");
    } catch (error) {
      showAlert("error", "Gagal Menyimpan", error.message || "Terjadi kesalahan saat menyimpan catatan.");
    }
  }, [showAlert]);

  // Hapus Laporan
  const executeDelete = useCallback(async () => {
    if (!deleteTargetId) return;
    const id = deleteTargetId;
    setDeleteTargetId(null);

    setLaporanList((prev) => prev.filter((item) => item.id !== id));

    try {
      await remove(ref(db, `pengaduan/${id}`));
      showAlert("success", "Berhasil Dihapus", "Laporan pengaduan berhasil dihapus.");
    } catch (error) {
      showAlert("error", "Gagal Menghapus", error.message || "Terjadi kesalahan saat menghapus laporan.");
    }
  }, [deleteTargetId, showAlert]);


  const refreshPengaduan = async () => {
  try {
    setRefreshing(true);

    const snapshot = await get(ref(db, "pengaduan"));

    if (snapshot.exists()) {
      const data = snapshot.val();

      const formattedList = Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
      }));

      formattedList.sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
      );

      setLaporanList(formattedList);
    } else {
      setLaporanList([]);
    }
  } catch (error) {
    console.error("Gagal refresh pengaduan:", error);

    showAlert(
      "error",
      "Refresh Gagal",
      error.message || "Tidak dapat memperbarui daftar pengaduan."
    );
  } finally {
    setRefreshing(false);
  }
};

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
            {refreshing ? "Memuat..." : "↻ Refresh"}
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
      ) : (
        laporanList.map((item) => (
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

      {deleteTargetId && (
        <div style={{ ...styles.modalOverlay, background: "rgba(0,0,0,0.6)" }} onClick={() => setDeleteTargetId(null)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.alertIconWrapper("warning")}>⚠️</div>
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