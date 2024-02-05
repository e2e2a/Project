var mongoose = require("mongoose");
var schema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', required: true
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    event: {
        type: String,
        required: true
    },
    requestorName: {
        type: String,
        required: true
    },
    formURL: {
        type: String,
        trim: false
    },
    status: {
        type: String,
        required:true
    }, 

}, {
    versionKey: false,
    timestamps: true
}
);


module.exports = mongoose.model("Request", schema, "Request");