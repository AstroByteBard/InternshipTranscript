'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var evaluationSchema = new Schema({
    studentId: { type: Schema.Types.ObjectId, ref: 'Students', required: true },
    softskills: [{
        answer: {
            title: {
                th: { type: String, default: '' },
                en: { type: String, default: '' }
            },
            score: { type: Number, default: 0 }
        }
    }],
    hardskills: [{
        answer: {
            title: {
                th: { type: String, default: '' },
                en: { type: String, default: '' }
            },
            score: { type: Number, default: 0 }
        }
    }],
    sugestion: [{
        answer: {
            title: {
                th: { type: String, default: '' },
                en: { type: String, default: '' }
            },
            value: { type: String, default: '' }
        }
    }],
}, { versionKey: false, timestamps: true });

module.exports = mongoose.model('Competencies_Evaluation', evaluationSchema, 'Competencies_Evaluation');
