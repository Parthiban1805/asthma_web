const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  medicationName: String,
  dosage: String,
  frequency: String,
  duration: String,
  instructions: String,
  startDate: Date,
  status: {
    type: String,
    default: 'Active'
  },
  timeOfDay: {
    morning: { type:Date },
    evening: { type:Date  },
    night: { type:Date  }
  }
});

module.exports = mongoose.model('Prescription', prescriptionSchema);
