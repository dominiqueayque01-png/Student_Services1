const express = require('express');
const router = express.Router();
const OjtListing = require('../models/ojt.model');

// GET ALL LISTINGS
router.get('/', async (req, res) => {
    try {
        const listings = await OjtListing.find().sort({ createdAt: -1 });
        res.json(listings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET SINGLE LISTING
router.get('/:id', async (req, res) => {
    try {
        const listing = await OjtListing.findById(req.params.id);
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }
        res.json(listing);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// CREATE NEW LISTING
router.post('/', async (req, res) => {
    try {
        const listing = new OjtListing(req.body);
        const newListing = await listing.save();
        res.status(201).json(newListing);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// UPDATE LISTING
router.put('/:id', async (req, res) => {
    try {
        const listing = await OjtListing.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }
        res.json(listing);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE LISTING
router.delete('/:id', async (req, res) => {
    try {
        const listing = await OjtListing.findByIdAndDelete(req.params.id);
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }
        res.json({ message: 'Listing deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// TOGGLE STATUS
router.patch('/:id/status', async (req, res) => {
    try {
        const listing = await OjtListing.findById(req.params.id);
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }
        
        listing.status = listing.status === 'active' ? 'paused' : 'active';
        await listing.save();
        
        res.json(listing);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;