// backend/index.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const patientsRoutes = require('./routes/patients');
const medicationsRoutes = require('./routes/medications');
const appointmentRoutes = require('./routes/appointments');
const dashboardRoute=require('./routes/dashboard')
const patientRoute=require('./routes/patients')
const symptomRoute=require('./routes/symptom')
const app = express();
const adminRoute=require('./routes/admin')
const videocallRoute=require('./routes/agora')
const caretakerRoute=require('./routes/caretaker')
const asthmaRoute=require('./routes/asthma')
const doctorRoute=require('./routes/doctor')
const sendAppointmentReminders = require('./services/sendAppointmentReminders');

dotenv.config();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', patientsRoutes);
app.use('/api', medicationsRoutes);
app.use('/api',appointmentRoutes)
app.use('/api',dashboardRoute)
app.use('/api',patientRoute)
app.use('/api',symptomRoute)
app.use('/api',caretakerRoute)
app.use('/api',adminRoute)
app.use('/api/caretaker',caretakerRoute)
app.use('/api',asthmaRoute)
app.use('/api',doctorRoute)
// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ MongoDB connected');

  // Start checking for reminders immediately
  sendAppointmentReminders();

  // Check for reminders every second
  setInterval(() => {
    console.log(`\n[${new Date().toLocaleTimeString()}] Checking for upcoming appointments...`);
    sendAppointmentReminders();
  }, 1000);

  // Start server
  app.listen(5000, () => {
    console.log('🚀 Server running on port 5000');
  });

}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});
