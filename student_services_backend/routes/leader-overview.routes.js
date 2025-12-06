const express = require('express');
const router = express.Router();
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

const Club = require('../models/club.model'); 
const ClubApplication = require('../models/clubApplication.model'); 

// ============================================
// 1. Dashboard Summary Metrics
// ============================================
router.get('/summary', asyncHandler(async (req, res) => {
    // Total members across active clubs
    const totalMembersAgg = await Club.aggregate([
        { $match: { status: 'Active' } },
        { $group: { _id: null, total: { $sum: "$members" } } }
    ]);
    const totalMembers = totalMembersAgg[0]?.total || 0;

    // New members (sum of applicants in active clubs)
    const newMembersAgg = await Club.aggregate([
        { $match: { status: 'Active' } },
        { $group: { _id: null, total: { $sum: "$applicants" } } }
    ]);
    const newMembers = newMembersAgg[0]?.total || 0;

    // Pending and rejected applications
    const pendingApplications = await ClubApplication.countDocuments({ status: 'Pending' });
    const rejectedApplications = await ClubApplication.countDocuments({ status: 'Rejected' });

    res.json({ newMembers, totalMembers, pendingApplications, rejectedApplications });
}));

// ============================================
// 2. Recent Applications (latest 5)
// ============================================
router.get('/recent-applications', asyncHandler(async (req, res) => {
    const recentApps = await ClubApplication.find()
        .sort({ appliedAt: -1 })
        .limit(5)
        .populate('clubId', 'name') // Include club name
        .select('fullName program year status appliedAt');
    res.json(recentApps);
}));

// ============================================
// 3. New Members (latest 5 active clubs)
// ============================================
router.get('/new-members', asyncHandler(async (req, res) => {
    const newMembers = await Club.find({ status: 'Active' })
        .sort({ createdDate: -1 })
        .limit(5)
        .select('name members category');
    res.json(newMembers);
}));

module.exports = router;
