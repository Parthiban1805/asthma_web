import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DoctorNavbar from '../../utils/DoctorNavbar';

const AppointmentSystem = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showForm, setShowForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [formData, setFormData] = useState({
    patientId: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    duration: 30,
    purpose: '',
    notes: ''
  });
  
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const patientsResponse = await axios.get('http://localhost:5000/api/patients');
        setPatients(patientsResponse.data);
        fetchAppointments(selectedDate);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setMessage({ text: 'Failed to load data', type: 'error' });
      }
    };
  
    fetchInitialData();
  }, []);
  
  const fetchAppointments = async (date) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/appointments/date/${date}`);
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setMessage({ text: 'Failed to load appointments', type: 'error' });
    } finally {
      setLoading(false);
    }
  };
  
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    fetchAppointments(newDate);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const doctorId = user?.doctorId;
  
      const appointmentData = {
        ...formData,
        doctorId,
        dateTime: `${formData.date}T${formData.time}`
      };
  
      if (selectedAppointment) {
        await axios.put(`http://localhost:5000/api/appointments/${selectedAppointment._id}`, appointmentData);
        setMessage({ text: 'Appointment updated successfully', type: 'success' });
      } else {
        await axios.post('http://localhost:5000/api/appointments', appointmentData);
        setMessage({ text: 'Appointment scheduled successfully', type: 'success' });
      }
  
      resetForm();
      fetchAppointments(selectedDate);
    } catch (error) {
      console.error('Error saving appointment:', error);
      setMessage({
        text: selectedAppointment ? 'Failed to update appointment' : 'Failed to schedule appointment',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditAppointment = (appointment) => {
    const appointmentDateTime = new Date(appointment.dateTime);
    const formattedTime = appointmentDateTime.toTimeString().substring(0, 5);
  
    setSelectedAppointment(appointment);
    setFormData({
      patientId: appointment.patientId,
      date: appointmentDateTime.toISOString().split('T')[0],
      time: formattedTime,
      duration: appointment.duration,
      purpose: appointment.purpose,
      notes: appointment.notes
    });
    setShowForm(true);
  };
  
  const handleCancelAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        setLoading(true);
        await axios.put(`http://localhost:5000/api/appointments/${appointmentId}/cancel`);
        setMessage({ text: 'Appointment cancelled successfully', type: 'success' });
        fetchAppointments(selectedDate);
      } catch (error) {
        console.error('Error cancelling appointment:', error);
        setMessage({ text: 'Failed to cancel appointment', type: 'error' });
      } finally {
        setLoading(false);
      }
    }
  };
  
  const resetForm = () => {
    setFormData({
      patientId: '',
      date: selectedDate,
      time: '09:00',
      duration: 30,
      purpose: '',
      notes: ''
    });
    setSelectedAppointment(null);
    setShowForm(false);
  };
  
  const getAppointmentTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const getPatientName = (patientId) => {
    const patient = patients.find(p => p._id === patientId);
    return patient ? patient.name : 'Unknown Patient';
  };
  
  return (
    <>
      <DoctorNavbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-6 text-indigo-800">Appointment Management</h1>
            
            {message.text && (
              <div className={`p-4 mb-6 rounded-lg shadow-sm border-l-4 ${
                message.type === 'success' 
                  ? 'bg-green-50 border-green-500 text-green-700' 
                  : 'bg-red-50 border-red-500 text-red-700'
              }`}>
                {message.text}
              </div>
            )}
            
            <div className="mb-8 flex flex-wrap items-center gap-4 bg-white p-4 rounded-lg shadow-md">
              <div className="flex items-center">
                <label htmlFor="date-select" className="mr-2 font-medium text-gray-700">Select Date:</label>
                <input
                  id="date-select"
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 shadow-md ml-auto flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Schedule New Appointment
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                  <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-500">
                    <h2 className="font-bold text-lg text-white flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      Appointments for {new Date(selectedDate).toLocaleDateString()}
                    </h2>
                  </div>
                  
                  {loading ? (
                    <div className="flex items-center justify-center p-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                  ) : appointments.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {appointments.map((appointment) => (
                            <tr key={appointment._id} className="hover:bg-gray-50 transition-colors duration-150">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{getAppointmentTime(appointment.dateTime)}</div>
                                <div className="text-xs text-gray-500">{appointment.duration} mins</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{getPatientName(appointment.patientId)}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">{appointment.purpose}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  appointment.status === 'Confirmed' 
                                    ? 'bg-green-100 text-green-800' 
                                    : appointment.status === 'Cancelled'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {appointment.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button 
                                  onClick={() => handleEditAppointment(appointment)}
                                  className="text-indigo-600 hover:text-indigo-900 mr-4 transition-colors duration-150 disabled:opacity-50"
                                  disabled={appointment.status === 'Cancelled'}
                                >
                                  <span className="flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                    </svg>
                                    Edit
                                  </span>
                                </button>
                                <button 
                                  onClick={() => handleCancelAppointment(appointment._id)}
                                  className="text-red-600 hover:text-red-900 transition-colors duration-150 disabled:opacity-50"
                                  disabled={appointment.status === 'Cancelled'}
                                >
                                  <span className="flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                    Cancel
                                  </span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                      <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <p>No appointments scheduled for this date</p>
                    </div>
                  )}
                </div>
              </div>
              
              {showForm && (
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                    <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-500">
                      <h2 className="font-bold text-lg text-white flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                        {selectedAppointment ? 'Edit Appointment' : 'Schedule Appointment'}
                      </h2>
                    </div>
                    
                    <div className="p-6">
                      <form onSubmit={handleSubmit}>
                        <div className="space-y-5">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                            <select
                              name="patientId"
                              value={formData.patientId}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              required
                            >
                              <option value="">Select Patient</option>
                              {patients.map((patient) => (
                                <option key={patient._id} value={patient._id}>
                                    {patient.patientId} - {patient.name}
                                    </option>
                              ))}
                            </select>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                              <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                required
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                              <input
                                type="time"
                                name="time"
                                value={formData.time}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                required
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                            <select
                              name="duration"
                              value={formData.duration}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              required
                            >
                              <option value="15">15 minutes</option>
                              <option value="30">30 minutes</option>
                              <option value="45">45 minutes</option>
                              <option value="60">60 minutes</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                            <input
                              type="text"
                              name="purpose"
                              value={formData.purpose}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              required
                              placeholder="e.g. Regular check-up, Follow-up"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                            <textarea
                              name="notes"
                              value={formData.notes}
                              onChange={handleInputChange}
                              rows="3"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Additional notes"
                            ></textarea>
                          </div>
                        </div>
                        
                        <div className="mt-6 flex space-x-4">
                          <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loading 
                              ? 'Saving...' 
                              : selectedAppointment 
                                ? 'Update Appointment' 
                                : 'Schedule Appointment'
                            }
                          </button>
                          
                          <button
                            type="button"
                            onClick={resetForm}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AppointmentSystem;