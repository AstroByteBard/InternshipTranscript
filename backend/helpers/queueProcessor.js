'use strict';

const { createQueue } = require('./queue');
const batchPrompt = require('./batchPrompt');
const EvaluationModel = require('../server/Project/Competencies/models/evaluation.model');

function initQueueProcessors() {
    const formSubmissionQueue = createQueue('form-submission');

    formSubmissionQueue.process(async (job) => {
        const { studentId, softskills, hardskills } = job.data;
        console.log(`[queueProcessor] Processing form submission for student ${studentId}`);

        const existing = await EvaluationModel.findOne({ studentId }).lean();
        if (!existing) {
            await EvaluationModel.create({
                studentId,
                softskills: softskills || [],
                hardskills: hardskills || [],
                sugestion: []
            });
        }

        const evalDoc = await EvaluationModel.findOne({ studentId }).lean();
        const result = await batchPrompt.addStudent({
            evaluationId: evalDoc._id.toString(),
            studentId,
            softskills,
            hardskills
        });

        if (Array.isArray(result)) {
            console.log(`[queueProcessor] Batch completed with ${result.length} results`);
        }

        return result;
    });

    console.log('[queueProcessor] Form submission processor registered');
}

module.exports = { initQueueProcessors };
