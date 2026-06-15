const objSchema = require("../models/general.model");
const createBaseService = require("../../../../helpers/base.service");

const defaultPopulate = [];
module.exports = createBaseService(objSchema, defaultPopulate);