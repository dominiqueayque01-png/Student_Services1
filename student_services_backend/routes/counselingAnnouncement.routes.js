const express = require('express');
const router = express.Router();
const CounselingAnnouncement = require('../models/counselingAnnouncement.model');

// 1. GET ALL (For Admin List)
router.get('/', async (req, res) => {
    try {
        const list = await CounselingAnnouncement.find().sort({ createdAt: -1 });
        res.json(list);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. CREATE
router.post('/', async (req, res) => {
    const item = new CounselingAnnouncement({
        title: req.body.title,
        content: req.body.content,
        status: req.body.status || 'Published' // Admin posts usually publish immediately
    });
    try {
        const saved = await item.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// 3. UPDATE (Edit)
router.patch('/:id', async (req, res) => {
    try {
        // Log what we received
        console.log("Updating ID:", req.params.id);
        console.log("Update Data:", req.body);

        const updated = await CounselingAnnouncement.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true } // This is crucial to return the new data
        );
        
        if (!updated) {
            console.log("Announcement not found!");
            return res.status(404).json({ message: "Not Found" });
        }

        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: err.message });
    }
});

// 4. DELETE
router.delete('/:id', async (req, res) => {
    try {
        await CounselingAnnouncement.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;