let express = require('express');
let router = express.Router();
let sale = require('../models/sale');
let sku = require('../models/sku');

let globalObj = require('../common/globalObj');

/* GET sale listing. */
router.get('/', async (req, res) => {
    await sale.find({}, async (err, result) => {
        if (!err) {
            return res.json(globalObj.getResponseObject(true, {}, {}, result));
        } else
            return res.json(globalObj.getResponseObject(false, {msg: err.message}, {}));
    }).populate('skuList')
});


/* GET sale listing. */
router.post('/', async (req, res) => {
    let mCount = await sale.countDocuments({});
    req.body.saleId = "SALE/" + (mCount + 1);
    req.body._userId = req.body.cUser.userId;
    await sku.find({_id: {$in: req.body.skuList}}, async (err, skuResult) => {
        if (!err) {
            if (skuResult.length !== req.body.skuList.length) {
                return res.json(globalObj.getResponseObject(false, {msg: globalObj.INVALID_REQUEST + " NFG"}));
            } else {
                await sale.create(req.body, async (err, result) => {
                    if (!err) {
                        for await (let resultElement of skuResult) {
                            resultElement.status = 'sold';
                            await resultElement.save();
                        }
                        return res.json(globalObj.getResponseObject(true, {}, result));
                    } else
                        return res.json(globalObj.getResponseObject(false, {msg: err.message}, {}));
                })
            }
        }
    });
});

module.exports = router;
