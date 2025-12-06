// routes/clubProfile.routes.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Club = require('../models/club.model'); // your Club schema
const ClubApplication = require('../models/clubApplication.model'); // for members

// ================================
// GET club profile by ID
// ================================
router.get('/:id', async (req, res) => {
    try {
        const club = await Club.findById(req.params.id);
        if (!club) return res.status(404).json({ message: 'Club not found' });
        res.json(club);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ================================
// PUT update club profile
// ================================
router.put(
    '/:id',
    [
        body('clubName').notEmpty().withMessage('Club Name is required'),
        body('description').notEmpty().withMessage('Description is required'),
        body('category').notEmpty().withMessage('Category is required'),
        body('contactEmail').isEmail().withMessage('Valid email is required'),
        body('meetingSchedule').notEmpty().withMessage('Meeting Schedule is required'),
        body('location').notEmpty().withMessage('Location is required')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const updatedClub = await Club.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!updatedClub) return res.status(404).json({ message: 'Club not found' });
            res.json(updatedClub);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// ================================
// GET approved members of the club
// ================================
router.get('/:id/members', async (req, res) => {
    try {
       const applications = await ClubApplication.find({
    clubId: req.params.id,
    status: { $regex: /^approved$/i }  // matches 'approved', 'Approved', 'APPROVED', etc.


        });

        const members = applications.map(app => ({
            _id: app._id,
            name: app.fullName,
            email: app.email,
            major: app.program,
            joinedDate: app.appliedAt,
            status: app.status
        }));

        res.json(members);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch members' });
    }
});

module.exports = router;
