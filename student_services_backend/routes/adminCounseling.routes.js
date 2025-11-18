const express = require('express');
const router = express.Router();
const CounselingAppointment = require('../models/counselingAppointment.model');
const Counselor = require('../models/counselor.model'); // We might need this later

/**
 * @route   POST /api/admin/counseling/appointments
 * @desc    Create a new counseling appointment request
 * @access  Public (from student form)
 */
router.post('/appointments', async (req, res) => {
    // Log the incoming data to check
    console.log('Received appointment request:', req.body);

    const {
        studentId,
        studentFullName,
        studentPhone,
        studentEmail,
        referenceContact,
        relatedAnnouncementId // <-- 1. GET THE NEW ID FROM THE REQUEST
    } = req.body;

    // Basic validation
    if (!studentId || !studentFullName || !studentPhone || !studentEmail || !referenceContact) {
        return res.status(400).json({ message: 'Please fill out all required fields.' });
    }

    try {
        const newAppointment = new CounselingAppointment({
            studentId,
            studentFullName,
            studentPhone,
            studentEmail,
            referenceContact: {
                name: referenceContact.name,
                relationship: referenceContact.relationship,
                phone: referenceContact.phone,
                email: referenceContact.email
            },
            relatedAnnouncement: relatedAnnouncementId || null // <-- 2. SAVE THE NEW ID (or null)
            // Status defaults to 'Pending' as defined in your model
        });

        const savedAppointment = await newAppointment.save();
        
        // Send back the newly created appointment
        res.status(201).json(savedAppointment);

    } catch (err) {
        console.error('Error saving appointment:', err.message);
        res.status(500).json({ message: 'Server Error: ' + err.message });
    }
});

// --- Admin-Only Route Removed ---
// The GET /api/admin/counseling/appointments route was here,
// but I've removed it to focus on the student-side portal, per your request.
// The POST route above is still needed for the student form to work.

// Add other admin routes here (e.g., update status, assign counselor)
// router.patch('/appointments/:id/assign', ...);
// router.patch('/appointments/:id/schedule', ...);

module.exports = router;