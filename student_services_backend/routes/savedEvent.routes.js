const express = require('express');
const router = express.Router();
const SavedEvent = require('../models/savedEvent.model');

// GET: Get all saved event IDs for a student
router.get('/:studentId', async (req, res) => {
    try {
        const saved = await SavedEvent.find({ studentId: req.params.studentId });
        // Return just the list of Event IDs
        res.json(saved.map(s => s.eventId));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST: Toggle Save (Add or Remove)
router.post('/toggle', async (req, res) => {
    const { studentId, eventId } = req.body;
    
    try {
        // Check if already saved
        const existing = await SavedEvent.findOne({ studentId, eventId });

        if (existing) {
            // If exists, delete it (Unsave)
            await SavedEvent.findByIdAndDelete(existing._id);
            return res.json({ status: 'removed' });
        } else {
            // If not exists, create it (Save)
            const newSave = new SavedEvent({ studentId, eventId });
            await newSave.save();
            return res.json({ status: 'saved' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;