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
        referenceContact,
        preferredMode // <--- 1. Receive the new field
    } = req.body;

    // 2. Add it to validation check
    if (!studentId || !studentFullName || !studentPhone || !studentEmail || !referenceContact || !preferredMode) {
        return res.status(400).json({ message: 'Please fill out all required fields.' });
    }

        try {
        const newAppointment = new CounselingAppointment({
            studentId,
            studentFullName,
            studentPhone,
            studentEmail,
            referenceContact,
            preferredMode // <--- 3. Save it to the database
        });

        const savedAppointment = await newAppointment.save();
        console.log("Saved successfully:", savedAppointment._id);
        
        res.status(201).json(savedAppointment);

    } catch (err) {
        console.error('Error saving appointment:', err);
        res.status(500).json({ message: 'Server Error: ' + err.message });
    }
});router.post('/appointments', async (req, res) => {
    console.log('Received appointment request:', req.body);

    const {
        studentId,
        studentFullName,
        studentPhone,
        studentEmail,
        referenceContact,
        preferredMode // <--- 1. Receive the new field
    } = req.body;

    // 2. Add it to validation check
    if (!studentId || !studentFullName || !studentPhone || !studentEmail || !referenceContact || !preferredMode) {
        return res.status(400).json({ message: 'Please fill out all required fields.' });
    }

    try {
        const newAppointment = new CounselingAppointment({
            studentId,
            studentFullName,
            studentPhone,
            studentEmail,
            referenceContact,
            preferredMode // <--- 3. Save it to the database
        });

        const savedAppointment = await newAppointment.save();
        console.log("Saved successfully:", savedAppointment._id);
        
        res.status(201).json(savedAppointment);

    } catch (err) {
        console.error('Error saving appointment:', err);
        res.status(500).json({ message: 'Server Error: ' + err.message });
    }
});
module.exports = router;