    const mongoose = require('mongoose');
    const Schema = mongoose.Schema;

    const applicationSchema = new Schema({
    clubId: { type: Schema.Types.ObjectId, ref: 'Club', required: true },
    
    // === ADD THIS FIELD ===
    studentId: { type: String, required: true },
    // =====================

    fullName: { type: String, required: true },
    year: { type: String, required: true },
    motive: { type: String, required: true },
    program: { type: String, required: true },
    email: { type: String, required: true },
    experience: { type: String },
    
    status: { type: String, default: 'Pending' },
    appliedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ClubApplication', applicationSchema);  