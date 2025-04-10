const express = require('express');
const router = express.Router();
const Medication = require('../models/Medication');

const Patient = require('../models/Patient'); // adjust path as needed

// Get all medications
router.get('/medications', async (req, res) => {
  try {
    const meds = await Medication.find().sort({ createdAt: -1 });
    res.json(meds);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});
router.post('/medications', async (req, res) => {
  try {
    const newMed = new Medication(req.body);
    const savedMed = await newMed.save();
    res.status(201).json(savedMed);
  } catch (error) {
    res.status(400).json({ message: 'Error adding medication' });
  }
});

// Get one medication
router.get('/medications/:id', async (req, res) => {
  try {
    const meds = await Medication.find({ patientId: req.params.id }); // 👈 changed this
    if (!meds) return res.status(404).json({ message: 'Medication not found' });
    res.json(meds);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});
router.get('/patient-medications/:id', async (req, res) => {
  try {
    // Step 1: Find the patient by patientId (custom string)
    const patient = await Patient.findOne({ patientId: req.params.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Step 2: Use MongoDB _id to find medication
    const medications = await Medication.find({ patientId: patient._id }); // assuming Medication has a ref to patient._id
    if (!medications || medications.length === 0) {
      return res.status(404).json({ message: 'No medications found for this patient' });
    }

    res.json(medications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});


router.get('/prescriptions/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const prescriptions = await Prescription.find({
      patientId: patientId
    }).sort({ status: 1, startDate: -1 });
    
    res.status(200).json(prescriptions);
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update medication intake status
router.post('/medications/intake/update', async (req, res) => {
  try {
    const { patientId, timeOfDay, status } = req.body;
    
    if (!patientId || !timeOfDay || status === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Validate timeOfDay is one of the expected values
    if (!['morning', 'evening', 'night'].includes(timeOfDay)) {
      return res.status(400).json({ message: 'Invalid timeOfDay value' });
    }
    
    // Create update object with the specific time of day to update
    const updateData = {};
    updateData[`medicationIntake.${timeOfDay}`] = status;
    
    // Update the patient document
    const updatedPatient = await Patient.findOneAndUpdate(
      { patientId : patientId },
      { $set: updateData },
      { new: true } // Return the updated document
    );
    
    if (!updatedPatient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    res.status(200).json({
      message: 'Medication intake updated successfully',
      medicationIntake: updatedPatient.medicationIntake
    });
    
  } catch (error) {
    console.error('Error updating medication intake:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add endpoint to get a specific patient with medication intake status
router.get('/patients/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    res.status(200).json(patient);
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update medication
router.put('/medications/:id', async (req, res) => {
  try {
    const updatedMed = await Medication.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedMed) return res.status(404).json({ message: 'Medication not found' });
    res.json(updatedMed);
  } catch (error) {
    res.status(400).json({ message: 'Error updating medication' });
  }
});

// Delete medication
router.delete('/medications/:id', async (req, res) => {
  try {
    const deletedMed = await Medication.findByIdAndDelete(req.params.id);
    if (!deletedMed) return res.status(404).json({ message: 'Medication not found' });
    res.json({ message: 'Medication deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
