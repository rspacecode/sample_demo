let express = require('express');
let router = express.Router();
let salePerformance = require('../model/salePerformance');
let moment = require('moment');
let stObj = require('../comman/staticObjects');
let groupBy = require('json-groupby');
let skud = require('../model/sku');
let customers = require('../model/customer');
let routUser = require('../model/user');


router.get('/', async function (req, res) {
    let mQuery = await stObj.queryBuilder(req, res);
    await salePerformance.find(mQuery, async function (err, userRes) {
        if (err) {
            res.json(stObj.getResponseObject(false, err, {}, []));
        } else if (userRes != null) {
            let pageNo = parseInt(req.query.page_no);
            let pageNoNext = parseInt(req.query.page_no) + 1;
            let limit = parseInt(req.query.limit);
            pageNo = pageNo * limit;
            pageNoNext = pageNoNext * limit;
            let currentRecords = await salePerformance.find(mQuery).skip(pageNo).limit(limit).sort({createdAt: -1});
            let nextRecords = await salePerformance.find(mQuery).skip(pageNoNext).limit(limit).sort({createdAt: -1});
            let hasNext = false;
            if (nextRecords.length > 0)
                hasNext = true;
            await salePerformance.countDocuments(mQuery, async function (error, numOfDocs) {
                for await (let salePElement of currentRecords) {
                    let action = [];
                    if (salePElement.action.quoteList !== undefined && salePElement.action.quoteList.length > 0) {
                        let obj = {};
                        obj.key = "quoteList";
                        let skuList = [];
                        for await (let skuElement of salePElement.action.quoteList) {
                            skuList.push(JSON.stringify(skuElement));
                        }
                        obj.skuList = skuList;
                        action.push(obj);
                    }
                    if (salePElement.action.sharedList !== undefined && salePElement.action.sharedList.length > 0) {
                        let obj = {};
                        obj.key = "sharedList";
                        let skuList = [];
                        for await (let skuElement of salePElement.action.sharedList) {
                            skuList.push(JSON.stringify(skuElement));
                        }
                        obj.skuList = skuList;
                        action.push(obj);
                    }
                    if (salePElement.action.orderList !== undefined && salePElement.action.orderList.length > 0) {
                        let obj = {};
                        obj.key = "orderList";
                        let skuList = [];
                        for await (let skuElement of salePElement.action.orderList) {
                            skuList.push(JSON.stringify(skuElement));
                        }
                        obj.skuList = skuList;
                        action.push(obj);
                    }
                    if (salePElement.action.memoList !== undefined && salePElement.action.memoList.length > 0) {
                        let obj = {};
                        obj.key = "memoList";
                        let skuList = [];
                        for await (let skuElement of salePElement.action.memoList) {
                            skuList.push(JSON.stringify(skuElement));
                        }
                        obj.skuList = skuList;
                        action.push(obj);
                    }
                    if (salePElement.action.saleList !== undefined && salePElement.action.saleList.length > 0) {
                        let obj = {};
                        obj.key = "saleList";
                        let skuList = [];
                        for await (let skuElement of salePElement.action.saleList) {
                            skuList.push(JSON.stringify(skuElement));
                        }
                        obj.skuList = skuList;
                        action.push(obj);
                    }
                    salePElement.action = action;
                    salePElement.customer = JSON.stringify(salePElement.customer);
                }

                res.json(stObj.getResponseObject(true, {}, {
                    "hasNext": hasNext,
                    "totalPage": Math.ceil(numOfDocs / limit),
                    "totalRecords": numOfDocs,
                    "currentPage": pageNo
                }, currentRecords));
            });
        } else {
            res.json(stObj.getResponseObject(false, {"message": "User not found"}, {}, []));
        }
    });
});


//* Create Sales Performance. *//
router.post('/', async function (req, res, next) {
    req.body.user = req.body.decoded.username;
    req.body.sName = req.body.decoded.name;
    req.body.root = req.body.decoded.root;
    try {
        req.body.customer = JSON.parse(req.body.customer);
    } catch (e) {
        return res.json(stObj.getResponseObject(false, {msg: "Customer was not in string it's an object by "}, {}, []));
    }
    if (req.body.startTimeStamp === "0" || req.body.endTimeStamp === "0") {
        return res.json(stObj.getResponseObject(false, {msg: "Invalid startTimeStamp"}, {}, []));
    }
    let skuList = [];
    if (req.body.skuList.length > 0) {
        for await (let skuListElement of req.body.skuList) {
            try {
                skuList.push(JSON.parse(skuListElement));
            } catch (e) {
                skuList.push(skuListElement);
            }
        }
    } else {
        return res.json(stObj.getResponseObject(false, {msg: "skuList not found"}, {}, []));
    }
    req.body.skuList = skuList;
    let action = {};
    let skuActionArray = [];
    if (req.body.action !== undefined) {
        for (let actionElement of req.body.action) {
            skuActionArray = [];
            if (actionElement.key === 'saleList') {
                for await (let skuListElement of actionElement.skuList) {
                    try {
                        skuActionArray.push(JSON.parse(skuListElement));
                    } catch (e) {
                        skuActionArray.push(skuListElement);
                    }
                }
                action.saleList = skuActionArray;
            }
            skuActionArray = [];

            if (actionElement.key === 'memoList') {
                for await (let skuListElement of actionElement.skuList) {
                    try {
                        skuActionArray.push(JSON.parse(skuListElement));
                    } catch (e) {
                        skuActionArray.push(skuListElement);
                    }
                }
                action.memoList = skuActionArray;
            }
            skuActionArray = [];

            if (actionElement.key === 'quoteList') {
                for await (let skuListElement of actionElement.skuList) {
                    try {
                        skuActionArray.push(JSON.parse(skuListElement));
                    } catch (e) {
                        skuActionArray.push(skuListElement);
                    }
                }
                action.quoteList = skuActionArray;
            }
            skuActionArray = [];

            if (actionElement.key === 'sharedList') {
                for await (let skuListElement of actionElement.skuList) {
                    try {
                        skuActionArray.push(JSON.parse(skuListElement));
                    } catch (e) {
                        skuActionArray.push(skuListElement);
                    }
                }
                action.sharedList = skuActionArray;
            }
            skuActionArray = [];

            if (actionElement.key === 'orderList') {
                for await (let skuListElement of actionElement.skuList) {
                    try {
                        skuActionArray.push(JSON.parse(skuListElement));
                    } catch (e) {
                        skuActionArray.push(skuListElement);
                    }
                }
                action.orderList = skuActionArray;
            }
            req.body.action = action;
        }
    } else {
        return res.json(stObj.getResponseObject(false, {
            code: '0001',
            msg: "action element not found in body."
        }, {}, []));
    }
    req.body.isSynced = true;
    await salePerformance.create(req.body, async function (err, saleP) {
        if (err) {
            res.json(stObj.getResponseObject(false, err, {}, []));
        } else {
            res.json(stObj.getResponseObject(true, {}, saleP, []));
            let originalBody = saleP;
            originalBody.isSynced = true;
            originalBody.action = [];
            originalBody.customer = JSON.stringify(saleP.customer);
            stObj.app.notificationUtil.notify(req, stObj.notificationCode.add_report, originalBody, []);
        }
    });
});


