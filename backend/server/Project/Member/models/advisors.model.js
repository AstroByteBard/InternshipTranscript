'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var objsSchema = new Schema({
    organizationName: { type: String, default: null },
    organizationAddress: { type: String, default: null },
    province: { type: mongoose.Schema.Types.ObjectId, ref: 'Setting_Province', default: null },
    email: { type: String, default: null, required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Students', default: null },
    year: { type: String, default: new Date().getFullYear().toString() },
});

module.exports = mongoose.model('Advisors', objsSchema, 'Advisors');