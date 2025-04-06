const mongoose = require('mongoose');

const symptomSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  coughing: { type: Number, default: 0 },
  chestTightness: { type: Number, default: 0 },
  shortnessOfBreath: { type: Number, default: 0 },
  wheezing: { type: Number, default: 0 },
  nighttimeSymptoms: { type: Number, default: 0 },
  exercise: { type: Number, default: 0 }, // if yes, considered with exerciseInduced

  notes: {
    type: String
  },
  severity: {
    type: String,
    enum: ['Mild', 'Moderate', 'Severe'],
    default: 'Mild'
  }
});

// Helper method to check for exercise-induced asthma prediction
symptomSchema.methods.checkExerciseInduced = async function() {
  if (this.exercise) {
    try {
      const Patient = mongoose.model('Patient');
      const patient = await Patient.findById(this.patientId);
      
      if (patient && patient.exerciseInduced) {
        return true; // Higher likelihood based on history
      }
    } catch (err) {
      console.error('Error checking exercise-induced history:', err);
    }
  }
  return false;
};

module.exports = mongoose.model('Symptom', symptomSchema);
