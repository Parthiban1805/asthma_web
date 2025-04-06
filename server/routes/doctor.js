const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');

// Get doctor profile by ID
router.get('/doctors-profile/:id', async (req, res) => {
  try {
    console.log(req.params.id)
    const doctor = await Doctor.find({doctorId:req.params.id});
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    console.error('Error fetching doctor profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update doctor profile
router.put('/doctors-profile/:id', async (req, res) => {
    try {
      const doctor = await Doctor.findOneAndUpdate(
        { doctorId: req.params.id },  // make sure doctorId is indexed or unique
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );
  
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }
  
      res.json(doctor);
    } catch (error) {
      console.error('Error updating doctor profile:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  

module.exports = router;
