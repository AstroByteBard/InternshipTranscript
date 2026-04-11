'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var objsSchema = new Schema({
    year: { type: String, default: null },
    title: [{
        key: { type: String, default: null },
        value: { type: String, default: null },
    }],
    description: [{
        key: { type: String, default: null },
        value: { type: String, default: null },
    }],
    program: { type: mongoose.Schema.Types.ObjectId, ref: 'Academic_Program', default: null },
    config: [{
        label: [{
            key: { type: String, default: null },
            value: { type: String, default: null },
        }],
        question: [{
            key: { type: String, default: null },
            value: { type: String, default: null },
        }],

    }],
    active: { type: Boolean, default: false }
}, { timestamps: true });

objsSchema.pre('save', async function (next) {
    if (this.active === true) {
        await this.constructor.updateMany(
            { program: this.program, active: true, _id: { $ne: this._id } },
            { $set: { active: false } }
        );
    }
    next();
});

objsSchema.pre('findOneAndUpdate', async function (next) {
    const update = this.getUpdate();
    const isActiveTrue = update.active === true || (update.$set && update.$set.active === true);

    if (isActiveTrue) {
        const query = this.getQuery();
        const doc = await this.model.findOne(query);
        if (doc) {
            const programId = update.program || (update.$set && update.$set.program) || doc.program;
            if (programId) {
                await this.model.updateMany(
                    { program: programId, active: true, _id: { $ne: doc._id } },
                    { $set: { active: false } }
                );
            }
        }
    }
    next();
});

module.exports = mongoose.model('Competencies_Hardskill', objsSchema, 'Competencies_Hardskill');
