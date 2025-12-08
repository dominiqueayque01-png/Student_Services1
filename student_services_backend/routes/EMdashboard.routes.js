// routes/EMdashboard.routes.js
const express = require('express');
const router = express.Router();
const Event = require('../models/event.model');        // Event schema
const Notification = require('../models/notification.model'); // Notifications

// ================================
// GET Event Management dashboard stats + recent events
// ================================
router.get('/stats', async (req, res) => {
  try {
    const pendingEvents = await Event.countDocuments({ status: 'Pending' });
    const publishedEvents = await Event.countDocuments({ status: 'Published' });
    const rejectedEvents = await Event.countDocuments({ status: 'Rejected' });

    // Events for management page (all events)
    const events = await Event.find({}, 'title organizer status date time location')
      .sort({ date: -1 });

    // Recent events for dashboard (latest 5 events, includes confirmedAttendees & capacity)
    const recentEvents = await Event.find({}, 'title date time location confirmedAttendees capacity')
      .sort({ date: -1 })
      .limit(5);

    res.json({ pendingEvents, publishedEvents, rejectedEvents, events, recentEvents });
  } catch (err) {
    console.error('Error fetching EM dashboard stats:', err);
    res.status(500).json({ message: 'Error fetching EM dashboard stats', error: err.message });
  }
});

// ================================
// GET recent notifications
// ================================
router.get('/notifications', async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(10);
    res.json(notifications.map(n => ({
      message: n.message,
      read: n.read
    })));
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ message: 'Error fetching notifications', error: err.message });
  }
});

// ================================
// MARK ALL NOTIFICATIONS AS READ
// ================================
router.post('/notifications/mark-all-read', async (req, res) => {
  try {
    await Notification.updateMany({ read: false }, { $set: { read: true } });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error('Error marking notifications as read:', err);
    res.status(500).json({ message: 'Error marking notifications as read', error: err.message });
  }
});

module.exports = router;
