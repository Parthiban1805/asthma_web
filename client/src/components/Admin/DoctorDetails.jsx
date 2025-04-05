import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { ArrowLeft, User, Users, Calendar } from 'lucide-react';

const DoctorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [doctorData, setDoctorData] = useState(null);
  const [error, setError] = useState(null);

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
      <div className="flex justify-center items-center h-full">
        Loading doctor details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        Error loading doctor: {error}
      </div>
    );
  }

  if (!doctorData) {
    return <div className="text-center">Doctor not found</div>;
  }

  const { doctor, patients, appointments } = doctorData;

  return (
    <div>
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="mr-4 p-2 bg-white rounded-full shadow-sm hover:bg-gray-50"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold">Doctor Details</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-wrap">
          <div className="w-full md:w-1/4 flex justify-center md:justify-start mb-4 md:mb-0">
            <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center">
              <User className="h-16 w-16 text-green-500" />
            </div>
          </div>
          <div className="w-full md:w-3/4">
            <h2 className="text-xl font-bold mb-4">{doctor.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Doctor ID</p>
                <p className="font-medium">{doctor.doctorId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Specialization</p>
                <p className="font-medium">{doctor.specialization || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{doctor.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{doctor.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">License Number</p>
                <p className="font-medium">{doctor.licenseNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Years of Experience</p>
                <p className="font-medium">{doctor.yearsOfExperience || 'N/A'}</p>
              </div>
            </div>
            {doctor.bio && (
              <div className="mt-4">
                <p className="text-sm text-gray-500">Bio</p>
                <p>{doctor.bio}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Tabs>
        <TabList className="flex border-b mb-4">
          <Tab className="px-4 py-2 focus:outline-none cursor-pointer">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Patients
            </div>
          </Tab>
          <Tab className="px-4 py-2 focus:outline-none cursor-pointer">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Appointments
            </div>
          </Tab>
        </TabList>

        <TabPanel>
          <Card>
            <CardHeader>
              <CardTitle>Doctor's Patients</CardTitle>
            </CardHeader>
            <CardContent>
              {patients && patients.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
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
                      <tr key={patient._id}>
                        <td className="px-6 py-4 whitespace-nowrap">{patient.patientId}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{patient.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {patient.dateOfBirth || (patient.age ? `${patient.age} yrs` : 'N/A')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{patient.phone}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button 
                            onClick={() => navigate(`/patient/${patient.patientId}`)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500">No patients assigned to this doctor</p>
              )}
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel>
          <Card>
            <CardHeader>
              <CardTitle>Doctor's Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              {appointments && appointments.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
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
                      <tr key={appointment._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(appointment.dateTime).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{appointment.patientId}</td>
                        <td className="px-6 py-4">{appointment.purpose}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{appointment.duration} mins</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            appointment.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {appointment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500">No appointments scheduled</p>
              )}
            </CardContent>
          </Card>
        </TabPanel>
      </Tabs>
    </div>
  );
};

export default DoctorDetails;
