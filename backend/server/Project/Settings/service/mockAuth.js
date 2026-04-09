/**
 * Mock Authentication Service for Testing
 * Simulates Google OAuth login for Admin and Student
 */

const jwt = require('jsonwebtoken');
const MOCK_USERS = {
    'admin@lamduan.mfu.ac.th': {
        id: '1001',
        email: 'admin@lamduan.mfu.ac.th',
        name: 'Administrator',
        role: 'admin',
        picture: 'https://via.placeholder.com/150?text=Admin'
    },
    '6631503016@lamduan.mfu.ac.th': {
        id: '6631503016',
        email: '6631503016@lamduan.mfu.ac.th',
        name: 'Napus Samuanpho',
        role: 'student',
        studentID: '6631503016',
        picture: 'https://via.placeholder.com/150?text=Student'
    }
};

// JWT Secret (use from .env in production)
const JWT_SECRET = process.env.JWT_SECRET || 'mock-jwt-secret-key-2025';
const JWT_EXPIRY = '7d';

/**
 * Mock Login Service
 * @param {string} email - Student or Admin email
 * @returns {Promise<Object>} User object with token
 */
exports.mockLogin = async function (email) {
    try {
        const user = MOCK_USERS[email];
        if (!user) {
            throw new Error(`User ${email} not found in mock database`);
        }

        // Generate JWT Token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
                studentID: user.studentID
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRY }
        );

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                studentID: user.studentID,
                picture: user.picture
            },
            token: token,
            expiresIn: JWT_EXPIRY
        };
    } catch (err) {
        console.error('Mock login error:', err);
        throw err;
    }
};

/**
 * Verify JWT Token
 * @param {string} token - JWT token
 * @returns {Object} Decoded token
 */
exports.verifyToken = function (token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (err) {
        throw new Error('Invalid or expired token');
    }
};

/**
 * Get all mock users (for development/testing only)
 * @returns {Array} List of available mock users
 */
exports.getAllMockUsers = function () {
    return Object.values(MOCK_USERS).map(user => ({
        email: user.email,
        name: user.name,
        role: user.role
    }));
};
