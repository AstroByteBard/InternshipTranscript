var mongo = require('mongodb');
var Documents = require('../controller/documents');

// Simple inline response helper - no DB dependency
function sendOK(response, data) {
    return response.status(200).json({ code: 20000, message: 'Success', data: data });
}
function sendError(response, err) {
    console.error('[Documents Service Error]', err);
    return response.status(500).json({ code: 50000, message: 'Internal Server Error' });
}

exports.onQuery = async function (request, response) {
    try {
        let query = {};
        if (request.params.id) {
            query._id = new mongo.ObjectId(request.params.id);
        } else if (request.body && request.body._id) {
            query._id = new mongo.ObjectId(request.body._id);
        }
        const doc = await Documents.onQuery(query);
        return sendOK(response, doc);
    } catch (err) {
        return sendError(response, err);
    }
};

exports.onQuerys = async function (request, response) {
    try {
        let query = {};
        if (request.query && request.query.status) {
            query.status = request.query.status;
        }
        const doc = await Documents.onQuerys(query);
        return sendOK(response, doc);
    } catch (err) {
        return sendError(response, err);
    }
};

exports.onCreate = async function (request, response) {
    try {
        const doc = await Documents.onCreate(request.body);
        return sendOK(response, doc);
    } catch (err) {
        return sendError(response, err);
    }
};

exports.onUpdate = async function (request, response) {
    try {
        let query = {};
        const id = (request.params && request.params.id) || (request.body && request.body._id);
        if (!id) return response.status(400).json({ code: 40000, message: 'Missing ID' });
        query._id = new mongo.ObjectId(id);

        if (!request.body.update) request.body.update = {};
        request.body.update.datetime = new Date();

        const doc = await Documents.onUpdate(query, request.body);
        return sendOK(response, doc);
    } catch (err) {
        return sendError(response, err);
    }
};

exports.onDelete = async function (request, response) {
    try {
        let query = {};
        const id = (request.params && request.params.id) || (request.body && request.body._id);
        if (!id) return response.status(400).json({ code: 40000, message: 'Missing ID' });
        query._id = new mongo.ObjectId(id);

        const doc = await Documents.onDelete(query);
        return sendOK(response, doc);
    } catch (err) {
        return sendError(response, err);
    }
};
