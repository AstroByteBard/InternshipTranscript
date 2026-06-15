'use strict';

var mongo = require('mongodb');
var Evaluation = require('../controller/evaluation');
const { generateText } = require('../../../../helpers/gemini');
const ResMessage = require('../../Settings/service/message');

function tryParseJsonFromText(text) {
    if (!text || typeof text !== 'string') return null;
    const codeFence = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    let jsonText = codeFence ? codeFence[1] : null;
    if (!jsonText) {
        const brace = text.match(/(\{[\s\S]*\})/);
        jsonText = brace ? brace[1] : null;
    }
    if (!jsonText) return null;
    try {
        return JSON.parse(jsonText);
    } catch (e) {
        const cleaned = jsonText.replace(/,\s*([}\]])/g, '$1');
        try {
            return JSON.parse(cleaned);
        } catch (e2) {
            return null;
        }
    }
}

function toLocalizedText(value, fallback = '') {
    if (value == null) return { th: fallback, en: fallback };

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        const text = String(value).trim();
        return { th: text, en: text };
    }

    if (Array.isArray(value)) {
        const joined = value.map(v => (v == null ? '' : String(v))).filter(Boolean).join(' ');
        return { th: joined || fallback, en: joined || fallback };
    }

    if (typeof value === 'object') {
        const th = value.th || value.thai || value.th_TH || value['th'] || value['th-TH'] || '';
        const en = value.en || value.english || value.en_US || value['en'] || value['en-US'] || '';
        const fallbackText = value.text || value.value || value.title || value.content || fallback;
        return {
            th: String(th || fallbackText || '').trim(),
            en: String(en || fallbackText || '').trim()
        };
    }

    const text = String(value).trim();
    return { th: text || fallback, en: text || fallback };
}

function truncateLocalizedText(value, maxLength = 80, fallback = '') {
    const localized = toLocalizedText(value, fallback);
    return {
        th: String(localized.th || '').trim().slice(0, maxLength),
        en: String(localized.en || '').trim().slice(0, maxLength)
    };
}

function normalizeSuggestionItem(item, sectionName, index) {
    if (item == null) {
        return {
            title: { th: `${sectionName} ${index + 1}`, en: `${sectionName} ${index + 1}` },
            content: { th: '', en: '' }
        };
    }

    if (typeof item === 'object' && (item.title || item.content)) {
        return {
            title: toLocalizedText(item.title, `${sectionName} ${index + 1}`),
            content: truncateLocalizedText(item.content, 80, '')
        };
    }

    if (typeof item === 'object' && (item.th || item.en || item.text || item.value)) {
        const text = toLocalizedText(item, '');
        return {
            title: toLocalizedText(item.title || item.name || `${sectionName} ${index + 1}`, `${sectionName} ${index + 1}`),
            content: truncateLocalizedText(text, 80, '')
        };
    }

    const text = String(item).trim();
    const title = text.split(/[:\-–—\.\n]/).filter(Boolean)[0] || `${sectionName} ${index + 1}`;
    return {
        title: { th: title.trim(), en: title.trim() },
        content: truncateLocalizedText(text, 80, '')
    };
}

function normalizeSuggestionBucket(value, fallbackTitle) {
    const title = {
        th: fallbackTitle === 'Outstanding' ? 'ความโดดเด่น' : 'โอกาสในการพัฒนา',
        en: fallbackTitle
    };

    const extractItems = (source) => {
        const list = Array.isArray(source) ? source : [];
        return list.slice(0, 3).map((item, index) => {
            if (item && typeof item === 'object' && item.content) {
                return { content: truncateLocalizedText(item.content, 80, '') };
            }
            if (item && typeof item === 'object' && (item.th || item.en || item.text || item.value)) {
                return { content: truncateLocalizedText(item, 80, '') };
            }
            if (typeof item === 'string') {
                return { content: truncateLocalizedText(item, 80, '') };
            }
            return { content: { th: '', en: '' } };
        });
    };

    if (value && typeof value === 'object' && !Array.isArray(value)) {
        const existingTitle = value.title ? toLocalizedText(value.title, title.th) : title;
        const itemsSource = Array.isArray(value.items)
            ? value.items
            : Array.isArray(value) ? value : [];
        const items = extractItems(itemsSource);
        while (items.length < 3) items.push({ content: { th: '', en: '' } });
        return { title: existingTitle, items };
    }

    const items = extractItems(Array.isArray(value) ? value : []);
    while (items.length < 3) items.push({ content: { th: '', en: '' } });
    return { title, items };
}

