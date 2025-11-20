const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    message: { type: String, required: true },
    type: { type: String, enum: ['global', 'personal'], default: 'personal' },
    studentId: { type: String }, // Only required if type is 'personal'
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);