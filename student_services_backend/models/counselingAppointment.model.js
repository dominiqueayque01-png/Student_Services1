const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const appointmentSchema = new Schema({
  // ... (Student Info remains the same) ...
  studentId: { type: String, required: true },
  studentFullName: { type: String, required: true },
  studentPhone: { type: String, required: true },
  studentEmail: { type: String, required: true },

  referenceContact: {
    name: { type: String, required: true },
    relationship: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String }
  },

  // === NEW FIELDS FOR VIRTUAL COUNSELING ===
  preferredMode: { 
    type: String, 
    enum: ['Face-to-Face', 'Virtual'], 
    required: true 
  },
  
  // This will be empty at first. Admin will fill it later when scheduling.
  meetingLink: { type: String, default: '' }, 
  // =========================================

  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Scheduled', 'Rescheduled', 'Cancelled', 'Completed'],
    default: 'Pending'
  },
  
  assignedCounselor: { type: Schema.Types.ObjectId, ref: 'Counselor' },
  scheduledDateTime: { type: Date },
  
  sessionHistory: [
    {
      sessionDate: { type: Date },
      notes: { type: String }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('CounselingAppointment', appointmentSchema);