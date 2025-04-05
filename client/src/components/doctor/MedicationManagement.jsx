import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DoctorNavbar from '../../utils/DoctorNavbar'

const MedicationManagement = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [formData, setFormData] = useState({
    medicationName: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
    startDate: new Date().toISOString().split('T')[0]
  });
  
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        // Get doctorId from localStorage
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
    
    fetchPatients();
  }, []);
  
  const fetchPrescriptions = async (patientId) => {
    try {
      setLoading(true);
      console.log(patientId)
      const response = await axios.get(`http://localhost:5000/api/medications/${patientId}`);
      setPrescriptions(response.data);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      setMessage({ text: 'Failed to load prescriptions', type: 'error' });
    } finally {
      setLoading(false);
    }
  };
  
  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    fetchPrescriptions(patient._id);
    setShowForm(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post('http://localhost:5000/api/medications', {
        ...formData,
        patientId: selectedPatient._id
      });
      
      setMessage({ text: 'Prescription added successfully', type: 'success' });
      resetForm();
      fetchPrescriptions(selectedPatient.id);
    } catch (error) {
      console.error('Error saving prescription:', error);
      setMessage({ text: 'Failed to add prescription', type: 'error' });
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setFormData({
      medicationName: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      startDate: new Date().toISOString().split('T')[0]
    });
    setShowForm(false);
  };

  return (
        <>
              <DoctorNavbar />
          <div className="container mx-auto px-4 py-6">
    
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Medication Management</h1>
      
      {message.text && (
        <div className={`p-4 mb-4 rounded-md ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="font-bold text-lg">Select Patient</h2>
            </div>
            
            {loading && patients.length === 0 ? (
              <div className="flex items-center justify-center p-6">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : patients.length > 0 ? (
              <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {patients.map((patient) => (
                  <li 
                  key={patient._id}
                  className={`px-6 py-4 hover:bg-gray-50 cursor-pointer ${
                      selectedPatient?.id === patient.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handlePatientSelect(patient)}
                  >
                    <div className="font-medium">{patient.name}</div>
                    <div className="text-sm text-gray-500">{patient.email || patient.phone}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-6 text-center text-gray-500">No patients found</div>
            )}
          </div>
        </div>
        
        <div className="lg:col-span-2">
          {selectedPatient ? (
            <>
              <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
                <div className="px-6 py-4 border-b flex justify-between items-center">
                  <h2 className="font-bold text-lg">
                    Prescriptions for {selectedPatient.name}
                  </h2>
                  
                  <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add Prescription
                  </button>
                </div>
                
                {loading && prescriptions.length === 0 ? (
                  <div className="flex items-center justify-center p-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : prescriptions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medication</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dosage</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {prescriptions.map((prescription) => (
                          <tr key={prescription.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">{prescription.medicationName}</div>
                              <div className="text-sm text-gray-500">{prescription.frequency}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {prescription.dosage}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {new Date(prescription.startDate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                prescription.status === 'Active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {prescription.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-500">No prescriptions found</div>
                )}
              </div>
              
              {showForm && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-6 py-4 border-b">
                    <h2 className="font-bold text-lg">Add New Prescription</h2>
                  </div>
                  
                  <div className="p-6">
                    <form onSubmit={handleSubmit}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Medication Name</label>
                          <input
                            type="text"
                            name="medicationName"
                            value={formData.medicationName}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                          <input
                            type="text"
                            name="dosage"
                            value={formData.dosage}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            required
                            placeholder="e.g. 500mg"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                          <input
                            type="text"
                            name="frequency"
                            value={formData.frequency}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            required
                            placeholder="e.g. Twice daily with meals"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                          <input
                            type="text"
                            name="duration"
                            value={formData.duration}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="e.g. 7 days, 2 weeks"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                          <input
                            type="date"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            required
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                          <textarea
                            name="instructions"
                            value={formData.instructions}
                            onChange={handleInputChange}
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="Special instructions for the patient"
                          ></textarea>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex space-x-4">
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                          {loading ? 'Saving...' : 'Add Prescription'}
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
              )}
            </>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-500">Please select a patient to view or add prescriptions</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
    </>
  );
};

export default MedicationManagement;
