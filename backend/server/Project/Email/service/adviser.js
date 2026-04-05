var mongo = require('mongodb');
var EmailTemplate = require('../controller/adviser');
const Adviser = require('../../Member/controller/advisors');
const ResMessage = require("../../Settings/service/message");
const MailHelper = require("../../../../helpers/google/Mail");

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

exports.onSend = async function (request, response) {
    try {
        const { _id, templete: templateId, to, subject, body } = request.body;
        
        let targetEmail = to;
        let mailSubject = subject;
        let mailBody = body;
        let adviserDoc = null;

        // 1. Fetch Adviser if ID provided
        if (_id) {
            adviserDoc = await Adviser.onQuery({ _id: new mongo.ObjectId(_id) });
            if (adviserDoc) {
                targetEmail = targetEmail || adviserDoc.email;
            }
        }

        // 2. Fetch Template if ID or use Active
        let templateDoc = null;
        if (templateId) {
            templateDoc = await EmailTemplate.onQuery({ _id: new mongo.ObjectId(templateId) });
        } else if (!mailSubject || !mailBody) {
            templateDoc = await EmailTemplate.onQuery({ active: true });
        }

        if (templateDoc) {
            mailSubject = mailSubject || (templateDoc.description && templateDoc.description[0] ? templateDoc.description[0].value : "Evaluation Request");
            mailBody = mailBody || templateDoc.templete || "";
        }

        // 3. Resolve Variables
        if (adviserDoc && mailBody) {
            const studentDoc = adviserDoc.student;
            
            const adviserName = (adviserDoc.name && adviserDoc.name[0]) ? adviserDoc.name[0].value : (adviserDoc.nameEnglish || adviserDoc.organizationName || "Adviser");
            const studentName = studentDoc ? ((studentDoc.name && studentDoc.name[0]) ? studentDoc.name[0].value : (studentDoc.nameEnglish || studentDoc.studentID || "Student")) : "Student";
            const studentID = studentDoc ? (studentDoc.studentID || "") : "";
            const academicYear = adviserDoc.year || (studentDoc && studentDoc.info && studentDoc.info.year) || "";
            
            const schoolName = (studentDoc && studentDoc.info && studentDoc.info.school && studentDoc.info.school.name && studentDoc.info.school.name[0]) ? studentDoc.info.school.name[0].value : "N/A";
            const programName = (studentDoc && studentDoc.info && studentDoc.info.program && studentDoc.info.program.name && studentDoc.info.program.name[0]) ? studentDoc.info.program.name[0].value : "N/A";
            
            const baseUrl = `http://localhost:8080`; // Frontend URL
            const evalLink = studentDoc ? `${baseUrl}/#/fill-form?studentID=${studentDoc._id}` : `${baseUrl}/#/fill-form`;
            
            // Resolve Subject
            if (mailSubject) {
                mailSubject = mailSubject
                    .replace(/{{Adviser Name}}/g, adviserName)
                    .replace(/{{Student Name}}/g, studentName)
                    .replace(/{{Student ID}}/g, studentID)
                    .replace(/{{Academic Year}}/g, academicYear)
                    .replace(/{{School}}/g, schoolName)
                    .replace(/{{Program}}/g, programName);
            }

            // Resolve Body
            mailBody = mailBody
                .replace(/{{Adviser Name}}/g, adviserName)
                .replace(/{{Student Name}}/g, studentName)
                .replace(/{{Student ID}}/g, studentID)
                .replace(/{{Academic Year}}/g, academicYear)
                .replace(/{{School}}/g, schoolName)
                .replace(/{{Program}}/g, programName)
                .replace(/{{Evaluation Link}}/g, evalLink);

            // Convert newlines to HTML breaks for readable formatting
            mailBody = mailBody.replace(/\n/g, '<br>');
        }

        if (!targetEmail) {
            return ResMessage.sendResponse(response, 0, 40400, "No recipient email found");
        }

        const result = await MailHelper.sendMail(targetEmail, mailSubject || "Internship Evaluation", "", mailBody || "Please fill the evaluation form.");
        
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
        const doc = await EmailTemplate.onQuery(query);
        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

exports.onQuerys = async function (request, response) {
    try {
        let query = {};
        const doc = await EmailTemplate.onQuerys(query);
        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        return ResMessage.sendResponse(response, 0, 40400);
    }
};

exports.onCreate = async function (request, response) {
    try {

        const doc = await EmailTemplate.onCreate(request.body);
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
        const doc = await EmailTemplate.onUpdate(query, request.body);
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
        const doc = await EmailTemplate.onDelete(query);
        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        return ResMessage.sendResponse(response, 0, 40400);
    }
};