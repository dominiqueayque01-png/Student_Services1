const express = require('express');
const router = express.Router();
const Announcement = require('../models/announcement.model');

// GET all counseling announcements
router.get('/', async (req, res) => {
    try {
        const announcements = await Announcement.find({ category: 'counseling' }).sort({ createdAt: -1 });
        res.json(announcements);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST a new announcement (for an admin)
router.post('/', async (req, res) => {
    const item = new Announcement({
        title: req.body.title,
        content: req.body.content
    });
    try {
        const newItem = await item.save();
        res.status(201).json(newItem);
    } catch (err) { res.status(400).json({ message: err.message }); }
});
module.exports = router;