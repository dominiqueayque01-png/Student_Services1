const express = require('express');
const router = express.Router();
const counselorController = require('../controllers/counselors.controller');

// Check if controller functions exist before using them
if (!counselorController.getAllCounselors) {
    console.error("Error: Controller functions are missing. Check counselors.controller.js");
}

// GET all
router.get('/', counselorController.getAllCounselors);

// POST new
router.post('/', counselorController.createCounselor);

// PATCH (Edit) one
router.patch('/:id', counselorController.updateCounselor);

// DELETE one
router.delete('/:id', counselorController.deleteCounselor);

module.exports = router;