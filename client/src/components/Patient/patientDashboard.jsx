import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PatientDashboard = () => {
    const [patient, setPatient] = useState(null);
    const [prescriptions, setPrescriptions] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [symptoms, setSymptoms] = useState([]);
    const [caretakers, setCaretakers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showSymptomForm, setShowSymptomForm] = useState(false);
    const [showAppointmentForm, setShowAppointmentForm] = useState(false);
    const [editingProfile, setEditingProfile] = useState(false);
    const [editedProfile, setEditedProfile] = useState({});
    
    // New symptom form state
    const [newSymptom, setNewSymptom] = useState({
      coughing: false,
      chestTightness: false,
      shortnessOfBreath: false,
      wheezing: false,
      nighttimeSymptoms: false,
      exercise: false,
      notes: '',
    });
    
    // New appointment form state
    const [newAppointment, setNewAppointment] = useState({
      dateTime: '',
      duration: 30,
      purpose: '',
      notes: '',
    });
    
    const navigate = useNavigate();
    
    useEffect(() => {
      const fetchData = async () => {
        try {
          const user = JSON.parse(localStorage.getItem('user'));
  
          // Check if the user exists and has a valid role
          if (!user || user.role !== 'patient') {
            throw new Error('User is not a patient or no user found');
          }
  
          const patientId = user.patientId;
          
          if (!patientId) {
            navigate('/login');
            return;
          }
          
          setLoading(true);
          
          try {
            // Fetch patient details
            const patientResponse = await axios.get(`http://localhost:5000/api/patients/${patientId}`);
            setPatient(patientResponse.data || {});
            setEditedProfile(patientResponse.data || {});
          } catch (err) {
            console.error("Error fetching patient data:", err);
            setPatient({});
            setEditedProfile({});
          }
          
          try {
            // Fetch prescriptions
            const prescriptionsResponse = await axios.get(`http://localhost:5000/api/patient-medications/${patientId}`);
            setPrescriptions(prescriptionsResponse.data || []);
          } catch (err) {
            console.error("Error fetching prescriptions:", err);
            setPrescriptions([]);
          }
          
          try {
            // Fetch appointments
            const appointmentsResponse = await axios.get(`http://localhost:5000/api/patient-appointments/${patientId}`);
            setAppointments(appointmentsResponse.data || []);
          } catch (err) {
            console.error("Error fetching appointments:", err);
            setAppointments([]);
          }
          
          try {
            // Fetch symptoms
            const symptomsResponse = await axios.get(`http://localhost:5000/api/symptoms/${patientId}`);
            setSymptoms(symptomsResponse.data || []);
          } catch (err) {
            console.error("Error fetching symptoms:", err);
            setSymptoms([]);
          }
          
          try {
            // Fetch caretakers
            const caretakersResponse = await axios.get(`http://localhost:5000/api/caretakers/${patientId}`);
            setCaretakers(caretakersResponse.data || []);
          } catch (err) {
            console.error("Error fetching caretakers:", err);
            setCaretakers([]);
          }
          
          setLoading(false);
        } catch (err) {
          setError('Failed to load dashboard data');
          setLoading(false);
          console.error(err);
        }
      };
      
      fetchData();
    }, [navigate]);
    
    const handleSymptomChange = (e) => {
      const { name, checked, value, type } = e.target;
      setNewSymptom({
        ...newSymptom,
        [name]: type === 'checkbox' ? checked : value
      });
    };
    
    const handleAppointmentChange = (e) => {
      const { name, value } = e.target;
      setNewAppointment({
        ...newAppointment,
        [name]: value
      });
    };

    const handleProfileChange = (e) => {
      const { name, value, type, checked } = e.target;
      setEditedProfile({
        ...editedProfile,
        [name]: type === 'checkbox' ? checked : value
      });
    };
    
    const submitSymptom = async (e) => {
      e.preventDefault();
      
      try {
        // It should be getting the patientId from the current user object:
        const user = JSON.parse(localStorage.getItem('user'));
        const patientId = user.patientId;
      
        const response = await axios.post('http://localhost:5000/api/symptoms', {
          ...newSymptom,
          patientId
        });
        
        setSymptoms([...symptoms, response.data]);
        setShowSymptomForm(false);
        setNewSymptom({
          coughing: false,
          chestTightness: false,
          shortnessOfBreath: false,
          wheezing: false,
          nighttimeSymptoms: false,
          exercise: false,
          notes: '',
        });
      } catch (err) {
        console.error(err);
        alert('Failed to add symptom record');
      }
    };
    
    const submitAppointment = async (e) => {
      e.preventDefault();
      
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        // Use the MongoDB _id of the patient from your patient state
        const patientMongoId = patient?._id; 
        
        if (!patientMongoId) {
          throw new Error("Patient ID not available");
        }
        
        const response = await axios.post('http://localhost:5000/api/appointments', {
          ...newAppointment,
          patientId: patientMongoId,
          doctorId: patient?.doctorId || null,
          status: 'Pending'
        });
        
        setAppointments([...appointments, response.data]);
        setShowAppointmentForm(false);
        setNewAppointment({
          dateTime: '',
          duration: 30,
          purpose: '',
          notes: '',
        });
      } catch (err) {
        console.error(err);
        alert('Failed to request appointment');
      }
    };

    const submitProfileEdit = async (e) => {
      e.preventDefault();
      
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const patientId = user.patientId;
        
        const response = await axios.put(`http://localhost:5000/api/patients/${patientId}`, editedProfile);
        
        setPatient(response.data);
        setEditingProfile(false);
        
        // Show success message
        alert('Profile updated successfully');
      } catch (err) {
        console.error(err);
        alert('Failed to update profile');
      }
    };
    
    if (loading) return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-300 to-purple-400">
        <div className="text-center p-8 rounded-lg shadow-lg bg-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-lg text-indigo-700 font-medium">Loading your health dashboard...</p>
        </div>
      </div>
    );
    
    if (error) return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-red-300 to-pink-400">
        <div className="text-center p-8 rounded-lg shadow-lg bg-white max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
    
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 py-6">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-indigo-800 border-b-2 border-indigo-200 pb-2">Personal Health Dashboard</h1>
        
        {/* Patient Profile */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-indigo-500 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-indigo-700">My Profile</h2>
            <button 
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center"
              onClick={() => setEditingProfile(!editingProfile)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              {editingProfile ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {editingProfile ? (
            <form onSubmit={submitProfileEdit} className="bg-indigo-50 p-4 rounded-md">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name:</label>
                  <input
                    type="text"
                    name="name"
                    value={editedProfile.name || ''}
                    onChange={handleProfileChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email:</label>
                  <input
                    type="email"
                    name="email"
                    value={editedProfile.email || ''}
                    onChange={handleProfileChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone:</label>
                  <input
                    type="tel"
                    name="phone"
                    value={editedProfile.phone || ''}
                    onChange={handleProfileChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth:</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={editedProfile.dateOfBirth || ''}
                    onChange={handleProfileChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender:</label>
                  <select
                    name="gender"
                    value={editedProfile.gender || ''}
                    onChange={handleProfileChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address:</label>
                  <input
                    type="text"
                    name="address"
                    value={editedProfile.address || ''}
                    onChange={handleProfileChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <h3 className="text-lg font-medium text-indigo-700 mb-2">Asthma Risk Factors:</h3>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="petAllergy"
                    name="petAllergy"
                    checked={editedProfile.petAllergy || false}
                    onChange={handleProfileChange}
                    className="h-4 w-4 mr-2"
                  />
                  <label htmlFor="petAllergy">Pet Allergy</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="familyHistoryAsthma"
                    name="familyHistoryAsthma"
                    checked={editedProfile.familyHistoryAsthma || false}
                    onChange={handleProfileChange}
                    className="h-4 w-4 mr-2"
                  />
                  <label htmlFor="familyHistoryAsthma">Family History of Asthma</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="historyOfAllergies"
                    name="historyOfAllergies"
                    checked={editedProfile.historyOfAllergies || false}
                    onChange={handleProfileChange}
                    className="h-4 w-4 mr-2"
                  />
                  <label htmlFor="historyOfAllergies">History of Allergies</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="hayfever"
                    name="hayfever"
                    checked={editedProfile.hayfever || false}
                    onChange={handleProfileChange}
                    className="h-4 w-4 mr-2"
                  />
                  <label htmlFor="hayfever">Hayfever</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="gastroesophagealReflux"
                    name="gastroesophagealReflux"
                    checked={editedProfile.gastroesophagealReflux || false}
                    onChange={handleProfileChange}
                    className="h-4 w-4 mr-2"
                  />
                  <label htmlFor="gastroesophagealReflux">Gastroesophageal Reflux</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="exerciseInduced"
                    name="exerciseInduced"
                    checked={editedProfile.exerciseInduced || false}
                    onChange={handleProfileChange}
                    className="h-4 w-4 mr-2"
                  />
                  <label htmlFor="exerciseInduced">Exercise Induced</label>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="grid md:grid-cols-2 gap-4 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-md">
              <div>
                <p className="mb-2"><span className="font-medium text-indigo-700">Name:</span> {patient.name}</p>
                <p className="mb-2"><span className="font-medium text-indigo-700">Email:</span> {patient.email || 'Not provided'}</p>
                <p className="mb-2"><span className="font-medium text-indigo-700">Phone:</span> {patient.phone}</p>
                <p className="mb-2"><span className="font-medium text-indigo-700">Date of Birth:</span> {patient.dateOfBirth}</p>
                <p className="mb-2"><span className="font-medium text-indigo-700">Age:</span> {patient.age}</p>
              </div>
              <div>
                <p className="mb-2"><span className="font-medium text-indigo-700">Gender:</span> {patient.gender || 'Not specified'}</p>
                <p className="mb-2"><span className="font-medium text-indigo-700">Address:</span> {patient.address || 'Not provided'}</p>
                <p className="mb-2"><span className="font-medium text-indigo-700">BMI:</span> {patient.bmi || 'Not calculated'}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Medical History */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
          <h2 className="text-2xl font-semibold mb-4 text-purple-700">Medical History</h2>
          <p className="mb-4 bg-gradient-to-r from-purple-50 to-indigo-50 p-3 rounded-md">{patient.medicalHistory || 'No medical history recorded'}</p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-purple-50 p-4 rounded-md">
              <h3 className="font-medium mb-2 text-purple-700">Asthma Risk Factors:</h3>
              <ul className="list-disc pl-5">
                <li className="mb-1">Pet Allergy: <span className={patient.petAllergy ? "text-red-600 font-medium" : "text-green-600"}>{patient.petAllergy ? 'Yes' : 'No'}</span></li>
                <li className="mb-1">Family History of Asthma: <span className={patient.familyHistoryAsthma ? "text-red-600 font-medium" : "text-green-600"}>{patient.familyHistoryAsthma ? 'Yes' : 'No'}</span></li>
                <li className="mb-1">History of Allergies: <span className={patient.historyOfAllergies ? "text-red-600 font-medium" : "text-green-600"}>{patient.historyOfAllergies ? 'Yes' : 'No'}</span></li>
                <li className="mb-1">Hayfever: <span className={patient.hayfever ? "text-red-600 font-medium" : "text-green-600"}>{patient.hayfever ? 'Yes' : 'No'}</span></li>
                <li className="mb-1">Gastroesophageal Reflux: <span className={patient.gastroesophagealReflux ? "text-red-600 font-medium" : "text-green-600"}>{patient.gastroesophagealReflux ? 'Yes' : 'No'}</span></li>
                <li className="mb-1">Exercise Induced: <span className={patient.exerciseInduced ? "text-red-600 font-medium" : "text-green-600"}>{patient.exerciseInduced ? 'Yes' : 'No'}</span></li>
              </ul>
            </div>
            <div className="bg-indigo-50 p-4 rounded-md">
              <h3 className="font-medium mb-2 text-indigo-700">Lung Function:</h3>
              <div className="space-y-2">
                <div>
                  <p className="font-medium">FEV1: <span className="font-normal">{patient.lungFunctionFEV1 || 'Not recorded'}</span></p>
                  {patient.lungFunctionFEV1 && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${Math.min(patient.lungFunctionFEV1, 100)}%` }}></div>
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium">FVC: <span className="font-normal">{patient.lungFunctionFVC || 'Not recorded'}</span></p>
                  {patient.lungFunctionFVC && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                      <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${Math.min(patient.lungFunctionFVC, 100)}%` }}></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Prescriptions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
          <h2 className="text-2xl font-semibold mb-4 text-blue-700">My Medications</h2>
          {prescriptions.length > 0 ? (
            <div className="overflow-x-auto bg-gradient-to-r from-blue-50 to-indigo-50 p-2 rounded-md">
              <table className="w-full text-sm">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="p-3 text-left text-blue-800">Medication</th>
                    <th className="p-3 text-left text-blue-800">Dosage</th>
                    <th className="p-3 text-left text-blue-800">Frequency</th>
                    <th className="p-3 text-left text-blue-800">Start Date</th>
                    <th className="p-3 text-left text-blue-800">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptions.map((prescription, index) => (
                    <tr key={prescription._id} className={index % 2 === 0 ? "bg-white" : "bg-blue-50"}>
                      <td className="p-3 border-t border-blue-100">{prescription.medicationName}</td>
                      <td className="p-3 border-t border-blue-100">{prescription.dosage}</td>
                      <td className="p-3 border-t border-blue-100">{prescription.frequency}</td>
                      <td className="p-3 border-t border-blue-100">{new Date(prescription.startDate).toLocaleDateString()}</td>
                      <td className="p-3 border-t border-blue-100">
                        <span className={`px-2 py-1 rounded text-xs ${
                          prescription.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
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
            <p className="bg-blue-50 p-4 rounded-md text-blue-800">No medications assigned yet</p>
          )}
        </div>
        
        {/* Symptom Tracking */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-green-700">Symptom Tracking</h2>
            <button 
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center"
              onClick={() => setShowSymptomForm(!showSymptomForm)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {showSymptomForm ? 'Cancel' : 'Add Symptoms'}
            </button>
          </div>
          
          {showSymptomForm && (
            <form onSubmit={submitSymptom} className="mb-6 bg-gradient-to-r from-green-50 to-teal-50 p-5 rounded-md shadow-sm">
              <h3 className="font-medium mb-3 text-green-700">Record New Symptoms</h3>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="coughing" 
                    name="coughing" 
                    checked={newSymptom.coughing}
                    onChange={handleSymptomChange}
                    className="h-4 w-4 mr-2 text-green-600"
                  />
                  <label htmlFor="coughing">Coughing</label>
                </div>
                
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="chestTightness" 
                    name="chestTightness" 
                    checked={newSymptom.chestTightness}
                    onChange={handleSymptomChange}
                    className="h-4 w-4 mr-2 text-green-600"
                  />
                  <label htmlFor="chestTightness">Chest Tightness</label>
                </div>
                
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="shortnessOfBreath" 
                    name="shortnessOfBreath" 
                    checked={newSymptom.shortnessOfBreath}
                    onChange={handleSymptomChange}
                    className="h-4 w-4 mr-2 text-green-600"
                  />
                  <label htmlFor="shortnessOfBreath">Shortness of Breath</label>
                </div>
                
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="wheezing" 
                    name="wheezing" 
                    checked={newSymptom.wheezing}
                    onChange={handleSymptomChange}
                    className="h-4 w-4 mr-2 text-green-600"
                  />
                  <label htmlFor="wheezing">Wheezing</label>
                </div>
                
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="nighttimeSymptoms" 
                    name="nighttimeSymptoms" 
                    checked={newSymptom.nighttimeSymptoms}
                    onChange={handleSymptomChange}
                    className="h-4 w-4 mr-2 text-green-600"
                  />
                  <label htmlFor="nighttimeSymptoms">Nighttime Symptoms</label>
                </div>
                
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="exercise" 
                    name="exercise" 
                    checked={newSymptom.exercise}
                    onChange={handleSymptomChange}
                    className="h-4 w-4 mr-2 text-green-600"
                  />
                  <label htmlFor="exercise">Exercise-Related</label>
                  {newSymptom.exercise && patient.exerciseInduced && (
                    <span className="ml-2 text-sm text-orange-600">
                      * Previous history of exercise-induced symptoms detected
                    </span>
                  )}
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="notes" className="block mb-1 text-green-700">Notes:</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={newSymptom.notes}
                  onChange={handleSymptomChange}
                  className="w-full border border-green-200 rounded-md p-2 focus:ring-2 focus:ring-green-300 focus:border-green-300 focus:outline-none"
                  rows="3"
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Save Symptoms
              </button>
            </form>
          )}
          
          {symptoms.length > 0 ? (
            <div className="overflow-x-auto bg-gradient-to-r from-green-50 to-emerald-50 p-2 rounded-md">
              <table className="w-full text-sm">
                <thead className="bg-green-100">
                <tr>
  <th className="p-3 text-left text-green-800">Date</th>
  <th className="p-3 text-left text-green-800">Symptoms</th>
  <th className="p-3 text-left text-green-800">Notes</th>
</tr>
</thead>
<tbody>
  {symptoms.map((symptom, index) => (
    <tr key={symptom._id} className={index % 2 === 0 ? "bg-white" : "bg-green-50"}>
      <td className="p-3 border-t border-green-100">{new Date(symptom.createdAt).toLocaleDateString()}</td>
      <td className="p-3 border-t border-green-100">
        <div className="flex flex-wrap gap-1">
          {symptom.coughing && (
            <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs">Coughing</span>
          )}
          {symptom.chestTightness && (
            <span className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full text-xs">Chest Tightness</span>
          )}
          {symptom.shortnessOfBreath && (
            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs">Shortness of Breath</span>
          )}
          {symptom.wheezing && (
            <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs">Wheezing</span>
          )}
          {symptom.nighttimeSymptoms && (
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full text-xs">Nighttime</span>
          )}
          {symptom.exercise && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">Exercise</span>
          )}
        </div>
      </td>
      <td className="p-3 border-t border-green-100">{symptom.notes || 'No notes'}</td>
    </tr>
  ))}
</tbody>
</table>
</div>
          ) : (
            <p className="bg-green-50 p-4 rounded-md text-green-800">No symptom records yet</p>
          )}
        </div>
        
        {/* Upcoming Appointments */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-yellow-500 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-yellow-700">Appointments</h2>
            <button 
              className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors flex items-center"
              onClick={() => setShowAppointmentForm(!showAppointmentForm)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {showAppointmentForm ? 'Cancel' : 'Request Appointment'}
            </button>
          </div>
          
          {showAppointmentForm && (
            <form onSubmit={submitAppointment} className="mb-6 bg-gradient-to-r from-yellow-50 to-amber-50 p-5 rounded-md shadow-sm">
              <h3 className="font-medium mb-3 text-yellow-700">Request New Appointment</h3>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="dateTime" className="block mb-1 text-yellow-700">Date & Time:</label>
                  <input
                    type="datetime-local"
                    id="dateTime"
                    name="dateTime"
                    value={newAppointment.dateTime}
                    onChange={handleAppointmentChange}
                    className="w-full border border-yellow-200 rounded-md p-2 focus:ring-2 focus:ring-yellow-300 focus:border-yellow-300 focus:outline-none"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="duration" className="block mb-1 text-yellow-700">Duration (minutes):</label>
                  <select
                    id="duration"
                    name="duration"
                    value={newAppointment.duration}
                    onChange={handleAppointmentChange}
                    className="w-full border border-yellow-200 rounded-md p-2 focus:ring-2 focus:ring-yellow-300 focus:border-yellow-300 focus:outline-none"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60 minutes</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="purpose" className="block mb-1 text-yellow-700">Purpose:</label>
                  <select
                    id="purpose"
                    name="purpose"
                    value={newAppointment.purpose}
                    onChange={handleAppointmentChange}
                    className="w-full border border-yellow-200 rounded-md p-2 focus:ring-2 focus:ring-yellow-300 focus:border-yellow-300 focus:outline-none"
                    required
                  >
                    <option value="">Select Purpose</option>
                    <option value="Routine Check-up">Routine Check-up</option>
                    <option value="Symptom Review">Symptom Review</option>
                    <option value="Medication Review">Medication Review</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="appointmentNotes" className="block mb-1 text-yellow-700">Notes:</label>
                <textarea
                  id="appointmentNotes"
                  name="notes"
                  value={newAppointment.notes}
                  onChange={handleAppointmentChange}
                  className="w-full border border-yellow-200 rounded-md p-2 focus:ring-2 focus:ring-yellow-300 focus:border-yellow-300 focus:outline-none"
                  rows="3"
                  placeholder="Please describe your symptoms or reason for appointment"
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                className="bg-yellow-600 text-white px-6 py-2 rounded-md hover:bg-yellow-700 transition-colors"
              >
                Request Appointment
              </button>
            </form>
          )}
          
          {appointments.length > 0 ? (
            <div className="overflow-x-auto bg-gradient-to-r from-yellow-50 to-amber-50 p-2 rounded-md">
              <table className="w-full text-sm">
                <thead className="bg-yellow-100">
                  <tr>
                    <th className="p-3 text-left text-yellow-800">Date & Time</th>
                    <th className="p-3 text-left text-yellow-800">Purpose</th>
                    <th className="p-3 text-left text-yellow-800">Doctor</th>
                    <th className="p-3 text-left text-yellow-800">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment, index) => (
                    <tr key={appointment._id} className={index % 2 === 0 ? "bg-white" : "bg-yellow-50"}>
                      <td className="p-3 border-t border-yellow-100">
                        {new Date(appointment.dateTime).toLocaleString()}
                        <div className="text-xs text-gray-500">
                          {appointment.duration} mins
                        </div>
                      </td>
                      <td className="p-3 border-t border-yellow-100">
                        {appointment.purpose}
                        {appointment.notes && (
                          <div className="text-xs text-gray-500 mt-1 italic">
                            "{appointment.notes.length > 50 ? appointment.notes.substring(0, 50) + '...' : appointment.notes}"
                          </div>
                        )}
                      </td>
                      <td className="p-3 border-t border-yellow-100">
                        {appointment.doctorName || 'To be assigned'}
                      </td>
                      <td className="p-3 border-t border-yellow-100">
                        <span className={`px-2 py-1 rounded text-xs ${
                          appointment.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 
                          appointment.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 
                          appointment.status === 'Completed' ? 'bg-blue-100 text-blue-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {appointment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="bg-yellow-50 p-4 rounded-md text-yellow-800">No appointments scheduled</p>
          )}
        </div>
        
        {/* Caregivers */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-pink-500 hover:shadow-lg transition-shadow">
          <h2 className="text-2xl font-semibold mb-4 text-pink-700">My Care Team</h2>
          
          {caretakers.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {caretakers.map(caretaker => (
                <div key={caretaker._id} className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-md">
                  <div className="flex items-center mb-2">
                    <div className="bg-pink-200 p-2 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">{caretaker.name}</h3>
                      <p className="text-sm text-gray-600">{caretaker.type}</p>
                    </div>
                  </div>
                  <div className="border-t border-pink-200 pt-2 mt-2">
                    <p className="text-sm"><span className="font-medium text-pink-700">Phone:</span> {caretaker.phone}</p>
                    <p className="text-sm"><span className="font-medium text-pink-700">Email:</span> {caretaker.email}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="bg-pink-50 p-4 rounded-md text-pink-800">No caretakers assigned yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;