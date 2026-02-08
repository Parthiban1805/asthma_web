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
import CaretakerDashboard from "./components/caretaker/caretaker";
import VideoCall from "./components/video/videocall";  
import PatientVideoCall from "./components/Patient/Patientvideocall";
import CaretakerDetail from "./components/Admin/CaretakerDetail ";

function App() {
  return (
    <Router>
      <Routes>
        {/* Authentication */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Login />} />

        {/* Doctor Routes */}
        <Route path="/doctor-dashboard" element={<Dashboard />} />
        <Route path="/doctor-profile" element={<Profile />} />
        <Route path="/doctor-medication" element={<MedicationManagement />} />
        <Route path="/doctor-appointsystem" element={<AppointmentSystem />} />
        <Route path="/doctor-patient-management" element={<PatientManagement />} />
        <Route path="/video-call/:roomID" element={<VideoCall />} />

        {/* Patient Routes */}
        <Route path="/patient-dashboard" element={<PatientDashboard />} />
        <Route path="/patient-video-call/:roomID" element={<PatientVideoCall />} />

        {/* Admin Routes */}
        <Route path="/admin-dashboard" element={<AdminDasboard/>} />
        
        {/* Admin Details */}
        <Route path="/admin-patient/:id" element={<PatientDetails/>} />
        <Route path="/admin-doctor/:id" element={<DoctorDetails/>} />
        <Route path="/admin-caretaker/:id" element={<CaretakerDetail/>} />

        {/* Caretaker Routes */}
        <Route path="/caretaker-dashboard" element={<CaretakerDashboard />} />

        {/* --- MISSING ROUTES FIXED BELOW --- */}
        
        {/* Fix for: No routes matched location "/patient/PAT888" */}
        {/* Allows DoctorDetails to view Patient Details */}
        <Route path="/patient/:id" element={<PatientDetails />} />

        {/* Fix for: No routes matched location "/assign-patient/..." */}
        {/* Maps back to CaretakerDetail or you can replace with <AssignPatient /> if you have that component */}
        <Route path="/assign-patient/:id" element={<CaretakerDetail />} />

      </Routes>
    </Router>
  );
}

export default App;