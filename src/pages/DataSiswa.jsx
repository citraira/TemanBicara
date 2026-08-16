import { useCallback, useEffect, useMemo, useState } from "react";
import { ref, get, remove } from "firebase/database";
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import { db } from "../firebase";

function DataSiswa() {
  const navigate = useNavigate();

  const [dataSiswa, setDataSiswa] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedQr, setSelectedQr] = useState(null);

  // State untuk Modal Konfirmasi Hapus
  const [deleteTarget, setDeleteTarget] = useState(null); // Menyimpan ID siswa yang akan dihapus

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

  // Ambil data siswa satu kali saat halaman dibuka.
  // Halaman Data Siswa tidak membutuhkan listener realtime terus-menerus,
  // sehingga perubahan satu siswa tidak memaksa seluruh tabel di-render ulang.
  const loadDataSiswa = useCallback(async (showInitialLoading = false) => {
    try {
      if (showInitialLoading) {
        setLoading(true);
      }

      const snapshot = await get(ref(db, "siswa"));

      if (!snapshot.exists()) {
        setDataSiswa([]);
        return;
      }

      const data = snapshot.val();

      const list = Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
      }));

      setDataSiswa(list);
    } catch (error) {
      console.error("Gagal mengambil data siswa:", error);

      showAlert(
        "error",
        "Gagal Memuat Data",
        error.message || "Terjadi kesalahan saat mengambil data siswa."
      );
    } finally {
      if (showInitialLoading) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadDataSiswa(true);
  }, [loadDataSiswa]);

  const refreshDataSiswa = useCallback(async () => {
    try {
      setRefreshing(true);
      await loadDataSiswa(false);
    } finally {
      setRefreshing(false);
    }
  }, [loadDataSiswa]);

  // Membuka modal konfirmasi hapus
  const confirmDelete = (id) => {
    setDeleteTarget(id);
  };

  // Eksekusi penghapusan data setelah dikonfirmasi
  const executeDelete = async () => {
    const id = deleteTarget;
    if (!id) return;

    setDeleteTarget(null);

    try {
      await remove(ref(db, `siswa/${id}`));

      // Optimistic update agar baris langsung hilang tanpa menunggu
      // listener realtime atau reload seluruh halaman.
      setDataSiswa((prev) => prev.filter((item) => item.id !== id));

      showAlert(
        "success",
        "Berhasil Dihapus",
        "Data siswa berhasil dihapus dari sistem."
      );
    } catch (err) {
      showAlert(
        "error",
        "Gagal Menghapus",
        err.message || "Terjadi kesalahan saat menghapus data."
      );
    }
  };

  const downloadQRCode = (format = "png") => {
  if (!selectedQr) return;

  const svg = document.getElementById("qr-code-download");

  if (!svg) {
    showAlert(
      "error",
      "QR Tidak Ditemukan",
      "QR Code belum siap untuk diunduh."
    );
    return;
  }

  try {
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);

    const svgBlob = new Blob(
      [svgString],
      { type: "image/svg+xml;charset=utf-8" }
    );

    const url = URL.createObjectURL(svgBlob);
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");

      const size = 800;
      canvas.width = size;
      canvas.height = size;

      const context = canvas.getContext("2d");

      // Background putih agar JPG tidak transparan
      context.fillStyle = "#FFFFFF";
      context.fillRect(0, 0, size, size);

      context.drawImage(
        image,
        0,
        0,
        size,
        size
      );

      const extension = format === "jpg" ? "jpg" : "png";
      const mimeType =
        format === "jpg"
          ? "image/jpeg"
          : "image/png";

      const dataUrl = canvas.toDataURL(
        mimeType,
        0.95
      );

      const link = document.createElement("a");

      link.download = `QR-${selectedQr.nis || selectedQr.id}.${extension}`;
      link.href = dataUrl;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);

      showAlert(
        "error",
        "Gagal Download",
        "QR Code tidak dapat dikonversi menjadi gambar."
      );
    };

    image.src = url;
  } catch (error) {
    console.error("Gagal download QR:", error);

    showAlert(
      "error",
      "Gagal Download",
      "Terjadi kesalahan saat membuat file QR."
    );
  }
};

  // Hanya hitung ulang hasil pencarian ketika data atau kata kunci berubah.
  const hasilPencarian = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return dataSiswa;
    }

    return dataSiswa.filter((item) => {
      return (
        String(item.nama || "").toLowerCase().includes(keyword) ||
        String(item.nis || "").toLowerCase().includes(keyword) ||
        String(item.kelas || "").toLowerCase().includes(keyword)
      );
    });
  }, [dataSiswa, search]);

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
      margin: 0,
    },
    topButton: {
      background: "#FFEB3B",
      color: "#1B5E20",
      border: "none",
      padding: "10px 16px",
      borderRadius: "12px",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: "800",
      boxShadow: "0 3px 0 #FBC02D",
    },
    backButton: {
      background: "#FFEB3B",
      color: "#1B5E20",
      border: "none",
      padding: "12px 20px",
      borderRadius: "12px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "800",
      boxShadow: "0 3px 0 #FBC02D",
      marginTop: "15px",
    },
    search: {
      width: "100%",
      padding: "12px 14px",
      borderRadius: "12px",
      border: "2px solid #C8E6C9",
      marginBottom: "20px",
      fontSize: "14px",
      boxSizing: "border-box",
      outline: "none",
      background: "#fff",
    },
    tableContainer: {
      background: "#fff",
      borderRadius: "18px",
      overflowX: "auto",
      boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
      border: "2px solid #C8E6C9",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      minWidth: "800px",
    },
    th: {
      background: "#2E7D32",
      color: "#fff",
      padding: "14px 12px",
      textAlign: "center",
      fontSize: "13px",
      fontWeight: "800",
    },
    td: {
      padding: "12px",
      borderBottom: "1px solid #E8F5E9",
      textAlign: "center",
      fontSize: "13px",
      color: "#2E3D29",
    },
    qrBtn: {
      background: "#2E7D32",
      color: "#fff",
      border: "none",
      padding: "6px 12px",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "700",
      fontSize: "12px",
    },
    editButton: {
      background: "#FFEB3B",
      color: "#1B5E20",
      border: "none",
      padding: "6px 12px",
      borderRadius: "8px",
      cursor: "pointer",
      marginRight: "6px",
      fontWeight: "800",
      fontSize: "12px",
      boxShadow: "0 2px 0 #FBC02D",
    },
    deleteButton: {
      background: "#D32F2F",
      color: "#fff",
      border: "none",
      padding: "6px 12px",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "800",
      fontSize: "12px",
    },
    empty: {
      textAlign: "center",
      padding: "35px",
      color: "#556B4D",
      fontSize: "14px",
      fontWeight: "600",
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
      textAlign: "center",
      maxWidth: "360px",
      width: "100%",
      boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
      border: "2px solid #C8E6C9",
      boxSizing: "border-box",
    },
    printBtn: {
      background: "#2E7D32",
      color: "#fff",
      border: "none",
      padding: "12px",
      borderRadius: "12px",
      cursor: "pointer",
      fontWeight: "800",
      marginTop: "15px",
      width: "100%",
      fontSize: "13px",
      boxShadow: "0 3px 0 #1B5E20",
      textTransform: "uppercase",
    },
    closeBtn: {
      background: "#FFEB3B",
      color: "#1B5E20",
      border: "none",
      padding: "12px",
      borderRadius: "12px",
      cursor: "pointer",
      fontWeight: "800",
      marginTop: "10px",
      width: "100%",
      fontSize: "13px",
      boxShadow: "0 3px 0 #FBC02D",
    },
    // Style Tambahan Tombol Modal Konfirmasi
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
        <h1 style={styles.title}>Data Siswa</h1>

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
              ...styles.topButton,
              opacity: refreshing ? 0.6 : 1,
              cursor: refreshing ? "not-allowed" : "pointer",
            }}
            onClick={refreshDataSiswa}
            disabled={refreshing}
          >
            {refreshing ? "Memuat..." : "↻ Refresh"}
          </button>

          <button
            type="button"
            style={styles.topButton}
            onClick={() => navigate("/tambah-siswa")}
          >
            Tambah Siswa
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Cari Nama, NIS atau Kelas..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={styles.search}
      />

      {/* TABEL */}
      {loading ? (
        <div
          style={{
            background: "#fff",
            padding: "35px 20px",
            borderRadius: "18px",
            textAlign: "center",
            color: "#1B5E20",
            border: "2px solid #C8E6C9",
            fontWeight: "700",
          }}
        >
          Memuat data siswa...
        </div>
      ) : (
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>No</th>
              <th style={styles.th}>Nama Lengkap</th>
              <th style={styles.th}>NIS</th>
              <th style={styles.th}>Kelas</th>
              <th style={styles.th}>Jenis Kelamin</th>
              <th style={styles.th}>No HP Orang Tua</th>
              <th style={styles.th}>QR Code</th>
              <th style={styles.th}>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {hasilPencarian.length === 0 ? (
              <tr>
                <td colSpan="8" style={styles.empty}>
                  {search.trim()
                    ? "Data siswa yang dicari tidak ditemukan."
                    : "Belum ada data siswa."}
                </td>
              </tr>
            ) : (
              hasilPencarian.map((item, index) => (
                <tr key={item.id}>
                  <td style={styles.td}>{index + 1}</td>
                  <td style={styles.td}>{item.nama}</td>
                  <td style={styles.td}>{item.nis || item.id}</td>
                  <td style={styles.td}>{item.kelas}</td>
                  <td style={styles.td}>{item.jenisKelamin}</td>
                  <td style={styles.td}>{item.noHp}</td>
                  <td style={styles.td}>
                    <button
                      style={styles.qrBtn}
                      onClick={() => setSelectedQr(item)}
                    >
                      Lihat QR
                    </button>
                  </td>
                  <td style={styles.td}>
                    <button
                      style={styles.editButton}
                      onClick={() => navigate(`/edit-siswa/${item.id}`)}
                    >
                      Edit
                    </button>

                    <button
                      style={styles.deleteButton}
                      onClick={() => confirmDelete(item.id)}
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      )}

      {/* MODAL POPUP CETAK/LIHAT QR CODE */}
      {selectedQr && (
        <div style={styles.modalOverlay} onClick={() => setSelectedQr(null)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: "#1B5E20", marginBottom: "5px", fontSize: "18px", fontWeight: "800" }}>
              Kartu QR Siswa
            </h3>
            <p style={{ margin: "5px 0", fontWeight: "800", color: "#2E3D29" }}>
              {selectedQr.nama}
            </p>
            <p style={{ color: "#556B4D", fontSize: "13px", marginBottom: "18px" }}>
              Kelas: {selectedQr.kelas} | NIS: {selectedQr.nis || selectedQr.id}
            </p>

            <div
              style={{
                background: "#fff",
                padding: "15px",
                borderRadius: "12px",
                border: "1px solid #C8E6C9",
                display: "inline-block"
              }}
            >
              <QRCode
                id="qr-code-download"
                value={selectedQr.id || selectedQr.nis}
                size={300}
              />
            </div>

            <button
              style={styles.printBtn}
              onClick={() => downloadQRCode("png")}
            >
              Download PNG
            </button>

            <button
              style={{
                ...styles.printBtn,
                background: "#1565C0",
                boxShadow: "0 3px 0 #0D47A1",
              }}
              onClick={() => downloadQRCode("jpg")}
            >
              Download JPG
            </button>

            <button
              style={styles.closeBtn}
              onClick={() => setSelectedQr(null)}
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {deleteTarget && (
        <div style={styles.modalOverlay} onClick={() => setDeleteTarget(null)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.alertIconWrapper("warning")}>⚠️</div>
            <h3 style={{ color: "#C62828", fontSize: "18px", fontWeight: "800", marginBottom: "8px" }}>
              Konfirmasi Hapus
            </h3>
            <p style={{ color: "#556B4D", fontSize: "13px", marginBottom: "15px", lineHeight: "1.5" }}>
              Apakah Anda yakin ingin menghapus data siswa ini dari sistem?
            </p>
            <div style={styles.modalBtnGroup}>
              <button style={styles.confirmYesBtn} onClick={executeDelete}>
                Ya, Hapus
              </button>
              <button style={styles.confirmNoBtn} onClick={() => setDeleteTarget(null)}>
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

      <button
        style={styles.backButton}
        onClick={() => navigate("/dashboard-admin")}
      >
        Kembali ke Dashboard
      </button>
    </div>
  );
}

export default DataSiswa;