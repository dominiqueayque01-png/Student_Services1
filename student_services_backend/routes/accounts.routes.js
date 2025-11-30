const express = require("express");
const router = express.Router();
const Account = require('../models/accounts.model');


// GET ALL ACCOUNTS
router.get("/", async (req, res) => {
    const accounts = await Account.find().sort({ dateCreated: -1 });
    res.json(accounts);
});

// CREATE ACCOUNT
router.post("/", async (req, res) => {
    try {
        const newAccount = await Account.create(req.body);
        res.json(newAccount);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// UPDATE ACCOUNT
router.put("/:id", async (req, res) => {
    try {
        const updated = await Account.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE ACCOUNT
router.delete("/:id", async (req, res) => {
    await Account.findByIdAndDelete(req.params.id);
    res.json({ message: "Account deleted" });
});

// RESET PASSWORD
router.patch("/:id/reset", async (req, res) => {
    const updated = await Account.findByIdAndUpdate(
        req.params.id,
        { password: "password123" },
        { new: true }
    );
    res.json({ message: "Password reset successfully", updated });
});

module.exports = router;
