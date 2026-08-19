import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ref, get, query, orderByChild, equalTo } from "firebase/database";
import { db } from "../firebase";

const styles = {
  page: {
    minHeight: "100dvh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#F5F9FF",
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
    border: "2px solid #BBDEFB",
  },
  left: {
    flex: "1 1 320px",
    padding: "35px 25px",
    boxSizing: "border-box",
  },
  right: {
    flex: "1 1 320px",
    background: "#1565C0",
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
    color: "#0D47A1",
    fontWeight: "800",
    marginBottom: "8px",
  },
  subtitle: {
    color: "#526579",
    fontSize: "14px",
    lineHeight: "1.5",
    marginBottom: "25px",
    fontWeight: "500",
  },
  qrButton: {
    width: "100%",
    padding: "14px",
    background: "#FFFFFF",
    color: "#0D47A1",
    border: "none",
    borderRadius: "14px",
    fontSize: "16px",
    cursor: "pointer",
    marginBottom: "20px",
    fontWeight: "800",
    boxShadow: "0 4px 0 #90CAF9",
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
    color: "#26384A",
    fontSize: "14px",
  },
  input: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "2px solid #BBDEFB",
    marginBottom: "18px",
    fontSize: "16px",
    boxSizing: "border-box",
    outline: "none",
    background: "#FAFCFF",
  },
  loginButton: (loading) => ({
    width: "100%",
    padding: "15px",
    border: "none",
    borderRadius: "14px",
    background: loading ? "#90CAF9" : "#1565C0",
    color: "#fff",
    fontSize: "16px",
    cursor: loading ? "not-allowed" : "pointer",
    fontWeight: "800",
    boxShadow: loading ? "none" : "0 4px 0 #0D47A1",
    textTransform: "uppercase",
  }),
  back: {
    marginTop: "20px",
    textAlign: "center",
    color: "#1565C0",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "14px",
  },
  stop: {
    fontSize: "32px",
    fontWeight: "800",
    marginBottom: "15px",
    color: "#FFFFFF",
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
    border: "2px solid #BBDEFB",
    boxSizing: "border-box",
  },
  modalTitle: {
    marginBottom: "8px",
    fontSize: "20px",
    fontWeight: "800",
  },
  modalText: {
    color: "#526579",
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
      type === "success" ? "#E3F2FD" : type === "error" ? "#FFEBEE" : "#F5F9FF",
    border: `2px solid ${
      type === "success" ? "#1565C0" : type === "error" ? "#D32F2F" : "#90CAF9"
    }`,
    color:
      type === "success" ? "#1565C0" : type === "error" ? "#D32F2F" : "#F57F17",
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
    color: type === "warning" ? "#0D47A1" : "#fff",
    background:
      type === "success" ? "#1565C0" : type === "error" ? "#D32F2F" : "#FFFFFF",
    boxShadow:
      type === "success" ? "0 3px 0 #0D47A1" : type === "error" ? "0 3px 0 #9A0007" : "0 3px 0 #90CAF9",
  }),
};

