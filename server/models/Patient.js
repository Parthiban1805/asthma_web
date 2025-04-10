const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  patientId: { type: String, required: true, unique: true },
  doctorId: { type: String },
  name: { type: String, required: true },
  email: String,
  dateOfBirth: String,
  age: Number,
  gender: String,
  address: String,
  medicalHistory: String,
  bmi: Number,
  phone: { type:Number },
  emergencyContact: { type:String },

  // Doctor-side inputs
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
  exercise: { type: Number, default: 0 },

  // Patient-side inputs: Triggers
  smoking: { type: Number, default: 0 },
  pollutionExposure: { type: Number, default: 0 },
  pollenExposure: { type: Number, default: 0 },
  dustExposure: { type: Number, default: 0 },
  physicalActivity: { type: Number, default: 0 },
  petExposure: { type: Number, default: 0 },

  // Medication intake tracking
  medicationIntake: {
    morning: { type: Number, default: 0 },  // 1 = taken, 0 = not taken
    evening: { type: Number, default: 0 },
    night: { type: Number, default: 0 }
  },

  caretakerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Caretaker',
    default: null
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
