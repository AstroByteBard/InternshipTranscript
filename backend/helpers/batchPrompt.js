'use strict';

const redisClient = require('./redis');
const { generateText } = require('./gemini');

const BATCH_SIZE = 8;
const MAX_CHUNKS = 500; // safety: max 8×500 = 4,000 students per batch
const MAX_WAIT_MS = 15 * 60 * 1000;
const BATCH_TTL = 16 * 60; // 6 min — > MAX_WAIT_MS (15 min) เผื่อ timer drift
const RESULT_TTL = 5 * 60;

const ACTIVE_KEY = 'batch:evaluation:active';

class BatchPrompt {
    constructor() {
        this.timers = new Map();
    }

    async addStudent(studentData) {
        const { evaluationId, studentId, softskills, hardskills } = studentData;
        if (!studentId) throw new Error('studentId is required');

        // If Redis is down, skip batch — evaluation already saved in route handler
        if (!redisClient.isReady) {
            console.warn('[batchPrompt] Redis not ready — skipping batch, evaluation saved without AI feedback');
            return { batchId: null, collected: 0, target: BATCH_SIZE, status: 'redis_down' };
        }

        let batchId = await redisClient.get(ACTIVE_KEY);
        if (!batchId) {
            const newId = `batch_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
            const created = await redisClient.setNX(ACTIVE_KEY, newId, BATCH_TTL);
            batchId = created ? newId : await redisClient.get(ACTIVE_KEY);
        }

        const listKey = `batch:evaluation:list:${batchId}`;
        const payload = JSON.stringify({ evaluationId, studentId, softskills, hardskills });

        const count = await redisClient.rPush(listKey, payload);

        // First student — start 15-min max-wait timer
        if (count === 1) {
            await redisClient.expire(listKey, BATCH_TTL);
            this._scheduleMaxWaitFlush(batchId);
        }

        // Hit 8 → flush immediately
        if (count >= BATCH_SIZE) {
            const flushingKey = `batch:evaluation:flushing:${batchId}`;
            const locked = await redisClient.setNX(flushingKey, '1', 60);
            if (locked) {
                return this._flushBatch(batchId);
            }
        }

        return { batchId, collected: count, target: BATCH_SIZE };
    }

    async getBatchStatus(batchId) {
        const listKey = `batch:evaluation:list:${batchId}`;
        const resultKey = `batch:evaluation:result:${batchId}`;
        const count = await redisClient.lLen(listKey);
        const result = await redisClient.get(resultKey);

        return {
            batchId,
            collected: count,
            target: BATCH_SIZE,
            status: result ? 'completed' : 'collecting',
            result: result ? JSON.parse(result) : null
        };
    }

    async _flushBatch(batchId) {
        this._cancelTimer(batchId);

        const listKey = `batch:evaluation:list:${batchId}`;
        let firstResults = [];
        let chunkCount = 0;

        while (true) {
            if (chunkCount >= MAX_CHUNKS) {
                console.error(`[batchPrompt] Batch ${batchId}: hit MAX_CHUNKS (${MAX_CHUNKS}) — aborting loop`);
                // Release lock so new students can start a new batch
                const activeId = await redisClient.get(ACTIVE_KEY);
                if (activeId === batchId) await redisClient.delete(ACTIVE_KEY);
                await redisClient.delete(`batch:evaluation:flushing:${batchId}`);
                break;
            }

            // Claim only BATCH_SIZE items per chunk
            const items = await redisClient.lRange(listKey, 0, BATCH_SIZE - 1);
            if (items.length === 0) break;
            chunkCount++;

            // Determine how many remain after this claim
            const remaining = await redisClient.lLen(listKey);
            const isLast = remaining <= BATCH_SIZE;

            if (!isLast) {
                // More items left — trim the claimed chunk
                await redisClient.lTrim(listKey, BATCH_SIZE, -1);
                await redisClient.expire(listKey, BATCH_TTL);
            } else {
                // Last chunk — clean up all keys
                await redisClient.delete(listKey);
                const activeId = await redisClient.get(ACTIVE_KEY);
                if (activeId === batchId) {
                    await redisClient.delete(ACTIVE_KEY);
                }
                await redisClient.delete(`batch:evaluation:flushing:${batchId}`);
            }

            const students = items.map(item => JSON.parse(item));
            const results = await this._callGemini(students);
            await this._persistResults(results);

            if (chunkCount === 1) {
                firstResults = results; // return to the triggering request
            }

            const resultKey = `batch:evaluation:result:${batchId}`;
            await redisClient.setEx(resultKey, RESULT_TTL, JSON.stringify(results));

            if (isLast) break;
        }

        if (chunkCount > 1) {
            console.log(`[batchPrompt] Batch ${batchId}: ${chunkCount} chunks — ${firstResults.length || 0} results returned, rest persisted silently`);
        }

        return firstResults;
    }

    async _persistResults(results) {
        const mongoose = require('mongoose');
        const EvaluationModel = mongoose.model('Competencies_Evaluation');

        for (const r of results) {
            if (!r.evaluationId || !r.suggestion) continue;
            await this._persistWithRetry(EvaluationModel, r, 3);
        }
    }

    async _persistWithRetry(EvaluationModel, r, maxAttempts) {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                await EvaluationModel.findByIdAndUpdate(r.evaluationId, {
                    $push: {
                        sugestion: {
                            answer: {
                                title: { th: 'AI Feedback', en: 'AI Feedback' },
                                value: r.suggestion
                            }
                        }
                    }
                });
                return; // success
            } catch (err) {
                if (attempt === maxAttempts) {
                    console.error(`[batchPrompt] Failed to update evaluation ${r.evaluationId} after ${maxAttempts} attempts:`, err.message);
                } else {
                    console.warn(`[batchPrompt] Retry ${attempt}/${maxAttempts} for evaluation ${r.evaluationId}:`, err.message);
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 200));
                }
            }
        }
    }

    async _callGemini(students, retries = 3) {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const prompt = this._buildPrompt(students);
                const gen = await generateText(prompt, {
                    maxOutputTokens: 65536,
                    temperature: 0.0,
                    timeout: 60000
                });
                return this._parseResponse(gen.text, students);
            } catch (err) {
                const isRetryable = err.status === 429 || err.code === 'ECONNABORTED' || err.message?.includes('timeout');
                if (attempt < retries && isRetryable) {
                    const delay = Math.pow(2, attempt) * 1000;
                    console.warn(`[batchPrompt] Gemini call attempt ${attempt}/${retries} failed (${err.status || err.code || err.message}), retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    throw err;
                }
            }
        }
    }

    _buildPrompt(students) {
        return `You are an internship competency evaluator. Analyze each student's skills and provide structured feedback.

Input (JSON array of ${students.length} students):
${JSON.stringify(students, null, 2)}

For each student, analyze their soft skills and hardskills, then provide 3 outstanding items and 3 opportunity items.

Return ONLY a valid JSON array — no markdown, no code fences, no explanation:
[
    {
        "studentId": "...",
        "suggestion": {
            "outstanding": {
                "title": { "th": "ความโดดเด่น", "en": "Outstanding" },
                "items": [
                    { "content": { "th": "...", "en": "..." } }
                ]
            },
            "opportunity": {
                "title": { "th": "โอกาสในการพัฒนา", "en": "Opportunity" },
                "items": [
                    { "content": { "th": "...", "en": "..." } }
                ]
            }
        }
    }
]

Rules:
- Each category must have exactly 3 items per student
- Content must be in both Thai and English
- Each language max 80 characters
- No duplicate items across categories for the same student
- Return exactly ${students.length} objects in the array
- studentId must match exactly the input studentId`;
    }

    _parseResponse(text, students) {
        let jsonArray = null;

        const codeFence = text.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/i);
        if (codeFence) {
            try { jsonArray = JSON.parse(codeFence[1]); } catch (e) { /* ignore */ }
        }

        if (!jsonArray) {
            const bracket = text.match(/(\[[\s\S]*\])/);
            if (bracket) {
                try { jsonArray = JSON.parse(bracket[1]); } catch (e) {
                    try { jsonArray = JSON.parse(bracket[1].replace(/,\s*([}\]])/g, '$1')); } catch (e2) { /* ignore */ }
                }
            }
        }

        if (Array.isArray(jsonArray)) {
            return students.map(s => {
                const studentIdStr = String(s.studentId);
                const match = jsonArray.find(r => String(r.studentId) === studentIdStr);
                if (match && match.suggestion) {
                    return {
                        evaluationId: s.evaluationId,
                        studentId: s.studentId,
                        suggestion: {
                            outstanding: this._ensureBucket(match.suggestion.outstanding, 'Outstanding'),
                            opportunity: this._ensureBucket(match.suggestion.opportunity, 'Opportunity')
                        }
                    };
                }
                return {
                    evaluationId: s.evaluationId,
                    studentId: s.studentId,
                    suggestion: this._emptySuggestion()
                };
            });
        }

        return students.map(s => ({
            evaluationId: s.evaluationId,
            studentId: s.studentId,
            suggestion: this._emptySuggestion()
        }));
    }

    _emptySuggestion() {
        return {
            outstanding: {
                title: { th: 'ความโดดเด่น', en: 'Outstanding' },
                items: []
            },
            opportunity: {
                title: { th: 'โอกาสในการพัฒนา', en: 'Opportunity' },
                items: []
            }
        };
    }

    _ensureBucket(bucket, titleEn) {
        if (!bucket || typeof bucket !== 'object') return this._emptySuggestion()[titleEn.toLowerCase() === 'outstanding' ? 'outstanding' : 'opportunity'];
        const titleTh = titleEn === 'Outstanding' ? 'ความโดดเด่น' : 'โอกาสในการพัฒนา';
        return {
            title: {
                th: bucket.title?.th || titleTh,
                en: bucket.title?.en || titleEn
            },
            items: (Array.isArray(bucket.items) ? bucket.items : []).slice(0, 3)
        };
    }

    _scheduleMaxWaitFlush(batchId) {
        this._cancelTimer(batchId);
        this.timers.set(batchId, setTimeout(async () => {
            const listKey = `batch:evaluation:list:${batchId}`;
            try {
                const flushingKey = `batch:evaluation:flushing:${batchId}`;
                const locked = await redisClient.setNX(flushingKey, '1', 60);
                if (!locked) return;

                const count = await redisClient.lLen(listKey);
                if (count > 0) {
                    console.log(`[batchPrompt] Max wait reached, flushing ${count} students`);
                    await this._flushBatch(batchId);
                }
            } catch (err) {
                console.error('[batchPrompt] max-wait flush error:', err.message);
            }
            this.timers.delete(batchId);
        }, MAX_WAIT_MS));
    }

    _cancelTimer(batchId) {
        const timer = this.timers.get(batchId);
        if (timer) {
            clearTimeout(timer);
            this.timers.delete(batchId);
        }
    }
}

module.exports = new BatchPrompt();
