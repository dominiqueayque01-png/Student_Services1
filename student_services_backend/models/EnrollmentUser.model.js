const mongoose = require('mongoose');
const { enrollmentConnection } = require('../config/db'); 

const userSchema = new mongoose.Schema({
    // Fields matching your classmate's database exactly
    studentId: String, 
    firstName: String,
    middleName: String,
    lastName: String,
    
    // Contact Info
    gmail: String,       // <--- They use 'gmail', not 'email'
    contactNo: String,   // <--- They use 'contactNo', not 'phone'
    
    // Academic Info (Optional, but good to have)
    programOrCourse: String,
    yearLevel: String,
    section: String,
    enrollmentStatus: String

}, { collection: 'students' }); // Targeted collection

const EnrollmentUser = enrollmentConnection.model('Student', userSchema);

module.exports = EnrollmentUser;