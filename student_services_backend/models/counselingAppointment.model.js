const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const appointmentSchema = new Schema({
  // Student Info
  studentId: { type: String, required: true },
  studentFullName: { type: String, required: true },
  studentPhone: { type: String, required: true },
  studentEmail: { type: String, required: true },

  // Reference Contact Info
  referenceContact: {
    name: { type: String },
    relationship: { type: String },
    phone: { type: String },
    email: { type: String }
  },

  preferredMode: { type: String }, // Face-to-Face or Online

  // Appointment Info
  status: {
    type: String,
    enum: ['Pending', 'Scheduled', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  
  // Admin Fields
  counselor: { type: String, default: 'N/A' }, // Name of assigned counselor
  scheduledDateTime: { type: Date }, // The actual approved date/time

  
  
  // Session Tracking
  totalSessions: { type: Number, default: 0 },
  initialSessionDate: { type: String, default: 'N/A' },
  lastSessionDate: { type: String, default: 'N/A' },
  
  meetingLink: { type: String, default: '' },

  // Admin Notes
  notes: { type: String }

}, { timestamps: true });

module.exports = mongoose.model('CounselingAppointment', appointmentSchema);