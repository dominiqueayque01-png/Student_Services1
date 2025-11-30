// --- File: routes/club.routes.js ---

const express = require('express');
const router = express.Router();

// --- IMPORTANT: Ensure this path is correct for your Club Mongoose Model ---
const Club = require('../models/club.model');

// ============================================
// 1. GET ALL CLUBS (READ)
// Endpoint: GET /api/clubs
// ============================================
router.get('/', async (req, res) => {
  try {
    const clubs = await Club.find(); 
    res.json(clubs);
  } catch (err) {
    console.error('SERVER ERROR: GET /api/clubs', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ============================================
// 1b. GET RECENT ACTIVITY (NEW ROUTE)
// Endpoint: GET /api/clubs/recent
// Fetches the 5 most recently created clubs for the dashboard feed
// ============================================
router.get('/recent', async (req, res) => {
    try {
        const recentClubs = await Club.find()
            .sort({ createdDate: -1 }) // Sort descending by creation date (newest first)
            .limit(5); // Limit to the top 5 activities

        // Format the data for the frontend display
        const activities = recentClubs.map(club => ({
            type: 'New club created',
            description: club.name,
            date: club.createdDate
        }));
        
        res.json(activities);
    } catch (err) {
        console.error('SERVER ERROR: GET /api/clubs/recent failed', err.message);
        res.status(500).json({ message: err.message });
    }
});

// ============================================
// 2. CREATE A NEW CLUB (CREATE)
// Endpoint: POST /api/clubs
// ============================================
router.post('/', async (req, res) => {
    // Mongoose requires the 'status' field. If the client doesn't send it, 
    // the model's default ('Pending') is used. We use req.body directly here.
    const club = new Club(req.body);

  try {
    const newClub = await club.save();
    res.status(201).json(newClub);
  } catch (err) {
    console.error('SERVER ERROR: POST /api/clubs failed. Validation Error:', err.message);
    res.status(400).json({ 
        message: 'Creation failed due to missing required data (check name, description, status).', 
        error: err.message 
    });
  }
});

// ============================================
// 3. UPDATE/EDIT CLUB (PUT)
// Endpoint: PUT /api/clubs/:id
// Handles submissions from the Edit Modal
// ============================================
router.put('/:id', async (req, res) => {
  try {
    const clubId = req.params.id;
    const updateData = req.body; 

    const updatedClub = await Club.findByIdAndUpdate(clubId, updateData, { 
      new: true, // Returns the updated document
      runValidators: true // Ensures Mongoose validation rules are applied
    });

    if (!updatedClub) {
      return res.status(404).json({ message: 'Club not found' });
    }
    res.status(200).json(updatedClub);
  } catch (error) {
    console.error('SERVER ERROR: PUT /api/clubs/:id failed. Validation Error:', error.message); 
    res.status(400).json({ 
        message: 'Update failed due to validation error (e.g., missing required field, bad member count).', 
        error: error.message 
    }); 
  }
});

// ============================================
// 4. TOGGLE CLUB STATUS (PATCH)
// Endpoint: PATCH /api/clubs/:id
// Handles Deactivate/Activate button clicks
// ============================================
router.patch('/:id', async (req, res) => {
  try {
    const clubId = req.params.id;
    // We only expect 'status' in the body for this operation
    const { status } = req.body; 

    // Ensure status is provided for PATCH
    if (!status) {
         return res.status(400).json({ message: 'Status field is required for PATCH.' });
    }

    const updatedClub = await Club.findByIdAndUpdate(
      clubId, 
      { status: status }, 
      { new: true, runValidators: true } // Run validators ensures status enum is correct
    );

    if (!updatedClub) {
      return res.status(404).json({ message: 'Club not found' });
    }
    res.status(200).json(updatedClub);
  } catch (error) {
    console.error('SERVER ERROR: PATCH /api/clubs/:id failed.', error.message);
    res.status(500).json({ message: 'Server Error during status update' });
  }
});

// ============================================
// 5. DELETE A CLUB (DELETE)
// Endpoint: DELETE /api/clubs/:id
// Handles the delete confirmation
// ============================================
router.delete('/:id', async (req, res) => {
  try {
    const clubId = req.params.id;
    const result = await Club.findByIdAndDelete(clubId); 

    if (!result) {
        return res.status(404).json({ message: 'Club not found' });
    }
    
    // 204 No Content indicates success with no response body
    res.status(204).send(); 
  } catch (error) {
    console.error('SERVER ERROR: DELETE /api/clubs/:id failed.', error.message);
    res.status(500).json({ message: 'Server Error during delete' });
  }
});
// ============================================
// 6. CLUB ANALYTICS (DYNAMIC)
// Endpoint: GET /api/clubs/analytics
// ============================================
router.get('/analytics', async (req, res) => {
    try {
        const clubs = await Club.find();

        // CATEGORY COUNTS
       // CATEGORY COUNTS (add 3 new categories)
const categories = {
    Technology: clubs.filter(c => c.category === 'Technology').length,
    Business: clubs.filter(c => c.category === 'Business').length,
    Arts: clubs.filter(c => c.category === 'Arts').length,
    Sports: clubs.filter(c => c.category === 'Sports').length,
    Science: clubs.filter(c => c.category === 'Science').length,    // NEW
    Culture: clubs.filter(c => c.category === 'Culture').length,    // NEW
    Service: clubs.filter(c => c.category === 'Service').length     // NEW
};


        // MEMBER DISTRIBUTION
        const memberDist = {
            "0-50": clubs.filter(c => c.members <= 50).length,
            "51-100": clubs.filter(c => c.members >= 51 && c.members <= 100).length,
            "101-150": clubs.filter(c => c.members >= 101 && c.members <= 150).length,
            "150+": clubs.filter(c => c.members >= 150).length
        };

        // CLUB STATUS
        const status = {
            active: clubs.filter(c => c.status === 'Active').length,
            inactive: clubs.filter(c => c.status === 'Inactive').length
        };

        res.json({
            categories,
            memberDist,
            status
        });

    } catch (error) {
        console.error('SERVER ERROR: GET /api/clubs/analytics', error.message);
        res.status(500).json({ message: 'Failed to load analytics', error: error.message });
    }
});

// This exports the router instance
module.exports = router;