//Data Dashboard Graph Top Design Viewed and sold
router.get('/topDesigns', async function (req, res) {
    let mQuery = await stObj.queryBuilder(req, res);
    let from = req.query.from;
    let to = req.query.to;
    if (from !== undefined && to !== undefined && from.length > 0 && to.length > 0) {
        mQuery["createdAt"] = {"$gte": new Date(from), "$lt": new Date(to)}
    }
    await salePerformance.find(mQuery, async (err, respo) => {
        if (err) {
            return res.json(stObj.getResponseObject(false, {msg: err.toString()}, {}, []));
        } else if (respo.length > 0) {
            let viewedList = [];
            let soldList = [];
            for await (let mRespo of respo) {
                for await (let data of mRespo.skuList) {
                    let viewItem = {};
                    viewItem.design_code = data.design_code;
                    viewItem.qty = 1;
                    viewItem.amount = data.sales_value;
                    let skus = [];
                    skus.push(data.sku_number);
                    viewItem.skus = skus;
                    let isFound = false;
                    for await (let delta of viewedList) {
                        if (delta.design_code === data.design_code) {
                            if (data.sales_value !== undefined && data.sales_value > 0) {
                                isFound = true;
                                delta.qty = delta.qty + 1;
                                delta.amount = delta.amount + data.sales_value;
                                delta.skus.push(data.sku_number);
                            }
                        }
                    }
                    if (!isFound) {
                        viewedList.push(viewItem);
                    }

                }
                for await (let data of mRespo.action.saleList) {
                    let viewItem = {};
                    viewItem.design_code = data.design_code;
                    viewItem.qty = 1;
                    viewItem.amount = data.sales_value;
                    let isFound = false;
                    let skus = [];
                    skus.push(data.sku_number);
                    viewItem.skus = skus;
                    for await (var delta of soldList) {
                        if (delta.design_code === data.design_code) {
                            isFound = true;
                            delta.qty = delta.qty + 1;
                            delta.amount = delta.amount + data.sales_value;
                            delta.skus.push(data.sku_number);
                        }
                    }
                    if (!isFound) {
                        soldList.push(viewItem);
                    }
                }
            }
            let re = {};
            re.soldList = await soldList.sort(function (a, b) {
                return b.amount - a.amount;
            }).slice(0, 10);
            re.viewedList = await viewedList.sort(function (a, b) {
                return b.amount - a.amount;
            }).slice(0, 10);
            for await (let soldListElement of re.soldList) {
                soldListElement.amount = parseFloat(soldListElement.amount).toFixed(2)
            }
            for await (let viewedListElement of re.viewedList) {
                viewedListElement.amount = parseFloat(viewedListElement.amount).toFixed(2)
            }
            return res.json(stObj.getResponseObject(true, {}, re, []));
        } else {
            return res.json(stObj.getResponseObject(true, {}, {}, []));
        }
    });
});
/*  */
router.get('/topCategories', async function (req, res, next) {
    let from = req.query.from;
    let to = req.query.to;
    let mQuery = await stObj.queryBuilder(req, res);
    if (from !== undefined && to !== undefined && from.length > 0 && to.length > 0) {
        mQuery["createdAt"] = {"$gte": new Date(from), "$lt": new Date(to)}
    }
    let type = req.query.type;
    let aggregatorOpts = [];
    if (type === 'view') {
        aggregatorOpts = [
            {$unwind: '$skuList'},
            {$match: mQuery},
            {
                $group: {
                    _id: "$skuList.design_category",
                    // sku: "$skuList.sku_numn",
                    skus: {"$push": "$skuList.sku_number"},
                    // design_category: { "$addToSet": "$skuList.design_category" },
                    viewCount: {"$sum": 1}
                }
            }
        ];
    } else if (type === 'sold') {
        aggregatorOpts = [
            {$unwind: '$action.saleList'},
            {$match: mQuery},
            {
                $group: {
                    _id: "$action.saleList.design_category",
                    skus: {"$push": "$action.saleList.sku_number"},
                    // design_category: { "$push": "$action.saleList.design_category" },
                    design_category: {"$addToSet": "$action.saleList.design_category"},
                    soldCount: {"$sum": 1}
                }
            }

        ];
    } else if (type === 'share') {
        aggregatorOpts = [
            {$unwind: '$action.sharedList'},
            {$match: mQuery},
            {
                $group: {
                    _id: "$action.sharedList.design_category",
                    skus: {"$push": "$action.sharedList.sku_number"},
                    // design_category: { "$push": "$action.sharedList.design_category" },
                    design_category: {"$addToSet": "$action.sharedList.design_category"},
                    shareCount: {"$sum": 1}
                }
            }

        ];
    }
    await salePerformance.aggregate(aggregatorOpts, async function (err, respo) {
        if (err) {
            return res.json(stObj.getResponseObject(false, {'msg': err.toString()}, {}, {}));
        } else {
            let aggregatorOpts = [];
            if (type === 'view') {
                aggregatorOpts = [
                    {$unwind: '$skuList'},
                    {$match: mQuery},
                    {
                        $group: {
                            _id: "$skuList.design_category",
                            skus: {"$push": "$skuList.sku_number"},
                            design_category: {"$addToSet": "$skuList.design_category"},
                            viewCount: {"$sum": 1}
                        }
                    }

                ];
            } else if (type === 'sold') {
                aggregatorOpts = [
                    {$unwind: '$action.saleList'},
                    {$match: mQuery},
                    {
                        $group: {
                            _id: "$action.saleList.design_category",
                            skus: {"$push": "$action.saleList.sku_number"},
                            dessign_category: {"$addToSet": "$action.saleList.design_category"},
                            soldCount: {"$sum": 1}
                        }
                    }

                ];
            } else if (type === 'share') {
                aggregatorOpts = [
                    {$unwind: '$action.sharedList'},
                    {$match: mQuery},
                    {
                        $group: {
                            _id: "$action.sharedList.design_category",
                            skus: {"$push": "$action.sharedList.sku_number"},
                            design_category: {"$addToSet": "$action.sharedList.design_category"},
                            shareCount: {"$sum": 1}
                        }
                    }

                ];
            }
            await salePerformance.aggregate(aggregatorOpts, async function (err, respo1) {
                if (err) {
                    res.json(err);
                } else {
                    for await (let mRes of respo1) {
                        respo.push(mRes);
                    }
                    let aggregatorOpts = [];
                    if (type === 'view') {
                        aggregatorOpts = [
                            {$unwind: '$skuList'},
                            {$match: mQuery},
                            {
                                $group: {
                                    _id: "$skuList.design_category",
                                    skus: {"$push": "$skuList.sku_number"},
                                    design_category: {"$addToSet": "$skuList.design_category"},
                                    viewCount: {"$sum": 1}
                                }
                            }
                        ];
                    } else if (type === 'sold') {
                        aggregatorOpts = [
                            {$unwind: '$action.saleList'},
                            {$match: mQuery},
                            {
                                $group: {
                                    _id: "$action.saleList.design_category",
                                    skus: {"$push": "$action.saleList.sku_number"},
                                    design_category: {"$addToSet": "$action.saleList.design_category"},
                                    soldCount: {"$sum": 1}
                                }
                            }

                        ];
                    } else if (type === 'share') {

                        aggregatorOpts = [
                            {$unwind: '$action.sharedList'},
                            {$match: mQuery},
                            {
                                $group: {
                                    _id: "$action.sharedList.design_category",
                                    skus: {"$push": "$action.sharedList.sku_number"},
                                    design_category: {"$addToSet": "$action.sharedList.design_category"},
                                    shareCount: {"$sum": 1}
                                }
                            }
                        ];
                    }
                    await salePerformance.aggregate(aggregatorOpts, async function (err, respo2) {
                        if (err) {
                            res.json(err);
                        } else {
                            for await (let mRes of respo2) {
                                mRes.design_category = respo1.design_category;
                                respo.push(mRes);
                            }
                            let final = [];
                            let data = groupBy(respo, ['_id']);
                            Object.keys(data).forEach(function (key) {
                                let obj = {};
                                obj._id = key;
                                for (var dataElement of data[key]) {
                                    if (dataElement.viewCount !== undefined) {
                                        if (obj.design_category == dataElement.design_category) {
                                            obj.catCount = dataElement.viewCount;
                                            obj.skus = dataElement.skus;

                                        }
                                    }
                                    if (dataElement.soldCount !== undefined) {
                                        if (obj.design_category == dataElement.design_category) {
                                            obj.catCount = dataElement.soldCount;
                                            obj.skus = dataElement.skus;

                                            // obj.Design_Category = dataElement.design_category;
                                        }
                                    }

                                    if (dataElement.shareCount !== undefined) {
                                        if (obj.design_category == dataElement.design_category) {
                                            obj.catCount = dataElement.shareCount;
                                            obj.skus = dataElement.skus;

                                            // obj.Design_Category = dataElement.design_category;
                                        }
                                    }
                                }
                                final.push(obj);
                            });


                            // let unique = [...new Set(final)];
                            // let x = (final) => final.filter((v, i) => final.indexOf(v) === i)


                            let mRe = {};
                            if (type === 'view') {
                                mRe.countList = await final.sort(function (a, b) {
                                    return b.catCount - a.catCount;
                                }).slice(0, 10);
                            } else if (type === 'sold') {
                                mRe.countList = await final.sort(function (a, b) {
                                    // if (a.soldCount == b.soldCount) {
                                    return b.catCount - a.catCount;
                                    // }
                                }).slice(0, 10);
                            } else if (type === 'share') {
                                mRe.countList = await final.sort(function (a, b) {
                                    return b.catCount - a.catCount;
                                }).slice(0, 10);
                            }
                            return res.json(stObj.getResponseObject(true, {}, mRe, []));
                        }
                    });
                }
            });
        }
    });
});


/* Create Sales Performance. */
router.get('/dhead', async function (req, res) {
    let from = req.query.from;
    let to = req.query.to;
    let mQuery = await stObj.queryBuilder(req, res);
    let filters = [];
    filters.push(mQuery);
    if (from !== undefined && to !== undefined && from.length > 0 && to.length > 0) {
        filters.push({"createdAt": {"$gte": new Date(from), "$lt": new Date(to)}});
    }
    let d = {};
    d['$and'] = filters;
    await salePerformance.find(d, async function (err, results) {
        if (err) {
            res.json(stObj.getResponseObject(false, err, {}, []));
        } else {
            let respo = {};
            let mRespo = {};
            let totalItems = [];
            let soldItems = [];
            let catViewed = {};
            let catSold = {};
            let totalCustomer = [];
            let soldCustomer = [];
            for await (let result of results) {
                if (!totalCustomer.includes(result.customer))
                    totalCustomer.push(result.customer);
                for await (let resultElement of result.skuList) {
                    if (!totalItems.includes(resultElement)) {
                        totalItems.push(resultElement);
                    }
                    if (resultElement.design_code in catViewed) {
                        catViewed[resultElement.design_code] = catViewed[resultElement.design_code] + 1;
                    } else {
                        catViewed[resultElement.design_code] = 1;
                    }
                }
                if (result.action.saleList !== undefined && result.action.saleList.length > 0) {
                    soldCustomer.push(result.customer);
                    let saleList = result.action.saleList;
                    for await (let resultElement of saleList) {
                        if (!soldItems.includes(resultElement)) {
                            soldItems.push(resultElement)
                        }
                        if (resultElement.design_code in catSold) {
                            catSold[resultElement.design_code] = catSold[resultElement.design_code] + 1;
                        } else {
                            catSold[resultElement.design_code] = 1;
                        }
                    }
                }
            }

            let mSkuSold = [];
            for await (let rElem of results) {
                if (rElem.action.saleList !== undefined && rElem.action.saleList.length > 0)
                    for await (let rElemElem of rElem.action.saleList) {
                        if (!mSkuSold.includes(rElemElem.sku_number)) {
                            mSkuSold.push(rElemElem.sku_number);
                        } else {
                            mSkuSold.push(rElemElem.sku_number);
                        }
                    }
            }


            let itemViewdTotal = [];
            for (let totalItem of totalItems) {
                if (!itemViewdTotal.includes(totalItem.sku_number))
                    itemViewdTotal.push(totalItem.sku_number)
            }

            let soldItemTotal = [];
            for (totalSold of soldItems) {
                if (!soldItemTotal.includes(totalSold.sku_number))
                    soldItemTotal.push(totalSold.sku_number);
            }
            let unique = [...new Set(itemViewdTotal)];
            respo['PRODUCTS VIEWED'] = unique.length;
            mRespo.viewSkus = itemViewdTotal;
            let unique1 = [...new Set(soldItems)]
            respo['PRODUCTS SOLD'] = unique1.length;
            mRespo.soldSkus = mSkuSold;
            let keyViewed = '';
            try {
                keyViewed = Object.keys(catViewed).reduce(function (a, b) {
                    return catViewed[a] > catViewed[b] ? a : b
                });
            } catch (e) {

            }
            respo.catViewd = keyViewed + " | " + catViewed[keyViewed];
            let keySold = '';
            try {
                keySold = Object.keys(catSold).reduce(function (a, b) {
                    return catSold[a] > catSold[b] ? a : b
                });
            } catch (e) {

            }
            respo.catSold = keySold + " | " + catSold[keySold];
            if (keyViewed.length === 0) {
                respo['TOP DESIGN VIEWED'] = "N/A";
            }
            if (keySold.length === 0) {
                respo['TOP DESIGN SOLD'] = "N/A";
            }
            let viewd = [];
            for await (let totalItem of totalItems) {
                if (totalItem.design_code === keyViewed) {
                    respo['TOP DESIGN VIEWED'] = respo.catViewd + " | " + totalItem.design_category;
                    if (!viewd.includes(totalItem.sku_number))
                        viewd.push(totalItem.sku_number);
                    break;
                }
            }
            mRespo.topDesgViewSkus = viewd;
            let soldSk = [];
            for await (let totalItem of soldItems) {
                if (totalItem.design_code === keySold) {
                    respo['TOP DESIGN SOLD'] = respo.catSold + " | " + totalItem.design_category;
                    if (!soldSk.includes(totalItem.sku_number))
                        soldSk.push(totalItem.sku_number);
                    break;
                }
            }
            mRespo.topDesgSoldSkus = soldSk;
            respo['TOTAL CUSTOMERS SERVED'] = totalCustomer.length;
            respo['TOTAL NO. OF SALES'] = soldCustomer.length;
            let from = req.query.from;
            let to = req.query.to;
            let mQuery = {};
            let filters = [];
            if (req.query.rootInfo !== undefined && req.query.rootInfo === 'section') {
                filters.push({"root.sectionId": req.query.id});
            } else if (req.query.rootInfo !== undefined && req.query.rootInfo === 'floor') {
                filters.push({"root.floorId": req.query.id});
            } else if (req.query.rootInfo !== undefined && req.query.rootInfo === 'branch') {
                filters.push({"root.branchId": req.query.id});
            }
            if (from !== undefined && to !== undefined) {
                mQuery["createdAt"] = {"$gte": new Date(from), "$lt": new Date(to)}
            }
            if (req.query.d_cat !== undefined && req.query.d_cat.length > 0) {
                filters.push({"skuList.design_category": {$in: req.query.d_cat.split(",")}});
            }
            if (req.query.d_code !== undefined && req.query.d_code.length > 0) {
                filters.push({"skuList.design_code": {$in: req.query.d_code.split(",")}});
            }
            filters.push({"root.companyId": req.body.user.root.companyId});
            if (filters.length > 0)
                mQuery['$and'] = filters;
            let aggregatorOpts = [
                {$unwind: '$skuList'},
                {$match: mQuery},
                {
                    $project: {
                        _id: "$skuList.sku_number"
                    }
                }
            ];
            stObj.dLOg(mQuery);
            await salePerformance.aggregate(aggregatorOpts, async function (err, original) {
                if (err) {
                    return res.json(stObj.getResponseObject(false, {'msg': err.toString()}, {}, {}));
                } else {
                    let sku = [];
                    for (let originalElement of original) {
                        if (!sku.includes(originalElement._id))
                            sku.push(originalElement._id);
                    }
                    let mQuery = {};
                    let filters = [];
                    if (req.query.d_cat !== undefined && req.query.d_cat.length > 0) {
                        filters.push({"design_category": {$in: req.query.d_cat.split(",")}});
                    }
                    if (req.query.d_code !== undefined && req.query.d_code.length > 0) {
                        filters.push({"design_code": {$in: req.query.d_code.split(",")}});
                    }
                    if (sku.length > 0)
                        filters.push({'sku_number': {$nin: sku}});

                    if (req.query.rootInfo !== undefined && req.query.rootInfo === 'section') {
                        filters.push({"root.sectionId": req.query.id});
                    } else if (req.query.rootInfo !== undefined && req.query.rootInfo === 'floor') {
                        filters.push({"root.floorId": req.query.id});
                    } else if (req.query.rootInfo !== undefined && req.query.rootInfo === 'branch') {
                        filters.push({"root.branchId": req.query.id});
                    }
                    filters.push({"root.companyId": req.body.user.root.companyId});
                    if (filters.length > 0)
                        mQuery['$and'] = filters;
                    let aggregatorOpts = [
                        {$match: mQuery},
                        {
                            $group: {
                                _id: "$design_code",
                                sales_value: {"$sum": {'$toDouble': '$sales_value'}},
                                sku_quantity: {"$sum": 1},
                                gross_weight: {"$sum": '$gross_weight'},
                                net_weight: {"$sum": '$net_weight'},
                                design_category: {$addToSet: "$design_category"},
                                mSku: {$push: {sku_number: "$$ROOT.sku_number", root: "$$ROOT.root"}}

                            }
                        }
                    ];
                    await skud.aggregate(aggregatorOpts, async function (err, dstocksRes) {
                        if (err) {
                            return res.json(stObj.getResponseObject(false, {'msg': err.toString()}, {}, {}));
                        } else if (dstocksRes != null) {
                            let skuNo = [];
                            let skuCount = 0;
                            for await (let originalElementElement of dstocksRes) {
                                skuCount = parseInt(skuCount) + parseInt(originalElementElement.mSku.length);
                                for (let mSkuElement of originalElementElement.mSku) {
                                    if (!skuNo.includes(mSkuElement.sku_number)) {
                                        skuNo.push(mSkuElement.sku_number);
                                    }
                                }
                            }
                            respo['PRODUCTS NOT VIEWED'] = skuCount;
                            mRespo.itemNotViewedSkus = skuNo;
                            delete respo.catSold;
                            delete respo.catViewd;
                            if (soldCustomer.length > 0 || totalCustomer.length > 0) {
                                respo['CONVERSION RATIO'] = parseFloat(soldCustomer.length * 100 / totalCustomer.length).toFixed(2) + "%";
                            } else {
                                respo['CONVERSION RATIO'] = '0';
                            }
                            return res.json(stObj.getResponseObject(true, {}, respo, mRespo));
                        }
                    }).sort({created_at: -1});
                }
            });
        }
    });

});


