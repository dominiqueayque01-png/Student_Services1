// --- File: routes/adminCounseling.routes.js ---
const express = require('express');
const router = express.Router();
const CounselingAppointment = require('../models/counselingAppointment.model');

// POST a new appointment request (from the student form)
router.post('/appointments', async (req, res) => {
    const appointment = new CounselingAppointment({
        studentId: req.body.studentId,
        studentFullName: req.body.studentFullName,
        studentPhone: req.body.studentPhone,
        studentEmail: req.body.studentEmail,
        referenceContact: req.body.referenceContact
    });
    try {
        const newAppointment = await appointment.save();
        res.status(201).json(newAppointment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// (We can add other admin routes here later)
module.exports = router;