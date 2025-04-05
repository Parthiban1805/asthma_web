import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./components/register/register";
import Login from "./components/login/login";
import Dashboard from "./components/doctor/Dashboard";
import MedicationManagement from "./components/doctor/MedicationManagement";
import Profile from "./components/doctor/Profile";
import AppointmentSystem from "./components/doctor/AppointmentSystem";
import PatientManagement from "./components/doctor/PatientManagement";
import PatientDashboard from "./components/Patient/patientDashboard";
import AdminDasboard from './components/Admin/Admindashboard'
import PatientDetails from './components/Admin/PatientDetails'
import DoctorDetails from './components/Admin/DoctorDetails'
import VideoCall from "./components/doctor/videocall";  // Import VideoCall component
import PatientVideoCall from './components/Patient/Patientvideocall'
import CaretakerDashboard from "./components/caretaker/caretaker";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/doctor-dashboard" element={<Dashboard />} />
        <Route path="/doctor-profile" element={<Profile />} />
        <Route path="/doctor-medication" element={<MedicationManagement />} />
        <Route path="/doctor-appointsystem" element={<AppointmentSystem />} />
        <Route path="/doctor-patient-management" element={<PatientManagement />} />
        <Route path="/patient-dashboard" element={<PatientDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDasboard/>} />
        <Route path="/admin-patient/:id" element={<PatientDetails/>} />
        <Route path="/admin-doctor/:id" element={<DoctorDetails/>} />
        <Route path="/video-call" element={<VideoCall />} />
        <Route path="/patient-video-call" element={<PatientVideoCall />} />
        <Route path="/caretaker-dashboard" element={<CaretakerDashboard />} />

        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;