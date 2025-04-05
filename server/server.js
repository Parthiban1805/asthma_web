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
// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
  app.listen(5000, () => console.log('Server running on port 5000'));
}).catch(err => console.error(err));
