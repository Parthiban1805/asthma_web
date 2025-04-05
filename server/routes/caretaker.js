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
    const unassignedPatients = await Patient.find({ caretakerId: null })
      .select('_id patientId name age gender');
    res.json(unassignedPatients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. Assign a patient to a caretaker
router.post('/assign-patient', async (req, res) => {
  const { caretakerId, patientId } = req.body;

  try {
    const caretaker = await Caretaker.findById(caretakerId);
    if (!caretaker) return res.status(404).json({ message: 'Caretaker not found' });

    const updatedPatient = await Patient.findByIdAndUpdate(
      patientId,
      { caretakerId },
      { new: true }
    );

    res.json({ message: 'Patient assigned successfully', patient: updatedPatient });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. Get patients assigned to a specific caretaker
router.get('/assigned-patients/:caretakerId', async (req, res) => {
  try {
    const patients = await Patient.find({ caretakerId: req.params.caretakerId })
      .select('_id patientId name age gender');
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 4. Get full details of a specific patient
router.get('/patient-details/:patientId', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.patientId).lean();
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const [appointments, prescriptions, symptoms] = await Promise.all([
      Appointment.find({ patientId: patient._id }).sort({ dateTime: -1 }),
      Prescription.find({ patientId: patient._id }),
      Symptom.find({ patientId: patient._id }).sort({ date: -1 })
    ]);

    res.json({
      patient,
      appointments,
      prescriptions,
      symptoms
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
