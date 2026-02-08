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
  
  router.get('/patients/check-phone/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    // Check if a patient record was already created by a doctor
    const existingPatient = await Patient.findOne({ phone: Number(phone) });

    if (existingPatient) {
      return res.json({ 
        exists: true, 
        patientId: existingPatient.patientId, 
        name: existingPatient.name 
      });
    }

    // If no record exists, generate a new unique random ID
    const newGeneratedId = `PAT-${Math.floor(1000 + Math.random() * 9000)}`;
    res.json({ exists: false, patientId: newGeneratedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error checking phone" });
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
  
  router.get('/patients/byPatientId/:patientId', async (req, res) => {
    try {
      const patient = await Patient.findOne({ patientId: req.params.patientId });
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      res.json(patient);
    } catch (error) {
      console.error('Error fetching patient by patientId:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  router.put('/patients/byPatientId/:patientId', async (req, res) => {
    try {
      const updatedPatient = await Patient.findOneAndUpdate(
        { patientId: req.params.patientId },
        req.body,
        { new: true }
      );
      
      if (!updatedPatient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      res.json(updatedPatient);
    } catch (error) {
      console.error('Error updating patient by patientId:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
    const User = require('../models/User'); // Import User model (assuming it's where patientId is stored)

  router.post('/patients', async (req, res) => {
    try {
      const existingPatient = await Patient.findOne({ patientId: req.body.patientId });
    
      if (existingPatient) {
        return res.status(400).json({ message: 'Patient ID already exists' });
      }
      
      const newPatient = new Patient(req.body);
      await newPatient.save();
      
      res.status(201).json(newPatient);
    } catch (error) {
      console.error('Error creating patient:', error);
      res.status(500).json({ message: 'Server error' });
}
    });
  
    router.put('/patient_doctors/:patientId', async (req, res) => {
      try {
        const patientId = req.params.patientId;
    
        if (!patientId) {
          return res.status(400).json({ message: 'Invalid patient ID' });
        }
    
        console.log(`Update request for patient ID: ${patientId}`);
        console.log('Request body:', req.body);
  
        // Check if new patientId is already used by another patient
      
    
        const updated = await Patient.findOneAndUpdate(
          { _id: patientId },
          req.body,
          { new: true, runValidators: true }
        );
        
    
        if (!updated) {
          return res.status(404).json({ message: 'Patient not found' });
        }
    
        res.json(updated);
      } catch (err) {
        console.error('Error updating patient:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
      }
    });
  // Update patient
  router.put('/patients/:patientId', async (req, res) => {
    try {
      const patientId = req.params.patientId;
  
      if (!patientId) {
        return res.status(400).json({ message: 'Invalid patient ID' });
      }
  
      console.log(`Update request for patient ID: ${patientId}`);
      console.log('Request body:', req.body);

      // Check if new patientId is already used by another patient
    
  
      const updated = await Patient.findOneAndUpdate(
        { patientId: patientId },
        req.body,
        { new: true, runValidators: true }
      );
      
  
      if (!updated) {
        return res.status(404).json({ message: 'Patient not found' });
      }
  
      res.json(updated);
    } catch (err) {
      console.error('Error updating patient:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });
  
  router.put('/doctors/patients/:id', async (req, res) => {
    try {
      console.log("check")
      const updatedPatient = await Patient.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      
      if (!updatedPatient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      res.json(updatedPatient);
    } catch (error) {
      console.error('Error updating patient:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
      
  module.exports = router;
