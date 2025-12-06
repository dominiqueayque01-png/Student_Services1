// models/club.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const clubSchema = new Schema({
    // Core club info
    name: { type: String, required: true },
    category: { type: String, required: true, default: 'General' },
    location: { type: String, required: true },
    meetingTime: { type: String, required: true },
    description: { type: String, required: true },
    aboutClub: { type: String, required: false, default: 'A brief overview is coming soon.' },

    // Dashboard & metrics
    members: { type: Number, default: 0 },   // Total approved members
    applicants: { type: Number, default: 0 }, // Total applications submitted

    // Club status
    status: { 
        type: String, 
        required: true, 
        enum: ['Active', 'Pending', 'Inactive', 'Archived'], 
        default: 'Pending' 
    },

    // Timestamps
    createdDate: { type: Date, default: Date.now }
}, {
    // Automatically track creation and update times
    timestamps: true
});

module.exports = mongoose.model('Club', clubSchema);
