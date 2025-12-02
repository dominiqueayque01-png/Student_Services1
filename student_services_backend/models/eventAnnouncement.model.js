const mongoose = require('mongoose');

const eventAnnouncementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    // Status: Pending (Default), Published, Rejected
    status: { 
        type: String, 
        default: 'Pending',
        enum: ['Pending', 'Published', 'Rejected'] 
    },
    author: { type: String, default: 'Event Admin' },
}, { timestamps: true }); 

// This will create a collection named 'eventannouncements' (plural, lowercase) in MongoDB
module.exports = mongoose.model('EventAnnouncement', eventAnnouncementSchema);