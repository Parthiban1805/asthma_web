import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DoctorNavbar from '../../utils/DoctorNavbar';

const PatientManagement = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    medicalHistory: '',
    patientId: '',
    age: 0,
    bmi: 0,
    petAllergy: 0,
    familyHistoryAsthma: 0,
    historyOfAllergies: 0,
    hayfever: 0,
    gastroesophagealReflux: 0,
    lungFunctionFEV1: 0,
    lungFunctionFVC: 0,
    exerciseInduced: 0,
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [doctorId, setDoctorId] = useState("");

  const fetchPatients = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const doctorId = user?.doctorId;

      if (!doctorId) {
        setMessage({ text: 'Doctor ID not found', type: 'error' });
        return;
      }
      setDoctorId(doctorId);
      console.log(doctorId);
      const response = await axios.get(`http://localhost:5000/api/patient?doctorId=${doctorId}`);
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setMessage({ text: 'Failed to load patients', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);
  const checkPatientId = async (patientId) => {
    if (!patientId) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/patients/byPatientId/${patientId}`);
      
      if (response.data) {
        // Patient exists, populate the form with retrieved data
        const patient = response.data;
        setFormData({
          patientId: patient.patientId,
          name: patient.name || '',
          email: patient.email || '',
          phone: patient.phone || '',
          dateOfBirth: patient.dateOfBirth || '',
          gender: patient.gender || '',
          address: patient.address || '',
          medicalHistory: patient.medicalHistory || '',
          age: Number(patient.age) || 0,
          bmi: Number(patient.bmi) || 0,
          petAllergy: Number(patient.petAllergy) || 0,
          familyHistoryAsthma: Number(patient.familyHistoryAsthma) || 0,
          historyOfAllergies: Number(patient.historyOfAllergies) || 0,
          hayfever: Number(patient.hayfever) || 0,
          gastroesophagealReflux: Number(patient.gastroesophagealReflux) || 0,
          lungFunctionFEV1: Number(patient.lungFunctionFEV1) || 0,
          lungFunctionFVC: Number(patient.lungFunctionFVC) || 0,
          exerciseInduced: Number(patient.exerciseInduced) || 0
        });
        
        // Optional: Show a message to the doctor
        setMessage({ 
          text: 'Patient data loaded successfully. You can update the information if needed.', 
          type: 'info' 
        });
      }
    } catch (error) {
      // If 404, it means patient not found, but that's okay for a new entry
      if (error.response && error.response.status !== 404) {
        console.error('Error checking patient ID:', error);
        setMessage({ 
          text: 'Error checking patient ID', 
          type: 'error' 
        });
      }
    } finally {
      setLoading(false);
    }
  };
  
  
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    // Check if the changed field is patientId
    if (name === 'patientId') {
      // Update the form data first
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Only check patient ID if there's a value and it's longer than a minimum length (e.g., 3 characters)
      if (value && value.length >= 3) {
        checkPatientId(value);
      }
      return;
    }
    
    // Handle numeric fields (including the former checkbox fields)
    if (
      name === 'age' || 
      name === 'bmi' || 
      name === 'lungFunctionFEV1' || 
      name === 'lungFunctionFVC' ||
      name === 'petAllergy' ||
      name === 'familyHistoryAsthma' ||
      name === 'historyOfAllergies' ||
      name === 'hayfever' ||
      name === 'gastroesophagealReflux' ||
      name === 'exerciseInduced'
    ) {
      // Convert string to number for numeric fields
      setFormData({
        ...formData,
        [name]: value === '' ? 0 : Number(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const doctorId = user?.doctorId;
  
      const updatedFormData = {
        ...formData,
        doctorId: doctorId,
        // Ensure all numeric fields are numbers
        age: Number(formData.age) || 0,
        bmi: Number(formData.bmi) || 0,
        lungFunctionFEV1: Number(formData.lungFunctionFEV1) || 0,
        lungFunctionFVC: Number(formData.lungFunctionFVC) || 0,
        petAllergy: Number(formData.petAllergy) || 0,
        familyHistoryAsthma: Number(formData.familyHistoryAsthma) || 0,
        historyOfAllergies: Number(formData.historyOfAllergies) || 0,
        hayfever: Number(formData.hayfever) || 0,
        gastroesophagealReflux: Number(formData.gastroesophagealReflux) || 0,
        exerciseInduced: Number(formData.exerciseInduced) || 0
      };
  
      if (selectedPatient) {
        // Update existing patient
        await axios.put(`http://localhost:5000/api/patients/${selectedPatient._id}`, updatedFormData);
        setMessage({ text: 'Patient updated successfully', type: 'success' });
      } else {
        // Check if we're updating an existing patient by patientId
        try {
          const existingPatient = await axios.get(`http://localhost:5000/api/patients/byPatientId/${formData.patientId}`);
          
          if (existingPatient.data) {
            // Update existing patient found by patientId
            await axios.put(`http://localhost:5000/api/doctor/patients/${existingPatient.data._id}`, updatedFormData);
            setMessage({ text: 'Patient updated successfully', type: 'success' });
          }
        } catch (error) {
          if (error.response && error.response.status === 404) {
            // Patient doesn't exist, create a new one
            await axios.post('http://localhost:5000/api/patients', updatedFormData);
            setMessage({ text: 'Patient added successfully', type: 'success' });
          } else {
            throw error; // Re-throw for the outer catch to handle
          }
        }
      }
  
      resetForm();
      fetchPatients();
    } catch (error) {
      console.error('Error saving patient:', error);
      setMessage({ 
        text: selectedPatient ? 'Failed to update patient' : 'Failed to add patient', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };
  
    
  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setShowForm(false);
  };

  const handleEditPatient = (patient) => {
    setSelectedPatient(patient);
    setFormData({
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      address: patient.address,
      medicalHistory: patient.medicalHistory,
      patientId: patient.patientId || '',
      age: Number(patient.age) || 0,
      bmi: Number(patient.bmi) || 0,
      petAllergy: Number(patient.petAllergy) || 0,
      familyHistoryAsthma: Number(patient.familyHistoryAsthma) || 0,
      historyOfAllergies: Number(patient.historyOfAllergies) || 0,
      hayfever: Number(patient.hayfever) || 0,
      gastroesophagealReflux: Number(patient.gastroesophagealReflux) || 0,
      lungFunctionFEV1: Number(patient.lungFunctionFEV1) || 0,
      lungFunctionFVC: Number(patient.lungFunctionFVC) || 0,
      exerciseInduced: Number(patient.exerciseInduced) || 0
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      address: '',
      medicalHistory: '',
      patientId: '',
      age: 0,
      bmi: 0,
      petAllergy: 0,
      familyHistoryAsthma: 0,
      historyOfAllergies: 0,
      hayfever: 0,
      gastroesophagealReflux: 0,
      lungFunctionFEV1: 0,
      lungFunctionFVC: 0,
      exerciseInduced: 0
    });
    setSelectedPatient(null);
    setShowForm(false);
  };

  const calculateAge = (e) => {
    const birthDate = new Date(e.target.value);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    setFormData({
      ...formData,
      dateOfBirth: e.target.value,
      age: age
    });
  };

  // Generate badge color based on patient condition
  const generateBadgeColor = (patient) => {
    // Count the sum of numeric values instead of just checking if they're 1
    const conditionSum = 
      Number(patient.petAllergy || 0) +
      Number(patient.familyHistoryAsthma || 0) +
      Number(patient.historyOfAllergies || 0) +
      Number(patient.hayfever || 0) +
      Number(patient.gastroesophagealReflux || 0) +
      Number(patient.exerciseInduced || 0);
    
    if (conditionSum >= 4) return "bg-red-100 text-red-800 border-red-200";
    if (conditionSum >= 2) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-green-100 text-green-800 border-green-200";
  };
  
  return (
    <>
      <DoctorNavbar />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-indigo-900">Patient Management</h1>
              <p className="text-indigo-600 mt-1">Manage your patients' records efficiently</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-all duration-200 flex items-center shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add New Patient
            </button>
          </div>

          {message.text && (
            <div
              className={`p-4 mb-6 rounded-lg shadow ${
                message.type === 'success'
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}
            >
              <div className="flex items-center">
                {message.type === 'success' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
                {message.text}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-indigo-100">
                <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-500">
                  <h2 className="font-bold text-lg text-white">Patient List</h2>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-indigo-600"></div>
                  </div>
                ) : patients.length > 0 ? (
                  <ul className="divide-y divide-indigo-100">
                    {patients.map((patient) => (
                      <li
                        key={patient.id}
                        className={`px-6 py-4 hover:bg-indigo-50 cursor-pointer transition-all duration-200 ${
                          selectedPatient?.id === patient.id ? 'bg-indigo-100' : ''
                        }`}
                        onClick={() => handleViewPatient(patient)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-indigo-900">{patient.name}</div>
                            <div className="text-sm text-indigo-600">
                              ID: {patient.patientId || 'N/A'} | Age: {patient.age || 'N/A'}
                            </div>
                          </div>
                          <div className={`text-xs px-3 py-1 rounded-full border ${generateBadgeColor(patient)}`}>
                            {patient.gender || 'Unknown'}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-8 text-center text-indigo-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>No patients found</p>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-2">
              {showForm ? (
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-indigo-100">
                  <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-500">
                    <h2 className="font-bold text-lg text-white">
                      {selectedPatient ? 'Edit Patient Information' : 'Add New Patient'}
                    </h2>
                  </div>

                  <div className="p-6">
                    <form onSubmit={handleSubmit}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Personal Information Section */}
                        <div className="md:col-span-2">
                          <h3 className="font-medium text-lg mb-3 text-indigo-800 border-b border-indigo-200 pb-2 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                            Personal Information
                          </h3>
                        </div>
                        
                        <div>
  <label className="block text-sm font-medium text-indigo-700 mb-1">
    Patient ID
  </label>
  <div className="relative">
    <input
      type="text"
      name="patientId"
      value={formData.patientId}
      onChange={handleInputChange}
      className="w-full px-3 py-2 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      required
    />
    {loading && formData.patientId && (
      <div className="absolute right-2 top-2">
        <svg className="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    )}
  </div>
  {message.type === 'info' && (
    <p className="mt-1 text-sm text-blue-600">{message.text}</p>
  )}
</div>
                        
                        <div>
                          <label className="block text-sm font-medium text-indigo-700 mb-1">
                            Full Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-indigo-700 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-indigo-700 mb-1">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-indigo-700 mb-1">
                            Date of Birth
                          </label>
                          <input
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={calculateAge}
                            className="w-full px-3 py-2 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-indigo-700 mb-1">
                            Age
                          </label>
                          <input
                            type="number"
                            name="age"
                            value={formData.age}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-indigo-700 mb-1">
                            Gender
                          </label>
                          <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-indigo-700 mb-1">
                            BMI
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            name="bmi"
                            value={formData.bmi}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-indigo-700 mb-1">
                            Address
                          </label>
                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>

                        {/* Medical Information Section */}
                        <div className="md:col-span-2">
                          <h3 className="font-medium text-lg mb-3 text-indigo-800 border-b border-indigo-200 pb-2 mt-4 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                            </svg>
                            Medical Information
                          </h3>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-indigo-700 mb-1">
                            Lung Function FEV1
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            name="lungFunctionFEV1"
                            value={formData.lungFunctionFEV1}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-indigo-700 mb-1">
                            Lung Function FVC
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            name="lungFunctionFVC"
                            value={formData.lungFunctionFVC}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>

                        {/* Checkboxes for various conditions */}
                        <div className="md:col-span-2">
  <h4 className="text-sm font-medium text-indigo-700 mb-3">Medical Conditions</h4>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-indigo-50 p-4 rounded-lg">
    <div>
      <label htmlFor="petAllergy" className="block text-sm text-indigo-700 mb-1">
        Pet Allergy
      </label>
      <input
        type="number"
        id="petAllergy"
        name="petAllergy"
        value={formData.petAllergy}
        onChange={handleInputChange}
        className="w-full px-3 py-2 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        min="0"
      />
    </div>

    <div>
      <label htmlFor="familyHistoryAsthma" className="block text-sm text-indigo-700 mb-1">
        Family History of Asthma
      </label>
      <input
        type="number"
        id="familyHistoryAsthma"
        name="familyHistoryAsthma"
        value={formData.familyHistoryAsthma}
        onChange={handleInputChange}
        className="w-full px-3 py-2 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        min="0"
      />
    </div>

    <div>
      <label htmlFor="historyOfAllergies" className="block text-sm text-indigo-700 mb-1">
        History of Allergies
      </label>
      <input
        type="number"
        id="historyOfAllergies"
        name="historyOfAllergies"
        value={formData.historyOfAllergies}
        onChange={handleInputChange}
        className="w-full px-3 py-2 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        min="0"
      />
    </div>

    <div>
      <label htmlFor="hayfever" className="block text-sm text-indigo-700 mb-1">
        Hayfever
      </label>
      <input
        type="number"
        id="hayfever"
        name="hayfever"
        value={formData.hayfever}
        onChange={handleInputChange}
        className="w-full px-3 py-2 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        min="0"
      />
    </div>

    <div>
      <label htmlFor="gastroesophagealReflux" className="block text-sm text-indigo-700 mb-1">
        Gastroesophageal Reflux
      </label>
      <input
        type="number"
        id="gastroesophagealReflux"
        name="gastroesophagealReflux"
        value={formData.gastroesophagealReflux}
        onChange={handleInputChange}
        className="w-full px-3 py-2 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        min="0"
      />
    </div>

    <div>
      <label htmlFor="exerciseInduced" className="block text-sm text-indigo-700 mb-1">
        Exercise Induced
      </label>
      <input
        type="number"
        id="exerciseInduced"
        name="exerciseInduced"
        value={formData.exerciseInduced}
        onChange={handleInputChange}
        className="w-full px-3 py-2 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        min="0"
      />
    </div>
  </div>
</div>

<div className="md:col-span-2">
  <label className="block text-sm font-medium text-indigo-700 mb-1">
    Medical History
  </label>
  <textarea
    name="medicalHistory"
    value={formData.medicalHistory}
    onChange={handleInputChange}
    rows="4"
    className="w-full px-3 py-2 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
  ></textarea>
</div>
                      </div>

                      <div className="mt-6 flex space-x-4">
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-md hover:from-indigo-700 hover:to-blue-600 disabled:opacity-50 transition-all duration-200 shadow-md flex items-center"
                        >
                          {loading ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Saving...
                            </>
                          ) : selectedPatient ? (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                              Update Patient
                            </>
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                              </svg>
                              Add Patient
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={resetForm}
                          className="px-5 py-2 border border-indigo-300 text-indigo-700 rounded-md hover:bg-indigo-50 transition-all duration-200 flex items-center"
                        >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Cancel
                      </button>
                      </div>
                    </form>
                  </div>
                </div>
              ) : selectedPatient ? (
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-indigo-100">
                  <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-500 flex justify-between items-center">
                    <h2 className="font-bold text-lg text-white">Patient Details</h2>
                    <div>
                      <button
                        onClick={() => handleEditPatient(selectedPatient)}
                        className="px-3 py-1 bg-white text-indigo-700 rounded-md hover:bg-indigo-50 transition-all duration-200 text-sm flex items-center shadow-sm mr-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Edit
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Personal Information Section */}
                      <div className="md:col-span-2">
                        <h3 className="font-medium text-lg mb-3 text-indigo-800 border-b border-indigo-200 pb-2 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                          Personal Information
                        </h3>
                      </div>

                      <div>
                        <p className="text-sm text-indigo-500">Patient ID</p>
                        <p className="font-medium">{selectedPatient.patientId || 'N/A'}</p>
                      </div>

                      <div>
                        <p className="text-sm text-indigo-500">Full Name</p>
                        <p className="font-medium">{selectedPatient.name}</p>
                      </div>

                      <div>
                        <p className="text-sm text-indigo-500">Email</p>
                        <p className="font-medium">{selectedPatient.email || 'N/A'}</p>
                      </div>

                      <div>
                        <p className="text-sm text-indigo-500">Phone Number</p>
                        <p className="font-medium">{selectedPatient.phone || 'N/A'}</p>
                      </div>

                      <div>
                        <p className="text-sm text-indigo-500">Date of Birth</p>
                        <p className="font-medium">{selectedPatient.dateOfBirth || 'N/A'}</p>
                      </div>

                      <div>
                        <p className="text-sm text-indigo-500">Age</p>
                        <p className="font-medium">{selectedPatient.age || 'N/A'}</p>
                      </div>

                      <div>
                        <p className="text-sm text-indigo-500">Gender</p>
                        <p className="font-medium">
                          <span className={`px-2 py-1 rounded-full text-xs ${generateBadgeColor(selectedPatient)}`}>
                            {selectedPatient.gender || 'Unknown'}
                          </span>
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-indigo-500">BMI</p>
                        <p className="font-medium">{selectedPatient.bmi || 'N/A'}</p>
                      </div>

                      <div className="md:col-span-2">
                        <p className="text-sm text-indigo-500">Address</p>
                        <p className="font-medium">{selectedPatient.address || 'N/A'}</p>
                      </div>

                      {/* Medical Information Section */}
                      <div className="md:col-span-2">
                        <h3 className="font-medium text-lg mb-3 text-indigo-800 border-b border-indigo-200 pb-2 mt-4 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                          </svg>
                          Medical Information
                        </h3>
                      </div>

                      <div>
                        <p className="text-sm text-indigo-500">Lung Function FEV1</p>
                        <p className="font-medium">{selectedPatient.lungFunctionFEV1 || 'N/A'}</p>
                      </div>

                      <div>
                        <p className="text-sm text-indigo-500">Lung Function FVC</p>
                        <p className="font-medium">{selectedPatient.lungFunctionFVC || 'N/A'}</p>
                      </div>

                      {/* Medical Conditions Card */}
                      <div className="md:col-span-2">
                        <div className="bg-indigo-50 p-4 rounded-lg">
                          <h4 className="text-indigo-700 font-medium mb-3">Medical Conditions</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {[
                              { label: "Pet Allergy", value: selectedPatient.petAllergy },
                              { label: "Family History of Asthma", value: selectedPatient.familyHistoryAsthma },
                              { label: "History of Allergies", value: selectedPatient.historyOfAllergies },
                              { label: "Hayfever", value: selectedPatient.hayfever },
                              { label: "Gastroesophageal Reflux", value: selectedPatient.gastroesophagealReflux },
                              { label: "Exercise Induced", value: selectedPatient.exerciseInduced }
                            ].map((condition, index) => (
                              <div key={index} className="flex items-center">
                                {condition.value === 1 ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-300" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                  </svg>
                                )}
                                <span className="ml-2 text-sm text-indigo-700">{condition.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <p className="text-sm text-indigo-500">Medical History</p>
                        <p className="font-medium whitespace-pre-line">{selectedPatient.medicalHistory || 'No medical history recorded.'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-indigo-100 h-full flex items-center justify-center p-12">
                  <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-medium text-indigo-900 mb-2">
                      Select a Patient or Add a New One
                    </h3>
                    <p className="text-indigo-600 mb-6">
                      Click on a patient from the list or add a new patient to get started
                    </p>
                    <button
                      onClick={() => {
                        resetForm();
                        setShowForm(true);
                      }}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-all duration-200 flex items-center mx-auto shadow-md"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Add New Patient
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PatientManagement;