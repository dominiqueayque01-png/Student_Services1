const express = require('express');
const router = express.Router();
const CounselingAppointment = require('../models/counselingAppointment.model');

// GET all appointments for a specific student
router.get('/my-appointments/:studentId', async (req, res) => {
    try {
        const appointments = await CounselingAppointment.find({ studentId: req.params.studentId })
            .sort({ createdAt: -1 });
        res.json(appointments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// === ADD THIS NEW ROUTE ===
// PATCH: Cancel an appointment
router.patch('/cancel/:id', async (req, res) => {
    try {
        const updatedAppointment = await CounselingAppointment.findByIdAndUpdate(
            req.params.id,
            { status: 'Cancelled' }, // We only update the status
            { new: true } // Return the updated document
        );
        res.json(updatedAppointment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;