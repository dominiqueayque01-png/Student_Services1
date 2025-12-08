// createUsers.js
require('dotenv').config(); // Load your .env file
const mongoose = require('mongoose');
const User = require('./models/User.model'); // Adjust path if needed

// 1. Connect to Database
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB...'))
    .catch(err => console.error('❌ Connection Error:', err));

const createAccounts = async () => {
    try {
        // --- DELETE OLD USERS (Optional: Clean slate) ---
        await User.deleteMany({});
        console.log("🧹 Cleared existing users.");

        // --- 2. CREATE TEACHER ACCOUNT ---
        const teacher = await User.create({
            name: "Dr. Juan Dela Cruz",
            email: "teacher@qcu.edu.ph",
            password: "password123", // In real app, hash this!
            role: "teacher",
            department: "IT Department"
        });
        console.log(`👤 Teacher Created: ${teacher.email} / password123`);

        // --- 3. CREATE ADMIN ACCOUNT ---
        const admin = await User.create({
            name: "Admin User",
            email: "admin@qcu.edu.ph",
            password: "adminpassword",
            role: "admin",
            department: "Guidance Office"
        });
        console.log(`🛡️ Admin Created:   ${admin.email} / adminpassword`);

    } catch (error) {
        console.error("Error creating users:", error);
    } finally {
        // Close connection
        mongoose.connection.close();
    }
};

// Run the function
createAccounts();