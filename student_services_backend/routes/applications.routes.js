const express = require('express');
const router = express.Router();
const ClubApplication = require('../models/clubApplication.model');

// GET all applications for a specific club
router.get('/clubs/:clubId/applications', async (req, res) => {
    try {
        const applications = await ClubApplication.find({ clubId: req.params.clubId });
        res.json(applications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PATCH approve application
router.patch('/applications/:appId/approve', async (req, res) => {
    try {
        const app = await ClubApplication.findByIdAndUpdate(
            req.params.appId,
            { status: 'approved' },
            { new: true }
        );
        res.json(app);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PATCH reject application
router.patch('/applications/:appId/reject', async (req, res) => {
    try {
        const app = await ClubApplication.findByIdAndUpdate(
            req.params.appId,
            { status: 'rejected' },
            { new: true }
        );
        res.json(app);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
