const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  adminId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  department: {
    type: String,
    default: 'General Administration'
  },
  permissions: {
    type: [String],
    default: ['view_users', 'edit_users', 'view_data']
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Admin = mongoose.model('Admin', AdminSchema);

module.exports = Admin;