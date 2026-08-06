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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      nama === "" ||
      nis === "" ||
      kelas === "" ||
      jenisKelamin === ""
    ) {
      alert("Semua data wajib diisi!");
      return;
    }

    try {
      await push(ref(db, "siswa"), {
        nama,
        nis,
        kelas,
        jenisKelamin,
        noHp,
        alamat,
      });

      alert("Data siswa berhasil ditambahkan.");

      navigate("/data-siswa");

    } catch (error) {
      alert(error.message);
    }
  };

  const styles = {
        page: {
      minHeight: "100vh",
      background: "#F4F8FC",
      padding: "30px",
      fontFamily: "Segoe UI, sans-serif",
    },

    container: {
      maxWidth: "700px",
      margin: "0 auto",
      background: "#fff",
      borderRadius: "20px",
      padding: "35px",
      boxShadow: "0 10px 25px rgba(0,0,0,.1)",
    },

    title: {
      textAlign: "center",
      color: "#1565C0",
      fontSize: "32px",
      fontWeight: "bold",
      marginBottom: "10px",
    },

    subtitle: {
      textAlign: "center",
      color: "#666",
      marginBottom: "30px",
      lineHeight: "1.6",
    },

    group: {
      marginBottom: "20px",
    },

    label: {
      display: "block",
      marginBottom: "8px",
      fontWeight: "bold",
      color: "#333",
      fontSize: "15px",
    },

    input: {
      width: "100%",
      padding: "14px",
      borderRadius: "10px",
      border: "1px solid #ccc",
      fontSize: "15px",
      outline: "none",
      boxSizing: "border-box",
    },

    textarea: {
      width: "100%",
      padding: "14px",
      borderRadius: "10px",
      border: "1px solid #ccc",
      fontSize: "15px",
      resize: "vertical",
      minHeight: "100px",
      outline: "none",
      boxSizing: "border-box",
    },

    buttonGroup: {
      display: "flex",
      gap: "15px",
      marginTop: "30px",
      flexWrap: "wrap",
    },

    saveButton: {
      flex: 1,
      background: "#1565C0",
      color: "#fff",
      border: "none",
      padding: "14px",
      borderRadius: "10px",
      fontSize: "16px",
      cursor: "pointer",
      fontWeight: "bold",
    },

    backButton: {
      flex: 1,
      background: "#757575",
      color: "#fff",
      border: "none",
      padding: "14px",
      borderRadius: "10px",
      fontSize: "16px",
      cursor: "pointer",
      fontWeight: "bold",
    },
  };
  return (
    <div style={styles.page}>

      <div style={styles.container}>

        <h1 style={styles.title}>
          ➕ Tambah Data Siswa
        </h1>

        <p style={styles.subtitle}>
          Tambahkan data siswa agar dapat login ke Sistem Pengaduan Bullying.
        </p>

        <form onSubmit={handleSubmit}>

          {/* Nama */}

          <div style={styles.group}>

            <label style={styles.label}>
              👤 Nama Lengkap
            </label>

            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Masukkan Nama Lengkap"
              style={styles.input}
            />

          </div>

          {/* NIS */}

          <div style={styles.group}>

            <label style={styles.label}>
              🆔 Nomor Induk Siswa (NIS)
            </label>

            <input
              type="text"
              value={nis}
              onChange={(e) => setNis(e.target.value)}
              placeholder="Masukkan NIS"
              style={styles.input}
            />

          </div>

          {/* Kelas */}

          <div style={styles.group}>

            <label style={styles.label}>
              🏫 Kelas
            </label>

            <select
              value={kelas}
              onChange={(e) => setKelas(e.target.value)}
              style={styles.input}
            >

              <option value="">Pilih Kelas</option>

              <option>1A</option>
              <option>1B</option>

              <option>2A</option>
              <option>2B</option>

              <option>3A</option>
              <option>3B</option>

              <option>4A</option>
              <option>4B</option>

              <option>5A</option>
              <option>5B</option>

              <option>6A</option>
              <option>6B</option>

            </select>

          </div>

          {/* Jenis Kelamin */}

          <div style={styles.group}>

            <label style={styles.label}>
              🚻 Jenis Kelamin
            </label>

            <select
              value={jenisKelamin}
              onChange={(e) => setJenisKelamin(e.target.value)}
              style={styles.input}
            >

              <option value="">Pilih Jenis Kelamin</option>

              <option>Laki-laki</option>

              <option>Perempuan</option>

            </select>

          </div>

          {/* Nomor HP */}

          <div style={styles.group}>

            <label style={styles.label}>
              📞 Nomor HP Orang Tua
            </label>

            <input
              type="text"
              value={noHp}
              onChange={(e) => setNoHp(e.target.value)}
              placeholder="Contoh : 081234567890"
              style={styles.input}
            />

          </div>

          {/* Alamat */}

          <div style={styles.group}>

            <label style={styles.label}>
              🏠 Alamat
            </label>

            <textarea
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              placeholder="Masukkan alamat lengkap"
              style={styles.textarea}
            />

          </div>

          {/* Tombol */}

          <div style={styles.buttonGroup}>

            <button
              type="submit"
              style={styles.saveButton}
            >
              💾 Simpan Data
            </button>

            <button
              type="button"
              style={styles.backButton}
              onClick={() => navigate("/data-siswa")}
            >
              ← Kembali
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default TambahSiswa;