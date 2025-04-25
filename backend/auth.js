const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

// JWT secret key - should be moved to environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SESSION_SECRET = process.env.SESSION_SECRET || 'your-session-secret';

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Password hashing
async function hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

// Password verification
async function verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

// Generate JWT token
function generateToken(userId) {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
}

// Verify JWT token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

// Generate reset token
function generateResetToken() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
}

// Send verification email
async function sendVerificationEmail(email, token) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verify your email address',
        html: `
            <h1>Welcome to Fragments!</h1>
            <p>Please click the link below to verify your email address:</p>
            <a href="${verificationUrl}">${verificationUrl}</a>
            <p>If you did not create an account, please ignore this email.</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw error;
    }
}

// Send password reset email
async function sendPasswordResetEmail(email, token) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Reset your password',
        html: `
            <h1>Password Reset Request</h1>
            <p>You have requested to reset your password. Click the link below to proceed:</p>
            <a href="${resetUrl}">${resetUrl}</a>
            <p>This link will expire in 1 hour.</p>
            <p>If you did not request a password reset, please ignore this email.</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw error;
    }
}

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(403).json({ success: false, error: 'Invalid token' });
    }

    req.userId = decoded.userId;
    next();
};

module.exports = {
    hashPassword,
    verifyPassword,
    generateToken,
    verifyToken,
    generateResetToken,
    sendVerificationEmail,
    sendPasswordResetEmail,
    authenticateToken,
    JWT_SECRET,
    SESSION_SECRET
}; 