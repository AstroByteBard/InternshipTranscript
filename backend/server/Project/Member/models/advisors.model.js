'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var objsSchema = new Schema({
    organizationName: { type: String, default: null },
    address: {
        housenumber: { type: String, default: null },
        villagenumber: { type: String, default: null },
        building: { type: String, default: null },
        floor: { type: String, default: null },
        room: { type: String, default: null },
        road: { type: String, default: null },
        subdistrict: { type: String, default: null },
        district: { type: String, default: null },
        province: { type: String, default: null },
        postalcode: { type: String, default: null },
    },
    email: { type: String, default: null , required: true},    
    student: {type: mongoose.Schema.Types.ObjectId,  ref: 'Students', default: null},
    year: { type: String, default: new Date().getFullYear().toString()},
});

module.exports = mongoose.model('Advisors', objsSchema, 'Advisors');