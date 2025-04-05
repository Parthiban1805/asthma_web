import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DoctorNavbar from '../../utils/DoctorNavbar'

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
          <div className="container mx-auto px-4 py-6">
    
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Appointment System</h1>
      
      {message.text && (
        <div className={`p-4 mb-4 rounded-md ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}
      
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center">
          <label htmlFor="date-select" className="mr-2 font-medium">Date:</label>
          <input
            id="date-select"
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ml-auto"
        >
          Schedule New Appointment
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="font-bold text-lg">Appointments for {new Date(selectedDate).toLocaleDateString()}</h2>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center p-6">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : appointments.length > 0 ? (
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
                    <tr key={appointment.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getAppointmentTime(appointment.dateTime)}
                        <div className="text-xs text-gray-500">{appointment.duration} mins</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPatientName(appointment.patientId)}
                      </td>
                      <td className="px-6 py-4">
                        {appointment.purpose}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
                          className="text-blue-600 hover:text-blue-900 mr-4"
                          disabled={appointment.status === 'Cancelled'}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleCancelAppointment(appointment.id)}
                          className="text-red-600 hover:text-red-900"
                          disabled={appointment.status === 'Cancelled'}
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-6 text-center text-gray-500">No appointments scheduled for this date</div>
            )}
          </div>
        </div>
        
        {showForm && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h2 className="font-bold text-lg">
                  {selectedAppointment ? 'Edit Appointment' : 'Schedule Appointment'}
                </h2>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                  <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
  <select
    name="patientId"
    value={formData.patientId}
    onChange={handleInputChange}
    className="w-full px-3 py-2 border border-gray-300 rounded-md"
    required
  >
    <option value="">Select Patient</option>
    {patients.map((patient) => (
      <option key={patient._id} value={patient._id}>
        {patient.name}
      </option>
    ))}
  </select>
</div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                      <select
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Additional notes"
                      ></textarea>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex space-x-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
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
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
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
    </>
  );
};

export default AppointmentSystem;
