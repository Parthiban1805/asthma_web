const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient'); // adjust path as needed

// Get appointments for a specific date
router.get('/appointments/date/:date', async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);

    const appointments = await Appointment.find({
      dateTime: { $gte: date, $lt: nextDay }
    });
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments by date:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Get appointments for a specific patient
router.get('/appointments/patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    const appointments = await Appointment.find({ patientId }).sort({ dateTime: -1 });
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments by patient:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

router.post('/patient-appointments',  async (req, res) => {
  try {
    const { patientId, doctorId, dateTime, duration, purpose, notes } = req.body;
    
    // Validate required fields
    if (!patientId || !doctorId || !dateTime || !purpose) {
      return res.status(400).json({ message: 'Missing required appointment fields' });
    }
    
    // Check if patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Create and save new appointment
    const newAppointment = new Appointment({
      patientId,
      doctorId,
      dateTime: new Date(dateTime),
      duration: duration || 30, // Default to 30 minutes if not specified
      purpose,
      notes,
    });
    
    await newAppointment.save();
    
    res.status(201).json(newAppointment);
  } catch (err) {
    console.error('Error booking appointment:', err);
    res.status(500).json({ message: 'Failed to book appointment', error: err.message });
  }
});


router.get('/patient-appointments/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;

    // Step 1: Find Patient by custom ID
    const patient = await Patient.findOne({ patientId });
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Step 2: Use MongoDB _id to fetch appointments
    const appointments = await Appointment.find({ patientId: patient._id }).sort({ dateTime: -1 });
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments for patient:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Create appointment
router.post('/appointments', async (req, res) => {
  try {
    const appointment = new Appointment(req.body);
    await appointment.save();
    res.status(201).json(appointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

// Update appointment
router.put('/appointments/:id', async (req, res) => {
  try {
    const updated = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// Cancel appointment
router.put('/appointments/:id/cancel', async (req, res) => {
  try {
    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: 'Cancelled' },
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
});

module.exports = router;
