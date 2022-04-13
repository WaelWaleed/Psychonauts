const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const doctorSchema = new Schema({
    id: {
        type: String,
        required: true
    },
    name:{
        type: String,
        required: true
    },
    DOB:{
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true,
    },
    About: {
        type: String,
        required: false
    },
    specifiedIn: {
        type: String,
        required: false
    }
});

const doctors = mongoose.model('doctors', doctorSchema);
module.exports = doctors;