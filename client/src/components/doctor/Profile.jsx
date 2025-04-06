import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DoctorNavbar from '../../utils/DoctorNavbar';

const Profile = ({ doctor: initialDoctor }) => {
  const [doctor, setDoctor] = useState(initialDoctor || null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(initialDoctor || {});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (!initialDoctor) {
      const fetchDoctorProfile = async () => {
        try {
          const user = JSON.parse(localStorage.getItem('user'));
  
          if (!user || user.role !== 'doctor') {
            throw new Error('User is not a doctor or no user found');
          }
  
          const doctorId = user.doctorId;
  
          const response = await axios.get(`http://localhost:5000/api/doctors-profile/${doctorId}`);
          console.log("Received doctor data:", response.data);
          
          // Check if the response data is an array and extract the first doctor object
          const doctorData = Array.isArray(response.data) ? response.data[0] : response.data;
          
          setDoctor(doctorData);
          setFormData(doctorData);
        } catch (error) {
          console.error('Error fetching profile:', error);
          setMessage({ text: 'Failed to load profile.', type: 'error' });
        }
      };
  
      fetchDoctorProfile();
    } else {
      // Also handle the case where initialDoctor might be an array
      const doctorData = Array.isArray(initialDoctor) ? initialDoctor[0] : initialDoctor;
      setDoctor(doctorData);
      setFormData(doctorData);
    }
  }, [initialDoctor]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
  
      if (!user || user.role !== 'doctor') {
        throw new Error('User is not a doctor or no user found');
      }

      const doctorId = user.doctorId;

      const response = await axios.put(`http://localhost:5000/api/doctors-profile/${doctorId}`, formData);
      
      // Handle potential array response from the update call as well
      const updatedDoctor = Array.isArray(response.data) ? response.data[0] : response.data;
      
      setDoctor(updatedDoctor);
      setMessage({ text: 'Profile updated successfully', type: 'success' });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ text: 'Failed to update profile', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!doctor && !message.text) {
    return <div className="p-6 text-center text-gray-600">Loading profile...</div>;
  }

  // For debugging
  console.log("Current doctor state:", doctor);

  return (
    <>
          <DoctorNavbar />

    <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">

      <div className="max-w-5xl mx-auto">
        <div className="flex items-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
            {doctor?.name?.charAt(0) || 'D'}
          </div>
          <h1 className="text-3xl font-bold text-indigo-800">Healthcare Professional Profile</h1>
        </div>
        
        {message.text && (
          <div className={`p-4 mb-6 rounded-lg shadow border-l-4 ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-500 text-green-800' 
              : 'bg-red-50 border-red-500 text-red-800'
          } flex items-center`}>
            <span className={`mr-2 text-2xl ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
              {message.type === 'success' ? '✓' : '✕'}
            </span>
            {message.text}
          </div>
        )}
        
        {doctor ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-indigo-100">
            <div className="bg-indigo-50 p-4 border-b border-indigo-100 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-indigo-800">Profile Information</h2>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
            
            <div className="p-6">
              {isEditing ? (
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                      <input
                        type="text"
                        name="specialization"
                        value={formData.specialization || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                      <input
                        type="text"
                        name="licenseNumber"
                        value={formData.licenseNumber || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                      <input
                        type="number"
                        name="yearsOfExperience"
                        value={formData.yearsOfExperience || 0}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                      <textarea
                        name="bio"
                        value={formData.bio || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        rows="3"
                      ></textarea>
                    </div>
                  </div>
                  
                  <div className="mt-8 flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className={`px-6 py-2 ${
                        loading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
                      } text-white rounded-lg transition`}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Full Name</h3>
                    <p className="text-lg text-gray-900">{doctor.name || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Email</h3>
                    <p className="text-lg text-gray-900">{doctor.email || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Phone</h3>
                    <p className="text-lg text-gray-900">{doctor.phone || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Specialization</h3>
                    <p className="text-lg text-gray-900">{doctor.specialization || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">License Number</h3>
                    <p className="text-lg text-gray-900">{doctor.licenseNumber === "" ? 'Not provided' : doctor.licenseNumber}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Years of Experience</h3>
                    <p className="text-lg text-gray-900">{doctor.yearsOfExperience !== undefined ? doctor.yearsOfExperience : 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Doctor ID</h3>
                    <p className="text-lg text-gray-900">{doctor.doctorId || 'Not available'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Bio</h3>
                    <p className="text-lg text-gray-900">{doctor.bio ? doctor.bio : 'Not provided'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center text-red-600 p-6 bg-white rounded-xl shadow-lg">
            No profile data available. {message.text ? '' : 'Please try refreshing the page.'}
          </div>
        )}
      </div>
    </div>
    </>

  );
};

export default Profile;