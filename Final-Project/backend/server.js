const express = require('express');
const db = require('./db');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const authRoutes = require('./auth');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware for JWT Verification
function verifyToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: 'No token provided.' });

    jwt.verify(token.split(" ")[1], JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Unauthorized.' });
        req.userId = decoded.id;
        next();
    });
}



// 1. Registration Route
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;
    console.log('Registering user:', name, email);

    try {
        // Check if email already exists
        const [rows] = await db.promise().query('SELECT * FROM Users WHERE email = ?', [email]);
        if (rows.length > 0) {
            return res.status(400).json({ message: 'Email already exists.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into database
        await db.promise().query(
            'INSERT INTO Users (name, email, password_hash) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );

        res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed.' });
    }
});


// 2. Login Route
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const [rows] = await db.promise().query('SELECT * FROM Users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(400).json({ message: 'User not found.' });
        }

        const user = rows[0];

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Generate JWT Token
        const token = jwt.sign({ id: user.user_id, email: user.email }, JWT_SECRET, {
            expiresIn: '1h'
        });
        // Send the token and user ID in the response
        const id = user.user_id;
        res.json({ message: 'Login successful.', token, id });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed.' });
    }
});

// Route: GET /api/auth/user
app.get('/api/auth/user', verifyToken, (req, res) => {
    const userId = req.userId;

    // Fetch user details from database
    const query = 'SELECT user_id, name, email FROM users WHERE user_id = ?';
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error("Error fetching user:", err);
            return res.status(500).json({ message: "Error fetching user details." });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "User not found." });
        }

        // Return user details
        const user = results[0];
        res.status(200).json({
            id: user.id,
            name: user.name,
            email: user.email
        });
    });
});


app.post('/api/notes', verifyToken, (req, res) => {
    const { content } = req.body;

    if (!content) {
        return res.status(400).json({ message: "Note content is required." });
    }

    const userId = req.userId; // Extracted from JWT token
    const query = 'INSERT INTO Notes (user_id, content) VALUES (?, ?)';

    db.query(query, [userId, content], (err, result) => {
        if (err) {
            console.error("Error inserting note:", err);
            return res.status(500).json({ message: "Error creating note." });
        }

        res.status(201).json({ message: "Note created successfully!", noteId: result.insertId });
    });
});

app.get('/api/notes', verifyToken, (req, res) => {
    const userId = req.userId;

    const query = 'SELECT id, content, created_at FROM Notes WHERE user_id = ? ORDER BY created_at DESC';
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error("Error fetching notes:", err);
            return res.status(500).json({ message: "Error fetching notes." });
        }

        res.status(200).json({ notes: results });
    });
});

// DELETE /api/notes/:id - Delete a note by ID
app.delete('/api/notes/:id', verifyToken, async (req, res) => {
    try {
        const noteId = req.params.id; // Extract note ID from URL params
        const userId = req.userId;   // Extract user ID from JWT token (from authenticateToken middleware)

        console.log("Deleting note with ID:", noteId);
        console.log("User ID:", userId);

        // Check if note exists
        const [rows] = await db.promise().query('SELECT * FROM Notes WHERE id = ? AND user_id = ?', [noteId, userId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Note not found." });
        }

        // Delete note
        await db.promise().query('DELETE FROM Notes WHERE id = ?', [noteId]);
        res.status(200).json({ message: "Note deleted successfully!" });
    } catch (error) {
        console.error("Error deleting note:", error);
        res.status(500).json({ message: "Server error. Failed to delete note." });
    }
});



app.post('/api/drawings', verifyToken, (req, res) => {
    const {image} = req.body;

    if(!image) {
        return res.status(400).json({message: "Drawing content is required."});
    }

    try{
        const userId = req.userId;
        const query = 'INSERT INTO Drawings (user_id, image) VALUES (?, ?)';
        db.query(query, [userId, image], (err, result) => {
            if(err){
                console.error("Error saving drawing:", err);
                return res.status(500).json({message: "Error saving drawing."});
            }
            res.status(201).json({message: "Drawing saved successfully!"});
        });

    }catch(error){
        console.error("Error saving drawing:", error);
        res.status(500).json({message: "Error saving drawing."});
    }
});

app.get('/api/drawings', verifyToken, (req, res) => {
    console.log("Fetching drawings...");
    const userId = req.userId;
    const query = 'SELECT id, image, created_at FROM Drawings WHERE user_id = ? ORDER BY created_at DESC';
    db.query(query, [userId], (err, results) => {
        if(err){
            console.error("Error fetching drawings:", err);
            return res.status(500).json({message: "Error fetching drawings."});
        }
        res.status(200).json({results});
    });
});




// Route to fetch all users
app.get('/api/users', (req, res) => {
    const sql = 'SELECT * FROM Users';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching users:', err.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.json({ users: results });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
