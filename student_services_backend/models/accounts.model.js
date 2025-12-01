const mongoose = require("mongoose");

const AccountSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    clubname: { type: String, required: true },
    dateCreated: { type: Date, default: Date.now },
    password: { type: String, default: "password123" } // You can hash this later
});

module.exports = mongoose.model("Account", AccountSchema);
