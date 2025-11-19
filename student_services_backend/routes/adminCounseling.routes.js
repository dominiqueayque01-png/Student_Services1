const express = require('express');
const router = express.Router();
const CounselingAppointment = require('../models/counselingAppointment.model');

// POST: Create a new counseling appointment
router.post('/appointments', async (req, res) => {
    console.log('Received appointment request:', req.body);

    const {
        studentId,
        studentFullName,
        studentPhone,
        studentEmail,
        referenceContact
    } = req.body;

    // 1. Basic Validation
    if (!studentId || !studentFullName || !studentPhone || !studentEmail || !referenceContact) {
        console.log("Missing fields in request");
        return res.status(400).json({ message: 'Please fill out all required fields.' });
    }

    try {
        // 2. Create the Appointment Object (Clean, no announcement links)
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
            }
            // Status defaults to 'Pending' automatically per the model
        });

        // 3. Save to Database
        const savedAppointment = await newAppointment.save();
        console.log("Saved successfully:", savedAppointment._id);
        
        res.status(201).json(savedAppointment);

    } catch (err) {
        console.error('Error saving appointment:', err);
        res.status(500).json({ message: 'Server Error: ' + err.message });
    }
});

module.exports = router;