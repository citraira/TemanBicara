import { Routes, Route } from "react-router-dom";

// ================================
// HALAMAN UTAMA & LOGIN
// ================================

import LandingPage from "./pages/LandingPage";
import LoginSiswa from "./pages/LoginSiswa";
import LoginAdmin from "./pages/LoginAdmin";
import LupaPassword from "./pages/LupaPassword";

// ================================
// DASHBOARD
// ================================

import DashboardSiswa from "./pages/DashboardSiswa";
import DashboardAdmin from "./pages/DashboardAdmin";

// ================================
// HALAMAN SISWA
// ================================

import FormPengaduan from "./pages/FormPengaduan";
import Riwayat from "./pages/Riwayat";
import Edukasi from "./pages/Edukasi";
import HubungiGuru from "./pages/HubungiGuru";
import ScanQR from "./pages/ScanQR";

// ================================
// HALAMAN ADMIN
// ================================

import KelolaEdukasi from "./pages/KelolaEdukasi";
import DaftarPengaduan from "./pages/DaftarPengaduan";
import PengaturanAdmin from "./pages/PengaturanAdmin";

// ================================
// DATA SISWA
// ================================

import DataSiswa from "./pages/DataSiswa";
import TambahSiswa from "./pages/TambahSiswa";
import EditSiswa from "./pages/EditSiswa";

// ================================
// COMPONENT GLOBAL
// ================================

import InstallPWA from "./components/InstallPWA";

function App() {
  return (
    <>
      <Routes>
        {/* =========================
            HALAMAN UTAMA
        ========================== */}

        <Route
          path="/"
          element={<LandingPage />}
        />

        {/* =========================
            LOGIN
        ========================== */}

        <Route
          path="/login-siswa"
          element={<LoginSiswa />}
        />

        <Route
          path="/login-admin"
          element={<LoginAdmin />}
        />

        <Route
          path="/lupa-password"
          element={<LupaPassword />}
        />

        {/* =========================
            DASHBOARD
        ========================== */}

        <Route
          path="/dashboard-siswa"
          element={<DashboardSiswa />}
        />

        <Route
          path="/dashboard-admin"
          element={<DashboardAdmin />}
        />

        {/* =========================
            SISWA
        ========================== */}

        <Route
          path="/pengaduan"
          element={<FormPengaduan />}
        />

        <Route
          path="/riwayat"
          element={<Riwayat />}
        />

        <Route
          path="/edukasi"
          element={<Edukasi />}
        />

        <Route
          path="/hubungi-guru"
          element={<HubungiGuru />}
        />

        <Route
          path="/scan-qr"
          element={<ScanQR />}
        />

        {/* =========================
            ADMIN
        ========================== */}

        <Route
          path="/kelola-edukasi"
          element={<KelolaEdukasi />}
        />

        <Route
          path="/daftar-pengaduan"
          element={<DaftarPengaduan />}
        />

        <Route
          path="/pengaturan-admin"
          element={<PengaturanAdmin />}
        />

        {/* =========================
            DATA SISWA
        ========================== */}

        <Route
          path="/data-siswa"
          element={<DataSiswa />}
        />

        <Route
          path="/tambah-siswa"
          element={<TambahSiswa />}
        />

        <Route
          path="/edit-siswa/:id"
          element={<EditSiswa />}
        />
      </Routes>

      {/* =========================
          PWA INSTALL PROMPT
          GLOBAL
      ========================== */}

      <InstallPWA />
    </>
  );
}

export default App;