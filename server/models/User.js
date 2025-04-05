const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: String,
  age: Number,
  phone: String,
  address: String,
  role: { type: String, enum: ['doctor', 'patient', 'caretaker', 'admin'], required: true } // ✅ Added role
});

module.exports = mongoose.model('User', userSchema);
