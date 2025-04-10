const express = require('express');
const router = express.Router();
const PatientQuery = require('../models/patientQuery');
const Patient = require('../models/Patient');

// Get all queries for a patient
router.get('/patient-queries/:patientId', async (req, res) => {
  try {
    const queries = await PatientQuery.find({ patientId: req.params.patientId })
      .sort({ createdAt: -1 });
    
    res.json(queries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/queries - Create a new query
router.post('/doctor-queries',  async (req, res) => {
  try {
    const { doctorId, subject, message, priority } = req.body;

    // Validate required fields
    if (!doctorId || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const normalizePriority = (value) => {
      const allowed = ['Low', 'Normal', 'High'];
      const formatted = value
        ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
        : 'Normal';
    
      return allowed.includes(formatted) ? formatted : 'Normal';
    };
    
    const formattedPriority = normalizePriority(priority);
    
    // Create new query
    const newQuery = new PatientQuery({
      doctorId,
      subject,
      message,
      priority: formattedPriority
    });

    // Save to database
    await newQuery.save();

    res.status(201).json({
      success: true,
      query: newQuery
    });
  } catch (error) {
    console.error('Error creating query:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/caretaker-queries',  async (req, res) => {
  try {
    const { caretakerId, subject, message, priority } = req.body;

    // Validate required fields
    if (!doctorId || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const formattedPriority = priority
    ? priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase()
    : 'Normal';
  
    // Create new query
    const newQuery = new PatientQuery({
      caretakerId,
      subject,
      message,
      priority: formattedPriority
    });

    // Save to database
    await newQuery.save();

    res.status(201).json({
      success: true,
      query: newQuery
    });
  } catch (error) {
    console.error('Error creating query:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



// Create a new query
router.post('/patient-queries',  async (req, res) => {
  try {
    const { patientId, subject, message, priority } = req.body;
    
    // Validate patient exists
    const patient = await Patient.findOne({ patientId: patientId });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    
    const newQuery = new PatientQuery({
      patientId,
      subject,
      message,
      priority
    });
    
    const savedQuery = await newQuery.save();
    
    // Send email notification to admin
    res.status(201).json(savedQuery);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});



module.exports = router;
