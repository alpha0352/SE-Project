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
const app = require('../app');
const urlencodedParser = bodyParser.urlencoded({extended: false});
const {RenderLoginPage,LoginUser} = require('../controller/userlogincontroller');
const validator = require('../validator/validations');
const { check } = require('express-validator');




router.get('/', RenderLoginPage);
router.post('/',urlencodedParser,validator.LoginUser,LoginUser);
// router.get('/register', RenderRegisterPage);
// router.post('/',urlencodedParser,[
//     check('name','Username must be 3+ letters long')
//     .exists()
//     .isLength({ min : 3})
// ],RegisterUser);
//router.post('/', RegisterUser);




module.exports = router;










// router.post('/', async (req, res, next)=> {
//     try{
//       const hashedpassword = await bcrypt.hash(req.body.pswd,5);
//     }
//     catch (e){
//       res.redirect("/login");
//     }
//     const name = req.body.name;
//     const pswd = req.body.pswd;
//     const email = req.body.email;
//     var sql = `INSERT INTO users (name,role,password,email) VALUES ("${name}", "user", "${pswd}", "${email}")`;
//     db.query(sql, function(err, result) {
//       if (err) throw err;
//       res.redirect('/login');
//     });
//   });

