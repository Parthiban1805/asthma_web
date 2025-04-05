import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DoctorNavbar from '../../utils/DoctorNavbar'

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
    // Added new fields
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
        console.log("manage",formData)
        await axios.put(`http://localhost:5000/api/patients/${selectedPatient._id}`, formData);
        setMessage({ text: 'Patient updated successfully', type: 'success' });
      } else {
        // Add new patient
        await axios.post('http://localhost:5000/api/patients', formData);
        setMessage({ text: 'Patient added successfully', type: 'success' });
      }
      
      // Reset form and fetch updated list
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
      // Added new fields
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
      // Reset new fields
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

  // Calculate age from date of birth
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

  return (
        <>
              <DoctorNavbar />
          <div className="container mx-auto px-4 py-6">
    
    
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Patient Management</h1>

      {message.text && (
        <div
          className={`p-4 mb-4 rounded-md ${
            message.type === 'success'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="mb-6">
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add New Patient
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="font-bold text-lg">Patient List</h2>
            </div>

            {loading ? (
              <div className="flex items-center justify-center p-6">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : patients.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {patients.map((patient) => (
                  <li
                    key={patient.id}
                    className={`px-6 py-4 hover:bg-gray-50 cursor-pointer ${
                      selectedPatient?.id === patient.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleViewPatient(patient)}
                  >
                    <div className="font-medium">{patient.name}</div>
                    <div className="text-sm text-gray-500">
                      ID: {patient.patientId || 'N/A'} | Age: {patient.age || 'N/A'}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-6 text-center text-gray-500">No patients found</div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {showForm ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h2 className="font-bold text-lg">
                  {selectedPatient ? 'Edit Patient' : 'Add New Patient'}
                </h2>
              </div>

              <div className="p-6">
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal Information Section */}
                    <div className="md:col-span-2">
                      <h3 className="font-medium text-lg mb-3 text-gray-700 border-b pb-2">Personal Information</h3>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Patient ID
                      </label>
                      <input
                        type="text"
                        name="patientId"
                        value={formData.patientId}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={calculateAge}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Age
                      </label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        BMI
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="bmi"
                        value={formData.bmi}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    {/* Medical Information Section */}
                    <div className="md:col-span-2">
                      <h3 className="font-medium text-lg mb-3 text-gray-700 border-b pb-2 mt-4">Medical Information</h3>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lung Function FEV1
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="lungFunctionFEV1"
                        value={formData.lungFunctionFEV1}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lung Function FVC
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="lungFunctionFVC"
                        value={formData.lungFunctionFVC}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    {/* Checkboxes for various conditions */}
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="petAllergy"
                          name="petAllergy"
                          checked={formData.petAllergy}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="petAllergy" className="ml-2 text-sm text-gray-700">
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
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="familyHistoryAsthma" className="ml-2 text-sm text-gray-700">
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
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="historyOfAllergies" className="ml-2 text-sm text-gray-700">
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
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="hayfever" className="ml-2 text-sm text-gray-700">
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
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="gastroesophagealReflux" className="ml-2 text-sm text-gray-700">
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
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="exerciseInduced" className="ml-2 text-sm text-gray-700">
                          Exercise Induced
                        </label>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Medical History
                      </label>
                      <textarea
                        name="medicalHistory"
                        value={formData.medicalHistory}
                        onChange={handleInputChange}
                        rows="4"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      ></textarea>
                    </div>
                  </div>

                  <div className="mt-6 flex space-x-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading
                        ? 'Saving...'
                        : selectedPatient
                        ? 'Update Patient'
                        : 'Add Patient'}
                    </button>

                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : selectedPatient ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h2 className="font-bold text-lg">Patient Details</h2>

                <button
                  onClick={() => handleEditPatient(selectedPatient)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Edit Patient
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information Section */}
                  <div className="md:col-span-2">
                    <h3 className="font-medium text-lg mb-3 text-gray-700 border-b pb-2">Personal Information</h3>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Patient ID</h3>
                    <p className="mt-1">{selectedPatient.patientId || '—'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                    <p className="mt-1">{selectedPatient.name}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p className="mt-1">{selectedPatient.email || '—'}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
                    <p className="mt-1">{selectedPatient.phone}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Date of Birth</h3>
                    <p className="mt-1">{selectedPatient.dateOfBirth || '—'}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Age</h3>
                    <p className="mt-1">{selectedPatient.age || '—'}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Gender</h3>
                    <p className="mt-1">{selectedPatient.gender || '—'}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">BMI</h3>
                    <p className="mt-1">{selectedPatient.bmi || '—'}</p>
                  </div>

                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-gray-500">Address</h3>
                    <p className="mt-1">{selectedPatient.address || '—'}</p>
                  </div>

                  {/* Medical Information Section */}
                  <div className="md:col-span-2">
                    <h3 className="font-medium text-lg mb-3 text-gray-700 border-b pb-2 mt-4">Medical Information</h3>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Lung Function FEV1</h3>
                    <p className="mt-1">{selectedPatient.lungFunctionFEV1 || '—'}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Lung Function FVC</h3>
                    <p className="mt-1">{selectedPatient.lungFunctionFVC || '—'}</p>
                  </div>

                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Pet Allergy</h3>
                      <p className="mt-1">{selectedPatient.petAllergy ? 'Yes' : 'No'}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Family History of Asthma</h3>
                      <p className="mt-1">{selectedPatient.familyHistoryAsthma ? 'Yes' : 'No'}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500">History of Allergies</h3>
                      <p className="mt-1">{selectedPatient.historyOfAllergies ? 'Yes' : 'No'}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Hayfever</h3>
                      <p className="mt-1">{selectedPatient.hayfever ? 'Yes' : 'No'}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Gastroesophageal Reflux</h3>
                      <p className="mt-1">{selectedPatient.gastroesophagealReflux ? 'Yes' : 'No'}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Exercise Induced</h3>
                      <p className="mt-1">{selectedPatient.exerciseInduced ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-gray-500">Medical History</h3>
                    <p className="mt-1 whitespace-pre-line">
                      {selectedPatient.medicalHistory || '—'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-500">
                Select a patient from the list or add a new one
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