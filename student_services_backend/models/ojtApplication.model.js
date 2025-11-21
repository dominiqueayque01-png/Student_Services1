const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ojtAppSchema = new Schema({
    ojtId: { type: Schema.Types.ObjectId, ref: 'OjtListing', required: true },
    studentId: { type: String, required: true },
    
    // Optional: Resume link, cover letter, etc.
    // For now we just track that they applied
    status: { type: String, default: 'Pending' }, // Pending, Accepted, Rejected
    appliedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('OjtApplication', ojtAppSchema);