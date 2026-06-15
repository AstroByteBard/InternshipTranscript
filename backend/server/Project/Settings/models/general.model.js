const mongoose = require('mongoose');

const AISchema = new mongoose.Schema({
    apiKey: { type: String, default: '' },
    modelName: { type: String, default: 'gemini-3.1-flash-lite' },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AI_Settings', AISchema, 'AI_Settings');