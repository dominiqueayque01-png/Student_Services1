const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/register', authController.register); // To create accounts
router.post('/login', authController.login);       // To log in

module.exports = router;