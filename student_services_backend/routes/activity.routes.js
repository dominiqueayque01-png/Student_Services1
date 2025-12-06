// routes/leader-analytics.routes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Club = require('../models/club.model');
const ClubApplication = require('../models/clubApplication.model');

// GET /api/leader-analytics/:id/analytics
router.get('/:id/analytics', async (req, res) => {
    try {
        const clubId = req.params.id;

        // Validate Club ID
        if (!mongoose.Types.ObjectId.isValid(clubId)) {
            return res.status(400).json({ message: 'Invalid Club ID' });
        }
        const clubObjectId = mongoose.Types.ObjectId(clubId);

        // Fetch club info
        const club = await Club.findById(clubObjectId);
        if (!club) return res.status(404).json({ message: 'Club not found' });

        // Fetch all applications for this club
        const applications = await ClubApplication.find({ clubId: clubObjectId });

        // Normalize status safely (case-insensitive)
        const approvedApps = applications.filter(app => (app.status || '').toLowerCase() === 'approved');
        const rejectedApps = applications.filter(app => (app.status || '').toLowerCase() === 'rejected');
        const pendingApps = applications.filter(app => (app.status || '').toLowerCase() === 'pending');

        // Calculate stats safely
        const currentMembers = approvedApps.length;
        const totalApplications = applications.length;
        const approvalRating = totalApplications > 0 ? Math.round((approvedApps.length / totalApplications) * 100) : 0;

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const newMembers = approvedApps.filter(app => {
            const appliedAt = app.appliedAt ? new Date(app.appliedAt) : null;
            return appliedAt && appliedAt >= thirtyDaysAgo;
        }).length;

        // Membership Growth (last 6 months)
        const membershipGrowth = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
            const monthlyCount = approvedApps.filter(app => {
                const appliedDate = app.appliedAt ? new Date(app.appliedAt) : null;
                return appliedDate && appliedDate >= monthStart && appliedDate <= monthEnd;
            }).length;
            membershipGrowth.push({
                month: monthStart.toLocaleString('default', { month: 'long' }),
                value: monthlyCount,
                color: 'blue'
            });
        }

        // Application Trends
        const applicationTrends = [
            { status: 'Approved', value: approvedApps.length, color: 'green' },
            { status: 'Rejected', value: rejectedApps.length, color: 'red' },
            { status: 'Pending', value: pendingApps.length, color: 'orange' }
        ];

        // Send JSON response
        return res.json({
            currentMembers,
            approvalRating,
            newMembers,
            membershipGrowth,
            applicationTrends
        });

    } catch (err) {
        console.error('Failed to fetch analytics:', err);
        return res.status(500).json({ message: 'Failed to fetch analytics', error: err.message });
    }
});

module.exports = router;
