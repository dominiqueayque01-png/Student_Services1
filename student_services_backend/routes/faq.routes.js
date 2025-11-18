const express = require('express');
const router = express.Router();
const Faq = require('../models/faq.model');

// GET all counseling FAQs
router.get('/', async (req, res) => {
    try {
        const faqs = await Faq.find({ category: 'counseling' });
        res.json(faqs);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST a new FAQ (for an admin)
router.post('/', async (req, res) => {
    const item = new Faq({
        question: req.body.question,
        answer: req.body.answer
    });
    try {
        const newItem = await item.save();
        res.status(201).json(newItem);
    } catch (err) { res.status(400).json({ message: err.message }); }
});
module.exports = router;