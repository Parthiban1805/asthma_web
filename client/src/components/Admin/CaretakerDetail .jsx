import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CaretakerDetail = () => {
  const { id } = useParams();
  const [caretaker, setCaretaker] = useState(null);
  const [patientDetails, setPatientDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCaretakerDetails();
  }, [id]);

  const fetchCaretakerDetails = async () => {
    try {
      const caretakerResponse = await axios.get(`http://localhost:5000/api/admin/caretakers/${id}`);
      setCaretaker(caretakerResponse.data);
      // Set patient details from the populated response
      if (caretakerResponse.data && caretakerResponse.data.patients) {
        setPatientDetails(caretakerResponse.data.patients);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching caretaker details:', err);
      setError('Failed to load caretaker details');
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleEdit = () => {
    navigate(`/edit-caretaker/${id}`);
  };

  const handleRemovePatient = async (patientId) => {
    if (window.confirm('Are you sure you want to remove this patient from this caretaker?')) {
      try {
        await axios.post(`http://localhost:5000/api/admin/caretakers/${id}/remove-patient`, { patientId });
        // Re-fetch details to update the list
        fetchCaretakerDetails();
      } catch (err) {
        console.error('Error removing patient:', err);
        setError('Failed to remove patient');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-blue-600"></div>
          <p className="text-slate-600 font-medium mt-4">Loading caretaker profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 max-w-md text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Error Loading Profile</h3>
          <p className="text-slate-600 mb-6">{error}</p>
          <button 
            onClick={handleBack} 
            className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!caretaker) return null;

  const hasPatients = caretaker.patients && caretaker.patients.length > 0;
  const patientCount = caretaker.patients ? caretaker.patients.length : 0;

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <button 
              onClick={handleBack}
              className="flex items-center text-slate-600 hover:text-slate-900 transition-colors font-medium"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to List
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-8 flex flex-col items-center">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 border-4 border-white/30 shadow-lg">
                  {caretaker.name.charAt(0).toUpperCase()}
                </div>
                <h1 className="text-xl font-bold text-white text-center mb-1">{caretaker.name}</h1>
                <span className="text-blue-100 text-sm bg-blue-700/40 px-3 py-1 rounded-full font-medium">Caretaker</span>
              </div>
              
              <div className="p-6 space-y-5">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 uppercase font-semibold tracking-wide mb-1">Email</p>
                    <p className="text-slate-900 break-all text-sm">{caretaker.email}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 uppercase font-semibold tracking-wide mb-1">Phone</p>
                    <p className="text-slate-900 text-sm">{caretaker.phone || 'Not provided'}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 uppercase font-semibold tracking-wide mb-1">Joined</p>
                    <p className="text-slate-900 text-sm">{new Date(caretaker.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
              <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center">
                  Assigned Patients
                  <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-semibold">{patientCount}</span>
                </h2>
              </div>

              <div className="p-6 flex-1">
                {hasPatients && patientDetails.length > 0 ? (
                  <div className="space-y-3">
                    {patientDetails.map(patient => (
                      <div key={patient._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                            {patient.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">{patient.name}</h3>
                            <p className="text-sm text-slate-500">ID: {patient.patientId || patient._id}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => navigate(`/admin-patient/${patient.patientId || patient._id}`)}
                            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Patient"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleRemovePatient(patient._id)}
                            className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove Assignment"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center py-16">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="text-slate-900 font-semibold mb-2">No Patients Assigned</h3>
                    <p className="text-slate-500 text-sm max-w-sm">This caretaker currently has no patients assigned to their care.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaretakerDetail;