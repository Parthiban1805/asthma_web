import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const DoctorNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear any auth tokens/user data from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userData");
    
    // Redirect to login page
    navigate("/login");
  };

  const isActive = (path) => {
    return location.pathname === path ? "bg-blue-700" : "";
  };

  return (
    <nav className="bg-blue-600 text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center py-4">
            <span className="text-xl font-bold">MedCare</span>
            <span className="ml-2 text-sm bg-blue-800 px-2 py-1 rounded">Doctor Portal</span>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center w-full md:w-auto">
            <Link 
              to="/doctor-dashboard" 
              className={`px-4 py-2 hover:bg-blue-700 ${isActive("/doctor-dashboard")}`}
            >
              Dashboard
            </Link>
            <Link 
              to="/doctor-appointsystem" 
              className={`px-4 py-2 hover:bg-blue-700 ${isActive("/doctor-appointsystem")}`}
            >
              Appointments
            </Link>
            <Link 
              to="/doctor-patient-management" 
              className={`px-4 py-2 hover:bg-blue-700 ${isActive("/doctor-patient-management")}`}
            >
              Patients
            </Link>
            <Link 
              to="/doctor-medication" 
              className={`px-4 py-2 hover:bg-blue-700 ${isActive("/doctor-medication")}`}
            >
              Medications
            </Link>
            <Link 
              to="/doctor-profile" 
              className={`px-4 py-2 hover:bg-blue-700 ${isActive("/doctor-profile")}`}
            >
              Profile
            </Link>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 md:ml-4 mt-2 md:mt-0"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DoctorNavbar;
