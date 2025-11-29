const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ojtSchema = new Schema({
    position: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    category: { type: String, default: 'General' },
    
    // === CATEGORY & SUB-CATEGORY ===
    subCategory: { type: String, required: true },
    // ===============================

    // Specific OJT Details
    payPerHour: { type: Number, default: 0 },
    workArrangement: { type: String, required: true },
    duration: { type: Number, required: true },
    hoursPerWeek: { type: Number, required: true },

    description: { type: String, required: true },
    overview: { type: String, required: true },

    // Add the missing fields
    website: { type: String, required: false },
    email: { type: String, required: false },

    skills: [String],

    // Admin fields
    status: { type: String, default: 'active' }, // active, paused
    postedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true // This automatically manages createdAt and updatedAt
});

// Update the updatedAt field before saving
ojtSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('OjtListing', ojtSchema);