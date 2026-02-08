const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Import bcrypt

// Import Models
const User = require('../models/User'); 
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Caretaker = require('../models/Caretaker');
const Admin = require('../models/admin');

const MONGO_URI = 'mongodb+srv://parthis1805_db_user:Parthiban1805@cluster0.lmnaiqb.mongodb.net/?appName=Cluster0'; 

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected...");

    // 1. DROP THE COLLISION INDEX (Crucial for the patientId null error)
    try {
      await User.collection.dropIndex("patientId_1");
      console.log("Dropped old patientId index...");
    } catch (err) {
      console.log("Index didn't exist, moving on...");
    }

    // 2. Clear existing data
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Patient.deleteMany({});
    await Caretaker.deleteMany({});
    await Admin.deleteMany({});
    console.log("Database cleaned.");

    // Helper function for hashing
    const saltRounds = 10;
    const defaultPassword = 'password123';
    const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

    // 3. Create Admin
    const adminUser = await User.create({
      username: 'admin_user',
      email: 'admin@test.com',
      password: hashedPassword, // ENCRYPTED
      role: 'admin',
      fullName: 'System Admin'
    });
    await Admin.create({
      adminId: 'ADM001',
      name: adminUser.fullName,
      email: adminUser.email,
      phone: '1234567890',
      department: 'IT Department'
    });

    // 4. Create Doctor
    const doctorUser = await User.create({
      username: 'dr_john',
      email: 'john@hospital.com',
      password: hashedPassword, // ENCRYPTED
      role: 'doctor',
      fullName: 'Dr. John Doe'
    });
    const doctorProfile = await Doctor.create({
      doctorId: 'DOC-123',
      name: doctorUser.fullName,
      email: doctorUser.email,
      phone: '9876543210',
      specialization: 'Pulmonology',
      licenseNumber: 'LIC998877'
    });

    // 5. Create Caretaker
    const caretakerUser = await User.create({
      username: 'care_sarah',
      email: 'sarah@test.com',
      password: hashedPassword, // ENCRYPTED
      role: 'caretaker',
      fullName: 'Sarah Smith'
    });
    const caretakerProfile = await Caretaker.create({
      name: caretakerUser.fullName,
      email: caretakerUser.email,
      phone: '555-0101'
    });

    // 6. Create Patient
    const pId = "PAT888";
    const patientUser = await User.create({
      username: 'patient_bob',
      email: 'bob@test.com',
      password: hashedPassword, // ENCRYPTED
      role: 'patient',
      fullName: 'Bob Williams',
      patientId: pId
    });

    const patientProfile = await Patient.create({
      patientId: pId,
      doctorId: doctorProfile.doctorId,
      caretakerId: caretakerProfile._id,
      name: patientUser.fullName,
      email: patientUser.email,
      age: 30,
      gender: 'Male',
      phone: 1234567890,
      emergencyContact: 'Sarah Smith: 555-0101'
    });

    // Link Caretaker to Patient
    caretakerProfile.patients.push(patientProfile._id);
    await caretakerProfile.save();

    console.log("-----------------------------------------");
    console.log("Seeding complete successfully!");
    console.log("All users created with password: password123");
    console.log("-----------------------------------------");
    
    process.exit();

  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();