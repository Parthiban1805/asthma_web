import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DoctorNavbar from '../../utils/DoctorNavbar'
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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Retrieve the user object from localStorage
        const user = JSON.parse(localStorage.getItem('user'));

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

  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
          <DoctorNavbar />
      <div className="container mx-auto px-4 py-6">

    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Welcome, {doctor?.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm uppercase">Total Patients</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalPatients}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm uppercase">Today's Appointments</h3>
          <p className="text-3xl font-bold mt-2">{stats.todayAppointments}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm uppercase">Pending Prescriptions</h3>
          <p className="text-3xl font-bold mt-2">{stats.pendingPrescriptions}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="font-bold text-lg">Upcoming Appointments</h2>
        </div>

        {recentAppointments.length > 0 ? (
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
              {recentAppointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{appointment.patientName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(appointment.dateTime).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {appointment.purpose}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      appointment.status === 'Confirmed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {appointment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-6 text-center text-gray-500">No upcoming appointments</div>
        )}
      </div>
    </div>
    </div>
    </>
  );
};

export default Dashboard;
