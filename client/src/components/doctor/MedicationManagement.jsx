import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DoctorNavbar from '../../utils/DoctorNavbar';

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
      console.log(patientId);
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
      fetchPrescriptions(selectedPatient._id);
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-6 text-indigo-800">Medication Management</h1>
            
            {message.text && (
              <div className={`p-4 mb-6 rounded-lg shadow-md ${
                message.type === 'success' ? 'bg-emerald-100 text-emerald-700 border-l-4 border-emerald-500' : 'bg-rose-100 text-rose-700 border-l-4 border-rose-500'
              }`}>
                {message.text}
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl shadow-xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-indigo-500/30">
                    <h2 className="font-bold text-lg text-white">Select Patient</h2>
                  </div>
                  
                  {loading && patients.length === 0 ? (
                    <div className="flex items-center justify-center p-10">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white"></div>
                    </div>
                  ) : patients.length > 0 ? (
                    <ul className="divide-y divide-indigo-500/30 max-h-96 overflow-y-auto">
                      {patients.map((patient) => (
                        <li 
                          key={patient._id}
                          className={`px-6 py-4 hover:bg-indigo-700/50 cursor-pointer transition duration-200 ${
                            selectedPatient?._id === patient._id ? 'bg-indigo-700/70' : ''
                          }`}
                          onClick={() => handlePatientSelect(patient)}
                        >
                          <div className="font-medium text-white">{patient.name}</div>
                          <div className="text-sm text-indigo-200">{patient.email || patient.phone}</div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-6 text-center text-indigo-200">No patients found</div>
                  )}
                </div>
              </div>
              
              <div className="lg:col-span-2">
                {selectedPatient ? (
                  <>
                    <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden mb-8">
                      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-700 flex justify-between items-center">
                        <h2 className="font-bold text-lg text-white">
                          Prescriptions for {selectedPatient.name}
                        </h2>
                        
                        <button
                          onClick={() => setShowForm(true)}
                          className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition duration-200 shadow-md"
                        >
                          Add Prescription
                        </button>
                      </div>
                      
                      {loading && prescriptions.length === 0 ? (
                        <div className="flex items-center justify-center p-10">
                          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
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
                                <tr key={prescription.id} className="hover:bg-blue-50 transition duration-150">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-medium text-indigo-800">{prescription.medicationName}</div>
                                    <div className="text-sm text-gray-600">{prescription.frequency}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                                    {prescription.dosage}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                                    {new Date(prescription.startDate).toLocaleDateString()}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                      prescription.status === 'Active' 
                                        ? 'bg-emerald-100 text-emerald-800' 
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
                        <div className="p-10 text-center text-gray-500">No prescriptions found</div>
                      )}
                    </div>
                    
                    {showForm && (
                      <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-700">
                          <h2 className="font-bold text-lg text-white">Add New Prescription</h2>
                        </div>
                        
                        <div className="p-6">
                          <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-sm font-medium text-indigo-700 mb-1">Medication Name</label>
                                <input
                                  type="text"
                                  name="medicationName"
                                  value={formData.medicationName}
                                  onChange={handleInputChange}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                  required
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-indigo-700 mb-1">Dosage</label>
                                <input
                                  type="text"
                                  name="dosage"
                                  value={formData.dosage}
                                  onChange={handleInputChange}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                  required
                                  placeholder="e.g. 500mg"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-indigo-700 mb-1">Frequency</label>
                                <input
                                  type="text"
                                  name="frequency"
                                  value={formData.frequency}
                                  onChange={handleInputChange}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                  required
                                  placeholder="e.g. Twice daily with meals"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-indigo-700 mb-1">Duration</label>
                                <input
                                  type="text"
                                  name="duration"
                                  value={formData.duration}
                                  onChange={handleInputChange}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                  placeholder="e.g. 7 days, 2 weeks"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-indigo-700 mb-1">Start Date</label>
                                <input
                                  type="date"
                                  name="startDate"
                                  value={formData.startDate}
                                  onChange={handleInputChange}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                  required
                                />
                              </div>
                              
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-indigo-700 mb-1">Instructions</label>
                                <textarea
                                  name="instructions"
                                  value={formData.instructions}
                                  onChange={handleInputChange}
                                  rows="3"
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                  placeholder="Special instructions for the patient"
                                ></textarea>
                              </div>
                            </div>
                            
                            <div className="mt-8 flex space-x-4">
                              <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 shadow-md disabled:opacity-50 transition duration-200"
                              >
                                {loading ? 'Saving...' : 'Add Prescription'}
                              </button>
                              
                              <button
                                type="button"
                                onClick={resetForm}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 shadow-md transition duration-200"
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
                  <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl shadow-xl p-10 text-center flex flex-col items-center justify-center">
                    <div className="text-6xl text-indigo-300 mb-4">👨‍⚕️</div>
                    <p className="text-indigo-800 text-lg">Please select a patient to view or add prescriptions</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MedicationManagement;