router.get('/mView', async function (req, res) {
    console.log("Called")
    let id = req.query.id;
    let mQuery = {};
    if (id !== null && id !== undefined)
        mQuery = {"skuList.sku_number": id, 'root.companyId': req.body.user.root.companyId};
    console.log(mQuery)
    await salePerformance.findOne(mQuery, async function (err, respo) {
        if (err)
            return res.json(stObj.getResponseObject(false, {'msg': err.toString()}, {}, {}));
        else if (respo !== null) {
            for await (let skuItem of respo.skuList) {
                if (skuItem.sku_number === id) {
                    return res.json(stObj.getResponseObject(true, {}, skuItem, []));
                }
            }
            return res.json(stObj.getResponseObject(false, {}, {}, []));
        } else {
            return res.json(stObj.getResponseObject(false, {msg: "SKU not found in SP"}, {}, []));
        }
    });
});

/* Create Sales Performance. */
router.post('/webapi', async function (req, res, next) {
    if (req.body.decoded.root.companyId === 'TJ') {
        req.body.user = req.body.decoded.empId;
    } else
        req.body.user = req.body.decoded.username;
    req.body.sName = req.body.decoded.name;
    req.body.root = req.body.decoded.root;
    try {
        req.body.customer = JSON.parse(req.body.customer);
    } catch (e) {
        console.log("Customer was not in string it's an object." + req.body.decoded.name)
    }
    let skuList = [];
    for await (let skuListElement of req.body.skuList) {
        try {
            skuList.push(JSON.parse(skuListElement));
        } catch (e) {
            skuList.push(skuListElement);
        }
    }
    req.body.skuList = skuList;
    let action = {};
    let skuActionArray = [];
    if (req.body.action[0] !== undefined) {
        for (let skuListElement of req.body.action[0].skuList) {
            skuListElement.root = req.body.decoded.root;
            try {
                skuActionArray.push(JSON.parse(skuListElement));
            } catch (e) {
                skuActionArray.push(skuListElement);
            }
            action.saleList = skuActionArray;
        }
        if (action.saleList === undefined) {
            action.saleList = []
        }
        skuActionArray = [];
        for (let skuListElement of req.body.action[2].skuList) {
            skuListElement.root = req.body.decoded.root;
            try {
                skuActionArray.push(JSON.parse(skuListElement));
            } catch (e) {
                skuActionArray.push(skuListElement);
            }
            action.memoList = skuActionArray;
        }
        if (action.memoList === undefined) {
            action.memoList = []
        }
        skuActionArray = [];
        for (let skuListElement of req.body.action[1].skuList) {
            skuListElement.root = req.body.decoded.root;
            try {
                skuActionArray.push(JSON.parse(skuListElement));
            } catch (e) {
                skuActionArray.push(skuListElement);
            }
            action.quoteList = skuActionArray;
        }
        if (action.quoteList === undefined) {
            action.quoteList = []
        }
        skuActionArray = [];
        for (let skuListElement of req.body.action[3].skuList) {
            skuListElement.root = req.body.decoded.root;
            try {
                skuActionArray.push(JSON.parse(skuListElement));
            } catch (e) {
                skuActionArray.push(skuListElement);
            }
            action.sharedList = skuActionArray;
        }
        if (action.sharedList === undefined) {
            action.sharedList = []
        }
        req.body.action = action;
    }
    req.body.isSynced = true;
    let query = {};
    query.spId = req.body.spId;
    await salePerformance.findOneAndUpdate(query, {$set: req.body},
        {upsert: true, new: true, runValidators: true},
        async function (err, result) {
            if (err) {
                return res.json(stObj.getResponseObject(false, err, {}, []));
            } else {
                await salePerformance.findOne(query, function (err, saleP) {
                    if (err) {
                        res.json(stObj.getResponseObject(false, err, {}, []));
                    } else {
                        res.json(stObj.getResponseObject(true, {}, saleP, []));
                        let originalBody = saleP;
                        originalBody.isSynced = true;
                        originalBody.action = [];
                        originalBody.customer = JSON.stringify(saleP.customer);
                        stObj.app.notificationUtil.notify(req, stObj.notificationCode.add_report, originalBody, []);
                    }
                });
            }
        });
});


router.delete('', async function (req, res) {
    await salePerformance.deleteMany({}, function (err, saleP) {
        if (err) {
            res.json(stObj.getResponseObject(false, err, {}, []));
        } else {
            res.json(stObj.getResponseObject(true, {}, saleP, []));
        }
    });
});
//Get Users
/*router.get('/user', async function (req, res) {
    let mQuery = await stObj.queryBuilder(req, res);
    let aggregatorOpts = [
        {$match: mQuery},
        {
            $project: {
                _id: {empId: "$username", name: {$concat: ['$lastname', " ", '$firstname']}},
            }
        }
    ];
    await routUser.aggregate(aggregatorOpts, function (err, result) {
        if (!err && result !== null) {
            return res.json(stObj.getResponseObject(true, {}, {}, result));
        }
    })
});*/


router.get('/user', async function (req, res) {
    let mQuery = await stObj.queryBuilder(req, res);
    let aggregatorOpts = [
        {$match: mQuery},
        {$lookup: {from: 'users', localField: 'user', foreignField: 'username', as: 'user'}},
        {
            $project: {
                _id: {empId: "$username", name: {$concat: ['$lastname', " ", '$firstname']}},
            }
        }
    ];
    await routUser.aggregate(aggregatorOpts, function (err, result) {
        if (!err && result !== null) {
            return res.json(stObj.getResponseObject(true, {}, {}, result));
        }
    })
});

let sale = require('../model/sale');
//Customer Detail Report
router.get('/customer', async function (req, res) {
    let code = req.query.code;
    if (code !== undefined && code.length > 0) {
        let mQuery = {'customer.code': code};
        let customer = await customers.findOne({'code': code});
        if (customer === undefined || customer === null) {
            return res.json(stObj.getResponseObject(false, {msg: "Customer not found"}, {}, []));
        }
        await salePerformance.find(mQuery, async function (err, result) {
            if (err) {
                res.json(err);
            } else if (result.length > 0) {
                let records = [];
                let viewed = 0;
                let shared = 0;
                let purchased = 0;
                let quote = 0;
                let purchasedAmount = 0;
                let lastVisit = moment(result[result.length - 1].createdAt).format('DD/MM/YYYY');
                console.log('last visit' + '' + lastVisit);
                let saleSKU = {};
                await sale.find({'customer.code': code}, async function (err, result) {
                    if (!err && result != null) {
                        for await (let result1 of result) {
                            let i = 0;
                            for await (let skuItemsIssueElement of result1.skuItemsIssue) {
                                let price = skuItemsIssueElement.sales_value;
                                if (result1.discount[i] > 0) {
                                    price = price - (price * result1.discount[i]) / 100;
                                }
                                i = i + 1;
                                saleSKU[skuItemsIssueElement.sku_number] = price;
                                purchasedAmount = purchasedAmount + price;
                            }
                        }
                    }
                });
                for (let resultElement of result) {
                    let sName = resultElement.sName;
                    for await (let sku of resultElement.action.saleList) {
                        sku.status = "Purchased";
                        sku.salePerson = sName;
                        sku.date = resultElement.createdAt;
                        sku.sales_value = saleSKU[sku.sku_number];
                        records.push(sku);
                        purchased = purchased + 1;
                    }
                    for await (let sku of resultElement.action.quoteList) {
                        sku.status = "Quoted";
                        sku.salePerson = sName;
                        sku.date = resultElement.createdAt;
                        records.push(sku);
                        quote = quote + 1;

                    }
                    for await (let sku of resultElement.action.sharedList) {
                        sku.status = "Shared";
                        sku.salePerson = sName;
                        sku.date = resultElement.createdAt;
                        records.push(sku);
                        shared = shared + 1;

                    }
                    for await (let resultElementElement of resultElement.skuList) {
                        let isfound = false;
                        for await (let record of records) {
                            if (resultElementElement.sku_number === record.sku_number) {
                                isfound = true;
                            }
                        }
                        if (!isfound) {
                            resultElementElement.status = "Viewed";
                            resultElementElement.salePerson = sName;
                            records.push(resultElementElement);
                            viewed = viewed + 1;
                        }
                    }
                }

                return res.json(stObj.getResponseObject(true, {}, {
                    'TOTAL VISITS': result.length,
                    'LAST VISIT': lastVisit,
                    'VIEWED': viewed,
                    'SHARED': shared,
                    'PURCHASED': purchased,
                    'QUOTED': quote,
                    'Total No. Items': viewed + shared + purchased + quote,
                    'Total Purchase Amount': purchasedAmount,
                    'customer': customer
                }, records));
            } else {
                return res.json(stObj.getResponseObject(true, {}, {
                    'TOTAL VISITS': 0,
                    'LAST VISIT': "",
                    'VIEWED': 0,
                    'SHARED': 0,
                    'PURCHASED': 0,
                    'QUOTED': 0,
                    'Total No. Items': 0,
                    'Total Purchase Amount': 0,
                    'customer': customer
                }, []));
            }
        });
    } else {
        return res.json(stObj.getResponseObject(false, {}, {}, []));
    }

});
let branch = require('../model/branch');
let floor = require('../model/floor');
let section = require('../model/section');
let subSection = require('../model/subSection');

