// createUser.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user.model'); // Ensure this path matches your folder structure

async function runSeeder() {
    try {
        // 1. Connect to Database
        console.log("🔌 Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected!");

        // 2. Clear Old Data (Optional)
        console.log("🧹 Clearing old users...");
        await User.deleteMany({}); 

        // 3. Create Teacher
        const teacher = await User.create({
            name: "Dr. Juan Dela Cruz",
            email: "teacher@qcu.edu.ph",
            password: "password123", // Simple password for now
            role: "teacher",
            department: "IT Department"
        });
        console.log(`👤 Teacher Created: ${teacher.email}`);

        // 4. Create Admin
        const admin = await User.create({
            name: "Admin User",
            email: "admin@qcu.edu.ph",
            password: "adminpassword",
            role: "admin",
            department: "Guidance Office"
        });
        console.log(`🛡️ Admin Created:   ${admin.email}`);

    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        // 5. Close Connection
        console.log("👋 Closing connection...");
        mongoose.connection.close();
    }
}

// Run the script
runSeeder();