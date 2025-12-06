const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const counselingAnnouncementSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    // Add Status field so Admin can Approve/Reject
    status: { 
        type: String, 
        default: 'Pending',
        enum: ['Pending', 'Published', 'Rejected'] 
    },
    author: { type: String, default: 'Counseling Admin' }
}, { timestamps: true });

module.exports = mongoose.model('CounselingAnnouncement', counselingAnnouncementSchema);