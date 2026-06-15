/**
 * Real Authentication Service - looks up users from MongoDB
 * Exposes loginByEmail(email) which returns { user, token, expiresIn }
 */

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'mock-jwt-secret-key-2025';
const JWT_EXPIRY = '7d';

// Loose schema so we can read existing collection documents regardless of shape
const AccountSchema = new mongoose.Schema({}, { strict: false });
let AccountModel;
try {
    AccountModel = mongoose.model('Information_Accounts');
} catch (e) {
    AccountModel = mongoose.model('Information_Accounts', AccountSchema, 'Information_Accounts');
}
const StudentModel = require('../../Member/models/students.model');

exports.loginByEmail = async function (email) {
    if (!email) throw new Error('Email is required');
    // Try common field names used in various schemas
    const query = {
        $or: [
            { email: email },
            { Email: email },
            { emailAddress: email },
            { username: email },
            { studentID: email },
            { studentId: email }
        ]
    };

    let doc = await AccountModel.findOne(query).lean();
    let source = 'account';

    if (!doc) {
        doc = await StudentModel.findOne(query).lean();
        source = 'student';
    }

    if (!doc) throw new Error('User not found');

    const nameValue = Array.isArray(doc.name)
        ? ((doc.name.find((item) => item && item.value) || doc.name[0] || {}).value || null)
        : (doc.name || doc.fullname || doc.displayName || doc.firstname || doc.firstName || null);

    const user = {
        id: doc._id || doc.id || (doc.studentID || doc.studentId) || null,
        email: doc.email || doc.Email || doc.emailAddress || (source === 'student' ? (doc.studentID || doc.studentId || null) : null),
        name: nameValue,
        role: doc.role || (doc.studentID ? 'student' : 'user'),
        studentID: doc.studentID || doc.studentId || null,
        picture: doc.picture || doc.avatar || null
    };

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, studentID: user.studentID }, JWT_SECRET, { expiresIn: JWT_EXPIRY });

    return {
        user,
        token,
        expiresIn: JWT_EXPIRY
    };
};

exports.verifyToken = function (token) {
    try { return jwt.verify(token, JWT_SECRET); } catch (e) { throw new Error('Invalid or expired token'); }
};