function buildGeminiPrompt(rawValue) {
    return `วิเคราะห์ข้อความต่อไปนี้แล้วสรุปเป็น Outstanding และ Opportunity อย่างละ 3 ข้อ
ตอบกลับเป็น JSON เท่านั้น ห้ามมี markdown, คำอธิบายเพิ่มเติม หรือ code fence

รูปแบบผลลัพธ์:
{
    "outstanding": {
        "title": { "th": "...", "en": "..." },
        "items": [
            { "content": { "th": "...", "en": "..." } }
        ]
    },
    "opportunity": {
        "title": { "th": "...", "en": "..." },
        "items": [
            { "content": { "th": "...", "en": "..." } }
        ]
    }
}

เงื่อนไข:
- แต่ละหมวดต้องมี 3 รายการ
- items ต้องเก็บเฉพาะ content ของแต่ละข้อ
- content ต้องมีทั้งภาษาไทยและอังกฤษ
- content แต่ละภาษาไม่เกิน 80 ตัวอักษรเท่านั้น
- ห้ามซ้ำกันระหว่าง outstanding และ opportunity

ข้อความที่ต้องวิเคราะห์:
${rawValue}
`;
}

exports.onQuery = async function (request, response) {
    try {
        const query = {};
        if (request.body.id) query._id = new mongo.ObjectId(request.body.id);
        if (request.body.studentId) query.studentId = new mongo.ObjectId(request.body.studentId);

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
        const query = {};
        if (request.query.studentId) query.studentId = new mongo.ObjectId(request.query.studentId);

        const doc = await Evaluation.onQuerys(query);
        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        return ResMessage.sendResponse(response, 0, 40000);
    }
};

