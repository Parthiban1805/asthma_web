import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../login/animation.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [userType, setUserType] = useState("");
  const navigate = useNavigate();
  
  // Doctor specific states
  const [doctorId, setDoctorId] = useState("");
  const [hospital, setHospital] = useState("");
  const [specialization, setSpecialization] = useState("");
  
  // Caretaker specific states
  const [patientId, setPatientId] = useState("");
  const [relationship, setRelationship] = useState("");
  
  // Patient specific states
  const [emergencyContact, setEmergencyContact] = useState("");
  
  // Admin specific states
  const [adminId, setAdminId] = useState("");
  const [department, setDepartment] = useState("General Administration");

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
  
    const userData = {
      username: name,
      fullName: name,
      email,
      password,
      phone,
      role: userType,
    };
    
    // Add role-specific fields based on selected role
    if (userType === "doctor") {
      userData.doctorId = doctorId;
      userData.hospital = hospital;
      userData.specialization = specialization;
    }
    else if (userType === "caretaker") {
      if (patientId) {
        userData.patientId = patientId;
      }
      userData.relationship = relationship;
    }
    else if (userType === "patient") {
      userData.patientId = patientId;
      userData.emergencyContact = emergencyContact;
    }
    else if (userType === "admin") {
      userData.adminId = adminId;
      userData.department = department;
    }
  
    try {
      const response = await axios.post("http://localhost:5000/api/auth/register", userData);
      console.log("Registration successful:", response.data);
      navigate("/login");
    } catch (err) {
      console.error("Registration failed:", err.response?.data?.message || err.message);
      alert("Registration failed: " + (err.response?.data?.message || "Server error"));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-50 to-teal-100">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-0 right-0 w-56 h-56 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      </div>
      
      <div className="w-full max-w-md relative">
        <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Create an Account</h1>
            <p className="text-gray-600 mt-1">Join our healthcare platform</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                id="phone"
                type="tel"
                placeholder="555-123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="userType" className="block text-sm font-medium text-gray-700">Role</label>
              <select 
                id="userType"
                value={userType} 
                onChange={(e) => setUserType(e.target.value)} 
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select your role</option>
                <option value="doctor">Doctor</option>
                <option value="patient">Patient</option>
                <option value="caretaker">Caretaker</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            {/* Doctor specific fields */}
            {userType === "doctor" && (
              <>
                <div className="space-y-2">
                  <label htmlFor="hospital" className="block text-sm font-medium text-gray-700">Hospital</label>
                  <input
                    id="hospital"
                    type="text"
                    placeholder="Central Hospital"
                    value={hospital}
                    onChange={(e) => setHospital(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">Specialization</label>
                  <select
                    id="specialization"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select specialization</option>
                    <option value="Pulmonologist">Pulmonologist</option>
                    <option value="Allergist">Allergist</option>
                    <option value="General Practitioner">General Practitioner</option>
                    <option value="Pediatrician">Pediatrician</option>
                    <option value="Internal Medicine">Internal Medicine</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="doctorId" className="block text-sm font-medium text-gray-700">Doctor ID (optional)</label>
                  <input
                    id="doctorId"
                    type="text"
                    placeholder="D001"
                    value={doctorId}
                    onChange={(e) => setDoctorId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500">A unique ID will be generated if not provided</p>
                </div>
              </>
            )}

            {/* Caretaker specific fields */}
            {userType === "caretaker" && (
              <>
                <div className="space-y-2">
                  <label htmlFor="patientId" className="block text-sm font-medium text-gray-700">Patient ID (optional)</label>
                  <input
                    id="patientId"
                    type="text"
                    placeholder="P001"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500">Enter the ID of the patient you are caring for</p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="relationship" className="block text-sm font-medium text-gray-700">Relationship to Patient</label>
                  <select
                    id="relationship"
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select relationship</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Parent">Parent</option>
                    <option value="Child">Child</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Friend">Friend</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </>
            )}

            {/* Patient specific fields */}
            {userType === "patient" && (
              <>
                <div className="space-y-2">
                  <label htmlFor="patientId" className="block text-sm font-medium text-gray-700">Patient ID (optional)</label>
                  <input
                    id="patientId"
                    type="text"
                    placeholder="P001"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500">A unique ID will be generated if not provided</p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700">Emergency Contact (optional)</label>
                  <input
                    id="emergencyContact"
                    type="tel"
                    placeholder="555-123-4567"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </>
            )}

            {/* Admin specific fields */}
            {userType === "admin" && (
              <>
                <div className="space-y-2">
                  <label htmlFor="adminId" className="block text-sm font-medium text-gray-700">Admin ID (optional)</label>
                  <input
                    id="adminId"
                    type="text"
                    placeholder="ADMIN001"
                    value={adminId}
                    onChange={(e) => setAdminId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500">A unique ID will be generated if not provided</p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department</label>
                  <select
                    id="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="General Administration">General Administration</option>
                    <option value="IT Support">IT Support</option>
                    <option value="Medical Operations">Medical Operations</option>
                    <option value="User Management">User Management</option>
                    <option value="Data Analysis">Data Analysis</option>
                    <option value="System Administration">System Administration</option>
                  </select>
                </div>
              </>
            )}

            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
            >
              Create Account
            </button>
            
            <div className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Log in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;