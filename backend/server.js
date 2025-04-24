const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const util = require('util');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// Configure static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    setHeaders: (res, path) => {
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
}));

// Configure static file serving for images
app.use('/images', express.static(path.join(__dirname, 'images'), {
    setHeaders: (res, path) => {
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
}));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, 'uploads');
        // Ensure upload directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max file size
    }
});

// Database setup
const db = new sqlite3.Database(path.join(__dirname, 'database', 'fragments.db'), (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
        // Enable foreign keys and set journal mode
        db.run('PRAGMA foreign_keys = ON');
        db.run('PRAGMA journal_mode = WAL');
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
            feeling TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Posts (Fragments) table
        db.run(`CREATE TABLE IF NOT EXISTS fragments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            content TEXT,
            media_url TEXT,
            draft BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
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
                    ['Hope Gilbert', 'girly girl'],
                    function(err) {
                        if (err) {
                            console.error('Error creating default user:', err);
                        }
                    });
            }
        });
    });
}

// Get user profile
app.get('/api/profile', (req, res) => {
    db.get(`
        SELECT 
            u.*,
            (SELECT COUNT(*) FROM fragments WHERE user_id = u.id AND draft = 0) as fragment_count
        FROM users u
        WHERE u.id = 1
    `, [], (err, profile) => {
        if (err) {
            console.error('Error fetching profile:', err);
            return res.status(500).json({ 
                success: false, 
                error: err.message 
            });
        }
        
        if (!profile) {
            return res.status(404).json({ 
                success: false, 
                error: 'User not found' 
            });
        }

        // Ensure all required fields exist
        const formattedProfile = {
            id: profile.id,
            name: profile.name || '',
            subtitle: profile.subtitle || '',
            profile_photo: profile.profile_photo || '/images/default-profile.jpg',
            fragment_count: profile.fragment_count || 0,
            feeling: profile.feeling || null,
            created_at: profile.created_at
        };

        res.json({ 
            success: true, 
            ...formattedProfile
        });
    });
});

// Update user profile
app.put('/api/profile', (req, res) => {
    const { name, subtitle, feeling } = req.body;

    if (name === undefined && subtitle === undefined && feeling === undefined) {
        res.status(400).json({ success: false, error: 'No update data provided' });
        return;
    }

    const updates = [];
    const values = [];

    if (name !== undefined) {
        updates.push('name = ?');
        values.push(name);
    }
    if (subtitle !== undefined) {
        updates.push('subtitle = ?');
        values.push(subtitle);
    }
    if (typeof feeling === 'string') {
        updates.push('feeling = ?');
        values.push(feeling);
    }

    if (updates.length > 0) {
        const updateQuery = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
        values.push(1);
        console.log('Running query:', updateQuery);
        console.log('With values:', values);
        db.run(updateQuery, values, function (err) {
            if (err) {
                console.error('Error updating profile:', err);
                return res.status(500).json({ success: false, error: 'Failed to update profile' });
            }

            console.log('Update ran successfully with:', { name, subtitle, feeling });

            db.get('SELECT * FROM users WHERE id = 1', [], (err, profile) => {
                if (err) {
                    return res.status(500).json({ success: false, error: 'Failed to fetch updated profile' });
                }
                console.log('Fetched profile after update:', profile);
                res.json({ success: true, profile });
            });
        });
    }
});

// Upload profile photo
app.post('/api/profile/photo', upload.single('profile_photo'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const photoPath = `/uploads/${req.file.filename}`;
    
    db.run(
        'UPDATE users SET profile_photo = ? WHERE id = 1',
        [photoPath],
        function(err) {
            if (err) {
                console.error('Error updating profile photo:', err);
                return res.status(500).json({ success: false, error: err.message });
            }
            res.json({ success: true, photo_url: photoPath });
        }
    );
});

// Create new fragment as a draft (draft = 1 by default)
app.post('/api/fragments', upload.single('media'), (req, res) => {
    const { content } = req.body;
    const mediaUrl = req.file ? `/uploads/${req.file.filename}` : null;

    db.run(
        'INSERT INTO fragments (user_id, content, media_url, draft) VALUES (?, ?, ?, 1)', // Save as draft by default
        [1, content, mediaUrl],
        function(err) {
            if (err) {
                console.error('Error creating fragment:', err);
                return res.status(500).json({ success: false, error: err.message });
            }

            // Return full fragment
            db.get(`SELECT * FROM fragments WHERE id = ?`, [this.lastID], (err, row) => {
                if (err) {
                    return res.status(500).json({ success: false, error: err.message });
                }
                res.json({ success: true, fragment: row });
            });
        }
    );
});

// Update fragment (with support for content, media, and remove_media)
app.put('/api/fragments/:id', upload.single('media'), (req, res) => {
    const { id } = req.params;
    // Use form-data for update, so fields are in req.body, file in req.file
    const content = req.body.content;
    const removeMedia = req.body.remove_media === 'true';
    let newMediaUrl = null;

    if (!content) {
        return res.status(400).json({ success: false, error: 'Content is required' });
    }

    // Get current fragment to check for existing media
    db.get('SELECT * FROM fragments WHERE id = ? AND user_id = 1', [id], (err, fragment) => {
        if (err) {
            console.error('Error fetching fragment for update:', err);
            return res.status(500).json({ success: false, error: err.message });
        }
        if (!fragment) {
            return res.status(404).json({ success: false, error: 'Fragment not found' });
        }

        // If new file uploaded, set new media_url and delete old file if present
        if (req.file) {
            newMediaUrl = `/uploads/${req.file.filename}`;
            if (fragment.media_url && fragment.media_url.startsWith('/uploads/')) {
                // Remove the old file
                const oldPath = path.join(__dirname, fragment.media_url);
                fs.unlink(oldPath, err => { /* ignore errors */ });
            }
        } else if (removeMedia) {
            // Remove the old file if present
            if (fragment.media_url && fragment.media_url.startsWith('/uploads/')) {
                const oldPath = path.join(__dirname, fragment.media_url);
                fs.unlink(oldPath, err => { /* ignore errors */ });
            }
            newMediaUrl = null;
        } else {
            // Keep current media_url
            newMediaUrl = fragment.media_url;
        }

        const updateQuery = `UPDATE fragments SET content = ?, media_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = 1`;
        db.run(updateQuery, [content, newMediaUrl, id], function (err) {
            if (err) {
                console.error('Error updating fragment:', err);
                return res.status(500).json({ success: false, error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ success: false, error: 'Fragment not found' });
            }
            db.get('SELECT * FROM fragments WHERE id = ?', [id], (err, row) => {
                if (err) {
                    return res.status(500).json({ success: false, error: err.message });
                }
                res.json({ success: true, fragment: row });
            });
        });
    });
});

// Delete fragment and its media file if present
app.delete('/api/fragments/:id', (req, res) => {
    const { id } = req.params;
    // Get fragment first to check for media file
    db.get('SELECT * FROM fragments WHERE id = ? AND user_id = 1', [id], (err, fragment) => {
        if (err) {
            console.error('Error fetching fragment for delete:', err);
            return res.status(500).json({ success: false, error: err.message });
        }
        if (!fragment) {
            return res.status(404).json({ success: false, error: 'Fragment not found' });
        }
        // Delete the fragment
        db.run('DELETE FROM fragments WHERE id = ? AND user_id = 1', [id], function(err) {
            if (err) {
                console.error('Error deleting fragment:', err);
                return res.status(500).json({ success: false, error: err.message });
            }
            // Remove media file if present
            if (fragment.media_url && fragment.media_url.startsWith('/uploads/')) {
                const filePath = path.join(__dirname, fragment.media_url);
                fs.unlink(filePath, err => { /* ignore errors */ });
            }
            res.status(204).send();
        });
    });
});

// Get all fragments for a user (excluding drafts)
app.get('/api/fragments', (req, res) => {
    db.all(`
        SELECT f.*, 
               COUNT(r.id) as reaction_count 
        FROM fragments f 
        LEFT JOIN reactions r ON f.id = r.fragment_id
        WHERE f.user_id = 1 AND f.draft = 0
        GROUP BY f.id
        ORDER BY f.created_at DESC
    `, [], (err, fragments) => {
        if (err) {
            console.error('Error fetching fragments:', err);
            res.status(500).json({ success: false, error: err.message });
            return;
        }
        res.json({ success: true, fragments: fragments || [] });
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
// Get all drafts for a user
app.get('/api/fragments/drafts', (req, res) => {
    db.all(`
        SELECT f.*, 
               COUNT(r.id) as reaction_count 
        FROM fragments f 
        LEFT JOIN reactions r ON f.id = r.fragment_id
        WHERE f.user_id = 1 AND f.draft = 1
        GROUP BY f.id
        ORDER BY f.created_at DESC
    `, [], (err, drafts) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ success: true, drafts: drafts || [] });
    });
});

app.post('/api/fragments/drafts', (req, res) => {
    const { content, media_url } = req.body;
    db.run('INSERT INTO fragments (user_id, content, media_url, draft) VALUES (?, ?, ?, 1)',
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
    db.run('UPDATE fragments SET draft = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = 1',
        [id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ success: true });
        });
});

// Error handler for multer
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'File size is too large. Maximum size is 5MB.'
            });
        }
        return res.status(400).json({
            success: false,
            error: err.message
        });
    }
    next(err);
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
// Save fragment to drafts (draft=1)
app.post('/api/fragments/save_to_drafts', (req, res) => {
    const { content, media_url } = req.body;
    // Allow saving draft with either content or media_url
    if (!content && !media_url) {
        return res.status(400).json({ error: 'Content or media_url is required' });
    }
    db.run(
        `INSERT INTO fragments (user_id, content, media_url, draft) VALUES (?, ?, ?, 1)`,
        [1, content || null, media_url || null],
        function (err) {
            if (err) {
                console.error('Error saving fragment to drafts:', err);
                return res.status(500).json({ error: 'Failed to save fragment to drafts' });
            }
            db.get(`SELECT * FROM fragments WHERE id = ?`, [this.lastID], (err, row) => {
                if (err) {
                    return res.status(500).json({ error: 'Failed to retrieve saved draft' });
                }
                res.json({ success: true, draft: row });
            });
        }
    );
});
// Publish draft fragment (set draft = 0)
app.put('/api/fragments/:id/publish', (req, res) => {
    const { id } = req.params;
    db.run('UPDATE fragments SET draft = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = 1',
        [id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ success: true });
        });
});