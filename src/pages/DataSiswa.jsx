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
  // STATE DATA
  // ====================================================

  const [dataSiswa, setDataSiswa] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [selectedQr, setSelectedQr] =
    useState(null);

  // ====================================================
  // DELETE
  // ====================================================

  const [deleteTarget, setDeleteTarget] =
    useState(null);

  // ====================================================
  // ALERT
  // ====================================================

  const [alertConfig, setAlertConfig] =
    useState({
      isOpen: false,
      type: "success",
      title: "",
      message: "",
      onCloseCallback: null,
    });

  // ====================================================
  // SHOW ALERT
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

  // ====================================================
  // CLOSE ALERT
  // ====================================================

  const handleCloseAlert =
    useCallback(() => {
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
    }, [
      alertConfig.onCloseCallback,
    ]);

  // ====================================================
  // LOAD DATA SISWA
  //
  // Menggunakan get() satu kali.
  // Tidak menggunakan onValue() / listener realtime.
  // ====================================================

  const loadDataSiswa =
    useCallback(
      async (
        showInitialLoading = false
      ) => {
        try {
          if (showInitialLoading) {
            setLoading(true);
          }

          const siswaRef =
            ref(db, "siswa");

          const snapshot =
            await get(siswaRef);

          if (!snapshot.exists()) {
            setDataSiswa([]);
            return;
          }

          const data =
            snapshot.val();

          const list =
            Object.entries(data).map(
              ([key, value]) => ({
                id: key,
                ...value,
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
  // REFRESH MANUAL
  // ====================================================

  const refreshDataSiswa =
    useCallback(async () => {
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
    }, [
      loadDataSiswa,
      refreshing,
    ]);

  // ====================================================
  // CONFIRM DELETE
  // ====================================================

  const confirmDelete = (student) => {
    if (!student?.id) {
      return;
    }

    setDeleteTarget(student);
  };

  // ====================================================
  // EXECUTE DELETE
  // ====================================================

  const executeDelete = async (hapusLaporan = false) => {
    const student = deleteTarget;

    if (!student?.id) {
      return;
    }

    setDeleteTarget(null);

    try {
      const nisSiswa = String(
        student.nis || student.id || ""
      ).trim();

      const namaSiswa = String(
        student.nama || ""
      )
        .trim()
        .toLowerCase();

      if (hapusLaporan) {
        const pengaduanSnapshot = await get(
          ref(db, "pengaduan")
        );

        if (pengaduanSnapshot.exists()) {
          const dataPengaduan =
            pengaduanSnapshot.val();

          const laporanMilikSiswa =
            Object.entries(dataPengaduan).filter(
              ([, laporan]) => {
                const nisLaporan = String(
                  laporan?.nis || ""
                ).trim();

                const namaLaporan = String(
                  laporan?.nama || ""
                )
                  .trim()
                  .toLowerCase();

                if (nisSiswa && nisLaporan) {
                  return nisLaporan === nisSiswa;
                }

                return (
                  !nisLaporan &&
                  namaSiswa &&
                  namaLaporan === namaSiswa
                );
              }
            );

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

      await remove(
        ref(
          db,
          `siswa/${student.id}`
        )
      );

      setDataSiswa(
        (prev) =>
          prev.filter(
            (item) =>
              item.id !== student.id
          )
      );

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
  // DOWNLOAD QR CODE
  //
  // format:
  // "png" atau "jpg"
  // ====================================================

  const downloadQRCode =
    useCallback(
      (format = "png") => {
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
          // ==========================================
          // Ambil SVG QR
          // ==========================================

          const serializer =
            new XMLSerializer();

          const svgString =
            serializer.serializeToString(
              svg
            );

          // ==========================================
          // Ubah SVG menjadi Blob
          // ==========================================

          const svgBlob =
            new Blob(
              [svgString],
              {
                type:
                  "image/svg+xml;charset=utf-8",
              }
            );

          const url =
            URL.createObjectURL(
              svgBlob
            );

          const image =
            new Image();

          // ==========================================
          // Setelah SVG berhasil dimuat
          // ==========================================

          image.onload = () => {
            try {
              const canvas =
                document.createElement(
                  "canvas"
                );

              const size = 1000;

              canvas.width =
                size;

              canvas.height =
                size;

              const context =
                canvas.getContext(
                  "2d"
                );

              if (!context) {
                throw new Error(
                  "Canvas tidak tersedia."
                );
              }

              // ========================================
              // Background putih
              // Penting untuk JPG
              // ========================================

              context.fillStyle =
                "#FFFFFF";

              context.fillRect(
                0,
                0,
                size,
                size
              );

              // ========================================
              // Gambar QR ke canvas
              // ========================================

              context.drawImage(
                image,
                0,
                0,
                size,
                size
              );

              // ========================================
              // Tentukan format
              // ========================================

              const isJpg =
                format === "jpg";

              const extension =
                isJpg
                  ? "jpg"
                  : "png";

              const mimeType =
                isJpg
                  ? "image/jpeg"
                  : "image/png";

              // ========================================
              // Buat Data URL
              // ========================================

              const dataUrl =
                canvas.toDataURL(
                  mimeType,
                  0.95
                );

              // ========================================
              // Nama file
              //
              // Prioritas NIS.
              // ========================================

              const nis =
                String(
                  selectedQr.nis ||
                    selectedQr.id ||
                    "siswa"
                ).trim();

              const nama =
                String(
                  selectedQr.nama ||
                    "siswa"
                )
                  .trim()
                  .replace(
                    /[^a-zA-Z0-9_-]/g,
                    "_"
                  );

              const fileName =
                `QR-${nama}-${nis}.${extension}`;

              // ========================================
              // Download
              // ========================================

              const link =
                document.createElement(
                  "a"
                );

              link.download =
                fileName;

              link.href =
                dataUrl;

              document.body.appendChild(
                link
              );

              link.click();

              document.body.removeChild(
                link
              );

              // ========================================
              // Bersihkan object URL
              // ========================================

              URL.revokeObjectURL(
                url
              );
            } catch (error) {
              console.error(
                "Gagal membuat file QR:",
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
            }
          };

          // ==========================================
          // Jika gambar gagal dimuat
          // ==========================================

          image.onerror = () => {
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
            "Terjadi kesalahan saat membuat file QR."
          );
        }
      },
      [selectedQr, showAlert]
    );

  // ====================================================
  // SEARCH
  // ====================================================

  const hasilPencarian =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      if (!keyword) {
        return dataSiswa;
      }

      return dataSiswa.filter(
        (item) => {
          return (
            String(
              item.nama || ""
            )
              .toLowerCase()
              .includes(keyword) ||

            String(
              item.nis || ""
            )
              .toLowerCase()
              .includes(keyword) ||

            String(
              item.kelas || ""
            )
              .toLowerCase()
              .includes(keyword)
          );
        }
      );
    }, [
      dataSiswa,
      search,
    ]);

  // ====================================================
  // STYLE
  // ====================================================

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#F4FBEE",
      padding: "20px 15px",
      fontFamily:
        "'Segoe UI', Roboto, sans-serif",
      boxSizing: "border-box",
    },

    header: {
      background: "#2E7D32",
      color: "#fff",
      padding: "20px",
      borderRadius: "20px",
      marginBottom: "20px",
      display: "flex",
      justifyContent:
        "space-between",
      alignItems: "center",
      boxShadow:
        "0 4px 12px rgba(0,0,0,0.06)",
      flexWrap: "wrap",
      gap: "12px",
    },

    title: {
      fontSize: "22px",
      fontWeight: "800",
      margin: 0,
    },

    topButton: {
      background: "#FFEB3B",
      color: "#1B5E20",
      border: "none",
      padding: "10px 16px",
      borderRadius: "12px",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: "800",
      boxShadow:
        "0 3px 0 #FBC02D",
    },

    backButton: {
      background: "#FFEB3B",
      color: "#1B5E20",
      border: "none",
      padding: "12px 20px",
      borderRadius: "12px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "800",
      boxShadow:
        "0 3px 0 #FBC02D",
      marginTop: "15px",
    },

    search: {
      width: "100%",
      padding: "12px 14px",
      borderRadius: "12px",
      border:
        "2px solid #C8E6C9",
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
        "2px solid #C8E6C9",
    },

    table: {
      width: "100%",
      borderCollapse: "collapse",
      minWidth: "800px",
    },

    th: {
      background: "#2E7D32",
      color: "#fff",
      padding: "14px 12px",
      textAlign: "center",
      fontSize: "13px",
      fontWeight: "800",
    },

    td: {
      padding: "12px",
      borderBottom:
        "1px solid #E8F5E9",
      textAlign: "center",
      fontSize: "13px",
      color: "#2E3D29",
    },

    qrBtn: {
      background: "#2E7D32",
      color: "#fff",
      border: "none",
      padding: "6px 12px",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "700",
      fontSize: "12px",
    },

    editButton: {
      background: "#FFEB3B",
      color: "#1B5E20",
      border: "none",
      padding: "6px 12px",
      borderRadius: "8px",
      cursor: "pointer",
      marginRight: "6px",
      fontWeight: "800",
      fontSize: "12px",
      boxShadow:
        "0 2px 0 #FBC02D",
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
      color: "#556B4D",
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
      justifyContent:
        "center",
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
        "2px solid #C8E6C9",
      boxSizing: "border-box",
      maxHeight: "90vh",
      overflowY: "auto",
    },

    printBtn: {
      background: "#2E7D32",
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
        "0 3px 0 #1B5E20",
      textTransform:
        "uppercase",
    },

    closeBtn: {
      background: "#FFEB3B",
      color: "#1B5E20",
      border: "none",
      padding: "12px",
      borderRadius: "12px",
      cursor: "pointer",
      fontWeight: "800",
      marginTop: "10px",
      width: "100%",
      fontSize: "13px",
      boxShadow:
        "0 3px 0 #FBC02D",
    },

    modalBtnGroup: {
      display: "flex",
      gap: "10px",
      marginTop: "20px",
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
      textTransform:
        "uppercase",
    },

    confirmNoBtn: {
      flex: 1,
      background: "#FFEB3B",
      color: "#1B5E20",
      border: "none",
      padding: "11px",
      borderRadius: "10px",
      fontWeight: "800",
      fontSize: "13px",
      cursor: "pointer",
      boxShadow:
        "0 3px 0 #FBC02D",
      textTransform:
        "uppercase",
    },

    alertIconWrapper: (type) => ({
      width: "60px",
      height: "60px",
      borderRadius: "50%",
      margin:
        "0 auto 12px auto",
      display: "flex",
      justifyContent:
        "center",
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
      textTransform:
        "uppercase",

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

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div style={styles.page}>

      {/* ==============================================
          HEADER
      =============================================== */}

      <div style={styles.header}>

        <h1 style={styles.title}>
          Data Siswa
        </h1>

        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >

          {/* REFRESH */}

          <button
            type="button"
            style={{
              ...styles.topButton,

              opacity:
                refreshing
                  ? 0.6
                  : 1,

              cursor:
                refreshing
                  ? "not-allowed"
                  : "pointer",
            }}
            onClick={
              refreshDataSiswa
            }
            disabled={
              refreshing
            }
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

      {/* ==============================================
          SEARCH
      =============================================== */}

      <input
        type="text"
        placeholder="Cari Nama, NIS atau Kelas..."
        value={search}
        onChange={(e) =>
          setSearch(
            e.target.value
          )
        }
        style={styles.search}
        autoComplete="off"
      />

      {/* ==============================================
          TABLE
      =============================================== */}

      {loading ? (
        <div
          style={{
            background: "#fff",
            padding:
              "35px 20px",
            borderRadius: "18px",
            textAlign: "center",
            color: "#1B5E20",
            border:
              "2px solid #C8E6C9",
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
                  style={
                    styles.th
                  }
                >
                  No
                </th>

                <th
                  style={
                    styles.th
                  }
                >
                  Nama Lengkap
                </th>

                <th
                  style={
                    styles.th
                  }
                >
                  NIS
                </th>

                <th
                  style={
                    styles.th
                  }
                >
                  Kelas
                </th>

                <th
                  style={
                    styles.th
                  }
                >
                  Jenis Kelamin
                </th>

                <th
                  style={
                    styles.th
                  }
                >
                  No HP Orang Tua
                </th>

                <th
                  style={
                    styles.th
                  }
                >
                  QR Code
                </th>

                <th
                  style={
                    styles.th
                  }
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
                        {item.nis ||
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
                            confirmDelete(item)
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

      {/* ==============================================
          MODAL QR CODE
      =============================================== */}

      {selectedQr && (
        <div
          style={
            styles.modalOverlay
          }
          onClick={() =>
            setSelectedQr(
              null
            )
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
                color: "#1B5E20",
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
                  "#556B4D",
                fontSize:
                  "13px",
                marginBottom:
                  "18px",
              }}
            >
              Kelas:{" "}
              {selectedQr.kelas ||
                "-"}{" "}
              | NIS:{" "}
              {selectedQr.nis ||
                selectedQr.id ||
                "-"}
            </p>

            {/* ========================================
                QR CODE
                ========================================

                PENTING:
                QR SEKARANG BERISI NIS,
                BUKAN FIREBASE PUSH KEY.
            */}

            <div
              style={{
                background:
                  "#fff",

                padding:
                  "15px",

                borderRadius:
                  "12px",

                border:
                  "1px solid #C8E6C9",

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
                  selectedQr.nis ||
                    ""
                )}

                size={300}

                bgColor="#FFFFFF"

                fgColor="#000000"

                level="H"
              />
            </div>

            {/* ========================================
                DOWNLOAD PNG
            ======================================== */}

            <button
              type="button"
              style={
                styles.printBtn
              }
              onClick={() =>
                downloadQRCode(
                  "png"
                )
              }
            >
              Download PNG
            </button>

            {/* ========================================
                DOWNLOAD JPG
            ======================================== */}

            <button
              type="button"
              style={{
                ...styles.printBtn,
                background:
                  "#1565C0",
                boxShadow:
                  "0 3px 0 #0D47A1",
              }}
              onClick={() =>
                downloadQRCode(
                  "jpg"
                )
              }
            >
              Download JPG
            </button>

            {/* ========================================
                TUTUP
            ======================================== */}

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

      {/* ==============================================
          MODAL KONFIRMASI HAPUS
      =============================================== */}

      {deleteTargetId && (
        <div style={{ ...styles.modalOverlay, background: "rgba(0,0,0,0.6)" }} onClick={() => setDeleteTargetId(null)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.alertIconWrapper("warning")}></div>
              <div
                style={
                  styles.alertIconWrapper(
                    "warning"
                  )
                }
            >
                ⚠️
            </div>
            <h3
              style={{
                color: "#C62828",
                fontSize: "18px",
                fontWeight: "800",
                marginBottom: "8px",
              }}
            >
              Hapus Data Siswa?
            </h3>

            <p
              style={{
                color: "#556B4D",
                fontSize: "13px",
                marginBottom: "10px",
                lineHeight: "1.5",
              }}
            >
              Hapus data siswa{" "}
              <strong>
                {deleteTarget.nama || "Siswa"}
              </strong>
              {deleteTarget.nis
                ? ` (NIS ${deleteTarget.nis})`
                : ""}?
            </p>

            <p
              style={{
                color: "#556B4D",
                fontSize: "13px",
                marginBottom: "6px",
                lineHeight: "1.5",
                fontWeight: "700",
              }}
            >
              Pilih tindakan:
            </p>

            <p
              style={{
                color: "#7A7A7A",
                fontSize: "12px",
                margin: "0",
                lineHeight: "1.5",
              }}
            >
              Jika laporan ikut dihapus, semua laporan milik
              siswa ini akan ikut terhapus.
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                marginTop: "20px",
              }}
            >
              <button
                type="button"
                style={{
                  ...styles.confirmYesBtn,
                  width: "100%",
                }}
                onClick={() =>
                  executeDelete(true)
                }
              >
                HAPUS SISWA + LAPORAN
              </button>

              <button
                type="button"
                style={{
                  ...styles.confirmNoBtn,
                  width: "100%",
                }}
                onClick={() =>
                  executeDelete(false)
                }
              >
                HAPUS SISWA SAJA
              </button>

              <button
                type="button"
                style={{
                  width: "100%",
                  background: "#F1F8E9",
                  color: "#1B5E20",
                  border: "1px solid #A5D6A7",
                  padding: "11px",
                  borderRadius: "10px",
                  fontWeight: "800",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
                onClick={() =>
                  setDeleteTarget(null)
                }
              >
                BATAL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================
          ALERT
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
            aria-labelledby="data-siswa-alert-title"
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
              style={{
                color:
                  "#556B4D",
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

      {/* ==============================================
          KEMBALI KE DASHBOARD
      =============================================== */}

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