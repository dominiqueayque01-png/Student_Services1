const express = require('express');
const router = express.Router();
// Assuming models are defined in '../models/'
const Club = require('../models/club.model'); 
const Activity = require('../models/activity.model'); 

// Helper to handle the API call logic
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);


// ============================================
// 1. GET Dashboard Summary Metrics (FIXED QUERIES)
// ============================================
router.get('/summary', asyncHandler(async (req, res, next) => {
    
    // Check MongoDB Connection Status (optional check)
    if (Club.db.readyState !== 1) {
        // If not connected, return a 503 error
        return res.status(503).json({ error: "Database service unavailable." });
    }

    // --- QUERY 1: Total Clubs & Active Clubs (Should be working based on your success) ---
    const totalClubs = await Club.countDocuments();
    // Assuming you have added 'status' field to Club model
    const activeClubs = await Club.countDocuments({ status: 'Active' }); 


    // --- QUERY 2: Total Members (FIXED: Using "$members" instead of "$memberCount") ---
    const memberAggregation = await Club.aggregate([
        { 
            // Sum the 'members' field across all clubs
            $group: { _id: null, total: { $sum: "$members" } } 
        }
    ]);
    const totalMembers = memberAggregation.length > 0 ? memberAggregation[0].total : 0;
    
    
    // --- QUERY 3: Active Categories (FIXED: Filtered by Active status) ---
    const activeCategories = await Club.distinct('category', { status: 'Active' });
    
    
    // --- QUERY 4: Average Club Size (FIXED: Using "$members" and filtered by Active status) ---
    const avgSizeAggregation = await Club.aggregate([
        { $match: { status: 'Active' } }, // Only calculate average for active clubs
        { 
            // Calculate the average of the 'members' field
            $group: { _id: null, averageSize: { $avg: "$members" } }
        }
    ]);
    const avgClubSize = avgSizeAggregation.length > 0 
        ? Math.round(avgSizeAggregation[0].averageSize) 
        : 0;

    // Send all data back
    res.json({
        totalClubs: { value: totalClubs, activeCount: activeClubs },
        totalMembers: { value: totalMembers },
        activeCategories: { value: activeCategories.length },
        avgClubSize: { value: avgClubSize },
    });
}));

// ============================================
// 2. GET Recent Activity (FIXED: Assuming Activity model is now accessible)
// ============================================
router.get('/activity/recent', asyncHandler(async (req, res) => {
    // This query is usually correct, assuming Activity model is accessible
    const recentActivity = await Activity.find({})
        .sort({ timestamp: -1 }) 
        .limit(5)
        // Ensure only fields needed by the frontend are returned
        .select('type description timestamp'); 

    res.json(recentActivity);
}));

module.exports = router;