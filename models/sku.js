let mongoose = require("mongoose");
let joigoose = require("joigoose")(mongoose);
let joi = require('@hapi/joi');

let skuSchema = joi.object({
    skuNumber: joi.string()
        .min(1)
        .max(12)
        .required(),
    salePrice: joi.number(),
    category: joi.string(),
    code: joi.string(),
    imgPath: joi.array().items(joi.string()),
    status: joi.string(),
});

let mongooseSchema = joigoose.convert(skuSchema);
mongooseSchema.updatedAt = {type: Date, default: Date.now};
mongooseSchema.createdAt = {type: Date, default: Date.now};
mongooseSchema.skuNumber.unique = true;

module.exports = mongoose.model("Sku", mongooseSchema);
