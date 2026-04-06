var mongo = require('mongodb');
var Evaluation = require('../controller/evaluation');
const ResMessage = require("../../Settings/service/message");

exports.onQuery = async function (request, response) {
    try {
        let query = {};
        if (request.body.id) query._id = new mongo.ObjectId(request.body.id);
        if (request.body.studentId) query.studentId = new mongo.ObjectId(request.body.studentId);
        
        // Prevent returning all records if no filter is provided
        if (Object.keys(query).length === 0) {
            return ResMessage.sendResponse(response, 0, 20000, []);
        }

        const doc = await Evaluation.onQuery(query);
        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        return ResMessage.sendResponse(response, 0, 40000);
    }
};

exports.onQuerys = async function (request, response) {
    try {
        let query = {};
        if (request.query.studentId) query.studentId = new mongo.ObjectId(request.query.studentId);
        
        const doc = await Evaluation.onQuerys(query);
        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        return ResMessage.sendResponse(response, 0, 40000);
    }
};

exports.onCreate = async function (request, response) {
    try {
        // Prevent duplicate evaluations for same student
        if (request.body.studentId) {
            const query = { studentId: new mongo.ObjectId(request.body.studentId) };
            const existing = await Evaluation.onQuery(query);
            if (existing && existing.length > 0) {
                return ResMessage.sendResponse(response, 0, 40000, 'Evaluation already exists for this student.');
            }
        }

        const doc = await Evaluation.onCreate(request.body);
        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        console.log(err);
        return ResMessage.sendResponse(response, 0, 40000);
    }
};

exports.onUpdate = async function (request, response) {
    try {
        let query = {}
        query._id = new mongo.ObjectId(request.body._id);
        const updateData = { ...request.body }
        delete updateData._id
        const doc = await Evaluation.onUpdate(query, updateData);
        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        console.error(err);
        return ResMessage.sendResponse(response, 0, 40000);
    }
};

exports.onDelete = async function (request, response) {
    try {
        let query = {};
        query._id = new mongo.ObjectId(request.body._id);
        const doc = await Evaluation.onDelete(query);
        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        return ResMessage.sendResponse(response, 0, 40000);
    }
};
