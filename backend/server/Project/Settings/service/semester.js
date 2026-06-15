var mongo = require('mongodb');
var Semester = require('../controller/semester');
const resMsg = require("../service/message");

exports.onQuery = async function (request, response, next) {
    try {
        var querys = request.query || {};
        const doc = await Semester.onQuery(querys);

        var resData = await resMsg.onMessage_Response(0, 20000)
        resData.data = doc
        response.status(200).json(resData);
    } catch (err) {
        var resData = await resMsg.onMessage_Response(0, 40400)
        response.status(404).json(resData);
    }
};

exports.onQuerys = async function (request, response, next) {
    try {
        var querys = request.query || {};
        const doc = await Semester.onQuerys(querys);

        var resData = await resMsg.onMessage_Response(0, 20000)
        resData.data = doc
        response.status(200).json(resData);

    } catch (err) {
        var resData = await resMsg.onMessage_Response(0, 40400)
        response.status(404).json(resData);
    }
};
exports.onCreate = async function (request, response, next) {
    try {
        const doc = await Semester.onCreate(request.body);

        var resData = await resMsg.onMessage_Response(0, 20000)
        resData.data = doc
        response.status(200).json(resData);

    } catch (err) {
        var resData = await resMsg.onMessage_Response(0, 40400)
        response.status(404).json(resData);
    }
};
exports.onUpdate = async function (request, response, next) {
    try {

        var query = {}
        query._id = new mongo.ObjectId(request.body._id);


        const doc = await Semester.onUpdate(query, request.body);


        var resData = await resMsg.onMessage_Response(0, 20000)
        resData.data = doc
        response.status(200).json(resData);

    } catch (err) {
        var resData = await resMsg.onMessage_Response(0, 40400)
        response.status(404).json(resData);
    }
};
exports.onDelete = async function (request, response, next) {
    try {

        var query = {};
        query._id = new mongo.ObjectId(request.body._id || request.body.id)
        const doc = await Semester.onDelete(query);

        var resData = await resMsg.onMessage_Response(0, 20000)
        resData.data = doc
        response.status(200).json(resData);

    } catch (err) {

        var resData = await resMsg.onMessage_Response(0, 40400)
        response.status(404).json(resData);
    }

};
