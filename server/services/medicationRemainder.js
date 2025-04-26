const cron = require('node-cron');
const Prescription = require('../models/Medication');
const Patient = require('../models/Patient');
const { sendEmailNotification } = require('./email');

function isTenMinutesBefore(targetTime) {
  const now = new Date();
  const diffInMs = targetTime.getTime() - now.getTime();
  const diffInMinutes = Math.floor(diffInMs / 1000 / 60);
  return diffInMinutes === 10;
}

cron.schedule('* * * * *', async () => {
  try {
    console.log("Checking")
    const prescriptions = await Prescription.find({}).populate('patientId');

    prescriptions.forEach(async (prescription) => {
      const { timeOfDay, patientId } = prescription;

      const reminders = [];

      // Morning
      if (timeOfDay?.morning && isTenMinutesBefore(new Date(timeOfDay.morning))) {
        reminders.push('morning');
      }

      // Evening
      if (timeOfDay?.evening && isTenMinutesBefore(new Date(timeOfDay.evening))) {
        reminders.push('evening');
      }

      // Night
      if (timeOfDay?.night && isTenMinutesBefore(new Date(timeOfDay.night))) {
        reminders.push('night');
      }

      // If any reminders are due
      if (reminders.length > 0 && patientId?.email) {
        const message = `
          Hello ${patientId.name || 'Patient'},<br/>
          This is a reminder to take your <b>${prescription.medicationName}</b> medication in the: 
          <b>${reminders.join(', ')}</b>.<br/><br/>
          Dosage: ${prescription.dosage}<br/>
          Instructions: ${prescription.instructions || 'N/A'}<br/>
          Stay healthy! 💊
        `;

        await sendEmailNotification({
          recipient: patientId.email,
          subject: `⏰ Medication Reminder - ${prescription.medicationName}`,
          text: `Time to take your ${prescription.medicationName} (${reminders.join(', ')})`,
          html: message
        });

        console.log(`Reminder sent to ${patientId.email} for ${reminders.join(', ')}`);
      }
    });
  } catch (err) {
    console.error('Reminder scheduler error:', err);
  }
});
