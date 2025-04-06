const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  patientId: { type: String, required: true, unique: true },
  doctorId: { type: String },
  name: { type: String, required: true },
  email: String,
  phone: { type: String, required: true },
  dateOfBirth: String,
  age: Number,
  gender: String,
  address: String,
  medicalHistory: String,
  bmi: Number,

  // Doctor-side inputs (converted from Boolean to Number)
  petAllergy: { type: Number, default: 0 },
  familyHistoryAsthma: { type: Number, default: 0 },
  historyOfAllergies: { type: Number, default: 0 },
  hayfever: { type: Number, default: 0 },
  gastroesophagealReflux: { type: Number, default: 0 },
  lungFunctionFEV1: Number,
  lungFunctionFVC: Number,
  exerciseInduced: { type: Number, default: 0 },

  // Patient-side inputs: Symptoms
  coughing: { type: Number, default: 0 },
  chestTightness: { type: Number, default: 0 },
  shortnessOfBreath: { type: Number, default: 0 },
  wheezing: { type: Number, default: 0 },
  nighttimeSymptoms: { type: Number, default: 0 },
  exercise: { type: Number, default: 0 }, // if yes, considered with exerciseInduced

  // Patient-side inputs: Triggers
  smoking: { type: Number, default: 0 },
  pollutionExposure: { type: Number, default: 0 },
  pollenExposure: { type: Number, default: 0 },
  dustExposure: { type: Number, default: 0 },
  physicalActivity: { type: Number, default: 0 }, // scale 0–10
  petExposure: { type: Number, default: 0 },

  caretakerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Caretaker',
    default: null // Null means unassigned
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Pre-save middleware to update the 'updatedAt' field
patientSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;
