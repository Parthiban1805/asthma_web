import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { ArrowLeft, User, Users, Calendar, Phone, Mail, Award, Clock } from 'lucide-react';

const DoctorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [doctorData, setDoctorData] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/admin/doctors/${id}`);
        setDoctorData(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDoctorDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full p-12">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-32 w-32 bg-blue-200 rounded-full mb-4"></div>
          <div className="h-4 w-48 bg-blue-200 rounded mb-2"></div>
          <div className="h-3 w-32 bg-blue-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full p-12">
        <div className="text-center text-red-600 p-6 bg-red-50 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-2">Error Loading Data</h3>
          <p>{error}</p>
          <button 
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!doctorData) {
    return (
      <div className="flex justify-center items-center h-full p-12">
        <div className="text-center p-6 bg-gray-50 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-2">Doctor Not Found</h3>
          <button 
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { doctor, patients, appointments } = doctorData;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate(-1)} 
            className="mr-4 p-2 bg-white rounded-full shadow hover:shadow-md transition transform hover:-translate-x-1"
          >
            <ArrowLeft className="h-5 w-5 text-blue-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Doctor Profile</h1>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6 border border-blue-100">
          <div className="md:flex">
            <div className="md:w-1/3 bg-gradient-to-br from-blue-500 to-indigo-600 p-6 text-white flex flex-col items-center justify-center">
              <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4 border-4 border-white">
                <User className="h-16 w-16 text-white" />
              </div>
              <h2 className="text-xl font-bold mb-1">{doctor.name}</h2>
              <p className="text-blue-100 mb-4">{doctor.specialization || 'General Practitioner'}</p>
              <div className="flex items-center mb-2">
                <Award className="h-4 w-4 mr-2 text-blue-200" />
                <span className="text-sm">License: {doctor.licenseNumber || 'N/A'}</span>
              </div>
              <div className="flex items-center mb-2">
                <Clock className="h-4 w-4 mr-2 text-blue-200" />
                <span className="text-sm">{doctor.yearsOfExperience || '0'} Years Experience</span>
              </div>
            </div>
            <div className="md:w-2/3 p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-medium text-gray-800">{doctor.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <Phone className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="font-medium text-gray-800">{doctor.phone || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Doctor ID</p>
                      <p className="font-medium text-gray-800">{doctor.doctorId}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {doctor.bio && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Biography</h3>
                  <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">{doctor.bio}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-blue-100">
          <div className="flex bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            <button 
              onClick={() => setActiveTab(0)}
              className={`flex-1 py-4 px-6 text-center font-medium focus:outline-none flex items-center justify-center ${activeTab === 0 ? 'bg-white bg-opacity-20' : ''}`}
            >
              <Users className="h-5 w-5 mr-2" />
              Patients ({patients?.length || 0})
            </button>
            <button 
              onClick={() => setActiveTab(1)}
              className={`flex-1 py-4 px-6 text-center font-medium focus:outline-none flex items-center justify-center ${activeTab === 1 ? 'bg-white bg-opacity-20' : ''}`}
            >
              <Calendar className="h-5 w-5 mr-2" />
              Appointments ({appointments?.length || 0})
            </button>
          </div>

          <div className="p-6">
            {activeTab === 0 ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Doctor's Patients</h3>
                {patients && patients.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age/DOB</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {patients.map((patient) => (
                          <tr key={patient._id} className="hover:bg-blue-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">{patient.patientId}</td>
                            <td className="px-6 py-4 whitespace-nowrap font-medium">{patient.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {patient.dateOfBirth || (patient.age ? `${patient.age} yrs` : 'N/A')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">{patient.phone}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button 
                                onClick={() => navigate(`/patient/${patient.patientId}`)}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Users className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500">No patients assigned to this doctor</p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Doctor's Appointments</h3>
                {appointments && appointments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {appointments.map((appointment) => (
                          <tr key={appointment._id} className="hover:bg-blue-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap font-medium">
                              {new Date(appointment.dateTime).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">{appointment.patientId}</td>
                            <td className="px-6 py-4">{appointment.purpose}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{appointment.duration} mins</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                                appointment.status === 'Confirmed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : appointment.status === 'Cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
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
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500">No appointments scheduled</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetails;