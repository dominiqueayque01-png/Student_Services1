const express = require('express');
const router = express.Router();
const Activity = require('../models/activity.model');

// GET recent activities (last 10)
router.get('/activities/recent', async (req, res) => {
    try {
        const activities = await Activity.find({})
            .sort({ timestamp: -1 })  // most recent first
            .limit(10);               // last 10 activities
        res.json(activities);
    } catch (err) {
        console.error('Error fetching recent activities:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
