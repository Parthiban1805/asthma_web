const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Caretaker = require('../models/Caretaker');
const Admin = require('../models/admin'); // Import the Admin model
exports.register = async (req, res) => {
  try {
    const { fullName, username, email, password, phone, role, patientId } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User with this email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      fullName,
      phone,
      role,
      patientId: role === 'patient' ? patientId : undefined
    });

    if (role === 'doctor') {
      const newDoctor = new Doctor({
        doctorId: req.body.doctorId || `DOC-${Date.now().toString().slice(-4)}`,
        name: fullName || username,
        email,
        phone,
        specialization: req.body.specialization || '',
      });
      await newDoctor.save();
    } 
    else if (role === 'patient') {
      // LINK LOGIC: Check if Patient record exists (pre-created by doctor)
      let patientRecord = await Patient.findOne({ patientId: patientId });
      
      if (patientRecord) {
        // Update existing record with registration details
        patientRecord.email = email;
        patientRecord.phone = phone;
        patientRecord.name = fullName || username;
        await patientRecord.save();
      } else {
        // Create fresh record
        const newPatient = new Patient({
          patientId: patientId,
          name: fullName || username,
          email,
          phone,
          emergencyContact: req.body.emergencyContact,
        });
        await newPatient.save();
      }
    } 
    else if (role === 'caretaker') {
      const newCaretaker = new Caretaker({
        name: fullName || username,
        email,
        phone,
        patients: []
      });
      await newCaretaker.save();
    }
    else if (role === 'admin') {
      const newAdmin = new Admin({
        adminId: `ADM-${Date.now().toString().slice(-4)}`,
        name: fullName || username,
        email,
        phone,
      });
      await newAdmin.save();
    }

    await newUser.save();
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({ token, user: { id: newUser._id, username, role } });
  } catch (err) {
    console.error(err);
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