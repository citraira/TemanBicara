import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase";

function DashboardAdmin() {
  const navigate = useNavigate();
  const [jumlahAduanBaru, setJumlahAduanBaru] = useState(0);
  const [notifBaru, setNotifBaru] = useState(null);
  const [aduanList, setAduanList] = useState([]);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // State Modal Statistik
  const [showStatistikModal, setShowStatistikModal] = useState(false);

  // Ambil data profil admin dari localStorage
  const namaGuru = localStorage.getItem("namaGuru") || "Guru BK";
  const soundEnabled = localStorage.getItem("soundEnabled") !== "false";

  useEffect(() => {
    const pengaduanRef = ref(db, "pengaduan");
    let initialLoad = true;

    const unsubscribe = onValue(
      pengaduanRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const list = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));

          list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setAduanList(list);

          const aduanDiproses = list.filter(
            (item) => !item.status || item.status.includes("Diproses")
          );
          setJumlahAduanBaru(aduanDiproses.length);

          // Hitung Unread berdasarkan timestamp terakhir kali notif dibuka
          const lastReadTime = localStorage.getItem("lastReadAdminNotif");
          if (lastReadTime) {
            const unread = list.filter(
              (item) => new Date(item.createdAt) > new Date(lastReadTime)
            ).length;
            setUnreadCount(unread);
          } else {
            setUnreadCount(0); // Default 0 jika tidak ada aduan baru setelah login
          }

          // Tampilkan Pop-Up Toast hanya jika ada aduan masuk secara REALTIME setelah halaman dibuka
          const lastShownToastId = localStorage.getItem("lastShownToastId");
          if (!initialLoad && list.length > 0) {
            const aduanTerbaru = list[0];

            if (aduanTerbaru.id !== lastShownToastId) {
              setNotifBaru(aduanTerbaru);
              localStorage.setItem("lastShownToastId", aduanTerbaru.id);

              if (soundEnabled) {
                try {
                  const audio = new Audio(
                    "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"
                  );
                  audio.play();
                } catch (err) {
                  console.log("Audio autoplay diblokir browser:", err);
                }
              }
            }
          }
        } else {
          setAduanList([]);
          setJumlahAduanBaru(0);
          setUnreadCount(0);
        }
        initialLoad = false;
      },
      (error) => {
        console.error("Gagal mendengarkan notifikasi:", error);
      }
    );

    return () => unsubscribe();
  }, [soundEnabled]);

  // FUNGSI SAAT TOMBOL LONCENG NOTIFIKASI DIBUKA
  const handleOpenNotif = () => {
    setShowNotifModal(true);
    setUnreadCount(0);
    // Tandai seluruh notifikasi sudah dibaca per detik ini
    localStorage.setItem("lastReadAdminNotif", new Date().toISOString());
  };

  // FUNGSI BUKA LAPORAN & TANDAI DIBACA
  const handleBukaLaporan = () => {
    setShowNotifModal(false);
    setUnreadCount(0);
    localStorage.setItem("lastReadAdminNotif", new Date().toISOString());
    navigate("/daftar-pengaduan");
  };

  // Perhitungan Data Statistik
  const totalAduan = aduanList.length;
  const totalDiproses = aduanList.filter(
    (item) => !item.status || item.status.includes("Diproses")
  ).length;
  const totalSelesai = aduanList.filter(
    (item) => item.status === "Selesai"
  ).length;
  const persentaseSelesai =
    totalAduan > 0 ? Math.round((totalSelesai / totalAduan) * 100) : 0;

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#F4FBEE",
      fontFamily: "'Segoe UI', Roboto, sans-serif",
      padding: "20px 15px",
      boxSizing: "border-box",
    },
    header: {
      background: "#2E7D32",
      color: "#fff",
      padding: "20px",
      borderRadius: "20px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "25px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
      flexWrap: "wrap",
      gap: "12px",
    },
    title: { fontSize: "22px", fontWeight: "800" },
    headerActions: { display: "flex", alignItems: "center", gap: "12px" },
    notifBtn: {
      position: "relative",
      fontSize: "20px",
      cursor: "pointer",
      background: "rgba(255, 255, 255, 0.2)",
      border: "none",
      color: "#fff",
      borderRadius: "50%",
      width: "42px",
      height: "42px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
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
    logout: {
      background: "#FFEB3B",
      color: "#1B5E20",
      border: "none",
      padding: "10px 16px",
      borderRadius: "12px",
      cursor: "pointer",
      fontWeight: "800",
      fontSize: "13px",
      boxShadow: "0 3px 0 #FBC02D",
    },
    toast: {
      position: "fixed",
      top: "20px",
      right: "20px",
      background: "#2E7D32",
      color: "#fff",
      padding: "15px 20px",
      borderRadius: "16px",
      boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      gap: "12px",
      border: "2px solid #A5D6A7",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "16px",
    },
    card: {
      background: "#fff",
      borderRadius: "18px",
      padding: "22px 18px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
      border: "2px solid #C8E6C9",
      textAlign: "center",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    },
    badgeNotifCard: {
      position: "absolute",
      top: "12px",
      right: "12px",
      background: "#D32F2F",
      color: "#fff",
      borderRadius: "50%",
      width: "28px",
      height: "28px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: "13px",
      fontWeight: "800",
    },
    iconBadge: {
      width: "60px",
      height: "60px",
      borderRadius: "50%",
      background: "#FFEB3B",
      color: "#1B5E20",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: "22px",
      fontWeight: "800",
      margin: "0 auto 15px",
      border: "2px solid #2E7D32",
    },
    cardTitle: {
      fontSize: "18px",
      color: "#1B5E20",
      fontWeight: "800",
      marginBottom: "8px",
    },
    desc: { color: "#556B4D", marginBottom: "18px", lineHeight: "1.5", fontSize: "13px" },
    button: {
      background: "#2E7D32",
      color: "#fff",
      border: "none",
      padding: "12px 18px",
      borderRadius: "12px",
      cursor: "pointer",
      fontSize: "14px",
      width: "100%",
      fontWeight: "800",
      boxShadow: "0 3px 0 #1B5E20",
      textTransform: "uppercase",
    },

    // --- MODAL POPUP DI TENGAH ---
    centerModalOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(0,0,0,0.6)",
      zIndex: 1100,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "15px",
      boxSizing: "border-box",
    },
    centerModalContent: {
      background: "#fff",
      borderRadius: "20px",
      padding: "25px 20px",
      width: "100%",
      maxWidth: "520px",
      maxHeight: "85vh",
      overflowY: "auto",
      boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
      border: "2px solid #C8E6C9",
    },

    // --- POP-UP MODAL PANEL KANAN ---
    modalOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(0,0,0,0.6)",
      zIndex: 1000,
      display: "flex",
      justifyContent: "flex-end",
    },
    sidePanel: {
      width: "100%",
      maxWidth: "400px",
      height: "100%",
      background: "#fff",
      boxShadow: "-4px 0 25px rgba(0,0,0,0.15)",
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
      marginBottom: "18px",
    },
    panelTitle: {
      fontSize: "20px",
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
    notifItemCard: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 0",
      borderBottom: "1px solid #E8F5E9",
    },
    itemAvatar: {
      width: "42px",
      height: "42px",
      borderRadius: "50%",
      background: "#FFEB3B",
      color: "#1B5E20",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "16px",
      fontWeight: "800",
      marginRight: "10px",
      border: "1px solid #2E7D32",
    },
    itemText: { fontSize: "13px", color: "#2E3D29", margin: 0, lineHeight: "1.4" },
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
    statBox: {
      background: "#F4FBEE",
      padding: "14px",
      borderRadius: "14px",
      textAlign: "center",
      border: "2px solid #C8E6C9",
    },
  };

  return (
    <div style={styles.page}>
      {/* TOAST POPUP NOTIFIKASI LAPORAN BARU */}
      {notifBaru && (
        <div style={styles.toast}>
          <div>
            <strong style={{ fontSize: "14px" }}>Laporan Pengaduan Baru!</strong>
            <br />
            <span style={{ fontSize: "12px" }}>
              Dari: {notifBaru.nama || "Siswa"} (Kelas {notifBaru.kelas || "-"})
            </span>
          </div>
          <button
            onClick={() => setNotifBaru(null)}
            style={{
              background: "transparent",
              border: "none",
              color: "#fff",
              fontWeight: "800",
              cursor: "pointer",
              marginLeft: "10px",
              fontSize: "16px",
            }}
          >
            X
          </button>
        </div>
      )}

      {/* HEADER DASHBOARD */}
      <div style={styles.header}>
        <div>
          <div style={styles.title}>Dashboard {namaGuru}</div>
          <p style={{ margin: "4px 0 0 0", fontSize: "13px", opacity: 0.95 }}>
            Selamat datang di Sistem Pengaduan Bullying
          </p>
        </div>

        <div style={styles.headerActions}>
          <button style={styles.notifBtn} onClick={handleOpenNotif} title="Notifikasi">
            🔔
            {unreadCount > 0 && (
              <span style={styles.badgeCount}>{unreadCount}</span>
            )}
          </button>

          <button style={styles.logout} onClick={() => navigate("/")}>
            Keluar
          </button>
        </div>
      </div>

      {/* GRID MENU ADMIN */}
      <div style={styles.grid}>
        {/* 1. DAFTAR PENGADUAN */}
        <div style={styles.card}>
          {jumlahAduanBaru > 0 && (
            <div style={styles.badgeNotifCard}>{jumlahAduanBaru}</div>
          )}
          <div style={styles.iconBadge}>DP</div>
          <div style={styles.cardTitle}>Daftar Pengaduan</div>
          <div style={styles.desc}>
            Lihat seluruh laporan bullying dari siswa.
          </div>
          <button
            style={styles.button}
            onClick={handleBukaLaporan}
          >
            Buka ({jumlahAduanBaru} Baru)
          </button>
        </div>

        {/* 2. PENGADUAN DIPROSES */}
        <div style={styles.card}>
          <div style={styles.iconBadge}>PR</div>
          <div style={styles.cardTitle}>Pengaduan Diproses</div>
          <div style={styles.desc}>Kelola laporan yang sedang diproses.</div>
          <button
            style={styles.button}
            onClick={() => navigate("/daftar-pengaduan")}
          >
            Buka
          </button>
        </div>

        {/* 3. KELOLA EDUKASI */}
        <div style={styles.card}>
          <div style={styles.iconBadge}>ED</div>
          <div style={styles.cardTitle}>Kelola Edukasi</div>
          <div style={styles.desc}>
            Tambah dan edit artikel / materi edukasi siswa.
          </div>
          <button
            style={styles.button}
            onClick={() => navigate("/kelola-edukasi")}
          >
            Buka
          </button>
        </div>

        {/* 4. DATA SISWA */}
        <div style={styles.card}>
          <div style={styles.iconBadge}>DS</div>
          <div style={styles.cardTitle}>Data Siswa</div>
          <div style={styles.desc}>Kelola data siswa dan QR Code login.</div>
          <button
            style={styles.button}
            onClick={() => navigate("/data-siswa")}
          >
            Buka
          </button>
        </div>

        {/* 5. STATISTIK */}
        <div style={styles.card}>
          <div style={styles.iconBadge}>ST</div>
          <div style={styles.cardTitle}>Statistik</div>
          <div style={styles.desc}>Lihat grafik dan ringkasan pengaduan.</div>
          <button
            style={styles.button}
            onClick={() => setShowStatistikModal(true)}
          >
            Buka
          </button>
        </div>

        {/* 6. PENGATURAN */}
        <div style={styles.card}>
          <div style={styles.iconBadge}>PG</div>
          <div style={styles.cardTitle}>Pengaturan</div>
          <div style={styles.desc}>
            Atur akun guru, WA, Email login, dan pesan otomatis.
          </div>
          <button
            style={styles.button}
            onClick={() => navigate("/pengaturan-admin")}
          >
            Buka
          </button>
        </div>
      </div>

      {/* --- MODAL POP-UP STATISTIK --- */}
      {showStatistikModal && (
        <div
          style={styles.centerModalOverlay}
          onClick={() => setShowStatistikModal(false)}
        >
          <div
            style={styles.centerModalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.panelHeader}>
              <h2 style={{ color: "#1B5E20", margin: 0, fontSize: "20px", fontWeight: "800" }}>
                Statistik Pengaduan
              </h2>
              <button
                style={styles.closeBtn}
                onClick={() => setShowStatistikModal(false)}
              >
                X
              </button>
            </div>

            <p style={{ color: "#556B4D", marginBottom: "18px", fontSize: "13px" }}>
              Ringkasan data laporan bullying real-time di sekolah.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginBottom: "20px",
              }}
            >
              <div style={styles.statBox}>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "800",
                    color: "#1B5E20",
                  }}
                >
                  {totalAduan}
                </div>
                <div style={{ fontSize: "12px", color: "#556B4D", fontWeight: "600" }}>
                  Total Aduan Masuk
                </div>
              </div>
              <div style={styles.statBox}>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "800",
                    color: "#D32F2F",
                  }}
                >
                  {totalDiproses}
                </div>
                <div style={{ fontSize: "12px", color: "#556B4D", fontWeight: "600" }}>
                  Sedang Diproses
                </div>
              </div>
              <div style={styles.statBox}>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "800",
                    color: "#2E7D32",
                  }}
                >
                  {totalSelesai}
                </div>
                <div style={{ fontSize: "12px", color: "#556B4D", fontWeight: "600" }}>
                  Selesai Ditangani
                </div>
              </div>
              <div style={styles.statBox}>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "800",
                    color: "#E65100",
                  }}
                >
                  {persentaseSelesai}%
                </div>
                <div style={{ fontSize: "12px", color: "#556B4D", fontWeight: "600" }}>
                  Tingkat Penyelesaian
                </div>
              </div>
            </div>

            <button
              style={{ ...styles.button, background: "#FFEB3B", color: "#1B5E20", boxShadow: "0 3px 0 #FBC02D" }}
              onClick={() => setShowStatistikModal(false)}
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* --- POP-UP MODAL NOTIFIKASI SISI KANAN --- */}
      {showNotifModal && (
        <div
          style={styles.modalOverlay}
          onClick={() => setShowNotifModal(false)}
        >
          <div style={styles.sidePanel} onClick={(e) => e.stopPropagation()}>
            <div style={styles.panelHeader}>
              <h2 style={styles.panelTitle}>Notifikasi Admin</h2>
              <button
                style={styles.closeBtn}
                onClick={() => setShowNotifModal(false)}
              >
                X
              </button>
            </div>

            {aduanList.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 10px",
                  color: "#556B4D",
                }}
              >
                <h3 style={{ fontSize: "16px", color: "#1B5E20" }}>Belum Ada Laporan</h3>
              </div>
            ) : (
              <div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "800",
                    marginBottom: "12px",
                    color: "#1B5E20",
                  }}
                >
                  Laporan Masuk Terbaru
                </div>
                {aduanList.map((item) => (
                  <div key={item.id} style={styles.notifItemCard}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <div style={styles.itemAvatar}>
                        {item.nama ? item.nama.charAt(0).toUpperCase() : "S"}
                      </div>
                      <div>
                        <p style={styles.itemText}>
                          <strong>
                            {item.nama || "Siswa"} ({item.kelas || "-"})
                          </strong>
                        </p>
                        <span style={{ fontSize: "12px", color: "#556B4D" }}>
                          Kategori: <strong>{item.jenis || "Bullying"}</strong>
                        </span>
                      </div>
                    </div>
                    <button
                      style={styles.actionBtn}
                      onClick={handleBukaLaporan}
                    >
                      Buka
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardAdmin;