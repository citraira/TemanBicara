import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ref, get, update } from "firebase/database";
import { db } from "../firebase";

function EditSiswa() {
  const navigate = useNavigate();

  const { id } = useParams();

  const [nama, setNama] = useState("");
  const [nisn, setNisn] = useState("");
  const [kelas, setKelas] = useState("");
  const [jenisKelamin, setJenisKelamin] = useState("");
  const [noHp, setNoHp] = useState("");
  const [alamat, setAlamat] = useState("");
  const [loading, setLoading] = useState(false);

  // State Pop-Up Notifikasi Kustom (Pengganti alert())
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    type: "success", // 'success' | 'error' | 'warning'
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

  const handleCloseAlert = () => {
    const callback = alertConfig.onCloseCallback;
    setAlertConfig((prev) => ({ ...prev, isOpen: false }));
    if (callback) {
      callback();
    }
  };

  useEffect(() => {
    let isMounted = true;

    const ambilData = async () => {
      try {
        if (!id) {
          if (isMounted) {
            showAlert(
              "error",
              "ID Siswa Tidak Valid",
              "ID data siswa tidak ditemukan."
            );
          }
          return;
        }

        const snapshot = await get(ref(db, `siswa/${id}`));

        if (!isMounted) return;

        if (snapshot.exists()) {
          const data = snapshot.val();

          setNama(data.nama || "");
          setNisn(data.nisn || "");
          setKelas(data.kelas || "");
          setJenisKelamin(data.jenisKelamin || "");
          setNoHp(data.noHp || "");
          setAlamat(data.alamat || "");
        } else {
          showAlert(
            "error",
            "Data Tidak Ditemukan",
            "Data siswa tidak ditemukan di sistem database.",
            () => navigate("/data-siswa")
          );
        }
      } catch (error) {
        if (!isMounted) return;

        console.error("Gagal memuat data siswa:", error);

        showAlert(
          "error",
          "Gagal Memuat Data",
          error.message || "Terjadi kendala saat mengambil data siswa."
        );
      }
    };

    ambilData();

    return () => {
      isMounted = false;
    };
  }, [id, navigate, showAlert]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    // Cegah double submit saat tombol ditekan berkali-kali.
    if (loading) return;

    if (
      nama.trim() === "" ||
      nisn.trim() === "" ||
      kelas === "" ||
      jenisKelamin === ""
    ) {
      showAlert(
        "warning",
        "Data Belum Lengkap",
        "Nama Lengkap, NISN, Kelas, dan Jenis Kelamin wajib diisi!"
      );
      return;
    }

    setLoading(true);

    try {
      const namaFinal = nama.trim();
      const nisnFinal = nisn.trim();
      const noHpFinal = noHp.trim() || "-";
      const alamatFinal = alamat.trim() || "-";

      await update(ref(db, `siswa/${id}`), {
        nama: namaFinal,
        nisn: nisnFinal,
        kelas,
        jenisKelamin,
        noHp: noHpFinal,
        alamat: alamatFinal,
        updatedAt: new Date().toISOString(),
      });

      showAlert(
        "success",
        "Berhasil Diperbarui!",
        `Data siswa "${namaFinal}" telah berhasil diperbarui.`,
        () => {
          navigate("/data-siswa");
        }
      );
    } catch (error) {
      showAlert(
        "error",
        "Gagal Memperbarui",
        error.message || "Terjadi kesalahan saat memperbarui data siswa."
      );
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#F4FBEE", // Hijau muda serasi
      padding: "20px 15px",
      fontFamily: "'Segoe UI', Roboto, sans-serif",
      boxSizing: "border-box",
    },

    container: {
      maxWidth: "600px",
      margin: "0 auto",
      background: "#fff",
      borderRadius: "20px",
      padding: "30px 20px",
      boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
      border: "2px solid #C8E6C9",
      boxSizing: "border-box",
    },

    title: {
      textAlign: "center",
      color: "#1B5E20",
      fontSize: "24px",
      fontWeight: "800",
      marginBottom: "6px",
      marginTop: 0,
    },

    subtitle: {
      textAlign: "center",
      color: "#556B4D",
      marginBottom: "25px",
      lineHeight: "1.5",
      fontSize: "13px",
      fontWeight: "500",
    },

    group: {
      marginBottom: "16px",
    },

    label: {
      display: "block",
      marginBottom: "6px",
      fontWeight: "700",
      color: "#1B5E20",
      fontSize: "13px",
    },

    input: {
      width: "100%",
      padding: "12px 14px",
      borderRadius: "12px",
      border: "2px solid #C8E6C9",
      fontSize: "16px",
      outline: "none",
      boxSizing: "border-box",
      background: "#FAFAFA",
    },

    textarea: {
      width: "100%",
      padding: "12px 14px",
      borderRadius: "12px",
      border: "2px solid #C8E6C9",
      fontSize: "16px",
      resize: "vertical",
      minHeight: "90px",
      outline: "none",
      boxSizing: "border-box",
      background: "#FAFAFA",
    },

    buttonGroup: {
      display: "flex",
      gap: "12px",
      marginTop: "25px",
      flexWrap: "wrap",
    },

    updateButton: {
      flex: 1,
      background: loading ? "#A5D6A7" : "#2E7D32",
      color: "#fff",
      border: "none",
      padding: "13px",
      borderRadius: "12px",
      fontSize: "14px",
      cursor: loading ? "not-allowed" : "pointer",
      fontWeight: "800",
      boxShadow: loading ? "none" : "0 3px 0 #1B5E20",
      textTransform: "uppercase",
    },

    cancelButton: {
      flex: 1,
      background: "#FFEB3B",
      color: "#1B5E20",
      border: "none",
      padding: "13px",
      borderRadius: "12px",
      fontSize: "14px",
      cursor: "pointer",
      fontWeight: "800",
      boxShadow: "0 3px 0 #FBC02D",
      textTransform: "uppercase",
    },

    // Gaya Modal Pop-up Notifikasi Kustom
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

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Edit Data Siswa</h1>

        <p style={styles.subtitle}>
          Ubah data siswa yang telah terdaftar pada sistem pengaduan.
        </p>

        <form onSubmit={handleUpdate}>
          {/* Nama Lengkap */}
          <div style={styles.group}>
            <label style={styles.label}>Nama Lengkap *</label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Masukkan Nama Lengkap"
              style={styles.input}
              disabled={loading}
            />
          </div>

          {/* NIS */}
          <div style={styles.group}>
            <label style={styles.label}>Nomor Induk Siswa (NISN) *</label>
            <input
              type="text"
              value={nisn}
              onChange={(e) => setNisn(e.target.value)}
              placeholder="Masukkan NISN"
              style={styles.input}
              disabled={loading}
            />
          </div>

          {/* Kelas */}
          <div style={styles.group}>
            <label style={styles.label}>Kelas *</label>
            <select
              value={kelas}
              onChange={(e) => setKelas(e.target.value)}
              style={styles.input}
              disabled={loading}
            >
              <option value="">Pilih Kelas</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
            </select>
          </div>

          {/* Jenis Kelamin */}
          <div style={styles.group}>
            <label style={styles.label}>Jenis Kelamin *</label>
            <select
              value={jenisKelamin}
              onChange={(e) => setJenisKelamin(e.target.value)}
              style={styles.input}
              disabled={loading}
            >
              <option value="">Pilih Jenis Kelamin</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>

          {/* Nomor HP */}
          <div style={styles.group}>
            <label style={styles.label}>Nomor HP Orang Tua (Opsional)</label>
            <input
              type="text"
              value={noHp}
              onChange={(e) => setNoHp(e.target.value)}
              placeholder="081234567890"
              style={styles.input}
              disabled={loading}
            />
          </div>

          {/* Alamat */}
          <div style={styles.group}>
            <label style={styles.label}>Alamat Lengkap (Opsional)</label>
            <textarea
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              placeholder="Masukkan alamat lengkap siswa"
              style={styles.textarea}
              disabled={loading}
            />
          </div>

          {/* Tombol Aksi */}
          <div style={styles.buttonGroup}>
            <button
              type="submit"
              style={styles.updateButton}
              disabled={loading}
            >
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>

            <button
              type="button"
              style={styles.cancelButton}
              onClick={() => navigate("/data-siswa")}
              disabled={loading}
            >
              ← Kembali
            </button>
          </div>
        </form>
      </div>

      {/* POP-UP NOTIFIKASI KUSTOM BERDESAIN (PENGGANTI ALERT) */}
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

export default EditSiswa;