//Employee Detail Report
router.get('/employee', async function (req, res) {
    let username = req.query.username;
    if (username !== undefined && username.length > 0) {
        let mQuery = {'user': username};
        let mUser = await routUser.findOne({'username': username}).select('-jwt_token').select('-web_token');
        mUser = JSON.parse(JSON.stringify(mUser));
        if (mUser === undefined || mUser === null) {
            return res.json(stObj.getResponseObject(false, {msg: "Employee not found"}, {}, []));
        }
        let mBranch = await branch.findOne({'_id': mUser.root.branchId});
        let mFloor = await floor.findOne({'_id': mUser.root.floorId});
        mUser.mBranch = mBranch;
        if (mBranch !== null && mBranch !== undefined)
            mUser.branchName = mBranch.name;
        mUser.mFloor = mFloor;
        if (mFloor !== null && mFloor !== undefined)
            mUser.floorName = mFloor.name;
        await salePerformance.find(mQuery, async function (err, result) {
            if (err) {
                res.json(err);
            } else if (result.length > 0) {
                let custRecords = [];
                let records = [];
                let viewed = 0;
                let shared = 0;
                let purchased = 0;
                let quote = 0;
                // let order = 0;
                let purchasedAmount = 0;
                let lastVisit = moment(result[result.length - 1].createdAt).format('DD/MM/YYYY');
                let saleSKU = {};
                await sale.find(mQuery, async function (err, result) {
                    if (!err && result != null) {
                        for await (let result1 of result) {
                            let i = 0;
                            for await (let skuItemsIssueElement of result1.skuItemsIssue) {
                                let price = skuItemsIssueElement.sales_value;
                                if (result1.discount[i] > 0) {
                                    price = (price * result1.discount[i]) / 100;
                                }
                                i = i + 1;
                                saleSKU[skuItemsIssueElement.sku_number] = price;
                                purchasedAmount = purchasedAmount + price;
                            }
                        }
                    }
                });
                let customerCount = 0;
                let totalMin = 0;
                let customerCode = [];
                for (let resultElement of result) {
                    let custo = {};
                    let c = await customers.findOne({code: resultElement.customer.code});
                    if (c !== null) {
                        custo.customer = c;
                    } else
                        custo.customer = resultElement.customer;
                    let totalTime = resultElement.endTimeStamp - resultElement.startTimeStamp;
                    custo.time = millisToMinutesAndSeconds(totalTime);
                    totalMin = totalMin + totalTime;
                    if (customerCode.length === 0) {
                        customerCode.push(resultElement.customer.code);
                        customerCount = customerCount + 1;
                    } else {
                        if (!customerCode.includes(resultElement.customer.code)) {
                            customerCount = customerCount + 1;
                        }
                    }

                    for await (let sku of resultElement.action.saleList) {
                        sku.status = "Purchased";
                        sku.salePerson = resultElement.sName;
                        sku.date = resultElement.createdAt;
                        sku.sales_value = saleSKU[sku.sku_number];
                        records.push(sku);
                        purchased = purchased + 1;
                    }
                    for await (let sku of resultElement.action.quoteList) {
                        sku.status = "Quoted";
                        sku.salePerson = resultElement.sName;
                        sku.date = resultElement.createdAt;
                        records.push(sku);
                        quote = quote + 1;

                    }
                    for await (let sku of resultElement.action.sharedList) {
                        sku.status = "Shared";
                        sku.salePerson = resultElement.sName;
                        sku.date = resultElement.createdAt;
                        records.push(sku);
                        shared = shared + 1;

                    }
                    for await (let resultElementElement of resultElement.skuList) {
                        let isfound = false;
                        for await (let record of records) {
                            if (resultElementElement.sku_number === record.sku_number) {
                                isfound = true;
                            }
                        }
                        if (!isfound) {
                            resultElementElement.status = "Viewed";
                            records.push(resultElementElement);
                            viewed = viewed + 1;
                        }
                    }
                    custo.date = resultElement.createdAt;
                    custo.action = resultElement.action;
                    custRecords.push(custo)
                }
                console.log(custRecords)
                totalMin = Math.round(totalMin / customerCount);
                let mMin = millisToMinutesAndSeconds(totalMin);
                return res.json(stObj.getResponseObject(true, {}, {
                    'ITEMS SHOWN': viewed + shared + purchased + quote,
                    'SHARED': shared,
                    'SOLD': purchased,
                    'QUOTED': quote,
                    'CUSTOMERS SERVED': customerCount,
                    'AVERAGE TIME WITH CUSTOMERS': mMin,
                    'employee': mUser
                }, custRecords));
            } else {
                return res.json(stObj.getResponseObject(true, {}, {
                    'ITEMS SHOWN': 0,
                    'SHARED': 0,
                    'SOLD': 0,
                    'QUOTED': 0,
                    'CUSTOMERS SERVED': 0,
                    'AVERAGE TIME WITH CUSTOMERS': 0,
                    'employee': mUser
                }, []));
            }
        });
    } else {
        return res.json(stObj.getResponseObject(false, {msg: "Employee id not found"}, {}, []));
    }

});

function millisToMinutesAndSeconds(millis) {
    let minutes = Math.floor(millis / 60000);
    let seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + " Min : " + (seconds < 10 ? '0' : '') + seconds + ' Sec';
}

//Conversion Ratio, Particular Sales Person
router.get('/salesperson', async function (req, res) {
    let from = req.query.from;
    let to = req.query.to;
    let salesPerson = req.query.salesPerson;
    let mQuery = await stObj.queryBuilder(req, res);
    if (salesPerson !== undefined && salesPerson.length > 0) {
        mQuery['user'] = salesPerson;
    }

    if (from !== undefined && to !== undefined && from.length > 0 && to.length > 0) {
        mQuery["createdAt"] = {"$gte": new Date(from), "$lt": new Date(to)}
    }
    if (req.query.salesPersons !== undefined && req.query.salesPersons.length > 0) {
        let salesPersons = req.query.salesPersons.split(",");
        mQuery = {$and: [mQuery, {'user': {$in: salesPersons}}]};
    }
    let aggregatorOpts = [
        {$match: mQuery},
        {$unwind: '$action.saleList'},
        {
            $group: {
                _id: {
                    "customer": "$customer.id",
                    "createdAt": {$substr: ['$createdAt', 0, 7]}
                },
                count: {$sum: 1},
                entry: {
                    $push: {
                        totalPrice: {$sum: "$action.saleList.sales_value"},
                        totalEnd: {$sum: "$endTimeStamp"},
                        totalStart: {$sum: "$startTimeStamp"},
                        root: "$root",
                    }
                }
            }
        }
    ];
    await salePerformance.aggregate(aggregatorOpts, async function (err, result) {
        if (err) {
            res.json(err);
        } else {
            mQuery["action.saleList"] = {"$not": {$size: 0}};
            aggregatorOpts = [
                {$match: mQuery},
                {$unwind: '$action.saleList'},
                {
                    $group: {
                        _id: {
                            "customer": "$customer.id",
                            "createdAt": {$substr: ['$createdAt', 0, 7]}
                        },

                        count: {$sum: 1},

                        entry: {
                            $push: {
                                totalPrice: {$sum: "$action.saleList.sales_value"},
                                totalEnd: {$sum: "$endTimeStamp"},
                                totalStart: {$sum: "$startTimeStamp"},
                                root: "$root",
                            }
                        },
                        // price: { $sum: "$action.saleList.sales_value" }
                    }
                }
            ];
            await salePerformance.aggregate(aggregatorOpts, async function (err, result1) {
                if (err) {
                    res.json(err);
                } else {

                    let res1 = [];
                    for (const resultElement of result) {
                        let monthWise = {};
                        monthWise._id = resultElement._id;
                        monthWise.total = resultElement.count;
                        monthWise.convert = 0;
                        // console.log( monthWise.totalTime);
                        monthWise.totalTime = resultElement.entry[0].totalEnd - resultElement.entry[0].totalStart;
                        // stObj.dLOg(monthWise.totalTime);
                        monthWise.totalValue = resultElement.entry[0].totalPrice;
                        // console.log(monthWise.totalValue);
                        // console.log(monthWise.totalTime);
                        // monthWise.totalValue = resultElement.price;
                        for (const result1Element1 of result1) {
                            if (monthWise._id.customer === result1Element1._id.customer) {
                                monthWise.convert = 1;
                            }
                        }
                        res1.push(monthWise);
                    }
                    let data = groupBy(res1, ['_id.createdAt']);
                    let final = [];
                    Object.keys(data).forEach(function (key) {
                        let obj = {};
                        obj.month = key;
                        obj.total = data[key].length;
                        let convert = 0;
                        let tott = 0;
                        let totv = 0;
                        for (let datumElement of data[key]) {
                            if (datumElement.convert > 0) {
                                convert = convert + 1;
                            }
                            tott = tott + datumElement.totalTime;
                            // console.log('tott' + ' ' + tott);

                            totv = totv + datumElement.totalValue;

                        }
                        obj.convert = convert;
                        if (convert > 0) {
                            // obj.avgTime = parseFloat((tott / 21600).toFixed(1) / convert) + "M";
                            obj.avgTime = (tott / convert);
                            // console.log('avg time' + ' ' + obj.avgTime)
                            let d = moment.duration(tott, 'milliseconds');
                            let day = Math.floor(d.asDays());
                            let hours = Math.floor(d.asHours() - (day * 24));
                            let mins = Math.floor(d.asMinutes() - (day * 24 * 60) - (hours * 60));
                            if (day > 0) {
                                obj.totalTime = day + "D " + hours + "H " + mins + "M";
                                // console.log('day time' + ' ' + obj.totalTime);
                            } else if (hours > 0) {
                                obj.totalTime = hours + "H " + mins + "M";
                                // console.log('hours time' + ' ' + obj.totalTime);
                            } else if (mins > 0) {
                                obj.totalTime = mins + "M";
                                console.log('total time in mins' + ' ' + obj.totalTime)
                            }


                            let x = obj.avgTime;
                            d = moment.duration(x, 'milliseconds');
                            day = Math.floor(d.asDays());
                            hours = Math.floor(d.asHours() - (day * 24));
                            mins = Math.floor(d.asMinutes() - (day * 24 * 60) - (hours * 60));
                            if (day > 0) {
                                obj.avgTime = day + "D " + hours + "H " + mins + "M";
                            } else if (hours > 0) {
                                obj.avgTime = hours + "H " + mins + "M";
                            } else {
                                obj.avgTime = mins + "M";
                                console.log('average time in mins' + ' ' + obj.avgTime)
                            }

                            obj.totalValue = totv;

                            obj.avgValue = (totv / convert);
                            obj.per = parseFloat((obj.convert * 100) / obj.total).toFixed(2) + " %";
                        } else {
                            obj.totalTime = "-";
                            obj.avgTime = "-";
                            obj.totalValue = "0";
                            obj.avgValue = "0";
                            obj.per = "-";

                        }
                        final.push(obj);
                    });
                    return res.json(stObj.getResponseObject(true, {}, {}, final));
                }
            });
        }
    });
});


