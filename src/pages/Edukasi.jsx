import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ref, get } from "firebase/database";
import { db } from "../firebase";

function Edukasi() {
  const navigate = useNavigate();
  const [edukasiList, setEdukasiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMateri, setSelectedMateri] = useState(null);

  // Materi edukasi tidak perlu listener realtime terus-menerus.
  // Ambil data saat halaman dibuka dan saat pengguna menekan Refresh.
  const loadEdukasi = useCallback(async (showInitialLoading = false) => {
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
      console.error("Gagal mengambil materi edukasi:", error);
      setEdukasiList([]);
    } finally {
      if (showInitialLoading) {
        setLoading(false);
      }
    }
  }, []);

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


  const styles = {
    page: {
      minHeight: "100vh",
      background: "#F5F9FF",
      padding: "20px 15px",
      fontFamily: "'Segoe UI', Roboto, sans-serif",
      boxSizing: "border-box",
    },
    container: { maxWidth: "800px", margin: "0 auto" },
    header: {
      background: "#1565C0",
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
    subtitle: {
      margin: "4px 0 0 0",
      opacity: 0.95,
      fontSize: "13px",
    },
    backButton: {
      padding: "10px 16px",
      background: "#FFFFFF",
      color: "#0D47A1",
      border: "none",
      borderRadius: "12px",
      cursor: "pointer",
      fontWeight: "800",
      fontSize: "13px",
      boxShadow: "0 3px 0 #90CAF9",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
      gap: "16px",
    },
    card: {
      background: "#fff",
      padding: "20px 18px",
      borderRadius: "18px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
      border: "2px solid #BBDEFB",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    },
    kategoriBadge: {
      background: "#FFFFFF",
      color: "#0D47A1",
      padding: "4px 10px",
      borderRadius: "10px",
      fontSize: "12px",
      fontWeight: "800",
      display: "inline-block",
    },
    cardTitle: {
      color: "#0D47A1",
      fontSize: "17px",
      fontWeight: "800",
      marginTop: "10px",
      marginBottom: "8px",
    },
    cardDesc: {
      fontSize: "13px",
      color: "#526579",
      lineHeight: "1.5",
    },
    readBtn: {
      padding: "12px",
      background: "#1565C0",
      color: "#fff",
      border: "none",
      borderRadius: "12px",
      cursor: "pointer",
      fontWeight: "800",
      marginTop: "15px",
      width: "100%",
      fontSize: "13px",
      boxShadow: "0 3px 0 #0D47A1",
      textTransform: "uppercase",
    },
    modalOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.6)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
      padding: "15px",
      boxSizing: "border-box",
    },
    modalContent: {
      background: "#fff",
      padding: "25px 20px",
      borderRadius: "20px",
      maxWidth: "550px",
      width: "100%",
      maxHeight: "85vh",
      overflowY: "auto",
      boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
      border: "2px solid #BBDEFB",
    },
    closeBtn: {
      marginTop: "20px",
      padding: "12px 20px",
      background: "#FFFFFF",
      color: "#0D47A1",
      border: "none",
      borderRadius: "12px",
      cursor: "pointer",
      fontWeight: "800",
      width: "100%",
      fontSize: "14px",
      boxShadow: "0 3px 0 #90CAF9",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Pusat Edukasi Anti-Bullying</h2>
            <p style={styles.subtitle}>
              Pelajari informasi penting untuk mencegah dan menghadapi bullying di sekolah
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
                ...styles.backButton,
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
              style={styles.backButton}
              onClick={() => navigate("/dashboard-siswa")}
            >
              Kembali
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#0D47A1", fontWeight: "600" }}>
            Memuat materi edukasi...
          </div>
        ) : edukasiList.length === 0 ? (
          <div style={{ background: "#fff", padding: "30px", borderRadius: "18px", textAlign: "center", color: "#526579", border: "2px solid #BBDEFB", fontWeight: "600" }}>
            Belum ada materi edukasi yang diterbitkan oleh guru.
          </div>
        ) : (
          <div style={styles.grid}>
            {edukasiList.map((item) => (
              <div key={item.id} style={styles.card}>
                <div>
                  <span style={styles.kategoriBadge}>
                    {item.kategori || "Edukasi"}
                  </span>
                  <h3 style={styles.cardTitle}>
                    {item.judul}
                  </h3>
                  <p style={styles.cardDesc}>
                    {item.ringkasan || (item.isi ? item.isi.substring(0, 90) + "..." : "")}
                  </p>
                </div>
                <button
                  style={styles.readBtn}
                  onClick={() => setSelectedMateri(item)}
                >
                  Baca Selengkapnya
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL BACA LENGKAP */}
      {selectedMateri && (
        <div style={styles.modalOverlay} onClick={() => setSelectedMateri(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <span style={styles.kategoriBadge}>
              {selectedMateri.kategori || "Edukasi"}
            </span>
            <h2 style={{ color: "#0D47A1", marginTop: "10px", fontSize: "20px", fontWeight: "800" }}>
              {selectedMateri.judul}
            </h2>
            <hr style={{ border: "none", borderBottom: "2px solid #E3F2FD", margin: "15px 0" }} />
            <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#26384A", whiteSpace: "pre-line" }}>
              {selectedMateri.isi}
            </p>
            <button
              style={styles.closeBtn}
              onClick={() => setSelectedMateri(null)}
            >
              Tutup Artikel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Edukasi;