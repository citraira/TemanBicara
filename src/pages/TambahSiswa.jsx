import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ref, push } from "firebase/database";
import { db } from "../firebase";

function TambahSiswa() {
  const navigate = useNavigate();

  const [nama, setNama] = useState("");
  const [nis, setNis] = useState("");
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

  const showAlert = (type, title, message, onCloseCallback = null) => {
    setAlertConfig({
      isOpen: true,
      type,
      title,
      message,
      onCloseCallback,
    });
  };

  const handleCloseAlert = () => {
    const callback = alertConfig.onCloseCallback;
    setAlertConfig((prev) => ({ ...prev, isOpen: false }));
    if (callback) {
      callback();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      nama.trim() === "" ||
      nis.trim() === "" ||
      kelas === "" ||
      jenisKelamin === ""
    ) {
      showAlert(
        "warning",
        "Data Belum Lengkap",
        "Nama Lengkap, NIS, Kelas, dan Jenis Kelamin wajib diisi!"
      );
      return;
    }

    setLoading(true);

    try {
      await push(ref(db, "siswa"), {
        nama: nama.trim(),
        nis: nis.trim(),
        kelas,
        jenisKelamin,
        noHp: noHp.trim() || "-",
        alamat: alamat.trim() || "-",
        createdAt: new Date().toISOString(),
      });

      showAlert(
        "success",
        "Berhasil Disimpan!",
        `Data siswa "${nama.trim()}" berhasil ditambahkan ke dalam sistem.`,
        () => {
          navigate("/data-siswa");
        }
      );
    } catch (error) {
      showAlert(
        "error",
        "Gagal Menyimpan",
        error.message || "Terjadi kendala saat menyimpan data siswa."
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
      fontSize: "14px",
      outline: "none",
      boxSizing: "border-box",
      background: "#FAFAFA",
    },

    textarea: {
      width: "100%",
      padding: "12px 14px",
      borderRadius: "12px",
      border: "2px solid #C8E6C9",
      fontSize: "14px",
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

    saveButton: {
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

    backButton: {
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
        <h1 style={styles.title}>Tambah Data Siswa</h1>

        <p style={styles.subtitle}>
          Tambahkan data siswa agar dapat login ke Sistem Pengaduan Bullying.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Nama */}
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
            <label style={styles.label}>Nomor Induk Siswa (NIS) *</label>
            <input
              type="text"
              value={nis}
              onChange={(e) => setNis(e.target.value)}
              placeholder="Masukkan NIS"
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
              placeholder="Contoh: 081234567890"
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
              placeholder="Masukkan alamat lengkap tempat tinggal"
              style={styles.textarea}
              disabled={loading}
            />
          </div>

          {/* Tombol Aksi */}
          <div style={styles.buttonGroup}>
            <button
              type="submit"
              style={styles.saveButton}
              disabled={loading}
            >
              {loading ? "Menyimpan..." : "Simpan Data"}
            </button>

            <button
              type="button"
              style={styles.backButton}
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

export default TambahSiswa;