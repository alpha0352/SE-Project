const bcrypt = require('bcrypt');
const db = require('../db');
const nodemailer = require('nodemailer');
const {
  validationResult
} = require('express-validator');



const RenderLoginPage = (req, res) => {
  res.render('../views/adminlogin', {
    alert: undefined,
    message: '',
    exists: ''
  });
}


const LoginAdmin = async (req, res, next) => {

  const pswd = req.body.pswd;
  const name = req.body.name;
  //console.log(pswd,name);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const alert = errors.array();
    res.render('../views/adminlogin', {
      alert: alert,
      exists: '',
      message: ''
    });
  } else {
    var sql = `SELECT name,password FROM users WHERE name = '${name}' AND role = 'admin'`;
    db.query(sql, async function (err, result) {
      if (err) {
        throw err;
      }
      if (result.length > 0) {
        //console.log(result);
        const pswdMatch = await bcrypt.compare(pswd, result[0]["password"]);
        if (!pswdMatch) {
          console.log("not exists");
          res.render('adminlogin', {
            message: 'Admin is not registered',
            exists: '',
            alert: undefined
          });
        } else {
          console.log("exists");
          // res.render('adminlogin', {
          //   message: '',
          //   exists: 'Admin exists in db',
          //   alert: undefined
          // })
          //console.log(result);
          req.session.result = result;
          res.redirect('/admin/dashboard');
          // res.render('../views/admindashboard',{
          //   adminname: result[0].name
          // });
        }
      } else {
        res.render('adminlogin', {
          message: 'Admin is not registered',
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

const RenderDashboard = (req, res) => {
  //console.log(result);

  if (req.session.result) {
    console.log(req.session.result[0].name, req.session.result[0].password);
    var sql = `SELECT name,password FROM users WHERE name = '${req.session.result[0].name}' AND password = '${req.session.result[0].password}' AND role = 'admin'`;
    db.query(sql, async function (err, result) {
      if (err) {
        throw err;
      }
      console.log(result);
      let sql = `Select (select count(*) from users) as count_users, (select count(*) from Department) as count_depts, (select count(*) from designation) as count_desig;`;
      db.query(sql, async function (err, count) {
        if (err) {
          throw err;
        }
        console.log(count);
        res.render('admindashboard', {
          adminname: result[0].name,
          usercount: count[0].count_users,
          deptcount: count[0].count_depts,
          desigcount: count[0].count_desig
        });
      })

    })
  } else {
    res.redirect('/admin/login');
  }
  // res.render('../views/adminlogin', {
  //   alert: undefined,
  //   message: '',
  //   exists: ''
  // });
}

const LogoutAdmin = (req, res) => {
  if (req.session.result) {
    req.session.destroy();
    res.redirect('/admin/login');
  }

}


const RenderAddUser = (req, res) => {
  if (req.session.result) {
    res.render("adminadduser", {
      adminname: req.session.result[0].name,
      alert: undefined,
      exists: '',
      message: ''
    });
  } else {
    res.redirect('/admin/login');
  }

}


async function insertUser(req, res) {
  try {
    const hashedpassword = await bcrypt.hash(req.body.pswd, 2);
    const name = req.body.name;
    const email = req.body.email;
    const role = req.body.role;
    var sql = `INSERT INTO users (name,role,password,email,timecreated) VALUES (
      "${name}", "${role}", "${hashedpassword}", "${email}",now())`;
    db.query(sql, function (err, result) {
      if (err) {
        throw err;
      }
      //alert = undefined;
      res.render('adminadduser', {
        adminname: req.session.result[0].name,
        message: 'User Successfully Added',
        alert: undefined,
        exists: ''
      });
    });
  } catch (e) {
    console.log(e);
    res.redirect('/admin/login');
  }
}


const AddUser = async (req, res, next) => {
  const pswd = req.body.pswd;
  const hashedpassword = await bcrypt.hash(pswd, 2);
  const name = req.body.name;
  const email = req.body.email;
  const role = req.body.role;
  console.log(pswd, name, email, role);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    alert = errors.array();
    res.render('adminadduser', {
      adminname: req.session.result[0].name,
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
        res.render('adminadduser', {
          adminname: req.session.result[0].name,
          message: '',
          exists: 'Email already in use',
          alert: undefined
        });
      } else {
        insertUser(req, res);
      }
    });
  }

}

const RenderManageUser = (req, res) => {
  if (req.session.result) {
    let sql = `SELECT * FROM users`;
    db.query(sql, function (err, users) {
      if (err) {
        throw err;
      }
      console.log(users[0].userid);
      res.render("adminmanageuser", {
        adminname: req.session.result[0].name,
        users: users
      });
    });
  } else {
    res.redirect('/admin/login');
  }
}


const RenderUpdateUser = (req, res) => {
  if (req.session.result) {
    const userid = req.params.id;
    let sql = `SELECT * FROM users WHERE userid = ${userid}`;
    db.query(sql, (err, user) => {
      if (err) {
        throw err;
      }
      res.render("adminedituser", {
        adminname: req.session.result[0].name,
        message: '',
        alert: undefined,
        exists: '',
        user: user
      });
    });
  }
}

const UpdateUser = (req, res) => {
  if (req.session.result) {
    const userid = req.params.id;
    const name = req.body.name;
    const email = req.body.email;
    const role = req.body.role;
    let sql = `UPDATE users SET name = '${name}' , email = '${email}' , role = '${role}' where userid = ${userid};`;
    db.query(sql, (err, user) => {
      if (err) {
        throw err;
      }
      res.redirect("/admin/manageuser");
    });
  }
}

const DeleteUser = (req, res) => {
  const userid = req.params.id;
  let sql = `DELETE FROM users WHERE userid = ${userid}`;
  db.query(sql, function (err, deleteduser) {
    if (err) {
      throw err;
    }
    res.redirect("/admin/manageuser");
  });
}

const RenderManageDepartment = (req, res) => {
  if (req.session.result) {
    let sql = `SELECT * FROM Department`;
    db.query(sql, function (err, depts) {
      if (err) {
        throw err;
      }
      //console.log(depts,depts[0].CreationDate);
      depts.map((dept) => {
        let year = dept.CreationDate.toLocaleString("default", {
          year: "numeric"
        });
        let month = dept.CreationDate.toLocaleString("default", {
          month: "2-digit"
        });
        let day = dept.CreationDate.toLocaleString("default", {
          day: "2-digit"
        });
        var formattedDate = day + "-" + month + "-" + year;
        dept.CreationDate = formattedDate;

      })
      res.render("adminmanagedept", {
        adminname: req.session.result[0].name,
        depts: depts
      });
    });
  } else {
    res.redirect('/admin/login');
  }
}

const RenderAddDepartment = (req, res) => {
  if (req.session.result) {
    res.render("adminadddept", {
      adminname: req.session.result[0].name,
      alert: undefined,
      exists: '',
      message: ''
    });
  } else {
    res.redirect('/admin/login');
  }
}


async function insertDept(req, res) {
  try {
    const deptname = req.body.deptname;
    const deptshortname = req.body.deptshortname;
    var sql = `INSERT INTO Department (Dep_Name, Dep_ShortName, CreationDate) VALUES (
      "${deptname}", "${deptshortname}", curdate())`;
    db.query(sql, function (err, ans) {
      if (err) {
        throw err;
      }
      //alert = undefined;
      res.render('adminadddept', {
        adminname: req.session.result[0].name,
        message: 'Department Successfully Added',
        alert: undefined,
        exists: ''
      });
    });
  } catch (e) {
    console.log(e);
    res.redirect('/admin/login');
  }
}




const AddDepartment = (req, res) => {
  if (req.session.result) {
    const deptname = req.body.deptname;
    const deptshortname = req.body.deptshortname;
    console.log(deptname, deptshortname);
    let sql = `SELECT Dep_Name,Dep_ShortName FROM Department WHERE Dep_ShortName = '${deptshortname}'`;
    db.query(sql, function (err, result) {
      if (err) {
        throw err;
      }

      if (result.length > 0) {
        flag = 1;
        res.render('adminadddept', {
          adminname: req.session.result[0].name,
          message: '',
          exists: 'Department Short Name already exists',
          alert: undefined
        });
      } else {
        insertDept(req, res);
      }
    });
  }
}

const DeleteDepartment = (req, res) => {
  const deptid = req.params.id;
  let sql = `DELETE FROM Department WHERE Dep_ID = ${deptid}`;
  db.query(sql, function (err, deleteduser) {
    if (err) {
      throw err;
    }
    res.redirect("/admin/managedepartment");
  });
}


const RenderUpdateDepartment = (req, res) => {
  if (req.session.result) {
    const deptid = req.params.id;
    let sql = `SELECT * FROM Department WHERE Dep_ID = ${deptid}`;
    db.query(sql, (err, dept) => {
      if (err) {
        throw err;
      }
      res.render("admineditdept", {
        adminname: req.session.result[0].name,
        message: '',
        alert: undefined,
        exists: '',
        dept: dept
      });
    });
  } else {
    res.redirect('/admin/login');
  }
}

const UpdateDepartment = (req, res) => {
  if (req.session.result) {
    const deptid = req.params.id;
    const deptname = req.body.deptname;
    const deptshortname = req.body.deptshortname;
    let sql = `UPDATE Department SET Dep_Name = '${deptname}' , Dep_ShortName = '${deptshortname}' WHERE Dep_ID = ${deptid};`;
    db.query(sql, (err, ans) => {
      if (err) {
        let sql = `Select * from Department where Dep_ID = ${deptid};`
        db.query(sql,function(err,dept){
          res.render("admineditdept",{
            adminname: req.session.result[0].name,
            alert: undefined,
            message: '',
            exists: 'Department Already exists',
            dept:dept
          });
        });
        //throw err;
      }
      else{
        res.redirect("/admin/managedepartment");
      }      
    });
  } else {
    res.redirect('/admin/login');
  }
}


const RenderManageDesignation = (req, res) => {
  if (req.session.result) {
    let sql = `SELECT * FROM designation`;
    db.query(sql, function (err, designations) {
      if (err) {
        throw err;
      }
      designations.map((designation) => {
        let year = designation.CreationDate.toLocaleString("default", {
          year: "numeric"
        });
        let month = designation.CreationDate.toLocaleString("default", {
          month: "2-digit"
        });
        let day = designation.CreationDate.toLocaleString("default", {
          day: "2-digit"
        });
        var formattedDate = day + "-" + month + "-" + year;
        designation.CreationDate = formattedDate;

      })
      res.render("adminmanagedesig", {
        adminname: req.session.result[0].name,
        designations: designations
      });
    });
  } else {
    res.redirect('/admin/login');
  }
}


const RenderManageEmployee = (req,res) => {
  if (req.session.result) {
    let sql = `SELECT Emp_ID,concat(firstName,' ',lastName ) as name, Email,Gender,Age,Contact,UserName,Dep_ShortName,DesigName FROM employees`;
    db.query(sql, function (err, employees) {
      if (err) {
        throw err;
      }
      res.render("adminmanageemp", {
        adminname: req.session.result[0].name,
        employees: employees
      });
    });
  } else {
    res.redirect('/admin/login');
  }  

}



module.exports = {
  RenderLoginPage,
  LoginAdmin,
  RenderDashboard,
  LogoutAdmin,
  RenderAddUser,
  AddUser,
  RenderManageUser,
  RenderUpdateUser,
  UpdateUser,
  DeleteUser,
  RenderManageDepartment,
  RenderAddDepartment,
  AddDepartment,
  DeleteDepartment,
  RenderUpdateDepartment,
  UpdateDepartment,
  RenderManageDesignation,
  RenderManageEmployee
}