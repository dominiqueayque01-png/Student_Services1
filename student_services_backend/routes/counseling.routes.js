// --- File: routes/counseling.routes.js ---
const express = require('express');
const router = express.Router();
const CounselingAppointment = require('../models/counselingAppointment.model');

// GET all appointments for a *specific* student
router.get('/my-appointments/:studentId', async (req, res) => {
    try {
        const appointments = await CounselingAppointment.find({ studentId: req.params.studentId })
                           .sort({ createdAt: -1 }); // Show newest first
        res.json(appointments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;