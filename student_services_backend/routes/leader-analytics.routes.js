// routes/leader-analytics.routes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Club = require('../models/club.model');
const ClubApplication = require('../models/clubApplication.model');

// ===== SAFE ANALYTICS ROUTE =====
router.get('/:id/analytics', async (req, res) => {
    try {
        const clubId = req.params.id;

        // Validate Club ID
        if (!mongoose.Types.ObjectId.isValid(clubId)) {
            return res.status(400).json({ message: 'Invalid Club ID' });
        }

        // Fetch club
        const club = await Club.findById(clubId);
        if (!club) return res.status(404).json({ message: 'Club not found' });

        // Fetch applications
        const applications = await ClubApplication.find({ clubId });
        console.log(`Safe Analytics: Found ${applications.length} applications`);

        // Filter safely by status
        const approvedApps = [];
        const rejectedApps = [];
        const pendingApps = [];

        applications.forEach(app => {
            if (!app || !app.status) return;
            const status = typeof app.status === 'string' ? app.status.toLowerCase() : '';
            if (status === 'approved') approvedApps.push(app);
            else if (status === 'rejected') rejectedApps.push(app);
            else if (status === 'pending') pendingApps.push(app);
        });

        // Basic stats
        const currentMembers = approvedApps.length;
        const totalApplications = applications.length;
        const approvalRating =
            totalApplications > 0
                ? Math.round((currentMembers / totalApplications) * 100)
                : 0;

        // New members last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const newMembers = approvedApps.filter(app => {
            if (!app.appliedAt) return false;
            const date = new Date(app.appliedAt);
            return !isNaN(date) && date >= thirtyDaysAgo;
        }).length;

        // =====================================================
        // MEMBERSHIP GROWTH — FULL 12 MONTHS (JAN → DEC)
        // =====================================================
        const membershipGrowth = [];
        const year = new Date().getFullYear();

        for (let month = 0; month < 12; month++) {
            const monthStart = new Date(year, month, 1);
            const monthEnd = new Date(year, month + 1, 0);

            const monthlyCount = approvedApps.filter(app => {
                if (!app.appliedAt) return false;
                const date = new Date(app.appliedAt);
                return !isNaN(date) && date >= monthStart && date <= monthEnd;
            }).length;

            membershipGrowth.push({
                month: monthStart.toLocaleString('default', { month: 'long' }),
                value: monthlyCount,
                color: 'blue'
            });
        }

        // Application trends
        const applicationTrends = [
            { status: 'Approved', value: approvedApps.length, color: 'green' },
            { status: 'Rejected', value: rejectedApps.length, color: 'red' },
            { status: 'Pending', value: pendingApps.length, color: 'orange' }
        ];

        // Send JSON
        res.json({
            currentMembers,
            approvalRating,
            newMembers,
            membershipGrowth,
            applicationTrends
        });

    } catch (err) {
        console.error('Safe Analytics Error:', err);
        res.status(500).json({
            message: 'Failed to fetch analytics',
            error: err.message
        });
    }
});

module.exports = router;
