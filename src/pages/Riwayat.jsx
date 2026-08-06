import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase";

function Riwayat() {
  const navigate = useNavigate();
  const [riwayatList, setRiwayatList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [namaSiswa, setNamaSiswa] = useState("");
  const [selectedFoto, setSelectedFoto] = useState(null);

  useEffect(() => {
    const savedNama = localStorage.getItem("namaSiswa");
    if (savedNama) {
      setNamaSiswa(savedNama);
    }

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

          const filtered = savedNama
            ? formattedList.filter(
                (item) =>
                  item.nama &&
                  item.nama.toLowerCase().trim() === savedNama.toLowerCase().trim()
              )
            : formattedList;

          filtered.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );

          setRiwayatList(filtered);
        } else {
          setRiwayatList([]);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Gagal mengambil data riwayat:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Selesai":
        return {
          label: "Selesai Penanganan",
          style: { background: "#E8F5E9", color: "#2E7D32", border: "1px solid #A5D6A7" },
        };
      case "Ditolak (Fitnah / Tidak Valid)":
      case "Ditolak":
        return {
          label: "Ditolak / Tidak Valid",
          style: { background: "#FFEBEE", color: "#C62828", border: "1px solid #EF9A9A" },
        };
      case "Eskalasi: Kepala Sekolah":
        return {
          label: "Ditangani Kepala Sekolah",
          style: { background: "#EDE7F6", color: "#512DA8", border: "1px solid #B39DDB" },
        };
      case "Eskalasi: Dinas/Pengawas":
        return {
          label: "Ditangani Dinas / Pengawas",
          style: { background: "#F3E5F5", color: "#8E24AA", border: "1px solid #CE93D8" },
        };
      default:
        return {
          label: "Sedang Diproses Guru BK",
          style: { background: "#FFFDE7", color: "#F57F17", border: "1px solid #FFF59D" },
        };
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
    container: {
      maxWidth: "800px",
      margin: "0 auto",
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
      marginBottom: "18px",
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
    },
    followUpBox: {
      background: "#E8F5E9",
      border: "1px solid #C8E6C9",
      borderRadius: "12px",
      padding: "12px",
      marginTop: "12px",
      fontSize: "13px",
      color: "#1B5E20",
    },
    thumbFoto: {
      width: "75px",
      height: "75px",
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
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <div style={styles.title}>Riwayat Laporan Pengaduan</div>
            <p style={{ margin: "4px 0 0 0", fontSize: "13px", opacity: 0.95 }}>
              {namaSiswa ? `Laporan atas nama: ${namaSiswa}` : "Pantau status pengaduanmu di sini"}
            </p>
          </div>
          <button
            style={styles.backButton}
            onClick={() => navigate("/dashboard-siswa")}
          >
            Kembali
          </button>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#1B5E20", fontWeight: "600" }}>
            Memuat riwayat laporan...
          </div>
        ) : riwayatList.length === 0 ? (
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
            Kamu belum pernah mengirimkan laporan pengaduan.
          </div>
        ) : (
          riwayatList.map((item) => {
            const statusInfo = getStatusBadge(item.status);
            return (
              <div key={item.id} style={styles.card}>
                {/* HEADER CARD */}
                <div style={styles.cardHeader}>
                  <div style={{ fontWeight: "800", fontSize: "15px", color: "#1B5E20" }}>
                    Laporan Tanggal: {item.tanggal || "-"}
                  </div>
                  <div style={{ ...styles.badge, ...statusInfo.style }}>
                    {statusInfo.label}
                  </div>
                </div>

                {/* DETAIL LAPORAN */}
                <div style={styles.grid}>
                  <div>
                    <strong style={{ color: "#1B5E20" }}>Lokasi:</strong> <br />
                    {item.lokasi || "-"}
                  </div>
                  <div>
                    <strong style={{ color: "#1B5E20" }}>Jenis Bullying:</strong> <br />
                    {item.jenis || "-"}
                  </div>
                  <div>
                    <strong style={{ color: "#1B5E20" }}>Peran Pelapor:</strong> <br />
                    {item.peran || "Korban"}
                  </div>
                  <div>
                    <strong style={{ color: "#1B5E20" }}>Terduga Pelaku:</strong> <br />
                    {item.pelaku || "Tidak disebutkan"}
                  </div>
                  <div>
                    <strong style={{ color: "#1B5E20" }}>Saksi Mata:</strong> <br />
                    {item.saksi === "Ya"
                      ? `${item.namaSaksi || "Ada Saksi"} (${item.kelasSaksi || "Kelas -"})`
                      : "Tidak Ada"}
                  </div>
                </div>

                {/* CERITA */}
                <div style={{ marginBottom: "10px" }}>
                  <strong style={{ color: "#1B5E20", fontSize: "13px" }}>Cerita Kejadian:</strong>
                  <div style={styles.ceritaBox}>{item.cerita}</div>
                </div>

                {/* BUKTI FOTO */}
                {item.fotoUrl && item.fotoUrl !== "-" && (
                  <div style={{ marginBottom: "10px" }}>
                    <strong style={{ color: "#1B5E20", fontSize: "13px" }}>Bukti Foto:</strong> <br />
                    <img
                      src={item.fotoUrl}
                      alt="Bukti Foto"
                      style={styles.thumbFoto}
                      onClick={() => setSelectedFoto(item.fotoUrl)}
                    />
                  </div>
                )}

                {/* STATUS PENANGANAN GURU */}
                {(item.penanganan || item.responOrangTua || item.tindakanSanksi) && (
                  <div style={styles.followUpBox}>
                    <strong style={{ fontSize: "13px" }}>Update Penanganan Guru:</strong>
                    <ul style={{ margin: "6px 0 0 0", paddingLeft: "18px", lineHeight: "1.5" }}>
                      {item.penanganan && (
                        <li><strong>Metode Penanganan:</strong> {item.penanganan}</li>
                      )}
                      {item.responOrangTua && (
                        <li><strong>Status Orang Tua:</strong> {item.responOrangTua}</li>
                      )}
                      {item.tindakanSanksi && (
                        <li><strong>Tindakan / Sanksi:</strong> {item.tindakanSanksi}</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* MODAL PREVIEW FOTO */}
      {selectedFoto && (
        <div style={styles.modalOverlay} onClick={() => setSelectedFoto(null)}>
          <div style={{ position: "relative", maxWidth: "90%", maxHeight: "90%" }}>
            <img
              src={selectedFoto}
              alt="Bukti Foto Besar"
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
              Klik di mana saja untuk menutup
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Riwayat;