import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ref, onValue, set } from "firebase/database";
import { getToken } from "firebase/messaging";
import { db, messaging } from "../firebase";

function DashboardAdmin() {
  const navigate = useNavigate();
  const [jumlahAduanBaru, setJumlahAduanBaru] = useState(0);
  const [notifBaru, setNotifBaru] = useState(null);
  const [aduanList, setAduanList] = useState([]);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const [showStatistikModal, setShowStatistikModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const namaGuru = localStorage.getItem("namaGuru") || "Guru BK";
  const soundEnabled = localStorage.getItem("soundEnabled") !== "false";

  const VAPID_KEY =
    "BNvX0y1mYfy8p2i78-htBoIL7jvm4vReNiFYh5BePlOIm3XdtHfttEru76AnrrvAtDhVSncZ-kVbleS3gczxEDw";

  // Toast laporan baru otomatis hilang tanpa perlu ditekan.
  useEffect(() => {
    if (!notifBaru) return undefined;

    const timer = setTimeout(() => {
      setNotifBaru(null);
    }, 4000);

    return () => clearTimeout(timer);
  }, [notifBaru]);

  // Registrasi FCM Admin dilakukan sekali saat dashboard dibuka.
  // Tidak digabung dengan listener pengaduan agar listener tidak dibuat ulang
  // ketika pengaturan suara/nama berubah.
  useEffect(() => {
    let cancelled = false;

    const setupAdminFCM = async () => {
      try {
        if (cancelled) return;

        const msg = await messaging();
        if (!msg || cancelled) return;

        // Jangan meminta permission berulang kali jika browser sudah
        // memberikan keputusan sebelumnya.
        if (
          typeof Notification === "undefined" ||
          Notification.permission === "denied"
        ) {
          return;
        }

        if (Notification.permission === "default") {
          const permission = await Notification.requestPermission();
          if (permission !== "granted" || cancelled) return;
        }

        const currentToken = await getToken(msg, {
          vapidKey: VAPID_KEY,
        });

        if (currentToken && !cancelled) {
          await set(ref(db, "fcmTokens/admin/utama"), {
            nama: namaGuru,
            token: currentToken,
            updatedAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.warn("FCM Admin belum aktif:", err);
      }
    };

    setupAdminFCM();

    return () => {
      cancelled = true;
    };
  }, [namaGuru]);

  // Listener realtime pengaduan.
  // Tetap realtime karena dashboard membutuhkan notifikasi baru,
  // tetapi pekerjaan React dibuat seminimal mungkin.
  useEffect(() => {
    const pengaduanRef = ref(db, "pengaduan");
    let initialLoad = true;

    const unsubscribe = onValue(
      pengaduanRef,
      (snapshot) => {
        const data = snapshot.val();

        if (!data) {
          setAduanList([]);
          setJumlahAduanBaru(0);
          setUnreadCount(0);
          initialLoad = false;
          return;
        }

        const list = Object.keys(data)
          .map((key) => ({
            id: key,
            ...data[key],
          }))
          .sort(
            (a, b) =>
              new Date(b.createdAt || 0) -
              new Date(a.createdAt || 0)
          );

        // Satu kali update state untuk data pengaduan.
        setAduanList(list);

        // Jumlah laporan yang masih berstatus Diproses.
        // Angka ini ditampilkan sebagai badge pada kartu "Daftar Pengaduan".
        const aduanDiproses = list.reduce((total, item) => {
          return (
            total +
            (!item.status ||
            item.status.includes("Diproses")
              ? 1
              : 0)
          );
        }, 0);

        setJumlahAduanBaru(aduanDiproses);

        // Hitung notifikasi yang benar-benar belum dibaca.
        // Hanya laporan baru yang dibuat setelah lastReadAdminNotif
        // yang dianggap belum dibaca oleh badge dashboard.
        const lastReadTime =
          localStorage.getItem("lastReadAdminNotif");

        const lastRead = lastReadTime
          ? new Date(lastReadTime).getTime()
          : 0;

        const unread = list.reduce((total, item) => {
          const created = new Date(
            item.createdAt || 0
          ).getTime();

          return total + (created > lastRead ? 1 : 0);
        }, 0);

        setUnreadCount(unread);

        // Jangan menampilkan notifikasi untuk data yang sudah ada
        // ketika dashboard pertama kali dibuka.
        if (!initialLoad && list.length > 0) {
          const aduanTerbaru = list[0];
          const lastShownToastId =
            localStorage.getItem("lastShownToastId");

          if (aduanTerbaru.id !== lastShownToastId) {
            setNotifBaru(aduanTerbaru);
            localStorage.setItem(
              "lastShownToastId",
              aduanTerbaru.id
            );

            // Notifikasi sistem hanya jika permission sudah granted.
            if (
              typeof Notification !== "undefined" &&
              Notification.permission === "granted" &&
              "serviceWorker" in navigator
            ) {
              navigator.serviceWorker.ready
                .then((reg) => {
                  reg.showNotification(
                    "Laporan Pengaduan Baru!",
                    {
                      body: `Dari ${
                        aduanTerbaru.nama || "Siswa"
                      } (Kelas ${
                        aduanTerbaru.kelas || "-"
                      }): ${
                        aduanTerbaru.jenis || "Bullying"
                      }`,
                      icon: "/pwa-192x192.png",
                      badge: "/pwa-192x192.png",
                      vibrate: [200, 100, 200],
                    }
                  );
                })
                .catch((err) => {
                  console.warn(
                    "Gagal menampilkan notifikasi sistem:",
                    err
                  );
                });
            }

            // Suara hanya dibuat ketika benar-benar ada laporan baru.
            if (soundEnabled) {
              try {
                const audio = new Audio(
                  "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"
                );

                audio.volume = 0.7;

                const playPromise = audio.play();

                if (playPromise?.catch) {
                  playPromise.catch(() => {
                    console.log(
                      "Audio autoplay diblokir browser."
                    );
                  });
                }
              } catch (err) {
                console.log(
                  "Audio notifikasi tidak dapat diputar:",
                  err
                );
              }
            }
          }
        }

        initialLoad = false;
      },
      (error) => {
        console.error(
          "Gagal mendengarkan notifikasi:",
          error
        );
      }
    );

    return () => unsubscribe();
  }, [soundEnabled]);

  const handleOpenNotif = () => {
    setShowNotifModal(true);
    setUnreadCount(0);
    localStorage.setItem("lastReadAdminNotif", new Date().toISOString());
  };

  const handleBukaLaporan = () => {
    setShowNotifModal(false);
    setUnreadCount(0);
    localStorage.setItem("lastReadAdminNotif", new Date().toISOString());
    navigate("/daftar-pengaduan");
  };

  const handleConfirmLogout = () => {
    navigate("/");
  };

  // Perhitungan statistik dimemoisasi agar tidak dihitung ulang
  // pada render yang hanya berkaitan dengan modal/notifikasi.
  const {
    totalAduan,
    totalDiproses,
    totalSelesai,
    persentaseSelesai,
  } = useMemo(() => {
    let diproses = 0;
    let selesai = 0;

    for (const item of aduanList) {
      if (!item.status || item.status.includes("Diproses")) {
        diproses += 1;
      }

      if (item.status === "Selesai") {
        selesai += 1;
      }
    }

    const total = aduanList.length;

    return {
      totalAduan: total,
      totalDiproses: diproses,
      totalSelesai: selesai,
      persentaseSelesai:
        total > 0
          ? Math.round((selesai / total) * 100)
          : 0,
    };
  }, [aduanList]);

  // Panel notifikasi tidak perlu membuat ratusan elemen sekaligus.
  // Tampilkan 50 laporan terbaru saja; statistik tetap menggunakan seluruh data.
  const recentAduanList = useMemo(
    () => aduanList.slice(0, 50),
    [aduanList]
  );

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
      gap: "10px",
      boxSizing: "border-box",
    },
    title: {
      fontSize: "22px",
      fontWeight: "800",
      lineHeight: "1.2",
      minWidth: 0,
      margin: 0,
    },
    headerActions: {
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: "10px",
      flexShrink: 0,
    },
    notifBtn: {
      position: "relative",
      fontSize: "22px",
      cursor: "pointer",
      background: "rgba(255, 255, 255, 0.25)",
      border: "none",
      color: "#fff",
      borderRadius: "50%",
      width: "44px",
      height: "44px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      padding: 0,
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
      padding: "8px 16px",
      minWidth: "118px",
      height: "44px",
      borderRadius: "18px",
      cursor: "pointer",
      fontWeight: "800",
      fontSize: "13px",
      boxShadow: "0 2px 0 #FBC02D",
      boxSizing: "border-box",
      flexShrink: 0,
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
    centerModalOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(0,0,0,0.55)",
      backdropFilter: "blur(2px)",
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
    logoutModalCard: {
      background: "#fff",
      borderRadius: "22px",
      padding: "26px 20px",
      maxWidth: "370px",
      width: "100%",
      textAlign: "center",
      boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
      border: "2px solid #C8E6C9",
      boxSizing: "border-box",
    },
    logoutIconBox: {
      width: "65px",
      height: "65px",
      borderRadius: "50%",
      margin: "0 auto 12px auto",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: "28px",
      background: "#FFFDE7",
      border: "2px solid #FBC02D",
    },
    modalBtnGroup: { display: "flex", gap: "10px", marginTop: "20px" },
    yesBtn: {
      flex: 1,
      background: "#D32F2F",
      color: "#fff",
      border: "none",
      padding: "12px",
      borderRadius: "12px",
      fontWeight: "800",
      fontSize: "13px",
      cursor: "pointer",
      boxShadow: "0 3px 0 #9A0007",
      textTransform: "uppercase",
    },
    cancelBtn: {
      flex: 1,
      background: "#FFEB3B",
      color: "#1B5E20",
      border: "none",
      padding: "12px",
      borderRadius: "12px",
      fontWeight: "800",
      fontSize: "13px",
      cursor: "pointer",
      boxShadow: "0 3px 0 #FBC02D",
      textTransform: "uppercase",
    },
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
      {/* TOAST ADUAN BARU */}
      {notifBaru && (
        <div style={styles.toast}>
          <div>
            <strong style={{ fontSize: "14px" }}>Laporan Pengaduan Baru!</strong>
            <br />
            <span style={{ fontSize: "12px" }}>
              Dari: {notifBaru.nama || "Siswa"} (Kelas {notifBaru.kelas || "-"})
            </span>
          </div>
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

          <button style={styles.logout} onClick={() => setShowLogoutModal(true)}>
            Keluar
          </button>
        </div>
      </div>

      {/* GRID MENU ADMIN */}
      <div style={styles.grid}>
        <div style={styles.card}>
          {/* Badge hanya menunjukkan jumlah kasus yang masih Diproses */}
          {jumlahAduanBaru > 0 && (
            <div
              style={styles.badgeNotifCard}
              title="Jumlah kasus yang masih diproses"
            >
              {jumlahAduanBaru}
            </div>
          )}

          <div style={styles.iconBadge}>DP</div>

          <div style={styles.cardTitle}>Daftar Pengaduan</div>

          <div style={styles.desc}>
            Lihat seluruh laporan bullying dari siswa.
          </div>

          <button style={styles.button} onClick={handleBukaLaporan}>
            {jumlahAduanBaru > 0
              ? `BUKA (${jumlahAduanBaru} BARU)`
              : "BUKA"}
          </button>
        </div>

        <div style={styles.card}>
          <div style={styles.iconBadge}>ED</div>
          <div style={styles.cardTitle}>Kelola Edukasi</div>
          <div style={styles.desc}>Tambah dan edit artikel edukasi siswa.</div>
          <button style={styles.button} onClick={() => navigate("/kelola-edukasi")}>
            Buka
          </button>
        </div>

        <div style={styles.card}>
          <div style={styles.iconBadge}>DS</div>
          <div style={styles.cardTitle}>Data Siswa</div>
          <div style={styles.desc}>Kelola data siswa dan QR Code login.</div>
          <button style={styles.button} onClick={() => navigate("/data-siswa")}>
            Buka
          </button>
        </div>

        <div style={styles.card}>
          <div style={styles.iconBadge}>ST</div>
          <div style={styles.cardTitle}>Statistik</div>
          <div style={styles.desc}>Lihat grafik dan ringkasan pengaduan.</div>
          <button style={styles.button} onClick={() => setShowStatistikModal(true)}>
            Buka
          </button>
        </div>

        <div style={styles.card}>
          <div style={styles.iconBadge}>PG</div>
          <div style={styles.cardTitle}>Pengaturan</div>
          <div style={styles.desc}>Atur profil guru, WhatsApp, dan sandi admin.</div>
          <button style={styles.button} onClick={() => navigate("/pengaturan-admin")}>
            Buka
          </button>
        </div>
      </div>

      {/* MODAL STATISTIK */}
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
                ✕
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
                <div style={{ fontSize: "24px", fontWeight: "800", color: "#1B5E20" }}>
                  {totalAduan}
                </div>
                <div style={{ fontSize: "12px", color: "#556B4D", fontWeight: "600" }}>
                  Total Aduan Masuk
                </div>
              </div>
              <div style={styles.statBox}>
                <div style={{ fontSize: "24px", fontWeight: "800", color: "#D32F2F" }}>
                  {totalDiproses}
                </div>
                <div style={{ fontSize: "12px", color: "#556B4D", fontWeight: "600" }}>
                  Sedang Diproses
                </div>
              </div>
              <div style={styles.statBox}>
                <div style={{ fontSize: "24px", fontWeight: "800", color: "#2E7D32" }}>
                  {totalSelesai}
                </div>
                <div style={{ fontSize: "12px", color: "#556B4D", fontWeight: "600" }}>
                  Selesai Ditangani
                </div>
              </div>
              <div style={styles.statBox}>
                <div style={{ fontSize: "24px", fontWeight: "800", color: "#E65100" }}>
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

      {/* NOTIFIKASI PANEL KANAN */}
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
                ✕
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
                {recentAduanList.map((item) => (
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

      {/* POP-UP MODAL KONFIRMASI KELUAR ADMIN */}
      {showLogoutModal && (
        <div style={styles.centerModalOverlay} onClick={() => setShowLogoutModal(false)}>
          <div style={styles.logoutModalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.logoutIconBox}>🚪</div>
            <h3 style={{ fontSize: "19px", fontWeight: "800", color: "#1B5E20", margin: "0 0 8px 0" }}>
              Keluar Akun Admin?
            </h3>
            <p style={{ fontSize: "13px", color: "#556B4D", margin: "0 0 10px 0", lineHeight: "1.5" }}>
              Apakah Bapak/Ibu Guru yakin ingin keluar dari panel admin?
            </p>

            <div style={styles.modalBtnGroup}>
              <button style={styles.yesBtn} onClick={handleConfirmLogout}>
                Ya, Keluar
              </button>
              <button style={styles.cancelBtn} onClick={() => setShowLogoutModal(false)}>
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardAdmin;