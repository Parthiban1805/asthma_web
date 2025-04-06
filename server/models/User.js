const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: String,
  age: {
    type: Number,
    default: 0 // or null if you prefer
  },  phone: String,
  address: {
    type: String,
    default: ""
  },
    role: { type: String, enum: ['doctor', 'patient', 'caretaker', 'admin'], required: true },
    patientId: { type: String, unique: true },
    // ✅ Added role
});

module.exports = mongoose.model('User', userSchema);
