let mongoose = require('mongoose');
let joi = require('@hapi/joi');
let joigoose = require("joigoose")(mongoose);
let Schema = mongoose.Schema;

let saleSchema = joi.object({
    saleId: joi.string().required(),
    custId: joi.string().required(),
    _userId: joi.string().required(),
});
let mongooseSchema = joigoose.convert(saleSchema);
mongooseSchema.updatedAt = {type: Date, default: Date.now};
mongooseSchema.createdAt = {type: Date, default: Date.now};
mongooseSchema.skuList = [{
    type: Schema.Types.ObjectId,
    require: true,
    ref: 'Sku'
}];

module.exports = mongoose.model("Sale", mongooseSchema);
