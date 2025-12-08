const express = require('express');
const router = express.Router();
const referralController = require('../controllers/counselingReferral.controller');

// PROFESSOR ROUTES
router.post('/', referralController.submitReferral);
router.get('/', referralController.getReferralsByInstructor);

// ADMIN ROUTES (New!)
router.get('/admin/all', referralController.getAllReferrals); // Admin sees everything
router.patch('/:id/status', referralController.updateReferralStatus); // Admin updates status


router.get('/', referralController.getReferralsByInstructor);
module.exports = router;