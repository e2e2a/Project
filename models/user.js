var mongoose = require("mongoose");
var bcrypt = require("bcrypt-nodejs");

var schema = mongoose.Schema({

        fullname: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        contact: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        role: {
            type: String,
            required: true
        },
        assign: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
    }, {
        versionKey: false,
        timestamps: true
    }
);

schema.pre('save', function (next) {
    const user = this;
    if (user.isModified('password') || user.isNew) {
        bcrypt.genSalt(10, function (error, salt) {
            if (error) return next(error);
            bcrypt.hash(user.password, salt, null, function (error, hash) {
                if (error) return next(error);
                user.password = hash;
                next(null, user);
            });
        });
    } else {
        next(null, user);
    }
});

schema.methods.comparePassword = function (password, callback) {
    bcrypt.compare(password, this.password, function (error, match) {
        if (error) callback(error);
        if (match) {
            callback(null, true);
        } else {
            callback(error, false);
        }
    });
};

module.exports = mongoose.model("Users", schema, "Users");