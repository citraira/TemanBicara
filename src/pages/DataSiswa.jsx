import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ref,
  get,
  remove,
} from "firebase/database";

import { useNavigate } from "react-router-dom";

import QRCode from "react-qr-code";

import { db } from "../firebase";

// ======================================================
// DATA SISWA
// ======================================================

function DataSiswa() {
  const navigate = useNavigate();

  // ====================================================
  // STATE
  // ====================================================

  const [dataSiswa, setDataSiswa] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // QR yang sedang dibuka
  const [selectedQr, setSelectedQr] = useState(null);

  // Siswa yang akan dihapus
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Alert
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
    onCloseCallback: null,
  });

  // ====================================================
  // ALERT
  // ====================================================

  const showAlert = useCallback(
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

  const handleCloseAlert = useCallback(() => {
    const callback =
      alertConfig.onCloseCallback;

    setAlertConfig((prev) => ({
      ...prev,
      isOpen: false,
      onCloseCallback: null,
    }));

    if (callback) {
      callback();
    }
  }, [alertConfig.onCloseCallback]);

  // ====================================================
  // LOAD DATA SISWA
  // ====================================================

  const loadDataSiswa = useCallback(
    async (showInitialLoading = false) => {
      try {
        if (showInitialLoading) {
          setLoading(true);
        }

        const siswaRef = ref(db, "siswa");
        const snapshot = await get(siswaRef);

        if (!snapshot.exists()) {
          setDataSiswa([]);
          return;
        }

        const data = snapshot.val();

        const list = Object.entries(data).map(
          ([key, value]) => ({
            id: key,
            ...(value || {}),
          })
        );

        setDataSiswa(list);
      } catch (error) {
        console.error(
          "Gagal mengambil data siswa:",
          error
        );

        showAlert(
          "error",
          "Gagal Memuat Data",
          error?.message ||
            "Terjadi kesalahan saat mengambil data siswa."
        );
      } finally {
        if (showInitialLoading) {
          setLoading(false);
        }
      }
    },
    [showAlert]
  );

  // ====================================================
  // LOAD SAAT HALAMAN DIBUKA
  // ====================================================

  useEffect(() => {
    loadDataSiswa(true);
  }, [loadDataSiswa]);

  // ====================================================
  // REFRESH
  // ====================================================

  const refreshDataSiswa = useCallback(async () => {
    if (refreshing) {
      return;
    }

    try {
      setRefreshing(true);
      await loadDataSiswa(false);
    } catch (error) {
      console.error(
        "Gagal refresh data siswa:",
        error
      );
    } finally {
      setRefreshing(false);
    }
  }, [loadDataSiswa, refreshing]);

  // ====================================================
  // BUKA KONFIRMASI HAPUS
  // ====================================================

  const confirmDelete = (student) => {
    if (!student?.id) {
      return;
    }

    setDeleteTarget(student);
  };

  // ====================================================
  // EKSEKUSI HAPUS
  //
  // hapusLaporan = true
  // -> siswa + seluruh laporan siswa
  //
  // hapusLaporan = false
  // -> hanya siswa
  // ====================================================

  const executeDelete = async (
    hapusLaporan = false
  ) => {
    const student = deleteTarget;

    if (!student?.id) {
      return;
    }

    // Tutup modal terlebih dahulu
    setDeleteTarget(null);

    try {
      const nisnSiswa = String(
        student.nisn ||
          student.id ||
          ""
      ).trim();

      const namaSiswa = String(
        student.nama || ""
      )
        .trim()
        .toLowerCase();

      // ==================================================
      // HAPUS SEMUA LAPORAN MILIK SISWA
      // ==================================================

      if (hapusLaporan) {
        const pengaduanRef =
          ref(db, "pengaduan");

        const pengaduanSnapshot =
          await get(pengaduanRef);

        if (pengaduanSnapshot.exists()) {
          const dataPengaduan =
            pengaduanSnapshot.val();

          const laporanMilikSiswa =
            Object.entries(
              dataPengaduan
            ).filter(
              ([, laporan]) => {
                const nisnLaporan =
                  String(
                    laporan?.nisn || ""
                  ).trim();

                const namaLaporan =
                  String(
                    laporan?.nama || ""
                  )
                    .trim()
                    .toLowerCase();

                // Prioritas pencocokan NIS
                if (
                  nisnSiswa &&
                  nisnLaporan
                ) {
                  return (
                    nisnLaporan ===
                    nisnSiswa
                  );
                }

                // Fallback nama jika laporan
                // tidak mempunyai NIS
                return (
                  !nisnLaporan &&
                  namaSiswa &&
                  namaLaporan ===
                    namaSiswa
                );
              }
            );

          // Hapus seluruh laporan
          await Promise.all(
            laporanMilikSiswa.map(
              ([laporanId]) =>
                remove(
                  ref(
                    db,
                    `pengaduan/${laporanId}`
                  )
                )
            )
          );
        }
      }

      // ==================================================
      // HAPUS DATA SISWA
      // ==================================================

      await remove(
        ref(
          db,
          `siswa/${student.id}`
        )
      );

      // Update tampilan tanpa reload
      setDataSiswa((prev) =>
        prev.filter(
          (item) =>
            item.id !== student.id
        )
      );

      // ==================================================
      // NOTIFIKASI
      // ==================================================

      showAlert(
        "success",
        "Berhasil Dihapus",
        hapusLaporan
          ? "Data siswa dan semua laporan milik siswa tersebut berhasil dihapus."
          : "Data siswa berhasil dihapus. Laporan siswa tetap disimpan."
      );
    } catch (error) {
      console.error(
        "Gagal menghapus siswa:",
        error
      );

      showAlert(
        "error",
        "Gagal Menghapus",
        error?.message ||
          "Terjadi kesalahan saat menghapus data siswa."
      );
    }
  };

  // ====================================================
  // DOWNLOAD KARTU QR - PNG SAJA
  // ====================================================

  const downloadQRCode = useCallback(() => {
    if (!selectedQr) {
      return;
    }

    const svg =
      document.getElementById(
        "qr-code-download"
      );

    if (!svg) {
      showAlert(
        "error",
        "QR Tidak Ditemukan",
        "QR Code belum siap untuk diunduh."
      );

      return;
    }

    try {
      /*
       * Buat salinan SVG terlebih dahulu.
       * react-qr-code menghasilkan SVG yang bisa tampil normal
       * di halaman, tetapi beberapa browser gagal jika SVG asli
       * langsung diubah menjadi Image dari Blob.
       *
       * Dengan menetapkan namespace + ukuran secara eksplisit,
       * SVG menjadi SVG mandiri yang aman dikonversi ke Canvas/PNG.
       */
      const svgClone = svg.cloneNode(true);

      svgClone.setAttribute(
        "xmlns",
        "http://www.w3.org/2000/svg"
      );

      svgClone.setAttribute(
        "xmlns:xlink",
        "http://www.w3.org/1999/xlink"
      );

      svgClone.setAttribute(
        "width",
        "1000"
      );

      svgClone.setAttribute(
        "height",
        "1000"
      );

      svgClone.setAttribute(
        "viewBox",
        svg.getAttribute("viewBox") ||
          "0 0 256 256"
      );

      // Pastikan SVG tidak bergantung pada CSS luar.
      svgClone.style.width = "1000px";
      svgClone.style.height = "1000px";
      svgClone.style.background = "#FFFFFF";

      const serializer =
        new XMLSerializer();

      const svgString =
        serializer.serializeToString(
          svgClone
        );

      const svgBlob = new Blob(
        [
          '<?xml version="1.0" encoding="UTF-8"?>',
          svgString,
        ],
        {
          type:
            "image/svg+xml;charset=utf-8",
        }
      );

      const url =
        URL.createObjectURL(
          svgBlob
        );

      const image = new Image();

      image.onload = () => {
        try {
          const canvas =
            document.createElement(
              "canvas"
            );

          const width = 1000;
          const height = 1200;

          canvas.width = width;
          canvas.height = height;

          const context =
            canvas.getContext(
              "2d"
            );

          if (!context) {
            throw new Error(
              "Canvas tidak tersedia."
            );
          }

          const namaSiswa = String(
            selectedQr.nama ||
              "Siswa"
          ).trim();

          const nisnSiswa = String(
            selectedQr.nisn ||
              selectedQr.id ||
              "-"
          ).trim();

          const kelasSiswa = String(
            selectedQr.kelas ||
              "-"
          ).trim();

          // BACKGROUND
          context.fillStyle =
            "#FFFFFF";

          context.fillRect(
            0,
            0,
            width,
            height
          );

          context.textAlign =
            "center";

          context.textBaseline =
            "middle";

          // JUDUL
          context.fillStyle =
            "#0D47A1";

          context.font =
            "800 46px Segoe UI, Arial, sans-serif";

          context.fillText(
            "Kartu QR Siswa",
            width / 2,
            90
          );

          // NAMA
          context.fillStyle =
            "#0D47A1";

          context.font =
            "800 42px Segoe UI, Arial, sans-serif";

          context.fillText(
            namaSiswa,
            width / 2,
            155
          );

          // KELAS + NISN
          context.fillStyle =
            "#526579";

          context.font =
            "400 30px Segoe UI, Arial, sans-serif";

          context.fillText(
            `Kelas: ${kelasSiswa} | NISN: ${nisnSiswa}`,
            width / 2,
            210
          );

          // KOTAK QR
          const qrSize = 800;
          const qrX =
            (width - qrSize) / 2;
          const qrY = 280;
          const qrPadding = 18;

          context.fillStyle =
            "#FFFFFF";

          context.fillRect(
            qrX - qrPadding,
            qrY - qrPadding,
            qrSize +
              qrPadding * 2,
            qrSize +
              qrPadding * 2
          );

          context.strokeStyle =
            "#BBDEFB";

          context.lineWidth = 3;

          /*
           * Jangan menggunakan context.roundRect().
           * Beberapa browser/runtime bisa gagal di sini dan
           * membuat seluruh proses download masuk ke catch.
           * Gambar kotak biasa agar kompatibel.
           */
          context.strokeRect(
            qrX - qrPadding,
            qrY - qrPadding,
            qrSize +
              qrPadding * 2,
            qrSize +
              qrPadding * 2
          );

          // QR CODE
          context.drawImage(
            image,
            qrX,
            qrY,
            qrSize,
            qrSize
          );

          // PNG SAJA
          const dataUrl =
            canvas.toDataURL(
              "image/png"
            );

          if (
            !dataUrl ||
            !dataUrl.startsWith(
              "data:image/png"
            )
          ) {
            throw new Error(
              "PNG gagal dibuat dari canvas."
            );
          }

          const namaFile =
            namaSiswa
              .replace(
                /[^a-zA-Z0-9_-]/g,
                "_"
              );

          const nisFile =
            nisnSiswa
              .replace(
                /[^a-zA-Z0-9_-]/g,
                "_"
              );

          const fileName =
            `QR-${namaFile}-${nisFile}.png`;

          const link =
            document.createElement(
              "a"
            );

          link.download =
            fileName;

          link.href = dataUrl;

          link.style.display =
            "none";

          document.body.appendChild(
            link
          );

          link.click();

          document.body.removeChild(
            link
          );

          URL.revokeObjectURL(
            url
          );
        } catch (error) {
          console.error(
            "Gagal membuat kartu QR:",
            error
          );

          URL.revokeObjectURL(
            url
          );

          showAlert(
            "error",
            "Gagal Download",
            "Kartu QR tidak dapat dibuat menjadi PNG."
          );
        }
      };

      image.onerror = (error) => {
        console.error(
          "SVG QR gagal dimuat sebagai gambar:",
          error
        );

        URL.revokeObjectURL(
          url
        );

        showAlert(
          "error",
          "Gagal Download",
          "QR Code tidak dapat dikonversi menjadi gambar."
        );
      };

      image.src = url;
    } catch (error) {
      console.error(
        "Gagal download QR:",
        error
      );

      showAlert(
        "error",
        "Gagal Download",
        "Terjadi kesalahan saat membuat kartu QR."
      );
    }
  }, [selectedQr, showAlert]);

  // ====================================================
  // PENCARIAN
  // ====================================================

  const hasilPencarian = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    if (!keyword) {
      return dataSiswa;
    }

    return dataSiswa.filter(
      (item) =>
        String(
          item.nama || ""
        )
          .toLowerCase()
          .includes(keyword) ||

        String(
          item.nisn || ""
        )
          .toLowerCase()
          .includes(keyword) ||

        String(
          item.kelas || ""
        )
          .toLowerCase()
          .includes(keyword)
    );
  }, [dataSiswa, search]);

  // ====================================================
  // STYLE
  // ====================================================

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#F5F9FF",
      padding: "20px 15px",
      fontFamily:
        "'Segoe UI', Roboto, sans-serif",
      boxSizing: "border-box",
    },

    header: {
      background: "#1565C0",
      color: "#fff",
      padding: "20px",
      borderRadius: "20px",
      marginBottom: "20px",
      display: "flex",
      justifyContent:
        "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "12px",
      boxShadow:
        "0 4px 12px rgba(0,0,0,0.06)",
    },

    title: {
      fontSize: "22px",
      fontWeight: "800",
      margin: 0,
    },

    headerButtons: {
      display: "flex",
      gap: "8px",
      flexWrap: "wrap",
    },

    topButton: {
      background: "#FFFFFF",
      color: "#0D47A1",
      border: "none",
      padding: "10px 16px",
      borderRadius: "12px",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: "800",
      boxShadow:
        "0 3px 0 #90CAF9",
    },

    backButton: {
      background: "#FFFFFF",
      color: "#0D47A1",
      border: "none",
      padding: "12px 20px",
      borderRadius: "12px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "800",
      boxShadow:
        "0 3px 0 #90CAF9",
      marginTop: "15px",
    },

    search: {
      width: "100%",
      padding: "12px 14px",
      borderRadius: "12px",
      border:
        "2px solid #BBDEFB",
      marginBottom: "20px",
      fontSize: "14px",
      boxSizing: "border-box",
      outline: "none",
      background: "#fff",
    },

    tableContainer: {
      background: "#fff",
      borderRadius: "18px",
      overflowX: "auto",
      boxShadow:
        "0 4px 12px rgba(0,0,0,0.04)",
      border:
        "2px solid #BBDEFB",
    },

    table: {
      width: "100%",
      borderCollapse: "collapse",
      minWidth: "800px",
    },

    th: {
      background: "#1565C0",
      color: "#fff",
      padding: "14px 12px",
      textAlign: "center",
      fontSize: "13px",
      fontWeight: "800",
    },

    td: {
      padding: "12px",
      borderBottom:
        "1px solid #E3F2FD",
      textAlign: "center",
      fontSize: "13px",
      color: "#2E3D29",
    },

    qrBtn: {
      background: "#1565C0",
      color: "#fff",
      border: "none",
      padding: "6px 12px",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "700",
      fontSize: "12px",
    },

    editButton: {
      background: "#FFFFFF",
      color: "#0D47A1",
      border: "none",
      padding: "6px 12px",
      borderRadius: "8px",
      cursor: "pointer",
      marginRight: "6px",
      fontWeight: "800",
      fontSize: "12px",
      boxShadow:
        "0 2px 0 #90CAF9",
    },

    deleteButton: {
      background: "#D32F2F",
      color: "#fff",
      border: "none",
      padding: "6px 12px",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "800",
      fontSize: "12px",
    },

    empty: {
      textAlign: "center",
      padding: "35px",
      color: "#526579",
      fontSize: "14px",
      fontWeight: "600",
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
      textAlign: "center",
      maxWidth: "380px",
      width: "100%",
      boxShadow:
        "0 8px 24px rgba(0,0,0,0.15)",
      border:
        "2px solid #BBDEFB",
      boxSizing: "border-box",
      maxHeight: "90vh",
      overflowY: "auto",
    },

    printBtn: {
      background: "#1565C0",
      color: "#fff",
      border: "none",
      padding: "12px",
      borderRadius: "12px",
      cursor: "pointer",
      fontWeight: "800",
      marginTop: "15px",
      width: "100%",
      fontSize: "13px",
      boxShadow:
        "0 3px 0 #0D47A1",
      textTransform:
        "uppercase",
    },

    closeBtn: {
      background: "#FFFFFF",
      color: "#0D47A1",
      border: "none",
      padding: "12px",
      borderRadius: "12px",
      cursor: "pointer",
      fontWeight: "800",
      marginTop: "10px",
      width: "100%",
      fontSize: "13px",
      boxShadow:
        "0 3px 0 #90CAF9",
    },

    confirmYesBtn: {
      flex: 1,
      background: "#D32F2F",
      color: "#fff",
      border: "none",
      padding: "11px",
      borderRadius: "10px",
      fontWeight: "800",
      fontSize: "13px",
      cursor: "pointer",
      boxShadow:
        "0 3px 0 #9A0007",
    },

    confirmNoBtn: {
      flex: 1,
      background: "#FFFFFF",
      color: "#0D47A1",
      border: "none",
      padding: "11px",
      borderRadius: "10px",
      fontWeight: "800",
      fontSize: "13px",
      cursor: "pointer",
      boxShadow:
        "0 3px 0 #90CAF9",
    },

    alertIconWrapper: (type) => ({
      width: "60px",
      height: "60px",
      borderRadius: "50%",
      margin:
        "0 auto 12px auto",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: "28px",

      background:
        type === "success"
          ? "#E3F2FD"
          : type === "error"
          ? "#FFEBEE"
          : "#F5F9FF",

      border:
        `2px solid ${
          type === "success"
            ? "#1565C0"
            : type === "error"
            ? "#D32F2F"
            : "#90CAF9"
        }`,

      color:
        type === "success"
          ? "#1565C0"
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
      textTransform:
        "uppercase",

      color:
        type === "warning"
          ? "#0D47A1"
          : "#fff",

      background:
        type === "success"
          ? "#1565C0"
          : type === "error"
          ? "#D32F2F"
          : "#FFFFFF",

      boxShadow:
        type === "success"
          ? "0 3px 0 #0D47A1"
          : type === "error"
          ? "0 3px 0 #9A0007"
          : "0 3px 0 #90CAF9",
    }),
  };

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div style={styles.page}>

      {/* =================================================
          HEADER
      ================================================= */}

      <div style={styles.header}>

        <h1 style={styles.title}>
          Data Siswa
        </h1>

        <div style={styles.headerButtons}>

          {/* REFRESH */}

          <button
            type="button"
            style={{
              ...styles.topButton,
              opacity:
                refreshing ? 0.6 : 1,
              cursor:
                refreshing
                  ? "not-allowed"
                  : "pointer",
            }}
            onClick={
              refreshDataSiswa
            }
            disabled={refreshing}
          >
            {refreshing
              ? "Memuat..."
              : "↻ Refresh"}
          </button>

          {/* TAMBAH SISWA */}

          <button
            type="button"
            style={
              styles.topButton
            }
            onClick={() =>
              navigate(
                "/tambah-siswa"
              )
            }
          >
            Tambah Siswa
          </button>

        </div>
      </div>

      {/* =================================================
          SEARCH
      ================================================= */}

      <input
        type="text"
        placeholder="Cari Nama, NISN atau Kelas..."
        value={search}
        onChange={(e) =>
          setSearch(
            e.target.value
          )
        }
        style={styles.search}
        autoComplete="off"
      />

      {/* =================================================
          TABLE
      ================================================= */}

      {loading ? (
        <div
          style={{
            background: "#fff",
            padding:
              "35px 20px",
            borderRadius: "18px",
            textAlign: "center",
            color: "#0D47A1",
            border:
              "2px solid #BBDEFB",
            fontWeight: "700",
          }}
        >
          Memuat data siswa...
        </div>
      ) : (
        <div
          style={
            styles.tableContainer
          }
        >
          <table
            style={styles.table}
          >
            <thead>
              <tr>

                <th
                  style={styles.th}
                >
                  No
                </th>

                <th
                  style={styles.th}
                >
                  Nama Lengkap
                </th>

                <th
                  style={styles.th}
                >
                  NISN
                </th>

                <th
                  style={styles.th}
                >
                  Kelas
                </th>

                <th
                  style={styles.th}
                >
                  Jenis Kelamin
                </th>

                <th
                  style={styles.th}
                >
                  No HP Orang Tua
                </th>

                <th
                  style={styles.th}
                >
                  QR Code
                </th>

                <th
                  style={styles.th}
                >
                  Aksi
                </th>

              </tr>
            </thead>

            <tbody>

              {hasilPencarian.length ===
              0 ? (
                <tr>
                  <td
                    colSpan="8"
                    style={
                      styles.empty
                    }
                  >
                    {search.trim()
                      ? "Data siswa yang dicari tidak ditemukan."
                      : "Belum ada data siswa."}
                  </td>
                </tr>
              ) : (
                hasilPencarian.map(
                  (
                    item,
                    index
                  ) => (
                    <tr
                      key={
                        item.id
                      }
                    >

                      <td
                        style={
                          styles.td
                        }
                      >
                        {index + 1}
                      </td>

                      <td
                        style={
                          styles.td
                        }
                      >
                        {item.nama ||
                          "-"}
                      </td>

                      <td
                        style={
                          styles.td
                        }
                      >
                        {item.nisn ||
                          item.id ||
                          "-"}
                      </td>

                      <td
                        style={
                          styles.td
                        }
                      >
                        {item.kelas ||
                          "-"}
                      </td>

                      <td
                        style={
                          styles.td
                        }
                      >
                        {item.jenisKelamin ||
                          "-"}
                      </td>

                      <td
                        style={
                          styles.td
                        }
                      >
                        {item.noHp ||
                          "-"}
                      </td>

                      {/* QR */}

                      <td
                        style={
                          styles.td
                        }
                      >
                        <button
                          type="button"
                          style={
                            styles.qrBtn
                          }
                          onClick={() =>
                            setSelectedQr(
                              item
                            )
                          }
                        >
                          Lihat QR
                        </button>
                      </td>

                      {/* AKSI */}

                      <td
                        style={
                          styles.td
                        }
                      >

                        <button
                          type="button"
                          style={
                            styles.editButton
                          }
                          onClick={() =>
                            navigate(
                              `/edit-siswa/${item.id}`
                            )
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          style={
                            styles.deleteButton
                          }
                          onClick={() =>
                            confirmDelete(
                              item
                            )
                          }
                        >
                          Hapus
                        </button>

                      </td>

                    </tr>
                  )
                )
              )}

            </tbody>
          </table>
        </div>
      )}

      {/* =================================================
          MODAL QR CODE
      ================================================= */}

      {selectedQr && (
        <div
          style={
            styles.modalOverlay
          }
          onClick={() =>
            setSelectedQr(null)
          }
        >

          <div
            style={
              styles.modalCard
            }
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <h3
              style={{
                color: "#0D47A1",
                marginBottom:
                  "5px",
                fontSize:
                  "18px",
                fontWeight:
                  "800",
              }}
            >
              Kartu QR Siswa
            </h3>

            <p
              style={{
                margin:
                  "5px 0",
                fontWeight:
                  "800",
                color:
                  "#2E3D29",
              }}
            >
              {selectedQr.nama ||
                "Siswa"}
            </p>

            <p
              style={{
                color:
                  "#526579",
                fontSize:
                  "13px",
                marginBottom:
                  "18px",
              }}
            >
              Kelas:{" "}
              {selectedQr.kelas ||
                "-"}{" "}
              | NISN:{" "}
              {selectedQr.nisn ||
                selectedQr.id ||
                "-"}
            </p>

            {/* QR */}

            <div
              style={{
                background:
                  "#fff",
                padding:
                  "15px",
                borderRadius:
                  "12px",
                border:
                  "1px solid #BBDEFB",
                display:
                  "inline-block",
                maxWidth:
                  "100%",
                boxSizing:
                  "border-box",
              }}
            >
              <QRCode
                id="qr-code-download"
                value={String(
                  selectedQr.nisn ||
                    selectedQr.id ||
                    ""
                )}
                size={300}
                bgColor="#FFFFFF"
                fgColor="#000000"
                level="H"
              />
            </div>

            {/* DOWNLOAD PNG */}

            <button
              type="button"
              style={
                styles.printBtn
              }
              onClick={
                downloadQRCode
              }
            >
              Download PNG
            </button>

            {/* TUTUP */}

            <button
              type="button"
              style={
                styles.closeBtn
              }
              onClick={() =>
                setSelectedQr(
                  null
                )
              }
            >
              Tutup
            </button>

          </div>
        </div>
      )}

      {/* =================================================
          MODAL KONFIRMASI HAPUS
          
          PENTING:
          Gunakan deleteTarget,
          BUKAN deleteTargetId.
      ================================================= */}

      {deleteTarget && (
        <div
          style={
            styles.modalOverlay
          }
          onClick={() =>
            setDeleteTarget(null)
          }
        >

          <div
            style={
              styles.modalCard
            }
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* ICON */}

            <div
              style={
                styles.alertIconWrapper(
                  "warning"
                )
              }
            >
              ⚠️
            </div>

            {/* JUDUL */}

            <h3
              style={{
                color:
                  "#C62828",
                fontSize:
                  "18px",
                fontWeight:
                  "800",
                marginBottom:
                  "8px",
              }}
            >
              Hapus Data Siswa?
            </h3>

            {/* NAMA SISWA */}

            <p
              style={{
                color:
                  "#526579",
                fontSize:
                  "13px",
                marginBottom:
                  "10px",
                lineHeight:
                  "1.5",
              }}
            >
              Hapus data siswa{" "}
              <strong>
                {deleteTarget.nama ||
                  "Siswa"}
              </strong>

              {deleteTarget.nisn
                ? ` (NISN ${deleteTarget.nisn})`
                : ""}
              ?
            </p>

            {/* PILIH TINDAKAN */}

            <p
              style={{
                color:
                  "#526579",
                fontSize:
                  "13px",
                marginBottom:
                  "6px",
                lineHeight:
                  "1.5",
                fontWeight:
                  "700",
              }}
            >
              Pilih tindakan:
            </p>

            <p
              style={{
                color:
                  "#7A7A7A",
                fontSize:
                  "12px",
                margin: 0,
                lineHeight:
                  "1.5",
              }}
            >
              Jika laporan ikut
              dihapus, semua
              laporan milik
              siswa ini akan
              ikut terhapus.
            </p>

            {/* BUTTON */}

            <div
              style={{
                display:
                  "flex",
                flexDirection:
                  "column",
                gap: "10px",
                marginTop:
                  "20px",
              }}
            >

              {/* HAPUS SISWA + LAPORAN */}

              <button
                type="button"
                style={{
                  ...styles.confirmYesBtn,
                  width:
                    "100%",
                }}
                onClick={() =>
                  executeDelete(
                    true
                  )
                }
              >
                HAPUS SISWA + LAPORAN
              </button>

              {/* HAPUS SISWA SAJA */}

              <button
                type="button"
                style={{
                  ...styles.confirmNoBtn,
                  width:
                    "100%",
                }}
                onClick={() =>
                  executeDelete(
                    false
                  )
                }
              >
                HAPUS SISWA SAJA
              </button>

              {/* BATAL */}

              <button
                type="button"
                style={{
                  width:
                    "100%",
                  background:
                    "#F5F9FF",
                  color:
                    "#0D47A1",
                  border:
                    "1px solid #90CAF9",
                  padding:
                    "11px",
                  borderRadius:
                    "10px",
                  fontWeight:
                    "800",
                  fontSize:
                    "13px",
                  cursor:
                    "pointer",
                }}
                onClick={() =>
                  setDeleteTarget(
                    null
                  )
                }
              >
                BATAL
              </button>

            </div>

          </div>
        </div>
      )}

      {/* =================================================
          ALERT
      ================================================= */}

      {alertConfig.isOpen && (
        <div
          style={
            styles.modalOverlay
          }
          role="presentation"
          onClick={
            handleCloseAlert
          }
        >

          <div
            style={
              styles.modalCard
            }
            role="dialog"
            aria-modal="true"
            aria-labelledby="data-siswa-alert-title"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* ICON */}

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

            {/* TITLE */}

            <h3
              id="data-siswa-alert-title"
              style={{
                fontSize:
                  "18px",
                fontWeight:
                  "800",
                marginBottom:
                  "8px",

                color:
                  alertConfig.type ===
                  "success"
                    ? "#0D47A1"
                    : alertConfig.type ===
                      "error"
                    ? "#C62828"
                    : "#E65100",
              }}
            >
              {alertConfig.title}
            </h3>

            {/* MESSAGE */}

            <p
              style={{
                color:
                  "#526579",
                fontSize:
                  "13px",
                marginBottom:
                  "18px",
                lineHeight:
                  "1.5",
              }}
            >
              {
                alertConfig.message
              }
            </p>

            {/* MENGERTI */}

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
            >
              Mengerti
            </button>

          </div>
        </div>
      )}

      {/* =================================================
          KEMBALI KE DASHBOARD
      ================================================= */}

      <button
        type="button"
        style={
          styles.backButton
        }
        onClick={() =>
          navigate(
            "/dashboard-admin"
          )
        }
      >
        Kembali ke Dashboard
      </button>

    </div>
  );
}

export default DataSiswa;