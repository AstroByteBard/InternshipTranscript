var mongo = require('mongodb');
var Evaluation = require('../controller/evaluation');
const { generateText } = require('../../../../helpers/gemini');
const ResMessage = require("../../Settings/service/message");

// Helper: try to extract JSON object from model text (code fence or first {...} block)
function tryParseJsonFromText(text) {
    if (!text || typeof text !== 'string') return null;
    const codeFence = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    let jsonText = codeFence ? codeFence[1] : null;
    if (!jsonText) {
        const brace = text.match(/(\{[\s\S]*\})/);
        jsonText = brace ? brace[1] : null;
    }
    if (!jsonText) return null;
    try { return JSON.parse(jsonText); } catch (e) {
        const cleaned = jsonText.replace(/,\s*([}\]])/g, '$1');
        try { return JSON.parse(cleaned); } catch (e2) { return null; }
    }
}

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

        // Preprocess suggestions: if suggestion.answer.value is a string, ask Gemini to split it
        if (Array.isArray(request.body.sugestion)) {
            for (let i = 0; i < request.body.sugestion.length; i++) {
                const s = request.body.sugestion[i];
                const rawValue = s?.answer?.value;
                if (!rawValue) continue;
                // If already structured (has outstanding/opportunity), skip
                if (typeof rawValue === 'object' && (Array.isArray(rawValue.outstanding) || Array.isArray(rawValue.opportunity))) continue;
                // If value is not string, skip
                if (typeof rawValue !== 'string') continue;

                const prompt = `แยกข้อความต่อไปนี้เป็น Outstanding (จุดเด่น) และ Opportunity (จุดที่ควรพัฒนา) อย่างละ 3 ข้อ ไม่เกิน 60 ตัวอักษรต่อข้อ โดยต้องให้แปลเป็นทั้งภาษาไทยและภาษาอังกฤษในแต่ละข้อ\nตอบกลับเป็นรูปแบบ JSON เท่านั้น ตามโครงสร้างนี้เป๊ะๆ (ห้ามมี markdown หรือคำอธิบายเพิ่มเติม):\n{\n  "outstanding": [\n    { "th": "ข้อความภาษาไทย", "en": "English text" }\n  ],\n  "opportunity": [\n    { "th": "ข้อความภาษาไทย", "en": "English text" }\n  ]\n}\n\nข้อความที่ต้องแยก:\n${rawValue}\n\nถ้าไม่มีรายการ ให้คืน array ว่างๆ`;
                try {
                    const gen = await generateText(prompt, { maxOutputTokens: 2048, temperature: 0.0 });
                    console.log('[evaluation] gemini text:', gen.text);
                    const parsed = tryParseJsonFromText(gen.text) || tryParseJsonFromText(JSON.stringify(gen.raw));
                    if (parsed) {
                        s.answer.value = {
                            outstanding: Array.isArray(parsed.outstanding) ? parsed.outstanding : [],
                            opportunity: Array.isArray(parsed.opportunity) ? parsed.opportunity : []
                        };
                    } else {
                        // fallback: store original text as an opportunity
                        s.answer.value = { outstanding: [], opportunity: [rawValue] };
                    }
                } catch (err) {
                    console.warn('[evaluation] Gemini parse failed, falling back:', err?.message || err);
                    s.answer.value = { outstanding: [], opportunity: [rawValue] };
                }
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
        // Preprocess suggestions in updateData similar to onCreate
        if (Array.isArray(updateData.sugestion)) {
            for (let i = 0; i < updateData.sugestion.length; i++) {
                const s = updateData.sugestion[i];
                const rawValue = s?.answer?.value;
                if (!rawValue) continue;
                if (typeof rawValue === 'object' && (Array.isArray(rawValue.outstanding) || Array.isArray(rawValue.opportunity))) continue;
                if (typeof rawValue !== 'string') continue;
                const prompt = `แยกข้อความต่อไปนี้เป็น Outstanding (จุดเด่น) และ Opportunity (จุดที่ควรพัฒนา) อย่างละ 3 ข้อ ไม่เกิน 60 ตัวอักษรต่อข้อ โดยต้องให้แปลเป็นทั้งภาษาไทยและภาษาอังกฤษในแต่ละข้อ\nตอบกลับเป็นรูปแบบ JSON เท่านั้น ตามโครงสร้างนี้เป๊ะๆ (ห้ามมี markdown หรือคำอธิบายเพิ่มเติม):\n{\n  "outstanding": [\n    { "th": "ข้อความภาษาไทย", "en": "English text" }\n  ],\n  "opportunity": [\n    { "th": "ข้อความภาษาไทย", "en": "English text" }\n  ]\n}\n\nข้อความที่ต้องแยก:\n${rawValue}\n\nถ้าไม่มีรายการ ให้คืน array ว่างๆ`;
                try {
                    const gen = await generateText(prompt, { maxOutputTokens: 65536, temperature: 0.0 });
                    console.log('[evaluation:update] gemini text:', gen.text);
                    const parsed = tryParseJsonFromText(gen.text) || tryParseJsonFromText(JSON.stringify(gen.raw));
                    if (parsed) {
                        s.answer.value = {
                            outstanding: Array.isArray(parsed.outstanding) ? parsed.outstanding : [],
                            opportunity: Array.isArray(parsed.opportunity) ? parsed.opportunity : []
                        };
                    } else {
                        s.answer.value = { outstanding: [], opportunity: [rawValue] };
                    }
                } catch (err) {
                    console.warn('[evaluation:update] Gemini parse failed, falling back:', err?.message || err);
                    s.answer.value = { outstanding: [], opportunity: [rawValue] };
                }
            }
        }

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
