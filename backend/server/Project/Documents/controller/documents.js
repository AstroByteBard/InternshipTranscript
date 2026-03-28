var objSchema = require('../models/documents.model');
const createBaseService = require('../../../../helpers/base.service');

// No populate - keep it simple to avoid errors from missing Account references
const defaultPopulate = [];

module.exports = createBaseService(objSchema, defaultPopulate);
