const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const sendEmail = require('../utils/sendEmail');

const sendAppointmentReminders = async () => {
  try {
    const now = new Date();
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    const appointments = await Appointment.find({
      dateTime: {
        $gte: new Date(twoHoursLater.getTime() - 60000), // -1 min buffer
        $lte: new Date(twoHoursLater.getTime() + 60000), // +1 min buffer
      },
      status: 'Confirmed',
    }).populate('patientId');

    for (const appt of appointments) {
      const patient = appt.patientId;
      const doctor = await Doctor.findOne({ doctorId: appt.doctorId });

      const dateStr = appt.dateTime.toLocaleString();

      if (patient?.email) {
        await sendEmail({
          to: patient.email,
          subject: 'Appointment Reminder - Asthma',
          text: `Hi ${patient.name},\n\nThis is a reminder for your appointment scheduled at ${dateStr} for "${appt.purpose}".\n\nThanks,\nWeAct Tech`,
        });
      }

      if (doctor?.email) {
        await sendEmail({
          to: doctor.email,
          subject: 'Upcoming Appointment Reminder',
          text: `Hi Dr. ${doctor.name},\n\nYou have an appointment with ${patient.name} scheduled at ${dateStr}.\nPurpose: ${appt.purpose}\n\nRegards,\nWeAct Tech`,
        });
      }
    }
  } catch (error) {
    console.error('Error sending appointment reminders:', error);
  }
};

module.exports = sendAppointmentReminders;
