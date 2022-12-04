const bcrypt = require('bcrypt');
const db = require('../db');
const nodemailer = require('nodemailer');
const {
  validationResult
} = require('express-validator');
const {
  response
} = require('express');
const {
  options
} = require('../routes');
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "muhammadrafay249@gmail.com",
    pass: "gmqfanxmuhoqpeat"
  }
});


const RenderLoginPage = (req, res) => {
  res.render('../views/adminlogin', {
    alert: undefined,
    message: '',
    exists: ''
  });
}

const LoginAdmin = async (req, res, next) => {

  const pswd = req.body.pswd;
  const email = req.body.email;
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
    var sql = `SELECT name,email,password FROM users WHERE email = '${email}' AND role = 'admin'`;
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

  if (req.session.result) {
    console.log(req.session.result[0].name, req.session.result[0].password);
    var sql = `SELECT name,password FROM users WHERE name = '${req.session.result[0].name}' AND password = '${req.session.result[0].password}' AND role = 'admin'`;
    db.query(sql, async function (err, result) {
      if (err) {
        throw err;
      }
      console.log(result);
      let sql = `Select (select count(*) from users) as count_users, (select count(*) from Department) as count_depts, (select count(*) from designation) as count_desig , (select count(*) from flight) as flight_count , (select count(*) from airplane) as airplane_count , (select count(*) from employees) as emp_count;`;
      db.query(sql, async function (err, count) {
        if (err) {
          throw err;
        }
        console.log(count);
        res.render('admindashboard', {
          adminname: result[0].name,
          usercount: count[0].count_users,
          deptcount: count[0].count_depts,
          desigcount: count[0].count_desig,
          flightcount: count[0].flight_count,
          airplanecount: count[0].airplane_count,
          employeecount: count[0].emp_count
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
    var sql = `INSERT INTO users (name,role,password,email,timecreated) VALUES (
      "${name}", "admin", "${hashedpassword}", "${email}",now())`;
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
    let sql = `SELECT * FROM users where role = 'admin'`;
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
        db.query(sql, function (err, dept) {
          res.render("admineditdept", {
            adminname: req.session.result[0].name,
            alert: undefined,
            message: '',
            exists: 'Department Already exists',
            dept: dept
          });
        });
        //throw err;
      } else {
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

const RenderAddDesignation = (req, res) => {
  if (req.session.result) {
    let sql = 'SELECT Dep_ShortName from department;';
    db.query(sql, function (err, deptlist) {
      if (err) {
        throw err;
      } else {
        console.log(deptlist);
        res.render("adminadddesig", {
          adminname: req.session.result[0].name,
          alert: undefined,
          exists: '',
          message: '',
          deptlist: deptlist
        });
      }
    });
  } else {
    res.redirect('/admin/login');
  }
}

async function insertDesignation(req, res) {
  try {
    const desig_name = req.body.designame;
    const desig_desc = req.body.desigdesc;
    const dept_name = req.body.deptname;
    console.log(dept_name, desig_desc, dept_name);
    var sql = `INSERT INTO designation (DesigName, DesigDesc, CreationDate,Dep_ShortName) VALUES (
      "${desig_name}", "${desig_desc}", curdate(),'${dept_name}')`;
    db.query(sql, function (err, ans) {
      if (err) {
        throw err;
      }
      //alert = undefined;
      sql = `select Dep_ShortName from department;`;
      db.query(sql, function (err, deptlist) {
        res.render('adminadddesig', {
          adminname: req.session.result[0].name,
          message: 'Designation Successfully Added',
          alert: undefined,
          exists: '',
          deptlist: deptlist
        });
      })
    });
  } catch (e) {
    console.log(e);
    res.redirect('/admin/login');
  }
}

const AddDesignation = (req, res) => {
  if (req.session.result) {
    const desig_name = req.body.designame;
    const desig_desc = req.body.desigdesc;
    //console.log(deptname, deptshortname);
    let sql = `SELECT DesigName,DesigDesc FROM designation WHERE DesigName = '${desig_name}' or DesigDesc = '${desig_desc}'`;
    db.query(sql, function (err, result) {
      if (err) {
        throw err;
      }
      if (result.length > 0) {
        flag = 1;
        let sql = `Select Dep_ShortName from department;`
        db.query(sql, function (err, deptlist) {
          if (err) {
            throw err;
          }
          res.render('adminadddesig', {
            adminname: req.session.result[0].name,
            message: '',
            exists: 'Designation already exists',
            alert: undefined,
            deptlist: deptlist
          });
        })

      } else {
        insertDesignation(req, res);
      }
    });
  }
}

const DeleteDesignation = (req, res) => {
  if (req.session.result) {
    const desigid = req.params.id;
    let sql = `DELETE FROM designation WHERE desig_ID = ${desigid}`;
    db.query(sql, function (err, deleteduser) {
      if (err) {
        throw err;
      }
      res.redirect("/admin/managedesignation");
    });
  } else {
    res.render("/admin/login");
  }
}

const RenderUpdateDesignation = (req, res) => {
  if (req.session.result) {
    const desigid = req.params.id;
    let sql = `SELECT * FROM designation WHERE Desig_ID = ${desigid}`;
    db.query(sql, (err, desig) => {
      if (err) {
        throw err;
      }
      sql = `SELECT Dep_ShortName FROM department;`
      db.query(sql, function (err, deptlist) {
        if (err) {
          throw err;
        }
        console.log(desig, deptlist);
        res.render("admineditdesig", {
          adminname: req.session.result[0].name,
          message: '',
          alert: undefined,
          exists: '',
          desig: desig,
          deptlist: deptlist
        });
      })
    });
  } else {
    res.redirect('/admin/login');
  }
}

const UpdateDesignation = (req, res) => {
  if (req.session.result) {
    const desigid = req.params.id;
    const designame = req.body.designame;
    const desigdesc = req.body.desigdesc;
    const deptname = req.body.deptname;
    let sql = `UPDATE designation SET DesigName = '${designame}' , DesigDesc = '${desigdesc}' , Dep_ShortName = '${deptname}' WHERE Desig_ID = ${desigid};`;
    db.query(sql, (err, ans) => {
      if (err) {
        let sql = `Select * from Department;`
        db.query(sql, function (err, deptlist) {
          sql = `Select * from designation where Desig_ID = ${desigid};`
          db.query(sql, function (err, desig) {
            res.render("admineditdesig", {
              adminname: req.session.result[0].name,
              alert: undefined,
              message: '',
              exists: 'Designation Desc or Designation Name Already exists',
              deptlist: deptlist,
              desig: desig
            });
          })

        });
        //throw err;
      } else {
        res.redirect("/admin/managedesignation");
      }
    });
  } else {
    res.redirect('/admin/login');
  }
}

const RenderManageEmployee = (req, res) => {
  if (req.session.result) {
    let sql = `SELECT Emp_ID,concat(firstName,' ',lastName ) as name, Email,Gender,Age,Contact,Dep_ShortName,DesigName FROM employees`;
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

const RenderAddEmployee = (req, res) => {
  if (req.session.result) {
    let sql = `select desigName from designation;`;
    db.query(sql, function (err, desiglist) {
      let sql = `select Dep_ShortName from department;`;
      db.query(sql, function (err, deptlist) {
        res.render("adminaddemp", {
          adminname: req.session.result[0].name,
          message: '',
          alert: undefined,
          exists: '',
          deptlist: deptlist,
          desiglist: desiglist
        });
      })
    })
  } else {
    res.redirect("/admin/login");
  }
}

const AddEmployee = (req, res) => {
  if (req.session.result) {
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const email = req.body.email;
    const contact = req.body.contactnumber;
    const gender = req.body.gender;
    const age = req.body.age;
    const deptname = req.body.deptname;
    const designame = req.body.designame;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      alert = errors.array();
      let sql = `select desigName from designation;`;
      db.query(sql, function (err, desiglist) {
        let sql = `select Dep_ShortName from department;`;
        db.query(sql, function (err, deptlist) {
          console.log(deptlist, desiglist);
          res.render("adminaddemp", {
            adminname: req.session.result[0].name,
            message: '',
            alert: alert,
            exists: '',
            deptlist: deptlist,
            desiglist: desiglist
          });
        });
      });
    } else {
      let sql = `SELECT Email,Contact FROM employees WHERE Email = '${email}' or Contact = '${contact}'`;
      db.query(sql, function (err, result) {
        if (err) {
          throw err;
        }

        if (result.length > 0) {
          flag = 1;
          let sql = `select desigName from designation;`;
          db.query(sql, function (err, desiglist) {
            let sql = `select Dep_ShortName from department;`;
            db.query(sql, function (err, deptlist) {
              console.log(deptlist, desiglist);
              res.render("adminaddemp", {
                adminname: req.session.result[0].name,
                message: '',
                alert: undefined,
                exists: 'Email or Contact Already in Use',
                deptlist: deptlist,
                desiglist: desiglist
              });
            });
          });
        } else {
          insertEmployee(req, res);
        }
      });

    }
  } else {
    res.redirect("/admin/login");
  }
}

const insertEmployee = async (req, res) => {
  try {
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const email = req.body.email;
    const contact = req.body.contactnumber;
    const gender = req.body.gender;
    const age = req.body.age;
    const deptname = req.body.deptname;
    const designame = req.body.designame;
    var sql = `INSERT INTO employees (firstname,lastname,email,gender,age,contact,Dep_ShortName,designame) VALUES (
      "${firstname}", "${lastname}", "${email}", "${gender}",${age},"${contact}","${deptname}","${designame}")`;
    db.query(sql, function (err, result) {
      if (err) {
        throw err;
      } else {
        let sql = `select desigName from designation;`;
        db.query(sql, function (err, desiglist) {
          let sql = `select Dep_ShortName from department;`;
          db.query(sql, function (err, deptlist) {
            console.log(deptlist, desiglist);
            res.render("adminaddemp", {
              adminname: req.session.result[0].name,
              message: 'Employee Successfully Added',
              alert: undefined,
              exists: '',
              deptlist: deptlist,
              desiglist: desiglist
            });
          });
        });
      }
    });
  } catch (e) {
    console.log(e);
    res.redirect('/admin/login');
  }

}

const DeleteEmployee = (req, res) => {
  const empid = req.params.id;
  let sql = `DELETE FROM employees WHERE Emp_ID = ${empid}`;
  db.query(sql, function (err, deleteduser) {
    if (err) {
      throw err;
    }
    res.redirect("/admin/manageemployee");
  });
}

const RenderUpdateEmployee = (req, res) => {
  if (req.session.result) {
    const empid = req.params.id;
    let sql = `SELECT * FROM employees WHERE Emp_ID = ${empid}`;
    db.query(sql, (err, empdetail) => {
      if (err) {
        throw err;
      }
      sql = `SELECT Dep_ShortName FROM department;`
      db.query(sql, function (err, deptlist) {
        if (err) {
          throw err;
        } else {
          sql = `SELECT DesigName FROM designation;`
          db.query(sql, function (err, desiglist) {
            console.log(desiglist, empdetail, deptlist);
            res.render("admineditemp", {
              adminname: req.session.result[0].name,
              message: '',
              alert: undefined,
              exists: '',
              desiglist: desiglist,
              deptlist: deptlist,
              empdetail: empdetail
            });
          })
        }
      })
    });
  } else {
    res.redirect('/admin/login');
  }
}

const UpdateEmployee = (req, res) => {
  if (req.session.result) {
    const empid = req.params.id;
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const email = req.body.email;
    const contact = req.body.contactnumber;
    const gender = req.body.gender;
    const age = req.body.age;
    const deptname = req.body.deptname;
    const designame = req.body.designame;
    let sql = `Update employees set firstName = '${firstname}', lastName = '${lastname}',Email = '${email}',Gender = '${gender}',Age = ${age},Contact = '${contact}',Dep_ShortName = '${deptname}', designame = '${designame}' WHERE Emp_ID = ${empid};`;
    db.query(sql, (err, ans) => {
      if (err) {
        let sql = `Select Dep_ShortName from Department;`
        db.query(sql, function (err, deptlist) {
          let sql = `Select DesigName from Designation;`
          db.query(sql, function (err, desiglist) {
            let sql = `Select * from employees;`
            db.query(sql, function (err, empdetail) {
              res.render("admineditemp", {
                adminname: req.session.result[0].name,
                alert: undefined,
                message: '',
                exists: 'Email or Contact Already exists',
                deptlist: deptlist,
                desiglist: desiglist,
                empdetail: empdetail
              });
            });
          })
        });
      } else {
        res.redirect("/admin/manageemployee");
      }
    });
  } else {
    res.redirect('/admin/login');
  }
}

const RenderManageFlight = (req, res) => {
  if (req.session.result) {
    let sql = `SELECT * FROM flight f,flightschedule fs where fs.flightno = f.flightno`;
    db.query(sql, function (err, flights) {
      if (err) {
        throw err;
      }
      flights.map((flight) => {
        let year = flight.departuredate.toLocaleString("default", {
          year: "numeric"
        });
        let month = flight.departuredate.toLocaleString("default", {
          month: "2-digit"
        });
        let day = flight.departuredate.toLocaleString("default", {
          day: "2-digit"
        });
        var formattedDate = day + "-" + month + "-" + year;
        flight.departuredate = formattedDate;
        year = flight.arrivaldate.toLocaleString("default", {
          year: "numeric"
        });
        month = flight.arrivaldate.toLocaleString("default", {
          month: "2-digit"
        });
        day = flight.arrivaldate.toLocaleString("default", {
          day: "2-digit"
        });
        var formattedDate = day + "-" + month + "-" + year;
        flight.arrivaldate = formattedDate;

      })
      console.log(flights);
      res.render("adminmanageflight", {
        adminname: req.session.result[0].name,
        flights: flights
      });
    });
  } else {
    res.redirect("/admin/login");
  }
}

const AddFlightSchedule = (req, res) => {
  if (req.session.result) {
    let arrloc = req.body.arrloc;
    let deploc = req.body.deploc;
    let arrtime = req.body.arrtime;
    let deptime = req.body.deptime;
    let monday = req.body.monday;
    let tuesday = req.body.tuesday;
    let wednesday = req.body.wednesday;
    let thursday = req.body.thursday;
    let friday = req.body.friday;
    let saturday = req.body.saturday;
    let sunday = req.body.sunday;
    let days = [monday, tuesday, wednesday, thursday, friday, saturday, sunday];
    console.log(arrloc, deploc, arrtime, deptime);
    for (let i = 0; i < days.length; i++) {
      if (days[i] === undefined) {
        days[i] = 0
      } else {
        days[i] = 1;
      }
    }
    console.log(days.every(day => day === 0));
    if (days.every(day => day === 0)) {
      res.render("adminaddflightschedule", {
        adminname: req.session.result[0].name,
        message: '',
        alert: undefined,
        exists: 'Days must be entered'
      });
    } else if (arrloc === '' || deploc === '') {
      res.render("adminaddflightschedule", {
        adminname: req.session.result[0].name,
        message: '',
        alert: undefined,
        exists: 'All fields must be filled'
      });
    } else if (arrtime >= deptime) {
      res.render("adminaddflightschedule", {
        adminname: req.session.result[0].name,
        message: '',
        alert: undefined,
        exists: 'Arrival Time cant be greater than Departure Time'
      });
    } else {
      let sql = `insert into flightschedule (arrloc,deploc,departure,arrival,monday,tuesday,wednesday,thursday,friday,saturday,sunday) values ("${arrloc}","${deploc}","${arrtime}","${deptime}",${days[0]},${days[1]},${days[2]},${days[3]},${days[4]},${days[5]},${days[6]});`;
      db.query(sql, function (err, new_flight) {
        if (err) {
          throw err;
        } else {
          res.render("adminaddflightschedule", {
            adminname: req.session.result[0].name,
            message: 'New Flight Schedule Successfully Added',
            alert: undefined,
            exists: ''
          });
        }

      })
    }
  } else {
    res.redirect("/admin/login");
  }

}

const RenderManageAirplane = (req, res) => {
  if (req.session.result) {
    let sql = `SELECT * FROM airplane`;
    db.query(sql, function (err, airplanes) {
      if (err) {
        throw err;
      }
      //console.log(users[0].userid);
      res.render("adminmanageairplane", {
        adminname: req.session.result[0].name,
        airplanes: airplanes
      });
    });
  } else {
    res.redirect("/admin/login");
  }
}

const RenderAddFlightSchedule = (req, res) => {
  if (req.session.result) {
    res.render("adminaddflightschedule", {
      adminname: req.session.result[0].name,
      alert: undefined,
      message: '',
      exists: ''
    });
  } else {
    res.redirect("/admin/login");
  }
}

const RenderAddFlight = (req, res) => {
  if (req.session.result) {
    let sql = `select flightno from flightschedule;`;
    db.query(sql, function (err, flightnolist) {
      let sql = `select airplane_id from airplane;`;
      db.query(sql, function (err, airplaneidlist) {
        console.log(flightnolist, airplaneidlist);
        res.render("adminaddflight", {

          adminname: req.session.result[0].name,
          message: '',
          alert: undefined,
          exists: '',
          flightnolist: flightnolist,
          airplaneidlist: airplaneidlist
        });
      })
    })

  } else {
    res.redirect("/admin/login");
  }
}

const AddFlight = (req, res) => {
  const flightno = req.body.flightno;
  const departure = req.body.depdate;
  const arrival = req.body.arrdate;
  const airplane_id = req.body.airplaneid;
  const price = req.body.price;
  if (req.session.result) {
    if (departure > arrival) {
      let sql = `select flightno from flightschedule;`;
      db.query(sql, function (err, flightnolist) {
        let sql = `select airplane_id from airplane;`;
        db.query(sql, function (err, airplaneidlist) {
          res.render("adminaddflight", {
            adminname: req.session.result[0].name,
            message: '',
            alert: undefined,
            exists: 'Enter proper arrival and departure dates',
            flightnolist: flightnolist,
            airplaneidlist: airplaneidlist
          });
        })
      })
    } else {
      let sql = `insert into flight (flightno,departuredate,arrivaldate,airplane_id , price) values ('${flightno}','${departure}','${arrival}','${airplane_id}',${price});`;
      db.query(sql, function (err, success) {
        if (err) {
          throw err;
        } else {
          let sql = `select flightno from flightschedule;`;
          db.query(sql, function (err, flightnolist) {
            let sql = `select airplane_id from airplane;`;
            db.query(sql, function (err, airplaneidlist) {
              res.render("adminaddflight", {
                adminname: req.session.result[0].name,
                message: 'Flight Successfull Added',
                alert: undefined,
                exists: '',
                flightnolist: flightnolist,
                airplaneidlist: airplaneidlist
              });
            })
          })
        }
      })
    }
  } else {
    res.redirect("/admin/login");
  }
}

const RenderUpdateFlightSchedule = (req, res) => {
  if (req.session.result) {
    const flightid = req.params.id;
    let sql = `select flight_id,arrloc,deploc,departure,arrival,airplane_id from flightschedule fs,flight f
    where flight_id = '${flightid}' and 
    f.flightno = fs.flightno;`;
    db.query(sql, (err, flightscheduledetails) => {
      if (err) {
        throw err;
      } else {
        console.log(flightscheduledetails);
        res.render("admineditflight", {
          adminname: req.session.result[0].name,
          message: '',
          alert: undefined,
          exists: '',
          flightscheduledetails: flightscheduledetails
        });
      }
    });
  } else {
    res.redirect('/admin/login');
  }
}

const UpdateFlightSchedule = (req, res) => {
  if (req.session.result) {
    const flightid = req.params.id;
    const departuretime = req.body.departuretime;
    const arrivaltime = req.body.arrivaltime;
    let sql = `UPDATE flight f, flightschedule fs SET departure = '${departuretime}',arrival = '${arrivaltime}' where flight_id = '${flightid}' and fs.flightno = f.flightno`;
    db.query(sql, (err, user) => {
      if (err) {
        throw err;
      } else {
        let sql = `select email,concat(lname,' ',fname) as "fullname" from users,passengers,bookings,flightschedule,flight
          where flight_id = '${flightid}'
          and users.userid = passengers.userid
          and passengers.passportno = bookings.psngrid
          and flightschedule.flightno = flight.flightno
          and bookings.flightid = flight.flight_id;`;
        db.query(sql, (err, emails) => {
          if (err) {
            throw err;
          } else {
            for (const [key, email] of Object.entries(emails)) {
              const option = {
                from: "muhammadrafay249@gmail.com",
                to: `${email.email}`,
                subject: "apki flight delay hai",
                text: `Hello, ${email.fullname} your flight, flight_ID ${flightid} has been delayed and new time is 
                  New Departure Time: ${departuretime} PST 
                  New Arrival Time: ${arrivaltime} PST
                  Sorry for inconvenience 
                  Regards: ${req.session.result[0].name}`
              };
              transporter.sendMail(option, function (err, info) {
                if (err) {
                  console.log(err);
                } else {
                  console.log("Sent: ", info.response);
                }
              })
            }
            let sql = `SELECT * FROM flight f,flightschedule fs where fs.flightno = f.flightno`;
            db.query(sql, function (err, flights) {
              if (err) {
                throw err;
              }
              flights.map((flight) => {
                let year = flight.departuredate.toLocaleString("default", {
                  year: "numeric"
                });
                let month = flight.departuredate.toLocaleString("default", {
                  month: "2-digit"
                });
                let day = flight.departuredate.toLocaleString("default", {
                  day: "2-digit"
                });
                var formattedDate = day + "-" + month + "-" + year;
                flight.departuredate = formattedDate;
                year = flight.arrivaldate.toLocaleString("default", {
                  year: "numeric"
                });
                month = flight.arrivaldate.toLocaleString("default", {
                  month: "2-digit"
                });
                day = flight.arrivaldate.toLocaleString("default", {
                  day: "2-digit"
                });
                var formattedDate = day + "-" + month + "-" + year;
                flight.arrivaldate = formattedDate;

              })
              console.log(flights);
              res.redirect('/admin/manageflight');
              // res.render("adminmanageflight", {
              //   adminname: req.session.result[0].name,
              //   flights: flights
              // });
            });
          }
        })
      }
    })
  } else {
    req.redirect("/admin/login");
  }
}

const RenderAddAirplane = (req, res) => {
  if (req.session.result) {
    res.render("adminaddairplane", {
      adminname: req.session.result[0].name,
      alert: undefined,
      message: '',
      exists: ''
    });
  } else {
    res.redirect('/admin/login');

  }
}

const AddAirplane = (req, res) => {
  if (req.session.result) {
    const capacity = req.body.airplanecapacity;
    const type = req.body.airplanetype;
    let sql = `insert into airplane (capacity,type_id) values (${capacity},'${type}');`;
    db.query(sql, function (err, ans) {
      if (err) {
        throw err;
      } else {
        res.render("adminaddairplane", {
          adminname: req.session.result[0].name,
          alert: undefined,
          message: 'Airplane Successfully Added',
          exists: ''
        });
      }
    });
  } else {
    res.redirect('/admin/login');
  }
}


const RenderViewPassengers = (req, res) => {
  if (req.session.result) {
    let sql = `select p.userid,passportno,concat(fname,' ',lname) as "fullname" ,email from passengers p ,users u where p.userid = u.userid;`;
    db.query(sql, function (err, passengers) {
      if (err) {
        throw err;
      }
      console.log(passengers);
      res.render("adminmanagepassengers", {
        adminname: req.session.result[0].name,
        passengers: passengers
      });
    });
  } else {
    res.redirect("/admin/login");
  }
}


const RenderViewReport = (req,res) => {

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
  RenderAddDesignation,
  AddDesignation,
  RenderUpdateDesignation,
  UpdateDesignation,
  DeleteDesignation,
  RenderManageEmployee,
  RenderAddEmployee,
  AddEmployee,
  DeleteEmployee,
  RenderUpdateEmployee,
  UpdateEmployee,
  RenderManageFlight,
  RenderAddFlightSchedule,
  AddFlightSchedule,
  RenderUpdateFlightSchedule,
  UpdateFlightSchedule,
  RenderAddFlight,
  AddFlight,
  RenderManageAirplane,
  RenderAddAirplane,
  AddAirplane,
  RenderViewPassengers,
  RenderViewReport
}