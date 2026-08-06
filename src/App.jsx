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
import PengaturanAdmin from "./pages/PengaturanAdmin"; // <-- DIPERBAIKI DI SINI


function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route path="/login-siswa" element={<LoginSiswa />} />
      <Route path="/login-admin" element={<LoginAdmin />} />

      <Route path="/dashboard-siswa" element={<DashboardSiswa />} />
      <Route path="/dashboard-admin" element={<DashboardAdmin />} />
      <Route path="/scan-qr" element={<ScanQR />} />

      <Route path="/pengaduan" element={<FormPengaduan />} />
      <Route path="/riwayat" element={<Riwayat />} />
      <Route path="/edukasi" element={<Edukasi />} />
      <Route path="/kelola-edukasi" element={<KelolaEdukasi />} /> 
      <Route path="/hubungi-guru" element={<HubungiGuru />} />
      <Route path="/pengaturan-admin" element={<PengaturanAdmin />} />

      <Route path="/daftar-pengaduan" element={<DaftarPengaduan />} />

      {/* DATA SISWA */}
      <Route path="/data-siswa" element={<DataSiswa />} />
      <Route path="/tambah-siswa" element={<TambahSiswa />} />
      <Route path="/edit-siswa/:id" element={<EditSiswa />} />
    </Routes>
  );
}

export default App;