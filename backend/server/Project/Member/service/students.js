const mongo = require('mongodb');
const objSchema = require('../controller/students');
const ResMessage = require("../../Settings/service/message.js");
const dataHelper = require('./students_data_helper');

exports.onQuery = async function (request, response) {
    try {
        let query = {};
        query._id = new mongo.ObjectId(request.body.id);
        const doc = await objSchema.onQuery(query);
        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

exports.onQuerys = async function (request, response) {
    try {
        let query = {};
        const doc = await objSchema.onQuerys(query);
        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

exports.onCreate = async function (request, response) {
    try {

        const doc = await objSchema.onCreate(request.body);
        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        console.log(err);
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

exports.onUpdate = async function (request, response) {
    try {
        let query = {}
        query._id = new mongo.ObjectId(request.body._id);

        const doc = await objSchema.onUpdate(query, request.body);
        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        console.error(err);
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

exports.onDelete = async function (request, response) {
    try {
        let query = {};
        query._id = new mongo.ObjectId(request.body._id);
        const doc = await objSchema.onDelete(query);
        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

/**
 * Get example data for document placeholders
 */
exports.getExampleData = async function (request, response) {
    try {
        const data = await dataHelper.getAllExampleData();
        return ResMessage.sendResponse(response, 0, 20000, data);
    } catch (err) {
        console.error('Error getting example data:', err);
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

/**
 * Get longest student name data
 */
exports.getLongestNameData = async function (request, response) {
    try {
        const data = await dataHelper.getLongestStudentNameData();
        return ResMessage.sendResponse(response, 0, 20000, data);
    } catch (err) {
        console.error('Error getting longest name data:', err);
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

/**
 * Get longest school name
 */
exports.getLongestSchoolName = async function (request, response) {
    try {
        const data = await dataHelper.getLongestSchoolName();
        return ResMessage.sendResponse(response, 0, 20000, data);
    } catch (err) {
        console.error('Error getting longest school name:', err);
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

/**
 * Get longest program name
 */
exports.getLongestProgramName = async function (request, response) {
    try {
        const data = await dataHelper.getLongestProgramName();
        return ResMessage.sendResponse(response, 0, 20000, data);
    } catch (err) {
        console.error('Error getting longest program name:', err);
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

/**
 * Get program with most competencies
 */
exports.getMostCompetenciesProgram = async function (request, response) {
    try {
        const data = await dataHelper.getMostCompetenciesProgram();
        return ResMessage.sendResponse(response, 0, 20000, data);
    } catch (err) {
        console.error('Error getting program with most competencies:', err);
        return ResMessage.sendResponse(response, 0, 40400);
    }
};
