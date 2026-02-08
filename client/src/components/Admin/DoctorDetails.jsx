import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
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
        <div className="flex justify-center items-center h-screen bg-slate-50">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600 mb-3"></div>
            <p className="text-gray-500 font-medium">Loading doctor profile...</p>
          </div>
        </div>
    );
  }

  if (error || !doctorData) {
    return (
        <div className="flex justify-center items-center h-screen bg-slate-50">
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{error || "Doctor not found"}</h3>
            <button onClick={() => navigate(-1)} className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">Go Back</button>
          </div>
        </div>
    );
  }

  const { doctor, patients, appointments } = doctorData;

  return (
    <div className="bg-slate-50 min-h-screen p-6 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-gray-500 hover:text-indigo-600 mb-6 transition font-medium"
        >
          <ArrowLeft className="h-5 w-5 mr-2" /> Back to Directory
        </button>

        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="md:flex">
            {/* Left Brand Side */}
            <div className="md:w-1/3 bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white flex flex-col items-center justify-center text-center">
              <div className="w-32 h-32 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-6 border-4 border-white/20 shadow-inner">
                <User className="h-16 w-16 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">{doctor.name}</h2>
              <p className="text-indigo-100 bg-indigo-800/30 px-4 py-1 rounded-full text-sm font-medium mb-6">
                {doctor.specialization || 'General Practitioner'}
              </p>
              
              <div className="flex flex-col gap-2 w-full max-w-xs">
                <div className="flex items-center justify-center bg-white/10 rounded-lg p-2">
                    <Award className="h-4 w-4 mr-2 text-indigo-200" />
                    <span className="text-sm">License: {doctor.licenseNumber || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-center bg-white/10 rounded-lg p-2">
                    <Clock className="h-4 w-4 mr-2 text-indigo-200" />
                    <span className="text-sm">{doctor.yearsOfExperience || '0'} Years Experience</span>
                </div>
              </div>
            </div>

            {/* Right Info Side */}
            <div className="md:w-2/3 p-8">
              <h3 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-2">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="flex items-start">
                  <div className="p-2 bg-indigo-50 rounded-lg mr-4">
                    <Mail className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Email Address</p>
                    <p className="font-medium text-gray-900 break-all">{doctor.email}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="p-2 bg-indigo-50 rounded-lg mr-4">
                    <Phone className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Phone Number</p>
                    <p className="font-medium text-gray-900">{doctor.phone || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="p-2 bg-indigo-50 rounded-lg mr-4">
                    <User className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">System ID</p>
                    <p className="font-medium text-gray-900">{doctor.doctorId}</p>
                  </div>
                </div>
              </div>
              
              {doctor.bio && (
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-100 pb-2">Biography</h3>
                  <p className="text-gray-600 leading-relaxed text-sm bg-gray-50 p-4 rounded-xl">{doctor.bio}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabbed Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
          <div className="flex border-b border-gray-100">
            <button 
              onClick={() => setActiveTab(0)}
              className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-colors flex items-center justify-center ${activeTab === 0 ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            >
              <Users className="h-4 w-4 mr-2" />
              Associated Patients ({patients?.length || 0})
            </button>
            <button 
              onClick={() => setActiveTab(1)}
              className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-colors flex items-center justify-center ${activeTab === 1 ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Scheduled Appointments ({appointments?.length || 0})
            </button>
          </div>

          <div className="p-0">
            {activeTab === 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {patients && patients.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient Name</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Age</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                          <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {patients.map((patient) => (
                          <tr key={patient._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">{patient.patientId}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{patient.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.dateOfBirth || (patient.age ? `${patient.age}` : '-')}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.phone}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <button 
                                onClick={() => navigate(`/patient/${patient.patientId}`)}
                                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
                              >
                                View Profile
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                    <Users className="h-12 w-12 text-gray-300 mb-3" />
                    <p>No patients currently assigned.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {appointments && appointments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient ID</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Purpose</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {appointments.map((appointment) => (
                          <tr key={appointment._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {new Date(appointment.dateTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">{appointment.patientId}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{appointment.purpose}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appointment.duration} min</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                                appointment.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 
                                appointment.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 
                                'bg-yellow-100 text-yellow-700'
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
                  <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                    <Calendar className="h-12 w-12 text-gray-300 mb-3" />
                    <p>No appointments scheduled.</p>
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