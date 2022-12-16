//const { request, response } = require('express');
var express = require('express');

var router = express.Router();
var database = require('../db');
var countries = require("i18n-iso-countries");

const {RenderLoginPage,LoginAdmin,RenderDashboard,LogoutAdmin,RenderAddUser,AddUser,RenderManageUser,RenderUpdateUser
    ,UpdateUser,DeleteUser,RenderManageDepartment,RenderAddDepartment,AddDepartment,DeleteDepartment,RenderUpdateDepartment,
    UpdateDepartment,RenderManageDesignation,RenderAddDesignation,AddDesignation,RenderUpdateDesignation,UpdateDesignation,
    DeleteDesignation,RenderManageEmployee,RenderAddEmployee,AddEmployee,DeleteEmployee,RenderViewPassengers,RenderManageFlight,
    AddFlightSchedule,RenderAddFlightSchedule,RenderUpdateFlightSchedule,UpdateFlightSchedule,RenderAddFlight,AddFlight,RenderManageAirplane,
    RenderAddAirplane,AddAirplane, RenderUpdateEmployee, UpdateEmployee,RenderViewReview} = require("../controller/admincontroller");
const { body } = require('express-validator');
const validator = require('../validator/validations');
const { route } = require('.');


//login routes
router.get("/login",RenderLoginPage);
router.post("/login",validator.LoginAdmin,LoginAdmin);

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
router.get("/adddesignation",RenderAddDesignation);
router.post("/adddesignation",AddDesignation);
router.get("/editdesignation/:id",RenderUpdateDesignation);
router.post("/editdesignation/:id",UpdateDesignation);
router.get("/deletedesignation/:id",DeleteDesignation);


//crud employee routes
router.get("/manageemployee",RenderManageEmployee);
router.get("/addemployee",RenderAddEmployee);
router.post("/addemployee",validator.AddEmployee,AddEmployee);
router.get("/deleteemployee/:id",DeleteEmployee);
router.get("/editemployee/:id",RenderUpdateEmployee);
router.post("/editemployee/:id",validator.AddEmployee,UpdateEmployee);

//crud flight routes
router.get("/manageflight",RenderManageFlight);
router.get("/addflightschedule",RenderAddFlightSchedule);
router.post("/addflightschedule",AddFlightSchedule);
router.get("/addflight",RenderAddFlight);
router.post("/addflight",AddFlight);
router.get("/editflightschedule/:id",RenderUpdateFlightSchedule);
router.post("/editflightschedule/:id",UpdateFlightSchedule)

//crud airplane routes
router.get("/manageairplane",RenderManageAirplane);
router.get("/addairplane",RenderAddAirplane);
router.post("/addairplane",AddAirplane);


router.get("/viewpassengers",RenderViewPassengers);



router.get("/viewreview",RenderViewReview);

//logout route
router.get("/logout",LogoutAdmin);



module.exports = router;
