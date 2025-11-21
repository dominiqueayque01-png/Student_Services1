const express = require('express');
const router = express.Router();
const OjtListing = require('../models/ojt.model');
const OjtApplication = require('../models/ojtApplication.model');

// GET ALL LISTINGS
router.get('/', async (req, res) => {
    try {
        const listings = await OjtListing.find().sort({ postedAt: -1 });
        res.json(listings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST A NEW LISTING (For Admin/Testing)
router.post('/', async (req, res) => {
    const ojt = new OjtListing(req.body);
    try {
        const newListing = await ojt.save();
        res.status(201).json(newListing);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// APPLY TO OJT
router.post('/apply', async (req, res) => {
    const { ojtId, studentId } = req.body;
    
    // Check duplicate
    const existing = await OjtApplication.findOne({ ojtId, studentId });
    if (existing) return res.status(400).json({ message: "You already applied to this position." });

    const application = new OjtApplication({ ojtId, studentId });
    
    try {
        await application.save();
        res.status(201).json({ message: "Application successful" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET MY APPLICATIONS
router.get('/my-applications/:studentId', async (req, res) => {
    try {
        const apps = await OjtApplication.find({ studentId: req.params.studentId });
        res.json(apps.map(a => a.ojtId)); // Return just IDs for easy checking
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;