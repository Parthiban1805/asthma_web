const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');

// Get all patients
router.get('/patients', async (req, res) => {
    try {
      const patients = await Patient.find().sort({ updatedAt: -1 });
      res.json(patients);
    } catch (err) {
      console.error('Error fetching patients:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });
  // In your route for fetching patients (e.g., /api/patients)
  router.get('/patient', async (req, res) => {
    try {
      // Get doctorId from the logged-in user's session or token (you may use JWT or session-based auth)
      const doctorId = req.query.doctorId || req.user.doctorId;
      console.log(doctorId)  // Assuming the user object has a doctorId field
      const patients = await Patient.find({ doctorId: doctorId });
  
      res.status(200).json(patients);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching patients' });
    }
  });
  
  
  // Get patient by ID
router.get('/patients/:id', async (req, res) => {
    try {
        const patient = await Patient.findOne({ patientId: req.params.id });
        if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      res.json(patient);
    } catch (err) {
      console.error('Error fetching patient:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Create new patient
router.post('/patients', async (req, res) => {
    try {
      // Check if patient ID already exists
      const existingPatient = await Patient.findOne({ patientId: req.body.patientId });
      if (existingPatient) {
        return res.status(400).json({ message: 'Patient ID already exists' });
      }
      
      const newPatient = new Patient(req.body);
      const savedPatient = await newPatient.save();
      res.status(201).json(savedPatient);
    } catch (err) {
      console.error('Error creating patient:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Update patient
  router.put('/patients/:id', async (req, res) => {
    try {
      // Validate the ID parameter
      if (!req.params.id || req.params.id === 'undefined') {
        return res.status(400).json({ message: 'Invalid patient ID' });
      }
  
      // Log the incoming request for debugging
      console.log(`Update request for patient ID: ${req.params.id}`);
      console.log('Request body:', req.body);
  
      // Check if updating to an existing patient ID
      if (req.body.patientId) {
        const existingPatient = await Patient.findOne({ 
          patientId: req.body.patientId,
          _id: { $ne: req.params.id }
        });
        
        if (existingPatient) {
          return res.status(400).json({ message: 'Patient ID already exists' });
        }
      }
      
      const updatedPatient = await Patient.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      
      if (!updatedPatient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      console.log('Patient updated successfully:', updatedPatient);
      res.json(updatedPatient);
    } catch (err) {
      console.error('Error updating patient:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });
    
  module.exports = router;
