const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const userSchema = new Schema({
    id: {
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    gender:{
        type: String,
        required: true
    },
    DOB:{
        type: String,
        required: true
    },
    lineSwitch: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    fullNumber: {
        type: String,
        required: true
    },
    email:{ 
        type:String,
        required:true
    },
    password:{
        type: String,
        required: true
    },
    image: {
        data: Buffer,
        contentType: String
    },
    type:{
        type: String,
        required: true
    },
})
const users = mongoose.model('users', userSchema);
module.exports = users;