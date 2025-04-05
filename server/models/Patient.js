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
  petAllergy: Boolean,
  familyHistoryAsthma: Boolean,
  historyOfAllergies: Boolean,
  hayfever: Boolean,
  gastroesophagealReflux: Boolean,
  lungFunctionFEV1: Number,
  lungFunctionFVC: Number,
  exerciseInduced: Boolean,

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
