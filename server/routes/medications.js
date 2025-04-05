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

// Add new medication
router.post('/medications', async (req, res) => {
  try {
    const newMed = new Medication(req.body);
    const savedMed = await newMed.save();
    res.status(201).json(savedMed);
  } catch (error) {
    res.status(400).json({ message: 'Error adding medication' });
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
