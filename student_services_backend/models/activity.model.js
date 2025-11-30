const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const activitySchema = new Schema({
    // --- Key fields for Dashboard Stats ---
    
    // Type of action (e.g., 'created', 'updated', 'registered')
    type: { 
        type: String, 
        required: true, 
        enum: ['created', 'updated', 'registration', 'counseling', 'announcement'] 
    },
    
    // The short summary text displayed on the dashboard
    description: { 
        type: String, 
        required: true 
    },
    
    // Reference to the item that was affected (optional, for linking)
    referenceId: {
        type: Schema.Types.ObjectId,
        required: false 
    },
    
    // --- Timestamp for sorting (CRITICAL for "Recent" activity) ---
    timestamp: { 
        type: Date, 
        default: Date.now 
    }
}, { 
    // Mongoose option to automatically add 'createdAt' and 'updatedAt' fields
    timestamps: true 
});

module.exports = mongoose.model('Activity', activitySchema);