const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Caretaker = require('../models/Caretaker');
const Admin = require('../models/admin'); // Import the Admin model

exports.register = async (req, res) => {
  try {
    const { fullName, username, email, password, phone, role, department, permissions } = req.body;
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
      patientId: req.body.patientId || `PAT-${Date.now().toString().slice(-6)}`,

    });


    // Create role-specific records based on role
    if (role === 'doctor') {
      const newDoctor = new Doctor({
        doctorId: req.body.doctorId || `DOC-${Date.now().toString().slice(-6)}`,
        name: username,
        email,
        phone,
        specialization: req.body.specialization || '',
        licenseNumber: req.body.licenseNumber || '',
        yearsOfExperience: req.body.yearsOfExperience || 0,
        bio: req.body.bio || ''
      });
      await newDoctor.save();
    } 
    else if (role === 'patient') {
      const newPatient = new Patient({
        patientId: req.body.patientId || `PAT-${Date.now().toString().slice(-6)}`,
        doctorId: req.body.doctorId || '',
        emergencyContact:req.body.emergencyContact,
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
    else if (role === 'caretaker') {
      const newCaretaker = new Caretaker({
        name: username,
        email,
        phone,
        patients: req.body.patientId ? [req.body.patientId] : []
      });
      await newCaretaker.save();
    }
    else if (role === 'admin') {
      // Create Admin record
      const newAdmin = new Admin({
        adminId: req.body.adminId || `ADMIN-${Date.now().toString().slice(-6)}`,
        name: username,
        email,
        phone,
        department: department || 'General Administration',
        permissions: permissions || ['view_users', 'edit_users', 'view_data']
      });
      await newAdmin.save();
    }

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    await newUser.save();

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
    console.log(req.body);

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    // Check if the password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Initialize role-specific IDs
    let doctorId = null;
    let patientId = null;
    let caretakerId = null;
    let adminId = null;

    // Fetch role-specific data based on user role
    if (user.role === 'doctor') {
      const doctor = await Doctor.findOne({ email: user.email });
      if (doctor) {
        doctorId = doctor.doctorId;
      }
    }
    else if (user.role === 'patient') {
      const patient = await Patient.findOne({ email: user.email });
      if (patient) {
        patientId = patient.patientId;
      }
    }
    else if (user.role === 'caretaker') {
      const caretaker = await Caretaker.findOne({ email: user.email });
      if (caretaker) {
        caretakerId = caretaker._id;
      }
    }
    else if (user.role === 'admin') {
      const admin = await Admin.findOne({ email: user.email });
      if (admin) {
        adminId = admin.adminId;
        // Update last active timestamp
        admin.lastActive = Date.now();
        await admin.save();
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
        doctorId: doctorId,
        patientId: patientId,
        caretakerId: caretakerId,
        adminId: adminId
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};