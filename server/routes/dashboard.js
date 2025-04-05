const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

// Get doctor stats
router.get('/stats/:doctorId', async (req, res) => {
    try {
        const { doctorId } = req.params;

        // Find doctor using string ID
        const doctor = await Doctor.findOne({ doctorId: doctorId });  // doctorId is a string
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Total patients — update if you want to count only patients related to this doctor
        const totalPatientsResult = await Patient.aggregate([
            { $match: { doctorId: doctorId } },
            { $count: "totalPatients" }
        ]);

        // Extract the totalPatients count (if available)
        const totalPatients = totalPatientsResult.length > 0 ? totalPatientsResult[0].totalPatients : 0;

        // Calculate today's date range
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // Count today's appointments for the doctor (string comparison)
        const todayAppointments = await Appointment.countDocuments({
            doctorId: doctorId,
            dateTime: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });

        // Placeholder value
        const pendingPrescriptions = 0;

        const stats = {
            totalPatients,
            todayAppointments,
            pendingPrescriptions
        };

        res.json(stats);
    } catch (err) {
        console.error('Error fetching stats:', err);
        res.status(500).json({ message: 'Error fetching stats' });
    }
});

// Get appointments for a doctor
router.get('/appointments/:doctorId', async (req, res) => {
    try {
        const { doctorId } = req.params;

        const appointments = await Appointment.find({ doctorId: doctorId })
            .populate('patientId', 'name email phone')  // Populate patient details
            .populate('doctorId', 'name email phone')   // Populate doctor details
            .sort({ dateTime: -1 });  // Sort by latest appointment first

        res.json(appointments);
    } catch (err) {
        console.error('Error fetching appointments:', err);
        res.status(500).json({ message: 'Error fetching appointments' });
    }
});

module.exports = router;
