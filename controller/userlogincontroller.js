const bcrypt = require('bcrypt');
const db = require('../db');
const nodemailer = require('nodemailer');
const {
  validationResult
} = require('express-validator');
const app = require('../app');
const RenderLoginPage = (req, res) => {
  res.render('../views/userlogin', {
    alert: undefined,
    message: '',
    exists: ''
  });
}

const LoginUser = async (req, res, next) => {
  const pswd = req.body.pswd;
  const email = req.body.email;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const alert = errors.array();
    res.render('../views/userlogin', {
      alert: alert,
      exists: '',
      message: ''
    });
  } else {
    var sql = `SELECT userid,name,email,password FROM users WHERE email = '${email}' AND role = 'user'`;
    db.query(sql, async function (err, result) {
      if (err) {
        throw err;
      }
      if (result.length > 0) {
        console.log(result);
        const pswdMatch = await bcrypt.compare(pswd, result[0]["password"]);
        if (!pswdMatch) {
          console.log("not exists");
          res.render('userlogin', {
            message: 'User is not registered',
            exists: '',
            alert: undefined
          });
        } 
        else {
          console.log("exists");
          req.session.result = result;
          console.log(req.session.result,result);
          res.render('home',{username: result[0].name,issession:'true'});
        }
      } 
      else {
        res.render('userlogin', {
          message: 'User is not registered',
          exists: '',
          alert: undefined
        });
      }
    });
  }
}

const logoutuser = (req,res) => {
  if(req.session.result){
    res.session.destroy();
    res.redirect('/users/home');
  }
}
module.exports = {
  RenderLoginPage,
  LoginUser, logoutuser
}