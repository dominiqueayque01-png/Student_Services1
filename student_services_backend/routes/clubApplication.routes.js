const express = require('express');
const router = express.Router();
const ClubApplication = require('../models/clubApplication.model');
const Club = require('../models/club.model');

// POST a new application
router.post('/', async (req, res) => {
    const existing = await ClubApplication.findOne({
        clubId: req.body.clubId,
        studentId: req.body.studentId
    });

    if (existing) {
        return res.status(400).json({ message: 'You have already applied to this club.' });
    }

    const application = new ClubApplication({
        clubId: req.body.clubId,
        studentId: req.body.studentId,
        fullName: req.body.fullName,
        year: req.body.year,
        motive: req.body.motive,
        program: req.body.program,
        email: req.body.email,
        experience: req.body.experience,
        status: 'Pending' // default status
    });

    try {
        const newApplication = await application.save();

        // Update Club applicants count
        await Club.findByIdAndUpdate(req.body.clubId, { $inc: { applicants: 1 } });

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

// GET all applications for a specific club
router.get('/:clubId/applications', async (req, res) => {
    try {
        const applications = await ClubApplication.find({ clubId: req.params.clubId });
        res.json(applications);
    } catch (err) {
        console.error("Fetch Error:", err);
        res.status(500).json({ message: 'Failed to fetch applications' });
    }
});

// PATCH: Approve an application
router.patch('/:applicationId/approve', async (req, res) => {
    try {
        const app = await ClubApplication.findByIdAndUpdate(
            req.params.applicationId,
            { status: 'Approved' },
            { new: true }
        );
        if (!app) return res.status(404).json({ message: 'Application not found' });
        res.json(app);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to approve application' });
    }
});

// PATCH: Reject an application
router.patch('/:applicationId/reject', async (req, res) => {
    try {
        const app = await ClubApplication.findByIdAndUpdate(
            req.params.applicationId,
            { status: 'Rejected' },
            { new: true }
        );
        if (!app) return res.status(404).json({ message: 'Application not found' });
        res.json(app);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to reject application' });
    }
});

module.exports = router;
