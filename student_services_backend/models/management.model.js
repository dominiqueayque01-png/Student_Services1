const mongoose = require('mongoose');

const managementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    organizer: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    capacity: { type: String, required: true }, // capacity stored as string
    status: { 
        type: String, 
        enum: ['Pending', 'Published', 'Rejected', 'Archived'], 
        default: 'Pending' 
    },
    category: { type: String, default: "" },
    description: { type: String, default: "" },
    expectations: { type: [String], default: [] }, // enforce array of strings
    requirements: { type: String, default: "" },
    agenda: { type: [String], default: [] },       // enforce array of strings
    imageUrl: { type: String, default: "" },
    organization: { type: String, default: "" }
}, { 
    timestamps: true,
    collection: 'events' // <-- explicitly use 'events' collection
});

module.exports = mongoose.model('Management', managementSchema);
