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
    config          : [{
        key            : {type: String, default: null},
        value          : [{
            key           : {type:String, default: null },
            value         : {type:String, default: null }
        }]
    }],
    active: {type: Boolean, default: false}
}, { timestamps: true});

module.exports = mongoose.model('Competencies_Softskill', objsSchema, 'Competencies_Softskill');
