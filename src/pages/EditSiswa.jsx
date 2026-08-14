import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ref, get, update } from "firebase/database";
import { db } from "../firebase";

function EditSiswa() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [nama, setNama] = useState("");
  const [nis, setNis] = useState("");
  const [kelas, setKelas] = useState("");
  const [jenisKelamin, setJenisKelamin] = useState("");
  const [noHp, setNoHp] = useState("");
  const [alamat, setAlamat] = useState("");

  useEffect(() => {
    const ambilData = async () => {
      try {
        const snapshot = await get(ref(db, `siswa/${id}`));

        if (snapshot.exists()) {
          const data = snapshot.val();

          setNama(data.nama || "");
          setNis(data.nis || "");
          setKelas(data.kelas || "");
          setJenisKelamin(data.jenisKelamin || "");
          setNoHp(data.noHp || "");
          setAlamat(data.alamat || "");
        } else {
          alert("Data siswa tidak ditemukan.");
          navigate("/data-siswa");
        }
      } catch (error) {
        alert(error.message);
      }
    };

    ambilData();
  }, [id, navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (
      nama === "" ||
      nis === "" ||
      kelas === "" ||
      jenisKelamin === ""
    ) {
      alert("Semua data wajib diisi.");
      return;
    }

    try {
      await update(ref(db, `siswa/${id}`), {
        nama,
        nis,
        kelas,
        jenisKelamin,
        noHp,
        alamat,
      });

      alert("Data siswa berhasil diperbarui.");

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

    updateButton: {
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

    cancelButton: {
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
          ✏️ Edit Data Siswa
        </h1>

        <p style={styles.subtitle}>
          Ubah data siswa yang telah terdaftar pada sistem.
        </p>

        <form onSubmit={handleUpdate}>

          {/* Nama Lengkap */}

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

            <label style={styles.label}>
              Jenis Kelamin
            </label>

            <select
              value={jenisKelamin}
              onChange={(e) => setJenisKelamin(e.target.value)}
              style={styles.input}
            >
              <option value="">Pilih Jenis Kelamin</option>

              <option value="Laki-laki">
                Laki-laki
              </option>

              <option value="Perempuan">
                Perempuan
              </option>

            </select>

          </div>

          {/* Nomor HP */}

          <div style={styles.group}>

            <label style={styles.label}>
              Nomor HP Orang Tua
            </label>

            <input
              type="text"
              value={noHp}
              onChange={(e) => setNoHp(e.target.value)}
              placeholder="081234567890"
              style={styles.input}
            />

          </div>

          {/* Alamat */}

          <div style={styles.group}>

            <label style={styles.label}>
              Alamat
            </label>

            <textarea
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              placeholder="Masukkan alamat lengkap siswa"
              style={styles.textarea}
            />

          </div>

          {/* Tombol */}

          <div style={styles.buttonGroup}>

            <button
              type="submit"
              style={styles.updateButton}
            >
              Simpan Perubahan
            </button>

            <button
              type="button"
              style={styles.cancelButton}
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

export default EditSiswa;