const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    doctorId:{ type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  specialization: String,
  licenseNumber: String,
  yearsOfExperience: Number,
  bio: String,
});

module.exports = mongoose.model('Doctor', doctorSchema);
