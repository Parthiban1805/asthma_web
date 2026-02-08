const express = require('express');
const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const Symptom = require("../models/Symptom");
const { spawn } = require('child_process');
const router = express.Router();
const Doctor = require('../models/Doctor');
const Caretaker = require('../models/Caretaker');
const sendEmail = require('../utils/sendEmail');
const path = require('path');

router.post('/predict-asthma', async (req, res) => {
  const { patientId } = req.body;
  console.log("📥 Received request to predict asthma for patientId:", patientId);

  try {
    // 1. Fetch patient data
    const patient = await Patient.findOne({ patientId });
    console.log("🩺 Fetched patient record:", patient);

    if (!patient) {
      console.error("❌ Patient not found for ID:", patientId);
      return res.status(404).json({ error: 'Patient not found' });
    }

    // 2. Fetch latest symptom data
    const symptom = await Symptom.findOne({ patientId }).sort({ date: -1 });
    console.log("🧾 Fetched latest symptom record:", symptom);

    if (!symptom) {
      console.error("❌ No symptom data found for patient ID:", patientId);
      return res.status(404).json({ error: 'No symptom data found' });
    }

    // 3. Prepare the final input in model's format with capitalized keys to match Python column names
    const patientData = {
      Age: patient.age,
      Gender: patient.gender === 'Male' ? 1 : 0,
      Ethnicity: patient.ethnicity || 0,
      EducationLevel: patient.educationLevel || 0,
      BMI: patient.bmi,
      Smoking: patient.smoking,
      PhysicalActivity: patient.physicalActivity,
      DietQuality: patient.dietQuality || 5,
      SleepQuality: patient.sleepQuality || 5,
      PollutionExposure: patient.pollutionExposure,
      PollenExposure: patient.pollenExposure,
      DustExposure: patient.dustExposure,
      PetAllergy: patient.petAllergy,
      FamilyHistoryAsthma: patient.familyHistoryAsthma,
      HistoryOfAllergies: patient.historyOfAllergies,
      Eczema: patient.eczema || 0,
      HayFever: patient.hayfever,
      GastroesophagealReflux: patient.gastroesophagealReflux,
      LungFunctionFEV1: patient.lungFunctionFEV1,
      LungFunctionFVC: patient.lungFunctionFVC,
      Wheezing: symptom ? symptom.wheezing : (patient.wheezing || 0),
      ShortnessOfBreath: symptom ? symptom.shortnessOfBreath : (patient.shortnessOfBreath || 0),
      ChestTightness: symptom ? symptom.chestTightness : (patient.chestTightness || 0),
      Coughing: symptom ? symptom.coughing : (patient.coughing || 0),
      NighttimeSymptoms: symptom ? symptom.nighttimeSymptoms : (patient.nighttimeSymptoms || 0),
      ExerciseInduced: patient.exerciseInduced || (symptom ? symptom.exercise : 0),
    };

    console.log("✅ Final patient data object:", patientData);

    // 4. Call Python script with proper path
    const pythonExecutable = process.platform === "win32" 
        ? path.join(__dirname, '..', 'venv', 'Scripts', 'python.exe')
        : path.join(__dirname, '..', 'venv', 'bin', 'python');

    const pythonScriptPath = path.join(__dirname, '..', 'predict_modal.py');
    
    // Use the explicit path to the venv python
    const python = spawn(pythonExecutable, [pythonScriptPath, JSON.stringify(patientData)]);
    
    let result = '';
    let pythonError = '';

    python.stdout.on('data', (data) => {
      console.log("🐍 Python stdout:", data.toString());
      result += data.toString();
    });

    python.stderr.on('data', (data) => {
      console.error("🐍 Python stderr:", data.toString());
      pythonError += data.toString();
    });

    python.on('error', (error) => {
      console.error("❌ Failed to start Python process:", error);
      return res.status(500).json({ error: 'Failed to start prediction model' });
    });

    python.on('close', async (code) => {
      console.log("🚪 Python process closed with code:", code);
      
      if (code !== 0) {
        console.error("❌ Python process exited with code:", code);
        return res.status(500).json({ error: 'Prediction model failed', details: pythonError });
      }

      console.log("📊 Raw result from Python:", result.trim());

      try {
        const [prediction, probability] = result.trim().split(',');
        console.log("✅ Prediction:", prediction);
        console.log("📈 Probability:", probability);

        if (prediction === 'Asthma') {
          try {
            const doctor = await Doctor.findOne({ doctorId: patient.doctorId });
            const caretaker = await Caretaker.findOne({ patients: patient._id });

            console.log("📬 Doctor info:", doctor);
            console.log("📬 Caretaker info:", caretaker);

            const subject = `⚠️ Asthma Alert: ${patient.name}`;
            const text = `Prediction: Asthma\nProbability: ${(parseFloat(probability) * 100).toFixed(2)}%\n\nPlease review the patient's case.`;

            if (doctor) {
              await sendEmail({ to: doctor.email, subject, text });
              console.log("📧 Email sent to doctor:", doctor.email);
            }
            if (caretaker) {
              await sendEmail({ to: caretaker.email, subject, text });
              console.log("📧 Email sent to caretaker:", caretaker.email);
            }
          } catch (emailErr) {
            console.error("❌ Error sending email notifications:", emailErr);
            // Continue execution - don't fail the request if just notifications fail
          }
        }

        res.json({ prediction, probability: parseFloat(probability) });
      } catch (parseErr) {
        console.error("❌ Error parsing Python result:", parseErr);
        res.status(500).json({ error: 'Error parsing prediction result', details: result });
      }
    });

  } catch (err) {
    console.error("❗ Server error:", err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;