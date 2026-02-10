var mongo = require('mongodb');
var Major = require('../controller/major');
const Mail = require('../../../../helpers/google/Mail')
const Email = require('../../Email/controller/email')
const ResMessage = require("../../Settings/service/message");

exports.onQuery = async function (request, response) {
    try {
        let query = {};
        query._id = new mongo.ObjectId(request.body._id);
        const doc = await Major.onQuery(query);
        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        return ResMessage.sendResponse(response, 0, 40400);
    }
};


exports.onQuerys = async function (request, response) {
    try {
        let query = {};
        const doc = await Major.onQuerys(query);
        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

exports.onCreate = async function (request, response) {
    try {

        const doc = await Major.onCreate(request.body);
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

        const doc = await Major.onUpdate(query, request.body);
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
        const doc = await Major.onDelete(query);
        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

// sending Email 
exports.onSendEmail = async function (request, response) {
    try {
        let query = {};

        query._id = new mongo.ObjectId(request.body._id);
        query.templete = new mongo.ObjectId(request.body.templete);

        const emailStudent = await Major.onAggregate([
            {
                $match: {
                    _id: query._id
                }
            },
            {
                $lookup: {
                    from: "Students",          // ชื่อ collection (ไม่ใช่ model)
                    localField: "_id",   // field ใน orders
                    foreignField: "info.major",    // field ใน users
                    as: "students"
                }
            },
            {
                $unwind: "$students"
            },
            {
                $project: {
                _id: 0,
                email: "$students.email"
                }
            }
        ])
        const emails = emailStudent.map(item => item.email);

        const templete = await Email.onQuery({ _id: query.templete }, [] , 'templete');
        
        await Mail.sendMail(emails,'gay','get',templete.templete)
        return ResMessage.sendResponse(response, 0, 20000)
    } catch (err) {
        ResMessage.sendResponse(response, 0, 40400)
    }
}