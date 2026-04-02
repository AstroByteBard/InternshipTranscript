var mongo = require('mongodb');
var Adviser = require('../controller/adviser');
const ResMessage = require("../../Settings/service/message");
const MailHelper = require("../../../../helpers/google/Mail");

exports.onSend = async function (request, response) {
    try {
        const { to, subject, body } = request.body;
        
        // Find active template (optional, if user didn't provide custom body/subject)
        const activeTemplate = await Adviser.onQuery({ active: true });
        
        let mailSubject = subject || (activeTemplate && activeTemplate.title && activeTemplate.title[0] ? activeTemplate.title[0].value : "Notification");
        let mailBody = body || (activeTemplate ? activeTemplate.templete : "Hello adviser!");

        const result = await MailHelper.sendMail(to, mailSubject, "", mailBody);
        
        if (result.success) {
            return ResMessage.sendResponse(response, 0, 20000, result);
        } else {
            return ResMessage.sendResponse(response, 0, 40400, result.error);
        }
    } catch (err) {
        console.error(err);
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

exports.onQuery = async function (request, response) {
    try {
        let query = {};
        query._id = new mongo.ObjectId(request.body.id);
        const doc = await Adviser.onQuery(query);
        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

exports.onQuerys = async function (request, response) {
    try {
        let query = {};
        const doc = await Adviser.onQuerys(query);
        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

exports.onCreate = async function (request, response) {
    try {

        const doc = await Adviser.onCreate(request.body);
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
        const doc = await Adviser.onUpdate(query, request.body);
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
        const doc = await Adviser.onDelete(query);
        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        return ResMessage.sendResponse(response, 0, 40400);
    }
};