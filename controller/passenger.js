const { response } = require("express");
const session = require("express-session");

const renderhomepage = (request, response, next)=>{
    response.render('home',{issession:"false",username:""});
  };

  
module.exports= {renderhomepage};