
const CounselingAppointment = require('../models/counselingAppointment.model');


// ... existing code ...

// RESCHEDULE AN APPOINTMENT
exports.rescheduleAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { newDateTime } = req.body; 

        if (!newDateTime) {
            return res.status(400).json({ message: "New date and time are required." });
        }

        const updatedAppointment = await CounselingAppointment.findByIdAndUpdate(
            id,
            { 
                scheduledDateTime: newDateTime,
                status: 'Scheduled' 
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

// Create a new Appointment (Used when accepting a referral)
// CREATE APPOINTMENT (From Referral)
exports.createAppointment = async (req, res) => {
    try {
        // 1. Get studentEmail from the request body
        const { studentId, studentName, studentEmail, counselor, scheduledDateTime, preferredMode, meetingLink, referralId } = req.body;

        console.log("Received Data:", req.body); 

        const newAppointment = new CounselingAppointment({
            studentId, 
            studentName, 
            studentFullName: studentName, 
            
            // --- FIX START: Add the missing required fields ---
            studentEmail: studentEmail || "no-email@provided.com", // Use the email from form, or a fallback
            studentPhone: "N/A", // The database requires this, so we put "N/A" for now
            // --- FIX END ---

            counselor,
            scheduledDateTime,
            preferredMode,
            meetingLink,
            status: 'Scheduled',
            referenceContact: { 
                preferredMode: preferredMode || 'Face-to-Face',
                contactNumber: 'N/A'
            }
        });

        await newAppointment.save();
        res.status(201).json({ message: 'Appointment created successfully', appointment: newAppointment });

    } catch (error) {
        console.error("Error creating appointment:", error);
        res.status(500).json({ message: error.message }); 
    }
};