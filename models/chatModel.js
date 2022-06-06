const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chats = new Schema({
    sender: {
        type: String,
        required: true
    },
    receiver: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    time: {
        type: Date,
        required: false
    },
});

const chatM = mongoose.model('chatM', chats);
module.exports = chatM;