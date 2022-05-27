const mongoose = require('mongoose');
const schema = mongoose.Schema;

const appointmentSchema = new schema({
    id: {
        type: String,
        required: true
    },
    patient: {
        type: String,
        required: true
    },
    doctor: {
        type: String,
        required: true
    },
    day: {
        type: String,
        required: true
    },
    from: {
        type: String,
        required: true
    },
    to: {
        type: String,
        required: true
    },
    reserved: {
        type: Boolean,
        required: true
    }
})

const appointment = mongoose.model('appointment', appointmentSchema);
module.exports = appointment;