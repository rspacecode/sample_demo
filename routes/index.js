let express = require('express');
let router = express.Router();
let globalObj = require('../common/globalObj');

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send({data1: globalObj.deviceData1.data, data2: globalObj.deviceData2.data});
});

router.get('/bloodspace1', function (req, res, next) {
    let respo = {
        "reader": {
            "serial": "84:24:8D:F2:3A:AF",
            "fridge": -1
        }
    }
    let events = [];
    let added = [], removed = [];
    if (globalObj.deviceData1.data.tag_reads !== undefined) {

        if (globalObj.deviceData1.oldData.tag_reads !== undefined && globalObj.deviceData1.oldData.tag_reads !== globalObj.deviceData1.data.tag_reads) {
            let oldData = globalObj.deviceData1.oldData.tag_reads;
            let newdata = globalObj.deviceData1.data.tag_reads;
            newdata.forEach(function (newDataItem) {
                let isFound = false;
                oldData.forEach(function (oldDataItem) {
                    if (newDataItem.epc === oldDataItem.epc) {
                        isFound = true;
                    }
                });
                if (!isFound) {
                    added.push(newDataItem.epc)
                }
            });

            oldData.forEach(function (oldDataItem) {
                let isFound = false;
                newdata.forEach(function (newDataItem) {
                    if (oldDataItem.epc === newDataItem.epc) {
                        isFound = true;
                    }
                });
                if (!isFound) {
                    removed.push(oldDataItem.epc)
                }
            });
            if (added.length > 0) {
                events.push({
                    "EventType": "IN",
                    "inventory": added
                })
            }
            if (removed.length > 0) {
                events.push({
                    "EventType": "OUT",
                    "inventory": removed
                })
            }
            if (events.length > 0) {
                respo.event_id = globalObj.deviceData1.data.event_id;
                respo.events = events;
            }


        } else if (globalObj.deviceData1.data.tag_reads?.length > 0) {
            globalObj.deviceData1.data.tag_reads.forEach(function (item) {
                added.push(item.epc);

            });
            events.push({
                "EventType": "IN",
                "inventory": added
            })
            respo.event_id = globalObj.deviceData1.data.event_id;
            respo.events = events;
        }

    }
    res.send(respo);
});


router.get('/bloodspace2', function (req, res, next) {
    let respo = {
        "reader": {
            "serial": "84:24:8D:F2:3A:RJ",
            "fridge": -1
        }
    }
    let events = [];
    let added = [], removed = [];
    if (globalObj.deviceData2.data.tag_reads !== undefined) {

        if (globalObj.deviceData2.oldData.tag_reads !== undefined && globalObj.deviceData2.oldData.tag_reads !== globalObj.deviceData2.data.tag_reads) {
            let oldData = globalObj.deviceData2.oldData.tag_reads;
            let newdata = globalObj.deviceData2.data.tag_reads;
            newdata.forEach(function (newDataItem) {
                let isFound = false;
                oldData.forEach(function (oldDataItem) {
                    if (newDataItem.epc === oldDataItem.epc) {
                        isFound = true;
                    }
                });
                if (!isFound) {
                    added.push(newDataItem.epc)
                }
            });

            oldData.forEach(function (oldDataItem) {
                let isFound = false;
                newdata.forEach(function (newDataItem) {
                    if (oldDataItem.epc === newDataItem.epc) {
                        isFound = true;
                    }
                });
                if (!isFound) {
                    removed.push(oldDataItem.epc)
                }
            });
            if (added.length > 0) {
                events.push({
                    "EventType": "IN",
                    "inventory": added
                })
            }
            if (removed.length > 0) {
                events.push({
                    "EventType": "OUT",
                    "inventory": removed
                })
            }
            if (events.length > 0) {
                respo.event_id = globalObj.deviceData2.data.event_id;
                respo.events = events;
            }


        } else if (globalObj.deviceData2.data.tag_reads?.length > 0) {
            globalObj.deviceData2.data.tag_reads.forEach(function (item) {
                added.push(item.epc);

            });
            events.push({
                "EventType": "IN",
                "inventory": added
            })
            respo.event_id = globalObj.deviceData2.data.event_id;
            respo.events = events;
        }

    }
    res.send(respo);
});

module.exports = router;
