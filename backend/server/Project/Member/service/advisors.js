var mongo = require('mongodb');
var objSchema = require('../controller/advisors');
const ResMessage = require("../../Settings/service/message");

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
        const mongoose = require('mongoose');
        const EvaluationModel = mongoose.model('Competencies_Evaluation');

        const enriched = await Promise.all(doc.map(async (advisor) => {
            const advisorObj = advisor.toObject ? advisor.toObject() : { ...advisor };
            const student = advisorObj.student || null;

            if (!student?.evaluation) {
                advisorObj.responseStatus = 'PENDING';
                return advisorObj;
            }

            const exists = await EvaluationModel.exists({ _id: student.evaluation });
            advisorObj.responseStatus = exists ? 'COMPLETE' : 'PENDING';
            return advisorObj;
        }));

        return ResMessage.sendResponse(response, 0, 20000, enriched);
    } catch (err) {
        console.error('[advisors:onQuerys]', err);
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

exports.onCreate = async function (request, response) {
    try {
        const advisorsData = Array.isArray(request.body) ? request.body : [request.body];
        const StudentModel = require('../models/students.model');
        const mongoose = require('mongoose');

        // Resolve student IDs for each advisor if they are sent as strings or numbers
        for (let item of advisorsData) {
            if (item.student && !mongoose.Types.ObjectId.isValid(item.student)) {
                const searchID = String(item.student).trim();
                console.log(`[Import] Attempting to link student ID: "${searchID}"`);
                
                // Flexible search: Trim and case-insensitive
                const student = await StudentModel.findOne({ 
                    studentID: { $regex: new RegExp(`^${searchID}$`, 'i') } 
                });

                if (student) {
                    console.log(`[Import] SUCCESS: Found student "${student.studentID}" for advisor`);
                    item.student = student._id;
                } else {
                    const totalStudents = await StudentModel.countDocuments();
                    console.log(`[Import] FAILED: Student "${searchID}" not found. (Total students in DB: ${totalStudents})`);
                    item.student = null; 
                }
            }
        }

        const doc = await objSchema.onCreate(advisorsData);
        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        console.error("Error creating advisor:", err);
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