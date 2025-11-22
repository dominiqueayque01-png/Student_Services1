// --- 1. IMPORT YOUR TOOLS ---
require('dotenv').config(); // <--- NEW: Load environment variables first!
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// --- 2. INITIALIZE YOUR APP ---
const app = express();

// --- 3. CONFIGURE MIDDLEWARE ---
app.use(cors()); 
app.use(express.json()); 

// --- 4. CONNECT TO MONGODB ---
// We use process.env to get the secret string
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
    console.error("FATAL ERROR: MONGO_URI is not defined in .env file.");
    process.exit(1);
}

mongoose.connect(mongoURI)
  .then(() => {
    console.log('Successfully connected to MongoDB Atlas!');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

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
app.use('/api/announcements', announcementRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/saved-events', savedEventRoutes);
app.use('/api/notifications', notificationRoutes);


// --- 6. START THE SERVER ---
const PORT = process.env.PORT || 3001; // Use .env port or default to 3001

app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
    console.log('---');
    console.log('Available routes loaded.');
});
