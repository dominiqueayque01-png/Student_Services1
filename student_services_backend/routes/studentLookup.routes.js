const express = require('express');
const router = express.Router();
const lookupController = require('../controllers/studentLookUp.controller.js');
// Route: GET /api/lookup/:studentId
router.get('/:studentId', lookupController.getStudentDetails);

module.exports = router;