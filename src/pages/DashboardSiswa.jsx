import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ref, onValue, set, query, orderByChild, equalTo } from "firebase/database";
import { getToken } from "firebase/messaging";
import { db, messaging } from "../firebase";

function DashboardSiswa() {
  const navigate = useNavigate();

  // Ambil identitas siswa dari localStorage
  const savedNama = (localStorage.getItem("namaSiswa") || "Siswa").trim();
  const savedNis = (localStorage.getItem("nisSiswa") || "").trim();

  const [namaSiswa, setNamaSiswa] = useState(savedNama);
  const [notifList, setNotifList] = useState([]);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [toastStatus, setToastStatus] = useState(null);

  const VAPID_KEY =
    "BNvX0y1mYfy8p2i78-htBoIL7jvm4vReNiFYh5BePlOIm3XdtHfttEru76AnrrvAtDhVSncZ-kVbleS3gczxEDw";

  // Pastikan nama tersinkronisasi saat halaman dibuka
  useEffect(() => {
    const activeNama = localStorage.getItem("namaSiswa");
    if (activeNama) {
      setNamaSiswa(activeNama.trim());
    }
  }, []);

  // Registrasi Push Notification FCM
  useEffect(() => {
    if (!savedNis) return;

    const setupFCM = async () => {
      try {
        const msg = await messaging();
        if (!msg) return;

        let permission = Notification.permission;
        if (permission === "default") {
          permission = await Notification.requestPermission();
        }

        if (permission === "granted") {
          const currentToken = await getToken(msg, { vapidKey: VAPID_KEY });
          if (currentToken) {
            const cleanKey = savedNis.replace(/[.#$[\]]/g, "_");
            await set(ref(db, `fcmTokens/siswa/${cleanKey}`), {
              nama: savedNama,
              nis: savedNis,
              token: currentToken,
              updatedAt: new Date().toISOString(),
            });
          }
        }
      } catch (err) {
        console.warn("FCM Notifikasi belum aktif:", err);
      }
    };

    setupFCM();
  }, [savedNis, savedNama]);

  // Listener Realtime Pengaduan Milik Siswa Ini (Berdasarkan NIS & Nama)
  useEffect(() => {
    if (!savedNis && !savedNama) {
      setNotifList([]);
      setUnreadCount(0);
      return undefined;
    }

    const pengaduanRef = ref(db, "pengaduan");
    let initialLoad = true;

    const unsubscribe = onValue(
      pengaduanRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setNotifList([]);
          setUnreadCount(0);
          initialLoad = false;
          return;
        }

        const data = snapshot.val();
        
        // Filter laporan milik siswa (Cek NIS terlebih dahulu, lalu nama)
        const aduanSaya = Object.keys(data)
          .map((key) => ({
            id: key,
            ...data[key],
          }))
          .filter((item) => {
            const matchNis = savedNis && String(item.nis || "").trim() === savedNis;
            const matchNama =
              savedNama &&
              String(item.nama || "").trim().toLowerCase() === savedNama.toLowerCase();
            return matchNis || matchNama;
          });

        aduanSaya.sort(
          (a, b) =>
            new Date(b.updatedAt || b.createdAt || 0) -
            new Date(a.updatedAt || a.createdAt || 0)
        );

        // Hitung unread notifikasi
        const storageKey = `lastReadNotif_${savedNis || savedNama}`;
        const lastReadTime = localStorage.getItem(storageKey);
        const lastReadDate = lastReadTime ? new Date(lastReadTime) : null;

        if (lastReadDate) {
          const unread = aduanSaya.filter((item) => {
            const waktu = new Date(item.updatedAt || item.createdAt || 0);
            return waktu > lastReadDate;
          }).length;
          setUnreadCount(unread);
        } else {
          setUnreadCount(aduanSaya.length);
        }

        setNotifList(aduanSaya.slice(0, 50));

        // Pemicu Notifikasi Realtime saat Status Laporan Berubah
        if (!initialLoad && aduanSaya.length > 0) {
          const aduanTerbaru = aduanSaya[0];
          const lastStatusKey = `lastSeenStatus_${aduanTerbaru.id}`;
          const lastSavedStatus = localStorage.getItem(lastStatusKey);

          if (lastSavedStatus && lastSavedStatus !== aduanTerbaru.status) {
            setToastStatus({
              jenis: aduanTerbaru.jenis || "Pengaduan",
              status: aduanTerbaru.status,
            });

            if (Notification.permission === "granted" && "serviceWorker" in navigator) {
              navigator.serviceWorker.ready.then((reg) => {
                reg.showNotification("Pembaruan Laporan - Teman Bicara", {
                  body: `Laporan ${aduanTerbaru.jenis || ""} kamu diubah statusnya menjadi: "${aduanTerbaru.status}"`,
                  icon: "/pwa-192x192.png",
                  badge: "/pwa-192x192.png",
                  vibrate: [200, 100, 200],
                });
              }).catch(() => {});
            }

            try {
              const audio = new Audio(
                "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"
              );
              audio.play().catch(() => {});
            } catch (err) {}
          }

          localStorage.setItem(lastStatusKey, aduanTerbaru.status || "");
        } else if (initialLoad && aduanSaya.length > 0) {
          aduanSaya.forEach((item) => {
            localStorage.setItem(`lastSeenStatus_${item.id}`, item.status || "");
          });
        }

        initialLoad = false;
      },
      (error) => {
        console.error("Gagal mendengarkan pengaduan siswa:", error);
      }
    );

    return () => unsubscribe();
  }, [savedNis, savedNama]);

  const markNotifAsRead = () => {
    const key = `lastReadNotif_${savedNis || savedNama || "guest"}`;
    localStorage.setItem(key, new Date().toISOString());
    setUnreadCount(0);
  };

  const handleOpenNotif = () => {
    setShowNotifModal(true);
    markNotifAsRead();
  };

  const handleBukaDetailRiwayat = () => {
    setShowNotifModal(false);
    markNotifAsRead();
    navigate("/riwayat");
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem("namaSiswa");
    localStorage.removeItem("nisSiswa");
    localStorage.removeItem("kelasSiswa");
    navigate("/");
  };

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#F4FBEE",
      fontFamily: "'Segoe UI', Roboto, sans-serif",
      paddingBottom: "85px",
      boxSizing: "border-box",
    },
    header: {
      background: "#2E7D32",
      color: "#fff",
      padding: "20px 20px 24px 20px",
      borderBottomLeftRadius: "26px",
      borderBottomRightRadius: "26px",
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
      width: "52px",
      height: "52px",
      borderRadius: "50%",
      background: "#FFEB3B",
      color: "#1B5E20",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: "22px",
      fontWeight: "800",
      boxShadow: "0 3px 6px rgba(0,0,0,0.12)",
    },
    hello: { fontSize: "13px", opacity: 0.9, fontWeight: "600" },
    name: { fontSize: "19px", fontWeight: "800" },
    headerActions: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    notifBtn: {
      position: "relative",
      fontSize: "22px",
      cursor: "pointer",
      background: "rgba(255, 255, 255, 0.25)",
      border: "none",
      color: "#fff",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "44px",
      height: "44px",
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
      padding: "8px 16px",
      borderRadius: "18px",
      cursor: "pointer",
      fontWeight: "800",
      fontSize: "13px",
      boxShadow: "0 2px 0 #FBC02D",
    },
    toast: {
      position: "fixed",
      top: "16px",
      left: "16px",
      right: "16px",
      maxWidth: "400px",
      margin: "0 auto",
      background: "#2E7D32",
      color: "#fff",
      padding: "14px 16px",
      borderRadius: "18px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
      zIndex: 2000,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      border: "2px solid #FFEB3B",
    },
    bannerCard: {
      background: "linear-gradient(135deg, #FFFDE7 0%, #FFF9C4 100%)",
      margin: "18px 15px 15px",
      borderRadius: "22px",
      padding: "18px 20px",
      border: "2px solid #FFF59D",
      boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
      display: "flex",
      alignItems: "center",
      gap: "14px",
    },
    bannerIcon: { fontSize: "36px", lineHeight: "1" },
    bannerTitle: {
      fontSize: "18px",
      fontWeight: "800",
      color: "#1B5E20",
      marginBottom: "2px",
    },
    bannerText: {
      fontSize: "13px",
      color: "#556B4D",
      margin: 0,
      fontWeight: "600",
    },
    menuGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "14px",
      padding: "0 15px",
      marginTop: "10px",
    },
    actionCard: (bgColor, borderColor) => ({
      background: bgColor,
      borderRadius: "22px",
      padding: "24px 12px",
      textAlign: "center",
      cursor: "pointer",
      border: `2.5px solid ${borderColor}`,
      boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
    }),
    cardIconCircle: (circleBg) => ({
      width: "65px",
      height: "65px",
      borderRadius: "50%",
      background: circleBg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "30px",
      boxShadow: "0 4px 8px rgba(0,0,0,0.06)",
    }),
    cardLabel: {
      fontSize: "16px",
      fontWeight: "800",
      color: "#1B5E20",
      margin: 0,
    },
    cardTag: {
      fontSize: "11px",
      fontWeight: "700",
      color: "#4E6647",
      background: "rgba(255,255,255,0.7)",
      padding: "3px 8px",
      borderRadius: "10px",
    },
    modalOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(0,0,0,0.45)",
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
      marginBottom: "16px",
      borderBottom: "1.5px solid #E8F5E9",
      paddingBottom: "12px",
    },
    panelTitle: {
      fontSize: "19px",
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
      padding: "12px",
      background: "#F9FCF7",
      borderRadius: "14px",
      border: "1.5px solid #E8F5E9",
      marginBottom: "10px",
    },
    actionBtn: {
      padding: "8px 14px",
      background: "#2E7D32",
      color: "#fff",
      border: "none",
      borderRadius: "10px",
      fontWeight: "800",
      fontSize: "12px",
      cursor: "pointer",
    },
    centerModalOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(0,0,0,0.5)",
      backdropFilter: "blur(2px)",
      zIndex: 2000,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "20px",
      boxSizing: "border-box",
    },
    modalCard: {
      background: "#fff",
      borderRadius: "22px",
      padding: "26px 20px",
      maxWidth: "360px",
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
      fontSize: "30px",
      background: "#FFFDE7",
      border: "2px solid #FBC02D",
    },
    modalBtnGroup: { display: "flex", gap: "10px", marginTop: "18px" },
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
      boxShadow: "0 -2px 12px rgba(0,0,0,0.06)",
      borderTop: "1.5px solid #E8F5E9",
    },
    navItem: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      color: "#2E7D32",
      fontWeight: "800",
      fontSize: "11px",
      gap: "2px",
    },
    navIcon: { fontSize: "22px", lineHeight: "1" },
  };

  return (
    <div style={styles.page}>
      {/* TOAST UPDATE STATUS */}
      {toastStatus && (
        <div style={styles.toast}>
          <div>
            <div style={{ fontSize: "14px", fontWeight: "800", color: "#FFEB3B" }}>
              Pemberitahuan Guru
            </div>
            <div style={{ fontSize: "13px", marginTop: "2px" }}>
              Laporanmu: <strong>"{toastStatus.status}"</strong>
            </div>
          </div>
          <button
            onClick={() => setToastStatus(null)}
            style={{
              background: "transparent",
              border: "none",
              color: "#fff",
              fontWeight: "800",
              cursor: "pointer",
              fontSize: "18px",
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* HEADER ATAS */}
      <div style={styles.header}>
        <div style={styles.topRow}>
          <div style={styles.profile}>
            <div style={styles.avatar}>
              {namaSiswa ? namaSiswa.charAt(0).toUpperCase() : "S"}
            </div>
            <div>
              <div style={styles.hello}>Hai Teman!</div>
              <div style={styles.name}>{namaSiswa}</div>
            </div>
          </div>

          <div style={styles.headerActions}>
            <button
              style={styles.notifBtn}
              onClick={handleOpenNotif}
              title="Notifikasi"
            >
              🔔
              {unreadCount > 0 && (
                <span style={styles.badgeCount}>{unreadCount}</span>
              )}
            </button>

            <button style={styles.logoutBtn} onClick={() => setShowLogoutModal(true)}>
              Keluar
            </button>
          </div>
        </div>
      </div>

      {/* BANNER VISUAL */}
      <div style={styles.bannerCard}>
        <div style={styles.bannerIcon}>🛡️</div>
        <div>
          <div style={styles.bannerTitle}>Jangan Takut Melapor!</div>
          <p style={styles.bannerText}>
            Guru BK siap membantu menjaga keamananmu di sekolah.
          </p>
        </div>
      </div>

      {/* MENU UTAMA VISUAL */}
      <div style={styles.menuGrid}>
        <div
          style={styles.actionCard("#E8F5E9", "#A5D6A7")}
          onClick={() => navigate("/pengaduan")}
        >
          <div style={styles.cardIconCircle("#C8E6C9")}>✏️</div>
          <h3 style={styles.cardLabel}>Buat Laporan</h3>
          <span style={styles.cardTag}>Ceritakan Masalahmu</span>
        </div>

        <div
          style={styles.actionCard("#FFFDE7", "#FFE082")}
          onClick={() => navigate("/riwayat")}
        >
          <div style={styles.cardIconCircle("#FFF59D")}>📋</div>
          <h3 style={styles.cardLabel}>Riwayat Saya</h3>
          <span style={styles.cardTag}>Cek Status Laporan</span>
        </div>

        <div
          style={styles.actionCard("#E1F5FE", "#90CAF9")}
          onClick={() => navigate("/edukasi")}
        >
          <div style={styles.cardIconCircle("#BBDEFB")}>📖</div>
          <h3 style={styles.cardLabel}>Materi Edukasi</h3>
          <span style={styles.cardTag}>Bacaan & Panduan</span>
        </div>

        <div
          style={styles.actionCard("#F3E5F5", "#CE93D8")}
          onClick={() => navigate("/hubungi-guru")}
        >
          <div style={styles.cardIconCircle("#E1BEE7")}>👨‍🏫</div>
          <h3 style={styles.cardLabel}>Hubungi Guru</h3>
          <span style={styles.cardTag}>Chat WhatsApp BK</span>
        </div>
      </div>

      {/* SIDE PANEL NOTIFIKASI */}
      {showNotifModal && (
        <div style={styles.modalOverlay} onClick={() => setShowNotifModal(false)}>
          <div style={styles.sidePanel} onClick={(e) => e.stopPropagation()}>
            <div style={styles.panelHeader}>
              <h2 style={styles.panelTitle}>Notifikasi Laporan</h2>
              <button style={styles.closeBtn} onClick={() => setShowNotifModal(false)}>
                ✕
              </button>
            </div>

            {notifList.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 10px", color: "#667C5E" }}>
                <div style={{ fontSize: "40px", marginBottom: "10px" }}>📭</div>
                <div style={{ fontWeight: "700", fontSize: "15px", color: "#1B5E20" }}>
                  Belum Ada Laporan
                </div>
              </div>
            ) : (
              <div>
                {notifList.map((item) => (
                  <div key={item.id} style={styles.notifItemCard}>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: "800", color: "#1B5E20" }}>
                        {item.jenis || "Pengaduan"}
                      </div>
                      <div style={{ fontSize: "12px", color: "#556B4D", marginTop: "3px" }}>
                        Status: <strong>{item.status || "Diproses"}</strong>
                      </div>
                    </div>
                    <button
                      style={styles.actionBtn}
                      onClick={handleBukaDetailRiwayat}
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

      {/* POP-UP MODAL KONFIRMASI KELUAR */}
      {showLogoutModal && (
        <div style={styles.centerModalOverlay} onClick={() => setShowLogoutModal(false)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.logoutIconBox}>🚪</div>
            <h3 style={{ fontSize: "19px", fontWeight: "800", color: "#1B5E20", margin: "0 0 6px 0" }}>
              Ingin Keluar?
            </h3>
            <p style={{ fontSize: "13px", color: "#556B4D", margin: "0 0 8px 0", lineHeight: "1.5" }}>
              Apakah kamu yakin ingin keluar dari akun <strong>{namaSiswa}</strong>?
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

      {/* BOTTOM NAVIGATION */}
      <div style={styles.bottomNav}>
        <div style={styles.navItem} onClick={() => navigate("/dashboard-siswa")}>
          <span style={styles.navIcon}>🏠</span>
          <span>Beranda</span>
        </div>
        <div style={styles.navItem} onClick={() => navigate("/pengaduan")}>
          <span style={styles.navIcon}>✏️</span>
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