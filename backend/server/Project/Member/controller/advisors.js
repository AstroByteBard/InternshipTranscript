var mongo = require('mongodb');
var objSchema = require('../models/advisors.model');
const createBaseService = require('../../../../helpers/base.service');

const defaultPopulate = [
    {
        path: 'student',
        select: 'studentID name company info.school info.program info.year evaluation',
        populate: [
            { path: 'info.program', select: 'title' },
            { path: 'info.school', select: 'title' }
        ]
    },
    { path: 'province', select: 'title' }
];
module.exports = createBaseService(objSchema, defaultPopulate); 