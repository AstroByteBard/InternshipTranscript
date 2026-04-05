var mongo = require('mongodb');
var objSchema = require('../models/evaluation.model')
const createBaseService = require('../../../../helpers/base.service')

const defaultPopulate = [
    { path: 'studentId' }
];
module.exports = createBaseService(objSchema, defaultPopulate);