//Top 5 Design - Analytics
router.get('/designanalytics', async function (req, res) {
    let from = req.query.from;
    let to = req.query.to;
    let type = req.query.type;
    let limit = req.query.limit;
    let mQuery = await stObj.queryBuilder(req, res);

    if (from !== undefined && to !== undefined && from.length > 0 && to.length > 0) {
        mQuery["createdAt"] = {"$gte": new Date(from), "$lt": new Date(to)}
    }
    let aggregatorOpts = [
        {$unwind: '$skuList'},
        {$match: mQuery},
        {
            $group: {
                _id: "$skuList." + type,
                viewCount: {"$sum": 1}
            }
        }
    ];
    await salePerformance.aggregate(aggregatorOpts, async function (err, viewd) {
        if (err) {
            res.json(err);
        } else {
            let aggregatorOpts = [
                {$unwind: '$action.saleList'},
                {$match: mQuery},
                {
                    $group: {
                        _id: "$action.saleList." + type,
                        soldCount: {"$sum": 1}
                    }
                }
            ];
            await salePerformance.aggregate(aggregatorOpts, async function (err, original) {
                if (err) {
                    res.json(err);
                } else {
                    for (let originalElement of original) {
                        viewd.push(originalElement);
                    }
                    let aggregatorOpts = [
                        {$unwind: '$action.sharedList'},
                        {$match: mQuery},
                        {
                            $group: {
                                _id: "$action.sharedList." + type,
                                shareCount: {"$sum": 1}
                            }
                        }
                    ];
                    await salePerformance.aggregate(aggregatorOpts, async function (err, original) {
                        if (err) {
                            res.json(err);
                        } else {
                            for (let originalElement of original) {
                                viewd.push(originalElement);
                            }
                            let final = [];
                            let data = groupBy(viewd, ['_id']);
                            Object.keys(data).forEach(function (key) {
                                let obj = {};
                                obj.id = key;
                                try {
                                    if (data[key][0].viewCount !== undefined)
                                        obj.View = data[key][0].viewCount;
                                } catch (e) {

                                }
                                try {
                                    if (data[key][1].soldCount !== undefined)
                                        obj.Sold = data[key][1].soldCount;
                                } catch (e) {

                                }
                                try {
                                    if (data[key][2].shareCount !== undefined)
                                        obj.Share = data[key][2].shareCount;
                                } catch (e) {

                                }
                                if (final.length < limit)
                                    final.push(obj);
                            });
                            await final.sort(stObj.dynamicSort('View'));
                            return res.json(stObj.getResponseObject(true, {}, {}, final));
                        }
                    });
                }
            });

        }
    });
});


router.get('/viewdemand', async function (req, res) {
    let from = req.query.from;
    let to = req.query.to;
    let limit = req.query.limit;
    let type = req.query.type;
    let mQuery = await stObj.queryBuilder(req, res);
    if (from !== undefined && to !== undefined && from.length > 0 && to.length > 0) {
        mQuery["createdAt"] = {"$gte": new Date(from), "$lt": new Date(to)}
    }
    let aggregatorOpts = [
        {$unwind: '$skuList'},
        {$match: mQuery},
        {
            $project: {
                _id: {$substr: ['$createdAt', 0, 7]}
                , dsgCat: "$skuList." + type
            }
        }
    ];
    await salePerformance.aggregate(aggregatorOpts, async function (err, original) {
        if (err) {
            res.json(err);
        } else {
            let counts = {};
            for (let i = 0; i < original.length; i++) {
                let key = original[i].dsgCat + "," + original[i]._id;
                if (counts[key]) {
                    counts[key]++;
                } else {
                    counts[key] = 1;
                }
            }
            final = [];
            for (let key in counts) {
                let obj = {};
                obj.month = key.split(",")[1];
                obj[type] = key.split(",")[0];
                obj.count = counts[key];
                final.push(obj);
            }
            final.sort(function (a, b) {
                return b.count - a.count;
            });
            let g = groupBy(final, ['month']);
            let gexo = [];
            Object.keys(g).forEach(function (key) {
                let ge = {};
                ge.month = key;
                let d = g[key].slice(0, limit);
                for (let dElement of d) {
                    delete dElement['month'];
                }
                ge.info = d;
                gexo.push(ge);
            });
            let f = [];

            for (let gexoElement of gexo) {
                let obj = {};
                obj.month = moment(gexoElement.month, 'YYYY-MM').format('MMMM-YYYY');
                for (let infoElement of gexoElement.info) {
                    obj[infoElement[type]] = infoElement.count;
                }
                f.push(obj);
            }
            return res.json(stObj.getResponseObject(true, {}, {}, f));

        }
    });
});
let ct111 = require('../model/customer');

//Reports
// Tray Activities
router.get('/trayactivity', async function (req, res) {
    let mQuery = await stObj.queryBuilder(req, res);
    let salePersons;
    let customers;
    let filters = [];
    if (req.query.salePersons !== undefined && req.query.salePersons.length > 0) {
        salePersons = req.query.salePersons.split(",");
        filters.push({$or: [{'user': salePersons}]});
    }
    if (req.query.customers !== undefined && req.query.customers.length > 0) {
        customers = req.query.customers.split(",");
        filters.push({$or: [{'customer.code': {$in: customers}}]});
    }
    let from = req.query.from;
    let to = req.query.to;
    if (from !== undefined && to !== undefined && from.length > 0 && to.length > 0) {
        mQuery["createdAt"] = {"$gte": new Date(from), "$lt": new Date(to)}
    }
    if (filters.length > 0) {
        mQuery.$and = filters;
    }
    let times = req.query.time;
    await salePerformance.find(mQuery, async function (err, salePerformance) {
        if (err) {
            res.json(stObj.getResponseObject(false, err, {}, []));
        } else if (salePerformance != null) {
            let final = [];
            for (let saleP of salePerformance) {
                if (saleP.customer !== undefined && saleP.customer !== null)
                    for (let userReSKUElement of saleP.skuList) {
                        let obj = {};
                        obj.sName = saleP.sName;
                        obj.empId = saleP.user;
                        await ct111.findOne({'code': saleP.customer.code}, async function (err, result) {
                            if (!err && result !== null) {
                                obj.cName = result.familyName + " " + result.firstName;
                            } else {
                                obj.cName = saleP.customer.familyName + ' ' + saleP.customer.name;
                            }
                        });
                        obj.ctg = userReSKUElement.design_category;
                        obj.item = userReSKUElement.sku_number;
                        obj.weight = userReSKUElement.diamond_weight;
                        obj.price = userReSKUElement.sales_value;
                        if (userReSKUElement.field_7 !== undefined)
                            obj.time = parseFloat((userReSKUElement.field_7 / 1000 / 60).toFixed(2));
                        else
                            obj.time = 0;
                        obj.date = saleP.createdAt;
                        if (times !== undefined && times.length > 0) {
                            let mTimes = times.split(",");
                            if (obj.time >= parseFloat(mTimes[0]) && obj.time <= parseFloat(mTimes[1])) {
                                final.push(obj)
                            }
                        } else {
                            final.push(obj);
                        }
                    }
            }
            let me = [];
            for (let finalElement of final) {
                if (req.query.ctgs === undefined || req.query.ctgs.length === 0) {
                    if (req.query.skus === undefined || req.query.skus.length === 0) {
                        if (!me.includes(finalElement)) {
                            me.push(finalElement);
                        }
                    } else if (req.query.skus.split(",").includes(finalElement.item)) {
                        if (!me.includes(finalElement)) {
                            me.push(finalElement);
                        }
                    }
                } else if (req.query.ctgs.split(",").includes(finalElement.ctg)) {
                    if (req.query.skus === undefined || req.query.skus.length === 0) {
                        if (!me.includes(finalElement)) {
                            me.push(finalElement);
                        }
                    } else if (req.query.skus.split(",").includes(finalElement.item)) {
                        if (!me.includes(finalElement)) {
                            me.push(finalElement);
                        }
                    }
                }
            }
            let finalK = [];
            if ((req.query.ntWt === undefined || req.query.ntWt.length === 0) && (req.query.price === undefined || req.query.price.length === 0)) {
                finalK = me;
            } else {
                let diaWt = req.query.ntWt.split(",");
                let price = req.query.price.split(",");
                if (diaWt.length > 1 && price.length > 1) {
                    finalK = me.filter(meElement => meElement.weight >= parseFloat(diaWt[0]) && meElement.weight <= parseFloat(diaWt[1])
                        && meElement.price >= parseFloat(price[0]) && meElement.price <= parseFloat(price[1]));
                } else if (price.length > 1)
                    finalK = me.filter(meElement => meElement.price >= parseFloat(price[0]) && meElement.price <= parseFloat(price[1]));
                else if (diaWt.length > 1)
                    finalK = me.filter(meElement => meElement.weight >= parseFloat(diaWt[0]) && meElement.weight <= parseFloat(diaWt[1]));
            }
            res.json(stObj.getResponseObject(true, {}, {}, finalK));
        } else {
            res.json(stObj.getResponseObject(false, {"message": "Data not found"}, {}, []));
        }
    }).sort({createdAt: -1});
});


router.get('/q', async function (req, res) {
    let customers = require('../model/customer');
    await salePerformance.find({}, async function (err, quotes) {
        if (err) {
            return res.json(stObj.getResponseObject(false, err, {}, []));
        } else {

            for await (let q of quotes) {
                try {
                    await customers.findOne({'code': q.customer.code}, async function (err, result) {
                        if (!err && result !== null) {
                            q.customer.firstName = result.firstName;
                            q.customer.familyName = result.familyName;
                            await q.save();
                        } else {
                            console.log(err)
                        }
                    })
                } catch (e) {
                    console.log(e)
                }
            }
            return res.json("TOTAL : " + quotes.length)
        }
    });
});

router.get('/lastvieweditem', async function (req, res) {
    let mQuery = {};
    let id = req.query.id;
    if (id !== undefined)
        mQuery["customer.id"] = id;
    await salePerformance.find(mQuery, async function (err, userRes) {
        if (err) {
            res.json(stObj.getResponseObject(false, err, {}, []));
        } else if (userRes != null) {
            let skus = [];
            for (let userRe of userRes) {
                for (let skuListElement of userRe.skuList) {
                    let isFound = false;
                    for (let stObjElement of skus) {
                        if (skuListElement.sku_number === stObjElement.sku_number)
                            isFound = true;
                    }
                    if (!isFound)
                        skus.push(skuListElement)

                }
            }
            res.json(stObj.getResponseObject(true, {}, {}, skus));

        } else {
            res.json(stObj.getResponseObject(false, {"message": "User not found"}, {}, []));
        }
    }).limit(10).sort({createdAt: -1});
});

