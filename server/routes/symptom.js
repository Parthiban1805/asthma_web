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

router.get('/symptoms/caretaker/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id)
    console.log('GET /symptoms/:id hit with ID:', id);

    console.log('Incoming request for patient symptoms. MongoDB _id:', id);

    // Find the patient using the ObjectId
    const patient = await Patient.findById(id);
    if (!patient) {
      console.log('❌ Patient not found with ID:', id);
      return res.status(404).json({ message: 'Patient not found' });
    }

    console.log('✅ Found patient:', patient);

    // Use patient.patientId to find symptoms
    const symptoms = await Symptom.find({ patientId: patient.patientId }).sort({ date: -1 });

    console.log(`📄 Found ${symptoms.length} symptoms for patientId "${patient.patientId}"`);

    res.status(200).json(symptoms);
  } catch (err) {
    console.error('❗ Error fetching symptoms:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/test', (req, res) => {
  console.log('/api/symptoms/test route hit');
  res.send('Symptoms router working!');
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
      notes,
      smoking,
      pollutionExposure,
      pollenExposure,
      dustExposure,
      physicalActivity,
      petExposure
    } = req.body;

    // Calculate severity based on symptom presence
    const symptomCount = [coughing, chestTightness, shortnessOfBreath, wheezing, nighttimeSymptoms].filter(Boolean).length;
    let severity = 'Mild';

    if (symptomCount >= 4) severity = 'Severe';
    else if (symptomCount >= 2) severity = 'Moderate';

    // Save main symptoms in Symptom collection
    const newSymptom = new Symptom({
      patientId,
      coughing,
      chestTightness,
      shortnessOfBreath,
      wheezing,
      nighttimeSymptoms,
      exercise,
      notes,
      severity
    });

    const savedSymptom = await newSymptom.save();

    // Update trigger-related data in Patient schema
    await Patient.findOneAndUpdate(
      { patientId },
      {
        $set: {
          smoking,
          pollutionExposure,
          pollenExposure,
          dustExposure,
          physicalActivity,
          petExposure,
          // Optionally update the 6 symptoms too for real-time patient overview
          coughing,
          chestTightness,
          shortnessOfBreath,
          wheezing,
          nighttimeSymptoms,
          exercise
        }
      },
      { new: true }
    );

    // Optional: Alert if exercise-induced symptoms are detected and history exists
    if (exercise) {
      const patient = await Patient.findOne({ patientId });
      if (patient?.exerciseInduced) {
        console.log('Exercise-induced symptoms detected for patient with history');
        // Trigger doctor notification logic here (if needed)
      }
    }

    res.json(savedSymptom);

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
