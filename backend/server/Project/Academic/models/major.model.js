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
    school          : {type: mongoose.Schema.Types.ObjectId, ref: 'Setting_School', default: null },
    create          : {
        by              : {type: mongoose.Schema.Types.ObjectId, ref: 'Information_Accounts'},
        datetime        : {type: Date, default: Date.now}
    },
});

module.exports = mongoose.model('Setting_Major', objsSchema, 'Setting_Major');
