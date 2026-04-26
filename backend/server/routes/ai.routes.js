const express = require('express');
const router = express.Router();
const { generateText } = require('../../helpers/gemini'); // ใช้ helper ที่มีอยู่

async function handleFeedback(req, res) {
    try {
        const { feedback } = req.body || {};
        if (!feedback) return res.status(400).json({ error: 'feedback is required' });

        const prompt = `
แยกข้อความนี้เป็น Outstanding และ Opportunity
ตอบ JSON เท่านั้น ตามรูปแบบ:
{ "outstanding": [...], "opportunity": [...] }

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
            return res.json({
                outstanding: Array.isArray(parsed.outstanding) ? parsed.outstanding : [],
                opportunity: Array.isArray(parsed.opportunity) ? parsed.opportunity : [],
                text: gen.text,
                raw: gen.raw
            });
        }

        // Fallback: return raw text when parsing failed
        return res.json({ text: gen.text, raw: gen.raw });
    } catch (err) {
        console.error('AI analyze-feedback error:', err);
        return res.status(500).json({ error: err.message || String(err) });
    }
}

router.post('/analyze-feedback', handleFeedback);
router.post('/feedback-summary', handleFeedback);

module.exports = router;