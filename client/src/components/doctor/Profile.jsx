import React, { useState, useEffect } from 'react';
import axios from 'axios';

const dummyDoctor = {
  name: 'Dr. John Doe',
  email: 'john.doe@example.com',
  phone: '123-456-7890',
  specialization: 'Cardiology',
  licenseNumber: 'LIC123456',
  yearsOfExperience: 10,
  bio: 'Experienced cardiologist with a passion for patient care.',
};

const Profile = ({ doctor: initialDoctor }) => {
  const [doctor, setDoctor] = useState(initialDoctor || dummyDoctor);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(initialDoctor || dummyDoctor);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (!initialDoctor) {
      const fetchDoctorProfile = async () => {
        try {
          const response = await axios.get('http://localhost:5000/api/doctors-profile');
          setDoctor(response.data || dummyDoctor);
          setFormData(response.data || dummyDoctor);
        } catch (error) {
          console.error('Error fetching profile:', error);
          setDoctor(dummyDoctor);
          setFormData(dummyDoctor);
          setMessage({ text: 'Failed to load profile. Showing dummy data.', type: 'error' });
        }
      };

      fetchDoctorProfile();
    } else {
      setFormData(initialDoctor);
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
      const response = await axios.put('http://localhost:5000/api/doctors-profile', formData);
      setDoctor(response.data);
      setMessage({ text: 'Profile updated successfully', type: 'success' });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ text: 'Failed to update profile', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
            {doctor.name?.charAt(0) || 'D'}
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

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-indigo-100">
          <div className="px-8 py-6 bg-gradient-to-r from-indigo-600 to-purple-600 flex justify-between items-center">
            <h2 className="font-bold text-xl text-white">Professional Information</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-5 py-2 bg-white text-indigo-700 rounded-lg hover:bg-indigo-50 transition duration-200 font-medium shadow-md"
              >
                Edit Profile
              </button>
            )}
          </div>

          <div className="p-8">
            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-indigo-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-indigo-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-indigo-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-indigo-700 mb-1">Specialization</label>
                    <input
                      type="text"
                      name="specialization"
                      value={formData.specialization || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-indigo-700 mb-1">License Number</label>
                    <input
                      type="text"
                      name="licenseNumber"
                      value={formData.licenseNumber || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-indigo-700 mb-1">Years of Experience</label>
                    <input
                      type="number"
                      name="yearsOfExperience"
                      value={formData.yearsOfExperience || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div className="mt-8">
                  <label className="block text-sm font-medium text-indigo-700 mb-1">Biography</label>
                  <textarea
                    name="bio"
                    value={formData.bio || ''}
                    onChange={handleInputChange}
                    rows="5"
                    className="w-full px-4 py-3 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  ></textarea>
                </div>

                <div className="mt-8 flex space-x-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition duration-200 font-medium shadow-md disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData(doctor);
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <h3 className="text-sm font-medium text-blue-700">Full Name</h3>
                    <p className="mt-1 text-lg font-semibold">{doctor.name}</p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                    <h3 className="text-sm font-medium text-purple-700">Email</h3>
                    <p className="mt-1 text-lg">{doctor.email}</p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                    <h3 className="text-sm font-medium text-green-700">Phone Number</h3>
                    <p className="mt-1 text-lg">{doctor.phone || '—'}</p>
                  </div>

                  <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-500">
                    <h3 className="text-sm font-medium text-indigo-700">Specialization</h3>
                    <p className="mt-1 text-lg font-semibold">{doctor.specialization || '—'}</p>
                  </div>

                  <div className="bg-cyan-50 p-4 rounded-lg border-l-4 border-cyan-500">
                    <h3 className="text-sm font-medium text-cyan-700">License Number</h3>
                    <p className="mt-1 text-lg">{doctor.licenseNumber || '—'}</p>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-500">
                    <h3 className="text-sm font-medium text-amber-700">Years of Experience</h3>
                    <p className="mt-1 text-lg font-semibold">{doctor.yearsOfExperience || '—'}</p>
                  </div>
                </div>

                <div className="mt-8 bg-pink-50 p-6 rounded-lg border-l-4 border-pink-500">
                  <h3 className="text-sm font-medium text-pink-700">Biography</h3>
                  <p className="mt-2 text-gray-800 leading-relaxed">{doctor.bio || '—'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;