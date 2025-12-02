const express = require('express');
const router = express.Router();
const EventRegistration = require('../models/eventRegistration.model');
const Event = require('../models/event.model');
const Notification = require('../models/notification.model'); // <--- Restored Notification Model
const EnrollmentUser = require('../models/EnrollmentUser.model');   // <--- This is the file you just created in Step 1

// ==========================================
// ADMIN ROUTES
// ==========================================

// 1. ADMIN: GET ALL REGISTRATIONS (With Student & Event Details)
// REPLACE your router.get('/admin/all'...) with this:

router.get('/admin/all', async (req, res) => {
    console.log("--- Starting Admin Registration Fetch ---");
    
    try {
        // 1. Fetch all local registrations
        const registrations = await EventRegistration.find().sort({ createdAt: -1 });
        console.log(`1. Found ${registrations.length} registrations locally.`);

        if (registrations.length === 0) {
            return res.json([]); // Return empty list if no registrations
        }

        // 2. Loop through them safely
        const populatedRegistrations = await Promise.all(registrations.map(async (reg) => {
            // Default Values (Safe Fallbacks)
            let eventTitle = reg.eventTitle || "Unknown Event";
            let studentName = "Unknown Student";
            let email = "N/A";
            let phone = "N/A";
            let category = "Academic";
            let organizer = "QCU";

            // A. Try to fetch Event Details (Local DB)
            if (reg.eventId) {
                try {
                    const event = await Event.findById(reg.eventId);
                    if (event) {
                        eventTitle = event.title;
                        category = event.category;
                        organizer = event.organizer;
                    }
                } catch (err) {
                    console.log(`   > Warning: Could not find event ${reg.eventId}`);
                }
            }

            // B. Try to fetch Student Details (Classmate's DB)
            if (reg.studentId) {
                try {
                    // console.log(`   > Looking for student ID: ${reg.studentId}...`);
                    const student = await EnrollmentUser.findOne({ studentId: reg.studentId });
                    
                    if (student) {
                        // SUCCESS: Found the student
                        studentName = `${student.firstName} ${student.lastName}`;
                        email = student.gmail || "N/A";
                        phone = student.contactNo|| "N/A";
                    } else {
                        // FAIL: Student ID not found in their DB
                        studentName = `Student ID: ${reg.studentId} (Not Found)`;
                    }
                } catch (err) {
                    console.log(`   > CRITICAL: Error connecting to Enrollment DB for student ${reg.studentId}:`, err.message);
                    studentName = "DB Connection Error";
                }
            }

            // Return the safe object
            return {
                _id: reg._id,
                studentId: reg.studentId,
                studentName,
                email,
                phone,
                event: eventTitle,
                organizer,
                category,
                registrationDate: reg.createdAt,
                status: reg.status || 'Confirmed'
            };
        }));

        console.log("--- Finished Fetching. Sending Data. ---");
        res.json(populatedRegistrations);

    } catch (err) {
        console.error("!!! SERVER CRASHED IN /admin/all !!!");
        console.error(err);
        res.status(500).json({ message: "Backend Error: " + err.message });
    }
});

// 2. ADMIN: UPDATE REGISTRATION (Edit Details/Status)
router.patch('/:id', async (req, res) => {
    try {
        const updatedReg = await EventRegistration.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updatedReg);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// 3. ADMIN: CANCEL REGISTRATION
router.delete('/:id', async (req, res) => {
    try {
        await EventRegistration.findByIdAndDelete(req.params.id);
        res.json({ message: "Registration cancelled" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ==========================================
// STUDENT ROUTES
// ==========================================

// 4. STUDENT: REGISTER (With Notification)
router.post('/', async (req, res) => {
    const { eventId, eventTitle, studentId } = req.body;

    try {
        // Check for existing
        const existing = await EventRegistration.findOne({ eventId, studentId });
        if (existing) {
            return res.status(400).json({ message: "You have already registered for this event." });
        }

        // Create Registration
        const registration = new EventRegistration({
            eventId,
            eventTitle,
            studentId,
            status: 'Confirmed'
        });

        const newRegistration = await registration.save();

        // --- RESTORED NOTIFICATION LOGIC ---
        const notif = new Notification({
            message: `Your enrollment for "${eventTitle}" has been confirmed`,
            type: 'personal',
            studentId: studentId
        });
        await notif.save();
        // -----------------------------------

        res.status(201).json(newRegistration);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

// 5. STUDENT: GET MY REGISTRATIONS
router.get('/my-registrations/:studentId', async (req, res) => {
    try {
        const registrations = await EventRegistration.find({ studentId: req.params.studentId });
        res.json(registrations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;