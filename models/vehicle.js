var mongoose = require("mongoose");
const allCategory = [
    'Motorcycle Vehicles', 'Heavy Equipment Vehicles', 'Military Vehicles', '4-Wheel Vehicles'
]
var schema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', required: true
    },
    brand: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true
    },
    plateNumber: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: allCategory,
        required: true
    },
    qty: {
        type: Number,
        required: true
    },

}, {
    versionKey: false,
    timestamps: true
}
);


module.exports = mongoose.model("Vehicle", schema, "Vehicle");