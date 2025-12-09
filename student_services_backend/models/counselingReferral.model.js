const mongoose = require('mongoose');

const CounselingReferralSchema = new mongoose.Schema({
    // --- Unique Referral ID (R2025-001) ---
    referralId: {
        type: String,
        required: true,
        unique: true
    },

    // --- Status ---
    status: {
    type: String,
    // YOU MUST ADD 'Session Scheduled' HERE:
    enum: ['Pending', 'Acknowledged', 'In Progress', 'Closed', 'Session Scheduled', 'Rejected', 'Cancelled'], 
    default: 'Pending'
},

    status: {   
    type: String,
    // 👇 YOU MUST ADD 'Session Scheduled' HERE!
    enum: ['Pending', 'Acknowledged', 'In Progress', 'Closed', 'Session Scheduled', 'Rejected', 'Cancelled'],
    default: 'Pending'
},
    
    // --- Student Information ---
    // We link to the Student model to ensure data integrity
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student', 
        required: false // Optional: in case you want to allow referrals for students not yet in system
    },
    // We keep these "snapshot" fields in case the student record changes later
    studentIdNumber: { type: String, required: true }, // The string ID (e.g. 23-0000)
    studentName: { type: String, required: true },
    studentEmail: { type: String, required: true },
    course: String,
    yearLevel: String,
    section: String,
    
    // --- Instructor Information (The Referrer) ---
    referredBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', // Links to your Professor/User model
        required: true
    },
    instructorName: String, // Snapshot
    instructorEmail: String, // Snapshot

    // --- Referral Details ---
    reason: {
        type: String,
        required: true
    },
    observationDate: {
        type: Date,
        required: true
    },
    additionalNotes: {
        type: String,
        default: ''
    },
    
    // --- Meta ---
    isArchived: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });



module.exports = mongoose.model('CounselingReferral', CounselingReferralSchema);