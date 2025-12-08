const express = require('express');
const router = express.Router();
const Management = require('../models/management.model');

// GET all events
router.get('/', async (req, res) => {
    try {
        const events = await Management.find().sort({ date: 1 });
        res.json(events);
    } catch (err) {
        console.error('Failed to fetch events:', err);
        res.status(500).json({ message: 'Failed to fetch events', error: err.message });
    }
});

// POST create new event
router.post('/', async (req, res) => {
    console.log('POST /api/management called', req.body);

    try {
        const {
            title,
            organizer,
            date,
            time,
            location,
            capacity,
            status,
            category,
            description,
            expectations,
            requirements,
            agenda,
            imageUrl,
            organization
        } = req.body;

        if (!title || !organizer || !date || !time || !location || !capacity) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const dateTime = new Date(`${date}T${time}`);
        if (isNaN(dateTime.getTime())) {
            return res.status(400).json({ message: "Invalid date or time format" });
        }

        const newEvent = new Management({
            title,
            organizer,
            date: dateTime,
            time,
            location,
            capacity: Number(capacity),
            status: status || 'Pending',
            category: category || "General",
            description: description || "",
            expectations: Array.isArray(expectations) ? expectations : [],
            requirements: requirements || "",
            agenda: Array.isArray(agenda) ? agenda : [],
            imageUrl: imageUrl || "",
            organization: organization || ""
        });

        const savedEvent = await newEvent.save();
        console.log('Event successfully saved:', savedEvent);
        res.status(201).json(savedEvent);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to create event', error: err.message });
    }
});

module.exports = router;
