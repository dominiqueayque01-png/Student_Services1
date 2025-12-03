const express = require('express');
const router = express.Router();
const EventAnnouncement = require('../models/eventAnnouncement.model'); // Import the NEW model

// 1. GET ALL
router.get('/', async (req, res) => {
    try {
        const list = await EventAnnouncement.find().sort({ createdAt: -1 });
        res.json(list);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. CREATE
router.post('/', async (req, res) => {
    const item = new EventAnnouncement({
        title: req.body.title,
        content: req.body.content,
        status: req.body.status || 'Pending'
    });

    try {
        const savedItem = await item.save();
        res.status(201).json(savedItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// 3. UPDATE (Edit or Status Change)
router.patch('/:id', async (req, res) => {
    try {
        const updatedItem = await EventAnnouncement.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updatedItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// 4. DELETE
router.delete('/:id', async (req, res) => {
    try {
        await EventAnnouncement.findByIdAndDelete(req.params.id);
        res.json({ message: 'Event Announcement deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;