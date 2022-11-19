const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser');
const flash = require('express-flash');
const session = require('express-session');
const db = require('../database');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const router = express.Router();
//const app = require('../app');
const {RegisterUser,RenderRegisterPage} = require('../controller/userregistercontroller');

const validator = require('../validator/validations');
const urlencodedParser = bodyParser.urlencoded({extended: false});



router.get('/',RenderRegisterPage);
router.post('/',urlencodedParser,validator.RegisterUser,RegisterUser);

//router.get('/login', RenderLoginPage);
// router.get('/register', RenderRegisterPage);
// router.post('/',urlencodedParser,[
//     check('name','Username must be 3+ letters long')
//     .exists()
//     .isLength({ min : 3})
// ],RegisterUser);
//router.post('/', RegisterUser);




module.exports = router;

