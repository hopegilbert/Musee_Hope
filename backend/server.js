const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const util = require('util');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3003;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// Session middleware
app.use(session({
    store: new SQLiteStore({
        db: 'sessions.db',
        table: 'sessions'
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax'
    }
}));

// Import routes and database
const authRoutes = require('./routes/auth');
const { db } = require('./database');

// Use routes
app.use('/api/auth', authRoutes);

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

// Start the server
const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err);
            } else {
                console.log('Database connection closed');
            }
            process.exit(0);
        });
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err);
            } else {
                console.log('Database connection closed');
            }
            process.exit(0);
        });
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, error: 'Something broke!' });
});

// API Routes
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
            console.error('Error fetching drafts:', err);
            return res.status(500).json({ success: false, error: err.message });
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
                return res.status(500).json({ success: false, error: err.message });
            }
            res.json({ success: true, id: this.lastID });
        });
});

app.put('/api/fragments/:id/publish', (req, res) => {
    const { id } = req.params;
    db.run('UPDATE fragments SET draft = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = 1',
        [id],
        function(err) {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            res.json({ success: true });
        });
});

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

// Create new fragment (accepts draft flag: 0 = published, 1 = draft)
app.post('/api/fragments', upload.single('media'), (req, res) => {
    const { content } = req.body;
    // Allow draft status to be set via form-data (default to 1 for backwards compatibility)
    let draft = typeof req.body.draft !== 'undefined' ? parseInt(req.body.draft) : 1;
    if (isNaN(draft)) draft = 1;
    const mediaUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // Get userId from session or token if available, else fallback to 1
    let userId = 1;
    if (req.session && req.session.userId) {
        userId = req.session.userId;
    } else if (req.user && req.user.id) {
        userId = req.user.id;
    }

    db.run(
        'INSERT INTO fragments (user_id, content, media_url, draft) VALUES (?, ?, ?, ?)',
        [userId, content, mediaUrl, draft],
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

// Get a single fragment by ID
app.get('/api/fragments/:id', (req, res) => {
    const { id } = req.params;
    db.get(`
        SELECT f.*, 
               COUNT(r.id) as reaction_count 
        FROM fragments f 
        LEFT JOIN reactions r ON f.id = r.fragment_id
        WHERE f.id = ? AND f.user_id = 1
        GROUP BY f.id
    `, [id], (err, fragment) => {
        if (err) {
            console.error('Error fetching fragment:', err);
            return res.status(500).json({ success: false, error: err.message });
        }
        if (!fragment) {
            return res.status(404).json({ success: false, error: 'Fragment not found' });
        }
        res.json(fragment);
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

// Authentication middleware
const requireAuth = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.status(401).json({ message: 'Authentication required' });
    }
};

// Auth status endpoint
app.get('/api/auth/status', (req, res) => {
    if (req.session.userId) {
        db.get('SELECT id, name, email FROM users WHERE id = ?', [req.session.userId], (err, user) => {
            if (err) {
                res.status(500).json({ message: 'Error checking auth status' });
            } else if (user) {
                res.json({ user });
            } else {
                res.status(401).json({ message: 'Not authenticated' });
            }
        });
    } else {
        res.status(401).json({ message: 'Not authenticated' });
    }
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (err) {
            res.status(500).json({ message: 'Error during login' });
        } else if (!user) {
            res.status(401).json({ message: 'Invalid credentials' });
        } else {
            bcrypt.compare(password, user.password, (err, result) => {
                if (err || !result) {
                    res.status(401).json({ message: 'Invalid credentials' });
                } else {
                    req.session.userId = user.id;
                    res.json({ 
                        user: {
                            id: user.id,
                            name: user.name,
                            email: user.email
                        }
                    });
                }
            });
        }
    });
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            res.status(500).json({ message: 'Error during logout' });
        } else {
            res.json({ message: 'Logged out successfully' });
        }
    });
});

// Protected routes
app.use('/api/fragments', requireAuth);
app.use('/api/profile', requireAuth);

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