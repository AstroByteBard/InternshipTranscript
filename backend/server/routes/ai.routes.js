const express = require('express');
const router = express.Router();
const { generateText } = require('../../helpers/gemini'); // ใช้ helper ที่มีอยู่
const EvaluationModel = require('../Project/Competencies/models/evaluation.model');

function toLocalizedText(value, fallback = '') {
    if (value == null) return { th: fallback, en: fallback };
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        const text = String(value).trim();
        return { th: text, en: text };
    }
    if (Array.isArray(value)) {
        const text = value.map(v => (v == null ? '' : String(v))).filter(Boolean).join(' ');
        return { th: text || fallback, en: text || fallback };
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
    const defaultTitle = fallbackTitle === 'Outstanding'
        ? { th: 'ความโดดเด่น', en: 'Outstanding' }
        : { th: 'โอกาสในการพัฒนา', en: 'Opportunity' };

    const extractItems = (source) => {
        const list = Array.isArray(source) ? source : [];
        const normalized = list.slice(0, 3).map((item, index) => normalizeSuggestionItem(item, fallbackTitle, index));
        while (normalized.length < 3) {
            normalized.push({
                title: { th: `${fallbackTitle} ${normalized.length + 1}`, en: `${fallbackTitle} ${normalized.length + 1}` },
                content: { th: '', en: '' }
            });
        }
        return normalized.map(item => ({ content: item.content }));
    };

    if (value && typeof value === 'object' && !Array.isArray(value)) {
        const title = value.title ? toLocalizedText(value.title, defaultTitle.th) : defaultTitle;
        const items = extractItems(value.items || value.itemsList || value.list || []);
        return { title, items };
    }

    const items = extractItems(Array.isArray(value) ? value : []);
    return { title: defaultTitle, items };
}

function buildSuggestionEntry(payload) {
    return {
        answer: {
            title: { th: 'AI Feedback', en: 'AI Feedback' },
            value: {
                outstanding: normalizeSuggestionBucket(payload?.outstanding, 'Outstanding'),
                opportunity: normalizeSuggestionBucket(payload?.opportunity, 'Opportunity')
            }
        }
    };
}

async function persistSuggestion(payload, body) {
    const studentId = body?.studentId;
    const evaluationId = body?.evaluationId;
    if (!studentId && !evaluationId) return null;

    const query = evaluationId ? { _id: evaluationId } : { studentId };
    const existing = await EvaluationModel.findOne(query);
    const suggestionEntry = buildSuggestionEntry(payload);

    if (existing) {
        existing.sugestion = Array.isArray(existing.sugestion) ? existing.sugestion : [];
        existing.sugestion.push(suggestionEntry);
        await existing.save();
        return existing;
    }

    if (!studentId) return null;

    const created = new EvaluationModel({
        studentId,
        sugestion: [suggestionEntry]
    });
    await created.save();
    return created;
}

async function handleFeedback(req, res) {
    try {
        const { feedback } = req.body || {};
        if (!feedback) return res.status(400).json({ error: 'feedback is required' });

        const prompt = `
วิเคราะห์ข้อความ feedback แล้วสรุปสั้นเป็น 2 หมวด: Outstanding และ Opportunity
ตอบกลับเป็น JSON เท่านั้น ห้ามมี markdown, คำอธิบาย, หรือ code fence

รูปแบบผลลัพธ์:
{
    "outstanding": {
        "items": [
            { "content": { "th": "...", "en": "..." } }
        ]
    },
    "opportunity": {
        "items": [
            { "content": { "th": "...", "en": "..." } }
        ]
    }
}

เงื่อนไข:
- แต่ละหมวดต้องมีรายการครบ 3 รายการ
- items ต้องเก็บเฉพาะ content ของแต่ละข้อ
- content ต้องมีทั้งภาษาไทยและอังกฤษ
- content แต่ละภาษาไม่เกิน 80 ตัวอักษรเท่านั้น
- อย่าใส่รายการซ้ำกันระหว่าง outstanding กับ opportunity
- ถ้าข้อมูลมีน้อย ให้สรุปจากบริบทที่มี แต่ยังต้องครบ 3 รายการต่อหมวด

ข้อความ:
${feedback}
`;

        const gen = await generateText(prompt, { maxOutputTokens: 65536, temperature: 0.0 });

        // Log model outputs for debugging
        try {
            console.log('[ai.routes] model text:', gen.text);
            console.log('[ai.routes] model raw:', JSON.stringify(gen.raw, null, 2));
        } catch (logErr) {
            console.warn('[ai.routes] failed to log model output', logErr?.message || logErr);
        }

        // Try to extract JSON from the model text (supports code fences and plain JSON)
        function tryParseJsonFromText(text) {
            if (!text || typeof text !== 'string') return null;
            // 1) code fence with ```json ... ```
            const codeFence = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
            let jsonText = codeFence ? codeFence[1] : null;
            // 2) fallback: first {...} block
            if (!jsonText) {
                const brace = text.match(/(\{[\s\S]*\})/);
                jsonText = brace ? brace[1] : null;
            }
            if (!jsonText) return null;
            try {
                return JSON.parse(jsonText);
            } catch (e) {
                // Try to cleanup common trailing-comma issues
                const cleaned = jsonText.replace(/,\s*([}\]])/g, '$1');
                try { return JSON.parse(cleaned); } catch (e2) { return null; }
            }
        }

        const parsed = tryParseJsonFromText(gen.text) || tryParseJsonFromText(JSON.stringify(gen.raw));
        if (parsed && (parsed.outstanding || parsed.opportunity)) {
            const payload = {
                outstanding: normalizeSuggestionBucket(parsed.outstanding, 'Outstanding'),
                opportunity: normalizeSuggestionBucket(parsed.opportunity, 'Opportunity')
            };
            const saved = await persistSuggestion(payload, req.body || {});

            return res.json({
                ...payload,
                saved: !!saved,
                savedSuggestionId: saved?._id || null
            });
        }

        // Fallback: return raw text when parsing failed
        return res.json({
            outstanding: normalizeSuggestionBucket([], 'Outstanding'),
            opportunity: normalizeSuggestionBucket([], 'Opportunity'),
            text: gen.text,
            raw: gen.raw
        });
    } catch (err) {
        console.error('AI analyze-feedback error:', err);
        return res.status(500).json({ error: err.message || String(err) });
    }
}

router.post('/analyze-feedback', handleFeedback);
router.post('/feedback-summary', handleFeedback);

module.exports = router;