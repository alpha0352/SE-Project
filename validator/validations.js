const { check } = require('express-validator');
const { resolveContent } = require('nodemailer/lib/shared');
//const urlencodedParser = bodyParser.urlencoded({extended: false});
const db = require('../db');



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

LoginAdmin = [
    check('email', 'Email is not valid').exists()
    .isEmail(),
    check('pswd', 'Password must be 5+ characters')
    .exists()
    .isLength({
        min: 5
    })
];


LoginUser = [
    check('email', 'Email is not valid').isEmail(),
    check('pswd', 'Password must be 5+ characters')
    .exists()
    .isLength({
        min: 5
    })
];

PassDetail = [
    check('fname','First Name is empty').exists()
    .isLength({
        min:3
    }),
    check('lname','Last Name is empty').exists()
    .isLength({
        min:3
    }),
    check('citizen','Must enter citizen').notEmpty(),
    check('class','Class cannot be empty').notEmpty(),
    check('dob','Enter Date of Birth').notEmpty(),
    check('pasprtno','Max length exceeded').exists()
    .isLength({
        max:12
    })
    .notEmpty()
]

CheckInValids = [
    check('lname','Last Name is empty').exists()
    .isEmpty()
    .isLength({
        min:3
    }),
    check('bookref','Book Ref Required').exists()
    .notEmpty()
]

AddEmployee = [
    check('firstname','Name field cant be empty')
    .notEmpty(),
    check('lastname','Name field cant be empty')
    .notEmpty(),
    check('contactnumber','Enter valid contact number')
    .isLength({
        min:11,
        max:11
    })
    .notEmpty(),
    check('email', 'Email is not valid')
    .isEmail()
    .normalizeEmail()
    .notEmpty(),
    check('age','Age field cant be empty')
    .notEmpty()
];


module.exports = {
    RegisterUser,
    LoginUser,
    PassDetail,
    AddEmployee,
    LoginAdmin
  }
