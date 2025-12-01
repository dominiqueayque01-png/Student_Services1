// models/club.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const clubSchema = new Schema({
    name: { type: String, required: true },
    category: { type: String, required: true, default: 'General' },
    location: { type: String },
    meetingTime: { type: String },
    
    // --- CRITICAL FIELDS FOR DASHBOARD METRICS ---
    
    // Total members count (used for Total Members and Avg Club Size)
    members: { type: Number, default: 0 }, 
    
    // NEW: Status field (used to filter Active Clubs, Active Categories, and Avg Club Size)
    // The dashboard routes rely on checking for { status: 'Active' }
    status: { 
        type: String, 
        required: true, // KEEP this required, as it must be set (even to 'Pending')
        enum: ['Active', 'Pending', 'Inactive', 'Archived'], 
        default: 'Pending' 
    },
    
    // --- Existing Fields ---
    applicants: { type: Number, default: 0 }, // Set default to avoid validation error
    description: { type: String, required: true },
    
    // FIX: This field is REQUIRED but not sent by the form. 
    // Changing to required: false, or you MUST add it to the frontend form.
    aboutClub: { type: String, required: false, default: 'A brief overview is coming soon.' },
    
    // Note: It's usually best practice to let Mongoose handle dates
    // by using the 'timestamps: true' option below instead of 'createdDate'.
    createdDate: { type: Date, default: Date.now } 

}, { 
    // Recommended Mongoose option to automatically track creation/update times
    // timestamps: true 
});

module.exports = mongoose.model('Club', clubSchema);