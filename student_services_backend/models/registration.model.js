// models/registration.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Registration schema
const registrationSchema = new Schema({
    studentName: { type: String, required: true },
    studentID: { type: String, required: true },
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    status: { 
        type: String, 
        enum: ['Pending', 'Confirmed', 'Cancelled'], 
        default: 'Pending' 
    },
    registrationDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Registration', registrationSchema);
