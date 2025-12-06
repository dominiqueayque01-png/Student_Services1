const Appointment = require('../models/counselingAppointment.model');

// ... existing code ...

// RESCHEDULE AN APPOINTMENT
exports.rescheduleAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { newDateTime } = req.body; // Expecting "2023-12-05T10:00:00"

        if (!newDateTime) {
            return res.status(400).json({ message: "New date and time are required." });
        }

        const updatedAppointment = await Appointment.findByIdAndUpdate(
            id,
            { 
                scheduledDateTime: newDateTime,
                status: 'Scheduled' // Ensure status is set to scheduled
            },
            { new: true }
        );

        if (!updatedAppointment) {
            return res.status(404).json({ message: "Appointment not found." });
        }

        res.status(200).json(updatedAppointment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};