exports.onCreate = async function (request, response) {
    try {
        if (request.body.studentId) {
            const query = { studentId: new mongo.ObjectId(request.body.studentId) };
            const existing = await Evaluation.onQuery(query);
            if (existing && existing.length > 0) {
                return ResMessage.sendResponse(response, 0, 40000, 'Evaluation already exists for this student.');
            }
        }

        if (Array.isArray(request.body.sugestion)) {
            for (let i = 0; i < request.body.sugestion.length; i++) {
                const s = request.body.sugestion[i];
                const rawValue = s?.answer?.value;
                if (!rawValue) continue;
                if (typeof rawValue === 'object' && (Array.isArray(rawValue.outstanding) || Array.isArray(rawValue.opportunity))) continue;
                if (typeof rawValue !== 'string') continue;

                const prompt = buildGeminiPrompt(rawValue);
                try {
                    const gen = await generateText(prompt, { maxOutputTokens: 2048, temperature: 0.0 });
                    const parsed = tryParseJsonFromText(gen.text) || tryParseJsonFromText(JSON.stringify(gen.raw));
                    s.answer.value = parsed
                        ? {
                            outstanding: normalizeSuggestionBucket(parsed.outstanding, 'Outstanding'),
                            opportunity: normalizeSuggestionBucket(parsed.opportunity, 'Opportunity')
                        }
                        : {
                            outstanding: normalizeSuggestionBucket([], 'Outstanding'),
                            opportunity: normalizeSuggestionBucket([rawValue], 'Opportunity')
                        };
                } catch (err) {
                    console.warn('[evaluation] Gemini parse failed, falling back:', err?.message || err);
                    s.answer.value = {
                        outstanding: normalizeSuggestionBucket([], 'Outstanding'),
                        opportunity: normalizeSuggestionBucket([rawValue], 'Opportunity')
                    };
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
        const query = {};
        query._id = new mongo.ObjectId(request.body._id);
        const updateData = { ...request.body };
        delete updateData._id;

        if (Array.isArray(updateData.sugestion)) {
            for (let i = 0; i < updateData.sugestion.length; i++) {
                const s = updateData.sugestion[i];
                const rawValue = s?.answer?.value;
                if (!rawValue) continue;
                if (typeof rawValue === 'object' && (Array.isArray(rawValue.outstanding) || Array.isArray(rawValue.opportunity))) continue;
                if (typeof rawValue !== 'string') continue;

                const prompt = buildGeminiPrompt(rawValue);
                try {
                    const gen = await generateText(prompt, { maxOutputTokens: 65536, temperature: 0.0 });
                    const parsed = tryParseJsonFromText(gen.text) || tryParseJsonFromText(JSON.stringify(gen.raw));
                    s.answer.value = parsed
                        ? {
                            outstanding: normalizeSuggestionBucket(parsed.outstanding, 'Outstanding'),
                            opportunity: normalizeSuggestionBucket(parsed.opportunity, 'Opportunity')
                        }
                        : {
                            outstanding: normalizeSuggestionBucket([], 'Outstanding'),
                            opportunity: normalizeSuggestionBucket([rawValue], 'Opportunity')
                        };
                } catch (err) {
                    console.warn('[evaluation:update] Gemini parse failed, falling back:', err?.message || err);
                    s.answer.value = {
                        outstanding: normalizeSuggestionBucket([], 'Outstanding'),
                        opportunity: normalizeSuggestionBucket([rawValue], 'Opportunity')
                    };
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
        const query = {};
        query._id = new mongo.ObjectId(request.body._id);
        const doc = await Evaluation.onDelete(query);
        return ResMessage.sendResponse(response, 0, 20000, doc);
    } catch (err) {
        return ResMessage.sendResponse(response, 0, 40000);
    }
};

exports.onAverages = async function (request, response) {
    try {
        const studentId = request.query.studentId || request.body.studentId;
        console.log('===== AVERAGE CALCULATION START =====');
        console.log('1. Input studentId:', studentId);
        if (!studentId) {
            return ResMessage.sendResponse(response, 0, 40000, 'studentId is required');
        }

        const mongoose = require('mongoose');
        const Students = mongoose.model('Students');
        const EvaluationModel = mongoose.model('Competencies_Evaluation');

        const student = await Students.findById(studentId).lean();
        if (!student) {
            console.log('2. Student not found');
            return ResMessage.sendResponse(response, 0, 40000, 'Student not found');
        }
        console.log('2. Found student:', student.studentID);
        console.log('   - Program ID:', student.info?.program);
        console.log('   - Year data:', JSON.stringify(student.info?.year));

        const studentProgram = student.info?.program;
        const yearArr = student.info?.year;
        let yearValues = [];
        if (Array.isArray(yearArr)) {
            yearValues = yearArr.map(y => y.value).filter(Boolean);
        } else if (yearArr && typeof yearArr === 'object') {
            yearValues = [yearArr.value].filter(Boolean);
        } else if (yearArr) {
            yearValues = [String(yearArr)];
        }
        console.log('3. Extracted year values:', yearValues);
        if (yearValues.length === 0) {
            console.log('   -> No year values found, returning empty');
            return ResMessage.sendResponse(response, 0, 20000, { soft: [], hard: [], softCount: 0, hardCounts: {} });
        }

        const sameYearStudents = await Students.find({
            'info.year.value': { $in: yearValues }
        }).lean();

        console.log('4. Students in same academic year (' + yearValues.join(', ') + '):', sameYearStudents.length);
        sameYearStudents.forEach(s => {
            console.log('   -', s.studentID, '| Program:', s.info?.program, '| Year:', JSON.stringify(s.info?.year));
        });

        const sameYearStudentIds = sameYearStudents.map(s => s._id);
        const sameYearProgramMap = {};
        sameYearStudents.forEach(s => {
            sameYearProgramMap[String(s._id)] = s.info?.program ? String(s.info?.program) : null;
        });

        const evaluations = await EvaluationModel.find({
            studentId: { $in: sameYearStudentIds }
        }).lean();

        console.log('5. Evaluations found:', evaluations.length);
        evaluations.forEach(ev => {
            const sid = ev.studentId?._id || ev.studentId;
            const prog = sameYearProgramMap[String(sid)];
            const softCount = Array.isArray(ev.softskills) ? ev.softskills.length : 0;
            const hardCount = Array.isArray(ev.hardskills) ? ev.hardskills.length : 0;
            console.log('   - studentId:', String(sid), '| Program:', prog, '| Soft:', softCount, 'items, Hard:', hardCount, 'items');
            if (Array.isArray(ev.softskills)) {
                ev.softskills.forEach((item, i) => {
                    console.log('     Soft[' + i + '] score:', item.answer.score);
                });
            }
            if (Array.isArray(ev.hardskills)) {
                ev.hardskills.forEach((item, i) => {
                    console.log('     Hard[' + i + '] score:', item.answer.score);
                });
            }
        });

        const softCount = evaluations.length;
        const softScores = [];
        const hardByProgram = {};

        evaluations.forEach(ev => {
            const progId = sameYearProgramMap[String(ev.studentId)];

            if (Array.isArray(ev.softskills)) {
                ev.softskills.forEach((item, idx) => {
                    if (!softScores[idx]) softScores[idx] = [];
                    softScores[idx].push(Number(item.answer.score) || 0);
                });
            }

            if (Array.isArray(ev.hardskills) && progId) {
                if (!hardByProgram[progId]) hardByProgram[progId] = [];
                const arr = hardByProgram[progId];
                ev.hardskills.forEach((item, idx) => {
                    if (!arr[idx]) arr[idx] = [];
                    arr[idx].push(Number(item.answer.score) || 0);
                });
            }
        });

        console.log('6. Soft skill raw scores per index (all programs):');
        softScores.forEach((arr, idx) => {
            console.log('   Index[' + idx + '] scores:', JSON.stringify(arr), '-> sum:', arr.reduce((s, v) => s + v, 0), 'count:', arr.length);
        });

        const soft = softScores.map(arr => {
            if (!arr || arr.length === 0) return 0;
            const sum = arr.reduce((s, v) => s + v, 0);
            const avg = sum / arr.length;
            const rounded = Math.round(avg * 100) / 100;
            console.log('   -> Soft[' + softScores.indexOf(arr) + '] avg = ' + sum + ' / ' + arr.length + ' = ' + avg + ' (rounded: ' + rounded + ')');
            return rounded;
        });

        console.log('7. Hard skill raw scores per program:');
        Object.keys(hardByProgram).forEach(progId => {
            console.log('   Program:', progId);
            hardByProgram[progId].forEach((arr, idx) => {
                console.log('     Index[' + idx + '] scores:', JSON.stringify(arr), '-> sum:', arr.reduce((s, v) => s + v, 0), 'count:', arr.length);
            });
        });

        const hard = {};
        Object.keys(hardByProgram).forEach(progId => {
            hard[progId] = hardByProgram[progId].map(arr => {
                if (!arr || arr.length === 0) return 0;
                const sum = arr.reduce((s, v) => s + v, 0);
                const avg = sum / arr.length;
                const rounded = Math.round(avg * 100) / 100;
                console.log('     -> Hard[prog=' + progId + '][' + hardByProgram[progId].indexOf(arr) + '] avg = ' + sum + ' / ' + arr.length + ' = ' + avg + ' (rounded: ' + rounded + ')');
                return rounded;
            });
        });

        const hardCounts = {};
        Object.keys(hardByProgram).forEach(progId => {
            hardCounts[progId] = hardByProgram[progId].length > 0 ? hardByProgram[progId][0].length : 0;
        });

        const currentHard = hard[String(studentProgram)] || [];
        console.log('8. Current student program:', String(studentProgram));
        console.log('   Soft averages:', JSON.stringify(soft));
        console.log('   Hard averages (for this program):', JSON.stringify(currentHard));
        console.log('   Soft count:', softCount, '| Hard count:', hardCounts[String(studentProgram)] || 0);
        console.log('===== AVERAGE CALCULATION END =====');

        return ResMessage.sendResponse(response, 0, 20000, {
            soft,
            hard: currentHard,
            softCount,
            hardCount: hardCounts[String(studentProgram)] || 0
        });
    } catch (err) {
        console.error('[evaluation:averages]', err);
        return ResMessage.sendResponse(response, 0, 40000);
    }
};
