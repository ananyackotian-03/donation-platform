import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Login from "./pages/Login";
import DonorDashboard from "./pages/DonorDashboard";
import AddDonation from "./pages/AddDonation";
import ViewDonations from "./pages/ViewDonations";
import DonationStatus from "./pages/DonationStatus";
import DonationMap from "./pages/DonationMap";
import OrgDashboard from "./pages/OrgDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/donor-dashboard" element={<DonorDashboard />} />
          <Route path="/add-donation" element={<AddDonation />} />
          <Route path="/my-donations" element={<ViewDonations />} />
          <Route path="/donation-status" element={<DonationStatus />} />
          <Route path="/map" element={<DonationMap />} />
          <Route path="/org-dashboard" element={<OrgDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}

export default App;