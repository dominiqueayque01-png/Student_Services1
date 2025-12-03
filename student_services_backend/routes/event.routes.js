// --- File: routes/event.routes.js ---
const express = require('express');
const router = express.Router();
const Event = require('../models/event.model'); 

// 1. GET ALL EVENTS
router.get('/', async (req, res) => {
    try {
        // Sort by date (descending) so new events appear first? 
        // Or ascending (date: 1) for upcoming.
        const events = await Event.find().sort({ date: 1 }); 
        res.json(events);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// 2. CREATE EVENT (POST)
router.post('/', async (req, res) => {
    const event = new Event(req.body); 
    try {
        const newEvent = await event.save();
        res.status(201).json(newEvent);
    } catch (err) { res.status(400).json({ message: err.message }); } 
});

// 3. UPDATE EVENT (PATCH) - REQUIRED for Edit, Archive, Approve, Reject
router.patch('/:id', async (req, res) => {
    try {
        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id, 
            req.body,           // This takes whatever you send (status, title, etc.) and updates it
            { new: true }       // Returns the updated version to the frontend
        );
        res.json(updatedEvent);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// 4. DELETE EVENT (DELETE) - REQUIRED for Delete button
router.delete('/:id', async (req, res) => {
    try {
        await Event.findByIdAndDelete(req.params.id);
        res.json({ message: "Event deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// [ADD THIS NEW ROUTE] Get Single Event by ID
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json(event);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
module.exports = router;