// controllers/counselingReferral.controller.js

const CounselingReferral = require('../models/counselingReferral.model');
// DELETED: const Student = require('../models/Student'); <--- This line caused the crash

// Helper to generate a unique incremental ID (R2025-001)
async function generateReferralId() {
    const today = new Date();
    const year = today.getFullYear();
    const prefix = `R${year}-`;
    
    const latestReferral = await CounselingReferral.findOne({ referralId: new RegExp(`^${prefix}`) })
        .sort({ createdAt: -1 });

    let nextNumber = 1;
    if (latestReferral) {
        const lastIdNumber = parseInt(latestReferral.referralId.split('-')[1]);
        if (!isNaN(lastIdNumber)) nextNumber = lastIdNumber + 1;
    }
    return `${prefix}${String(nextNumber).padStart(3, '0')}`;
}

exports.submitReferral = async (req, res) => {
    try {
        // 1. EXTRACT DATA FROM BODY
        // We now get the Instructor info directly from the form data sent by the frontend
        const { 
            // User Info
            referredBy, 
            instructorName, 
            instructorEmail,

            // Student Info
            studentId, 
            studentName, 
            studentEmail, 
            course, 
            yearLevel, 
            section, 
            
            // Referral Details
            reason, 
            observationDate, 
            additionalNotes
        } = req.body;

        // 2. VALIDATION
        // Check if User ID is present (Security Check)
        if (!referredBy) {
            return res.status(401).json({ message: 'Unauthorized: User not logged in (ID missing).' });
        }

        // Check Required Form Fields
        if (!studentId || !studentName || !reason || !observationDate) {
            return res.status(400).json({ message: 'Please complete all required fields.' });
        }

        // 3. DUPLICATE CHECK
        // Check if THIS instructor referred THIS student in the last 30 days
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const duplicate = await CounselingReferral.findOne({
            studentIdNumber: studentId,
            referredBy: referredBy, // Use the ID we extracted
            createdAt: { $gte: thirtyDaysAgo }
        });

        if (duplicate) {
            return res.status(409).json({ 
                message: 'You already referred this student recently.',
                caseId: duplicate.referralId
            });
        }

        // 4. GENERATE ID & SAVE
        const newReferralId = await generateReferralId();
        
        const newReferral = new CounselingReferral({
            referralId: newReferralId,
            
            // Student Data
            studentIdNumber: studentId,
            studentName,
            studentEmail,
            course,
            yearLevel,
            section,
            
            // Instructor Data (Saved directly)
            referredBy: referredBy, 
            instructorName: instructorName,
            instructorEmail: instructorEmail,
            
            // Referral Data
            reason,
            observationDate,
            additionalNotes
        });

        await newReferral.save();

        res.status(201).json({ 
            message: 'Referral submitted successfully.', 
            referral: newReferral 
        });

    } catch (err) {
        console.error('Error submitting referral:', err);
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

exports.getReferralsByInstructor = async (req, res) => {
    try {
       // if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

      //  const referrals = await CounselingReferral.find({ referredBy: req.user._id })
          //  .sort({ createdAt: -1 });

          const dummyInstructorId = "507f1f77bcf86cd799439011"; 

        const referrals = await CounselingReferral.find({ referredBy: dummyInstructorId })
            .sort({ createdAt: -1 });
            
        res.json(referrals);
    } catch (err) {
        console.error('Error fetching referrals:', err);
        res.status(500).json({ message: 'Server error fetching history.' });
    }
};

// ... existing code ...

// @desc    Get ALL referrals (For Admin Dashboard)
// @route   GET /api/counseling-referrals/admin/all
exports.getAllReferrals = async (req, res) => {
    try {
        // In real app: Check if req.user.role === 'admin'
        
        // Fetch all referrals, sorted by newest first
        // .populate() helps get the Professor's actual name if you used ObjectId
        const referrals = await CounselingReferral.find()
        //.populate('referredBy', 'name email') 
            .sort({ createdAt: -1 });
            
        res.json(referrals);
    } catch (err) {
        console.error('Error fetching admin referrals:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update Status (e.g., Admin accepts referral -> "Acknowledged" or "Session Booked")
// @route   PATCH /api/counseling-referrals/:id/status
exports.updateReferralStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        // ❌ IF YOU HAVE THIS, IT WILL FAIL:
        // const referral = await CounselingReferral.findById(req.params.id);

        // ✅ CHANGE IT TO THIS:
        const referral = await CounselingReferral.findOne({ referralId: req.params.id });

        if (!referral) return res.status(404).json({ message: 'Referral not found' });

        referral.status = status;
        await referral.save();

        res.json({ message: `Status updated to ${status}`, referral });
    } catch (err) {
        res.status(500).json({ message: 'Server error updating status' });
    }
};

// Create a new Appointment (Used when accepting a referral)
exports.createAppointment = async (req, res) => {
    try {
        const { studentId, studentName, counselor, scheduledDateTime, preferredMode, meetingLink, referralId } = req.body;

        const newAppointment = new CounselingAppointment({
            studentId,
            studentName, // Ensure your Model has this field, or use 'studentFullName'
            studentFullName: studentName, // Fallback if your model uses FullName
            counselor,
            scheduledDateTime,
            preferredMode,
            meetingLink,
            status: 'Scheduled',
            referenceContact: { // Standard fields for your model
                preferredMode: preferredMode || 'Face-to-Face',
                contactNumber: 'N/A'
            }
        });

        await newAppointment.save();
        res.status(201).json({ message: 'Appointment created successfully', appointment: newAppointment });

    } catch (error) {
        console.error("Error creating appointment:", error);
        res.status(500).json({ message: 'Server error creating appointment' });
    }
};