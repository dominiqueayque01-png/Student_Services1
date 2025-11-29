const mongoose = require('mongoose');
// Import the specific connection from our config file
const { enrollmentConnection } = require('../config/db'); 

// Define the Schema matching THEIR database
const userSchema = new mongoose.Schema({
    studentId: String,
    firstName: String,
    lastName: String,
    email: String,
    role: String,
    // Add any other fields you need to read
}, { collection: 'users' }); // <--- Make sure this matches their collection name

// IMPORTANT: Use enrollmentConnection.model, NOT mongoose.model
const EnrollmentUser = enrollmentConnection.model('User', userSchema);

module.exports = EnrollmentUser;