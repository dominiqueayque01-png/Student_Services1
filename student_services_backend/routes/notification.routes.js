const express = require('express');
const router = express.Router();
const Notification = require('../models/notification.model');

// GET: Fetch notifications for a specific student (Global + Personal)
router.get('/:studentId', async (req, res) => {
    try {
        const notifications = await Notification.find({
            $or: [
                { type: 'global' }, // Show announcements for everyone
                { studentId: req.params.studentId } // AND personal alerts
            ]
        }).sort({ createdAt: -1 }).limit(5); // Show newest 5
        
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST: Create a notification (Used by Admin or Internal System)
router.post('/', async (req, res) => {
    try {
        const notif = new Notification(req.body);
        await notif.save();
        res.status(201).json(notif);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PATCH: Mark all as read
router.patch('/mark-read/:studentId', async (req, res) => {
    try {
        await Notification.updateMany(
            { $or: [{ type: 'global' }, { studentId: req.params.studentId }] },
            { $set: { isRead: true } }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;