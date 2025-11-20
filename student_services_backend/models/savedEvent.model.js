const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const savedEventSchema = new Schema({
    studentId: { type: String, required: true },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true }
});

module.exports = mongoose.model('SavedEvent', savedEventSchema);