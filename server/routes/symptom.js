const express = require('express');
const router = express.Router();
const Symptom = require('../models/Symptom');
const Patient = require('../models/Patient');

// Get all symptoms for a patient
router.get('/symptoms/:patientId', async (req, res) => {
  try {
    const symptoms = await Symptom.find({ patientId: req.params.patientId })
      .sort({ date: -1 });
    
    res.json(symptoms);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Add new symptom record
router.post('/symptoms', async (req, res) => {
  try {
    const { 
      patientId, 
      coughing, 
      chestTightness, 
      shortnessOfBreath, 
      wheezing, 
      nighttimeSymptoms, 
      exercise, 
      notes 
    } = req.body;
    console.log(req.body)
    // Calculate severity based on number of symptoms
    const symptomCount = [coughing, chestTightness, shortnessOfBreath, wheezing, nighttimeSymptoms].filter(Boolean).length;
    let severity = 'Mild';
    
    if (symptomCount >= 4) {
      severity = 'Severe';
    } else if (symptomCount >= 2) {
      severity = 'Moderate';
    }
    
    const newSymptom = new Symptom({
      patientId, // <-- add this line

      coughing,
      chestTightness,
      shortnessOfBreath,
      wheezing,
      nighttimeSymptoms,
      exercise,
      notes,
      severity
    });
    
    const symptom = await newSymptom.save();
    
    // Check if this is exercise-induced and there's a history
    if (exercise) {
      const patient = await Patient.find({patientId:patientId});
      if (patient && patient.exerciseInduced) {
        // Could trigger notification to do0ctor here
        console.log('Exercise-induced symptoms detected for patient with history');
      }
    }
    
    res.json(symptom);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Delete symptom record
router.delete('/symptoms/:id', async (req, res) => {
  try {
    const symptom = await Symptom.find({patientId:req.params.id});
    
    if (!symptom) {
      return res.status(404).json({ msg: 'Symptom record not found' });
    }
    
    await symptom.remove();
    res.json({ msg: 'Symptom record removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
