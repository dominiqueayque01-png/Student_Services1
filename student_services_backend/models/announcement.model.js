const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const announcementSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, default: 'counseling' } // So you can filter
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);