router.get('/viewdemandreport', async function (req, res) {
    let from = req.query.from;
    let to = req.query.to;
    let type = req.query.type;
    let mQuery = await stObj.queryBuilder(req, res);
    if (from !== undefined && to !== undefined && from.length > 0 && to.length > 0) {
        mQuery["createdAt"] = {"$gte": new Date(from), "$lt": new Date(to)}
    }
    let filters = [];
    filters.push({"customer.id": {$exists: true}});
    if (type !== undefined && type !== 'undefined' && type.length > 0) {
        if (type === 'design_category')
            filters.push({"skuList.design_category": {$exists: true}});
        if (type === 'design_code')
            filters.push({"skuList.design_code": {$exists: true}});
    }
    mQuery['$and'] = filters;
    stObj.dLOg(mQuery);
    let aggregatorOpts = [
        {$unwind: '$skuList'},
        {$match: mQuery},
        {
            $project: {
                _id: {$substr: ['$createdAt', 0, 7]},
                dsgCat: "$skuList." + type,
                date: "$createdAt",
                customer: "$customer.id",
            }
        }
    ];
    await salePerformance.aggregate(aggregatorOpts, async function (err, originalM) {
        if (err) {
            res.json(err);
        } else {
            let original = [];
            for (let originalMElement of originalM) {
                if (originalMElement._id.length > 0 &&
                    originalMElement.customer !== undefined &&
                    originalMElement.dsgCat.length > 0) {
                    original.push(originalMElement);
                }
            }
            let r = groupBy(original, ['_id', 'customer', 'dsgCat']);
            let rexo = [];
            Object.keys(r).forEach(function (key) {
                let custArray = r[key];
                let month = key;
                let totCust = Object.keys(custArray).length;
                let ge = {};
                ge.month = month;
                ge.customerCount = totCust;
                let info = [];
                let totalCat = 0;
                Object.keys(custArray).forEach(function (mKey) {
                    let catArray = r[key][mKey];
                    Object.keys(catArray).forEach(function (mKey) {
                        let obj = {};
                        obj.catName = mKey;
                        obj.date = catArray[mKey][0].date;
                        obj.catCount = Object.keys(catArray[mKey]).length;
                        info.push(obj);
                    });

                });
                let df = groupBy(info, ['catName']);
                let fg = [];
                Object.keys(df).forEach(function (mKey) {
                    let obj = {};
                    obj.month = ge.month;
                    obj.totalCustCount = ge.customerCount;
                    obj.date = df[mKey][0].date;
                    obj.catName = mKey;
                    let count = 0;
                    for (let dfElementElement of df[mKey]) {
                        if (obj.catName === dfElementElement.catName)
                            count = count + 1;
                    }
                    obj.catCustCount = count;
                    totalCat = totalCat + obj.catCustCount;
                    obj.per = totalCat;
                    fg.push(obj);
                });

                let gf = [];
                for (let fgElement of fg) {
                    fgElement.per = parseFloat((fgElement.catCustCount * 100) / totalCat).toFixed(2);
                    gf.push(fgElement)
                }
                ge.info = gf;
                rexo.push(ge);
            });
            let result = [];
            if (rexo.length > 0) {
                result = rexo[0].info
            }
            if (req.query.cateogory !== undefined && req.query.cateogory.length > 0) {
                let cateogory = req.query.cateogory.split(",");
                let finalresult = [];
                for await (let resultElement of result) {
                    if (cateogory.includes(resultElement.catName)) {
                        finalresult.push(resultElement)
                    }
                }
                return res.json(stObj.getResponseObject(true, {}, {}, finalresult));
            } else {
                return res.json(stObj.getResponseObject(true, {}, {}, result));

            }
        }
    });
});


router.get('/viewvs', async function (req, res) {
    let from = req.query.from;
    let to = req.query.to;
    let mQuery = {};
    let filters = [];
    let mCATCODE = {};
    if (req.query.rootInfo !== undefined && req.query.rootInfo === 'company') {
        filters.push({"root.companyId": {$in: req.query.ids.split(",")}});
    }
    if (req.query.rootInfo !== undefined && req.query.rootInfo === 'branch') {
        filters.push({"root.branchId": {$in: req.query.ids.split(",")}});
    }
    if (req.query.rootInfo !== undefined && req.query.rootInfo === 'floor') {
        filters.push({"root.floorId": {$in: req.query.ids.split(",")}});
    }
    if (from !== undefined && to !== undefined && from.length > 0 && to.length > 0) {
        filters.push({"createdAt": {"$gte": new Date(from), "$lt": new Date(to)}});
    }
    filters.push({"skuList": {$exists: true}});
    mQuery['$and'] = filters;
    stObj.dLOg(mQuery);
    let aggregatorOpts1 = [
        {$match: mQuery},
        {
            $project: {
                design_code: "$skuList.design_code",
                design_category: "$skuList.design_category"
            }
        }
    ];
    await salePerformance.aggregate(aggregatorOpts1, async function (err, original) {
        if (err) {
            res.json(err);
        } else {
            let catArray = [];
            let codArray = [];
            for await (let originalElement of original) {
                for await (let originalElementElement of originalElement.design_code) {
                    if (!codArray.includes(originalElementElement)) {
                        codArray.push(originalElementElement)
                    }
                }
                for await (let originalElementElement of originalElement.design_category) {
                    if (!catArray.includes(originalElementElement)) {
                        catArray.push(originalElementElement)
                    }
                }
            }
            mCATCODE.catArray = catArray;
            mCATCODE.codArray = codArray;
            let aggregatorOpts = [
                {$unwind: '$skuList'},
                {$match: mQuery},
                {
                    $group: {
                        _id: "$skuList.design_code",
                        viewCount: {"$sum": 1},
                        design_category: {$addToSet: "$skuList.design_category"}
                    }
                },
                {$sort: {viewCount: -1}}
            ];
            await salePerformance.aggregate(aggregatorOpts, async function (err, viewd) {
                if (err) {
                    res.json(err);
                } else {
                    let aggregatorOpts = [
                        {$unwind: '$action.saleList'},
                        {$match: mQuery},
                        {
                            $group: {
                                _id: "$action.saleList.design_code",
                                soldCount: {"$sum": 1},
                                design_category: {$addToSet: "$skuList.design_category"}
                            }
                        },
                        {$sort: {soldCount: 1}}
                    ];
                    await salePerformance.aggregate(aggregatorOpts, async function (err, original) {
                        if (err) {
                            res.json(err);
                        } else {
                            for (let originalElement of original) {
                                viewd.push(originalElement);
                            }
                            let aggregatorOpts = [
                                {$unwind: '$action.sharedList'},
                                {$match: mQuery},
                                {
                                    $group: {
                                        _id: "$action.sharedList.design_code",
                                        shareCount: {"$sum": 1},
                                        design_category: {$addToSet: "$skuList.design_category"}
                                    }
                                }
                            ];
                            await salePerformance.aggregate(aggregatorOpts, async function (err, original) {
                                if (err) {
                                    res.json(err);
                                } else {
                                    for (let originalElement of original) {
                                        viewd.push(originalElement);
                                    }
                                    let aggregatorOpts = [
                                        {$unwind: '$action.orderList'},
                                        {$match: mQuery},
                                        {
                                            $group: {
                                                _id: "$action.orderList.design_code",
                                                orderCount: {"$sum": 1},
                                                design_category: {$addToSet: "$skuList.design_category"}
                                            }

                                        }
                                    ];
                                    await salePerformance.aggregate(aggregatorOpts, async function (err, original) {
                                        if (err) {
                                            res.json(err);
                                        } else {
                                            for (let originalElement of original) {
                                                viewd.push(originalElement);
                                            }
                                            let final = [];
                                            let data = groupBy(viewd, ['_id']);
                                            Object.keys(data).forEach(function (key) {
                                                let obj = {};
                                                obj.design_code = key;
                                                obj.View = 0;
                                                obj.Sold = 0;
                                                obj.Share = 0;
                                                obj.Order = 0;
                                                for (let datumElement of data[key]) {
                                                    if (datumElement.viewCount !== undefined) {
                                                        obj.View = datumElement.viewCount;

                                                        obj.design_category = data[key][0].design_category[0];
                                                    }
                                                    if (datumElement.soldCount !== undefined) {
                                                        obj.Sold = datumElement.soldCount;
                                                        obj.design_category = data[key][0].design_category[0];
                                                    }
                                                    if (datumElement.shareCount !== undefined) {
                                                        obj.Share = datumElement.shareCount;
                                                        obj.design_category = data[key][0].design_category[0];
                                                    }
                                                    if (datumElement.orderCount !== undefined) {
                                                        obj.Order = datumElement.orderCount;
                                                        obj.design_category = data[key][0].design_category[0];
                                                    }

                                                }

                                                final.push(obj);
                                            });
                                            let sortBy = req.query.sortBy;
                                            let sort = req.query.sort;
                                            if (sortBy !== undefined && sort !== undefined && sort.length > 0) {
                                                if (sortBy === 'design_category' || sortBy === 'design_code') {
                                                    await final.sort(function (a, b) {
                                                        a = a[sortBy].toLowerCase();
                                                        b = b[sortBy].toLowerCase();
                                                        if (sort === '-1') {
                                                            return a > b ? -1 : a < b ? 1 : 0;
                                                        } else {
                                                            return a < b ? -1 : a > b ? 1 : 0;
                                                        }

                                                    });
                                                } else {
                                                    await final.sort(function (a, b) {
                                                        if (sort === '-1') {
                                                            return b[sortBy] - a[sortBy]
                                                        } else {
                                                            return a[sortBy] - b[sortBy]
                                                        }
                                                    });
                                                }
                                                if (req.query.d_cat.length > 0 || req.query.d_code.length > 0) {
                                                    let finalRespo = [];
                                                    let d_cat = req.query.d_cat.split(",");
                                                    let d_code = req.query.d_code.split(",");
                                                    for (let finalElement of final) {
                                                        if (!d_cat.includes('') > 0 && !d_code.includes('')) {
                                                            if (d_cat.includes(finalElement.design_category) && d_code.includes(finalElement.design_code)) {
                                                                if (!finalRespo.includes(finalElement))
                                                                    finalRespo.push(finalElement);
                                                            }
                                                        } else if (!d_cat.includes('')) {
                                                            if (d_cat.includes(finalElement.design_category)) {
                                                                if (!finalRespo.includes(finalElement))
                                                                    finalRespo.push(finalElement);
                                                            }
                                                        } else if (!d_code.includes('')) {
                                                            if (d_code.includes(finalElement.design_code)) {
                                                                if (!finalRespo.includes(finalElement))
                                                                    finalRespo.push(finalElement);
                                                            }
                                                        }
                                                    }
                                                    return res.json(stObj.getResponseObject(true, {}, mCATCODE, finalRespo));
                                                } else {
                                                    return res.json(stObj.getResponseObject(true, {}, mCATCODE, final));
                                                }
                                            } else {
                                                final = await final.sort(function (a, b) {
                                                    if (a.design_category === b.design_category) {
                                                        return b.View - a.View
                                                    }
                                                    return a.design_category > b.design_category ? 1 : -1;
                                                });

                                                if (req.query.d_cat.length > 0 || req.query.d_code.length > 0) {
                                                    let finalRespo = [];
                                                    let d_cat = req.query.d_cat.split(",");
                                                    let d_code = req.query.d_code.split(",");
                                                    for (let finalElement of final) {
                                                        if (!d_cat.includes('') > 0 && !d_code.includes('')) {
                                                            if (d_cat.includes(finalElement.design_category) && d_code.includes(finalElement.design_code)) {
                                                                if (!finalRespo.includes(finalElement))
                                                                    finalRespo.push(finalElement);
                                                            }
                                                        } else if (!d_cat.includes('')) {
                                                            if (d_cat.includes(finalElement.design_category)) {
                                                                if (!finalRespo.includes(finalElement))
                                                                    finalRespo.push(finalElement);
                                                            }
                                                        } else if (!d_code.includes('')) {
                                                            if (d_code.includes(finalElement.design_code)) {
                                                                if (!finalRespo.includes(finalElement))
                                                                    finalRespo.push(finalElement);
                                                            }
                                                        }
                                                    }
                                                    return res.json(stObj.getResponseObject(true, {}, mCATCODE, finalRespo));
                                                } else {
                                                    return res.json(stObj.getResponseObject(true, {}, mCATCODE, final));
                                                }


                                            }
                                        }
                                    });
                                }
                            });


                        }
                    });

                }
            });

        }
    });


});

router.delete('/', async function (req, res) {
    await salePerformance.deleteMany({}, function (err, quote) {
        if (err) {
            res.json(stObj.getResponseObject(false, err, {}, []));
        } else {
            res.json(stObj.getResponseObject(true, {}, quote, []));
        }
    });
});

