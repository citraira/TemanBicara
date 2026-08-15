import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ref, onValue, update, remove } from "firebase/database";
import { db } from "../firebase";

function DaftarPengaduan() {
  const navigate = useNavigate();
  const [laporanList, setLaporanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFoto, setSelectedFoto] = useState(null);

  // State Sementara untuk Form Penanganan Kasus
  const [penangananForm, setPenangananForm] = useState({});

  // State Modal Konfirmasi Hapus Laporan
  const [deleteTargetId, setDeleteTargetId] = useState(null);

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
    const pengaduanRef = ref(db, "pengaduan");

    const unsubscribe = onValue(
      pengaduanRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const formattedList = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));

          formattedList.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );

          setLaporanList(formattedList);

          const initialForm = {};
          formattedList.forEach((item) => {
            initialForm[item.id] = {
              penanganan: item.penanganan || "Dipisahkan",
              responOrangTua: item.responOrangTua || "",
              tindakanSanksi: item.tindakanSanksi || "",
            };
          });
          setPenangananForm(initialForm);
        } else {
          setLaporanList([]);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Gagal mengambil data:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (id, statusBaru) => {
    try {
      await update(ref(db, `pengaduan/${id}`), {
        status: statusBaru,
        updatedAt: new Date().toISOString(), // Merekam waktu update agar memicu notifikasi di siswa
      });
      showAlert(
        "success",
        "Status Diperbarui",
        `Status kasus berhasil diubah menjadi "${statusBaru}".`
      );
    } catch (error) {
      showAlert(
        "error",
        "Gagal Mengubah Status",
        error.message || "Terjadi kendala saat memperbarui status."
      );
    }
  };

  const handleSavePenanganan = async (id) => {
    const dataPenanganan = penangananForm[id];
    if (!dataPenanganan) return;

    try {
      await update(ref(db, `pengaduan/${id}`), {
        penanganan: dataPenanganan.penanganan,
        responOrangTua: dataPenanganan.responOrangTua,
        tindakanSanksi: dataPenanganan.tindakanSanksi,
        updatedAt: new Date().toISOString(), // Merekam waktu update agar tersinkronisasi
      });
      showAlert(
        "success",
        "Catatan Tersimpan",
        "Catatan penanganan dan intervensi kasus berhasil diperbarui!"
      );
    } catch (error) {
      showAlert(
        "error",
        "Gagal Menyimpan",
        error.message || "Terjadi kesalahan saat menyimpan catatan."
      );
    }
  };

  const handleFormChange = (id, field, value) => {
    setPenangananForm((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  // Membuka modal konfirmasi hapus
  const handleHapus = (id) => {
    setDeleteTargetId(id);
  };

  // Eksekusi hapus data setelah dikonfirmasi
  const executeDelete = async () => {
    const id = deleteTargetId;
    setDeleteTargetId(null);

    try {
      await remove(ref(db, `pengaduan/${id}`));
      showAlert("success", "Berhasil Dihapus", "Laporan pengaduan berhasil dihapus dari sistem.");
    } catch (error) {
      showAlert(
        "error",
        "Gagal Menghapus",
        error.message || "Terjadi kesalahan saat menghapus laporan."
      );
    }
  };

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
    title: {
      fontSize: "22px",
      fontWeight: "800",
    },
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
      marginBottom: "12px",
      flexWrap: "wrap",
      gap: "8px",
    },
    pelaporInfo: {
      fontSize: "16px",
      fontWeight: "800",
      color: "#1B5E20",
    },
    badge: {
      padding: "6px 12px",
      borderRadius: "15px",
      fontSize: "12px",
      fontWeight: "800",
    },
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
      marginTop: "5px",
      marginBottom: "12px",
    },
    interventionBox: {
      background: "#FFFDE7",
      border: "2px solid #FFF59D",
      borderRadius: "14px",
      padding: "15px",
      marginTop: "15px",
      marginBottom: "15px",
    },
    actionArea: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "10px",
      marginTop: "15px",
      paddingTop: "12px",
      borderTop: "1px solid #E8F5E9",
    },
    selectStatus: {
      padding: "8px 12px",
      borderRadius: "10px",
      border: "2px solid #C8E6C9",
      fontWeight: "700",
      fontSize: "13px",
      cursor: "pointer",
      background: "#fff",
      color: "#1B5E20",
      outline: "none",
    },
    inputSmall: {
      width: "100%",
      padding: "10px 12px",
      borderRadius: "10px",
      border: "2px solid #C8E6C9",
      fontSize: "13px",
      marginTop: "5px",
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
      marginTop: "12px",
      boxShadow: "0 3px 0 #1B5E20",
      textTransform: "uppercase",
    },
    deleteBtn: {
      padding: "8px 14px",
      background: "#D32F2F",
      color: "#fff",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      fontWeight: "800",
      fontSize: "13px",
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
    // Gaya Modal Notifikasi & Dialog Konfirmasi
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
          <div style={styles.title}>Daftar Laporan Pengaduan</div>
          <p style={{ color: "#fff", margin: "4px 0 0 0", fontSize: "13px", opacity: 0.95 }}>
            Total Laporan Masuk: <strong>{laporanList.length}</strong>
          </p>
        </div>
        <button
          style={styles.backButton}
          onClick={() => navigate("/dashboard-admin")}
        >
          Kembali ke Dashboard
        </button>
      </div>

      {/* CONTENT / LIST LAPORAN */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#1B5E20", fontWeight: "600" }}>
          Memuat data laporan dari database...
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
        laporanList.map((item) => {
          const currentForm = penangananForm[item.id] || {
            penanganan: "Dipisahkan",
            responOrangTua: "",
            tindakanSanksi: "",
          };

          return (
            <div key={item.id} style={styles.card}>
              {/* HEADER CARD */}
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

              {/* INFORMASI DETAIL */}
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

              {/* CERITA KRONOLOGI */}
              <div>
                <strong style={{ color: "#1B5E20", fontSize: "13px" }}>Kronologi Kejadian:</strong>
                <div style={styles.ceritaBox}>{item.cerita}</div>
              </div>

              {/* LAMPIRAN FOTO */}
              {item.fotoUrl && item.fotoUrl !== "-" && (
                <div style={{ marginBottom: "12px" }}>
                  <strong style={{ color: "#1B5E20", fontSize: "13px" }}>Bukti Foto:</strong>
                  <div>
                    <img
                      src={item.fotoUrl}
                      alt="Bukti Pengaduan"
                      style={styles.thumbFoto}
                      onClick={() => setSelectedFoto(item.fotoUrl)}
                      title="Klik untuk memperbesar"
                    />
                  </div>
                </div>
              )}

              {/* MODUL INTERVENSI & PENANGANAN GURU */}
              <div style={styles.interventionBox}>
                <div style={{ fontWeight: "800", fontSize: "14px", color: "#1B5E20", marginBottom: "10px" }}>
                  Modul Penanganan & Intervensi Kasus
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
                  {/* METODE PENANGANAN */}
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "700", color: "#1B5E20" }}>
                      Penanganan Pelaku & Korban:
                    </label>
                    <select
                      value={currentForm.penanganan}
                      onChange={(e) => handleFormChange(item.id, "penanganan", e.target.value)}
                      style={{ ...styles.inputSmall, fontWeight: "600" }}
                    >
                      <option value="Dipisahkan">Dipisahkan (Perlindungan Korban)</option>
                      <option value="Dipertemukan">Dipertemukan (Mediasi)</option>
                    </select>
                  </div>

                  {/* RESPONS ORANG TUA */}
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "700", color: "#1B5E20" }}>
                      Konfirmasi & Respon Orang Tua:
                    </label>
                    <input
                      type="text"
                      placeholder="Catatan respon ortu..."
                      value={currentForm.responOrangTua}
                      onChange={(e) => handleFormChange(item.id, "responOrangTua", e.target.value)}
                      style={styles.inputSmall}
                    />
                  </div>

                  {/* TAHAPAN HUKUMAN / RESTORASI */}
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "700", color: "#1B5E20" }}>
                      Tahapan Hukuman / Ganti Rugi:
                    </label>
                    <input
                      type="text"
                      placeholder="Pembinaan / Skorsing..."
                      value={currentForm.tindakanSanksi}
                      onChange={(e) => handleFormChange(item.id, "tindakanSanksi", e.target.value)}
                      style={styles.inputSmall}
                    />
                  </div>
                </div>

                <button style={styles.saveBtn} onClick={() => handleSavePenanganan(item.id)}>
                  Simpan Catatan Penanganan
                </button>
              </div>

              {/* FOOTER & AKSI ADMIN */}
              <div style={styles.actionArea}>
                <div style={{ fontSize: "12px", color: "#556B4D" }}>
                  Dilaporkan pada:{" "}
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleString("id-ID")
                    : "-"}
                </div>

                <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                  <label style={{ fontSize: "13px", fontWeight: "800", color: "#1B5E20" }}>
                    Status Kasus:
                  </label>
                  <select
                    value={item.status || "Diproses (Guru/BK)"}
                    onChange={(e) => handleStatusChange(item.id, e.target.value)}
                    style={styles.selectStatus}
                  >
                    <option value="Diproses (Guru/BK)">Diproses (Guru/BK)</option>
                    <option value="Eskalasi: Kepala Sekolah">Eskalasi: Kepala Sekolah</option>
                    <option value="Eskalasi: Dinas/Pengawas">Eskalasi: Dinas/Pengawas</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Ditolak (Fitnah / Tidak Valid)">Ditolak (Fitnah / Tidak Valid)</option>
                  </select>

                  <button
                    style={styles.deleteBtn}
                    onClick={() => handleHapus(item.id)}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* MODAL PREVIEW FOTO */}
      {selectedFoto && (
        <div style={styles.modalOverlay} onClick={() => setSelectedFoto(null)}>
          <div style={{ position: "relative", maxWidth: "90%", maxHeight: "90%" }}>
            <img
              src={selectedFoto}
              alt="Bukti Besar"
              style={{
                width: "100%",
                maxHeight: "80vh",
                objectFit: "contain",
                borderRadius: "12px",
              }}
            />
            <div
              style={{
                color: "#fff",
                textAlign: "center",
                marginTop: "10px",
                fontSize: "13px",
              }}
            >
              Klik di mana saja untuk menutup gambar
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS LAPORAN */}
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

      {/* POP-UP NOTIFIKASI KUSTOM BERDESAIN (PENGGANTI ALERT) */}
      {alertConfig.isOpen && (
        <div style={{ ...styles.modalOverlay, background: "rgba(0,0,0,0.6)" }} onClick={handleCloseAlert}>
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

export default DaftarPengaduan;