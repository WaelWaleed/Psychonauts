const mongoose = require('mongoose');
const schema = mongoose.Schema;

const Rates = new schema({
    email: {
        type: String,
        required: true
    },
    rate: {
        type: Number,
        required: true
    },
    NumOfRates: {
        type: Number,
        required: true
    },
});

const RateM = mongoose.model('RateM', Rates);
module.exports = RateM;