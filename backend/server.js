const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));
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

// Update profile
app.put('/api/profile', (req, res) => {
    const { name, subtitle } = req.body;
    db.run(
        `UPDATE users SET name = ?, subtitle = ? WHERE id = 1`,
        [name, subtitle],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ success: true });
        }
    );
});

// Upload profile photo
app.post('/api/profile/photo', upload.single('profile_photo'), (req, res) => {
    if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
    }
    
    const photoPath = `/uploads/${req.file.filename}`;
    db.run(
        `UPDATE users SET profile_photo = ? WHERE id = 1`,
        [photoPath],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ success: true, photo_url: photoPath });
        }
    );
});

// Create new fragment
app.post('/api/fragments', upload.single('media'), (req, res) => {
    const { content } = req.body;
    const mediaUrl = req.file ? `/uploads/${req.file.filename}` : null;
    
    db.run(
        `INSERT INTO fragments (user_id, content, media_url) VALUES (?, ?, ?)`,
        [1, content, mediaUrl],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ 
                success: true, 
                fragment: {
                    id: this.lastID,
                    content,
                    media_url: mediaUrl,
                    created_at: new Date().toISOString()
                }
            });
        }
    );
});

// Update currently section
app.put('/api/currently', (req, res) => {
    const { reading, listening } = req.body;
    
    db.run(
        `INSERT OR REPLACE INTO currently (user_id, reading, listening) VALUES (?, ?, ?)`,
        [1, reading, listening],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ success: true });
        }
    );
});

// Get all fragments for a user
app.get('/api/fragments', (req, res) => {
    db.all(`
        SELECT * FROM fragments 
        WHERE user_id = 1 
        ORDER BY created_at DESC
    `, [], (err, fragments) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(fragments);
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 