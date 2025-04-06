const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const Caretaker = require('../models/Caretaker');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Medication');
const Symptom = require('../models/Symptom');


router.get('/caretakers/:patientId', async (req, res) => {
  try {
    const patientId = req.params.patientId;
    
    // Find caretakers where the patients array contains the given patientId
    const caretakers = await Caretaker.find({ 
      patients: { $in: [patientId] } 
    });
    
    res.status(200).json(caretakers);
  } catch (err) {
    console.error('Error fetching caretakers:', err);
    res.status(500).json({ message: 'Failed to fetch caretakers', error: err.message });
  }
});

router.post('/caretakers', async (req, res) => {
  try {
    const { name, email, phone, patientId } = req.body;
    
    // Check if caretaker already exists
    let caretaker = await Caretaker.findOne({ email });
    
    if (caretaker) {
      // If caretaker exists, add the patient to their patients array if not already there
      if (!caretaker.patients.includes(patientId)) {
        caretaker.patients.push(patientId);
        caretaker.updatedAt = Date.now();
        await caretaker.save();
      }
    } else {
      // Create new caretaker
      caretaker = new Caretaker({
        name,
        email,
        phone,
        patients: [patientId]
      });
      await caretaker.save();
    }
    
    // Update patient record to include caretaker reference if needed
    const patient = await Patient.findById(patientId);
    if (patient && !patient.caretakers.includes(caretaker._id)) {
      patient.caretakers.push(caretaker._id);
      await patient.save();
    }
    
    res.status(201).json(caretaker);
  } catch (err) {
    console.error('Error adding caretaker:', err);
    res.status(500).json({ message: 'Failed to add caretaker', error: err.message });
  }
});

// Update a caretaker
router.put('/caretakers/:id', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const caretakerId = req.params.id;
    
    const updatedCaretaker = await Caretaker.findByIdAndUpdate(
      caretakerId,
      { 
        name, 
        email, 
        phone,
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    if (!updatedCaretaker) {
      return res.status(404).json({ message: 'Caretaker not found' });
    }
    
    res.status(200).json(updatedCaretaker);
  } catch (err) {
    console.error('Error updating caretaker:', err);
    res.status(500).json({ message: 'Failed to update caretaker', error: err.message });
  }
});

// Remove a caretaker from a patient
router.delete('/caretakers/:caretakerId/patient/:patientId', async (req, res) => {
  try {
    const { caretakerId, patientId } = req.params;
    
    // Remove patient from caretaker's patients array
    const caretaker = await Caretaker.findById(caretakerId);
    if (!caretaker) {
      return res.status(404).json({ message: 'Caretaker not found' });
    }
    
    caretaker.patients = caretaker.patients.filter(id => id.toString() !== patientId);
    caretaker.updatedAt = Date.now();
    await caretaker.save();
    
    // Remove caretaker from patient's caretakers array
    const patient = await Patient.findById(patientId);
    if (patient) {
      patient.caretakers = patient.caretakers.filter(id => id.toString() !== caretakerId);
      await patient.save();
    }
    
    res.status(200).json({ message: 'Caretaker successfully removed from patient' });
  } catch (err) {
    console.error('Error removing caretaker from patient:', err);
    res.status(500).json({ message: 'Failed to remove caretaker', error: err.message });
  }
});


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
    // Find caretaker by ID
    const caretaker = await Caretaker.findOne({ _id: caretakerId });
    console.log('Caretaker found:', caretaker);

    if (!caretaker) {
      console.log('Caretaker not found');
      return res.status(404).json({ message: 'Caretaker not found' });
    }

    // Update patient with caretakerId
    const updatedPatient = await Patient.findByIdAndUpdate(
      patientId,
      { caretakerId },
      { new: true }
    );
    console.log('Updated patient:', updatedPatient);

    // Push patient to caretaker.patients array if not already there
    if (!caretaker.patients.includes(patientId)) {
      caretaker.patients.push(patientId);
      await caretaker.save();
    }

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
