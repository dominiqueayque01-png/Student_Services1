const mongoose = require('mongoose');

const counselorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    title: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    
    // --- CHANGED FROM STRING TO ARRAY ---
    availability: [{
        day: String,       // e.g., "Monday"
        startTime: String, // e.g., "09:00"
        endTime: String    // e.g., "17:00"
    }],
    // ------------------------------------

    googleMeetLink: { type: String, default: '' },
    activeCases: { type: Number, default: 0 },
    totalCases: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Counselor', counselorSchema);