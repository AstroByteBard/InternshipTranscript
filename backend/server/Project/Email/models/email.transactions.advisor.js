var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var emailTransactionAdvisorSchema = new Schema({
    template_id: { type: Schema.Types.ObjectId, ref: 'Email_Adviser' },
    adviser: { type: Schema.Types.ObjectId, ref: 'Advisors' },
    student_id: { type: Schema.Types.ObjectId, ref: 'Students' },
    delivery_status: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' },
    sent_at: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Email_Transaction_Advisor', emailTransactionAdvisorSchema, 'Email_Transaction_Advisor');
