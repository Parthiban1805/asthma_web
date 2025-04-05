const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient'); // Assuming you have a Patient model

exports.register = async (req, res) => {
  try {
    const { username, email, password, fullName, age, phone, address, role } = req.body;
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
      age,
      phone,
      address,
      role
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({
      token,
      user: {
        id: newUser._id,
        username,
        email,
        fullName,
        age,
        phone,
        address,
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
  
      // Find the user by email
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: 'User not found' });
  
      // Check if the password matches
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
  
      // Initialize doctorId and patientId
      let doctorId = null;
      let patientId = null;
  
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
          patientId = patient.patientId;
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
          age: user.age,
          phone: user.phone,
          address: user.address,
          role: user.role,
          doctorId: doctorId, // Include doctorId if the user is a doctor
          patientId: patientId // Include patientId if the user is a patient
        }
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  