const express = require('express');
const router = express.Router();

const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Caretaker = require('../models/Caretaker');
const Prescription = require('../models/Medication');
const Symptom = require('../models/Symptom');
const PatientQuery=require('../models/patientQuery')
const User=require('../models/User')
router.get('/admin/patients', async (req, res) => {
  try {
    const patients = await Patient.find({}, 'patientId name phone dateOfBirth gender');
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// In your admin routes file
router.get('/admin/queries', async (req, res) => {
  try {
    const queries = await PatientQuery.find();
    res.json(queries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/admin/queries/:id', async (req, res) => {
  try {
    await PatientQuery.findByIdAndDelete(req.params.id);
    res.json({ message: 'Query deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Get patient details by ID
router.get('/admin/patients/:id', async (req, res) => {
  try {
    const patient = await Patient.findOne({ patientId: req.params.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Get related data
    const caretakers = await Caretaker.find({ patientId: patient.patientId });
    const prescriptions = await Prescription.find({ patientId: patient._id });
    const symptoms = await Symptom.find({ patientId: patient.patientId });
    const appointments = await Appointment.find({ patientId: patient._id });
    
    res.json({
      patient,
      caretakers,
      prescriptions,
      symptoms,
      appointments
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all doctors
router.get('/admin/doctors', async (req, res) => {
  try {
    const doctors = await Doctor.find({}, 'doctorId name specialization');
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get doctor details by ID
router.get('/admin/doctors/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ doctorId: req.params.id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    // Get doctor's patients
    const patients = await Patient.find({ doctorId: doctor.doctorId });
    
    // Get doctor's appointments
    const appointments = await Appointment.find({ doctorId: doctor.doctorId });
    
    res.json({
      doctor,
      patients,
      appointments
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.get('/admin/caretakers',  async (req, res) => {
  try {
    const caretakers = await Caretaker.find()
      .populate('patients', 'name patientId');
    
    res.json(caretakers);
  } catch (error) {
    console.error('Error fetching caretakers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get caretaker by ID
router.get('/admin/caretakers/:id', async (req, res) => {
  try {
    const caretaker = await Caretaker.findById(req.params.id)
      .populate('patients', 'name patientId');
    
    if (!caretaker) {
      return res.status(404).json({ error: 'Caretaker not found' });
    }
    
    res.json(caretaker);
  } catch (error) {
    console.error('Error fetching caretaker:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all appointments
router.get('/admin/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.find();
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update patient
router.put('/admin/patients/:id', async (req, res) => {
  try {
    const updatedPatient = await Patient.findOneAndUpdate(
      { patientId: req.params.id },
      req.body,
      { new: true }
    );
    if (!updatedPatient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json(updatedPatient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new patient
router.post('/admin/patients', async (req, res) => {
  try {
    const newPatient = new Patient(req.body);
    const savedPatient = await newPatient.save();
    res.status(201).json(savedPatient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Create new doctor
router.post('/admin/doctors', async (req, res) => {
  try {
    const newDoctor = new Doctor(req.body);
    const savedDoctor = await newDoctor.save();
    res.status(201).json(savedDoctor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Create new appointment
router.post('/admin/appointments', async (req, res) => {
  try {
    const newAppointment = new Appointment(req.body);
    const savedAppointment = await newAppointment.save();
    res.status(201).json(savedAppointment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Create new symptom record
router.post('/admin/symptoms', async (req, res) => {
  try {
    const newSymptom = new Symptom(req.body);
    const savedSymptom = await newSymptom.save();
    res.status(201).json(savedSymptom);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
router.get('/admin/caretakers/:id', async (req, res) => {
  try {
    const caretaker = await Caretaker.findById(req.params.id);
    
    if (!caretaker) {
      return res.status(404).json({ message: 'Caretaker not found' });
    }
    
    // Get detailed patient information for each patient ID
    let patientDetails = [];
    
    if (caretaker.patients && caretaker.patients.length > 0) {
      // Find all patients that match the IDs in caretaker.patients
      const patients = await Patient.find({
        _id: { $in: caretaker.patients }
      });
      
      // Map patients to the format we need
      patientDetails = patients.map(patient => ({
        _id: patient._id,
        name: patient.name,
        patientId: patient.patientId || patient._id
      }));
      
      console.log(`Found ${patients.length} patient records for caretaker ${caretaker._id}`);
    }
    
    // Create response object with caretaker data and patient details
    const responseData = {
      ...caretaker.toObject(),
      patientDetails
    };
    
    res.json(responseData);
  } catch (error) {
    console.error('Error fetching caretaker details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});





// Create new prescription
router.post('/admin/prescriptions', async (req, res) => {
  try {
    const newPrescription = new Prescription(req.body);
    const savedPrescription = await newPrescription.save();
    res.status(201).json(savedPrescription);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
router.delete('/admin/patients/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    console.log(patientId);

    // Find the patient by patientId
    const patient = await Patient.findOne({ patientId: req.params.patientId });
     
    if (!patient) {
      return res.status(404).json({ msg: 'Patient not found' });
    }

    const emailToDelete = patient.email; // Assuming 'email' exists in Patient schema
    console.log(emailToDelete)
    // Delete patient
    await Patient.findOneAndDelete({ patientId: req.params.patientId });
 
    // Delete the corresponding user by email
    if (emailToDelete) {
      await User.findOneAndDelete({ email: emailToDelete });
    }

    res.json({ msg: 'Patient and corresponding user removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// Delete doctor
router.delete('/admin/doctors/:doctorId', async (req, res) => {
  try {

    // Find the doctor by doctorId
    const doctor = await Doctor.findOne({ doctorId: req.params.doctorId });

    if (!doctor) {
      return res.status(404).json({ msg: 'Doctor not found' });
    }

    const emailToDelete = doctor.email; // Make sure Doctor schema includes email

    // Delete the doctor
    await Doctor.findOneAndDelete({ doctorId: req.params.doctorId });

    // Delete the corresponding user by email (or doctorId)
    if (emailToDelete) {
      await User.findOneAndDelete({ email: emailToDelete });
    } 

    res.json({ msg: 'Doctor and corresponding user removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
