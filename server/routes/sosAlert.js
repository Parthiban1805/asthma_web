const express = require('express');
const router = express.Router();
const SosAlert = require('../models/sosAlert');
const Patient = require('../models/Patient');
const Caretaker = require('../models/caretaker');
const Doctor = require('../models/Doctor');
const { sendEmailNotification } = require('../services/email');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com'; // fallback email

// Send an SOS alert
// Send an SOS alert
router.post('/send-sos', async (req, res) => {
  try {
    const { patientId, message } = req.body;
    console.log(patientId)
    // Find patient by custom patientId (like "P909")
    const patient = await Patient.findOne({ patientId: patientId });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Create SOS Alert with MongoDB _id
    const sosAlert = new SosAlert({ patientId: patient._id, message });
    const savedAlert = await sosAlert.save();

    // Find caretakers assigned to this patient (using ObjectId)
    const caretakers = await Caretaker.find({ patients: patient._id });

    // Find doctor (if assigned) using the doctorId string
    const doctor = await Doctor.findOne({ doctorId: patient.doctorId }); // Find by doctorId string

    // Prepare email content
    const emailSubject = `🚨 SOS Alert from Patient ${patient.name}`;
    const emailText = `
URGENT: Patient ${patient.name} has sent an SOS alert.

Message: ${message}

Patient Contact: ${patient.phone}

Please take immediate action.
    `;
    const emailHtml = `
      <h2 style="color: #d00;">🚨 SOS Alert</h2>
      <p><strong>Patient:</strong> ${patient.name}</p>
      <p><strong>Message:</strong> ${message}</p>
      <p><strong>Contact:</strong> ${patient.phone}</p>
      <p style="color: red; font-weight: bold;">Please respond ASAP.</p>
    `;

    // Notify all parties
    const emailPromises = [];

    // Notify caretakers
    caretakers.forEach(caretaker => {
      if (caretaker.email) {
        emailPromises.push(sendEmailNotification({
          recipient: caretaker.email,
          subject: emailSubject,
          text: emailText,
          html: emailHtml
        }));
      }
    });

    // Notify doctor
    if (doctor?.email) {
      emailPromises.push(sendEmailNotification({
        recipient: doctor.email,
        subject: emailSubject,
        text: emailText,
        html: emailHtml
      }));
    }
    if (patient.emergencyContact && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patient.emergencyContact)) {
      emailPromises.push(sendEmailNotification({
        recipient: patient.emergencyContact,
        subject: emailSubject,
        text: emailText,
        html: emailHtml
      }));
    }

    // Notify admin
    emailPromises.push(sendEmailNotification({
      recipient: ADMIN_EMAIL,
      subject: emailSubject,
      text: emailText,
      html: emailHtml
    }));

    await Promise.all(emailPromises);
    res.status(201).json(savedAlert);

  } catch (err) {
    console.error('SOS alert error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});




module.exports = router;
