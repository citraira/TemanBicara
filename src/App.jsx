import { Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import LoginSiswa from "./pages/LoginSiswa";
import LoginAdmin from "./pages/LoginAdmin";

import DashboardSiswa from "./pages/DashboardSiswa";
import DashboardAdmin from "./pages/DashboardAdmin";

import FormPengaduan from "./pages/FormPengaduan";
import Riwayat from "./pages/Riwayat";
import Edukasi from "./pages/Edukasi";
import KelolaEdukasi from "./pages/KelolaEdukasi";
import ScanQR from "./pages/ScanQR";
import HubungiGuru from "./pages/HubungiGuru";

import DataSiswa from "./pages/DataSiswa";
import TambahSiswa from "./pages/TambahSiswa";
import EditSiswa from "./pages/EditSiswa";
import DaftarPengaduan from "./pages/DaftarPengaduan";
import PengaturanAdmin from "./pages/PengaturanAdmin";
import LupaPassword from "./pages/LupaPassword";

import InstallPWA from "./components/InstallPWA";

function App() {
  return (
    <>
      <Routes>
        {/* Halaman utama */}
        <Route
          path="/"
          element={<LandingPage />}
        />

        {/* Login */}
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

        {/* Dashboard */}
        <Route
          path="/dashboard-siswa"
          element={<DashboardSiswa />}
        />

        <Route
          path="/dashboard-admin"
          element={<DashboardAdmin />}
        />

        {/* Siswa */}
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

        {/* Admin */}
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

        {/* Data Siswa */}
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

      {/* PWA install prompt global */}
      <InstallPWA />
    </>
  );
}

export default App;