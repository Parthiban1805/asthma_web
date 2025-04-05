import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { ArrowLeft, User, Users, FileText, Activity, Calendar } from 'lucide-react';

const PatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [patientData, setPatientData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/admin/patients/${id}`);
        setPatientData(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPatientDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        Loading patient details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        Error loading patient: {error}
      </div>
    );
  }

  if (!patientData) {
    return <div className="text-center">Patient not found</div>;
  }

  const patient = patientData?.patient || patientData; // support both formats
  const { caretakers, prescriptions, symptoms, appointments } = patientData;
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="mr-4 p-2 bg-white rounded-full shadow-sm hover:bg-gray-50"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold">Patient Details</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-wrap">
          <div className="w-full md:w-1/4 flex justify-center md:justify-start mb-4 md:mb-0">
            <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-16 w-16 text-blue-500" />
            </div>
          </div>
          <div className="w-full md:w-3/4">
            <h2 className="text-xl font-bold mb-4">{patient.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Patient ID</p>
                <p className="font-medium">{patient.patientId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Doctor ID</p>
                <p className="font-medium">{patient.doctorId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date of Birth</p>
                <p className="font-medium">{patient.dateOfBirth || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Gender</p>
                <p className="font-medium">{patient.gender || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{patient.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{patient.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">{patient.address || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">BMI</p>
                <p className="font-medium">{patient.bmi || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Tabs>
        <TabList className="flex border-b mb-4">
          <Tab className="px-4 py-2 focus:outline-none cursor-pointer">
            <div className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Medical History
            </div>
          </Tab>
          <Tab className="px-4 py-2 focus:outline-none cursor-pointer">
            <div className="flex items-center">
              <Activity className="h-4 w-4 mr-2" />
              Symptoms
            </div>
          </Tab>
          <Tab className="px-4 py-2 focus:outline-none cursor-pointer">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Appointments
            </div>
          </Tab>
          <Tab className="px-4 py-2 focus:outline-none cursor-pointer">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Caretakers
            </div>
          </Tab>
        </TabList>

        <TabPanel>
          <Card>
            <CardHeader>
              <CardTitle>Medical History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">General Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Medical History</p>
                      <p>{patient.medicalHistory || 'No medical history recorded'}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Conditions</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input type="checkbox" checked={patient.petAllergy || false} disabled className="mr-2" />
                      <span>Pet Allergy</span>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" checked={patient.familyHistoryAsthma || false} disabled className="mr-2" />
                      <span>Family History of Asthma</span>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" checked={patient.historyOfAllergies || false} disabled className="mr-2" />
                      <span>History of Allergies</span>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" checked={patient.hayfever || false} disabled className="mr-2" />
                      <span>Hayfever</span>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" checked={patient.gastroesophagealReflux || false} disabled className="mr-2" />
                      <span>Gastroesophageal Reflux</span>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" checked={patient.exerciseInduced || false} disabled className="mr-2" />
                      <span>Exercise-Induced Symptoms</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Lung Function</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">FEV1</p>
                    <p className="font-medium">{patient.lungFunctionFEV1 || 'Not recorded'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">FVC</p>
                    <p className="font-medium">{patient.lungFunctionFVC || 'Not recorded'}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Current Prescriptions</h3>
                {prescriptions && prescriptions.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medication</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dosage</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {prescriptions.map((prescription) => (
                        <tr key={prescription._id}>
                          <td className="px-6 py-4 whitespace-nowrap">{prescription.medicationName}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{prescription.dosage}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{prescription.frequency}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {prescription.startDate ? new Date(prescription.startDate).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              prescription.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {prescription.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-500">No prescriptions recorded</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel>
          <Card>
            <CardHeader>
              <CardTitle>Symptom History</CardTitle>
            </CardHeader>
            <CardContent>
              {symptoms && symptoms.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symptoms</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {symptoms.map((symptom) => (
                      <tr key={symptom._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(symptom.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            symptom.severity === 'Mild' ? 'bg-green-100 text-green-800' : 
                            symptom.severity === 'Moderate' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {symptom.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <ul className="list-disc pl-4">
                            {symptom.coughing && <li>Coughing</li>}
                            {symptom.wheezing && <li>Wheezing</li>}
                            {symptom.shortnessOfBreath && <li>Shortness of Breath</li>}
                            {symptom.chestTightness && <li>Chest Tightness</li>}
                            {symptom.nighttimeSymptoms && <li>Nighttime Symptoms</li>}
                            {symptom.exercise && <li>Exercise-induced</li>}
                          </ul>
                        </td>
                        <td className="px-6 py-4">{symptom.notes || 'No notes'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500">No symptom records found</p>
              )}
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel>
          <Card>
            <CardHeader>
              <CardTitle>Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              {appointments && appointments.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {appointments.map((appointment) => (
                      <tr key={appointment._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(appointment.dateTime).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{appointment.doctorId}</td>
                        <td className="px-6 py-4">{appointment.purpose}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{appointment.duration} mins</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            appointment.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {appointment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500">No appointments scheduled</p>
              )}
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel>
          <Card>
            <CardHeader>
              <CardTitle>Caretakers</CardTitle>
            </CardHeader>
            <CardContent>
              {caretakers && caretakers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {caretakers.map((caretaker) => (
                    <div key={caretaker._id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-4">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <User className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <h3 className="font-medium">{caretaker.name}</h3>
                          <p className="text-sm text-gray-500">{caretaker.relationship}</p>
                        </div>
                        {caretaker.isPrimaryContact && (
                          <span className="ml-auto bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            Primary
                          </span>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p>{caretaker.phone}</p>
                        </div>
                        {caretaker.email && (
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p>{caretaker.email}</p>
                          </div>
                        )}
                        {caretaker.address && (
                          <div>
                            <p className="text-sm text-gray-500">Address</p>
                            <p>{caretaker.address}</p>
                          </div>
                        )}
                        {caretaker.notes && (
                          <div>
                            <p className="text-sm text-gray-500">Notes</p>
                            <p>{caretaker.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No caretakers registered</p>
              )}
            </CardContent>
          </Card>
        </TabPanel>
      </Tabs>
    </div>
  );
};
export default PatientDetails;