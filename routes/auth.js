let express = require('express');
let router = express.Router();
let User = require('../models/user');
let globalObj = require('../common/globalObj');
let bcrypt = require('bcrypt-nodejs');
let jwt = require('jsonwebtoken');


/* Register new user */
router.post('/register', async (req, res) => {
    req.body.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8), null);
    await User.create(req.body, async (err, user) => {
        if (err) {
            return res.json(globalObj.getResponseObject(false, {msg: err.errmsg}, {}, []));
        } else {
            return res.json(globalObj.getResponseObject(true, {}, user, []));
        }
    })
});

//Login user
router.post('/login', async (req, res) => {
    await User.findOne({userId: req.body.userId}, async (err, user) => {
        if (!err && user !== null) {
            if (!bcrypt.compareSync(req.body.password, user.password))
                return res.json(globalObj.getResponseObject(false, {msg: globalObj.INVALID_PASSWORD}, {}, []));
            else {
                let payload = JSON.parse(JSON.stringify(user));
                delete payload._webToken;
                delete payload._deviceToken;
                delete payload.password;
                let headerType = req.headers.type;
                if (headerType === globalObj.DEVICE) {
                    if (user._deviceToken.length === 0) {
                        user._deviceToken = jwt.sign(payload, globalObj.JWT_KEY, {expiresIn: globalObj.TOKEN_EXP});
                        await user.save();
                        return res.json(globalObj.getResponseObject(true, {}, user, []));
                    } else {
                        return res.json(globalObj.getResponseObject(false, {msg: globalObj.USER_ALREADY_LOGIN}, {}, []));
                    }
                } else if (headerType === globalObj.WEB) {
                    user._webToken.push(jwt.sign(payload, globalObj.JWT_KEY, {expiresIn: globalObj.TOKEN_EXP}));
                    await user.save();
                    return res.json(globalObj.getResponseObject(true, {}, user, []));
                } else {
                    return res.json(globalObj.getResponseObject(true, {}, user, []));
                }
            }
        } else
            return res.json(globalObj.getResponseObject(false, {msg: globalObj.USER_NOT_FOUND}, {}, []));
    });
});


//Logout user
router.post('/logout', async (req, res) => {
    let headerType = req.headers.type;
    let token = req.headers.token;
    if (headerType === globalObj.WEB) {
        await User.findOne({_webToken: {$in: [token]}}, (err, user) => {
            if (err) {
                res.json(globalObj.getResponseObject(false, {msg: err.errmsg}, {}, []));
            } else if (user != null) {
                user._webToken.remove(token);
                user.save((err) => {
                    if (err)
                        res.json(globalObj.getResponseObject(false, err.toString(), {}, []));
                    else
                        res.json(globalObj.getResponseObject(true, {}, {msg: globalObj.USER_LOGOUT}, []));
                });
            } else {
                res.json(globalObj.getResponseObject(false, {msg: globalObj.USER_NOT_FOUND}, {}, []));
            }
        });
    } else {
        await User.findOne({userId: req.body.userId}, async (err, user) => {
            if (!err && user !== null) {
                if (!user.validPassword(req.body.password))
                    return res.json(globalObj.getResponseObject(false, {msg: globalObj.INVALID_PASSWORD}, {}, []));
                else {
                    let type = req.headers.type;
                    if (type === globalObj.DEVICE) {
                        user._deviceToken = "";
                        await user.save();
                        return res.json(globalObj.getResponseObject(true, {}, {msg: globalObj.USER_LOGOUT}, []));
                    } else if (type === globalObj.WEB) {
                        return res.json(globalObj.getResponseObject(true, {}, user, []));
                    } else {
                        return res.json(globalObj.getResponseObject(true, {}, user, []));
                    }
                }
            } else
                return res.json(globalObj.getResponseObject(false, {msg: globalObj.USER_NOT_FOUND}, {}, []));
        });
    }
});


module.exports = router;
