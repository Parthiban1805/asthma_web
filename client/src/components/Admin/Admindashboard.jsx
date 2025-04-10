import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [caretakers, setCaretakers] = useState([]);
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [queryType, setQueryType] = useState('all'); // 'all', 'patient', 'doctor'
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

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
    
    // Filter by query type
    if (queryType === 'patient') {
      filteredQueries = filteredQueries.filter(query => query.patientId && !query.doctorId);
    } else if (queryType === 'doctor') {
      filteredQueries = filteredQueries.filter(query => query.doctorId);
    }
    
    // Filter by search term
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
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Normal':
        return 'bg-blue-100 text-blue-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
    return 'Unknown';
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
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
          
          {/* Card 5 - Queries */}
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500 transition-all hover:shadow-lg">
            <div className="flex items-center pt-2">
              <div className="p-3 rounded-full bg-red-100 mr-4 flex items-center justify-center">
                <span className="text-red-600 font-bold text-lg">❓</span>
              </div>
              <div>
                <div className="text-sm text-gray-500 font-medium">Total Queries</div>
                <div className="text-2xl font-bold text-gray-800">{queries.length}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Custom Tabs implementation */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="flex border-b px-4 overflow-x-auto">
            <button 
              className={`px-6 py-4 focus:outline-none cursor-pointer font-medium transition-colors whitespace-nowrap ${activeTab === 0 ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
              onClick={() => setActiveTab(0)}
            >
              Patients
            </button>
            <button 
              className={`px-6 py-4 focus:outline-none cursor-pointer font-medium transition-colors whitespace-nowrap ${activeTab === 1 ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
              onClick={() => setActiveTab(1)}
            >
              Doctors
            </button>
            <button 
              className={`px-6 py-4 focus:outline-none cursor-pointer font-medium transition-colors whitespace-nowrap ${activeTab === 2 ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
              onClick={() => setActiveTab(2)}
            >
              Caretakers
            </button>
            <button 
              className={`px-6 py-4 focus:outline-none cursor-pointer font-medium transition-colors whitespace-nowrap ${activeTab === 3 ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
              onClick={() => setActiveTab(3)}
            >
              Queries
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
            
            {/* Queries Tab Panel */}
            {activeTab === 3 && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Query List</h2>
                  <div className="flex items-center space-x-4">
                    {/* Toggle Buttons for Query Type */}
                    <div className="bg-gray-100 p-1 rounded-lg flex">
                      <button
                        className={`px-3 py-1 rounded-md text-sm font-medium ${queryType === 'all' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
                        onClick={() => setQueryType('all')}
                      >
                        All Queries
                      </button>
                      <button
                        className={`px-3 py-1 rounded-md text-sm font-medium ${queryType === 'patient' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
                        onClick={() => setQueryType('patient')}
                      >
                        Patient Queries
                      </button>
                      <button
                        className={`px-3 py-1 rounded-md text-sm font-medium ${queryType === 'doctor' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
                        onClick={() => setQueryType('doctor')}
                      >
                        Doctor Queries
                      </button>
                    </div>
                    
                    {/* Search Input */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search queries..."
                        className="pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <div className="absolute left-3 top-3 text-gray-400">
                        🔍
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Queries Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getFilteredQueries().map((query) => (
                    <div 
                      key={query._id} 
                      className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleViewQueryDetails(query._id)}
                    >
                      <div className="border-b bg-gray-50 px-4 py-3 flex justify-between items-center">
                        <h3 className="font-medium text-gray-800">{query.subject}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityClass(query.priority)}`}>
                          {query.priority}
                        </span>
                      </div>
                      <div className="p-4">
                        <div className="text-sm text-gray-600 mb-2">{getQuerySourceName(query)}</div>
                        <p className="text-gray-800 line-clamp-3">{query.message}</p>
                      </div>
                      <div className="border-t px-4 py-2 bg-gray-50 flex justify-end">
                        
                        <button 
                          className="text-sm text-red-600 hover:text-red-800"
                          onClick={(e) => handleDeleteQuery(e, query._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Empty State */}
                {getFilteredQueries().length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-4">📭</div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">No Queries Found</h3>
                    <p className="text-gray-600">There are no queries matching your current filters.</p>
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

export default Dashboard;