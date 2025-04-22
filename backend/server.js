const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3003;

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
            is_draft BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
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

        // Collections table
        db.run(`CREATE TABLE IF NOT EXISTS collections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            name TEXT NOT NULL,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )`);

        // Collection items table
        db.run(`CREATE TABLE IF NOT EXISTS collection_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            collection_id INTEGER,
            fragment_id INTEGER,
            added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (collection_id) REFERENCES collections (id),
            FOREIGN KEY (fragment_id) REFERENCES fragments (id)
        )`);

        // Reactions table
        db.run(`CREATE TABLE IF NOT EXISTS reactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            fragment_id INTEGER,
            type TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (fragment_id) REFERENCES fragments (id),
            UNIQUE(user_id, fragment_id, type)
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
        LEFT JOIN fragments f ON u.id = f.user_id AND f.is_draft = 0
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
    const { content, is_draft } = req.body;
    const mediaUrl = req.file ? `/uploads/${req.file.filename}` : null;
    
    db.run(
        `INSERT INTO fragments (user_id, content, media_url, is_draft) VALUES (?, ?, ?, ?)`,
        [1, content, mediaUrl, is_draft || 0],
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
                    is_draft: is_draft || 0,
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
        WHERE user_id = 1 AND is_draft = 0
        ORDER BY created_at DESC
    `, [], (err, fragments) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(fragments);
    });
});

// Collections endpoints
app.get('/api/collections', (req, res) => {
    db.all('SELECT * FROM collections WHERE user_id = 1', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/collections', (req, res) => {
    const { name, description } = req.body;
    db.run('INSERT INTO collections (user_id, name, description) VALUES (?, ?, ?)',
        [1, name, description],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID });
        });
});

app.post('/api/collections/:collectionId/fragments/:fragmentId', (req, res) => {
    const { collectionId, fragmentId } = req.params;
    db.run('INSERT INTO collection_items (collection_id, fragment_id) VALUES (?, ?)',
        [collectionId, fragmentId],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID });
        });
});

// Reactions endpoints
app.post('/api/fragments/:id/reactions', (req, res) => {
    const { id } = req.params;
    const { type } = req.body;
    db.run('INSERT INTO reactions (user_id, fragment_id, type) VALUES (?, ?, ?)',
        [1, id, type],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID });
        });
});

app.delete('/api/fragments/:id/reactions/:type', (req, res) => {
    const { id, type } = req.params;
    db.run('DELETE FROM reactions WHERE user_id = ? AND fragment_id = ? AND type = ?',
        [1, id, type],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ success: true });
        });
});

// Drafts endpoints
app.get('/api/fragments/drafts', (req, res) => {
    db.all('SELECT * FROM fragments WHERE user_id = 1 AND is_draft = 1', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/fragments/drafts', (req, res) => {
    const { content, media_url } = req.body;
    db.run('INSERT INTO fragments (user_id, content, media_url, is_draft) VALUES (?, ?, ?, 1)',
        [1, content, media_url],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID });
        });
});

app.put('/api/fragments/:id/publish', (req, res) => {
    const { id } = req.params;
    db.run('UPDATE fragments SET is_draft = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = 1',
        [id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ success: true });
        });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 