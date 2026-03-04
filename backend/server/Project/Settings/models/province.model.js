'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var objsSchema = new Schema({
    title           : [{
        key            : {type: String, default: null},
        value          : {type: String, default: null},
    }]
});

module.exports = mongoose.model('Setting_Province', objsSchema, 'Setting_Province');
