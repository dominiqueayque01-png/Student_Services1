const Counselor = require('../models/counselors.model');

// 1. Get all counselors
exports.getAllCounselors = async (req, res) => {
    try {
        const counselors = await Counselor.find().sort({ createdAt: -1 });
        res.status(200).json(counselors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. Add a new counselor
exports.createCounselor = async (req, res) => {
    try {
        const newCounselor = new Counselor(req.body);
        const savedCounselor = await newCounselor.save();
        res.status(201).json(savedCounselor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// 3. Update a counselor
exports.updateCounselor = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedCounselor = await Counselor.findByIdAndUpdate(id, req.body, { new: true });
        
        if (!updatedCounselor) return res.status(404).json({ message: "Counselor not found" });
        
        res.status(200).json(updatedCounselor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// 4. Delete a counselor
exports.deleteCounselor = async (req, res) => {
    try {
        const { id } = req.params;
        await Counselor.findByIdAndDelete(id);
        res.status(200).json({ message: "Counselor deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};