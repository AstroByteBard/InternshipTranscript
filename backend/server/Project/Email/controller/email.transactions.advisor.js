var mongo = require('mongodb');
var objSchema = require('../models/email.transactions.advisor');
const createBaseService = require('../../../../helpers/base.service');

const defaultPopulate = [
    { path: 'template_id', select: 'title' },
    { path: 'adviser', select: 'email organizationName' },
    { path: 'student_id', select: 'studentID name' },
];

module.exports = createBaseService(objSchema, defaultPopulate);
