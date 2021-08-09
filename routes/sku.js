let express = require('express');
let router = express.Router();
let globalObj = require('../common/globalObj');
let uuid = require('uuid');

/* Post sku listing. */
router.post('/data1', async (req, res) => {
    console.log(req.body)
    req.body.date = new Date();
    req.body.event_id = uuid.v4();
    globalObj.deviceData1.oldData = globalObj.deviceData1.data;
    globalObj.deviceData1.data = req.body;
    res.json(globalObj.getResponseObject(true, {}, req.body));
});

/* Post sku listing. */
router.post('/data2', async (req, res) => {
    console.log(req.body)
    req.body.date = new Date();
    req.body.event_id = uuid.v4();
    globalObj.deviceData2.oldData = globalObj.deviceData2.data;
    globalObj.deviceData2.data = req.body;
    res.json(globalObj.getResponseObject(true, {}, req.body));
});

module.exports = router;
