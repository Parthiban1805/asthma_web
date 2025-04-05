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
  coughing: {
    type: Boolean,
    default: false
  },
  chestTightness: {
    type: Boolean,
    default: false
  },
  shortnessOfBreath: {
    type: Boolean,
    default: false
  },
  wheezing: {
    type: Boolean,
    default: false
  },
  nighttimeSymptoms: {
    type: Boolean,
    default: false
  },
  exercise: {
    type: Boolean,
    default: false
  },
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