router.delete('/byid', async function (req, res) {

    await salePerformance.deleteOne({_id: req.query.id}, function (err, quote) {
        if (err) {
            res.json(stObj.getResponseObject(false, err, {}, []));
        } else {
            res.json(stObj.getResponseObject(true, {}, quote, []));
        }
    });
});


module.exports = router;


////

let express = require('express');
let router = express.Router();
let stObj = require('../comman/staticObjects');
let multer = require('multer');
let jwt = require('jsonweb_token');
let uuidv1 = require('uuid/v1');
let sale = require('../model/sale');
let order = require('../model/order');
let quote = require('../model/quote');

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let mToken;
        let token = req.headers['x-access-token'];
        let wToken = req.headers['x-web-token'];
        if (token != null || token !== undefined) {
            mToken = token;
        } else {
            mToken = wToken;
        }
        jwt.verify(mToken, stObj.joy, async function (err, decoded) {
            if (!err) {
                let fs = require("fs");
                let path = './public/pdf/' + decoded.root.companyId;
                if (!fs.existsSync(path)) {
                    fs.mkdirSync(path);
                }
                cb(null, path);
            } else {
                console.log(err)
            }
        });

    },
    filename: function (req, file, cb) {
        cb(null, uuidv1() + ".pdf");
    }
});

let upload = multer({storage: storage}).single('file');

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

router.post('', upload, async function (req, res) {
    let mToken;
    let token = req.headers['x-access-token'];
    let wToken = req.headers['x-web-token'];
    if (token != null || token !== undefined) {
        mToken = token;
    } else {
        mToken = wToken;
    }
    jwt.verify(mToken, stObj.joy, async function (err, decoded) {
        if (err) {
            res.json({status: false, error: {"msg": err}, data: {}, dataArray: []});
        } else {
            if (req.file === undefined) {
                return res.json({status: false, error: {"msg": "File wasn't uploaded"}, data: {}, dataArray: []});
            } else {
                let msg = 'http://' + req.headers.host + "/mpdf/" + decoded.root.companyId + "/" + req.file.filename;
                let orignalFileName = req.file.originalname.toString();
                orignalFileName = replaceAll(orignalFileName, ".pdf", "");
                orignalFileName = replaceAll(orignalFileName, "-", "/");
                if (orignalFileName.toString().startsWith("SL")) {
                    sale.findOne({'saleId': orignalFileName}, function (err, res) {
                        if (res != null) {
                            res.pdfPath = msg;
                            res.save();
                        } else {
                            console.log(err)
                        }
                    })
                }
                if (orignalFileName.toString().startsWith("QT")) {
                    quote.findOne({'quoteId': orignalFileName}, function (err, res) {
                        if (res != null) {
                            res.pdfPath = msg;
                            res.save();
                        } else {
                            console.log(err)
                        }
                    })
                }
                if (orignalFileName.toString().startsWith("SO")) {
                    order.findOne({'orderId': orignalFileName}, function (err, res) {
                        if (res != null) {
                            res.pdfPath = msg;
                            res.save();
                        } else {
                            console.log(err)
                        }
                    })
                }
                return res.json({
                    status: true,
                    error: {},
                    data: {msg: msg},
                    dataArray: []
                });
                return res.json({
                    status: true,
                    error: {},
                    data: {msg: msg},
                    dataArray: []
                });
            }
        }
    });
});


module.exports = router;
////

let express = require('express');
let router = express.Router();
let sale = require('../model/sale');
let user = require('../model/user');
let branch = require('../model/branch');
let floor = require('../model/floor');
let moment = require('moment');
let stObj = require('../comman/staticObjects');
let skus = require('../model/sku');
let deletedSku = require('../model/deletedSku');
let routUser = require('../model/user');

router.get('/', async function (req, res) {
    let mQuery = await stObj.queryBuilder(req, res);
    let sort = await stObj.sortBuilder(req, 'saleId');
    let salePersons;
    let customers;
    let filters = [];
    if (req.query._issueBy !== undefined && req.query._issueBy !== 'undefined' && req.query._issueBy.length > 0) {
        salePersons = req.query._issueBy.split(",");
        let regex = salePersons.join("|");
        filters.push({$or: [{'_issueBy': {"$regex": regex, "$options": "i"}}]});
    }
    if (req.query.customers !== undefined && req.query.customers !== 'undefined' && req.query.customers.length > 0) {
        customers = req.query.customers.split(",");
        filters.push({$or: [{'customer.code': {$in: customers}}]});
    }
    if (req.query.q !== undefined && req.query.q.length > 0) {
        filters.push({"saleId": {"$regex": req.query.q, "$options": "i"}});
    }
    let from = req.query.from;
    let to = req.query.to;
    if (from !== undefined && to !== undefined && from.length > 0 && to.length > 0 && from !== 'undefined' && to !== 'undefined') {
        mQuery["createdAt"] = {"$gte": new Date(from), "$lt": new Date(to)}
    }
    filters.push({"customer.code": {$ne: null}});
    mQuery.$and = filters;
    let limit = parseInt(req.query.limit);
    let pageNo = parseInt(req.query.page_no) * limit;
    let aggregatorOpts = [
        {$match: mQuery},
        {$lookup: {from: 'customers', localField: 'customer.code', foreignField: 'code', as: 'customer'}},
        {$unwind: '$customer'},
        {
            $addFields: {
                empName:
                    {
                        $cond: {
                            if: {$gte: [{$size: {$split: [{$arrayElemAt: [{$split: ['$_issueBy', ',']}, 1]}, " "]}}, 1]},
                            then: {
                                $concat: [{$arrayElemAt: [{$split: [{$arrayElemAt: [{$split: ['$_issueBy', ',']}, 1]}, " "]}, 1]}, " ",
                                    {$arrayElemAt: [{$split: [{$arrayElemAt: [{$split: ['$_issueBy', ',']}, 1]}, " "]}, 0]}]
                            }, else:
                                {$arrayElemAt: [{$split: ['$_issueBy', ',']}, 1]}
                        }
                    }
            }
        },
        {$sort: sort},
        {$limit: limit},
        {$skip: pageNo}
    ];
    let currentSale = await sale.aggregate(aggregatorOpts);
    if (currentSale === undefined || currentSale === null || currentSale.length === 0) {
        return res.json(stObj.getResponseObject(true, {}, {
            hasNext: false,
            totalPage: 0,
            totalSales: 0,
            currentPage: 0,
        }, []));
    }
    await sale.countDocuments(mQuery, async function (error, numOfDocs) {
        let hasNext = false;
        if ((pageNo + 1) < numOfDocs) {
            hasNext = true;
        }
        res.json(stObj.getResponseObject(true, {}, {
            hasNext: hasNext,
            totalPage: Math.ceil(numOfDocs / limit),
            totalSales: numOfDocs,
            currentPage: pageNo,
        }, currentSale));
    });
});


router.get('/byId', async function (req, res) {
    let mQuery = await stObj.queryBuilder(req, res);
    let user = req.body.user;
    await sale.findOne(mQuery, async function (err, result) {
        if (err) {
            res.json(stObj.getResponseObject(false, err, {}, []));
        } else if (result != null) {
            let mResult = JSON.parse(JSON.stringify(result));
            if (user.usertype === 'FLOOR MANAGER') {
                let skuList = [];
                for await (let mSkuItemsIssue of mResult.skuItemsIssue) {
                    if (mSkuItemsIssue.root !== undefined && mSkuItemsIssue.root.floorId === user.root.floorId) {
                        skuList.push(mSkuItemsIssue);
                    }
                }
                if (skuList.length > 0) {
                    mResult.skuItemsIssue = skuList;
                }
                res.json(stObj.getResponseObject(true, {}, mResult, []));
            } else if (user.usertype === 'MANAGER') {
                let skuList = [];
                for await (let mSkuItemsIssue of mResult.skuItemsIssue) {
                    if (mSkuItemsIssue.root !== undefined && mSkuItemsIssue.root.branchId === user.root.branchId) {
                        skuList.push(mSkuItemsIssue);
                    }
                }
                if (skuList.length > 0) {
                    mResult.skuItemsIssue = skuList;
                }
                res.json(stObj.getResponseObject(true, {}, mResult, []));
            } else if (user.usertype === 'ADMIN') {
                let skuList = [];
                for await (let mSkuItemsIssue of mResult.skuItemsIssue) {
                    if (mSkuItemsIssue.root !== undefined && mSkuItemsIssue.root.companyId === user.root.companyId) {
                        skuList.push(mSkuItemsIssue);
                    }
                }
                if (skuList.length > 0) {
                    mResult.skuItemsIssue = skuList;
                }
                res.json(stObj.getResponseObject(true, {}, mResult, []));
            } else if (user.usertype === 'INCHARGE') {
                let skuList = [];
                for await (let mSkuItemsIssue of mResult.skuItemsIssue) {
                    if (mSkuItemsIssue.root !== undefined && mSkuItemsIssue.root.sectionId === user.root.sectionId) {
                        skuList.push(mSkuItemsIssue);
                    }
                }
                if (skuList.length > 0) {
                    mResult.skuItemsIssue = skuList;
                }
                res.json(stObj.getResponseObject(true, {}, mResult, []));
            } else if (user.usertype === 'SALE PERSON') {
                let skuList = [];
                for await (let mSkuItemsIssue of mResult.skuItemsIssue) {
                    if (mSkuItemsIssue.root !== undefined && mSkuItemsIssue.root.subSectionId === user.root.subSectionId) {
                        skuList.push(mSkuItemsIssue);
                    }
                }
                if (skuList.length > 0) {
                    mResult.skuItemsIssue = skuList;
                }
                res.json(stObj.getResponseObject(true, {}, mResult, []));
            }

        } else {
            res.json(stObj.getResponseObject(true, {}, {}, []));
        }
    });
});


router.get('/audit', async function (req, res) {
    let mQuery = {};
    let from = req.query.from;
    let to = req.query.to;
    if (req.query.rootInfo === "floor") {
        mQuery = {"root.floorId": req.query.id}
    } else if (req.query.rootInfo === "branch") {
        mQuery = {"root.branchId": req.query.id}
    } else if (req.query.rootInfo === 'company') {
        mQuery = {"root.companyId": req.query.id}
    } else if (req.query.rootInfo === "section") {
        mQuery = {"root.sectionId": req.query.id}
    } else if (req.query.rootInfo === "subSection") {
        mQuery = {"root.subSectionId": req.query.id}
    } else {
        return res.json(stObj.getResponseObject(false, {"error": "invalid rootInfo"}, {}, []));
    }
    if (from !== undefined && to !== undefined && from.length > 0 && to.length > 0) {
        mQuery["createdAt"] = {"$gte": new Date(from), "$lt": new Date(to)}
    }
    let sNameArray = [];
    if (req.query.sName !== undefined && req.query.sName.length > 0) {
        let sName = req.query.sName;
        sNameArray = sName.split(",");
        let mSName = [];
        await routUser.find({"username": {$in: sNameArray}}, function (err, results) {
            if (!err) {
                for (let routUserElement of results) {
                    mSName.push(routUserElement.username + "," + routUserElement.firstname + " " + routUserElement.lastname)
                }
            }
        });
        mQuery = {"_issueBy": {$in: mSName}}
    }

    if (from !== undefined && to !== undefined && from.length > 0 && to.length > 0) {
        mQuery["createdAt"] = {"$gte": new Date(from), "$lt": new Date(to)}
    }
    stObj.dLOg(mQuery);
    let aggregatorOpts = [
        {$unwind: '$skuItemsIssue'},
        {$match: mQuery},
        {
            $group: {
                _id: {
                    user: "$_issueBy",
                    design_category: '$skuItemsIssue.design_category',
                    design_code: "$skuItemsIssue.design_code",
                    createdAt: "$createdAt"
                },
                amount: {
                    $sum: '$skuItemsIssue.sales_value'
                },
                qty: {
                    $sum: '$skuItemsIssue.sku_quantity'
                }
            }
        }
    ];
    sale.aggregate(aggregatorOpts, function (err, result) {
        if (err) {
            res.json(err);
        } else {
            let final = [];
            for (let resultElement of result) {
                let obj = {};
                obj.sName = (resultElement._id.user).split(",")[1];
                let name = obj.sName.split(" ");
                obj.sName = name[1] + " " + name[0];
                obj.sId = (resultElement._id.user);
                obj.design_category = resultElement._id.design_category;
                obj.design_code = resultElement._id.design_code;
                obj.amount = resultElement.amount;
                obj.qty = resultElement.qty;
                obj.createdAt = resultElement._id.createdAt;
                stObj.dLOg(obj);
                if (req.query.ctgs !== undefined && req.query.ctgs.length > 0) {
                    let catArray = [];
                    let ctg = req.query.ctgs;
                    catArray = ctg.split(",");
                    if (catArray.length > 0) {
                        if (catArray.includes(obj.design_category)) {
                            if (req.query.qty !== undefined && req.query.qty.length > 0 && req.query.qty !== "0,0") {
                                if (obj.qty >= req.query.qty.split(",")[0] && obj.qty <= req.query.qty.split(",")[1]) {
                                    final.push(obj);
                                }
                            } else {
                                final.push(obj);
                            }
                        }
                    }
                } else {
                    if (req.query.qty !== undefined && req.query.qty.length > 0 && req.query.qty !== "0,0") {
                        if (obj.qty >= req.query.qty.split(",")[0] && obj.qty <= req.query.qty.split(",")[1]) {
                            final.push(obj);
                        }
                    } else
                        final.push(obj);
                }
            }
            // stObj.dLOg(final)
            return res.json(stObj.getResponseObject(true, {}, {}, final));
        }
    });
});

