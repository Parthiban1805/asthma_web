const mongoose = require('mongoose');

const patientQuerySchema = new mongoose.Schema({
  patientId: { type: String }, // Change from ObjectId to String
  subject: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Normal', 'High'],
    default: 'Normal'
  }
});
  module.exports = mongoose.model('PatientQuery', patientQuerySchema);
