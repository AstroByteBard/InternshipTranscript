'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const batchPrompt = require('../../helpers/batchPrompt');
const { createQueue } = require('../../helpers/queue');
const EvaluationModel = require('../Project/Competencies/models/evaluation.model');

/**
 * POST /api/v1/batch/evaluate
 * Submit evaluation → save to DB immediately → batch for AI suggestion generation.
 *
 * Body: { studentId, softskills, hardskills, sugestion }
 *
 * Response (collecting):  { status: 'collecting', batchId, collected, target }
 * Response (completed):   { status: 'completed', results: [...] }
 */
router.post('/evaluate', async (req, res) => {
    // Extend timeout for batch evaluation — Gemini can take 15-60s
    req.setTimeout(120000);
    try {
        const { studentId, softskills, hardskills, sugestion } = req.body || {};
        if (!studentId) {
            return res.status(400).json({ error: 'studentId is required' });
        }

        const existing = await EvaluationModel.findOne({ studentId }).lean();
        if (existing) {
            return res.status(400).json({ error: 'Evaluation already exists for this student.' });
        }

        const evaluation = await EvaluationModel.create({
            studentId,
            softskills: softskills || [],
            hardskills: hardskills || [],
            sugestion: sugestion || []
        });

        const result = await batchPrompt.addStudent({
            evaluationId: evaluation._id.toString(),
            studentId,
            softskills,
            hardskills
        });

        if (Array.isArray(result)) {
            return res.json({ status: 'completed', results: result });
        }

        return res.json({ status: 'collecting', ...result });
    } catch (err) {
        console.error('[batch:evaluate]', err);
        return res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/v1/batch/evaluate-queue
 * Same as above but via Bull queue with 15 RPM.
 */
router.post('/evaluate-queue', async (req, res) => {
    try {
        const { studentId, softskills, hardskills } = req.body || {};
        if (!studentId) {
            return res.status(400).json({ error: 'studentId is required' });
        }

        const formSubmissionQueue = createQueue('form-submission');
        const job = await formSubmissionQueue.add(
            { studentId, softskills, hardskills },
            {
                attempts: 3,
                backoff: { type: 'exponential', delay: 4000 }
            }
        );

        return res.json({
            status: 'queued',
            jobId: job.id,
            message: 'Form submission queued with 15 RPM rate limit'
        });
    } catch (err) {
        console.error('[batch:evaluate-queue]', err);
        return res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/v1/batch/status/:batchId
 * Check status and get results of a batch evaluation.
 */
router.get('/status/:batchId', async (req, res) => {
    try {
        const { batchId } = req.params;
        const status = await batchPrompt.getBatchStatus(batchId);
        return res.json(status);
    } catch (err) {
        console.error('[batch:status]', err);
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;
