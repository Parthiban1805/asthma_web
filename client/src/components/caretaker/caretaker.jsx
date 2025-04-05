import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CaretakerDashboard = ({ caretakerId }) => {
  const [unassignedPatients, setUnassignedPatients] = useState([]);
  const [assignedPatients, setAssignedPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch unassigned patients
  useEffect(() => {
    const fetchUnassignedPatients = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/caretaker/unassigned-patients');
        setUnassignedPatients(response.data);
      } catch (error) {
        console.error('Error fetching unassigned patients:', error);
      }
    };
    
    fetchUnassignedPatients();
  }, []);

  // Fetch assigned patients
  useEffect(() => {
    const fetchAssignedPatients = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/caretaker/assigned-patients/${caretakerId}`);
        setAssignedPatients(response.data);
      } catch (error) {
        console.error('Error fetching assigned patients:', error);
      }
    };
    
    fetchAssignedPatients();
  }, [caretakerId]);

  // Assign a patient to the caretaker
  const assignPatient = async (patientId) => {
    try {
      setLoading(true);
      await axios.post('http://localhost:5000/api/caretaker/assign-patient', {
        caretakerId,
        patientId
      });
      
      // Refresh both lists
      const unassignedResponse = await axios.get('http://localhost:5000/api/caretaker/unassigned-patients');
      setUnassignedPatients(unassignedResponse.data);
      
      const assignedResponse = await axios.get(`http://localhost:5000/api/caretaker/assigned-patients/${caretakerId}`);
      setAssignedPatients(assignedResponse.data);
      
      setLoading(false);
    } catch (error) {
      console.error('Error assigning patient:', error);
      setLoading(false);
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
    } catch (error) {
      console.error('Error fetching patient details:', error);
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Caretaker Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Unassigned Patients Panel */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Unassigned Patients</h2>
          {unassignedPatients.length === 0 ? (
            <p>No unassigned patients available.</p>
          ) : (
            <ul className="divide-y">
              {unassignedPatients.map(patient => (
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
                      onClick={() => assignPatient(patient._id)}
                      disabled={loading}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      Assign
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Assigned Patients Panel */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">My Patients</h2>
          {assignedPatients.length === 0 ? (
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
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
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
                    <p>{patientDetails.patient.phone}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="font-semibold">Address:</p>
                    <p>{patientDetails.patient.address}</p>
                  </div>
                </div>
              </section>
              
              {/* Medical Information */}
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
                  Appointments ({patientDetails.appointments.length})
                </h3>
                {patientDetails.appointments.length === 0 ? (
                  <p>No appointments scheduled.</p>
                ) : (
                  <div className="max-h-40 overflow-y-auto">
                    {patientDetails.appointments.map(appointment => (
                      <div key={appointment._id} className="mb-2 p-2 bg-gray-100 rounded">
                        <p className="font-medium">
                          {new Date(appointment.dateTime).toLocaleDateString()} at 
                          {new Date(appointment.dateTime).toLocaleTimeString()}
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
                  Prescriptions ({patientDetails.prescriptions.length})
                </h3>
                {patientDetails.prescriptions.length === 0 ? (
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
                  Recent Symptoms ({patientDetails.symptoms.length})
                </h3>
                {patientDetails.symptoms.length === 0 ? (
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaretakerDashboard;
