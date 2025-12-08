const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, 
    role: { type: String, default: 'teacher' }, // 'teacher' or 'admin'
    department: { type: String, default: 'General' }
}, { timestamps: true });

// CRITICAL: This line exports the model so createUser.js can use it
module.exports = mongoose.model('User', UserSchema);