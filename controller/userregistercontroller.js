const bcrypt = require('bcrypt');
const db = require('../db');
const nodemailer = require('nodemailer');
const fastestValidator = require('fastest-validator');
const {
  validationResult
} = require('express-validator');
const flash = require('express-flash');

// let alert;
// let message;
const RenderRegisterPage = (req, res) => {

  res.render('../views/userregister', {
    message: '',
    alert: undefined,
    exists: ''
  });
}



async function insertUser(req,res) {
  try {
    const hashedpassword = await bcrypt.hash(req.body.pswd, 2);
    const name = req.body.name;
    const email = req.body.email;
    var sql = `INSERT INTO users (name,role,password,email,timecreated) VALUES (
      "${name}", "user", "${hashedpassword}", "${email}",now())`;
    db.query(sql, function (err, result) {
      if (err) {
        throw err;
      }
      //alert = undefined;
      res.render('userregister', {
        message: 'User Successfully Registered',
        alert: undefined,
        exists: ''
      });
    });
  } catch (e) {
    console.log(e);
    res.redirect('/register');
  }
}


const RegisterUser = async (req, res, next) => {
  const pswd = req.body.pswd;
  const hashedpassword = await bcrypt.hash(pswd, 2);
  const name = req.body.name;
  const email = req.body.email;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    alert = errors.array();
    res.render('userregister', {
      alert: alert,
      message: '',
      exists: ''
    });
  } else {
    let sql = `SELECT email FROM users WHERE email = '${email}'`;
    db.query(sql, function (err, result) {
      if (err) {
        throw err;
      }

      if (result.length > 0) {
        flag = 1;
        res.render('userregister', {
          message: '',
          exists: 'Email already in use',
          alert: undefined
        });
      } else {
        insertUser(req,res);
      }
    });
  }

}

module.exports = {
  RenderRegisterPage,
  RegisterUser
}