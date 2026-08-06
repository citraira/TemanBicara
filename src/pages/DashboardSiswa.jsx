import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase";

function DashboardSiswa() {
  const navigate = useNavigate();
  const [namaSiswa, setNamaSiswa] = useState("Siswa");
  const [notifList, setNotifList] = useState([]);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const savedNama = localStorage.getItem("namaSiswa");
    if (savedNama) {
      setNamaSiswa(savedNama);
    }

    const pengaduanRef = ref(db, "pengaduan");
    const unsubscribe = onValue(pengaduanRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formatted = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));

        const aduanSaya = savedNama
          ? formatted.filter(
              (item) =>
                item.nama &&
                item.nama.toLowerCase().trim() === savedNama.toLowerCase().trim()
            )
          : formatted;

        aduanSaya.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setNotifList(aduanSaya);

        const lastReadTime = localStorage.getItem(`lastReadNotif_${savedNama || "guest"}`);
        if (lastReadTime) {
          const unread = aduanSaya.filter(
            (item) => new Date(item.createdAt) > new Date(lastReadTime)
          ).length;
          setUnreadCount(unread);
        } else {
          setUnreadCount(aduanSaya.length);
        }
      } else {
        setNotifList([]);
        setUnreadCount(0);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleOpenNotif = () => {
    setShowNotifModal(true);
    setUnreadCount(0);
    const savedNama = localStorage.getItem("namaSiswa") || "guest";
    localStorage.setItem(`lastReadNotif_${savedNama}`, new Date().toISOString());
  };

  const handleLogout = () => {
    if (window.confirm("Apakah kamu yakin ingin keluar?")) {
      localStorage.removeItem("namaSiswa");
      localStorage.removeItem("role");
      navigate("/");
    }
  };

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#F4FBEE",
      fontFamily: "'Segoe UI', Roboto, sans-serif",
      paddingBottom: "85px",
    },
    header: {
      background: "#2E7D32",
      color: "#fff",
      padding: "20px 20px 25px 20px",
      borderBottomLeftRadius: "24px",
      borderBottomRightRadius: "24px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    },
    topRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    profile: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    avatar: {
      width: "50px",
      height: "50px",
      borderRadius: "50%",
      background: "#FFEB3B",
      color: "#1B5E20",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: "20px",
      fontWeight: "800",
    },
    hello: { fontSize: "13px", opacity: ".9" },
    name: { fontSize: "18px", fontWeight: "800" },
    headerActions: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    notifBtn: {
      position: "relative",
      fontSize: "22px",
      cursor: "pointer",
      background: "rgba(255, 255, 255, 0.2)",
      border: "none",
      color: "#fff",
      padding: "8px 12px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "42px",
      height: "42px",
    },
    badgeCount: {
      position: "absolute",
      top: "-2px",
      right: "-2px",
      background: "#FF3B30",
      color: "#fff",
      fontSize: "11px",
      borderRadius: "50%",
      padding: "2px 6px",
      fontWeight: "bold",
    },
    logoutBtn: {
      background: "#FFEB3B",
      color: "#1B5E20",
      border: "none",
      padding: "8px 14px",
      borderRadius: "20px",
      cursor: "pointer",
      fontWeight: "800",
      fontSize: "13px",
    },

    welcomeCard: {
      background: "#FFFDE7",
      margin: "20px 15px",
      borderRadius: "20px",
      padding: "20px",
      border: "2px solid #FFF59D",
      boxShadow: "0 4px 10px rgba(0,0,0,0.03)",
    },
    welcomeTitle: {
      fontSize: "22px",
      fontWeight: "800",
      color: "#1B5E20",
      marginBottom: "8px",
    },
    welcomeText: {
      color: "#556B4D",
      lineHeight: "1.5",
      fontSize: "14px",
      fontWeight: "500",
    },

    sectionTitle: {
      fontSize: "20px",
      fontWeight: "800",
      color: "#1B5E20",
      margin: "0 15px 15px 15px",
    },

    menuGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
      gap: "12px",
      padding: "0 15px",
    },

    menuCard: {
      background: "#fff",
      borderRadius: "18px",
      padding: "22px 15px",
      textAlign: "center",
      cursor: "pointer",
      boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
      border: "2px solid #C8E6C9",
    },
    menuTitle: {
      fontSize: "17px",
      fontWeight: "800",
      color: "#1B5E20",
      marginBottom: "8px",
    },
    menuDesc: {
      color: "#667C5E",
      lineHeight: "1.4",
      fontSize: "13px",
    },

    modalOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(0,0,0,0.4)",
      zIndex: 1000,
      display: "flex",
      justifyContent: "flex-end",
    },
    sidePanel: {
      width: "100%",
      maxWidth: "380px",
      height: "100%",
      background: "#fff",
      display: "flex",
      flexDirection: "column",
      padding: "20px 18px",
      boxSizing: "border-box",
      overflowY: "auto",
    },
    panelHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
    },
    panelTitle: {
      fontSize: "22px",
      fontWeight: "800",
      color: "#1B5E20",
      margin: 0,
    },
    closeBtn: {
      background: "none",
      border: "none",
      fontSize: "20px",
      cursor: "pointer",
      color: "#555",
      fontWeight: "800",
    },

    emptyState: {
      textAlign: "center",
      padding: "30px 10px",
    },

    notifItemCard: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 0",
      borderBottom: "1px solid #E8F5E9",
    },
    actionBtn: {
      padding: "6px 12px",
      background: "#2E7D32",
      color: "#fff",
      border: "none",
      borderRadius: "10px",
      fontWeight: "700",
      fontSize: "12px",
      cursor: "pointer",
    },

    bottomNav: {
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      height: "65px",
      background: "#fff",
      display: "flex",
      justifyContent: "space-around",
      alignItems: "center",
      boxShadow: "0 -2px 10px rgba(0,0,0,0.06)",
      borderTop: "1px solid #E8F5E9",
    },
    navItem: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      color: "#2E7D32",
      fontWeight: "700",
      fontSize: "11px",
      gap: "3px",
    },
    navIcon: {
      fontSize: "20px",
      lineHeight: "1",
    },
  };

  return (
    <div style={styles.page}>
      {/* HEADER DASHBOARD */}
      <div style={styles.header}>
        <div style={styles.topRow}>
          <div style={styles.profile}>
            <div style={styles.avatar}>
              {namaSiswa ? namaSiswa.charAt(0).toUpperCase() : "S"}
            </div>
            <div>
              <div style={styles.hello}>Halo,</div>
              <div style={styles.name}>{namaSiswa}</div>
            </div>
          </div>

          <div style={styles.headerActions}>
            <button style={styles.notifBtn} onClick={handleOpenNotif} title="Pemberitahuan">
              🔔
              {unreadCount > 0 && (
                <span style={styles.badgeCount}>{unreadCount}</span>
              )}
            </button>

            <button style={styles.logoutBtn} onClick={handleLogout}>
              Keluar
            </button>
          </div>
        </div>
      </div>

      {/* KARTU SAMBUTAN */}
      <div style={styles.welcomeCard}>
        <div style={styles.welcomeTitle}>Berani Bicara!</div>
        <div style={styles.welcomeText}>
          Selamat datang di Sistem Pengaduan Bullying. Jangan takut melapor apabila kamu mengalami atau melihat tindakan bullying di sekolah.
        </div>
      </div>

      {/* MENU UTAMA */}
      <div style={styles.sectionTitle}>Menu Utama</div>

      <div style={styles.menuGrid}>
        <div style={styles.menuCard} onClick={() => navigate("/pengaduan")}>
          <div style={styles.menuTitle}>Buat Laporan</div>
          <div style={styles.menuDesc}>Laporkan tindakan bullying dengan aman.</div>
        </div>

        <div style={styles.menuCard} onClick={() => navigate("/riwayat")}>
          <div style={styles.menuTitle}>Riwayat</div>
          <div style={styles.menuDesc}>Lihat status laporan yang pernah dikirim.</div>
        </div>

        <div style={styles.menuCard} onClick={() => navigate("/edukasi")}>
          <div style={styles.menuTitle}>Edukasi</div>
          <div style={styles.menuDesc}>Pelajari cara mencegah tindakan bullying.</div>
        </div>

        <div style={styles.menuCard} onClick={() => navigate("/hubungi-guru")}>
          <div style={styles.menuTitle}>Hubungi Guru</div>
          <div style={styles.menuDesc}>Dapatkan bantuan langsung dari Guru BK.</div>
        </div>
      </div>

      {/* POP-UP MODAL NOTIFIKASI SISI KANAN */}
      {showNotifModal && (
        <div style={styles.modalOverlay} onClick={() => setShowNotifModal(false)}>
          <div style={styles.sidePanel} onClick={(e) => e.stopPropagation()}>
            <div style={styles.panelHeader}>
              <h2 style={styles.panelTitle}>Notifikasi</h2>
              <button style={styles.closeBtn} onClick={() => setShowNotifModal(false)}>
                X
              </button>
            </div>

            {notifList.length === 0 ? (
              <div style={styles.emptyState}>
                <h4 style={{ fontSize: "16px", color: "#1B5E20", margin: "10px 0 5px 0" }}>
                  Belum Ada Aktivitas
                </h4>
                <p style={{ color: "#667C5E", fontSize: "13px" }}>
                  Saat guru memperbarui status laporanmu, pemberitahuan akan muncul di sini.
                </p>
              </div>
            ) : (
              <div>
                {notifList.map((item) => (
                  <div key={item.id} style={styles.notifItemCard}>
                    <div>
                      <p style={{ fontSize: "13px", fontWeight: "700", margin: "0 0 4px 0", color: "#2E3D29" }}>
                        Laporan: {item.jenis || "Pengaduan"}
                      </p>
                      <span style={{ fontSize: "12px", color: "#556B4D" }}>
                        Status: <strong>{item.status || "Diproses"}</strong>
                      </span>
                    </div>
                    <button
                      style={styles.actionBtn}
                      onClick={() => {
                        setShowNotifModal(false);
                        navigate("/riwayat");
                      }}
                    >
                      Lihat
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* BOTTOM NAVIGATION DENGAN IKON & TEKS */}
      <div style={styles.bottomNav}>
        <div style={styles.navItem} onClick={() => navigate("/dashboard-siswa")}>
          <span style={styles.navIcon}>🏠</span>
          <span>Beranda</span>
        </div>
        <div style={styles.navItem} onClick={() => navigate("/pengaduan")}>
          <span style={styles.navIcon}>📝</span>
          <span>Lapor</span>
        </div>
        <div style={styles.navItem} onClick={() => navigate("/edukasi")}>
          <span style={styles.navIcon}>📖</span>
          <span>Edukasi</span>
        </div>
        <div style={styles.navItem} onClick={() => navigate("/hubungi-guru")}>
          <span style={styles.navIcon}>👨‍🏫</span>
          <span>Guru</span>
        </div>
      </div>
    </div>
  );
}

export default DashboardSiswa;
