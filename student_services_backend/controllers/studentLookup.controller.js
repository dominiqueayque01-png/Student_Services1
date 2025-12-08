const EnrollmentUser = require('../models/EnrollmentUser.model');

exports.getStudentDetails = async (req, res) => {
    try {
        const { studentId } = req.params;

        // Search the SECONDARY (Enrollment) Database
        const student = await EnrollmentUser.findOne({ studentId: studentId });

        if (!student) {
            return res.status(404).json({ message: "Student ID not found in Enrollment Records." });
        }

        // Return the data, mapping their specific fields to generic ones
        res.json({
            studentId: student.studentId,
            fullName: `${student.firstName} ${student.lastName}`,
            email: student.gmail,         // Mapping 'gmail' -> 'email'
            phone: student.contactNo,     // Mapping 'contactNo' -> 'phone'
            course: student.programOrCourse,
            yearLevel: student.yearLevel,
            section: student.section,
            // Create a combined string for display (e.g., "BSIT 3-G")
            fullSection: `${student.programOrCourse} ${student.yearLevel}-${student.section}`
        });

    } catch (error) {
        console.error("Lookup Error:", error);
        res.status(500).json({ message: "Error connecting to Enrollment DB" });
    }
};