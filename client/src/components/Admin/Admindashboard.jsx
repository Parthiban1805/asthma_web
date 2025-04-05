import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsRes, doctorsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/admin/patients'),
          axios.get('http://localhost:5000/api/admin/doctors')
        ]);
        
        setPatients(patientsRes.data);
        setDoctors(doctorsRes.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePatientClick = (patientId) => {
    navigate(`/admin-patient/${patientId}`);
};

  const handleDoctorClick = (doctorId) => {
    navigate(`/admin-doctor/${doctorId}`);
};

  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Card 1 - Total Patients */}
        <div className="border rounded-lg shadow-sm p-4">
          <div className="flex items-center pt-2">
            <div className="p-2 rounded-full bg-blue-100 mr-4 flex items-center justify-center">
              <span className="text-blue-600 font-bold text-lg">👥</span>
            </div>
            <div>
              <div className="text-sm text-gray-500">Total Patients</div>
              <div className="text-xl font-bold">{patients.length}</div>
            </div>
          </div>
        </div>
        
        {/* Card 2 - Total Doctors */}
        <div className="border rounded-lg shadow-sm p-4">
          <div className="flex items-center pt-2">
            <div className="p-2 rounded-full bg-green-100 mr-4 flex items-center justify-center">
              <span className="text-green-600 font-bold text-lg">👨‍⚕️</span>
            </div>
            <div>
              <div className="text-sm text-gray-500">Total Doctors</div>
              <div className="text-xl font-bold">{doctors.length}</div>
            </div>
          </div>
        </div>
        
        {/* Card 3 - Appointments */}
        <div className="border rounded-lg shadow-sm p-4">
          <div className="flex items-center pt-2">
            <div className="p-2 rounded-full bg-purple-100 mr-4 flex items-center justify-center">
              <span className="text-purple-600 font-bold text-lg">📅</span>
            </div>
            <div>
              <div className="text-sm text-gray-500">Appointments</div>
              <div className="text-xl font-bold">0</div>
            </div>
          </div>
        </div>
        
        {/* Card 4 - Critical Cases */}
        <div className="border rounded-lg shadow-sm p-4">
          <div className="flex items-center pt-2">
            <div className="p-2 rounded-full bg-red-100 mr-4 flex items-center justify-center">
              <span className="text-red-600 font-bold text-lg">⚠️</span>
            </div>
            <div>
              <div className="text-sm text-gray-500">Critical Cases</div>
              <div className="text-xl font-bold">0</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Custom Tabs implementation */}
      <div className="w-full">
        <div className="flex border-b mb-4">
          <button 
            className={`px-4 py-2 focus:outline-none cursor-pointer ${activeTab === 0 ? 'border-b-2 border-blue-500 font-medium' : ''}`}
            onClick={() => setActiveTab(0)}
          >
            Patients
          </button>
          <button 
            className={`px-4 py-2 focus:outline-none cursor-pointer ${activeTab === 1 ? 'border-b-2 border-blue-500 font-medium' : ''}`}
            onClick={() => setActiveTab(1)}
          >
            Doctors
          </button>
        </div>
        
        {/* Tab Content */}
        <div className="tab-content">
          {/* Patients Tab Panel */}
          {activeTab === 0 && (
            <div className="border rounded-lg shadow-sm">
              <div className="border-b p-4">
                <h2 className="text-lg font-semibold">Patient List</h2>
              </div>
              <div className="p-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age/DOB</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {patients.map((patient) => (
                        <tr 
                          key={patient._id} 
                          onClick={() => handlePatientClick(patient.patientId)}
                          className="hover:bg-gray-50 cursor-pointer"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.patientId}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.gender || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.dateOfBirth || (patient.age ? `${patient.age} yrs` : 'N/A')}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.phone}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {/* Doctors Tab Panel */}
          {activeTab === 1 && (
            <div className="border rounded-lg shadow-sm">
              <div className="border-b p-4">
                <h2 className="text-lg font-semibold">Doctor List</h2>
              </div>
              <div className="p-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {doctors.map((doctor) => (
                        <tr 
                          key={doctor._id} 
                          onClick={() => handleDoctorClick(doctor.doctorId)}
                          className="hover:bg-gray-50 cursor-pointer"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doctor.doctorId}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doctor.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doctor.specialization || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
