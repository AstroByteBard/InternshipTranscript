'use strict';

var mongoose    = require('mongoose');
var Schema      = mongoose.Schema;

var objsSchema  = new Schema({
    title: { type: String, default: null },
    locale:{ type: String, default: null },
    description: { type: String, default: null },
    template: { type: String, default: null },
    active: { type: Boolean, default: false },
}, { timestamps: true });

objsSchema.pre('findOneAndUpdate', async function(next) {
    const update = this.getUpdate();
    if (update.active === true) {
        await this.model.updateMany({ active: true }, { active: false });
    }
    next();
});

module.exports = mongoose.model('Email_Student', objsSchema, 'Email_Student');
