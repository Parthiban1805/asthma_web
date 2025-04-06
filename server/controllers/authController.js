const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient'); // Assuming you have a Patient model
const Caretaker = require('../models/Caretaker');

exports.register = async (req, res) => {
  try {
    const { fullName,username, email, password, phone, role, patientId, doctorId, hospital, specialization, relationship, emergencyContact } = req.body;
    console.log(req.body);

    if (!username || !email || !password || !role) {
      return res.status(400).json({ message: "Please fill in all required fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      fullName,
      phone,
      role,
      patientId
    });

    await newUser.save();

    // Generate a unique ID for doctor or patient
    const generatedId = `ID-${Date.now().toString().slice(-6)}`;

    // Create Doctor
    if (role === 'doctor') {
      const newDoctor = new Doctor({
        doctorId: doctorId,
        name: username,
        email,
        phone,
        specialization: specialization || '',
        licenseNumber: req.body.licenseNumber || '',
        yearsOfExperience: req.body.yearsOfExperience || 0,
        bio: req.body.bio || ''
      });
      await newDoctor.save();
    }

    // Create Patient
    if (role === 'patient') {
      const newPatient = new Patient({
        patientId: patientId ,
        doctorId: req.body.doctorId || '',
        name: username,
        email,
        phone,
        dateOfBirth: req.body.dateOfBirth || '',
        gender: req.body.gender || '',
        medicalHistory: req.body.medicalHistory || '',
        bmi: req.body.bmi || 0,
        petAllergy: req.body.petAllergy || false,
        familyHistoryAsthma: req.body.familyHistoryAsthma || false,
        historyOfAllergies: req.body.historyOfAllergies || false,
        hayfever: req.body.hayfever || false,
        gastroesophagealReflux: req.body.gastroesophagealReflux || false,
        lungFunctionFEV1: req.body.lungFunctionFEV1 || 0,
        lungFunctionFVC: req.body.lungFunctionFVC || 0,
        exerciseInduced: req.body.exerciseInduced || false,
        caretakerId: req.body.caretakerId || null
      });
      await newPatient.save();
    }

    // Create Caretaker
    if (role === 'caretaker') {
      const newCaretaker = new Caretaker({
        name:username,
        email,
        phone,
        patients: [] // start with an empty list
      });
      await newCaretaker.save();
    }

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({
      token,
      user: {
        id: newUser._id,
        username,
        email,
        fullName,
        phone,
        role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
    try {
      const { email, password } = req.body;
  console.log(req.body)
      // Find the user by email
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: 'User not found' });
  
      // Check if the password matches
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
  
      // Initialize doctorId and patientId
      let doctorId = null;
      let patientId = null;
      let caretakerId = null;

      // Check if the user is a doctor and fetch doctorId if applicable
      if (user.role === 'doctor') {
        const doctor = await Doctor.findOne({ email: user.email });
        if (doctor) {
          doctorId = doctor.doctorId;
        }
      }
  
      // Check if the user is a patient and fetch patientId if applicable
      if (user.role === 'patient') {
        const patient = await Patient.findOne({ email: user.email });
        if (patient) {
          patientId = patient.patientId; // ✅ Assign correct value
        }
      }
      if (user.role === 'caretaker') {
        const patient = await Caretaker.findOne({ email: user.email });
        if (patient) {
          caretakerId= patient._id;
        }
      }
  
  
      // Generate a JWT token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
      // Send the response with user details and role-specific ID
      res.json({
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          role: user.role,
          doctorId: doctorId, // Include doctorId if the user is a doctor
          patientId: patientId,
          caretakerId:caretakerId// Include patientId if the user is a patient
        }
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  