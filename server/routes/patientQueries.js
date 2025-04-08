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