function LoginSiswa() {
  const navigate = useNavigate();

  const namaRef = useRef(null);
  const nisnRef = useRef(null);
  const loginLockRef = useRef(false);

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
      onCloseCallback: null,
    }));
    if (callback) callback();
  }, [alertConfig.onCloseCallback]);

  const normalizeNama = (value) => {
    return String(value || "")
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase();
  };

  const normalizeNisn = (value) => {
    return String(value || "").trim();
  };

  const findStudentByNisn = async (nisnInput) => {
    const siswaRef = ref(db, "siswa");

    // 1. Cari via query index NIS
    try {
      const siswaQuery = query(siswaRef, orderByChild("nisn"), equalTo(nisnInput));
      const querySnapshot = await get(siswaQuery);
      if (querySnapshot.exists()) {
        const data = querySnapshot.val();
        const entries = Object.entries(data);
        if (entries.length > 0) return entries[0];
      }
    } catch (error) {
      console.warn("Query NISN gagal:", error);
    }

    // 2. Fallback pencarian langsung
    try {
      const snapshot = await get(siswaRef);
      if (!snapshot.exists()) return null;

      const data = snapshot.val();
      const found = Object.entries(data).find(([key, item]) => {
        const itemNisn = normalizeNisn(item?.nisn);
        return itemNisn === nisnInput || String(key).trim() === nisnInput;
      });
      return found || null;
    } catch (error) {
      console.error("Fallback pencarian gagal:", error);
      throw error;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading || loginLockRef.current) return;
    loginLockRef.current = true;

    const namaVal = namaRef.current?.value || "";
    const nisnVal = nisnRef.current?.value || "";

    const namaInput = normalizeNama(namaVal);
    const nisnInput = normalizeNisn(nisnVal);

    if (!namaInput) {
      loginLockRef.current = false;
      showAlert("warning", "Nama Belum Diisi", "Silakan masukkan nama lengkapmu terlebih dahulu.");
      return;
    }

    if (!nisnInput) {
      loginLockRef.current = false;
      showAlert("warning", "NISN Belum Diisi", "Silakan masukkan Nomor Induk Siswa (NISN) milikmu.");
      return;
    }

    setLoading(true);

    try {
      const siswaDitemukan = await findStudentByNisn(nisnInput);

      if (!siswaDitemukan) {
        showAlert(
          "error",
          "Data Tidak Ditemukan",
          "NISN tersebut tidak terdaftar di sistem. Periksa kembali NISN yang dimasukkan."
        );
        return;
      }

      const [studentId, studentData] = siswaDitemukan;

      const namaDatabase = normalizeNama(studentData?.nama);
      const nisnFinal = normalizeNisn(studentData?.nisn) || String(studentId).trim();
      const kelasFinal = String(studentData?.kelas || "").trim();

      // Verifikasi kecocokan nama (fleksibel: cocok persis atau saling mengandung kata)
      const namaCocok =
        namaDatabase === namaInput ||
        namaDatabase.includes(namaInput) ||
        namaInput.includes(namaDatabase);

      if (!namaCocok) {
        showAlert(
          "error",
          "Nama Tidak Sesuai",
          `Nama yang dimasukkan tidak sesuai dengan data NISN ${nisnFinal}. Pastikan penulisan nama sudah benar.`
        );
        return;
      }

      // Simpan sesi ke localStorage
      localStorage.removeItem("namaSiswa");
      localStorage.removeItem("nisnSiswa");
      localStorage.removeItem("kelasSiswa");

      const namaTersimpan = studentData?.nama ? studentData.nama.trim() : namaVal.trim();
      localStorage.setItem("namaSiswa", namaTersimpan);
      localStorage.setItem("nisnSiswa", nisnFinal);
      localStorage.setItem("kelasSiswa", kelasFinal);

      showAlert(
        "success",
        "Login Berhasil!",
        `Selamat datang, ${namaTersimpan}!`,
        () => {
          navigate("/dashboard-siswa", { replace: true });
        }
      );
    } catch (error) {
      console.error("Gagal login:", error);
      showAlert("error", "Terjadi Kesalahan", error?.message || "Terjadi kendala jaringan saat memeriksa data.");
    } finally {
      setLoading(false);
      loginLockRef.current = false;
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.left}>
          <div style={styles.title}>Login Siswa</div>
          <div style={styles.subtitle}>Selamat datang di Sistem Pengaduan Bullying SD.</div>

          <button
            type="button"
            style={styles.qrButton}
            onClick={() => navigate("/scan-qr")}
            disabled={loading}
          >
            SCAN QR CODE LOGIN
          </button>

          <div style={styles.divider}>— ATAU MASUK DENGAN NISN —</div>

          <form onSubmit={handleLogin} autoComplete="off">
            <label style={styles.label} htmlFor="nama-siswa">
              Nama Lengkap
            </label>
            <input
              id="nama-siswa"
              ref={namaRef}
              type="text"
              placeholder="Ketik nama lengkapmu"
              style={styles.input}
              disabled={loading}
              autoComplete="off"
            />

            <label style={styles.label} htmlFor="nisn-siswa">
              Nomor Induk Siswa (NISN)
            </label>
            <input
              id="nisn-siswa"
              ref={nisnRef}
              type="text"
              placeholder="Ketik nomor NISN"
              style={styles.input}
              disabled={loading}
              inputMode="numeric"
              autoComplete="off"
            />

            <button type="submit" style={styles.loginButton(loading)} disabled={loading}>
              {loading ? "MEMERIKSA..." : "MASUK SEKARANG"}
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
            disabled={loading}
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
        <div style={styles.modalOverlay} role="presentation">
          <div style={styles.modalCard} role="dialog" aria-modal="true">
            <div style={styles.alertIconWrapper(alertConfig.type)}>
              {alertConfig.type === "success" ? "✓" : alertConfig.type === "error" ? "✕" : "ℹ"}
            </div>

            <h3
              style={{
                ...styles.modalTitle,
                color:
                  alertConfig.type === "success"
                    ? "#0D47A1"
                    : alertConfig.type === "error"
                    ? "#C62828"
                    : "#E65100",
              }}
            >
              {alertConfig.title}
            </h3>

            <p style={styles.modalText}>{alertConfig.message}</p>

            <button
              type="button"
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