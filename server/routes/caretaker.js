const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const Caretaker = require('../models/Caretaker');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Medication');
const Symptom = require('../models/Symptom');

// 1. Get all unassigned patients
router.get('/unassigned-patients', async (req, res) => {
  try {
    console.log('Fetching all unassigned patients...');
    const unassignedPatients = await Patient.find({ caretakerId: null })
      .select('_id patientId name age gender');
    console.log('Unassigned patients fetched:', unassignedPatients);
    res.json(unassignedPatients);
  } catch (error) {
    console.error('Error fetching unassigned patients:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// 2. Assign a patient to a caretaker
// 2. Assign a patient to a caretaker
// 2. Assign a patient to a caretaker
router.post('/assign-patient', async (req, res) => {
    const { caretakerId, patientId } = req.body;
    console.log(`Assigning patient ${patientId} to caretaker ${caretakerId}`);
  
    try {
      // Find caretaker by ID and log the result
      const caretaker = await Caretaker.findOne({ _id: caretakerId });
      console.log('Caretaker found:', caretaker);
  
      if (!caretaker) {
        console.log('Caretaker not found');
        return res.status(404).json({ message: 'Caretaker not found' });
      }
  
      // Update patient with caretakerId and log the updated patient
      const updatedPatient = await Patient.findByIdAndUpdate(
        patientId,
        { caretakerId },
        { new: true }
      );
      console.log('Updated patient:', updatedPatient);
  
      res.json({ message: 'Patient assigned successfully', patient: updatedPatient });
    } catch (error) {
      console.log('Error assigning patient:', error);
      res.status(500).json({ message: error.message });
    }
  });
  
// 3. Get patients assigned to a specific caretaker
router.get('/assigned-patients/:caretakerId', async (req, res) => {
  console.log('Fetching patients for caretaker:', req.params.caretakerId);
  try {
    const patients = await Patient.find({ caretakerId: req.params.caretakerId })
      .select('_id patientId name age gender');
    console.log('Patients assigned to caretaker:', patients);
    res.json(patients);
  } catch (error) {
    console.error('Error fetching assigned patients:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// 4. Get full details of a specific patient
router.get('/patient-details/:patientId', async (req, res) => {
  console.log('Fetching details for patient:', req.params.patientId);
  try {
    const patient = await Patient.findById(req.params.patientId).lean();
    if (!patient) {
      console.log('Patient not found');
      return res.status(404).json({ message: 'Patient not found' });
    }

    const [appointments, prescriptions, symptoms] = await Promise.all([
      Appointment.find({ patientId: patient._id }).sort({ dateTime: -1 }),
      Prescription.find({ patientId: patient._id }),
      Symptom.find({ patientId: patient._id }).sort({ date: -1 })
    ]);

    console.log('Patient details fetched:', {
      patient,
      appointments,
      prescriptions,
      symptoms
    });

    res.json({
      patient,
      appointments,
      prescriptions,
      symptoms
    });
  } catch (error) {
    console.error('Error fetching patient details:', error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
