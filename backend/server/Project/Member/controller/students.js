var mongo = require('mongodb');
var objSchema = require('../models/students.model');
const createBaseService = require('../../../../helpers/base.service');

const defaultPopulate = [
    { path: 'info.program', select: 'title' },
    { path: 'info.school', select: 'title' },
    { path: 'info.course', select: 'title' },
    { path: 'evaluation' }
];
module.exports = createBaseService(objSchema, defaultPopulate);

