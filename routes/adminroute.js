//const { request, response } = require('express');
var express = require('express');

var router = express.Router();
var database = require('../db');
var countries = require("i18n-iso-countries");

const {RenderLoginPage,LoginAdmin,RenderDashboard,LogoutAdmin,RenderAddUser,AddUser,RenderManageUser,RenderUpdateUser,UpdateUser,DeleteUser,RenderManageDepartment,RenderAddDepartment,AddDepartment,DeleteDepartment,RenderUpdateDepartment,UpdateDepartment,RenderManageDesignation,RenderManageEmployee} = require("../controller/admincontroller");
const { body } = require('express-validator');
const validator = require('../validator/validations')


//login routes
router.get("/login",RenderLoginPage);
router.post("/login",validator.LoginUser,LoginAdmin);

//dashboard route
router.get("/dashboard",RenderDashboard);

//crud users routes
router.get("/adduser",RenderAddUser);
router.post("/adduser",validator.RegisterUser,AddUser);
router.get("/manageuser",RenderManageUser);
router.get("/edituser/:id",RenderUpdateUser);
router.post("/edituser/:id",UpdateUser);
router.get("/deleteuser/:id",DeleteUser);

//crud dept routes
router.get("/adddepartment",RenderAddDepartment);
router.post("/adddepartment",validator.RegisterUser,AddDepartment);
router.get("/managedepartment",RenderManageDepartment);
router.get("/editdepartment/:id",RenderUpdateDepartment);
router.post("/editdepartment/:id",UpdateDepartment);
router.get("/deletedepartment/:id",DeleteDepartment);


//crud designation routes
router.get("/managedesignation",RenderManageDesignation);



//crud employee routes
router.get("/manageemployee",RenderManageEmployee);


//logout route
router.get("/logout",LogoutAdmin);



module.exports = router;
