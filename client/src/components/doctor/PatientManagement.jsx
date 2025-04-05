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
    age: '',
    bmi: '',
    petAllergy: false,
    familyHistoryAsthma: false,
    historyOfAllergies: false,
    hayfever: false,
    gastroesophagealReflux: false,
    lungFunctionFEV1: '',
    lungFunctionFVC: '',
    exerciseInduced: false
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchPatients = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const doctorId = user?.doctorId;

      if (!doctorId) {
        setMessage({ text: 'Doctor ID not found', type: 'error' });
        return;
      }

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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (selectedPatient) {
        console.log("manage", formData);
        await axios.put(`http://localhost:5000/api/patients/${selectedPatient._id}`, formData);
        setMessage({ text: 'Patient updated successfully', type: 'success' });
      } else {
        await axios.post('http://localhost:5000/api/patients', formData);
        setMessage({ text: 'Patient added successfully', type: 'success' });
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
      age: patient.age || '',
      bmi: patient.bmi || '',
      petAllergy: patient.petAllergy || false,
      familyHistoryAsthma: patient.familyHistoryAsthma || false,
      historyOfAllergies: patient.historyOfAllergies || false,
      hayfever: patient.hayfever || false,
      gastroesophagealReflux: patient.gastroesophagealReflux || false,
      lungFunctionFEV1: patient.lungFunctionFEV1 || '',
      lungFunctionFVC: patient.lungFunctionFVC || '',
      exerciseInduced: patient.exerciseInduced || false
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
      age: '',
      bmi: '',
      petAllergy: false,
      familyHistoryAsthma: false,
      historyOfAllergies: false,
      hayfever: false,
      gastroesophagealReflux: false,
      lungFunctionFEV1: '',
      lungFunctionFVC: '',
      exerciseInduced: false
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
      age: age.toString()
    });
  };

  // Generate badge color based on patient condition
  const generateBadgeColor = (patient) => {
    const conditions = [
      patient.petAllergy,
      patient.familyHistoryAsthma,
      patient.historyOfAllergies,
      patient.hayfever,
      patient.gastroesophagealReflux,
      patient.exerciseInduced
    ];
    
    const count = conditions.filter(Boolean).length;
    
    if (count >= 4) return "bg-red-100 text-red-800 border-red-200";
    if (count >= 2) return "bg-yellow-100 text-yellow-800 border-yellow-200";
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
                          <input
                            type="text"
                            name="patientId"
                            value={formData.patientId}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            required
                          />
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
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id="petAllergy"
                                name="petAllergy"
                                checked={formData.petAllergy}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              />
                              <label htmlFor="petAllergy" className="ml-2 text-sm text-indigo-700">
                                Pet Allergy
                              </label>
                            </div>

                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id="familyHistoryAsthma"
                                name="familyHistoryAsthma"
                                checked={formData.familyHistoryAsthma}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              />
                              <label htmlFor="familyHistoryAsthma" className="ml-2 text-sm text-indigo-700">
                                Family History of Asthma
                              </label>
                            </div>

                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id="historyOfAllergies"
                                name="historyOfAllergies"
                                checked={formData.historyOfAllergies}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              />
                              <label htmlFor="historyOfAllergies" className="ml-2 text-sm text-indigo-700">
                                History of Allergies
                              </label>
                            </div>

                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id="hayfever"
                                name="hayfever"
                                checked={formData.hayfever}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              />
                              <label htmlFor="hayfever" className="ml-2 text-sm text-indigo-700">
                                Hayfever
                              </label>
                            </div>

                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id="gastroesophagealReflux"
                                name="gastroesophagealReflux"
                                checked={formData.gastroesophagealReflux}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              />
                              <label htmlFor="gastroesophagealReflux" className="ml-2 text-sm text-indigo-700">
                                Gastroesophageal Reflux
                              </label>
                            </div>

                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id="exerciseInduced"
                                name="exerciseInduced"
                                checked={formData.exerciseInduced}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              />
                              <label htmlFor="exerciseInduced" className="ml-2 text-sm text-indigo-700">
                                Exercise Induced
                              </label>
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

                    <button
                      onClick={() => handleEditPatient(selectedPatient)}
                      className="px-4 py-2 bg-white text-indigo-700 rounded-md hover:bg-indigo-50 transition-all duration-200 flex items-center shadow-md"
                    >
<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Edit
                    </button>
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
                        <p className="text-sm text-indigo-500 mb-1">Patient ID</p>
                        <p className="font-medium">{selectedPatient.patientId || 'Not provided'}</p>
                      </div>

                      <div>
                        <p className="text-sm text-indigo-500 mb-1">Full Name</p>
                        <p className="font-medium">{selectedPatient.name}</p>
                      </div>

                      <div>
                        <p className="text-sm text-indigo-500 mb-1">Email</p>
                        <p className="font-medium">{selectedPatient.email || 'Not provided'}</p>
                      </div>

                      <div>
                        <p className="text-sm text-indigo-500 mb-1">Phone Number</p>
                        <p className="font-medium">{selectedPatient.phone || 'Not provided'}</p>
                      </div>

                      <div>
                        <p className="text-sm text-indigo-500 mb-1">Date of Birth</p>
                        <p className="font-medium">{selectedPatient.dateOfBirth || 'Not provided'}</p>
                      </div>

                      <div>
                        <p className="text-sm text-indigo-500 mb-1">Age</p>
                        <p className="font-medium">{selectedPatient.age || 'Not provided'}</p>
                      </div>

                      <div>
                        <p className="text-sm text-indigo-500 mb-1">Gender</p>
                        <p className="font-medium">{selectedPatient.gender || 'Not provided'}</p>
                      </div>

                      <div>
                        <p className="text-sm text-indigo-500 mb-1">BMI</p>
                        <p className="font-medium">{selectedPatient.bmi || 'Not provided'}</p>
                      </div>

                      <div className="md:col-span-2">
                        <p className="text-sm text-indigo-500 mb-1">Address</p>
                        <p className="font-medium">{selectedPatient.address || 'Not provided'}</p>
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
                        <p className="text-sm text-indigo-500 mb-1">Lung Function FEV1</p>
                        <p className="font-medium">{selectedPatient.lungFunctionFEV1 || 'Not provided'}</p>
                      </div>

                      <div>
                        <p className="text-sm text-indigo-500 mb-1">Lung Function FVC</p>
                        <p className="font-medium">{selectedPatient.lungFunctionFVC || 'Not provided'}</p>
                      </div>

                      {/* Medical Conditions */}
                      <div className="md:col-span-2">
                        <h4 className="text-sm font-medium text-indigo-700 mb-3">Medical Conditions</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-indigo-50 p-4 rounded-lg">
                          <div className="flex items-center">
                            <div className={`h-4 w-4 rounded ${selectedPatient.petAllergy ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                            <span className="ml-2 text-sm text-indigo-700">Pet Allergy</span>
                          </div>

                          <div className="flex items-center">
                            <div className={`h-4 w-4 rounded ${selectedPatient.familyHistoryAsthma ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                            <span className="ml-2 text-sm text-indigo-700">Family History of Asthma</span>
                          </div>

                          <div className="flex items-center">
                            <div className={`h-4 w-4 rounded ${selectedPatient.historyOfAllergies ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                            <span className="ml-2 text-sm text-indigo-700">History of Allergies</span>
                          </div>

                          <div className="flex items-center">
                            <div className={`h-4 w-4 rounded ${selectedPatient.hayfever ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                            <span className="ml-2 text-sm text-indigo-700">Hayfever</span>
                          </div>

                          <div className="flex items-center">
                            <div className={`h-4 w-4 rounded ${selectedPatient.gastroesophagealReflux ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                            <span className="ml-2 text-sm text-indigo-700">Gastroesophageal Reflux</span>
                          </div>

                          <div className="flex items-center">
                            <div className={`h-4 w-4 rounded ${selectedPatient.exerciseInduced ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                            <span className="ml-2 text-sm text-indigo-700">Exercise Induced</span>
                          </div>
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <p className="text-sm text-indigo-500 mb-1">Medical History</p>
                        <div className="bg-gray-50 p-3 rounded border border-indigo-100 mt-1">
                          <p className="whitespace-pre-wrap">
                            {selectedPatient.medicalHistory || 'No medical history provided'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-indigo-100 h-full flex flex-col items-center justify-center p-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-indigo-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-xl font-medium text-indigo-800 mb-2">No Patient Selected</h3>
                  <p className="text-indigo-500 text-center max-w-sm">
                    Please select a patient from the list to view their details or add a new patient using the button above.
                  </p>
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