'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var objsSchema = new Schema({
    studentID: { type: String, default: null, unique: true, required: true },
    name: [{
        key: { type: String, default: null },
        value: { type: String, default: null },
    }],
    email: { type: String, default: null },
    info: {
        semester: { type: String, default: null },
        program: { type: mongoose.Schema.Types.ObjectId, ref: 'Academic_Program', default: null },
        school: { type: mongoose.Schema.Types.ObjectId, ref: 'Academic_School', default: null },
        course: { type: mongoose.Schema.Types.ObjectId, ref: 'Academic_Course', default: null },
        year: { type: String, default: new Date().getFullYear().toString() }
    },
    company: { type: String, default: null },
    evaluation: { type: mongoose.Schema.Types.ObjectId, ref: 'Competencies_Evaluation', default: null },
});

module.exports = mongoose.model('Students', objsSchema, 'Students');