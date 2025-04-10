import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

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
    const [doctors, setDoctors] = useState([]);
    const [showQueryForm, setShowQueryForm] = useState(false);
    const [query, setQuery] = useState({
      subject: '',
      message: '',
      priority: 'Normal'
    });
    const [queries, setQueries] = useState([]);
    
    // New symptom form state
    const [newSymptom, setNewSymptom] = useState({
        coughing: 0,
        chestTightness: 0,
        shortnessOfBreath: 0,
        wheezing: 0,
        nighttimeSymptoms: 0,
        exercise: 0,
        // Triggers
        smoking: false, // Keep as boolean for checkbox
        pollutionExposure: 0,
        pollenExposure: 0,
        dustExposure: 0,
        physicalActivity: 0,
        petExposure: 0,
        notes: '',
      });
      
    
    // New appointment form state
    const [newAppointment, setNewAppointment] = useState({
      dateTime: '',
      duration: 30,
      purpose: '',
      notes: '',
    });
    const [intakeStatus, setIntakeStatus] = useState({
      morning: 0,
      evening: 0,
      night: 0
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
            const patientRes = await axios.get(`http://localhost:5000/api/patients/${patientId}`);
            if (patientRes.data.medicationIntake) {
              setIntakeStatus(patientRes.data.medicationIntake);
            }
    
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
            // Fetch queries
            const queriesResponse = await axios.get(`http://localhost:5000/api/patient-queries/${patientId}`);
            setQueries(queriesResponse.data || []);
          } catch (err) {
            console.error("Error fetching queries:", err);
            setQueries([]);
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
        const { name, type, checked, value } = e.target;
        
        // For checkbox inputs (only smoking remains as checkbox)
        if (type === 'checkbox') {
          setNewSymptom({
            ...newSymptom,
            [name]: checked
          });
        } 
        // For range inputs (symptoms severity)
        else if (type === 'range') {
          setNewSymptom({
            ...newSymptom,
            [name]: parseInt(value, 10)
          });
        }
        // For text inputs (notes)
        else {
          setNewSymptom({
            ...newSymptom,
            [name]: value
          });
        }
      };
    const handleAppointmentChange = (e) => {
      const { name, value } = e.target;
      setNewAppointment({
        ...newAppointment,
        [name]: value
      });
    };

    const handleProfileChange= (e) => {
      const { name, value, type, checked } = e.target;
      setEditedProfile({
        ...editedProfile,
        [name]: type === 'checkbox' ? checked : value
      });
    };
    
    const submitSymptom = async (e) => {
        e.preventDefault();
        
        try {
          const user = JSON.parse(localStorage.getItem('user'));
          const patientId = user.patientId;
          
          // Convert smoking boolean to number (0 or 1)
          const symptomData = {
            ...newSymptom,
            patientId,
            smoking: newSymptom.smoking ? 1 : 0,
            coughing: newSymptom.coughing ? 1 : 0,
            chestTightness: newSymptom.chestTightness ? 1 : 0,
            shortnessOfBreath: newSymptom.shortnessOfBreath ? 1 : 0,
            wheezing: newSymptom.wheezing ? 1 : 0,
            nighttimeSymptoms: newSymptom.nighttimeSymptoms ? 1 : 0,
            exercise: newSymptom.exercise ? 1 : 0,
            // Keep the rest as numbers
            pollutionExposure: Number(newSymptom.pollutionExposure),
            pollenExposure: Number(newSymptom.pollenExposure),
            dustExposure: Number(newSymptom.dustExposure),
            physicalActivity: Number(newSymptom.physicalActivity),
            petExposure: Number(newSymptom.petExposure),
          };
          
          
        console.log(symptomData)
          const response = await axios.post('http://localhost:5000/api/symptoms', symptomData);
          
          setSymptoms([...symptoms, response.data]);
          setShowSymptomForm(false);
          setNewSymptom({
            
            coughing: 0,
            chestTightness: 0,
            shortnessOfBreath: 0,
            wheezing: 0,
            nighttimeSymptoms: 0,
            exercise: 0,
            smoking: false,
            pollutionExposure: 0,
            pollenExposure: 0,
            dustExposure: 0,
            physicalActivity: 0,
            petExposure: 0,
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
          const patientMongoId = patient?._id;
      
          if (!patientMongoId) {
            throw new Error("Patient ID not available");
          }
      
          const response = await axios.post('http://localhost:5000/api/patient-appointments', {
            ...newAppointment,
            patientId: patientMongoId,
            doctorId: newAppointment.doctorId || null, // Send doctorId here
          });
      
          setAppointments([...appointments, response.data]);
          setShowAppointmentForm(false);
          setNewAppointment({
            dateTime: '',
            duration: 30,
            purpose: '',
            notes: '',
            doctorId: '', // Reset the doctorId as well
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
    const handleJoinCall = (appointment) => {
      const roomID = `room-${appointment._id || appointment.id}`;
      navigate(`/patient-video-call/${roomID}`);
    };
    const handlePrediction = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
  
        // Check if the user exists and has a valid role
        if (!user || user.role !== 'patient') {
          throw new Error('User is not a patient or no user found');
        }

        const patientId = user.patientId;
        

        const res = await fetch('http://localhost:5000/api/predict-asthma', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patientId:patientId }) // Replace with your actual patient ID
        });
    
        const data = await res.json();
        if (data.prediction) {
          alert(`Prediction: ${data.prediction}\nProbability: ${data.probability}`);
        } else {
          alert('Prediction failed!');
        }
      } catch (err) {
        console.error('Error predicting:', err);
        alert('Error running prediction');
      }
    };
    // Add this to your state declarations
const [showSosForm, setShowSosForm] = useState(false);
const [sosMessage, setSosMessage] = useState('');

// Add this handler function
const handleSosSubmit = async (e) => {
  e.preventDefault();
  
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    const patientId = user.patientId;
    
    const response = await axios.post('http://localhost:5000/api/send-sos', {
      patientId,
      message: sosMessage
    });
    
    alert('SOS message sent successfully!');
    setSosMessage('');
    setShowSosForm(false);
  } catch (err) {
    console.error(err);
    alert('Failed to send SOS message. Please try calling emergency services.');
  }
};
const handleQueryChange = (e) => {
  const { name, value } = e.target;
  setQuery({
    ...query,
    [name]: value
  });
};
const submitQuery = async (e) => {
  e.preventDefault();
  
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    const patientId = user.patientId;
    
    const response = await axios.post('http://localhost:5000/api/patient-queries', {
      ...query,
      patientId
    });
    
    setQueries([...queries, response.data]);
    setShowQueryForm(false);
    setQuery({
      subject: '',
      message: '',
      priority: 'Normal'
    });
    
    alert('Your query has been submitted successfully!');
  } catch (err) {
    console.error(err);
    alert('Failed to submit query');
  }
};
const handleMedicationTaken = async (timeOfDay) => {
  try {
    // Toggle the current status (0 -> 1 or 1 -> 0)
    const newStatus = intakeStatus[timeOfDay] === 1 ? 0 : 1;
    const user = JSON.parse(localStorage.getItem('user'));
    const patientId = user.patientId;

    const response = await axios.post('http://localhost:5000/api/medications/intake/update', {
      patientId,
      timeOfDay,
      status: newStatus
    });
    
    // Update local state with the response
    setIntakeStatus(response.data.medicationIntake);
    
    toast.success(`${timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)} medication marked as ${newStatus === 1 ? 'taken' : 'not taken'}`);
  } catch (error) {
    console.error("Error updating medication status:", error);
    toast.error("Failed to update medication status");
  }
};

