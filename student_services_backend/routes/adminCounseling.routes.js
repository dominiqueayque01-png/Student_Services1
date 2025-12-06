const express = require('express');
const router = express.Router();
const CounselingAppointment = require('../models/counselingAppointment.model');
const EnrollmentUser = require('../models/EnrollmentUser.model'); 
const { sendMeetingLink } = require('../services/emailService');
const adminController = require('../controllers/adminCounseling.controller');

// 1. GET ALL APPOINTMENTS (Merged with Student Data)
router.get('/', async (req, res) => {
    try {
        const appointments = await CounselingAppointment.find().sort({ createdAt: -1 });

        const populatedAppointments = await Promise.all(appointments.map(async (appt) => {
            let studentName = appt.studentFullName || "Unknown Student"; 
            let studentEmail = appt.studentEmail || "N/A";
            let studentPhone = appt.studentPhone || "N/A";

            // Try to fetch fresh data from Enrollment DB
            if (appt.studentId) {
                try {
                    const student = await EnrollmentUser.findOne({ studentId: appt.studentId });
                    if (student) {
                        studentName = `${student.firstName} ${student.lastName}`;
                        studentEmail = student.gmail || studentEmail;
                        studentPhone = student.contactNo || studentPhone;
                    }
                } catch (e) {
                    console.log(`Error fetching student ${appt.studentId}:`, e.message);
                }
            }

            return {
                ...appt._doc, 
                studentName,  
                studentEmail,
                studentPhone,

                preferredMode: appt.preferredMode || 'In-Person',
            };
        }));

        res.json(populatedAppointments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. UPDATE APPOINTMENT (Schedule / Complete / Assign Counselor)
router.patch('/:id', async (req, res) => {
    try {
        // --- FIX: Added meetingLink here ---
        const { status, counselor, scheduledDateTime, meetingLink } = req.body; 
        
        // Prepare update object
        const updateData = {
            status: status,
            counselor: counselor
        };

        // If status is changing to Scheduled, ensure we save the time
        if (status === 'Scheduled' && scheduledDateTime) {
            updateData.scheduledDateTime = scheduledDateTime;
            updateData.nextScheduled = scheduledDateTime;
            
            if (meetingLink) {
                updateData.meetingLink = meetingLink;
            }
        }

        // Update in Database
        const updatedAppointment = await CounselingAppointment.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true } // Return updated doc
        );

        // --- EMAIL LOGIC ---
        if (status === 'Scheduled' && updatedAppointment.preferredMode === 'Virtual') {
             // Use the link sent from frontend, or a default one
             // NOW 'meetingLink' IS DEFINED!
             const finalLink = meetingLink || 'https://meet.google.com/abc-defg-hij';
             
             console.log(`Attempting to send email to: ${updatedAppointment.studentEmail}`);

             try {
                 await sendMeetingLink(
                     updatedAppointment.studentEmail,
                     updatedAppointment.studentFullName,
                     new Date(scheduledDateTime).toLocaleDateString(),
                     new Date(scheduledDateTime).toLocaleTimeString(),
                     finalLink
                 );
                 console.log("Email sent successfully!");
             } catch (emailErr) {
                 console.error("⚠️ Schedule saved, but EMAIL FAILED:", emailErr.message);
             }
        }
        // -------------------

        res.json(updatedAppointment);
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: err.message });
    }
});

// 3. DELETE APPOINTMENT
router.delete('/:id', async (req, res) => {
    try {
        await CounselingAppointment.findByIdAndDelete(req.params.id);
        res.json({ message: "Appointment deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 4. CREATE (Student Side Submission)
router.post('/appointments', async (req, res) => {
    try {
        const newAppointment = new CounselingAppointment(req.body);
        const savedAppointment = await newAppointment.save();
        res.status(201).json(savedAppointment);
    } catch (err) {
        res.status(500).json({ message: 'Server Error: ' + err.message });
    }
});

router.patch('/reschedule/:id', adminController.rescheduleAppointment);


module.exports = router;