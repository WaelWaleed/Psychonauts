const mongoose = require('mongoose');
const schema = mongoose.Schema;

const FeedBackOnDoctor = new schema({
    user: {
        type: String,
        required: true
    },
    doctor: {
        type: String,
        required: true
    },
    message: {
        type:String,
        required: true
    },
    rate: {
        type: Number,
        required: true
    },
});

const DocFeedbackM = mongoose.model('DocFeedbackM', FeedBackOnDoctor );
module.exports = DocFeedbackM;