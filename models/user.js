let bcrypt = require('bcrypt-nodejs');
let mongoose = require("mongoose");
let joigoose = require("joigoose")(mongoose);
let joi = require('@hapi/joi');


let userSchema = joi.object({
    userId: joi.string()
        .min(1)
        .max(12)
        .required(),
    password: joi.string(),
    firstName: joi.string(),
    lastName: joi.string(),
    email: joi.string().email(),
    _deviceToken: joi.string(),
    _webToken: joi.array().items(joi.string())
});


let mongooseSchema = joigoose.convert(userSchema);
mongooseSchema.updatedAt = {type: Date, default: Date.now};
mongooseSchema.createdAt = {type: Date, default: Date.now};
mongooseSchema.userId.unique = true;

module.exports = mongoose.model("user", mongooseSchema);
