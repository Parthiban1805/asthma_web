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

        // Check if the user exists and has a doctorId
        if (!user || user.role !== 'patient') {
          throw new Error('User is not a doctor or no user found');
        }

        const patientId = user.patientId;
        console.log(patientId) // Extract the doctorId from the user object
        
        if (!patientId) {
          navigate('/login');
          return;
        }
        
        setLoading(true);
        
        // Fetch patient details
        const patientResponse = await axios.get(`http://localhost:5000/api/patients/${patientId}`);
        setPatient(patientResponse.data);
        
        // Fetch prescriptions
        const prescriptionsResponse = await axios.get(`http://localhost:5000/api/patient-medications/${patientId}`);
        setPrescriptions(prescriptionsResponse.data);
        
        // Fetch appointments
        const appointmentsResponse = await axios.get(`http://localhost:5000/api/patient-appointments/${patientId}`);
        setAppointments(appointmentsResponse.data);
        
        // Fetch symptoms
        const symptomsResponse = await axios.get(`http://localhost:5000/api/symptoms/${patientId}`);
        setSymptoms(symptomsResponse.data);
        
        // Fetch caretakers
        const caretakersResponse = await axios.get(`http://localhost:5000/api/caretakers/${patientId}`);
        setCaretakers(caretakersResponse.data);
        
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
      // instead of the string patientId
      const patientMongoId = patient._id; // This should be the MongoDB ObjectId
      
      const response = await axios.post('http://localhost:5000/api/appointments', {
        ...newAppointment,
        patientId: patientMongoId, // Use the MongoDB _id
        doctorId: patient.doctorId,
        status: 'Confirmed'
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
  };  if (loading) return <div className="p-4 text-center">Loading dashboard...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;
  if (!patient) return <div className="p-4 text-center">No patient data found</div>;
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Patient Dashboard</h1>
      
      {/* Patient Profile */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">My Profile</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p><span className="font-medium">Name:</span> {patient.name}</p>
            <p><span className="font-medium">Email:</span> {patient.email || 'Not provided'}</p>
            <p><span className="font-medium">Phone:</span> {patient.phone}</p>
            <p><span className="font-medium">Date of Birth:</span> {patient.dateOfBirth}</p>
            <p><span className="font-medium">Age:</span> {patient.age}</p>
          </div>
          <div>
            <p><span className="font-medium">Gender:</span> {patient.gender || 'Not specified'}</p>
            <p><span className="font-medium">Address:</span> {patient.address || 'Not provided'}</p>
            <p><span className="font-medium">BMI:</span> {patient.bmi || 'Not calculated'}</p>
          </div>
        </div>
      </div>
      
      {/* Medical History */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Medical History</h2>
        <p className="mb-4">{patient.medicalHistory || 'No medical history recorded'}</p>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2">Asthma Risk Factors:</h3>
            <ul className="list-disc pl-5">
              <li>Pet Allergy: {patient.petAllergy ? 'Yes' : 'No'}</li>
              <li>Family History of Asthma: {patient.familyHistoryAsthma ? 'Yes' : 'No'}</li>
              <li>History of Allergies: {patient.historyOfAllergies ? 'Yes' : 'No'}</li>
              <li>Hayfever: {patient.hayfever ? 'Yes' : 'No'}</li>
              <li>Gastroesophageal Reflux: {patient.gastroesophagealReflux ? 'Yes' : 'No'}</li>
              <li>Exercise Induced: {patient.exerciseInduced ? 'Yes' : 'No'}</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Lung Function:</h3>
            <p>FEV1: {patient.lungFunctionFEV1 || 'Not recorded'}</p>
            <p>FVC: {patient.lungFunctionFVC || 'Not recorded'}</p>
          </div>
        </div>
      </div>
      
      {/* Prescriptions */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">My Medications</h2>
        {prescriptions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Medication</th>
                  <th className="p-2 text-left">Dosage</th>
                  <th className="p-2 text-left">Frequency</th>
                  <th className="p-2 text-left">Start Date</th>
                  <th className="p-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((prescription) => (
                  <tr key={prescription._id} className="border-b">
                    <td className="p-2">{prescription.medicationName}</td>
                    <td className="p-2">{prescription.dosage}</td>
                    <td className="p-2">{prescription.frequency}</td>
                    <td className="p-2">{new Date(prescription.startDate).toLocaleDateString()}</td>
                    <td className="p-2">{prescription.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No medications assigned yet</p>
        )}
      </div>
      
      {/* Symptom Tracking */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Symptom Tracking</h2>
          <button 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => setShowSymptomForm(!showSymptomForm)}
          >
            {showSymptomForm ? 'Cancel' : 'Add Symptoms'}
          </button>
        </div>
        
        {showSymptomForm && (
          <form onSubmit={submitSymptom} className="mb-6 bg-gray-50 p-4 rounded">
            <h3 className="font-medium mb-3">Record New Symptoms</h3>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="coughing" 
                  name="coughing" 
                  checked={newSymptom.coughing}
                  onChange={handleSymptomChange}
                  className="mr-2"
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
                  className="mr-2"
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
                  className="mr-2"
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
                  className="mr-2"
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
                  className="mr-2"
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
                  className="mr-2"
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
              <label htmlFor="notes" className="block mb-1">Notes:</label>
              <textarea
                id="notes"
                name="notes"
                value={newSymptom.notes}
                onChange={handleSymptomChange}
                className="w-full border rounded p-2"
                rows="3"
              ></textarea>
            </div>
            
            <button 
              type="submit" 
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Save Symptoms
            </button>
          </form>
        )}
        
        {symptoms.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Symptoms</th>
                  <th className="p-2 text-left">Exercise</th>
                  <th className="p-2 text-left">Notes</th>
                </tr>
              </thead>
              <tbody>
                {symptoms.map((symptom) => (
                  <tr key={symptom._id} className="border-b">
                    <td className="p-2">{new Date(symptom.date).toLocaleDateString()}</td>
                    <td className="p-2">
                      {[
                        symptom.coughing && 'Coughing',
                        symptom.chestTightness && 'Chest Tightness',
                        symptom.shortnessOfBreath && 'Shortness of Breath',
                        symptom.wheezing && 'Wheezing',
                        symptom.nighttimeSymptoms && 'Nighttime Symptoms'
                      ].filter(Boolean).join(', ') || 'None'}
                    </td>
                    <td className="p-2">{symptom.exercise ? 'Yes' : 'No'}</td>
                    <td className="p-2">{symptom.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No symptom records found</p>
        )}
      </div>
      
      {/* Appointments */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">My Appointments</h2>
          <button 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => setShowAppointmentForm(!showAppointmentForm)}
          >
            {showAppointmentForm ? 'Cancel' : 'Request Appointment'}
          </button>
        </div>
        
        {showAppointmentForm && (
          <form onSubmit={submitAppointment} className="mb-6 bg-gray-50 p-4 rounded">
            <h3 className="font-medium mb-3">Request New Appointment</h3>
            
            <div className="mb-4">
              <label htmlFor="dateTime" className="block mb-1">Date and Time:</label>
              <input
                type="datetime-local"
                id="dateTime"
                name="dateTime"
                value={newAppointment.dateTime}
                onChange={handleAppointmentChange}
                className="w-full border rounded p-2"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="duration" className="block mb-1">Duration (minutes):</label>
              <select
                id="duration"
                name="duration"
                value={newAppointment.duration}
                onChange={handleAppointmentChange}
                className="w-full border rounded p-2"
                required
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label htmlFor="purpose" className="block mb-1">Purpose:</label>
              <input
                type="text"
                id="purpose"
                name="purpose"
                value={newAppointment.purpose}
                onChange={handleAppointmentChange}
                className="w-full border rounded p-2"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="appointmentNotes" className="block mb-1">Notes:</label>
              <textarea
                id="appointmentNotes"
                name="notes"
                value={newAppointment.notes}
                onChange={handleAppointmentChange}
                className="w-full border rounded p-2"
                rows="3"
              ></textarea>
            </div>
            
            <button 
              type="submit" 
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Request Appointment
            </button>
          </form>
        )}
        
        {appointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Date & Time</th>
                  <th className="p-2 text-left">Duration</th>
                  <th className="p-2 text-left">Purpose</th>
                  <th className="p-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment._id} className="border-b">
                    <td className="p-2">{new Date(appointment.dateTime).toLocaleString()}</td>
                    <td className="p-2">{appointment.duration} minutes</td>
                    <td className="p-2">{appointment.purpose}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        appointment.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
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
          <p>No appointments scheduled</p>
        )}
      </div>
      
      {/* Caretaker Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">My Caretakers</h2>
        {caretakers.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {caretakers.map((caretaker) => (
              <div key={caretaker._id} className="border rounded p-4">
                <h3 className="font-medium mb-2">{caretaker.name}</h3>
                <p><span className="font-medium">Relationship:</span> {caretaker.relationship}</p>
                <p><span className="font-medium">Phone:</span> {caretaker.phone}</p>
                {caretaker.email && <p><span className="font-medium">Email:</span> {caretaker.email}</p>}
                {caretaker.isPrimaryContact && (
                  <div className="mt-2">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Primary Contact</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No caretakers assigned</p>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;
