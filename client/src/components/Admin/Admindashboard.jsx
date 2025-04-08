import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [caretakers, setCaretakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [patientsRes, doctorsRes, caretakersRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/patients'),
        axios.get('http://localhost:5000/api/admin/doctors'),
        axios.get('http://localhost:5000/api/admin/caretakers')
      ]);
      
      setPatients(patientsRes.data);
      setDoctors(doctorsRes.data);
      setCaretakers(caretakersRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handlePatientClick = (patientId) => {
    navigate(`/admin-patient/${patientId}`);
  };

  const handleDoctorClick = (doctorId) => {
    navigate(`/admin-doctor/${doctorId}`);
  };

  const handleCaretakerClick = (caretakerId) => {
    navigate(`/admin-caretaker/${caretakerId}`);
  };



  

  const handleDeletePatient = async (e, patientId) => {
    e.stopPropagation(); // Prevent row click event
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/patients/${patientId}`);
        setPatients(patients.filter(patient => patient.patientId !== patientId));
      } catch (error) {
        console.error('Error deleting patient:', error);
      }
    }
  };

  const handleDeleteDoctor = async (e, doctorId) => {
    e.stopPropagation(); // Prevent row click event
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/doctors/${doctorId}`);
        setDoctors(doctors.filter(doctor => doctor.doctorId !== doctorId));
      } catch (error) {
        console.error('Error deleting doctor:', error);
      }
    }
  };

  const handleDeleteCaretaker = async (e, caretakerId) => {
    e.stopPropagation(); // Prevent row click event
    if (window.confirm('Are you sure you want to delete this caretaker?')) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/caretakers/${caretakerId}`);
        setCaretakers(caretakers.filter(caretaker => caretaker._id !== caretakerId));
      } catch (error) {
        console.error('Error deleting caretaker:', error);
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Dashboard Overview</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Card 1 - Total Patients */}
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500 transition-all hover:shadow-lg">
            <div className="flex items-center pt-2">
              <div className="p-3 rounded-full bg-blue-100 mr-4 flex items-center justify-center">
                <span className="text-blue-600 font-bold text-lg">👥</span>
              </div>
              <div>
                <div className="text-sm text-gray-500 font-medium">Total Patients</div>
                <div className="text-2xl font-bold text-gray-800">{patients.length}</div>
              </div>
            </div>
          </div>
          
          {/* Card 2 - Total Doctors */}
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500 transition-all hover:shadow-lg">
            <div className="flex items-center pt-2">
              <div className="p-3 rounded-full bg-green-100 mr-4 flex items-center justify-center">
                <span className="text-green-600 font-bold text-lg">👨‍⚕️</span>
              </div>
              <div>
                <div className="text-sm text-gray-500 font-medium">Total Doctors</div>
                <div className="text-2xl font-bold text-gray-800">{doctors.length}</div>
              </div>
            </div>
          </div>
          
          {/* Card 3 - Total Caretakers */}
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-amber-500 transition-all hover:shadow-lg">
            <div className="flex items-center pt-2">
              <div className="p-3 rounded-full bg-amber-100 mr-4 flex items-center justify-center">
                <span className="text-amber-600 font-bold text-lg">🧑‍⚕️</span>
              </div>
              <div>
                <div className="text-sm text-gray-500 font-medium">Total Caretakers</div>
                <div className="text-2xl font-bold text-gray-800">{caretakers.length}</div>
              </div>
            </div>
          </div>
          
          {/* Card 4 - Appointments */}
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500 transition-all hover:shadow-lg">
            <div className="flex items-center pt-2">
              <div className="p-3 rounded-full bg-purple-100 mr-4 flex items-center justify-center">
                <span className="text-purple-600 font-bold text-lg">📅</span>
              </div>
              <div>
                <div className="text-sm text-gray-500 font-medium">Appointments</div>
                <div className="text-2xl font-bold text-gray-800">0</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Custom Tabs implementation */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="flex border-b px-4">
            <button 
              className={`px-6 py-4 focus:outline-none cursor-pointer font-medium transition-colors ${activeTab === 0 ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
              onClick={() => setActiveTab(0)}
            >
              Patients
            </button>
            <button 
              className={`px-6 py-4 focus:outline-none cursor-pointer font-medium transition-colors ${activeTab === 1 ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
              onClick={() => setActiveTab(1)}
            >
              Doctors
            </button>
            <button 
              className={`px-6 py-4 focus:outline-none cursor-pointer font-medium transition-colors ${activeTab === 2 ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
              onClick={() => setActiveTab(2)}
            >
              Caretakers
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="p-6">
            {/* Patients Tab Panel */}
            {activeTab === 0 && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Patient List</h2>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search patients..."
                      className="pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="absolute left-3 top-3 text-gray-400">
                      🔍
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age/DOB</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {patients.map((patient) => (
                        <tr 
                          key={patient._id} 
                          onClick={() => handlePatientClick(patient.patientId)}
                          className="hover:bg-blue-50 cursor-pointer transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{patient.patientId}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.gender || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.dateOfBirth || (patient.age ? `${patient.age} yrs` : 'N/A')}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.phone}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            
                            <button 
                              className="text-red-600 hover:text-red-800"
                              onClick={(e) => handleDeletePatient(e, patient.patientId)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Doctors Tab Panel */}
            {activeTab === 1 && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Doctor List</h2>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search doctors..."
                      className="pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="absolute left-3 top-3 text-gray-400">
                      🔍
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {doctors.map((doctor) => (
                        <tr 
                          key={doctor._id} 
                          onClick={() => handleDoctorClick(doctor.doctorId)}
                          className="hover:bg-blue-50 cursor-pointer transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{doctor.doctorId}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doctor.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doctor.specialization || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                           
                            <button 
                              className="text-red-600 hover:text-red-800 mr-3"
                              onClick={(e) => handleDeleteDoctor(e, doctor.doctorId)}
                            >
                              Delete
                            </button>
                            <button className="text-green-600 hover:text-green-800">Schedule</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Caretakers Tab Panel */}
            {activeTab === 2 && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Caretaker List</h2>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search caretakers..."
                      className="pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="absolute left-3 top-3 text-gray-400">
                      🔍
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patients</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {caretakers.map((caretaker) => (
                        <tr 
                          key={caretaker._id} 
                          onClick={() => handleCaretakerClick(caretaker._id)}
                          className="hover:bg-blue-50 cursor-pointer transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{caretaker.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{caretaker.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{caretaker.phone || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{caretaker.patients?.length || 0}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          
                            <button 
                              className="text-red-600 hover:text-red-800 mr-3"
                              onClick={(e) => handleDeleteCaretaker(e, caretaker._id)}
                            >
                              Delete
                            </button>
                            <button className="text-green-600 hover:text-green-800">Assign Patient</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;