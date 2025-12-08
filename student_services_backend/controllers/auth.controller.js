const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

// Secret Key (In real life, put this in .env)
const JWT_SECRET = 'my_super_secret_key_123'; 

// 1. REGISTER (Use this to create your first teacher account via Postman)
exports.register = async (req, res) => {
    try {
        const { name, email, password, department } = req.body;
        // Simple create (In production, you MUST hash the password with bcrypt)
        const user = await User.create({ name, email, password, department });
        res.status(201).json({ message: "User created!", user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. LOGIN
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Check Password (Direct comparison for now - switch to bcrypt later!)
        if (user.password !== password) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate Token
        const token = jwt.sign(
            { id: user._id, role: user.role, name: user.name, email: user.email }, 
            JWT_SECRET, 
            { expiresIn: '1d' }
        );

        res.json({
            message: "Login successful",
            token: token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};