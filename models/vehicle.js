var mongoose = require("mongoose");
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
    color: {
        type: String,
        trim: false
    },
    type: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },

}, {
    versionKey: false,
    timestamps: true
}
);


module.exports = mongoose.model("Vehicle", schema, "Vehicle");