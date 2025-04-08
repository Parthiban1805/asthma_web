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
      // Get caretaker data
      const caretakerResponse = await axios.get(`http://localhost:5000/api/admin/caretakers/${id}`);
      setCaretaker(caretakerResponse.data);
      
      // If caretaker has patients, fetch their details
      
      
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
        // Refresh data
        fetchCaretakerDetails();
      } catch (err) {
        console.error('Error removing patient:', err);
        setError('Failed to remove patient');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button 
            onClick={handleBack}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!caretaker) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>Caretaker not found</p>
          <button 
            onClick={handleBack}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const hasPatients = caretaker.patients && caretaker.patients.length > 0;
  const patientCount = caretaker.patients ? caretaker.patients.length : 0;

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={handleBack}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <span className="mr-1">←</span> Back to Dashboard
          </button>
          <button 
            onClick={handleEdit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Edit Caretaker
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-blue-600 p-4">
            <h1 className="text-2xl font-bold text-white">{caretaker.name}</h1>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Caretaker Details</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{caretaker.email}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{caretaker.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Registered Since</p>
                    <p className="font-medium">{new Date(caretaker.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  Assigned Patients <span className="text-sm font-normal text-gray-500">({patientCount})</span>
                </h2>
                
                {hasPatients && patientDetails.length > 0 ? (
                  <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                    {patientDetails.map(patient => (
                      <div key={patient._id} className="mb-4 p-3 bg-white rounded shadow-sm flex justify-between items-center">
                        <div>
                          <p className="font-medium">{patient.name}</p>
                          <p className="text-sm text-gray-500">ID: {patient.patientId || patient._id}</p>
                        </div>
                        <div>
                          <button 
                            onClick={() => navigate(`/admin-patient/${patient.patientId || patient._id}`)}
                            className="text-blue-600 hover:text-blue-800 mr-2"
                          >
                            View
                          </button>
                          <button 
                            onClick={() => handleRemovePatient(patient._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 p-6 rounded-lg text-center">
                    <p className="text-gray-500">
                      {hasPatients ? "Loading patient details..." : "No patients assigned to this caretaker"}
                    </p>
                    <button 
                      onClick={() => navigate('/assign-patient/' + id)}
                      className="mt-3 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Assign Patient
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Actions</h2>
              <div className="flex space-x-4">
                <button 
                  onClick={() => navigate('/assign-patient/' + id)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
                >
                  <span className="mr-1">+</span> Assign Patient
                </button>
                
                <button 
                  onClick={() => navigate('/caretaker-schedule/' + id)}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  View Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaretakerDetail;