import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const PatientDashboard = () => {
    const [patient, setPatient] = useState(null);
    const [prescriptions, setPrescriptions] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [symptoms, setSymptoms] = useState([]);
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
        smoking: false,
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
    
    // Add this to your state declarations
    const [showSosForm, setShowSosForm] = useState(false);
    const [sosMessage, setSosMessage] = useState('');

    useEffect(() => {
      const fetchData = async () => {
        try {
          const user = JSON.parse(localStorage.getItem('user'));
  
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
            const patientResponse = await axios.get(`http://localhost:5000/api/patients/${patientId}`);
            setPatient(patientResponse.data || {});
            setEditedProfile(patientResponse.data || {});
          } catch (err) {
            console.error("Error fetching patient data:", err);
            setPatient({});
            setEditedProfile({});
          }
          
          try {
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
            const appointmentsResponse = await axios.get(`http://localhost:5000/api/patient-appointments/${patientId}`);
            setAppointments(appointmentsResponse.data || []);
          } catch (err) {
            console.error("Error fetching appointments:", err);
            setAppointments([]);
          }
          
          try {
            const symptomsResponse = await axios.get(`http://localhost:5000/api/symptoms/${patientId}`);
            setSymptoms(symptomsResponse.data || []);
          } catch (err) {
            console.error("Error fetching symptoms:", err);
            setSymptoms([]);
          }
          try {
            const queriesResponse = await axios.get(`http://localhost:5000/api/patient-queries/${patientId}`);
            setQueries(queriesResponse.data || []);
          } catch (err) {
            console.error("Error fetching queries:", err);
            setQueries([]);
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
        if (type === 'checkbox') {
          setNewSymptom({ ...newSymptom, [name]: checked });
        } else if (type === 'range') {
          setNewSymptom({ ...newSymptom, [name]: parseFloat(value, 10) });
        } else {
          setNewSymptom({ ...newSymptom, [name]: value });
        }
    };

    const handleAppointmentChange = (e) => {
      const { name, value } = e.target;
      setNewAppointment({ ...newAppointment, [name]: value });
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
            doctorId: newAppointment.doctorId || null,
          });
      
          setAppointments([...appointments, response.data]);
          setShowAppointmentForm(false);
          setNewAppointment({
            dateTime: '',
            duration: 30,
            purpose: '',
            notes: '',
            doctorId: '',
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
        if (!user || user.role !== 'patient') {
          throw new Error('User is not a patient or no user found');
        }

        const patientId = user.patientId;
        
        const res = await fetch('http://localhost:5000/api/predict-asthma', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patientId:patientId })
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

    const handleSosSubmit = async (e) => {
      e.preventDefault();
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const patientId = user.patientId;
        console.log(patientId)
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
      setQuery({ ...query, [name]: value });
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
        const newStatus = intakeStatus[timeOfDay] === 1 ? 0 : 1;
        const user = JSON.parse(localStorage.getItem('user'));
        const patientId = user.patientId;

        const response = await axios.post('http://localhost:5000/api/medications/intake/update', {
          patientId,
          timeOfDay,
          status: newStatus
        });
        
        setIntakeStatus(response.data.medicationIntake);
        toast.success(`${timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)} medication marked as ${newStatus === 1 ? 'taken' : 'not taken'}`);
      } catch (error) {
        console.error("Error updating medication status:", error);
        toast.error("Failed to update medication status");
      }
    };

    const getCurrentTimePeriod = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) return 'morning';
      if (hour >= 12 && hour < 18) return 'evening';
      return 'night';
    };

    const shouldTakeAtTime = (prescription, timeOfDay) => {
      return prescription.timeOfDay && prescription.timeOfDay[timeOfDay];
    };

    const formatTimePeriod = (period) => {
      return period.charAt(0).toUpperCase() + period.slice(1);
    };

    if (loading) return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
    
    if (error) return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center border border-red-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Unable to Load Data</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
    
  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Health Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back, {patient?.name}</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
             <button 
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm flex items-center font-medium"
              onClick={handlePrediction}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-3-3v6m4 5H8a2 2 0 01-2-2V7a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2z" />
              </svg>
              AI Prediction
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4 flex justify-between items-center">
                <h2 className="text-lg font-bold text-white">Profile</h2>
                <button 
                  onClick={() => setEditingProfile(!editingProfile)}
                  className="text-white hover:bg-white/20 p-2 rounded-full transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6">
                {editingProfile ? (
                  <form onSubmit={submitProfileEdit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Name</label>
                      <input type="text" name="name" value={editedProfile.name || ''} onChange={handleProfileChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <input type="email" name="email" value={editedProfile.email || ''} onChange={handleProfileChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Phone</label>
                            <input type="tel" name="phone" value={editedProfile.phone || ''} onChange={handleProfileChange} className="w-full p-2 border border-gray-300 rounded-lg outline-none" required />
                        </div>
                        <div>
                             <label className="text-sm font-medium text-gray-700">DOB</label>
                             <input type="date" name="dateOfBirth" value={editedProfile.dateOfBirth || ''} onChange={handleProfileChange} className="w-full p-2 border border-gray-300 rounded-lg outline-none" />
                        </div>
                    </div>
                    
                    {/* Simplified medical toggles for edit mode */}
                    <div className="pt-2">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Conditions:</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            {['petAllergy', 'familyHistoryAsthma', 'historyOfAllergies', 'hayfever', 'gastroesophagealReflux', 'exerciseInduced'].map(key => (
                                <label key={key} className="flex items-center space-x-2">
                                    <input type="checkbox" name={key} checked={editedProfile[key] || false} onChange={handleProfileChange} className="rounded text-indigo-600 focus:ring-indigo-500"/>
                                    <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm text-sm font-medium">Save Changes</button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 pb-4 border-b border-gray-100">
                      <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl">
                        {patient.name?.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{patient.name}</h3>
                        <p className="text-sm text-gray-500">ID: {patient.patientId}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-y-3 text-sm">
                       <div><span className="text-gray-500 block">Age</span> <span className="font-medium text-gray-800">{patient.age} years</span></div>
                       <div><span className="text-gray-500 block">Gender</span> <span className="font-medium text-gray-800">{patient.gender || 'N/A'}</span></div>
                       <div><span className="text-gray-500 block">Phone</span> <span className="font-medium text-gray-800">{patient.phone}</span></div>
                       <div><span className="text-gray-500 block">BMI</span> <span className="font-medium text-gray-800">{patient.bmi || 'N/A'}</span></div>
                    </div>
                    
                    <div className="pt-2">
                        <span className="text-gray-500 text-sm block mb-1">Address</span>
                        <p className="text-gray-800 text-sm">{patient.address || 'No address provided'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* SOS Card */}
            <div className="bg-red-50 rounded-2xl border border-red-100 p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                   <h2 className="text-lg font-bold text-red-700 flex items-center">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                       <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                     </svg>
                     Emergency SOS
                   </h2>
                   <p className="text-xs text-red-600 mt-1">Notify your caretaker immediately.</p>
                </div>
              </div>

              {!showSosForm ? (
                  <button 
                  onClick={() => setShowSosForm(true)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all transform hover:scale-[1.02] flex justify-center items-center"
                  >
                   TRIGGER SOS ALERT
                  </button>
              ) : (
                  <form onSubmit={handleSosSubmit} className="space-y-3">
                      <textarea 
                        value={sosMessage}
                        onChange={(e) => setSosMessage(e.target.value)}
                        placeholder="Describe emergency (optional)" 
                        className="w-full p-3 border border-red-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none bg-white"
                        rows="2"
                      ></textarea>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setShowSosForm(false)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium">Cancel</button>
                        <button type="submit" className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-bold shadow hover:bg-red-700">SEND ALERT</button>
                      </div>
                  </form>
              )}
            </div>

            {/* Medical History Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Medical Overview</h2>
                <div className="space-y-4">
                    <div className="bg-purple-50 p-3 rounded-lg">
                        <p className="text-xs font-semibold text-purple-700 uppercase mb-2">Lung Function</p>
                        <div className="flex justify-between text-sm mb-1">
                            <span>FEV1</span>
                            <span className="font-bold text-gray-800">{patient.lungFunctionFEV1 || '-'}</span>
                        </div>
                        <div className="w-full bg-purple-200 rounded-full h-1.5 mb-3">
                           <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${Math.min(patient.lungFunctionFEV1 || 0, 100)}%` }}></div>
                        </div>
                        <div className="flex justify-between text-sm mb-1">
                            <span>FVC</span>
                            <span className="font-bold text-gray-800">{patient.lungFunctionFVC || '-'}</span>
                        </div>
                        <div className="w-full bg-purple-200 rounded-full h-1.5">
                           <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${Math.min(patient.lungFunctionFVC || 0, 100)}%` }}></div>
                        </div>
                    </div>
                    
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Risk Factors</p>
                        <div className="flex flex-wrap gap-2">
                            {patient.petAllergy === 1 && <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-md font-medium">Pet Allergy</span>}
                            {patient.familyHistoryAsthma === 1 && <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md font-medium">Family History</span>}
                            {patient.historyOfAllergies === 1 && <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-md font-medium">General Allergies</span>}
                            {patient.exerciseInduced === 1 && <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-md font-medium">Exercise Induced</span>}
                        </div>
                    </div>
                    
                    {patient.medicalHistory && (
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Notes</p>
                            <p className="text-sm text-gray-600 italic">{patient.medicalHistory}</p>
                        </div>
                    )}
                </div>
            </div>

          </div>
          
          {/* Middle & Right Columns (Combined in larger grid or separated) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Medication Tracker */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100">
                   <h2 className="text-lg font-bold text-indigo-900">Medication Tracker</h2>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {['morning', 'evening', 'night'].map((period) => (
                            <div key={period} className={`p-4 rounded-xl border-2 transition-all ${
                                getCurrentTimePeriod() === period ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-100 bg-white'
                            }`}>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="font-bold text-gray-700 capitalize">{period}</span>
                                    {intakeStatus[period] === 1 ? (
                                        <span className="h-6 w-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center">✓</span>
                                    ) : (
                                        <span className="h-6 w-6 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center">○</span>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleMedicationTaken(period)}
                                    className={`w-full py-2 rounded-lg text-sm font-semibold transition-colors ${
                                        intakeStatus[period] === 1 
                                        ? 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50' 
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
                                    }`}
                                >
                                    {intakeStatus[period] === 1 ? 'Undo' : 'Mark Taken'}
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-4 py-3 rounded-tl-lg">Medication</th>
                                    <th className="px-4 py-3">Dosage</th>
                                    <th className="px-4 py-3">Frequency</th>
                                    <th className="px-4 py-3">Timing</th>
                                    <th className="px-4 py-3 rounded-tr-lg">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {prescriptions.length > 0 ? prescriptions.map((prescription) => (
                                    <tr key={prescription._id} className="hover:bg-gray-50/50 transition">
                                        <td className="px-4 py-3 font-medium text-gray-900">{prescription.medicationName}</td>
                                        <td className="px-4 py-3 text-gray-600">{prescription.dosage}</td>
                                        <td className="px-4 py-3 text-gray-600">{prescription.frequency}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1">
                                                {['morning', 'evening', 'night'].map((time) => 
                                                    shouldTakeAtTime(prescription, time) && (
                                                        <span key={time} className="w-2 h-2 rounded-full bg-indigo-500" title={time}></span>
                                                    )
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                prescription.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                {prescription.status}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-6 text-center text-gray-500 italic">No medications assigned yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Appointments */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">Appointments</h2>
                    <button 
                        onClick={() => setShowAppointmentForm(!showAppointmentForm)}
                        className="text-indigo-600 text-sm font-semibold hover:text-indigo-800"
                    >
                        {showAppointmentForm ? 'Cancel' : '+ Request New'}
                    </button>
                </div>

                {showAppointmentForm && (
                    <div className="p-6 bg-indigo-50/30 border-b border-gray-100 animate-fade-in">
                        <form onSubmit={submitAppointment} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Date & Time</label>
                                    <input type="datetime-local" name="dateTime" value={newAppointment.dateTime} onChange={handleAppointmentChange} className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-indigo-500" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Doctor ID</label>
                                    <input type="text" name="doctorId" value={newAppointment.doctorId} onChange={handleAppointmentChange} className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-indigo-500" placeholder="Optional" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Duration</label>
                                    <select name="duration" value={newAppointment.duration} onChange={handleAppointmentChange} className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none">
                                        <option value="15">15 min</option>
                                        <option value="30">30 min</option>
                                        <option value="45">45 min</option>
                                        <option value="60">1 hr</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Purpose</label>
                                    <select name="purpose" value={newAppointment.purpose} onChange={handleAppointmentChange} className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none" required>
                                        <option value="">Select...</option>
                                        <option value="Routine Check-up">Routine Check-up</option>
                                        <option value="Symptom Review">Symptom Review</option>
                                        <option value="Medication Review">Medication Review</option>
                                        <option value="Emergency">Emergency</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Notes</label>
                                <textarea name="notes" value={newAppointment.notes} onChange={handleAppointmentChange} className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none" rows="2"></textarea>
                            </div>
                            <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition">Submit Request</button>
                        </form>
                    </div>
                )}

                <div className="divide-y divide-gray-100">
                    {appointments.length > 0 ? appointments.map((apt) => (
                        <div key={apt._id} className="p-4 hover:bg-gray-50 transition flex justify-between items-center">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-gray-800">{new Date(apt.dateTime).toLocaleDateString()}</span>
                                    <span className="text-gray-500 text-sm">{new Date(apt.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                                <p className="text-sm text-gray-600">{apt.purpose}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    apt.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                                    apt.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                    'bg-yellow-100 text-yellow-700'
                                }`}>
                                    {apt.status}
                                </span>
                                {apt.status === 'Confirmed' && (
                                    <button 
                                        onClick={() => handleJoinCall(apt)}
                                        className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition shadow-sm"
                                        title="Join Video Call"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l4 2A1 1 0 0020 14V6a1 1 0 00-1.447-.894l-4 2z" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    )) : (
                        <div className="p-8 text-center text-gray-500 text-sm">No upcoming appointments.</div>
                    )}
                </div>
            </div>

            {/* Symptoms Tracking */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-green-50/50">
                    <h2 className="text-lg font-bold text-green-900">Symptom Log</h2>
                    <button 
                        onClick={() => setShowSymptomForm(!showSymptomForm)}
                        className="text-green-700 text-sm font-semibold hover:text-green-900"
                    >
                        {showSymptomForm ? 'Cancel' : '+ Add Log'}
                    </button>
                </div>

                {showSymptomForm && (
                     <div className="p-6 bg-green-50/30 border-b border-gray-100">
                        <form onSubmit={submitSymptom}>
                            <div className="grid md:grid-cols-2 gap-6 mb-4">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Check Symptoms</p>
                                    <div className="space-y-2">
                                        {['coughing', 'chestTightness', 'shortnessOfBreath', 'wheezing', 'nighttimeSymptoms', 'exercise'].map((sym) => (
                                            <label key={sym} className="flex items-center space-x-2 p-2 rounded hover:bg-white cursor-pointer transition">
                                                <input type="checkbox" name={sym} checked={newSymptom[sym]} onChange={handleSymptomChange} className="rounded text-green-600 focus:ring-green-500" />
                                                <span className="text-sm text-gray-700 capitalize">{sym.replace(/([A-Z])/g, ' $1').trim()}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Environmental Triggers (0-10)</p>
                                    <div className="space-y-3">
                                        {['pollutionExposure', 'pollenExposure', 'dustExposure', 'physicalActivity'].map((trigger) => (
                                            <div key={trigger}>
                                                <div className="flex justify-between text-xs text-gray-600 mb-1">
                                                    <span className="capitalize">{trigger.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                    <span>{newSymptom[trigger]}</span>
                                                </div>
                                                <input type="range" name={trigger} min="0" max="10" step="1" value={newSymptom[trigger]} onChange={handleSymptomChange} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600" />
                                            </div>
                                        ))}
                                        <label className="flex items-center space-x-2 mt-2">
                                            <input type="checkbox" name="smoking" checked={newSymptom.smoking} onChange={handleSymptomChange} className="rounded text-red-600 focus:ring-red-500" />
                                            <span className="text-sm text-red-600 font-medium">Smoking</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <textarea name="notes" value={newSymptom.notes} onChange={handleSymptomChange} placeholder="Additional notes..." className="w-full p-3 border border-gray-300 rounded-lg text-sm mb-4 outline-none focus:border-green-500" rows="2"></textarea>
                            <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 shadow-sm transition">Save Entry</button>
                        </form>
                     </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-3">Symptoms</th>
                                <th className="px-6 py-3">Notes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {symptoms.length > 0 ? symptoms.slice(0, 5).map((log) => (
                                <tr key={log._id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {log.coughing > 0 && <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">Cough</span>}
                                            {log.wheezing > 0 && <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">Wheeze</span>}
                                            {log.shortnessOfBreath > 0 && <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">Breath</span>}
                                            {!log.coughing && !log.wheezing && !log.shortnessOfBreath && <span className="text-gray-400 text-xs">None recorded</span>}
                                        </div>
                                    </td>
                                   
                                    <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{log.notes || '-'}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="3" className="px-6 py-6 text-center text-gray-500 italic">No symptoms logged recently.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Queries Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">Questions for Doctor</h2>
                    <button onClick={() => setShowQueryForm(!showQueryForm)} className="text-indigo-600 text-sm font-semibold hover:text-indigo-800">
                        {showQueryForm ? 'Close' : '+ Ask Question'}
                    </button>
                </div>

                {showQueryForm && (
                    <div className="p-6 bg-gray-50 border-b border-gray-100">
                        <form onSubmit={submitQuery} className="space-y-3">
                            <input type="text" name="subject" value={query.subject} onChange={handleQueryChange} placeholder="Subject" className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none" required />
                            <select name="priority" value={query.priority} onChange={handleQueryChange} className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none">
                                <option value="Low">Low Priority</option>
                                <option value="Normal">Normal Priority</option>
                                <option value="High">High Priority</option>
                            </select>
                            <textarea name="message" value={query.message} onChange={handleQueryChange} placeholder="Type your question..." className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none" rows="3" required></textarea>
                            <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition">Submit</button>
                        </form>
                    </div>
                )}

                <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                    {queries.map((q) => (
                        <div key={q._id} className="p-4 hover:bg-gray-50 transition">
                            <div className="flex justify-between mb-1">
                                <span className="font-semibold text-gray-800">{q.subject}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${q.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>{q.priority}</span>
                            </div>
                            <p className="text-sm text-gray-600 truncate">{q.message}</p>
                        </div>
                    ))}
                    {queries.length === 0 && <div className="p-6 text-center text-gray-500 text-sm">No questions asked yet.</div>}
                </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;