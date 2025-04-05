import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { ArrowLeft, User, Users, FileText, Activity, Calendar, Phone, Mail, MapPin, Heart } from 'lucide-react';

const PatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [patientData, setPatientData] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

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
      <div className="flex justify-center items-center h-full bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-lg shadow">
        <div className="text-lg text-indigo-700 font-semibold">Loading patient details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-center p-8 rounded-lg shadow">
        <div className="text-red-600 font-medium">Error loading patient: {error}</div>
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className="bg-amber-50 text-center p-8 rounded-lg shadow">
        <div className="text-amber-600 font-medium">Patient not found</div>
      </div>
    );
  }

  const patient = patientData?.patient || patientData; // support both formats
  const { caretakers, prescriptions, symptoms, appointments } = patientData;
  
  // Function to get severity color
  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'Mild': return 'bg-green-100 text-green-800 border-green-200';
      case 'Moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Severe': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Function to get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'Active':
      case 'Confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'Completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate(-1)} 
            className="mr-4 p-2 bg-white rounded-full shadow hover:bg-indigo-50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-indigo-700" />
          </button>
          <h1 className="text-2xl font-bold text-indigo-900">Patient Details</h1>
        </div>

        <Card className="border-none shadow-lg mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white p-6">
            <div className="flex flex-wrap items-center">
              <div className="w-full md:w-1/4 flex justify-center md:justify-start mb-4 md:mb-0">
                <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/40">
                  <User className="h-16 w-16 text-white" />
                </div>
              </div>
              <div className="w-full md:w-3/4">
                <h2 className="text-2xl font-bold mb-2">{patient.name}</h2>
                <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full mb-4">
                  <span className="font-medium">Patient ID: {patient.patientId}</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-white/80" />
                    <div>
                      <p className="text-sm text-white/80">Date of Birth</p>
                      <p className="font-medium">{patient.dateOfBirth || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <User className="h-5 w-5 mr-2 text-white/80" />
                    <div>
                      <p className="text-sm text-white/80">Gender</p>
                      <p className="font-medium">{patient.gender || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Heart className="h-5 w-5 mr-2 text-white/80" />
                    <div>
                      <p className="text-sm text-white/80">BMI</p>
                      <p className="font-medium">{patient.bmi || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <CardContent className="p-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start">
                <Phone className="h-5 w-5 mr-3 text-indigo-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 font-medium">Phone</p>
                  <p className="font-semibold text-gray-900">{patient.phone}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Mail className="h-5 w-5 mr-3 text-indigo-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 font-medium">Email</p>
                  <p className="font-semibold text-gray-900">{patient.email || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-3 text-indigo-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 font-medium">Address</p>
                  <p className="font-semibold text-gray-900">{patient.address || 'N/A'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs selectedIndex={activeTab} onSelect={index => setActiveTab(index)}>
          <TabList className="flex mb-6 overflow-x-auto border-b-0 no-scrollbar">
            {['Medical History', 'Symptoms', 'Appointments', 'Caretakers'].map((tabName, index) => (
              <Tab 
                key={tabName}
                className={`px-6 py-3 focus:outline-none cursor-pointer rounded-t-lg mr-2 transition-colors font-medium ${
                  activeTab === index 
                    ? 'bg-white text-indigo-700 shadow-md' 
                    : 'bg-indigo-100/50 text-indigo-600 hover:bg-indigo-100'
                }`}
                selectedClassName="!bg-white !text-indigo-700"
              >
                <div className="flex items-center">
                  {index === 0 && <FileText className="h-4 w-4 mr-2" />}
                  {index === 1 && <Activity className="h-4 w-4 mr-2" />}
                  {index === 2 && <Calendar className="h-4 w-4 mr-2" />}
                  {index === 3 && <Users className="h-4 w-4 mr-2" />}
                  {tabName}
                </div>
              </Tab>
            ))}
          </TabList>

          <div className="bg-white rounded-lg shadow-lg p-0 overflow-hidden">
            <TabPanel>
              <div className="border-b border-gray-200">
                <h3 className="text-lg font-bold px-6 py-4 bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-900">
                  Medical History
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="shadow-sm border border-gray-100">
                    <CardHeader className="bg-green-50 border-b border-green-100">
                      <CardTitle className="text-green-800 flex items-center text-lg">
                        <FileText className="h-5 w-5 mr-2 text-green-600" />
                        General Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Medical History</p>
                          <p className="mt-1">{patient.medicalHistory || 'No medical history recorded'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="shadow-sm border border-gray-100">
                    <CardHeader className="bg-orange-50 border-b border-orange-100">
                      <CardTitle className="text-orange-800 flex items-center text-lg">
                        <Activity className="h-5 w-5 mr-2 text-orange-600" />
                        Conditions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                        <div className={`flex items-center p-2 rounded-md ${patient.petAllergy ? 'bg-indigo-50 text-indigo-800' : 'bg-gray-50 text-gray-500'}`}>
                          <input type="checkbox" checked={patient.petAllergy || false} disabled className="mr-2 accent-indigo-600" />
                          <span className={patient.petAllergy ? 'font-medium' : ''}>Pet Allergy</span>
                        </div>
                        <div className={`flex items-center p-2 rounded-md ${patient.familyHistoryAsthma ? 'bg-blue-50 text-blue-800' : 'bg-gray-50 text-gray-500'}`}>
                          <input type="checkbox" checked={patient.familyHistoryAsthma || false} disabled className="mr-2 accent-blue-600" />
                          <span className={patient.familyHistoryAsthma ? 'font-medium' : ''}>Family History of Asthma</span>
                        </div>
                        <div className={`flex items-center p-2 rounded-md ${patient.historyOfAllergies ? 'bg-purple-50 text-purple-800' : 'bg-gray-50 text-gray-500'}`}>
                          <input type="checkbox" checked={patient.historyOfAllergies || false} disabled className="mr-2 accent-purple-600" />
                          <span className={patient.historyOfAllergies ? 'font-medium' : ''}>History of Allergies</span>
                        </div>
                        <div className={`flex items-center p-2 rounded-md ${patient.hayfever ? 'bg-green-50 text-green-800' : 'bg-gray-50 text-gray-500'}`}>
                          <input type="checkbox" checked={patient.hayfever || false} disabled className="mr-2 accent-green-600" />
                          <span className={patient.hayfever ? 'font-medium' : ''}>Hayfever</span>
                        </div>
                        <div className={`flex items-center p-2 rounded-md ${patient.gastroesophagealReflux ? 'bg-pink-50 text-pink-800' : 'bg-gray-50 text-gray-500'}`}>
                          <input type="checkbox" checked={patient.gastroesophagealReflux || false} disabled className="mr-2 accent-pink-600" />
                          <span className={patient.gastroesophagealReflux ? 'font-medium' : ''}>Gastroesophageal Reflux</span>
                        </div>
                        <div className={`flex items-center p-2 rounded-md ${patient.exerciseInduced ? 'bg-cyan-50 text-cyan-800' : 'bg-gray-50 text-gray-500'}`}>
                          <input type="checkbox" checked={patient.exerciseInduced || false} disabled className="mr-2 accent-cyan-600" />
                          <span className={patient.exerciseInduced ? 'font-medium' : ''}>Exercise-Induced Symptoms</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-8">
                  <Card className="shadow-sm border border-gray-100">
                    <CardHeader className="bg-cyan-50 border-b border-cyan-100">
                      <CardTitle className="text-cyan-800 flex items-center text-lg">
                        <Activity className="h-5 w-5 mr-2 text-cyan-600" />
                        Lung Function
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm font-medium text-gray-500">FEV1</p>
                          <p className="font-semibold text-xl text-gray-900 mt-1">{patient.lungFunctionFEV1 || 'Not recorded'}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm font-medium text-gray-500">FVC</p>
                          <p className="font-semibold text-xl text-gray-900 mt-1">{patient.lungFunctionFVC || 'Not recorded'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-8">
                  <Card className="shadow-sm border border-gray-100">
                    <CardHeader className="bg-indigo-50 border-b border-indigo-100">
                      <CardTitle className="text-indigo-800 flex items-center text-lg">
                        <FileText className="h-5 w-5 mr-2 text-indigo-600" />
                        Current Prescriptions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      {prescriptions && prescriptions.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Medication</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Dosage</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Frequency</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Start Date</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {prescriptions.map((prescription) => (
                                <tr key={prescription._id} className="hover:bg-gray-50 transition-colors">
                                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{prescription.medicationName}</td>
                                  <td className="px-6 py-4 whitespace-nowrap">{prescription.dosage}</td>
                                  <td className="px-6 py-4 whitespace-nowrap">{prescription.frequency}</td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {prescription.startDate ? new Date(prescription.startDate).toLocaleDateString() : 'N/A'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-3 py-1 text-xs rounded-full border ${getStatusColor(prescription.status)}`}>
                                      {prescription.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                          <p>No prescriptions recorded</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabPanel>

            <TabPanel>
              <div className="border-b border-gray-200">
                <h3 className="text-lg font-bold px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-900">
                  Symptom History
                </h3>
              </div>
              <div className="p-6">
                {symptoms && symptoms.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden shadow-sm border border-gray-200">
                      <thead>
                        <tr className="bg-purple-50 text-purple-900">
                          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Severity</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Symptoms</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {symptoms.map((symptom) => (
                          <tr key={symptom._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                              {new Date(symptom.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 text-xs rounded-full border ${getSeverityColor(symptom.severity)}`}>
                                {symptom.severity}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-2">
                                {symptom.coughing && <span className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-md border border-red-100">Coughing</span>}
                                {symptom.wheezing && <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-100">Wheezing</span>}
                                {symptom.shortnessOfBreath && <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-md border border-purple-100">Shortness of Breath</span>}
                                {symptom.chestTightness && <span className="px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded-md border border-orange-100">Chest Tightness</span>}
                                {symptom.nighttimeSymptoms && <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-md border border-indigo-100">Nighttime Symptoms</span>}
                                {symptom.exercise && <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-md border border-green-100">Exercise-induced</span>}
                              </div>
                            </td>
                            <td className="px-6 py-4">{symptom.notes || 'No notes'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Activity className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">No symptom records found</p>
                  </div>
                )}
              </div>
            </TabPanel>

            <TabPanel>
              <div className="border-b border-gray-200">
                <h3 className="text-lg font-bold px-6 py-4 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-900">
                  Appointments
                </h3>
              </div>
              <div className="p-6">
                {appointments && appointments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden shadow-sm border border-gray-200">
                      <thead>
                        <tr className="bg-blue-50 text-blue-900">
                          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Date & Time</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Doctor</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Purpose</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Duration</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {appointments.map((appointment) => (
                          <tr key={appointment._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                              {new Date(appointment.dateTime).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">{appointment.doctorId}</td>
                            <td className="px-6 py-4">{appointment.purpose}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{appointment.duration} mins</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 text-xs rounded-full border ${getStatusColor(appointment.status)}`}>
                                {appointment.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">No appointments scheduled</p>
                  </div>
                )}
              </div>
            </TabPanel>

            <TabPanel>
              <div className="border-b border-gray-200">
                <h3 className="text-lg font-bold px-6 py-4 bg-gradient-to-r from-green-50 to-teal-50 text-green-900">
                  Caretakers
                </h3>
              </div>
              <div className="p-6">
                {caretakers && caretakers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {caretakers.map((caretaker) => (
                      <Card key={caretaker._id} className="overflow-hidden shadow-sm border border-gray-100">
                        <div className={`p-4 ${caretaker.isPrimaryContact ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white' : 'bg-gray-50'}`}>
                          <div className="flex items-center">
                            <div className={`h-12 w-12 rounded-full ${caretaker.isPrimaryContact ? 'bg-white/20' : 'bg-green-100'} flex items-center justify-center mr-3`}>
                              <User className={`h-6 w-6 ${caretaker.isPrimaryContact ? 'text-white' : 'text-green-600'}`} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{caretaker.name}</h3>
                              <p className={`text-sm ${caretaker.isPrimaryContact ? 'text-white/80' : 'text-gray-500'}`}>{caretaker.relationship}</p>
                            </div>
                            {caretaker.isPrimaryContact && (
                              <span className="ml-auto bg-white/20 text-white text-xs px-3 py-1 rounded-full font-medium">
                                Primary Contact
                              </span>
                            )}
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-start">
                              <Phone className="h-4 w-4 mr-2 text-green-600 mt-1" />
                              <div>
                                <p className="text-xs text-gray-500 font-medium">Phone</p>
                                <p className="font-medium">{caretaker.phone}</p>
                              </div>
                            </div>
                            {caretaker.email && (
                              <div className="flex items-start">
                                <Mail className="h-4 w-4 mr-2 text-green-600 mt-1" />
                                <div>
                                  <p className="text-xs text-gray-500 font-medium">Email</p>
                                  <p className="font-medium">{caretaker.email}</p>
                                </div>
                              </div>
                            )}
                          </div>
                          {caretaker.address && (
                            <div className="mt-4 flex items-start">
                              <MapPin className="h-4 w-4 mr-2 text-green-600 mt-1" />
                              <div>
                                <p className="text-xs text-gray-500 font-medium">Address</p>
                                <p>{caretaker.address}</p>
                              </div>
                            </div>
                          )}
                          {caretaker.notes && (
                            <div className="mt-4 bg-gray-50 p-3 rounded-md">
                              <p className="text-xs text-gray-500 font-medium mb-1">Notes</p>
                              <p className="text-sm">{caretaker.notes}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Users className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">No caretakers registered</p>
                  </div>
                )}
              </div>
            </TabPanel>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default PatientDetails;