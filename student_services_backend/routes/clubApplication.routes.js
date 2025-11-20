    const express = require('express');
    const router = express.Router();
    const ClubApplication = require('../models/clubApplication.model');
    const Club = require('../models/club.model');

// POST a new application
router.post('/', async (req, res) => {
    // 1. Check for existing application (Prevent Duplicates)
    // We check if this student has already applied to this club
    const existing = await ClubApplication.findOne({
        clubId: req.body.clubId,
        studentId: req.body.studentId // Check by Student ID now, not just email
    });

    if (existing) {
        return res.status(400).json({ message: 'You have already applied to this club.' });
    }

    // 2. Create new application
    const application = new ClubApplication({
        clubId: req.body.clubId,
        studentId: req.body.studentId, // <--- SAVE THE ID
        fullName: req.body.fullName,
        year: req.body.year,
        motive: req.body.motive,
        program: req.body.program,
        email: req.body.email,
        experience: req.body.experience
    });

try {
        // 2. Save the Application Form
        const newApplication = await application.save();

        // === 3. THE MAGIC PART: UPDATE THE CLUB COUNT ===
        // We tell MongoDB: "Find this Club ID, and increment ($inc) the 'applicants' field by 1"
        await Club.findByIdAndUpdate(
            req.body.clubId, 
            { $inc: { applicants: 1 } } 
        );
        // ================================================

        res.status(201).json(newApplication);
    } catch (err) {
        console.error("Save Error:", err);
        res.status(400).json({ message: err.message });
    }
});

// GET applications for a specific student
router.get('/my-applications/:studentId', async (req, res) => {
    try {
        const applications = await ClubApplication.find({ studentId: req.params.studentId });
        res.json(applications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;