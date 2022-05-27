const mongoose = require('mongoose');
const schema = mongoose.Schema;


const feedbackSchema = new schema({
    id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    Service: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
});

const feedback = mongoose.model('feedback', feedbackSchema);
module.exports = feedback;
