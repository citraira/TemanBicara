import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ref, get } from "firebase/database";
import { db } from "../firebase";

const styles = {
  page: {
    minHeight: "100dvh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#F4FBEE",
    padding: "15px",
    fontFamily: "'Segoe UI', Roboto, sans-serif",
    boxSizing: "border-box",
  },
  card: {
    width: "100%",
    maxWidth: "900px",
    background: "#fff",
    borderRadius: "24px",
    display: "flex",
    flexWrap: "wrap",
    overflow: "hidden",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    border: "2px solid #C8E6C9",
  },
  left: {
    flex: "1 1 320px",
    padding: "35px 25px",
    boxSizing: "border-box",
  },
  right: {
    flex: "1 1 320px",
    background: "#2E7D32",
    color: "#fff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    padding: "35px 25px",
    boxSizing: "border-box",
  },
  title: {
    fontSize: "28px",
    color: "#1B5E20",
    fontWeight: "800",
    marginBottom: "8px",
  },
  subtitle: {
    color: "#556B4D",
    fontSize: "14px",
    lineHeight: "1.5",
    marginBottom: "25px",
    fontWeight: "500",
  },
  qrButton: {
    width: "100%",
    padding: "14px",
    background: "#FFEB3B",
    color: "#1B5E20",
    border: "none",
    borderRadius: "14px",
    fontSize: "16px",
    cursor: "pointer",
    marginBottom: "20px",
    fontWeight: "800",
    boxShadow: "0 4px 0 #FBC02D",
    textTransform: "uppercase",
  },
  divider: {
    textAlign: "center",
    color: "#888",
    marginBottom: "20px",
    fontWeight: "bold",
    fontSize: "13px",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontWeight: "700",
    color: "#2E3D29",
    fontSize: "14px",
  },
  input: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "2px solid #C8E6C9",
    marginBottom: "18px",
    fontSize: "16px",
    boxSizing: "border-box",
    outline: "none",
    background: "#FAFAFA",
  },
  loginButton: (loading) => ({
    width: "100%",
    padding: "15px",
    border: "none",
    borderRadius: "14px",
    background: loading ? "#A5D6A7" : "#2E7D32",
    color: "#fff",
    fontSize: "16px",
    cursor: loading ? "not-allowed" : "pointer",
    fontWeight: "800",
    boxShadow: loading ? "none" : "0 4px 0 #1B5E20",
    textTransform: "uppercase",
  }),
  back: {
    marginTop: "20px",
    textAlign: "center",
    color: "#2E7D32",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "14px",
  },
  stop: {
    fontSize: "32px",
    fontWeight: "800",
    marginBottom: "15px",
    color: "#FFEB3B",
  },
  desc: {
    fontSize: "15px",
    lineHeight: "1.6",
    fontWeight: "500",
    opacity: 0.95,
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
    maxWidth: "380px",
    width: "100%",
    textAlign: "center",
    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
    border: "2px solid #C8E6C9",
    boxSizing: "border-box",
  },
  modalTitle: {
    marginBottom: "8px",
    fontSize: "20px",
    fontWeight: "800",
  },
  modalText: {
    color: "#556B4D",
    fontSize: "13px",
    marginBottom: "20px",
    lineHeight: "1.5",
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

function LoginSiswa() {
  const navigate = useNavigate();

  const namaRef = useRef(null);
  const nisRef = useRef(null);
  const lastFocusedInputRef = useRef(null);

  const [loading, setLoading] = useState(false);

  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
    onCloseCallback: null,
  });

  const showAlert = useCallback(
    (type, title, message, onCloseCallback = null) => {
      setAlertConfig({
        isOpen: true,
        type,
        title,
        message,
        onCloseCallback,
      });
    },
    []
  );

  const handleCloseAlert = useCallback(() => {
    const callback = alertConfig.onCloseCallback;

    setAlertConfig((prev) => ({
      ...prev,
      isOpen: false,
    }));

    if (callback) {
      callback();
    }
  }, [alertConfig.onCloseCallback]);

  const restoreLastFocus = useCallback(() => {
    const inputRef = lastFocusedInputRef.current;

    if (!inputRef?.current) return;

    requestAnimationFrame(() => {
      inputRef.current?.focus({ preventScroll: true });
    });
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading) return;

    const namaVal = namaRef.current?.value || "";
    const nisVal = nisRef.current?.value || "";

    if (namaVal.trim() === "") {
      showAlert(
        "warning",
        "Nama Belum Diisi",
        "Silakan masukkan nama lengkapmu terlebih dahulu."
      );

      requestAnimationFrame(() => {
        namaRef.current?.focus({ preventScroll: true });
      });

      return;
    }

    if (nisVal.trim() === "") {
      showAlert(
        "warning",
        "NIS Belum Diisi",
        "Silakan masukkan Nomor Induk Siswa (NIS) milikmu."
      );

      requestAnimationFrame(() => {
        nisRef.current?.focus({ preventScroll: true });
      });

      return;
    }

    setLoading(true);

    try {
      const siswaRef = ref(db, "siswa");
      const snapshot = await get(siswaRef);

      if (snapshot.exists()) {
        const data = snapshot.val();

        const siswaDitemukan = Object.entries(data).find(([key, item]) => {
          const matchNama = item.nama?.trim().toLowerCase() === namaVal.trim().toLowerCase();
          const matchNis = (item.nis?.trim() === nisVal.trim()) || (key === nisVal.trim());
          return matchNama && matchNis;
        });

        if (siswaDitemukan) {
          const [, item] = siswaDitemukan;

          localStorage.setItem("namaSiswa", item.nama);
          localStorage.setItem("nisSiswa", item.nis || nisVal);
          localStorage.setItem("kelasSiswa", item.kelas || "");

          showAlert(
            "success",
            "Login Berhasil!",
            `Selamat datang, ${item.nama}! Kamu berhasil masuk ke sistem pengaduan.`,
            () => {
              navigate("/dashboard-siswa");
            }
          );
        } else {
          showAlert(
            "error",
            "Data Tidak Ditemukan",
            "Nama atau NIS tidak terdaftar di sistem. Silakan periksa kembali atau hubungi Bapak/Ibu Guru."
          );
        }
      } else {
        showAlert(
          "error",
          "Data Kosong",
          "Belum ada data siswa yang terdaftar di sistem sekolah."
        );
      }
    } catch (error) {
      console.error(error);
      showAlert(
        "error",
        "Terjadi Kesalahan",
        "Terjadi kesalahan saat memeriksa data login. Pastikan koneksi internet aktif."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.left}>
          <div style={styles.title}>Login Siswa</div>
          <div style={styles.subtitle}>
            Selamat datang di Sistem Pengaduan Bullying SD.
          </div>

          <button
            type="button"
            aria-label="Scan QR Code untuk login"
            style={styles.qrButton}
            onClick={() => navigate("/scan-qr")}
          >
            SCAN QR CODE LOGIN
          </button>

          <div style={styles.divider}>— ATAU MASUK DENGAN NIS —</div>

          <form onSubmit={handleLogin}>
            <label style={styles.label}>Nama Lengkap</label>
          <input
            ref={namaRef}
            type="text"
            placeholder="Ketik nama lengkapmu"
            style={styles.input}
            disabled={loading}
            autoComplete="name"
            onFocus={() => {
              lastFocusedInputRef.current = namaRef;
            }}
          />

            <label style={styles.label}>Nomor Induk Siswa (NIS)</label>
            <input
              ref={nisRef}
              type="text"
              placeholder="Ketik nomor NIS"
              style={styles.input}
              disabled={loading}
              inputMode="numeric"
              enterKeyHint="go"
              onFocus={() => {
                lastFocusedInputRef.current = nisRef;
              }}
            />

            <button
              type="submit"
              style={styles.loginButton(loading)}
              disabled={loading}
            >
              {loading ? "Memeriksa..." : "MASUK SEKARANG"}
            </button>
          </form>

          <button
            type="button"
            style={{
              ...styles.back,
              background: "transparent",
              border: "none",
              padding: 0,
              width: "100%",
            }}
            onClick={() => navigate("/")}
          >
            Kembali ke Beranda
          </button>
        </div>

        <div style={styles.right}>
          <div>
            <div style={styles.stop}>Stop Bullying!</div>
            <div style={styles.desc}>
              Jadilah teman yang baik, saling menghargai, dan berani melapor apabila melihat atau mengalami tindakan bullying di sekolah.
            </div>
          </div>
        </div>
      </div>

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
                ...styles.modalTitle,
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

            <p style={styles.modalText}>{alertConfig.message}</p>

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

export default LoginSiswa;