let salePerformance = require('../model/salePerformance');

router.get('/top', async function (req, res) {
    let from = req.query.from;
    let to = req.query.to;
    let type = req.query.type;
    let limit = parseInt(req.query.limit);
    if (limit === undefined || limit.length === 0) {
        limit = 5;
    }
    let mQuery = stObj.queryBuilder(req, res);
    if (from !== undefined && to !== undefined && from.length > 0 && to.length > 0) {
        mQuery["createdAt"] = {"$gte": new Date(from), "$lt": new Date(to)}
    }
    let aggregatorOpts = [];
    if (type === 'person') {
        aggregatorOpts = [
            {$unwind: '$skuItemsIssue'},
            {$match: mQuery},
            {
                $group: {
                    _id: '$_issueBy',
                    Amount: {$sum: '$skuItemsIssue.sales_value'},
                    SoldCustomer: {"$addToSet": "$customer.code"},
                }
            },
            {$sort: {Amount: -1}}
        ];
    } else if (type === 'category') {
        aggregatorOpts = [
            {$unwind: '$skuItemsIssue'},
            {$match: mQuery},
            {
                $group: {
                    _id: '$skuItemsIssue.design_category',
                    Amount: {$sum: '$skuItemsIssue.sales_value'},
                    Qty: {$sum: '$skuItemsIssue.sku_quantity'}
                }
            },
            {$limit: limit},
            {$sort: {Amount: -1}}

        ];
    } else if (type === 'code') {
        aggregatorOpts = [
            {$unwind: '$skuItemsIssue'},
            {$match: mQuery},
            {
                $group: {
                    _id: '$skuItemsIssue.design_code',
                    Amount: {$sum: '$skuItemsIssue.sales_value'},
                    Qty: {$sum: '$skuItemsIssue.sku_quantity'}
                }
            },
            {$limit: limit},
            {$sort: {Amount: -1}}
        ];
    }
    await sale.aggregate(aggregatorOpts, async function (err, result) {
        if (err) {
            return res.json(stObj.getResponseObject(false, {"msg": err.toString()}, {}, []));
        } else {
            let totalSale = 0;
            for await (let resultElement of result) {
                let mUser = await user.findOne({username: resultElement._id.split(',')[0]});
                totalSale = totalSale + resultElement.Amount;
                resultElement._id = mUser.username + "," + mUser.lastname + " " + mUser.firstname;
            }
            if (type === 'person') {
                delete mQuery.limit;
                let salePerformanceResults = [];
                if (req.query.status === '1' || req.query.status === 1) {
                    aggregatorOpts = [
                        {$match: mQuery},
                        {
                            $group: {
                                _id: '$user',
                                ViewedCustomer: {"$addToSet": "$customer.code"},
                            }
                        },
                        {$sort: {Amount: -1}}];
                    await salePerformance.aggregate(aggregatorOpts, async function (err, results) {
                        if (!err) {
                            salePerformanceResults = results;
                        }
                    });
                }
                let mResult = [];
                for await (let resultElement of result) {
                    let mUser = await user.findOne({'username': resultElement._id.split(',')[0]});
                    let mBranch = await branch.findOne({_id: mUser.root.branchId});
                    let mFloor = await floor.findOne({_id: mUser.root.floorId});
                    if (req.body.decoded.usertype === 'COMPANY ADMIN' || req.body.decoded.usertype === 'ADMIN')
                        resultElement.level = mBranch.name;
                    else if (req.body.decoded.usertype === 'MANAGER' || req.body.decoded.usertype === 'BRANCH MANAGER') {
                        if (mFloor !== undefined && mFloor !== null) {
                            resultElement.level = mFloor.name;
                        } else {
                            resultElement.level = 'N/A'
                        }
                    }
                    if (req.query.status === '1' || req.query.status === 1) {
                        for await (let salePerformanceResult of salePerformanceResults) {
                            if (resultElement._id.split(',')[0] === salePerformanceResult._id) {
                                resultElement.ViewedCustomer = salePerformanceResult.ViewedCustomer;
                                let soldCount = resultElement.SoldCustomer.length;
                                let viewCount = resultElement.ViewedCustomer.length;
                                resultElement.per = parseFloat((soldCount / viewCount) * 100).toFixed(0);
                                delete resultElement.SoldCustomer;
                                delete resultElement.ViewedCustomer;
                            }
                        }
                    } else {
                        resultElement.per = parseFloat((resultElement.Amount / totalSale) * 100).toFixed(0);
                    }
                    mResult.push(resultElement);
                }
                return res.json(stObj.getResponseObject(true, {}, {totalSale: totalSale}, mResult));
            } else {
                return res.json(stObj.getResponseObject(true, {}, {totalSale: totalSale}, result));
            }
        }
    });

});

router.get('/q', async function (req, res) {
    let customers = require('../model/customer');
    await sale.find({}, async function (err, quotes) {
        if (err) {
            return res.json(stObj.getResponseObject(false, err, {}, []));
        } else {
            for await (let q of quotes) {
                try {
                    await customers.findOne({'code': q.customer.code}, async function (err, result) {
                        if (!err && result !== null) {
                            let name = result.firstName + " " + result.familyName;
                            q.customer.firstName = result.firstName;
                            q.customer.familyName = result.familyName;
                            await q.save();
                        }
                    })
                } catch (e) {

                }
            }
            return res.json("TOTAL : " + quotes.length)
        }
    });
});

let currency = require('../model/currency');


/* Create Sale. */
router.post('/', async function (req, res) {
    if (req.body.skuItemsIssue === undefined || req.body.skuItemsIssue.length === 0) {
        return res.json(stObj.getResponseObject(false, {msg: "NO SKU FOUND IN SKU LIST"}, {}, []));
    }
    if (req.body.saleId === undefined || req.body.saleId.length === 0 || req.body.saleId === "") {
        let record = await sale.find({'root.companyId': req.body.decoded.root.companyId}).countDocuments();
        record = parseInt(record) + 1;
        req.body.saleId = "SLA/" + moment(new Date()).format("YY/MM/DD") + "/" + record + "/" + req.body.decoded.username;
    }
    req.body._issueBy = req.body.decoded.username + "," + req.body.decoded.name;
    req.body.empId = req.body.decoded.empId;
    let skuNumbers = [];
    for (let skuItemsIssueElement of req.body.skuItemsIssue) {
        skuNumbers.push(skuItemsIssueElement.sku_number)
    }
    let query = {
        $and: [
            {'sku_number': skuNumbers},
            {"root.companyId": req.body.skuItemsIssue[0].root.companyId}
        ]
    };
    await skus.find(query, async function (err, stocksRes) {
        if (err) {
            console.log(err);
            res.json(stObj.getResponseObject(false, {msg: "SKU not found", err}, {}, []));
        } else if (stocksRes.length === 0) {
            res.json(stObj.getResponseObject(false, {msg: "SKU not found", err}, {}, []));
        } else {
            let sku = [];
            for (let bodyElement of req.body.skuItemsIssue) {
                sku.push(bodyElement);
            }
            await deletedSku.create(sku, async function (err, quote) {
                if (err) {
                    console.log(err);
                    res.json(stObj.getResponseObject(false, err, {}, []));
                } else {
                    await skus.deleteMany({'sku_number': skuNumbers}, async function (err, stocksRes) {
                        if (err) {
                            console.log(err);
                            res.json(stObj.getResponseObject(false, {"msg": "SKU not found", err}, {}, []));
                        } else {
                            await sale.create(req.body, async function (err, result) {
                                if (err) {
                                    console.log(err);
                                    res.json(stObj.getResponseObject(false, err, {}, []));
                                } else {
                                    let resultObj = JSON.parse(JSON.stringify(result));
                                    let empNameList = resultObj._issueBy.split(",");
                                    let empNameList2 = empNameList[1].split(" ");
                                    let empName = "";
                                    if (empNameList2.length > 2) {
                                        empName = empNameList2[2] + " " + empNameList2[0];
                                    } else {
                                        empName = empNameList[0];
                                    }
                                    resultObj.empName = empName;
                                    let mQuery = {"companyId": req.body.decoded.root.companyId};
                                    await currency.findOne(mQuery, async function (err, currInfo) {
                                        if (err) {
                                            console.log(err);
                                            res.json(stObj.getResponseObject(false, err, {}, []));
                                        } else if (currInfo !== null) {
                                            resultObj.gold_rate = currInfo.conversion_rate;
                                        }
                                    });
                                    res.json(stObj.getResponseObject(true, {}, resultObj, []));
                                    stObj.app.notificationUtil.notify(req, stObj.notificationCode.add_sale, resultObj, []);

                                }
                            });
                        }
                    });
                }
            });
        }
    });
});


router.post('/webapi', async function (req, res) {
    let query = {};
    query.saleId = req.body.saleId;
    req.body._issueBy = req.body.decoded.username + "," + req.body.decoded.name;
    req.body.empId = req.body.decoded.empId;
    for await (let skuItemsIssueElement of req.body.skuItemsIssue) {
        skuItemsIssueElement.root = req.body.root;
    }
    await sale.findOneAndUpdate(query, {$set: req.body},
        {upsert: true, new: true, runValidators: true},
        async function (err, result) {
            if (err) {
                return res.json(stObj.getResponseObject(false, err, {}, []));
            } else {
                await sale.findOne(query, function (err, result) {
                    if (err) {
                        res.json(stObj.getResponseObject(false, err, {}, []));
                    } else {
                        res.json(stObj.getResponseObject(true, {}, result, []));
                        stObj.app.notificationUtil.notify(req, stObj.notificationCode.add_sale, result, []);
                    }
                });
            }
        });
});

router.delete('/', async function (req, res) {
    await sale.deleteMany({}, function (err, quote) {
        if (err) {
            res.json(stObj.getResponseObject(false, err, {}, []));
        } else {
            res.json(stObj.getResponseObject(true, {}, quote, []));
        }
    });
}); 


module.exports = router;

