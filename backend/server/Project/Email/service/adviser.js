var mongo = require('mongodb');
var EmailTemplate = require('../controller/adviser');
const Adviser = require('../../Member/controller/advisors');
const EmailTransactionAdvisor = require('../controller/email.transactions.advisor');
const ResMessage = require("../../Settings/service/message");
const MailHelper = require("../../../../helpers/google/Mail");

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

exports.onSend = async function (request, response) {
    try {
        const { _id, template: templateId, to, subject, body } = request.body;
        
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
            mailSubject = mailSubject || (templateDoc.description || "Evaluation Request");
            mailBody = mailBody || templateDoc.template || "";
        }

        // 3. Resolve Variables
        if (adviserDoc) {
            const studentDoc = adviserDoc.student;
            const lang = templateDoc?.locale || 'en';
            const getVal = (arr, key) => Array.isArray(arr) ? (arr.find(x => x.key === key)?.value || arr[0]?.value || '') : (arr || '');
            
            const adviserName = (lang === 'th') ? (adviserDoc.organizationName || studentDoc?.company || "Adviser") : (studentDoc?.company || adviserDoc.organizationName || "Adviser");
            const studentName = studentDoc ? ((studentDoc.name && studentDoc.name.length) ? getVal(studentDoc.name, lang) : (studentDoc.nameEnglish || studentDoc.studentID || "Student")) : "Student";
            const studentID = studentDoc ? (studentDoc.studentID || "") : "";
            const yr = studentDoc?.info?.year;
            const academicYear = Array.isArray(yr)
                ? (yr.find(y => y.key === lang)?.value || yr[0]?.value || '')
                : (yr?.value || yr || '');
            
            const schoolTitle = studentDoc?.info?.school?.title;
            const schoolName = Array.isArray(schoolTitle)
                ? (schoolTitle.find(t => t.key === lang)?.value || schoolTitle[0]?.value || 'N/A')
                : (studentDoc?.info?.school?.name || 'N/A');
            const programTitle = studentDoc?.info?.program?.title;
            const programName = Array.isArray(programTitle)
                ? (programTitle.find(t => t.key === lang)?.value || programTitle[0]?.value || 'N/A')
                : (studentDoc?.info?.program?.name || 'N/A');
            
            const baseUrl = `http://localhost:8080`; // Frontend URL
            const evalLink = studentDoc ? `${baseUrl}/#/fill-form?studentID=${studentDoc._id}` : `${baseUrl}/#/fill-form`;
            const systemUrl = `${baseUrl}/#/login`;
            
            // Resolve Subject
            if (mailSubject) {
                mailSubject = mailSubject
                    .replace(/{{Adviser Name}}/g, adviserName)
                    .replace(/{{ชื่อผู้ให้คำปรึกษา}}/g, adviserName)
                    .replace(/{{Student Name}}/g, studentName)
                    .replace(/{{ชื่อนักศึกษา}}/g, studentName)
                    .replace(/{{Student ID}}/g, studentID)
                    .replace(/{{รหัสนักศึกษา}}/g, studentID)
                    .replace(/{{Academic Year}}/g, academicYear)
                    .replace(/{{ปีการศึกษา}}/g, academicYear)
                    .replace(/{{School}}/g, schoolName)
                    .replace(/{{โรงเรียน}}/g, schoolName)
                    .replace(/{{Program}}/g, programName)
                    .replace(/{{หลักสูตร}}/g, programName)
                    .replace(/{{Internship System URL}}/g, systemUrl)
                    .replace(/{{URL ระบบฝึกงาน}}/g, systemUrl);
            }

            // Resolve Body
            if (mailBody) {
                mailBody = mailBody
                    .replace(/{{Adviser Name}}/g, adviserName)
                    .replace(/{{ชื่อผู้ให้คำปรึกษา}}/g, adviserName)
                    .replace(/{{Student Name}}/g, studentName)
                    .replace(/{{ชื่อนักศึกษา}}/g, studentName)
                    .replace(/{{Student ID}}/g, studentID)
                    .replace(/{{รหัสนักศึกษา}}/g, studentID)
                    .replace(/{{Academic Year}}/g, academicYear)
                    .replace(/{{ปีการศึกษา}}/g, academicYear)
                    .replace(/{{School}}/g, schoolName)
                    .replace(/{{โรงเรียน}}/g, schoolName)
                    .replace(/{{Program}}/g, programName)
                    .replace(/{{หลักสูตร}}/g, programName)
                    .replace(/{{Evaluation Link}}/g, evalLink)
                    .replace(/{{ลิงก์ประเมินผล}}/g, evalLink)
                    .replace(/{{Internship System URL}}/g, systemUrl)
                    .replace(/{{URL ระบบฝึกงาน}}/g, systemUrl);

                // Convert newlines to HTML breaks for readable formatting
                mailBody = mailBody.replace(/\n/g, '<br>');
            }
        }

        if (!targetEmail) {
            return ResMessage.sendResponse(response, 0, 40400, "No recipient email found");
        }

        const result = await MailHelper.sendMail(targetEmail, mailSubject || "Internship Evaluation", "", mailBody || "Please fill the evaluation form.");

        const adviserObjId = _id ? new mongo.ObjectId(_id) : null;
        const studentObjId = adviserDoc?.student
            ? new mongo.ObjectId(adviserDoc.student._id || adviserDoc.student)
            : null;
        const txData = {
            template_id: templateDoc?._id || null,
            adviser: adviserObjId,
            student_id: studentObjId,
            delivery_status: result.success ? 'Completed' : 'Failed',
            sent_at: new Date()
        };
        try {
            if (adviserObjId && studentObjId && templateDoc) {
                const existingTx = await EmailTransactionAdvisor.onQuerys({
                    adviser: adviserObjId,
                    student_id: studentObjId,
                    template_id: templateDoc._id
                });
                if (existingTx && existingTx.length > 0) {
                    await EmailTransactionAdvisor.onUpdate({ _id: existingTx[0]._id }, txData);
                } else {
                    await EmailTransactionAdvisor.onCreate(txData);
                }
            } else {
                await EmailTransactionAdvisor.onCreate(txData);
            }
        } catch (txErr) {
            console.error('Failed to update/create email transaction:', txErr);
        }

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