var mongo = require('mongodb');
var objSchema = require('../models/hardskill.model')
const createBaseService = require('../../../../helpers/base.service')

const defaultPopulate = [
    { path: 'program', populate: { path: 'school' } }
];
module.exports = createBaseService(objSchema, defaultPopulate);