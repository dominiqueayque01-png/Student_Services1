// --- File: routes/eventRegistration.routes.js ---
const express = require('express');
const router = express.Router();
const EventRegistration = require('../models/eventRegistration.model');
const Notification = require('../models/notification.model');

// GET registrations for a specific student
router.get('/my-registrations/:studentId', async (req, res) => {
    try {
        const registrations = await EventRegistration.find({ studentId: req.params.studentId });
        res.json(registrations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST a new registration
router.post('/', async (req, res) => {
const existing = await EventRegistration.findOne({
        eventId: req.body.eventId,
        studentId: req.body.studentId
    });

    if (existing) {
        return res.status(400).json({ message: "You have already registered for this event." });
    }

    const registration = new EventRegistration({
        eventId: req.body.eventId,
        eventTitle: req.body.eventTitle,
        studentId: req.body.studentId
    });
    try {
        const newRegistration = await registration.save();
        res.status(201).json(newRegistration);
    } catch (err) { res.status(400).json({ message: err.message }); }

    try {
        const newRegistration = await registration.save();

        // === NEW: CREATE NOTIFICATION ===
        const notif = new Notification({
            message: `Your enrollment for "${req.body.eventTitle}" has been confirmed`,
            type: 'personal',
            studentId: req.body.studentId
        });
        await notif.save();
        // ================================

        res.status(201).json(newRegistration);
    } catch (err) { 
        res.status(400).json({ message: err.message }); 
    }
});

module.exports = router;