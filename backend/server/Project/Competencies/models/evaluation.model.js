'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var evaluationSchema = new Schema({
    studentId: { type: Schema.Types.ObjectId, ref: 'Member_Students', required: true },
    softskills: [{
        criteriaId: { type: String, default: null },
        score: { type: Number, default: 0 }
    }],
    hardskills: [{
        criteriaId: { type: String, default: null },
        score: { type: Number, default: 0 }
    }],
    suggestions: [{
        criteriaId: { type: String, default: null },
        value: { type: String, default: '' }
    }],
}, { 埋: true, timestamps: true });

module.exports = mongoose.model('Competencies_Evaluation', evaluationSchema, 'Competencies_Evaluation');
