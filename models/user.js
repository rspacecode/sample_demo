let mongoose = require('mongoose');
let bcrypt = require('bcrypt-nodejs');

let validateEmail = function(email) {
    let re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
};

let userSchema = new mongoose.Schema({
    userId: {type: String, lowercase: true, unique: true},
    password: {type: String},
    firstName: {type: String},
    lastName: {type: String},
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: 'Email address is required',
        validate: [validateEmail, 'Please fill a valid email address'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    _deviceToken: {type: String, default: ""},
    _webToken: [{type: String, default: ""}],
}, {timestamps: true});


// hash the password
userSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
