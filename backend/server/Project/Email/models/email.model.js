'use strict';

var mongoose    = require('mongoose');
var Schema      = mongoose.Schema;

var objsSchema  = new Schema({
    title           : [{
        key            : {type: String, default: null},
        value          : {type: String, default: null},
    }],
    description     : [{
        key            : {type: String, default: null},
        value          : {type: String, default: null},
    }],
    templete        : {type: String , default: null},
    activity        : {type: Boolean, default: false},
    group           : {type: mongoose.Schema.Types.ObjectId, ref: 'Setting_Group', require: true },
});

module.exports = mongoose.model('Email_Templete', objsSchema, 'Email_Templete');
