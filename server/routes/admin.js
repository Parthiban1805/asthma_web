const express = require('express');
const router = express.Router();

const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Caretaker = require('../models/Caretaker');
const Prescription = require('../models/Medication');
const Symptom = require('../models/Symptom');


router.get('/admin/patients', async (req, res) => {
  try {
    const patients = await Patient.find({}, 'patientId name phone dateOfBirth gender');
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get patient details by ID
router.get('/admin/patients/:id', async (req, res) => {
  try {
    const patient = await Patient.findOne({ patientId: req.params.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Get related data
    const caretakers = await Caretaker.find({ patientId: patient.patientId });
    const prescriptions = await Prescription.find({ patientId: patient._id });
    const symptoms = await Symptom.find({ patientId: patient.patientId });
    const appointments = await Appointment.find({ patientId: patient._id });
    
    res.json({
      patient,
      caretakers,
      prescriptions,
      symptoms,
      appointments
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all doctors
router.get('/admin/doctors', async (req, res) => {
  try {
    const doctors = await Doctor.find({}, 'doctorId name specialization');
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get doctor details by ID
router.get('/admin/doctors/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ doctorId: req.params.id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    // Get doctor's patients
    const patients = await Patient.find({ doctorId: doctor.doctorId });
    
    // Get doctor's appointments
    const appointments = await Appointment.find({ doctorId: doctor.doctorId });
    
    res.json({
      doctor,
      patients,
      appointments
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all appointments
router.get('/admin/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.find();
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update patient
router.put('/admin/patients/:id', async (req, res) => {
  try {
    const updatedPatient = await Patient.findOneAndUpdate(
      { patientId: req.params.id },
      req.body,
      { new: true }
    );
    if (!updatedPatient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json(updatedPatient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new patient
router.post('/admin/patients', async (req, res) => {
  try {
    const newPatient = new Patient(req.body);
    const savedPatient = await newPatient.save();
    res.status(201).json(savedPatient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Create new doctor
router.post('/admin/doctors', async (req, res) => {
  try {
    const newDoctor = new Doctor(req.body);
    const savedDoctor = await newDoctor.save();
    res.status(201).json(savedDoctor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Create new appointment
router.post('/admin/appointments', async (req, res) => {
  try {
    const newAppointment = new Appointment(req.body);
    const savedAppointment = await newAppointment.save();
    res.status(201).json(savedAppointment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Create new symptom record
router.post('/admin/symptoms', async (req, res) => {
  try {
    const newSymptom = new Symptom(req.body);
    const savedSymptom = await newSymptom.save();
    res.status(201).json(savedSymptom);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Create new prescription
router.post('/admin/prescriptions', async (req, res) => {
  try {
    const newPrescription = new Prescription(req.body);
    const savedPrescription = await newPrescription.save();
    res.status(201).json(savedPrescription);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
