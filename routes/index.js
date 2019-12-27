let express = require('express');
let router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('Welcome Buddy...');
});

module.exports = router;
