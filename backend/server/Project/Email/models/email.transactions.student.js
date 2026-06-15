var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var emailTransactionStudentSchema = new Schema({
    template_id: { type: Schema.Types.ObjectId, ref: 'Email_Student' },
    student_id: { type: Schema.Types.ObjectId, ref: 'Students' },
    delivery_status: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' },
    sent_at: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Email_Transaction_Student', emailTransactionStudentSchema, 'Email_Transaction_Student');
