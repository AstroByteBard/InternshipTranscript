/**
 * Real Authentication Service - looks up users from MongoDB
 * Exposes loginByEmail(email) which returns { user, token, expiresIn }
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'mock-jwt-secret-key-2025';
const JWT_EXPIRY = '7d';

const StudentModel = require('../../Member/models/students.model');

exports.loginByEmail = async function (email) {
    if (!email) throw new Error('Email is required');

    console.log('[loginByEmail] input:', { email });

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

    console.log('[loginByEmail] query:', JSON.stringify(query));

    const doc = await StudentModel.findOne(query).lean();

    if (!doc) {
        console.log('[loginByEmail] result: NOT_FOUND');
        throw new Error('User not found');
    }

    console.log('[loginByEmail] raw doc:', {
        _id: doc._id,
        studentID: doc.studentID,
        studentId: doc.studentId,
        email: doc.email,
        Email: doc.Email,
        emailAddress: doc.emailAddress,
        username: doc.username,
        name: doc.name
    });

    const nameValue = Array.isArray(doc.name)
        ? ((doc.name.find((item) => item && item.value) || doc.name[0] || {}).value || null)
        : (doc.name || doc.fullname || doc.displayName || doc.firstname || doc.firstName || null);

    const user = {
        _id: doc._id,
        id: doc._id || doc.id || (doc.studentID || doc.studentId) || null,
        email: doc.email || doc.Email || doc.emailAddress || doc.studentID || doc.studentId || null,
        name: nameValue,
        role: doc.role || (doc.studentID ? 'student' : 'user'),
        studentID: doc.studentID || doc.studentId || null,
        picture: doc.picture || doc.avatar || null
    };

    console.log('[loginByEmail] returning user:', JSON.stringify(user));

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
