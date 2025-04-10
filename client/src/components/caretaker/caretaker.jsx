import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CaretakerDashboard = () => {
  const [assignedPatients, setAssignedPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [caretakerId, setCaretakerId] = useState(null);
  
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

  // Fetch patient details
  const viewPatientDetails = async (patientId) => {
    try {
      setLoading(true);
      setSelectedPatient(patientId);
      
      const response = await axios.get(`http://localhost:5000/api/caretaker/patient-details/${patientId}`);
      setPatientDetails(response.data);
      
      setLoading(false);
      setError(null);
    } catch (error) {
      console.error('Error fetching patient details:', error);
      setLoading(false);
      setError('Failed to load patient details');
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
      <div className="container mx-auto p-4">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <p>Please log in as a caretaker to view your dashboard.</p>
        </div>
      </div>
    );
  }
  return (

  <div className="container mx-auto p-4">
  <h1 className="text-2xl font-bold mb-6">Caretaker Dashboard</h1>
  
  {error && (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
      <p>{error}</p>
    </div>
  )}
  
  {/* Tab Navigation */}
  <div className="flex border-b mb-6">
    <button
      className={`py-2 px-4 mr-2 ${activeTab === 'patients' 
        ? 'border-b-2 border-blue-500 text-blue-600 font-medium' 
        : 'text-gray-600 hover:text-blue-500'}`}
      onClick={() => setActiveTab('patients')}
    >
      Patients
    </button>
    <button
      className={`py-2 px-4 mr-2 ${activeTab === 'queries' 
        ? 'border-b-2 border-blue-500 text-blue-600 font-medium' 
        : 'text-gray-600 hover:text-blue-500'}`}
      onClick={() => setActiveTab('queries')}
    >
      Patient Queries
    </button>
  </div>
  
  {/* Patients Tab Content */}
  {activeTab === 'patients' && (
    <>
      {/* Search Box */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Search Patient by ID</h2>
        <form onSubmit={searchPatients} className="flex space-x-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter Patient ID"
            className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={searching}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            {searching ? 'Searching...' : 'Search'}
          </button>
        </form>
        
        {searchError && (
          <p className="text-red-500 text-sm mt-2">{searchError}</p>
        )}
        
        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Search Results</h3>
            <ul className="divide-y">
              {searchResults.map(patient => (
                <li key={patient._id} className="py-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-sm text-gray-600">ID: {patient.patientId}</p>
                      <p className="text-sm text-gray-600">
                        {patient.age} years, {patient.gender}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => viewPatientDetails(patient._id)}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      >
                        View
                      </button>
                      {!patient.caretakerId && (
                        <button
                          onClick={() => assignPatient(patient._id)}
                          disabled={loading}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:bg-blue-300"
                        >
                          {loading ? 'Assigning...' : 'Assign'}
                        </button>
                      )}
                      {patient.caretakerId === caretakerId && (
                        <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded">
                          Assigned to you
                        </span>
                      )}
                      {patient.caretakerId && patient.caretakerId !== caretakerId && (
                        <span className="bg-yellow-200 text-yellow-700 px-3 py-1 rounded">
                          Already assigned
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Assigned Patients Panel */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">My Patients</h2>
          {loading && assignedPatients.length === 0 ? (
            <p>Loading your patients...</p>
          ) : assignedPatients.length === 0 ? (
            <p>No patients assigned to you yet.</p>
          ) : (
            <ul className="divide-y">
              {assignedPatients.map(patient => (
                <li key={patient._id} className="py-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-sm text-gray-600">ID: {patient.patientId}</p>
                      <p className="text-sm text-gray-600">
                        {patient.age} years, {patient.gender}
                      </p>
                    </div>
                    <button
                      onClick={() => viewPatientDetails(patient._id)}
                      disabled={loading}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:bg-green-300"
                    >
                      View
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Patient Details Panel */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Patient Details</h2>
          {loading ? (
            <p>Loading patient details...</p>
          ) : !selectedPatient ? (
            <p>Select a patient to view details.</p>
          ) : !patientDetails ? (
            <p>No details found for this patient.</p>
          ) : (
            <div>
              {/* Action button to assign if not assigned */}
              {patientDetails.patient.caretakerId === null && (
                <div className="mb-4 p-2 bg-yellow-100 rounded flex justify-between items-center">
                  <p className="text-yellow-800">This patient is not assigned to any caretaker.</p>
                  <button
                    onClick={() => assignPatient(patientDetails.patient._id)}
                    disabled={loading}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:bg-blue-300"
                  >
                    {loading ? 'Assigning...' : 'Assign to me'}
                  </button>
                </div>
              )}
              
              {patientDetails.patient.caretakerId && 
               patientDetails.patient.caretakerId !== caretakerId && (
                <div className="mb-4 p-2 bg-yellow-100 rounded">
                  <p className="text-yellow-800">
                    This patient is assigned to another caretaker.
                  </p>
                </div>
              )}
              
              {/* Basic Information */}
              <section className="mb-6">
                <h3 className="text-lg font-medium mb-2">Basic Information</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="font-semibold">Name:</p>
                    <p>{patientDetails.patient.name}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Age:</p>
                    <p>{patientDetails.patient.age} years</p>
                  </div>
                  <div>
                    <p className="font-semibold">Gender:</p>
                    <p>{patientDetails.patient.gender}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Contact:</p>
                    <p>{patientDetails.patient.phone || 'Not provided'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="font-semibold">Address:</p>
                    <p>{patientDetails.patient.address || 'Not provided'}</p>
                  </div>
                </div>
              </section>
              <section className="mb-6">
                <h3 className="text-lg font-medium mb-2">Medical Information</h3>
                <div>
                  <p className="font-semibold">BMI:</p>
                  <p>{patientDetails.patient.bmi || 'Not recorded'}</p>
                </div>
                <div>
                  <p className="font-semibold">Medical History:</p>
                  <p>{patientDetails.patient.medicalHistory || 'No history recorded'}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <p className="font-semibold">Pet Allergy:</p>
                    <p>{patientDetails.patient.petAllergy ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Family Asthma:</p>
                    <p>{patientDetails.patient.familyHistoryAsthma ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Allergies:</p>
                    <p>{patientDetails.patient.historyOfAllergies ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Hayfever:</p>
                    <p>{patientDetails.patient.hayfever ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </section>
              
              {/* Lung Function */}
              <section className="mb-6">
                <h3 className="text-lg font-medium mb-2">Lung Function</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="font-semibold">FEV1:</p>
                    <p>{patientDetails.patient.lungFunctionFEV1 || 'Not recorded'}</p>
                  </div>
                  <div>
                    <p className="font-semibold">FVC:</p>
                    <p>{patientDetails.patient.lungFunctionFVC || 'Not recorded'}</p>
                  </div>
                </div>
              </section>
              
              {/* Appointments */}
              <section className="mb-6">
                <h3 className="text-lg font-medium mb-2">
                  Appointments ({patientDetails.appointments?.length || 0})
                </h3>
                {!patientDetails.appointments || patientDetails.appointments.length === 0 ? (
                  <p>No appointments scheduled.</p>
                ) : (
                  <div className="max-h-40 overflow-y-auto">
                    {patientDetails.appointments.map(appointment => (
                      <div key={appointment._id} className="mb-2 p-2 bg-gray-100 rounded">
                        <p className="font-medium">
                          {new Date(appointment.dateTime).toLocaleDateString()} at {' '}
                          {new Date(appointment.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                        <p className="text-sm">Duration: {appointment.duration} minutes</p>
                        <p className="text-sm">Purpose: {appointment.purpose}</p>
                        <p className="text-sm">Status: {appointment.status}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
              
              {/* Prescriptions */}
              <section className="mb-6">
                <h3 className="text-lg font-medium mb-2">
                  Prescriptions ({patientDetails.prescriptions?.length || 0})
                </h3>
                {!patientDetails.prescriptions || patientDetails.prescriptions.length === 0 ? (
                  <p>No active prescriptions.</p>
                ) : (
                  <div className="max-h-40 overflow-y-auto">
                    {patientDetails.prescriptions.map(prescription => (
                      <div key={prescription._id} className="mb-2 p-2 bg-gray-100 rounded">
                        <p className="font-medium">{prescription.medicationName}</p>
                        <p className="text-sm">Dosage: {prescription.dosage}</p>
                        <p className="text-sm">Frequency: {prescription.frequency}</p>
                        <p className="text-sm">Status: {prescription.status}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
              
              {/* Symptoms */}
              <section>
                <h3 className="text-lg font-medium mb-2">
                  Recent Symptoms ({patientDetails.symptoms?.length || 0})
                </h3>
                {!patientDetails.symptoms || patientDetails.symptoms.length === 0 ? (
                  <p>No symptom records found.</p>
                ) : (
                  <div className="max-h-40 overflow-y-auto">
                    {patientDetails.symptoms.map(symptom => (
                      <div key={symptom._id} className="mb-2 p-2 bg-gray-100 rounded">
                        <p className="font-medium">
                          {new Date(symptom.date).toLocaleDateString()} - 
                          Severity: {symptom.severity}
                        </p>
                        <div className="grid grid-cols-2 gap-1 text-sm">
                          <p>{symptom.coughing ? '✓' : '✗'} Coughing</p>
                          <p>{symptom.chestTightness ? '✓' : '✗'} Chest Tightness</p>
                          <p>{symptom.shortnessOfBreath ? '✓' : '✗'} Shortness of Breath</p>
                          <p>{symptom.wheezing ? '✓' : '✗'} Wheezing</p>
                          <p>{symptom.nighttimeSymptoms ? '✓' : '✗'} Nighttime Symptoms</p>
                          <p>{symptom.exercise ? '✓' : '✗'} Exercise-induced</p>
                        </div>
                        {symptom.notes && <p className="text-sm mt-1">Notes: {symptom.notes}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </section>
              {/* Rest of the patient details sections... */}
              {/* Medical Information, Lung Function, Appointments, Prescriptions, Symptoms */}
              {/* Keeping these sections as they were in the original component */}
            </div>
          )}
        </div>
      </div>
    </>
  )}
  
  {/* Queries Tab Content */}
  {activeTab === 'queries' && (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Patient Queries List Panel */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Patient Queries</h2>
        {loadingQueries ? (
          <p>Loading queries...</p>
        ) : patientQueries.length === 0 ? (
          <p>No queries from patients.</p>
        ) : (
          <div className="divide-y">
            {patientQueries.map(query => (
              <div 
                key={query._id} 
                className={`py-3 cursor-pointer ${selectedQuery && selectedQuery._id === query._id ? 'bg-blue-50' : ''}`}
                onClick={() => viewQueryDetails(query)}
              >
                <div className="flex justify-between">
                  <div className="font-medium">{query.subject}</div>
                  <div className="text-sm">
                    {new Date(query.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-sm text-gray-600 truncate">
                  From: {query.patientId.name} (ID: {query.patientId.patientId})
                </div>
                <div className="flex justify-between mt-1">
                  <div className="text-sm italic truncate">
                    {query.message.substring(0, 60)}
                    {query.message.length > 60 ? '...' : ''}
                  </div>
                  <div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      query.priority === 'Low' ? 'bg-green-100 text-green-800' :
                      query.priority === 'Medium' ? 'bg-blue-100 text-blue-800' :
                      query.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {query.priority}
                    </span>
                    <span className={`ml-2 text-xs px-2 py-1 rounded ${
                      query.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      query.status === 'Viewed' ? 'bg-blue-100 text-blue-800' :
                      query.status === 'Responded' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {query.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Query Details Panel */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Query Details</h2>
        {!selectedQuery ? (
          <p>Select a query to view details.</p>
        ) : (
          <div>
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">{selectedQuery.subject}</h3>
                <span className={`text-xs px-2 py-1 rounded ${
                  selectedQuery.priority === 'Low' ? 'bg-green-100 text-green-800' :
                  selectedQuery.priority === 'Medium' ? 'bg-blue-100 text-blue-800' :
                  selectedQuery.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {selectedQuery.priority}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                From: {selectedQuery.patientId.name} (ID: {selectedQuery.patientId.patientId})
              </p>
              <p className="text-sm text-gray-600">
                Submitted: {new Date(selectedQuery.createdAt).toLocaleString()}
              </p>
            </div>
            
            <div className="bg-gray-100 p-3 rounded mb-4">
              <p className="whitespace-pre-wrap">{selectedQuery.message}</p>
            </div>
            
            {/* Response Form */}
            <form onSubmit={updateQuery}>
              <div className="mb-4">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  value={queryStatusUpdate}
                  onChange={(e) => setQueryStatusUpdate(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="Pending">Pending</option>
                  <option value="Viewed">Viewed</option>
                  <option value="Responded">Responded</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label htmlFor="response" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Response
                </label>
                <textarea
                  id="response"
                  value={queryResponse}
                  onChange={(e) => setQueryResponse(e.target.value)}
                  rows="5"
                  className="w-full p-2 border rounded"
                  placeholder="Type your response here..."
                ></textarea>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={updatingQuery}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
                >
                  {updatingQuery ? 'Updating...' : 'Update Query'}
                </button>
              </div>
            </form>
{/* Previous Responses (if you implement tracking multiple responses) */}
{selectedQuery.responses && selectedQuery.responses.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-2">Previous Responses</h4>
                    <div className="space-y-3">
                      {selectedQuery.responses.map((resp, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded border">
                          <p className="text-sm text-gray-600">
                            {new Date(resp.timestamp).toLocaleString()}
                          </p>
                          <p className="whitespace-pre-wrap">{resp.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CaretakerDashboard;