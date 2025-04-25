const express = require('express');
const router = express.Router();
const db = require('../server').db;
const {
    hashPassword,
    verifyPassword,
    generateToken,
    generateResetToken,
    sendVerificationEmail,
    sendPasswordResetEmail
} = require('../auth');

// Register new user
router.post('/register', async (req, res) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    try {
        // Check if email already exists
        const existingUser = await new Promise((resolve, reject) => {
            db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });

        if (existingUser) {
            return res.status(400).json({ success: false, error: 'Email already registered' });
        }

        // Hash password
        const passwordHash = await hashPassword(password);
        const verificationToken = generateResetToken();

        // Insert new user
        const result = await new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO users (email, password_hash, name, verification_token) VALUES (?, ?, ?, ?)',
                [email, passwordHash, name, verificationToken],
                function(err) {
                    if (err) reject(err);
                    resolve(this.lastID);
                }
            );
        });

        // Send verification email
        await sendVerificationEmail(email, verificationToken);

        res.status(201).json({ 
            success: true, 
            message: 'User registered successfully. Please check your email to verify your account.' 
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, error: 'Registration failed' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Missing email or password' });
    }

    try {
        // Get user from database
        const user = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });

        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid email or password' });
        }

        // Verify password
        const isValidPassword = await verifyPassword(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ success: false, error: 'Invalid email or password' });
        }

        // Check if email is verified
        if (!user.email_verified) {
            return res.status(403).json({ 
                success: false, 
                error: 'Email not verified. Please check your email for verification link.' 
            });
        }

        // Generate JWT token
        const token = generateToken(user.id);

        res.json({ 
            success: true, 
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, error: 'Login failed' });
    }
});

// Request password reset
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, error: 'Email is required' });
    }

    try {
        // Get user
        const user = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });

        if (!user) {
            return res.status(404).json({ success: false, error: 'Email not found' });
        }

        // Generate reset token
        const resetToken = generateResetToken();
        const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour from now

        // Update user with reset token
        await new Promise((resolve, reject) => {
            db.run(
                'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
                [resetToken, resetTokenExpires, user.id],
                (err) => {
                    if (err) reject(err);
                    resolve();
                }
            );
        });

        // Send reset email
        await sendPasswordResetEmail(email, resetToken);

        res.json({ success: true, message: 'Password reset email sent' });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ success: false, error: 'Failed to process password reset request' });
    }
});

// Reset password
router.post('/reset-password', async (req, res) => {
    const { token, password } = req.body;

    if (!token || !password) {
        return res.status(400).json({ success: false, error: 'Token and password are required' });
    }

    try {
        // Get user with valid reset token
        const user = await new Promise((resolve, reject) => {
            db.get(
                'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > ?',
                [token, new Date()],
                (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                }
            );
        });

        if (!user) {
            return res.status(400).json({ success: false, error: 'Invalid or expired reset token' });
        }

        // Hash new password
        const passwordHash = await hashPassword(password);

        // Update password and clear reset token
        await new Promise((resolve, reject) => {
            db.run(
                'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
                [passwordHash, user.id],
                (err) => {
                    if (err) reject(err);
                    resolve();
                }
            );
        });

        res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ success: false, error: 'Failed to reset password' });
    }
});

// Verify email
router.post('/verify-email', async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ success: false, error: 'Verification token is required' });
    }

    try {
        // Get user with verification token
        const user = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE verification_token = ?', [token], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });

        if (!user) {
            return res.status(400).json({ success: false, error: 'Invalid verification token' });
        }

        // Update user as verified
        await new Promise((resolve, reject) => {
            db.run(
                'UPDATE users SET email_verified = 1, verification_token = NULL WHERE id = ?',
                [user.id],
                (err) => {
                    if (err) reject(err);
                    resolve();
                }
            );
        });

        res.json({ success: true, message: 'Email verified successfully' });
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ success: false, error: 'Failed to verify email' });
    }
});

module.exports = router; 