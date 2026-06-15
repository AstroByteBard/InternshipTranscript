var objSchema = require('../models/email.transactions.student');
const createBaseService = require('../../../../helpers/base.service');

const defaultPopulate = [
    { path: 'template_id', select: 'title' },
    { path: 'student_id', select: 'studentID name' },
];

module.exports = createBaseService(objSchema, defaultPopulate);
