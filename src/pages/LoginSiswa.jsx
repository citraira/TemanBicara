import {
  useCallback,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  ref,
  get,
  query,
  orderByChild,
  equalTo,
} from "firebase/database";

import { db } from "../firebase";

// ======================================================
// STYLE
// ======================================================

const styles = {
  page: {
    minHeight: "100dvh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#F4FBEE",
    padding: "15px",
    fontFamily:
      "'Segoe UI', Roboto, sans-serif",
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
    boxShadow:
      "0 10px 25px rgba(0,0,0,0.08)",
    border:
      "2px solid #C8E6C9",
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
    boxShadow:
      "0 4px 0 #FBC02D",
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
    border:
      "2px solid #C8E6C9",
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
    background: loading
      ? "#A5D6A7"
      : "#2E7D32",
    color: "#fff",
    fontSize: "16px",
    cursor: loading
      ? "not-allowed"
      : "pointer",
    fontWeight: "800",
    boxShadow: loading
      ? "none"
      : "0 4px 0 #1B5E20",
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
    background:
      "rgba(0,0,0,0.6)",
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
    boxShadow:
      "0 8px 24px rgba(0,0,0,0.15)",
    border:
      "2px solid #C8E6C9",
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

    color:
      type === "warning"
        ? "#1B5E20"
        : "#fff",

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

// ======================================================
// LOGIN SISWA
// ======================================================

function LoginSiswa() {
  const navigate =
    useNavigate();

  // ====================================================
  // REF
  //
  // Tidak menggunakan state untuk input.
  // Ini membantu mencegah render berulang ketika mengetik.
  // ====================================================

  const namaRef =
    useRef(null);

  const nisRef =
    useRef(null);

  // ====================================================
  // LOCK LOGIN
  // ====================================================

  const loginLockRef =
    useRef(false);

  // ====================================================
  // STATE
  // ====================================================

  const [
    loading,
    setLoading,
  ] = useState(false);

  // ====================================================
  // ALERT
  // ====================================================

  const [
    alertConfig,
    setAlertConfig,
  ] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
    onCloseCallback: null,
  });

  // ====================================================
  // SHOW ALERT
  // ====================================================

  const showAlert =
    useCallback(
      (
        type,
        title,
        message,
        onCloseCallback = null
      ) => {
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

  // ====================================================
  // CLOSE ALERT
  // ====================================================

  const handleCloseAlert =
    useCallback(() => {
      const callback =
        alertConfig.onCloseCallback;

      setAlertConfig(
        (prev) => ({
          ...prev,
          isOpen: false,
          onCloseCallback:
            null,
        })
      );

      if (callback) {
        callback();
      }
    }, [
      alertConfig.onCloseCallback,
    ]);

  // ====================================================
  // NORMALISASI NAMA
  // ====================================================

  const normalizeNama =
    (value) => {
      return String(
        value || ""
      )
        .trim()
        .replace(
          /\s+/g,
          " "
        )
        .toLowerCase();
    };

  // ====================================================
  // NORMALISASI NIS
  //
  // Tidak menghapus angka 0 di depan.
  //
  // Contoh:
  // 00123 tetap 00123.
  // ====================================================

  const normalizeNis =
    (value) => {
      return String(
        value || ""
      ).trim();
    };

  // ====================================================
  // BERSIHKAN SESI LAMA
  // ====================================================

  const clearStudentSession =
    () => {
      localStorage.removeItem(
        "namaSiswa"
      );

      localStorage.removeItem(
        "nisSiswa"
      );

      localStorage.removeItem(
        "kelasSiswa"
      );
    };

  // ====================================================
  // SIMPAN SESI SISWA
  // ====================================================

  const saveStudentSession =
    (student) => {
      const nama =
        String(
          student?.nama ||
            ""
        ).trim();

      const nis =
        String(
          student?.nis ||
            ""
        ).trim();

      const kelas =
        String(
          student?.kelas ||
            ""
        ).trim();

      // ----------------------------------------------
      // Hapus sesi lama
      // ----------------------------------------------

      clearStudentSession();

      // ----------------------------------------------
      // Simpan sesi baru
      // ----------------------------------------------

      localStorage.setItem(
        "namaSiswa",
        nama
      );

      localStorage.setItem(
        "nisSiswa",
        nis
      );

      localStorage.setItem(
        "kelasSiswa",
        kelas
      );

      // ----------------------------------------------
      // Kembalikan data untuk validasi
      // ----------------------------------------------

      return {
        nama,
        nis,
        kelas,
      };
    };

  // ====================================================
  // CARI SISWA BERDASARKAN NIS
  // ====================================================

  const findStudentByNis =
    async (nis) => {
      const siswaRef =
        ref(
          db,
          "siswa"
        );

      // ==============================================
      // CARA 1
      //
      // Cari berdasarkan field:
      //
      // siswa/{firebaseKey}/nis
      //
      // ==============================================

      try {
        const siswaQuery =
          query(
            siswaRef,
            orderByChild(
              "nis"
            ),
            equalTo(
              nis
            )
          );

        const querySnapshot =
          await get(
            siswaQuery
          );

        if (
          querySnapshot.exists()
        ) {
          const data =
            querySnapshot.val();

          const entries =
            Object.entries(
              data
            );

          if (
            entries.length >
            0
          ) {
            return entries[0];
          }
        }
      } catch (error) {
        console.warn(
          "Query berdasarkan field NIS gagal:",
          error
        );
      }

      // ==============================================
      // CARA 2
      //
      // Fallback untuk struktur lama:
      //
      // siswa/{nis}/...
      //
      // ==============================================

      try {
        const snapshot =
          await get(
            siswaRef
          );

        if (
          !snapshot.exists()
        ) {
          return null;
        }

        const data =
          snapshot.val();

        const found =
          Object.entries(
            data
          ).find(
            ([
              key,
              item,
            ]) => {
              const itemNis =
                normalizeNis(
                  item?.nis
                );

              return (
                itemNis ===
                  nis ||
                String(
                  key
                ).trim() ===
                  nis
              );
            }
          );

        return found ||
          null;
      } catch (error) {
        console.error(
          "Fallback pencarian siswa gagal:",
          error
        );

        throw error;
      }
    };

  // ====================================================
  // LOGIN
  // ====================================================

  const handleLogin =
    async (e) => {
      e.preventDefault();

      // ==============================================
      // CEGAH DOUBLE SUBMIT
      // ==============================================

      if (
        loading ||
        loginLockRef.current
      ) {
        return;
      }

      loginLockRef.current =
        true;

      // ==============================================
      // AMBIL INPUT
      // ==============================================

      const namaVal =
        namaRef.current
          ?.value || "";

      const nisVal =
        nisRef.current
          ?.value || "";

      const namaInput =
        normalizeNama(
          namaVal
        );

      const nisInput =
        normalizeNis(
          nisVal
        );

      // ==============================================
      // VALIDASI NAMA
      // ==============================================

      if (!namaInput) {
        loginLockRef.current =
          false;

        showAlert(
          "warning",
          "Nama Belum Diisi",
          "Silakan masukkan nama lengkapmu terlebih dahulu."
        );

        setTimeout(() => {
          namaRef.current?.focus(
            {
              preventScroll:
                true,
            }
          );
        }, 0);

        return;
      }

      // ==============================================
      // VALIDASI NIS
      // ==============================================

      if (!nisInput) {
        loginLockRef.current =
          false;

        showAlert(
          "warning",
          "NIS Belum Diisi",
          "Silakan masukkan Nomor Induk Siswa (NIS) milikmu."
        );

        setTimeout(() => {
          nisRef.current?.focus(
            {
              preventScroll:
                true,
            }
          );
        }, 0);

        return;
      }

      setLoading(true);

      try {
        // ============================================
        // CARI SISWA
        // ============================================

        const siswaDitemukan =
          await findStudentByNis(
            nisInput
          );

        // ============================================
        // TIDAK DITEMUKAN
        // ============================================

        if (
          !siswaDitemukan
        ) {
          showAlert(
            "error",
            "Data Tidak Ditemukan",
            "NIS tersebut tidak terdaftar di sistem. Periksa kembali NIS yang dimasukkan."
          );

          return;
        }

        // ============================================
        // AMBIL DATA
        // ============================================

        const [
          studentId,
          studentData,
        ] =
          siswaDitemukan;

        // ============================================
        // NORMALISASI DATA FIREBASE
        // ============================================

        const namaDatabase =
          normalizeNama(
            studentData?.nama
          );

        const nisDatabase =
          normalizeNis(
            studentData?.nis
          );

        const kelasDatabase =
          String(
            studentData?.kelas ||
              ""
          ).trim();

        // ============================================
        // TENTUKAN NIS FINAL
        //
        // FIELD nis adalah prioritas.
        //
        // Jika data lama tidak memiliki field nis,
        // baru gunakan Firebase key.
        // ============================================

        const nisFinal =
          nisDatabase ||
          String(
            studentId
          ).trim();

        // ============================================
        // VALIDASI NIS
        // ============================================

        const nisCocok =
          nisFinal ===
            nisInput ||
          String(
            studentId
          ).trim() ===
            nisInput;

        if (!nisCocok) {
          showAlert(
            "error",
            "NIS Tidak Cocok",
            "NIS yang dimasukkan tidak sesuai dengan data siswa di Firebase."
          );

          return;
        }

        // ============================================
        // VALIDASI NAMA
        // ============================================

        const namaCocok =
          namaDatabase ===
          namaInput;

        if (!namaCocok) {
          showAlert(
            "error",
            "Nama Tidak Cocok",
            "Nama dan NIS yang dimasukkan tidak cocok dengan data siswa. Pastikan nama ditulis sesuai data sekolah."
          );

          return;
        }

        // ============================================
        // VALIDASI DATA SISWA
        // ============================================

        if (!namaDatabase) {
          showAlert(
            "error",
            "Data Siswa Tidak Lengkap",
            "Data nama siswa di database belum lengkap. Hubungi admin."
          );

          return;
        }

        if (!nisFinal) {
          showAlert(
            "error",
            "NIS Tidak Tersedia",
            "Data NIS siswa di database belum tersedia. Hubungi admin."
          );

          return;
        }

        // ============================================
        // SIMPAN SESI
        // ============================================

        const session =
          saveStudentSession({
            nama:
              studentData?.nama ||
              namaVal.trim(),

            nis:
              nisFinal,

            kelas:
              kelasDatabase,
          });

        // ============================================
        // VERIFIKASI LOCAL STORAGE
        //
        // Ini memastikan data benar-benar tersimpan
        // sebelum pindah halaman.
        // ============================================

        const savedNama =
          localStorage.getItem(
            "namaSiswa"
          );

        const savedNis =
          localStorage.getItem(
            "nisSiswa"
          );

        const savedKelas =
          localStorage.getItem(
            "kelasSiswa"
          );

        if (
          savedNama !==
            session.nama ||
          savedNis !==
            session.nis ||
          savedKelas !==
            session.kelas
        ) {
          throw new Error(
            "Gagal menyimpan sesi siswa."
          );
        }

        // ============================================
        // LOGIN BERHASIL
        // ============================================

        showAlert(
          "success",
          "Login Berhasil!",
          `Selamat datang, ${
            studentData?.nama ||
            session.nama
          }!`,
          () => {
            navigate(
              "/dashboard-siswa",
              {
                replace:
                  true,
              }
            );
          }
        );
      } catch (error) {
        console.error(
          "Gagal login siswa:",
          error
        );

        showAlert(
          "error",
          "Terjadi Kesalahan",
          error?.message ||
            "Terjadi kesalahan saat memeriksa data login. Pastikan koneksi internet aktif lalu coba lagi."
        );
      } finally {
        setLoading(false);

        loginLockRef.current =
          false;
      }
    };

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div
      style={
        styles.page
      }
    >
      <div
        style={
          styles.card
        }
      >

        {/* ==========================================
            FORM LOGIN
        =========================================== */}

        <div
          style={
            styles.left
          }
        >
          <div
            style={
              styles.title
            }
          >
            Login Siswa
          </div>

          <div
            style={
              styles.subtitle
            }
          >
            Selamat datang di
            Sistem Pengaduan
            Bullying SD.
          </div>

          {/* ========================================
              LOGIN QR
          ========================================= */}

          <button
            type="button"
            aria-label="Scan QR Code untuk login"
            style={
              styles.qrButton
            }
            onClick={() =>
              navigate(
                "/scan-qr"
              )
            }
            disabled={
              loading
            }
          >
            SCAN QR CODE LOGIN
          </button>

          <div
            style={
              styles.divider
            }
          >
            — ATAU MASUK
            DENGAN NIS —
          </div>

          {/* ========================================
              FORM
          ========================================= */}

          <form
            onSubmit={
              handleLogin
            }
            autoComplete="off"
          >

            {/* NAMA */}

            <label
              style={
                styles.label
              }
              htmlFor="nama-siswa"
            >
              Nama Lengkap
            </label>

            <input
              id="nama-siswa"
              ref={namaRef}
              type="text"
              placeholder="Ketik nama lengkapmu"
              style={
                styles.input
              }
              disabled={
                loading
              }
              autoComplete="off"
              autoCapitalize="words"
              autoCorrect="off"
              spellCheck="false"
              enterKeyHint="next"
            />

            {/* NIS */}

            <label
              style={
                styles.label
              }
              htmlFor="nis-siswa"
            >
              Nomor Induk Siswa
              (NIS)
            </label>

            <input
              id="nis-siswa"
              ref={nisRef}
              type="text"
              placeholder="Ketik nomor NIS"
              style={
                styles.input
              }
              disabled={
                loading
              }
              inputMode="numeric"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              enterKeyHint="go"
            />

            {/* LOGIN */}

            <button
              type="submit"
              style={
                styles.loginButton(
                  loading
                )
              }
              disabled={
                loading
              }
            >
              {loading
                ? "MEMERIKSA..."
                : "MASUK SEKARANG"}
            </button>

          </form>

          {/* ========================================
              KEMBALI
          ========================================= */}

          <button
            type="button"
            style={{
              ...styles.back,

              background:
                "transparent",

              border:
                "none",

              padding: 0,

              width:
                "100%",
            }}
            onClick={() =>
              navigate("/")
            }
            disabled={
              loading
            }
          >
            Kembali ke Beranda
          </button>
        </div>

        {/* ==========================================
            PANEL KANAN
        =========================================== */}

        <div
          style={
            styles.right
          }
        >
          <div>
            <div
              style={
                styles.stop
              }
            >
              Stop Bullying!
            </div>

            <div
              style={
                styles.desc
              }
            >
              Jadilah teman yang
              baik, saling
              menghargai, dan
              berani melapor
              apabila melihat atau
              mengalami tindakan
              bullying di sekolah.
            </div>
          </div>
        </div>
      </div>

      {/* ==============================================
          ALERT MODAL
      =============================================== */}

      {alertConfig.isOpen && (
        <div
          style={
            styles.modalOverlay
          }
          role="presentation"
        >
          <div
            style={
              styles.modalCard
            }
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-alert-title"
          >

            <div
              style={
                styles.alertIconWrapper(
                  alertConfig.type
                )
              }
            >
              {alertConfig.type ===
              "success"
                ? "✓"
                : alertConfig.type ===
                  "error"
                ? "✕"
                : "ℹ"}
            </div>

            <h3
              id="login-alert-title"
              style={{
                ...styles.modalTitle,

                color:
                  alertConfig.type ===
                  "success"
                    ? "#1B5E20"
                    : alertConfig.type ===
                      "error"
                    ? "#C62828"
                    : "#E65100",
              }}
            >
              {
                alertConfig.title
              }
            </h3>

            <p
              style={
                styles.modalText
              }
            >
              {
                alertConfig.message
              }
            </p>

            <button
              type="button"
              style={
                styles.alertBtn(
                  alertConfig.type
                )
              }
              onClick={
                handleCloseAlert
              }
              autoFocus={false}
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