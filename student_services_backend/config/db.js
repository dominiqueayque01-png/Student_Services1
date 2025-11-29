const mongoose = require('mongoose');
require('dotenv').config();

// --- 1. SETUP SECONDARY CONNECTION (Enrollment System) ---
// We create this connection object and export it so models can use it.
const enrollmentConnection = mongoose.createConnection(process.env.MONGO_URI_ENROLLMENT);

enrollmentConnection.on('connected', () => {
    console.log('✅ Connected to Classmate\'s Enrollment DB (Secondary)');
});

enrollmentConnection.on('error', (err) => {
    console.error('❌ Enrollment DB Connection Error:', err);
});

// --- 2. SETUP PRIMARY CONNECTION (Your Student Services) ---
// We wrap this in a function to call it from server.js
const connectMainDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to Student Services DB (Main)');
    } catch (err) {
        console.error('❌ Main DB Connection Error:', err);
        process.exit(1);
    }
};

// Export both: The function to start your DB, and the object for their DB
module.exports = { connectMainDB, enrollmentConnection };