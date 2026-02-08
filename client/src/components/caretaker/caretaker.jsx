import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CaretakerDashboard = () => {
  const [assignedPatients, setAssignedPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [caretakerId, setCaretakerId] = useState(null);
  const [symptoms, setSymptoms] = useState([]);

  // Search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // Patient queries
  const [patientQueries, setPatientQueries] = useState([]);
  const [loadingQueries, setLoadingQueries] = useState(false);
  const [activeTab, setActiveTab] = useState('patients'); // 'patients' or 'queries'
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [queryResponse, setQueryResponse] = useState('');
  const [queryStatusUpdate, setQueryStatusUpdate] = useState('');
  const [updatingQuery, setUpdatingQuery] = useState(false);

  // Get caretaker ID from local storage on component mount
  useEffect(() => {
    try {
      // Get user data from local storage
      const userData = JSON.parse(localStorage.getItem('user')) || {};
      console.log(userData.caretakerId);
      if (userData.role === 'caretaker') {
        setCaretakerId(userData.caretakerId);
      } else {
        setError('Invalid caretaker data in local storage');
      }
    } catch (error) {
      console.error('Error parsing user data from local storage:', error);
      setError('Failed to load user data');
    }
  }, []);

  // Fetch assigned patients only if caretakerId is defined
  useEffect(() => {
    const fetchAssignedPatients = async () => {
      // Only fetch if caretakerId is available
      if (!caretakerId) {
        setAssignedPatients([]);
        return;
      }
      
      try {
        const response = await axios.get(`http://localhost:5000/api/caretaker/assigned-patients/${caretakerId}`);
        setAssignedPatients(response.data);
      } catch (error) {
        console.error('Error fetching assigned patients:', error);
        setError('Failed to load your assigned patients');
      }
    };
    
    fetchAssignedPatients();
  }, [caretakerId]);
 
  // Fetch patient queries when tab is switched to queries
  useEffect(() => {
    if (activeTab === 'queries' && caretakerId) {
      fetchPatientQueries();
    }
  }, [activeTab, caretakerId]);

  const fetchPatientQueries = async () => {
    if (!caretakerId) return;
    
    setLoadingQueries(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/queries/caretaker-queries/${caretakerId}`);
      setPatientQueries(response.data.queries);
      setLoadingQueries(false);
    } catch (error) {
      console.error('Error fetching patient queries:', error);
      setLoadingQueries(false);
    }
  };

  // Search for patients by patientId
  const searchPatients = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setSearchError('Please enter a Patient ID to search');
      return;
    }
    
    try {
      setSearching(true);
      setSearchError(null);
      
      // Call the new search endpoint
      const response = await axios.get(`http://localhost:5000/api/caretaker/search-patient/${searchQuery}`);
      
      if (response.data) {
        setSearchResults([response.data]);
      } else {
        setSearchResults([]);
        setSearchError('No patient found with that ID');
      }
    } catch (error) {
      console.error('Error searching for patient:', error);
      setSearchError('Failed to search for patient');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // Assign a patient to the caretaker
  const assignPatient = async (patientId) => {
    // Guard clause for missing caretakerId
    if (!caretakerId) {
      setError('Caretaker ID is required. Please log in again.');
      return;
    }
    
    try {
      setLoading(true);
      await axios.post('http://localhost:5000/api/caretaker/assign-patient', {
        caretakerId,
        patientId
      });
      
      // Refresh assigned patients list
      const assignedResponse = await axios.get(`http://localhost:5000/api/caretaker/assigned-patients/${caretakerId}`);
      setAssignedPatients(assignedResponse.data);
      
      // Clear search results after assignment
      setSearchResults([]);
      setSearchQuery('');
      
      setLoading(false);
      setError(null);
    } catch (error) {
      console.error('Error assigning patient:', error);
      setLoading(false);
      setError('Failed to assign patient');
    }
  };

  const viewPatientDetails = async (patientId) => {
    try {
      setLoading(true);
      setSelectedPatient(patientId);
      console.log("Patient id:", patientId);
  
      const patientResponse = await axios.get(`http://localhost:5000/api/caretaker/patient-details/${patientId}`);
      setPatientDetails(patientResponse.data);
  
      setError(null);
    } catch (error) {
      console.error('Error fetching patient details:', error);
      setError('Failed to load patient details');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchSymptoms = async (patientId) => {
    try {
      setLoading(true);
      console.log("Fetching symptoms for:", patientId);
  
      const symptomsResponse = await axios.get(`http://localhost:5000/api/symptoms/caretaker/${patientId}`);
      console.log(symptomsResponse.data);
      setSymptoms(symptomsResponse.data);
  
      setError(null);
    } catch (error) {
      console.error('Error fetching symptoms:', error);
      setError('Failed to load symptoms');
    } finally {
      setLoading(false);
    }
  };
  

  // View a specific query
  const viewQueryDetails = (query) => {
    setSelectedQuery(query);
    setQueryResponse('');
    setQueryStatusUpdate(query.status);
  };

  // Update query status and/or add response
  const updateQuery = async (e) => {
    e.preventDefault();
    
    if (!selectedQuery) return;
    
    setUpdatingQuery(true);
    try {
      const response = await axios.put(`http://localhost:5000/api/queries/update-query/${selectedQuery._id}`, {
        status: queryStatusUpdate,
        response: queryResponse
      });
      
      // Refresh queries list
      fetchPatientQueries();
      
      // Update selected query with new data
      setSelectedQuery(response.data.query);
      
      setUpdatingQuery(false);
    } catch (error) {
      console.error('Error updating query:', error);
      setUpdatingQuery(false);
      setError('Failed to update query');
    }
  };

  // If no caretakerId is provided but user is trying to access this page
  if (!caretakerId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md border border-yellow-200 p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Authentication Required</h3>
              <p className="text-sm text-gray-700">Please log in as a caretaker to view your dashboard.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Caretaker Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">Manage your assigned patients and respond to queries</p>
        </div>
        
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-r-lg shadow-sm p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                className={`py-4 px-6 text-sm font-medium transition-colors duration-150 border-b-2 ${
                  activeTab === 'patients' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('patients')}
              >
                <span className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Patients</span>
                </span>
              </button>
              <button
                className={`py-4 px-6 text-sm font-medium transition-colors duration-150 border-b-2 ${
                  activeTab === 'queries' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('queries')}
              >
                <span className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <span>Patient Queries</span>
                </span>
              </button>
            </nav>
          </div>
        </div>
        
        {/* Patients Tab Content */}
        {activeTab === 'patients' && (
          <div className="space-y-6">
            {/* Search Box */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h2 className="text-lg font-semibold text-gray-900">Search Patient by ID</h2>
              </div>
              <form onSubmit={searchPatients} className="flex space-x-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter Patient ID"
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                />
                <button
                  type="submit"
                  disabled={searching}
                  className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
                >
                  {searching ? 'Searching...' : 'Search'}
                </button>
              </form>
              
              {searchError && (
                <div className="mt-3 flex items-center text-red-600 text-sm">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {searchError}
                </div>
              )}
              
              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-md font-semibold text-gray-900 mb-3">Search Results</h3>
                  <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
                    {searchResults.map(patient => (
                      <div key={patient._id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="text-base font-semibold text-gray-900">{patient.name}</h4>
                            <div className="mt-1 space-y-0.5">
                              <p className="text-sm text-gray-600">Patient ID: <span className="font-medium text-gray-900">{patient.patientId}</span></p>
                              <p className="text-sm text-gray-600">{patient.age} years • {patient.gender}</p>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2 ml-4">
                            <button
                              onClick={() => {
                                viewPatientDetails(patient._id);
                                fetchSymptoms(patient._id);
                              }}
                              className="px-4 py-1.5 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                            >
                              View Details
                            </button>
                            {!patient.caretakerId && (
                              <button
                                onClick={() => assignPatient(patient._id)}
                                disabled={loading}
                                className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
                              >
                                {loading ? 'Assigning...' : 'Assign to Me'}
                              </button>
                            )}
                            {patient.caretakerId === caretakerId && (
                              <span className="px-4 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-md text-center">
                                Assigned to you
                              </span>
                            )}
                            {patient.caretakerId && patient.caretakerId !== caretakerId && (
                              <span className="px-4 py-1.5 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-md text-center">
                                Already assigned
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Assigned Patients Panel */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">My Patients</h2>
                  <p className="text-sm text-gray-600 mt-0.5">{assignedPatients.length} patient{assignedPatients.length !== 1 ? 's' : ''} assigned</p>
                </div>
                <div className="p-6">
                  {loading && assignedPatients.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <p className="ml-3 text-gray-600">Loading your patients...</p>
                    </div>
                  ) : assignedPatients.length === 0 ? (
                    <div className="text-center py-8">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <p className="mt-3 text-gray-600">No patients assigned to you yet.</p>
                      <p className="text-sm text-gray-500 mt-1">Use the search above to find and assign patients.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {assignedPatients.map(patient => (
                        <div key={patient._id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="text-base font-semibold text-gray-900">{patient.name}</h4>
                              <div className="mt-1 space-y-0.5">
                                <p className="text-sm text-gray-600">Patient ID: <span className="font-medium text-gray-900">{patient.patientId}</span></p>
                                <p className="text-sm text-gray-600">{patient.age} years • {patient.gender}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => viewPatientDetails(patient._id)}
                              disabled={loading}
                              className="ml-4 px-4 py-1.5 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors"
                            >
                              View
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Patient Details Panel */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Patient Details</h2>
                </div>
                <div className="p-6">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <p className="ml-3 text-gray-600">Loading patient details...</p>
                    </div>
                  ) : !selectedPatient ? (
                    <div className="text-center py-8">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="mt-3 text-gray-600">Select a patient to view details.</p>
                    </div>
                  ) : !patientDetails ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600">No details found for this patient.</p>
                    </div>
                  ) : (
                    <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                      {/* Action button to assign if not assigned */}
                      {patientDetails.patient.caretakerId === null && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-yellow-800 font-medium">This patient is not assigned to any caretaker.</p>
                            <button
                              onClick={() => assignPatient(patientDetails.patient._id)}
                              disabled={loading}
                              className="ml-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
                            >
                              {loading ? 'Assigning...' : 'Assign to me'}
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {patientDetails.patient.caretakerId && 
                       patientDetails.patient.caretakerId !== caretakerId && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <p className="text-sm text-yellow-800 font-medium">
                            This patient is assigned to another caretaker.
                          </p>
                        </div>
                      )}
                      
                      {/* Basic Information */}
                      <section className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Basic Information
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Name</p>
                            <p className="mt-1 text-sm text-gray-900 font-medium">{patientDetails.patient.name}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Age</p>
                            <p className="mt-1 text-sm text-gray-900 font-medium">{patientDetails.patient.age} years</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Gender</p>
                            <p className="mt-1 text-sm text-gray-900 font-medium">{patientDetails.patient.gender}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Contact</p>
                            <p className="mt-1 text-sm text-gray-900 font-medium">{patientDetails.patient.phone || 'Not provided'}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Address</p>
                            <p className="mt-1 text-sm text-gray-900">{patientDetails.patient.address || 'Not provided'}</p>
                          </div>
                        </div>
                      </section>
                      
                      {/* Medical Information */}
                      <section className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          Medical Information
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">BMI</p>
                            <p className="mt-1 text-sm text-gray-900 font-medium">{patientDetails.patient.bmi || 'Not recorded'}</p>
                          </div>
                          <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Medical History</p>
                        <p className="mt-1 text-sm text-gray-900">{patientDetails.patient.medicalHistory || 'No history recorded'}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded mr-2 flex items-center justify-center ${patientDetails.patient.petAllergy ? 'bg-red-100' : 'bg-gray-200'}`}>
                            {patientDetails.patient.petAllergy && (
                              <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <p className="text-sm text-gray-700">Pet Allergy</p>
                        </div>
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded mr-2 flex items-center justify-center ${patientDetails.patient.familyHistoryAsthma ? 'bg-red-100' : 'bg-gray-200'}`}>
                            {patientDetails.patient.familyHistoryAsthma && (
                              <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <p className="text-sm text-gray-700">Family Asthma</p>
                        </div>
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded mr-2 flex items-center justify-center ${patientDetails.patient.historyOfAllergies ? 'bg-red-100' : 'bg-gray-200'}`}>
                            {patientDetails.patient.historyOfAllergies && (
                              <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <p className="text-sm text-gray-700">Allergies</p>
                        </div>
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded mr-2 flex items-center justify-center ${patientDetails.patient.hayfever ? 'bg-red-100' : 'bg-gray-200'}`}>
                            {patientDetails.patient.hayfever && (
                              <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <p className="text-sm text-gray-700">Hayfever</p>
                        </div>
                      </div>
                    </div>
                  </section>
                  
                  {/* Lung Function */}
                  <section className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Lung Function
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">FEV1</p>
                        <p className="mt-1 text-sm text-gray-900 font-medium">{patientDetails.patient.lungFunctionFEV1 || 'Not recorded'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">FVC</p>
                        <p className="mt-1 text-sm text-gray-900 font-medium">{patientDetails.patient.lungFunctionFVC || 'Not recorded'}</p>
                      </div>
                    </div>
                  </section>
                  
                  {/* Appointments */}
                  <section className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Appointments
                      <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {patientDetails.appointments?.length || 0}
                      </span>
                    </h3>
                    {!patientDetails.appointments || patientDetails.appointments.length === 0 ? (
                      <p className="text-sm text-gray-600">No appointments scheduled.</p>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {patientDetails.appointments.map(appointment => (
                          <div key={appointment._id} className="bg-white border border-gray-200 rounded-md p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {new Date(appointment.dateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {' '}
                                  {new Date(appointment.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">Duration: {appointment.duration} minutes</p>
                                <p className="text-xs text-gray-600">Purpose: {appointment.purpose}</p>
                              </div>
                              <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                                appointment.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                                appointment.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {appointment.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                  
                  {/* Prescriptions */}
                  <section className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      Prescriptions
                      <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {patientDetails.prescriptions?.length || 0}
                      </span>
                    </h3>
                    {!patientDetails.prescriptions || patientDetails.prescriptions.length === 0 ? (
                      <p className="text-sm text-gray-600">No active prescriptions.</p>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {patientDetails.prescriptions.map(prescription => (
                          <div key={prescription._id} className="bg-white border border-gray-200 rounded-md p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{prescription.medicationName}</p>
                                <p className="text-xs text-gray-600 mt-1">Dosage: {prescription.dosage}</p>
                                <p className="text-xs text-gray-600">Frequency: {prescription.frequency}</p>
                              </div>
                              <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                                prescription.status === 'Active' ? 'bg-green-100 text-green-800' :
                                prescription.status === 'Expired' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {prescription.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                  
                  {/* Symptoms */}
                  <section className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Recent Symptoms
                      <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {symptoms.length || 0}
                      </span>
                    </h3>
                    {symptoms.length === 0 ? (
                      <p className="text-sm text-gray-600">No symptom records found.</p>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {symptoms.map((symptom) => (
                          <div key={symptom._id} className="bg-white border border-gray-200 rounded-md p-3">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-medium text-gray-900">
                                {new Date(symptom.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                              <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                                symptom.severity === 'Mild' ? 'bg-green-100 text-green-800' :
                                symptom.severity === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                                symptom.severity === 'Severe' ? 'bg-orange-100 text-orange-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {symptom.severity}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                              <div className="flex items-center">
                                <span className={`${symptom.coughing ? 'text-red-600' : 'text-gray-400'}`}>
                                  {symptom.coughing ? '✓' : '✗'}
                                </span>
                                <span className="ml-1 text-gray-700">Coughing</span>
                              </div>
                              <div className="flex items-center">
                                <span className={`${symptom.chestTightness ? 'text-red-600' : 'text-gray-400'}`}>
                                  {symptom.chestTightness ? '✓' : '✗'}
                                </span>
                                <span className="ml-1 text-gray-700">Chest Tightness</span>
                              </div>
                              <div className="flex items-center">
                                <span className={`${symptom.shortnessOfBreath ? 'text-red-600' : 'text-gray-400'}`}>
                                  {symptom.shortnessOfBreath ? '✓' : '✗'}
                                </span>
                                <span className="ml-1 text-gray-700">Shortness of Breath</span>
                              </div>
                              <div className="flex items-center">
                                <span className={`${symptom.wheezing ? 'text-red-600' : 'text-gray-400'}`}>
                                  {symptom.wheezing ? '✓' : '✗'}
                                </span>
                                <span className="ml-1 text-gray-700">Wheezing</span>
                              </div>
                              <div className="flex items-center">
                                <span className={`${symptom.nighttimeSymptoms ? 'text-red-600' : 'text-gray-400'}`}>
                                  {symptom.nighttimeSymptoms ? '✓' : '✗'}
                                </span>
                                <span className="ml-1 text-gray-700">Nighttime Symptoms</span>
                              </div>
                              <div className="flex items-center">
                                <span className={`${symptom.exercise ? 'text-red-600' : 'text-gray-400'}`}>
                                  {symptom.exercise ? '✓' : '✗'}
                                </span>
                                <span className="ml-1 text-gray-700">Exercise-induced</span>
                              </div>
                            </div>
                            {symptom.notes && (
                              <p className="text-xs text-gray-600 mt-2 pt-2 border-t border-gray-200">
                                <span className="font-medium">Notes:</span> {symptom.notes}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )}
    
    {/* Queries Tab Content */}
    {activeTab === 'queries' && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Queries List Panel */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Patient Queries</h2>
            <p className="text-sm text-gray-600 mt-0.5">{patientQueries.length} quer{patientQueries.length !== 1 ? 'ies' : 'y'}</p>
          </div>
          <div className="p-6">
            {loadingQueries ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="ml-3 text-gray-600">Loading queries...</p>
              </div>
            ) : patientQueries.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <p className="mt-3 text-gray-600">No queries from patients.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {patientQueries.map(query => (
                  <div 
                    key={query._id} 
                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                      selectedQuery && selectedQuery._id === query._id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => viewQueryDetails(query)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-sm font-semibold text-gray-900 flex-1">{query.subject}</h4>
                      <p className="text-xs text-gray-500 ml-2">
                        {new Date(query.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      From: <span className="font-medium text-gray-900">{query.patientId.name}</span> (ID: {query.patientId.patientId})
                    </p>
                    <p className="text-xs text-gray-700 italic truncate mb-3">
                      {query.message.substring(0, 80)}
                      {query.message.length > 80 ? '...' : ''}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        query.priority === 'Low' ? 'bg-green-100 text-green-800' :
                        query.priority === 'Medium' ? 'bg-blue-100 text-blue-800' :
                        query.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {query.priority}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        query.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        query.status === 'Viewed' ? 'bg-blue-100 text-blue-800' :
                        query.status === 'Responded' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {query.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Query Details Panel */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Query Details</h2>
          </div>
          <div className="p-6">
            {!selectedQuery ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="mt-3 text-gray-600">Select a query to view details.</p>
              </div>
            ) : (
              <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-base font-semibold text-gray-900">{selectedQuery.subject}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      selectedQuery.priority === 'Low' ? 'bg-green-100 text-green-800' :
                      selectedQuery.priority === 'Medium' ? 'bg-blue-100 text-blue-800' :
                      selectedQuery.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedQuery.priority}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">From:</span> {selectedQuery.patientId.name} (ID: {selectedQuery.patientId.patientId})
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Submitted:</span> {new Date(selectedQuery.createdAt).toLocaleString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-xs font-medium text-blue-900 uppercase tracking-wide mb-2">Patient Message</p>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{selectedQuery.message}</p>
                </div>
                
                {/* Response Form */}
                <form onSubmit={updateQuery} className="space-y-4">
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                      Query Status
                    </label>
                    <select
                      id="status"
                      value={queryStatusUpdate}
                      onChange={(e) => setQueryStatusUpdate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Viewed">Viewed</option>
                      <option value="Responded">Responded</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="response" className="block text-sm font-medium text-gray-700 mb-2">
                      Your Response
                    </label>
                    <textarea
                      id="response"
                      value={queryResponse}
                      onChange={(e) => setQueryResponse(e.target.value)}
                      rows="6"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Type your response here..."
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={updatingQuery}
                      className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
                    >
                      {updatingQuery ? 'Updating...' : 'Update Query'}
                    </button>
                  </div>
                </form>
                
                {/* Previous Responses */}
                {selectedQuery.responses && selectedQuery.responses.length > 0 && (
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Previous Responses</h4>
                    <div className="space-y-3">
                      {selectedQuery.responses.map((resp, index) => (
                        <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-2">
                            {new Date(resp.timestamp).toLocaleString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          <p className="text-sm text-gray-800 whitespace-pre-wrap">{resp.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
</div>
);
};
export default CaretakerDashboard