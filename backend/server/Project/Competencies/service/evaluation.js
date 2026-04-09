var mongo = require('mongodb');
var Evaluation = require('../controller/evaluation');
const ResMessage = require("../../Settings/service/message");

exports.onQuery = async function (request, response) {
    try {
        let query = {};
        const body = request.body || {};
        const params = request.query || {};
        const id = body.id || params.id;
        const studentId = body.studentId || params.studentId;

        if (id && mongo.ObjectId.isValid(id)) {
            query._id = new mongo.ObjectId(id);
        }

        if (studentId && mongo.ObjectId.isValid(studentId)) {
            query.studentId = new mongo.ObjectId(studentId);
        }

        const doc = await Evaluation.onQuery(query);
        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        console.error('Evaluation onQuery error:', err);
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

exports.onQuerys = async function (request, response) {
    try {
        let query = {};
        const params = request.query || {};
        if (params.studentId && mongo.ObjectId.isValid(params.studentId)) {
            query.studentId = new mongo.ObjectId(params.studentId);
        }
        const doc = await Evaluation.onQuerys(query);
        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        console.error('Evaluation onQuerys error:', err);
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

exports.onCreate = async function (request, response) {
    try {
        const doc = await Evaluation.onCreate(request.body);
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
        const updateData = { ...request.body }
        delete updateData._id
        const doc = await Evaluation.onUpdate(query, updateData);
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
        const doc = await Evaluation.onDelete(query);
        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        return ResMessage.sendResponse(response, 0, 40400);
    }
};
