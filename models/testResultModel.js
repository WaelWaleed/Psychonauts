const mongoose = require('mongoose');
const schema = mongoose.Schema;

const resultSchema = new schema({
    id: {
        type: String,
        required: true
    },
    patient: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    testName: {
        type: String,
        required: true
    },
    result:{
        type: String,
        required: true
    },
    advice: {
        type: String,
        required: true
    },
});

const results = mongoose.model('results', resultSchema);
module.exports = results;