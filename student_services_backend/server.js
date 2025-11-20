// --- 1. IMPORT YOUR TOOLS ---
// We're using the "CommonJS" import syntax (const express = require('express'))
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// --- 2. INITIALIZE YOUR APP ---
// We create an instance of express
const app = express();

// --- 3. CONFIGURE MIDDLEWARE ---
// 'cors' allows your React frontend to make requests to this server
app.use(cors()); 
// 'express.json' allows your server to understand JSON data sent in requests
app.use(express.json()); 



// --- 4. CONNECT TO MONGODB ---
// !!! REPLACE THIS STRING WITH YOUR OWN FROM MONGODB ATLAS !!!
const mongoURI = "mongodb+srv://ayquejohndominiquegascon_db_user:DYUJGnCcz42xNtTw@studentservices.ecppxho.mongodb.net/?appName=StudentServices";

mongoose.connect(mongoURI)
  .then(() => {
    // This message will print in your terminal if the connection is successful
    console.log('Successfully connected to MongoDB Atlas!');
  })
  .catch(err => {
    // This message will print if the connection fails
    console.error('MongoDB connection error:', err);
  });

// --- 5. IMPORT & USE YOUR ROUTES ---
// This is where we "plug in" all the route files you will create.
// We'll add these as we build them.

// Make sure each route is required ONLY ONCE
// --- 5. IMPORT & USE YOUR ROUTES ---
const clubRoutes = require('./routes/club.routes.js');
const eventRoutes = require('./routes/event.routes.js');
const ojtRoutes = require('./routes/ojt.routes.js');
const counselingRoutes = require('./routes/counseling.routes.js');
const adminCounselingRoutes = require('./routes/adminCounseling.routes');
const clubApplicationRoutes = require('./routes/clubApplication.routes.js'); 
const eventRegistrationRoutes = require('./routes/eventRegistration.routes.js'); 
const announcementRoutes = require('./routes/announcement.routes.js'); 
const faqRoutes = require('./routes/faq.routes.js');
const savedEventRoutes = require('./routes/savedEvent.routes.js');
const notificationRoutes = require('./routes/notification.routes.js');



// Tell Express to use each route ONLY ONCE
app.use('/api/clubs', clubRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/ojt', ojtRoutes);
app.use('/api/counseling', counselingRoutes); 
app.use('/api/admin/counseling', adminCounselingRoutes); 
app.use('/api/applications', clubApplicationRoutes); 
app.use('/api/registrations', eventRegistrationRoutes);
app.use('/api/announcements', announcementRoutes); // <-- ADD THIS
app.use('/api/faqs', faqRoutes);
app.use('/api/saved-events', savedEventRoutes);
app.use('/api/notifications', require('./routes/notification.routes.js'));






// --- 6. START THE SERVER ---
// We choose a port for our server to run on
const PORT = 3001; // 3000 is common, but React often uses it. 3001 is a safe choice.

app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
    console.log('---');
    console.log('Available routes:');
    console.log(`  [GET] http://localhost:${PORT}/api/announcements`);
    console.log(`  [GET] http://localhost:${PORT}/api/faqs`);
    console.log(`  [POST] http://localhost:${PORT}/api/admin/counseling/appointments`);
    console.log(`  [GET] http://localhost:${PORT}/api/counseling/my-appointments/:studentId`);
    console.log('---');
});