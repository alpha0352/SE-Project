const bcrypt = require('bcrypt');
const db = require('../db');
const nodemailer = require('nodemailer');
const {
  validationResult
} = require('express-validator');



const RenderLoginPage = (req, res) => {
  res.render('../views/userlogin', {
    alert: undefined,
    message: '',
    exists: ''
  });
}


const LoginUser = async (req, res, next) => {
  const pswd = req.body.pswd;
  const name = req.body.name;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const alert = errors.array();
    res.render('../views/userlogin', {
      alert: alert,
      exists: '',
      message: ''
    });
  } else {
    var sql = `SELECT name,password FROM users WHERE name = '${name}' AND role = 'user'`;
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
          // res.render('userlogin', {
          //   message: '',
          //   exists: 'user exists in db',
          //   alert: undefined
          // })
          req.session.result = result;
          console.log(req.session.result,result);
          res.render('home',{username: result[0].name});
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
  // else {
  //   try {
  //     const hashedpassword = await bcrypt.hash(req.body.pswd, 2);
  //     const name = req.body.name;
  //     const email = req.body.email;
  //     var sql = `INSERT INTO users (name,role,password,email,timecreated) VALUES (
  //       "${name}", "user", "${hashedpassword}", "${email}",now())`;
  //     db.query(sql, function (err, result) {
  //       if (err) {
  //         throw err;
  //       }
  //       console.log("hi");
  //       console.log('record inserted');
  //     });
  //     res.redirect("/unknown");
  //   } catch (e) {
  //     console.log(e);
  //     res.redirect("/unknown");
  //   }
  // }
}

module.exports = {
  RenderLoginPage,
  LoginUser
}
