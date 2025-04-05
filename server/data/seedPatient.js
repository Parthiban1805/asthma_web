const mongoose = require('mongoose');
const Patient = require('../models/Patient'); // Update the path accordingly

// Connect to MongoDB
mongoose.connect('mongodb+srv://parthis1805:Parthiban1805@cluster0.oov7qmy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
  insertDummyPatients();
}).catch(err => console.error('MongoDB connection error:', err));

// Dummy data
const dummyPatients = [
  {
    patientId: 'P001',
    doctorId: 'D001',
    name: 'John Doe',
    email: 'johndoe@example.com',
    phone: '1234567890',
    dateOfBirth: '1990-05-15',
    age: 34,
    gender: 'Male',
    address: '123 Main Street, Cityville',
    medicalHistory: 'Asthma since childhood',
    bmi: 23.4,
    petAllergy: true,
    familyHistoryAsthma: true,
    historyOfAllergies: true,
    hayfever: false,
    gastroesophagealReflux: false,
    lungFunctionFEV1: 2.8,
    lungFunctionFVC: 3.5,
    exerciseInduced: true
  },
  {
    patientId: 'P002',
    doctorId: 'Dr.121',
    name: 'Jane Smith',
    email: 'janesmith@example.com',
    phone: '9876543210',
    dateOfBirth: '1985-08-20',
    age: 39,
    gender: 'Female',
    address: '456 Second Ave, Townsville',
    medicalHistory: 'Occasional wheezing',
    bmi: 25.1,
    petAllergy: false,
    familyHistoryAsthma: false,
    historyOfAllergies: true,
    hayfever: true,
    gastroesophagealReflux: true,
    lungFunctionFEV1: 3.1,
    lungFunctionFVC: 3.9,
    exerciseInduced: false
  }
];

// Insert dummy data
async function insertDummyPatients() {
  try {
    await Patient.insertMany(dummyPatients);
    console.log('Dummy patients inserted successfully!');
    mongoose.connection.close();
  } catch (err) {
    console.error('Error inserting dummy patients:', err);
    mongoose.connection.close();
  }
}
