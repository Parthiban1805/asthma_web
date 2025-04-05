const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');

// GET doctor profile (for simplicity, assuming single doctor profile)
router.get('/doctor-profile', async (req, res) => {
  try {
    const doctor = await Doctor.findOne(); // Modify if multiple doctors
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching doctor profile' });
  }
});

// PUT update doctor profile
router.put('/doctor-profile', async (req, res) => {
  try {
    let doctor = await Doctor.findOne(); // Assuming single doctor setup

    if (!doctor) {
      // If no doctor exists, create one
      doctor = new Doctor(req.body);
    } else {
      Object.assign(doctor, req.body);
    }

    const savedDoctor = await doctor.save();
    res.json(savedDoctor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating doctor profile' });
  }
});

module.exports = router;
