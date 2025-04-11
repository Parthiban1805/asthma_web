const mongoose = require('mongoose');

const sosAlertSchema = new mongoose.Schema({
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },
    message: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Sent', 'Acknowledged', 'Resolved'],
      default: 'Sent'
    },
    createdAt: {
        type: Date,
        default: Date.now
      },
      resolvedAt: {
        type: Date
      }
    });
    
    module.exports = mongoose.model('SosAlert', sosAlertSchema);
    