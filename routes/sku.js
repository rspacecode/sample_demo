let express = require('express');
let router = express.Router();
let sku = require('../models/sku');
let globalObj = require('../common/globalObj');
let multer = require('multer');
let csvtojson = require('csvtojson');

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploadDir');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname.split('.')[0] + '-' + Date.now('dd-MM-yyyy') + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]);
    }
});
let fileUpload = multer({storage: storage}).single('file');


/* GET sku listing. */
router.get('/', async (req, res) => {
    await sku.find({}, (err, result) => {
        if (!err) {
            res.json(globalObj.getResponseObject(true, {}, {}, result));
        } else {
            res.json(globalObj.getResponseObject(false, {msg: err.message}, {}));
        }
    })
});

/* Post sku listing. */
router.post('/', async (req, res) => {
    await sku.create(req.body, (err, result) => {
        if (!err) {
            res.json(globalObj.getResponseObject(true, {}, result));
        } else {
            res.json(globalObj.getResponseObject(false, {msg: err.message}, {}));
        }
    })
});

router.post('/upload', fileUpload, async (req, res) => {
    if (req.file.mimetype === 'text/csv' || req.file.mimetype === 'application/vnd.ms-excel' || req.file.mimetype === 'application/octet-stream') {
        let tempSKU = await csvtojson().fromFile(req.file.path);
        await sku.create(tempSKU, (err, result) => {
            if (!err) {
                return res.json(globalObj.getResponseObject(true, {}, result));
            } else {
                return res.json(globalObj.getResponseObject(false, {msg: err.message}, {}));
            }
        });
    } else {
        return res.json(globalObj.getResponseObject(false, {msg: globalObj.INVALID_REQUEST}));
    }
});

module.exports = router;
