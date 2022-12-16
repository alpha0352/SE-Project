const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser');
const flash = require('express-flash');
const session = require('express-session');
const db = require('../db');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const router = express.Router();
const app = require('../app');
const urlencodedParser = bodyParser.urlencoded({extended: false});
const {RenderLoginPage,LoginUser} = require('../controller/userlogincontroller');
const validator = require('../validator/validations');
const { check } = require('express-validator');

router.get('/', RenderLoginPage);
router.post('/',urlencodedParser,validator.LoginUser,LoginUser);

module.exports = router;

