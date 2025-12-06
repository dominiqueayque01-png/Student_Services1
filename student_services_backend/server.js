// --- 1. IMPORT YOUR TOOLS ---
require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { connectMainDB } = require('./config/db');
const activityRoutes = require('./routes/activity.routes');

// --- 2. INITIALIZE YOUR APP ---
const app = express();

// --- 3. CONFIGURE MIDDLEWARE ---
app.use(cors()); 
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- 4. CONNECT TO MONGODB ---
connectMainDB();

// --- 5. IMPORT ROUTE FILES ---
const clubRoutes = require('./routes/club.routes.js');
const eventRoutes = require('./routes/event.routes.js');
const ojtRoutes = require('./routes/ojt.routes.js');

// --- FIX: Don't import the model here, import the route (if you have one) ---
// const counselingAppointments = require('./models/counselingAppointment.model.js'); // REMOVED (Caused Bug)

// --- NEW: Import the Counselors Route ---
const counselorRoutes = require('./routes/counselors.routes.js'); 
const counselingRoutes = require('./routes/counseling.routes.js');
const adminCounselingRoutes = require('./routes/adminCounseling.routes');
const clubApplicationRoutes = require('./routes/clubApplication.routes.js'); 
const eventRegistrationRoutes = require('./routes/eventRegistration.routes.js'); 
const announcementRoutes = require('./routes/announcement.routes.js'); 
const faqRoutes = require('./routes/faq.routes.js');
const savedEventRoutes = require('./routes/savedEvent.routes.js');
const notificationRoutes = require('./routes/notification.routes.js');
const dashboardRoutes = require('./routes/dashboard.routes.js'); 
const accountRoutes = require("./routes/accounts.routes.js");
const eventAnnouncementRoutes = require('./routes/eventAnnouncement.routes');
const counselingAnnouncementRoutes = require('./routes/counselingAnnouncement.routes');

// --- 5B. USE YOUR ROUTES ---
app.use('/api/clubs', clubRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/ojt', ojtRoutes);

// --- NEW: Enable the Counselors Route ---
app.use('/api/counselors', counselorRoutes); 

// app.use('/api/counseling-appointments', counselingAppointments); // COMMENTED OUT (Fix this when you create the appointment routes)
    
app.use('/api/counseling', counselingRoutes); 
app.use('/api/admin/counseling', adminCounselingRoutes); 
app.use('/api/applications', clubApplicationRoutes); 
app.use('/api/registrations', eventRegistrationRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/saved-events', savedEventRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes); 
app.use('/api', activityRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/event-announcements', eventAnnouncementRoutes); // URL A
app.use('/api/counseling-announcements', counselingAnnouncementRoutes); // URL B



// --- 6. START THE SERVER ---
const PORT = process.env.PORT || 3001; 

app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
    console.log('---');
    console.log('Available routes loaded.');
});