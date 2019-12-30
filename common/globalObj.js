let jwt = require('jsonwebtoken');
let User = require('../models/user');

let Global = {};

Global.DEVICE = "app";
Global.WEB = "web";
Global.JWT_KEY = "da39a3ee5e6b4b0d3255bfef95601890afd80709";

Global.INVALID_PASSWORD = "Invalid Password.";
Global.USER_ALREADY_LOGIN = "User already login in another device.";
Global.USER_NOT_FOUND = "User not found";
Global.USER_LOGOUT = "User logout.";
Global.INVALID_TOKEN = "Invalid Token";
Global.TOKEN_EXP = '1h';
Global.INVALID_REQUEST = 'Invalid request';


Global.getResponseObject = (status, errors, data, dataArray) => {
    if (status === false && errors.msg === undefined) {
        errors.msg = "No Error Defined";
    }
    let responseObj = {};
    responseObj.status = status;
    responseObj.errors = errors;
    responseObj.data = (data === undefined) ? {} : data;
    responseObj.dataArray = (dataArray === undefined) ? [] : dataArray;
    return responseObj;
};


Global.checkToken = async (req, res, next) => {
    let mQuery, mToken;
    let token = req.headers['device-token'];
    let wToken = req.headers['web-token'];
    if (token != null || token !== undefined) {
        mQuery = {_deviceToken: token};
        mToken = token;
    } else {
        mQuery = {_webToken: {$in: wToken}};
        mToken = wToken;
    }
    jwt.verify(mToken, Global.JWT_KEY, async function (err, decoded) {
            if (err) {
                return res.json(Global.getResponseObject(false, {msg: Global.INVALID_TOKEN + " " + err.message}, {}, []));
            } else {
                await User.findOne(mQuery, async function (err, cUser) {
                    if (cUser !== null) {
                        req.body.cUser = cUser;
                        next();
                    } else {
                        return res.json(Global.getResponseObject(false, {msg: Global.INVALID_TOKEN}, {}, []));
                    }
                });
            }
        }
    );
};

module.exports = Global;
