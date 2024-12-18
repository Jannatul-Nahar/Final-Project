const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');
require('dotenv').config();

const router = express.Router();

// Registration Route
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if email already exists
        const [rows] = await db.promise().query('SELECT * FROM Users WHERE email = ?', [email]);
        if (rows.length > 0) return res.status(400).json({ message: 'Email already exists.' });

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into database
        await db.promise().query(
            'INSERT INTO Users (name, email, password_hash) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );

        res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed.' });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const [rows] = await db.promise().query('SELECT * FROM Users WHERE email = ?', [email]);
        if (rows.length === 0) return res.status(400).json({ message: 'User not found.' });

        const user = rows[0];

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) return res.status(401).json({ message: 'Invalid credentials.' });

        // Generate JWT Token
        const token = jwt.sign({ id: user.user_id, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });

        res.json({ message: 'Login successful.', token });
    } catch (error) {
        res.status(500).json({ error: 'Login failed.' });
    }
});

module.exports = router;
