import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [caretakers, setCaretakers] = useState([]);
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [queryType, setQueryType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRole, setNewRole] = useState('doctor');
  const [adminForm, setAdminForm] = useState({ fullName: '', email: '', password: '', phone: '', specialization: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [patientsRes, doctorsRes, caretakersRes, queriesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/patients'),
        axios.get('http://localhost:5000/api/admin/doctors'),
        axios.get('http://localhost:5000/api/admin/caretakers'),
        axios.get('http://localhost:5000/api/admin/queries')
      ]);
      
      setPatients(patientsRes.data);
      setDoctors(doctorsRes.data);
      setCaretakers(caretakersRes.data);
      setQueries(queriesRes.data);
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
    e.stopPropagation(); 
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
    e.stopPropagation();
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
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this caretaker?')) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/caretakers/${caretakerId}`);
        setCaretakers(caretakers.filter(caretaker => caretaker._id !== caretakerId));
      } catch (error) {
        console.error('Error deleting caretaker:', error);
      }
    }
  };

  const handleDeleteQuery = async (e, queryId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this query?')) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/queries/${queryId}`);
        setQueries(queries.filter(query => query._id !== queryId));
      } catch (error) {
        console.error('Error deleting query:', error);
      }
    }
  };

  const handleViewQueryDetails = (queryId) => {
    navigate(`/admin-query/${queryId}`);
  };

  const getFilteredQueries = () => {
    let filteredQueries = [...queries];
    
    if (queryType === 'patient') {
      filteredQueries = filteredQueries.filter(query => query.patientId && !query.doctorId);
    } else if (queryType === 'doctor') {
      filteredQueries = filteredQueries.filter(query => query.doctorId);
    }
    
    if (searchTerm) {
      filteredQueries = filteredQueries.filter(query => 
        query.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        query.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (query.patientId && query.patientId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (query.doctorId && query.doctorId.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return filteredQueries;
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Normal': return 'bg-blue-100 text-blue-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getQuerySourceName = (query) => {
    if (query.patientId) {
      const patient = patients.find(p => p.patientId === query.patientId);
      return patient ? `Patient: ${patient.name}` : `Patient: ${query.patientId}`;
    } else if (query.doctorId) {
      const doctor = doctors.find(d => d.doctorId === query.doctorId);
      return doctor ? `Doctor: ${doctor.name}` : `Doctor: ${query.doctorId}`;
    } else if (query.caretakerId) {
      const caretaker = caretakers.find(c => c._id === query.caretakerId);
      return caretaker ? `Caretaker: ${caretaker.name}` : `Caretaker: ${query.caretakerId}`;
    }
    return 'Unknown Source';
  };

  const handleAdminRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/register", { 
        ...adminForm, 
        username: adminForm.fullName,
        role: newRole 
      });
      alert(`${newRole} added successfully!`);
      setShowAddModal(false);
      setAdminForm({ fullName: '', email: '', password: '', phone: '', specialization: '' });
      fetchData(); 
    } catch (err) {
      alert("Registration failed");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-blue-600"></div>
          <p className="text-slate-600 font-medium mt-4">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Admin Portal</h1>
              <p className="text-slate-500 text-sm mt-0.5">Healthcare Management System</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => {setNewRole('doctor'); setShowAddModal(true);}} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Doctor
              </button>
              <button 
                onClick={() => {setNewRole('caretaker'); setShowAddModal(true);}} 
                className="bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm border border-slate-300 shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Caretaker
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
              <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-slate-900">
                  Register New {newRole.charAt(0).toUpperCase() + newRole.slice(1)}
                </h2>
                <button 
                  onClick={() => setShowAddModal(false)} 
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleAdminRegister} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full border border-slate-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm" 
                    onChange={(e) => setAdminForm({...adminForm, fullName: e.target.value})} 
                    value={adminForm.fullName}
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                  <input 
                    type="email" 
                    className="w-full border border-slate-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm" 
                    onChange={(e) => setAdminForm({...adminForm, email: e.target.value})} 
                    value={adminForm.email}
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                  <input 
                    type="password" 
                    className="w-full border border-slate-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm" 
                    onChange={(e) => setAdminForm({...adminForm, password: e.target.value})} 
                    value={adminForm.password}
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
                  <input 
                    type="tel" 
                    className="w-full border border-slate-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm" 
                    onChange={(e) => setAdminForm({...adminForm, phone: e.target.value})} 
                    value={adminForm.phone}
                    required 
                  />
                </div>
                {newRole === 'doctor' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Specialization</label>
                    <input 
                      type="text" 
                      className="w-full border border-slate-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm" 
                      onChange={(e) => setAdminForm({...adminForm, specialization: e.target.value})} 
                      value={adminForm.specialization}
                    />
                  </div>
                )}
                <div className="flex justify-end gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowAddModal(false)} 
                    className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors font-medium text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition-colors font-medium text-sm shadow-sm"
                  >
                    Add {newRole.charAt(0).toUpperCase() + newRole.slice(1)}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Total Patients', value: patients.length, icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', color: 'blue' },
            { label: 'Total Doctors', value: doctors.length, icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'green' },
            { label: 'Caretakers', value: caretakers.length, icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', color: 'amber' },
            { label: 'Appointments', value: 0, icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'purple' },
            { label: 'Active Queries', value: queries.length, icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'red' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{stat.label}</p>
                  <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
                </div>
                <div className={`w-11 h-11 rounded-lg bg-${stat.color}-50 flex items-center justify-center flex-shrink-0`}>
                  <svg className={`w-6 h-6 text-${stat.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Main Content Area */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-slate-200">
            <div className="flex overflow-x-auto px-6">
              {['Patients', 'Doctors', 'Caretakers', 'Queries'].map((tab, index) => (
                <button 
                  key={index}
                  className={`py-4 px-6 font-semibold text-sm transition-all border-b-2 whitespace-nowrap ${
                    activeTab === index 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                  onClick={() => setActiveTab(index)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-6">
            {/* Patients Tab */}
            {activeTab === 0 && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-4">
                  <h2 className="text-base font-semibold text-slate-900">Patient Directory</h2>
                  <div className="relative w-full sm:w-72">
                    <input
                      type="text"
                      placeholder="Search patients..."
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    <svg className="absolute left-3 top-3 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Gender</th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Age</th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {patients.map((patient) => (
                        <tr 
                          key={patient._id} 
                          onClick={() => handlePatientClick(patient.patientId)}
                          className="hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{patient.patientId}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{patient.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{patient.gender || '—'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{patient.age ? `${patient.age} yrs` : '—'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{patient.phone}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            <button 
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors font-medium"
                              onClick={(e) => handleDeletePatient(e, patient.patientId)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                      {patients.length === 0 && (
                        <tr>
                          <td colSpan="6" className="text-center py-12 text-slate-500">
                            No patients found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Doctors Tab */}
            {activeTab === 1 && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-4">
                  <h2 className="text-base font-semibold text-slate-900">Medical Staff</h2>
                  <div className="relative w-full sm:w-72">
                    <input
                      type="text"
                      placeholder="Search doctors..."
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    <svg className="absolute left-3 top-3 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Specialization</th>
                        <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {doctors.map((doctor) => (
                        <tr 
                          key={doctor._id} 
                          onClick={() => handleDoctorClick(doctor.doctorId)}
                          className="hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{doctor.doctorId}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{doctor.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full text-xs font-medium">
                              {doctor.specialization || 'General'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            <button 
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors font-medium"
                              onClick={(e) => handleDeleteDoctor(e, doctor.doctorId)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                      {doctors.length === 0 && (
                        <tr>
                          <td colSpan="4" className="text-center py-12 text-slate-500">
                            No doctors found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Caretakers Tab */}
            {activeTab === 2 && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-4">
                  <h2 className="text-base font-semibold text-slate-900">Caretakers Registry</h2>
                  <div className="relative w-full sm:w-72">
                    <input
                      type="text"
                      placeholder="Search caretakers..."
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    <svg className="absolute left-3 top-3 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Phone</th>
                        <th className="px-6 py-3.5 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Patients</th>
                        <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {caretakers.map((caretaker) => (
                        <tr 
                          key={caretaker._id} 
                          onClick={() => handleCaretakerClick(caretaker._id)}
                          className="hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{caretaker.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{caretaker.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{caretaker.phone || '—'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                            <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                              {caretaker.patients?.length || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            <button 
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors font-medium"
                              onClick={(e) => handleDeleteCaretaker(e, caretaker._id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                      {caretakers.length === 0 && (
                        <tr>
                          <td colSpan="5" className="text-center py-12 text-slate-500">
                            No caretakers found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Queries Tab */}
            {activeTab === 3 && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-4">
                  <h2 className="text-base font-semibold text-slate-900">System Queries</h2>
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-100 p-1 rounded-lg flex text-xs font-medium">
                      {['all', 'patient', 'doctor'].map(type => (
                        <button
                          key={type}
                          className={`px-4 py-2 rounded-md capitalize transition-all ${queryType === type ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
                          onClick={() => setQueryType(type)}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                    
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search..."
                        className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm w-48"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <svg className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getFilteredQueries().map((query) => (
                    <div 
                      key={query._id} 
                      className="bg-white border border-slate-200 rounded-lg p-5 hover:shadow-md transition-all cursor-pointer group hover:border-slate-300"
                      onClick={() => handleViewQueryDetails(query._id)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${getPriorityClass(query.priority)}`}>
                          {query.priority}
                        </span>
                        <button 
                          className="text-slate-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                          onClick={(e) => handleDeleteQuery(e, query._id)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <h3 className="font-semibold text-slate-900 mb-2 line-clamp-1 text-sm">{query.subject}</h3>
                      <p className="text-slate-600 text-sm line-clamp-2 mb-4 leading-relaxed">{query.message}</p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <span className="text-xs text-slate-500 font-medium">{getQuerySourceName(query)}</span>
                        <span className="text-xs text-blue-600 font-semibold flex items-center gap-1">
                          View
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                {getFilteredQueries().length === 0 && (
                  <div className="text-center py-16 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
                    <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <h3 className="text-slate-700 font-semibold mb-1">No queries found</h3>
                    <p className="text-slate-500 text-sm">Adjust filters or check back later</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;