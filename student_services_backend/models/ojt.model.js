const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ojtSchema = new Schema({
    position: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    category: { type: String, default: 'General' }, // e.g. Marketing, Tech

    // === CATEGORY & SUB-CATEGORY ===
    category: { type: String, default: 'General' }, // Broad (e.g., Technology)
    subCategory: { type: String, required: true },  // Specific (e.g., Web Development)
    // ===============================
    
    // Specific OJT Details
    payPerHour: { type: Number, default: 0 },
    workArrangement: { type: String, required: true }, // Remote, Hybrid, On-site
    duration: { type: Number, required: true }, // in weeks
    hoursPerWeek: { type: Number, required: true },
    
    description: { type: String, required: true },
    overview: { type: String, required: true },
    trainingProgram: { type: String },
    
    skills: [String], // Array of strings: ['SEO', 'Java']
    
    postedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('OjtListing', ojtSchema);