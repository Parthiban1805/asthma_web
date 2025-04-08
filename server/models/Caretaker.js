const mongoose = require('mongoose');

const caretakerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  patients: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Patient' 
  }],
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Caretaker = mongoose.models.Caretaker || mongoose.model('Caretaker', caretakerSchema);

module.exports = Caretaker;
