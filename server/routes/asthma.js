const express = require('express');
const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const Symptom = require("../models/Symptom");
const { spawn } = require('child_process');
const router = express.Router();
const Doctor = require('../models/Doctor');
const Caretaker = require('../models/Caretaker');
const sendEmail = require('../utils/sendEmail');

router.post('/predict-asthma', async (req, res) => {
  const { patientId } = req.body;

  try {
    // 1. Fetch patient data
    const patient = await Patient.findOne({ patientId });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    // 2. Fetch latest symptom data
    const symptom = await Symptom.findOne({ patientId }).sort({ date: -1 });
    if (!symptom) return res.status(404).json({ error: 'No symptom data found' });

    // 3. Prepare the final input in model's format
    const patientData = [
      patient.age,
      patient.gender === 'Male' ? 1 : 0,          // Gender (encoded)
      patient.ethnicity || 0,                     // Make sure encoded or mapped properly
      patient.educationLevel || 0,                // Same
      patient.bmi,
      patient.smoking,
      patient.physicalActivity,
      patient.dietQuality || 5,                   // Assuming scale 0-10, use default if missing
      patient.sleepQuality || 5,
      patient.pollutionExposure,
      patient.pollenExposure,
      patient.dustExposure,
      patient.petAllergy,
      patient.familyHistoryAsthma,
      patient.historyOfAllergies,
      patient.eczema || 0,
      patient.hayfever,
      patient.gastroesophagealReflux,
      patient.lungFunctionFEV1,
      patient.lungFunctionFVC,
      symptom.wheezing,
      symptom.shortnessOfBreath,
      symptom.chestTightness,
      symptom.coughing,
      symptom.nighttimeSymptoms,
      patient.exerciseInduced || symptom.exercise
    ]
    const patientDataWithKeys = {
      age: patient.age,
      gender: patient.gender === 'Male' ? 1 : 0,
      ethnicity: patient.ethnicity || 0,
      educationLevel: patient.educationLevel || 0,
      bmi: patient.bmi,
      smoking: patient.smoking,
      physicalActivity: patient.physicalActivity,
      dietQuality: patient.dietQuality || 5,
      sleepQuality: patient.sleepQuality || 5,
      pollutionExposure: patient.pollutionExposure,
      pollenExposure: patient.pollenExposure,
      dustExposure: patient.dustExposure,
      petAllergy: patient.petAllergy,
      familyHistoryAsthma: patient.familyHistoryAsthma,
      historyOfAllergies: patient.historyOfAllergies,
      eczema: patient.eczema || 0,
      hayfever: patient.hayfever,
      gastroesophagealReflux: patient.gastroesophagealReflux,
      lungFunctionFEV1: patient.lungFunctionFEV1,
      lungFunctionFVC: patient.lungFunctionFVC,
      wheezing: symptom.wheezing,
      shortnessOfBreath: symptom.shortnessOfBreath,
      chestTightness: symptom.chestTightness,
      coughing: symptom.coughing,
      nighttimeSymptoms: symptom.nighttimeSymptoms,
      exerciseInduced: patient.exerciseInduced || symptom.exercise,
    };
    
    console.log("🧾 Final patient data for prediction:", patientDataWithKeys);
    
    console.log(patientData)
    // 4. Call Python script
    const python = spawn('python', ['predict_modal.py', JSON.stringify(patientData)]);

    let result = '';
    python.stdout.on('data', (data) => {
      result += data.toString();
    });

    python.stderr.on('data', (data) => {
      console.error('Python stderr:', data.toString());
    });

    python.on('close', async (code) => {
      const [prediction, probability] = result.trim().split(',');

      if (prediction === 'Asthma') {
        // Fetch doctor email
        const doctor = await Doctor.findOne({ doctorId: patient.doctorId });

        // Fetch caretaker by checking if this patient ObjectId is in any caretaker's patients array
        const caretaker = await Caretaker.findOne({ patients: patient._id });

        const subject = `⚠️ Asthma Alert: ${patient.name}`;
        const text = `Prediction: Asthma\nProbability: ${(parseFloat(probability) * 100).toFixed(2)}%\n\nPlease review the patient's case.`

        if (doctor) await sendEmail({ to: doctor.email, subject, text });
        if (caretaker) await sendEmail({ to: caretaker.email, subject, text });
      }

      res.json({ prediction, probability });
    });


    python.stderr.on('data', (err) => {
      console.error('Python error:', err.toString());
    });

  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
