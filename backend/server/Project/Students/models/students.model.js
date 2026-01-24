'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var objsSchema = new Schema({
    studentID           : {type: String, default: null, unique: true, required: true},
    name                : [{
        key             : {type: String, default: null},
        value           : {type: String, default: null},
    }],
    email               : {type: String, default: null},
    info                : {
        semester        : {type: Number, default: 1},
        major           : {type: mongoose.Schema.Types.ObjectId, ref: 'Setting_Major', default: null},
        school          : {type: mongoose.Schema.Types.ObjectId, ref: 'Setting_School', default: null},
        year            : {type: String, default: new Date().getFullYear().toString() } // For Present Year หรือ กำหมดให้ ค่าตั้งต้น เป็น ปีปัจจุบัน
    },
    status              : {type: mongoose.Schema.Types.ObjectId, ref: 'Setting_Status', default: "689c04cb255db4e56aea88ef" },
});

module.exports = mongoose.model('Students', objsSchema, 'Students');