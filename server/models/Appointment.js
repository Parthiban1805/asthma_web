const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  doctorId: { type: String, required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  dateTime: { type: Date, required: true },
  duration: { type: Number, required: true },  // Duration in minutes
  purpose: { type: String, required: true },
  notes: { type: String },
  status: { type: String, enum: ['Confirmed', 'Cancelled'], default: 'Confirmed' },
  reminderSent: { type: Boolean, default: false }, // 👈 Add this line

});

module.exports = mongoose.model('Appointment', appointmentSchema);
