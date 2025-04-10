const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Caretaker = require('../models/Caretaker');
const sendEmail = require('../services/sendmail');

const checkMedicationIntake = async () => {
    const patients = await Patient.find({ 
      $or: [
        { 'medicationIntake.morning': 0 },
        { 'medicationIntake.evening': 0 },
        { 'medicationIntake.night': 0 }
      ]
    })
    .populate('caretakerId');  // You can still populate caretakerId if needed
  
    console.log("Patients:", patients);  // Log to ensure doctorId is populated
  
    for (const patient of patients) {
      const missedMedications = [];
      if (patient.medicationIntake.morning === 0) missedMedications.push('morning');
      if (patient.medicationIntake.evening === 0) missedMedications.push('evening');
      if (patient.medicationIntake.night === 0) missedMedications.push('night');
      
      const missedMedicationText = `The following medications were missed: ${missedMedications.join(', ')}`;
      
      if (patient.doctorId) {
        // Manually fetch the doctor by ID if doctorId is a string and not populated
        try {
          const doctor = await Doctor.findOne({ doctorId: patient.doctorId });  // Find doctor using doctorId string
          if (doctor) {
            console.log(`Sending email to doctor: ${doctor.email}`);  // Log the doctor's email for debugging
            await sendEmail(
              doctor.email,  // Use the doctor's email from the fetched doctor object
              `Medication Missed for Patient ${patient.name}`,
              `Dear Dr. ${doctor.name},\n\nPatient ${patient.name} has missed their ${missedMedicationText}.\nPlease check their treatment plan.\n\nSincerely, Your Medical System`
            );
          } else {
            console.log(`No doctor found for patient: ${patient.name}`);
          }
        } catch (err) {
          console.error(`Error fetching doctor for patient ${patient.name}:`, err);
        }
      } else {
        console.log(`No doctorId for patient: ${patient.name}`);
      }
  
      // Similarly for the caretaker
      if (patient.caretakerId && patient.caretakerId.email) {
        const caretaker = patient.caretakerId;
        console.log(`Sending email to caretaker: ${caretaker.email}`);  // Log the caretaker's email for debugging
        await sendEmail(
          caretaker.email,
          `Medication Missed for Patient ${patient.name}`,
          `Dear ${caretaker.name},\n\nPatient ${patient.name} has missed their ${missedMedicationText}.\nPlease assist them in taking their medication.\n\nSincerely, Your Medical System`
        );
      } else {
        console.log(`No email for caretaker: ${patient.name} (Caretaker: ${patient.caretakerId ? patient.caretakerId.name : 'N/A'})`);
      }
    }
  };
  
  
  
  

// You can schedule this function to run periodically using a cron job or a background job queue.
module.exports = { checkMedicationIntake };
