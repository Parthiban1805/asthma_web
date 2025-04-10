import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DoctorNavbar from '../../utils/DoctorNavbar';
import { Calendar, Clock, Users, FileText, Send, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const dummyDoctor = {
  name: 'Dr. Jane Smith'
};

const dummyStats = {
  totalPatients: 120,
  todayAppointments: 5,
  pendingPrescriptions: 3
};

const dummyAppointments = [
  {
    id: 1,
    patientName: 'Alice Johnson',
    dateTime: new Date().toISOString(),
    purpose: 'General Checkup',
    status: 'Confirmed'
  },
  {
    id: 2,
    patientName: 'Bob Smith',
    dateTime: new Date().toISOString(),
    purpose: 'Follow-up',
    status: 'Pending'
  }
];

const Dashboard = ({ doctor: initialDoctor }) => {
  const [doctor, setDoctor] = useState(initialDoctor || dummyDoctor);
  const [stats, setStats] = useState(dummyStats);
  const [recentAppointments, setRecentAppointments] = useState(dummyAppointments);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState("");
  const navigate = useNavigate();
  
  // Query form state
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('medium');
  const [queryLoading, setQueryLoading] = useState(false);
  const [querySuccess, setQuerySuccess] = useState(false);
  const [queryError, setQueryError] = useState('');
  
  const handleJoinCall = (appointment) => {
    // For example, use appointment.id or any unique field
    const roomID = `room-${appointment.id}`;
    navigate(`/video-call/${roomID}`);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Retrieve the user object from localStorage
        const user = JSON.parse(localStorage.getItem('user'));
        setUser(user)
        // Check if the user exists and has a doctorId
        if (!user || user.role !== 'doctor') {
          throw new Error('User is not a doctor or no user found');
        }

        const doctorId = user.doctorId; // Extract the doctorId from the user object

        // Fetch stats and appointments for the specific doctor
        const [statsResponse, appointmentsResponse] = await Promise.all([
          axios.get(`http://localhost:5000/api/stats/${doctorId}`),
          axios.get(`http://localhost:5000/api/appointments/${doctorId}`)
        ]);

        setStats(statsResponse.data);
        setRecentAppointments(appointmentsResponse.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Fallback to dummy data in case of error
        setStats(dummyStats);
        setRecentAppointments(dummyAppointments);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Handle query submission
  const handleSubmitQuery = async (e) => {
    e.preventDefault();
    setQueryLoading(true);
    setQueryError('');
    setQuerySuccess(false);

    try {
      // Get doctor ID from local storage
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!user || user.role !== 'doctor' || !user.doctorId) {
        throw new Error('Doctor information not found. Please login again.');
      }

      const doctorId = user.doctorId;

      // Send query to backend
      await axios.post('http://localhost:5000/api/doctor-queries', {
        doctorId,
        subject,
        message,
        priority
      });

      // Reset form on success
      setSubject('');
      setMessage('');
      setPriority('medium');
      setQuerySuccess(true);
    } catch (err) {
      setQueryError(err.response?.data?.message || err.message || 'Failed to submit query');
    } finally {
      setQueryLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <DoctorNavbar />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Welcome, {user.fullName}</h1>
              <p className="text-indigo-600 mt-1">Healthcare Dashboard</p>
            </div>
            <div className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-lg">
              <span className="font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transition-transform duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white text-opacity-90 text-sm font-semibold uppercase tracking-wider mb-1">Total Patients</h3>
                  <p className="text-4xl font-bold">{stats.totalPatients}</p>
                </div>
                <Users size={40} className="text-white text-opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white transition-transform duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white text-opacity-90 text-sm font-semibold uppercase tracking-wider mb-1">Today's Appointments</h3>
                  <p className="text-4xl font-bold">{stats.todayAppointments}</p>
                </div>
                <Calendar size={40} className="text-white text-opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl shadow-lg p-6 text-white transition-transform duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white text-opacity-90 text-sm font-semibold uppercase tracking-wider mb-1">Pending Prescriptions</h3>
                  <p className="text-4xl font-bold">{stats.pendingPrescriptions}</p>
                </div>
                <FileText size={40} className="text-white text-opacity-50" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Appointments Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-indigo-600">
                <h2 className="font-bold text-lg text-white flex items-center">
                  <Clock size={20} className="mr-2" />
                  Upcoming Appointments
                </h2>
              </div>

              {recentAppointments.length > 0 ? (
                <div className="overflow-x-auto max-h-80">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentAppointments.map((appointment, index) => (
                        <tr key={appointment.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{appointment.patientName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                            {new Date(appointment.dateTime).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                            {appointment.purpose}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              appointment.status === 'Confirmed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
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
                <div className="p-8 text-center">
                  <Clock size={40} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 text-lg">No upcoming appointments</p>
                </div>
              )}
            </div>

            {/* Query Form Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-indigo-600">
                <h2 className="font-bold text-lg text-white flex items-center">
                  <Send size={20} className="mr-2" />
                  Submit a Query
                </h2>
              </div>

              <div className="p-6">
                {querySuccess && (
                  <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded">
                    <p>Your query has been submitted successfully!</p>
                  </div>
                )}
                
                {queryError && (
                  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded flex items-start">
                    <AlertCircle className="mr-2 mt-0.5 flex-shrink-0" size={18} />
                    <p>{queryError}</p>
                  </div>
                )}
                
                <form onSubmit={handleSubmitQuery} className="space-y-4">
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter subject"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      id="priority"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Describe your query in detail..."
                    />
                  </div>
                  
                  <div>
                    <button
                      type="submit"
                      disabled={queryLoading}
                      className={`w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${queryLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {queryLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send size={16} className="mr-2" />
                          Submit Query
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;