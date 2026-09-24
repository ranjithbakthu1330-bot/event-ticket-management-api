require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database'); 
const { authenticateToken, isAdmin } = require('./middleware');
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); 

// --- ROUTE 1: REGISTER ---
app.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const sql = `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`;
        const userRole = role === 'admin' ? 'admin' : 'user'; // Default to user
        
        db.run(sql, [name, email, hashedPassword, userRole], function(err) {
            if (err) {
                return res.status(400).json({ error: "Email already exists or database error." });
            }
            res.status(201).json({ message: "User registered successfully", userId: this.lastID });
        });
    } catch (error) {
        res.status(500).json({ error: "Server error during registration." });
    }
});

// --- ROUTE 2: LOGIN ---
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    
    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
        if (err || !user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        
        const token = jwt.sign(
            { id: user.id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '2h' }
        );
        
        res.json({ message: "Login successful", token, role: user.role });
    });
});
// Import the middleware at the top of server.js (with your other requires)
const { authenticateToken, isAdmin } = require('./middleware');

// --- ROUTE 3: CREATE EVENT (Admin Only) ---
app.post('/events', authenticateToken, isAdmin, (req, res) => {
    const { title, date, venue, price, capacity } = req.body;
    
    // Basic validation
    if (!title || !date || !venue || !price || !capacity) {
        return res.status(400).json({ error: "All fields are required." });
    }

    const sql = `INSERT INTO events (title, date, venue, price, capacity) VALUES (?, ?, ?, ?, ?)`;
    
    db.run(sql, [title, date, venue, price, capacity], function(err) {
        if (err) {
            return res.status(500).json({ error: "Failed to create event." });
        }
        res.status(201).json({ message: "Event created successfully", eventId: this.lastID });
    });
});

// --- ROUTE 4: VIEW ALL EVENTS (All Authenticated Users) ---
app.get('/events', authenticateToken, (req, res) => {
    db.all(`SELECT * FROM events`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: "Failed to fetch events." });
        }
        res.json(rows);
    });
});
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
