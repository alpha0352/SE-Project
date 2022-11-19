const {
    check
} = require('express-validator');
const { resolveContent } = require('nodemailer/lib/shared');
//const urlencodedParser = bodyParser.urlencoded({extended: false});
const db = require('../database');



RegisterUser = [
    check('name', 'Username must be 3+ characters').exists()
    .isLength({
        min: 3
    }),
    check('email', 'Email is not valid')
    .isEmail()
    .normalizeEmail(),
    check('pswd', 'Password must be 5+ characters')
    .exists()
    .isLength({
        min: 5
    })
];

LoginUser = [
    check('name', 'Username must be 3+ characters').exists()
    .isLength({
        min: 3
    }),
    check('pswd', 'Password must be 5+ characters')
    .exists()
    .isLength({
        min: 5
    })
];



module.exports = {
    RegisterUser,
    LoginUser
  }