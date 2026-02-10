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
    active          : {type: Boolean, default: false},
}, { timestamps: true });

objsSchema.pre('findOneAndUpdate', async function(next) {
    const update = this.getUpdate();
    if (update.active === true) {
        await this.model.updateMany({ active: true }, { active: false });
    }
    next();
});

module.exports = mongoose.model('Email_Student', objsSchema, 'Email_Student');
