const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../fragments')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({ storage: storage });

// Database setup
const db = new sqlite3.Database('./database/fragments.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Initialize database tables
function initializeDatabase() {
    db.serialize(() => {
        // Users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            subtitle TEXT,
            profile_photo TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Posts (Fragments) table
        db.run(`CREATE TABLE IF NOT EXISTS fragments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            content TEXT,
            media_url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )`);

        // Currently table
        db.run(`CREATE TABLE IF NOT EXISTS currently (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            reading TEXT,
            listening TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )`);

        // Insert default user if not exists
        db.get("SELECT id FROM users WHERE id = 1", [], (err, row) => {
            if (!row) {
                db.run(`INSERT INTO users (name, subtitle) VALUES (?, ?)`,
                    ['Hope Gilbert', 'girly girl']);
            }
        });
    });
}

// Basic routes
app.get('/api/profile', (req, res) => {
    db.get(`
        SELECT u.*, 
               c.reading, 
               c.listening,
               COUNT(DISTINCT f.id) as fragment_count
        FROM users u
        LEFT JOIN currently c ON u.id = c.user_id
        LEFT JOIN fragments f ON u.id = f.user_id
        WHERE u.id = 1
        GROUP BY u.id
    `, [], (err, profile) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(profile);
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 