// Get current time period (morning, evening, night)
const getCurrentTimePeriod = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'evening';
  return 'night';
};

// Check if a prescription should be taken at a specific time
const shouldTakeAtTime = (prescription, timeOfDay) => {
  return prescription.timeOfDay && prescription.timeOfDay[timeOfDay];
};

// Format a time period name
const formatTimePeriod = (period) => {
  return period.charAt(0).toUpperCase() + period.slice(1);
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
    
    <div className="flex gap-3">
      {/* Edit Profile Button */}
    

      {/* Take Prediction Button */}
      <button 
        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center"
        onClick={handlePrediction}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-3-3v6m4 5H8a2 2 0 01-2-2V7a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2z" />
        </svg>
        Take Prediction
      </button>
    </div>
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
        {/* SOS Section */}
<div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-red-500 hover:shadow-lg transition-shadow">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-2xl font-semibold text-red-700">Emergency Assistance</h2>
    <button 
      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center"
      onClick={() => setShowSosForm(!showSosForm)}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      {showSosForm ? 'Cancel' : 'SOS Alert'}
    </button>
  </div>
  
  {showSosForm && (
    <form onSubmit={handleSosSubmit} className="mb-6 bg-gradient-to-r from-red-50 to-pink-50 p-5 rounded-md shadow-sm">
      <p className="text-red-600 mb-3">
        <strong>IMPORTANT:</strong> This will send an urgent alert to your care team. For life-threatening emergencies, call 911 immediately.
      </p>
      
      <div className="mb-4">
        <label htmlFor="sosMessage" className="block mb-1 text-red-700">Describe your emergency:</label>
        <textarea
          id="sosMessage"
          value={sosMessage}
          onChange={(e) => setSosMessage(e.target.value)}
          className="w-full border border-red-200 rounded-md p-2 focus:ring-2 focus:ring-red-300 focus:border-red-300 focus:outline-none"
          rows="3"
          placeholder="Describe your situation and symptoms"
          required
        ></textarea>
      </div>
      
      <button 
        type="submit" 
        className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors"
      >
        Send Emergency Alert
      </button>
    </form>
  )}
  
  <p className="bg-red-50 p-4 rounded-md text-red-800">
    This feature allows you to alert your doctor and caretakers about an urgent medical situation.
    <br />
    <strong>For life-threatening emergencies, call 911 or your local emergency number immediately.</strong>
  </p>
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
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold mb-4 text-purple-700">Medication Tracker</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['morning', 'evening', 'night'].map((period) => (
                <div 
                  key={period} 
                  className={`p-4 rounded-lg border ${
                    getCurrentTimePeriod() === period ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-lg">{formatTimePeriod(period)}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      intakeStatus[period] === 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {intakeStatus[period] === 1 ? 'Taken' : 'Not Taken'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleMedicationTaken(period)}
                    className={`w-full py-2 px-4 rounded-md mt-2 transition-colors ${
                      intakeStatus[period] === 1 
                        ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {intakeStatus[period] === 1 ? 'Undo' : 'Mark as Taken'}
                  </button>
                </div>
              ))}
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
                      <th className="p-3 text-left text-blue-800">Time of Day</th>
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
                        <td className="p-3 border-t border-blue-100">
                          <div className="flex space-x-2">
                            {['morning', 'evening', 'night'].map((time) => (
                              shouldTakeAtTime(prescription, time) && (
                                <span key={time} className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                                  {formatTimePeriod(time)}
                                </span>
                              )
                            ))}
                          </div>
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

 <div className="grid md:grid-cols-2 gap-6 mb-4">
  {/* Symptom Checkboxes */}
  <div>
    <h4 className="font-medium mb-3 text-green-700">Symptom Checklist</h4>

    {[
      ['coughing', 'Coughing'],
      ['chestTightness', 'Chest Tightness'],
      ['shortnessOfBreath', 'Shortness of Breath'],
      ['wheezing', 'Wheezing'],
      ['nighttimeSymptoms', 'Nighttime Symptoms'],
      ['exercise', 'Exercise-Related'],
    ].map(([key, label]) => (
      <div className="flex items-center mb-3" key={key}>
        <input
          type="checkbox"
          id={key}
          name={key}
          checked={newSymptom[key]}
          onChange={handleSymptomChange}
          className="h-4 w-4 mr-2 text-green-600"
        />
        <label htmlFor={key}>{label}</label>
        {key === 'exercise' && newSymptom.exercise && patient.exerciseInduced && (
          <span className="ml-2 text-sm text-orange-600">
            * Previous history of exercise-induced symptoms detected
          </span>
        )}
      </div>
    ))}
  </div>

  {/* Triggers Section – already checkbox + number fields, no change */}
  <div>
    <h4 className="font-medium mb-3 text-green-700">Triggers</h4>

    <div className="flex items-center mb-3">
      <input
        type="checkbox"
        id="smoking"
        name="smoking"
        checked={newSymptom.smoking}
        onChange={handleSymptomChange}
        className="h-4 w-4 mr-2 text-green-600"
      />
      <label htmlFor="smoking">Smoking</label>
    </div>

    {[
      ['pollutionExposure', 'Pollution Exposure'],
      ['pollenExposure', 'Pollen Exposure'],
      ['dustExposure', 'Dust Exposure'],
      ['physicalActivity', 'Physical Activity Level'],
      ['petExposure', 'Pet Exposure'],
    ].map(([key, label]) => (
      <div className="mb-3" key={key}>
        <label htmlFor={key} className="block mb-1">{label}:</label>
        <input
  type="number"
  id={key}
  name={key}
  step="0.0000000001" // allows up to 10 decimal places
  min="0"
  max="10"
  value={newSymptom[key]}
  onChange={handleSymptomChange}
  className="w-full border border-green-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-400"
/>
      </div>
    ))}
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
     placeholder="Describe any additional details about your symptoms or triggers"
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
          <th className="p-3 text-left text-green-800">Triggers</th>
        </tr>
      </thead>
      <tbody>
        {symptoms.map((symptom, index) => (
          <tr key={symptom._id} className={index % 2 === 0 ? "bg-white" : "bg-green-50"}>
            <td className="p-3 border-t border-green-100">
              <div className="flex flex-col gap-1">
                {symptom.coughing > 0 && (
                  <div className="flex items-center">
                    <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs mr-2">Coughing</span>
                    <div className="w-24 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-red-500 rounded-full" 
                        style={{ width: `${symptom.coughing * 10}%` }}
                      ></div>
                    </div>
                    <span className="ml-1 text-xs">{symptom.coughing}/10</span>
                  </div>
                )}
                {symptom.chestTightness > 0 && (
                  <div className="flex items-center">
                    <span className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full text-xs mr-2">Chest Tightness</span>
                    <div className="w-24 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-orange-500 rounded-full" 
                        style={{ width: `${symptom.chestTightness * 10}%` }}
                      ></div>
                    </div>
                    <span className="ml-1 text-xs">{symptom.chestTightness}/10</span>
                  </div>
                )}
                {symptom.shortnessOfBreath > 0 && (
                  <div className="flex items-center">
                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs mr-2">Shortness of Breath</span>
                    <div className="w-24 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-yellow-500 rounded-full" 
                        style={{ width: `${symptom.shortnessOfBreath * 10}%` }}
                      ></div>
                    </div>
                    <span className="ml-1 text-xs">{symptom.shortnessOfBreath}/10</span>
                  </div>
                )}
                {symptom.wheezing > 0 && (
                  <div className="flex items-center">
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs mr-2">Wheezing</span>
                    <div className="w-24 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-purple-500 rounded-full" 
                        style={{ width: `${symptom.wheezing * 10}%` }}
                      ></div>
                    </div>
                    <span className="ml-1 text-xs">{symptom.wheezing}/10</span>
                  </div>
                )}
                {symptom.nighttimeSymptoms > 0 && (
                  <div className="flex items-center">
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full text-xs mr-2">Nighttime</span>
                    <div className="w-24 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-indigo-500 rounded-full" 
                        style={{ width: `${symptom.nighttimeSymptoms * 10}%` }}
                      ></div>
                    </div>
                    <span className="ml-1 text-xs">{symptom.nighttimeSymptoms}/10</span>
                  </div>
                )}
                {symptom.exercise > 0 && (
                  <div className="flex items-center">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs mr-2">Exercise</span>
                    <div className="w-24 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-blue-500 rounded-full" 
                        style={{ width: `${symptom.exercise * 10}%` }}
                      ></div>
                    </div>
                    <span className="ml-1 text-xs">{symptom.exercise}/10</span>
                  </div>
                )}
              </div>
            </td>
            <td className="p-3 border-t border-green-100">
              <div className="flex flex-col gap-1">
                {symptom.smoking > 0 && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs">Smoking</span>
                )}
                {symptom.pollutionExposure > 0 && (
                  <div className="flex items-center">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full text-xs mr-2">Pollution</span>
                    <span className="text-xs">{symptom.pollutionExposure}/10</span>
                  </div>
                )}
                {symptom.pollenExposure > 0 && (
                  <div className="flex items-center">
                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs mr-2">Pollen</span>
                    <span className="text-xs">{symptom.pollenExposure}/10</span>
                  </div>
                )}
                {symptom.dustExposure > 0 && (
                  <div className="flex items-center">
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs mr-2">Dust</span>
                    <span className="text-xs">{symptom.dustExposure}/10</span>
                  </div>
                )}
                {symptom.physicalActivity > 0 && (
                  <div className="flex items-center">
                    <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs mr-2">Activity</span>
                    <span className="text-xs">{symptom.physicalActivity}/10</span>
                  </div>
                )}
                {symptom.petExposure > 0 && (
                  <div className="flex items-center">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs mr-2">Pets</span>
                    <span className="text-xs">{symptom.petExposure}/10</span>
                  </div>
                )}
              </div>
            </td>
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
                <div className="mb-4">
    <label htmlFor="doctorId" className="block mb-1 text-yellow-700">Doctor ID:</label>
    <input
      type="text"
      id="doctorId"
      name="doctorId"
      value={newAppointment.doctorId}
      onChange={handleAppointmentChange}
      className="w-full border border-yellow-200 rounded-md p-2 focus:ring-2 focus:ring-yellow-300 focus:border-yellow-300 focus:outline-none"
      placeholder="Enter Doctor ID"
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
                        <span className={`px-2 py-1 rounded text-xs ${
                          appointment.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 
                          appointment.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 
                          appointment.status === 'Completed' ? 'bg-blue-100 text-blue-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {appointment.status}
                        </span>
                        {appointment.status === 'Confirmed' && (
                          <button
                            onClick={() => handleJoinCall(appointment)}
                            className="ml-3 px-3 py-1 text-xs font-semibold bg-indigo-600 text-white rounded hover:bg-indigo-700 transition duration-200"
                          >
                            Join Call
                          </button>
                        )}
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
        
     
        {/* Patient Queries Section */}
<div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-teal-500 hover:shadow-lg transition-shadow">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-2xl font-semibold text-teal-700">My Questions</h2>
    <button 
      className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors flex items-center"
      onClick={() => setShowQueryForm(!showQueryForm)}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {showQueryForm ? 'Cancel' : 'Ask a Question'}
    </button>
  </div>
  
  {showQueryForm && (
    <form onSubmit={submitQuery} className="mb-6 bg-gradient-to-r from-teal-50 to-cyan-50 p-5 rounded-md shadow-sm">
      <h3 className="font-medium mb-3 text-teal-700">Submit a Question to Your Care Team</h3>
      
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="subject" className="block mb-1 text-teal-700">Subject:</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={query.subject}
            onChange={handleQueryChange}
            className="w-full border border-teal-200 rounded-md p-2 focus:ring-2 focus:ring-teal-300 focus:border-teal-300 focus:outline-none"
            placeholder="Brief topic of your question"
            required
          />
        </div>
        
        <div>
          <label htmlFor="priority" className="block mb-1 text-teal-700">Priority:</label>
          <select
            id="priority"
            name="priority"
            value={query.priority}
            onChange={handleQueryChange}
            className="w-full border border-teal-200 rounded-md p-2 focus:ring-2 focus:ring-teal-300 focus:border-teal-300 focus:outline-none"
          >
            <option value="Low">Low - General question</option>
            <option value="Normal">Normal - Need answer within a few days</option>
            <option value="High">High - Need answer soon</option>
          </select>
        </div>
      </div>
      
      <div className="mb-4">
        <label htmlFor="message" className="block mb-1 text-teal-700">Your Question:</label>
        <textarea
          id="message"
          name="message"
          value={query.message}
          onChange={handleQueryChange}
          className="w-full border border-teal-200 rounded-md p-2 focus:ring-2 focus:ring-teal-300 focus:border-teal-300 focus:outline-none"
          rows="4"
          placeholder="Type your detailed question here"
          required
        ></textarea>
      </div>
      
      <button 
        type="submit" 
        className="bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700 transition-colors"
      >
        Submit Question
      </button>
    </form>
  )}
  
  {queries.length > 0 ? (
    <div className="overflow-x-auto bg-gradient-to-r from-teal-50 to-cyan-50 p-2 rounded-md">
      <table className="w-full text-sm">
        <thead className="bg-teal-100">
          <tr>
            <th className="p-3 text-left text-teal-800">Subject</th>
            <th className="p-3 text-left text-teal-800">Priority</th>
          </tr>
        </thead>
        <tbody>
          {queries.map((queryItem, index) => (
            <tr key={queryItem._id} className={index % 2 === 0 ? "bg-white" : "bg-teal-50"}>
              
              <td className="p-3 border-t border-teal-100">
                {queryItem.subject}
                <div className="text-xs text-gray-500 mt-1 italic">
                  "{queryItem.message.length > 50 ? queryItem.message.substring(0, 50) + '...' : queryItem.message}"
                </div>
              </td>
              <td className="p-3 border-t border-teal-100">
                <span className={`px-2 py-1 rounded text-xs ${
                  queryItem.priority === 'High' ? 'bg-red-100 text-red-800' : 
                  queryItem.priority === 'Normal' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-green-100 text-green-800'
                }`}>
                  {queryItem.priority}
                </span>
              </td>
            
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <p className="bg-teal-50 p-4 rounded-md text-teal-800">You haven't submitted any questions yet</p>
  )}
</div>
      </div>
    </div>
  );
};

export default PatientDashboard;