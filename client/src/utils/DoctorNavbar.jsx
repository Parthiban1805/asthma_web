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
    <nav className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row justify-between items-center">
          <div className="flex items-center py-4">
            <div className="flex items-center space-x-3">
              <div>
                <span className="text-xl font-bold text-white">MedCare</span>
                <span className="ml-3 text-xs bg-blue-800 text-blue-100 px-3 py-1 rounded-full font-medium">
                  Doctor Portal
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-center w-full lg:w-auto pb-4 lg:pb-0">
            <div className="flex flex-col lg:flex-row lg:space-x-1">
              <Link 
                to="/doctor-dashboard" 
                className={`px-4 py-2.5 text-white font-medium rounded-lg transition-all duration-200 hover:bg-blue-700 ${isActive("/doctor-dashboard")}`}
              >
                <span className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>Dashboard</span>
                </span>
              </Link>
              <Link 
                to="/doctor-appointsystem" 
                className={`px-4 py-2.5 text-white font-medium rounded-lg transition-all duration-200 hover:bg-blue-700 ${isActive("/doctor-appointsystem")}`}
              >
                <span className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Appointments</span>
                </span>
              </Link>
              <Link 
                to="/doctor-patient-management" 
                className={`px-4 py-2.5 text-white font-medium rounded-lg transition-all duration-200 hover:bg-blue-700 ${isActive("/doctor-patient-management")}`}
              >
                <span className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Patients</span>
                </span>
              </Link>
              <Link 
                to="/doctor-medication" 
                className={`px-4 py-2.5 text-white font-medium rounded-lg transition-all duration-200 hover:bg-blue-700 ${isActive("/doctor-medication")}`}
              >
                <span className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  <span>Medications</span>
                </span>
              </Link>
              <Link 
                to="/doctor-profile" 
                className={`px-4 py-2.5 text-white font-medium rounded-lg transition-all duration-200 hover:bg-blue-700 ${isActive("/doctor-profile")}`}
              >
                <span className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Profile</span>
                </span>
              </Link>
            </div>
            <button 
              onClick={handleLogout}
              className="px-5 py-2.5 text-white font-medium bg-red-600 hover:bg-red-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 lg:ml-3 mt-2 lg:mt-0 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-blue-600"
            >
              <span className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DoctorNavbar;