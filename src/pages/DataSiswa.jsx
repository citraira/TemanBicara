import { useEffect, useState } from "react";
import { ref, onValue, remove } from "firebase/database";
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import { db } from "../firebase";

function DataSiswa() {
  const navigate = useNavigate();

  const [dataSiswa, setDataSiswa] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedQr, setSelectedQr] = useState(null);

  useEffect(() => {
    const siswaRef = ref(db, "siswa");

    const unsubscribe = onValue(siswaRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        const list = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));

        setDataSiswa(list);
      } else {
        setDataSiswa([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = (id) => {
    const yakin = window.confirm("Apakah yakin ingin menghapus data siswa?");
    if (!yakin) return;

    remove(ref(db, `siswa/${id}`))
      .then(() => {
        alert("Data berhasil dihapus.");
      })
      .catch((err) => {
        alert(err.message);
      });
  };

  const hasilPencarian = dataSiswa.filter((item) => {
    const keyword = search.toLowerCase();

    return (
      item.nama?.toLowerCase().includes(keyword) ||
      item.nis?.toLowerCase().includes(keyword) ||
      item.kelas?.toLowerCase().includes(keyword)
    );
  });

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
    },
    modalCard: {
      background: "#fff",
      padding: "25px 20px",
      borderRadius: "20px",
      textAlign: "center",
      maxWidth: "340px",
      width: "100%",
      boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
      border: "2px solid #C8E6C9",
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
  };

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.title}>Data Siswa</h1>

        <button
          style={styles.topButton}
          onClick={() => navigate("/tambah-siswa")}
        >
          Tambah Siswa
        </button>
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
                  Belum ada data siswa.
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
                      onClick={() => handleDelete(item.id)}
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

      {/* MODAL POPUP CETAK/LIHAT QR CODE */}
      {selectedQr && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <h3 style={{ color: "#1B5E20", marginBottom: "5px", fontSize: "18px", fontWeight: "800" }}>
              Kartu QR Siswa
            </h3>
            <p style={{ margin: "5px 0", fontWeight: "800", color: "#2E3D29" }}>
              {selectedQr.nama}
            </p>
            <p style={{ color: "#556B4D", fontSize: "13px", marginBottom: "18px" }}>
              Kelas: {selectedQr.kelas} | NIS: {selectedQr.nis || selectedQr.id}
            </p>

            <div style={{ background: "#fff", padding: "15px", borderRadius: "12px", border: "1px solid #C8E6C9", display: "inline-block" }}>
              <QRCode value={selectedQr.id || selectedQr.nis} size={160} />
            </div>

            <button style={styles.printBtn} onClick={() => window.print()}>
              Cetak Kartu QR
            </button>
            <button style={styles.closeBtn} onClick={() => setSelectedQr(null)}>
              Tutup
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