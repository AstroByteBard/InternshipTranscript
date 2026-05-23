'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var objsSchema = new Schema({
    title: { type: String, default: null },
    status: { type: String, default: 'Draft' }, // Draft, Active, Retired
    content: { type: Schema.Types.Mixed, default: {} }, // Stores Konva JSON structure
    create: {
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'Information_Accounts', default: null },
        datetime: { type: Date, default: Date.now }
    },
    update: {
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'Information_Accounts', default: null },
        datetime: { type: Date, default: Date.now }
    }
}, { minimize: false });

module.exports = mongoose.model('Information_Documents', objsSchema, 'Information_Documents');
