var mongo = require('mongodb');
var objSchema = require('../models/advisors.model');
const createBaseService = require('../../../../helpers/base.service');

const defaultPopulate = [
    { path: 'student', select: 'studentID name', populate: { path: 'info.program', select: 'name' } },
    { path: 'student', select: 'studentID name', populate: { path: 'info.school', select: 'name' } },
    { path: 'province', select: 'title' }
];
module.exports = createBaseService(objSchema, defaultPopulate); 