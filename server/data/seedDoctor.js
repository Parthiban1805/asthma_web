require('dotenv').config();
const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');

const dummyDoctor = {
    doctorId:"Dr.121",
  name: 'Dr. John Doe',
  email: 'john.doe@example.com',
  phone: '123-456-7890',
  specialization: 'Cardiology',
  licenseNumber: 'LIC123456',
  yearsOfExperience: 10,
  bio: 'Experienced cardiologist with a passion for patient care.',
};

async function insertDoctor() {
  try {
    await mongoose.connect("mongodb+srv://Tharunika:qb2UmuCw1F011wOG@cluster0.mhmyc5b.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
    const exists = await Doctor.findOne({ email: dummyDoctor.email });

    if (!exists) {
      const doctor = new Doctor(dummyDoctor);
      await doctor.save();
      console.log('Doctor inserted successfully');
    } else {
      console.log('Doctor already exists');
    }

    mongoose.disconnect();
  } catch (err) {
    console.error('Error inserting doctor:', err);
  }
}

insertDoctor();
