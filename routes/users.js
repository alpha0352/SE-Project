//const { request, response } = require('express');
var express = require('express');

var router = express.Router();

var database = require('../db');

var countries = require("i18n-iso-countries");

const {renderhomepage} = require("../controller/passenger");
const { body } = require('express-validator');

router.get("/", function(request, response, next){

	var query = "SELECT * FROM flight";

	database.query(query, function(error, data){

		if(error)
		{
			throw error; 
		}
		else
		{
			response.render('list', {title:'AIRPLANES LIST', action:'list', sampleData:data});
		}

	});

});

router.get("/home", renderhomepage);

// router.get("/searchflight", function(request, response, next){

// 	var query = "SELECT * FROM flight";

// 	database.query(query, function(error, data){

// 		if(error)
// 		{
// 			throw error; 
// 		}
// 		else
// 		{
// 			response.render('list', {title:'AIRPLANES LIST', action:'list', sampleData:data});
// 		}

// 	});

// });

var srchfltdetails = [];
/*
0 = origin
1 = destination
2 = depart date
3 = return date
4 = no. of passengers
*/

var bookdet = [];

router.post("/searchflight",function(req,response)
{
  
  srchfltdetails[0] = req.body.origin;
  srchfltdetails[1] = req.body.destination;
  srchfltdetails[2] = req.body.depart;
  srchfltdetails[3] = req.body.return;
  srchfltdetails[4] = req.body.passengers;

  var query = `SELECT flight_id,departLoc,arrloc,date_format(departure,"%W, %d %M %Y") as departure,date_format(arrival,"%W, %d %M %Y") as arrival from flight where 
                departloc= "${srchfltdetails[0]}" and 
                arrloc = "${srchfltdetails[1]}" and 
                ( departure >= DATE_ADD('${srchfltdetails[2]}',INTERVAL -1 DAY) or
                departure <= date_add('${srchfltdetails[2]}',INTERVAL +1 DAY))`;

  database.query(query,function(error, data)
  {
     if(error)
    {
      throw error; 
    }
    else
    {
      //console.log(data[1]);
      response.render('list', {title:'OUT-BOUND FLIGHTS', action:'listoutbound', sampleData:data});
    }
  })
})

router.get("/inbound",function(req,response){
  console.log(srchfltdetails);
  var query = `SELECT flight_id,departLoc,arrloc,date_format(departure,"%W, %d %M %Y") as departure,date_format(arrival,"%W, %d %M %Y") as arrival from flight where 
                departloc= "${srchfltdetails[1]}" and 
                arrloc = "${srchfltdetails[0]}" and 
                ( arrival >= DATE_ADD('${srchfltdetails[3]}',INTERVAL -1 DAY) or
                arrival <= date_add('${srchfltdetails[3]}',INTERVAL +1 DAY))`;
  
database.query(query,function(error, data)
{
   if(error)
  {
    throw error; 
  }
  else
  {
    //console.log(data[1]);
    response.render('list', {title:'IN-BOUND FLIGHTS', action:'listinbound', sampleData:data});
  }
})

})

router.get("/outbound/:flight_id/:departure",function(req,response,next)
{
  bookdet.push([req.params.flight_id,req.params.departure]);
  console.log(bookdet);
  response.redirect('/users/inbound');
})

router.get("/inbound/:flight_id/:departure",function(req,response,next)
{
  bookdet.push([req.params.flight_id,req.params.departure]);
  console.log(bookdet);
  response.redirect('/users/passengerdetails');
  /*redirect the user to a passenger page where enters details of number of passengers
  save booking in database*/
})

router.get("/passengerdetails",function(req,response,next){
  console.log(bookdet[0][0],bookdet[1][0]);
  response.render('passengerdetails',{passnum:srchfltdetails[4]});
})

router.post("/passengerdetails/detinputs",function(req,res,next){

if(srchfltdetails[4]==1)
{
  var query = `INSERT INTO passengers values(
    "${req.body.fname}",
    "${req.body.lname}",
    DATE_FORMAT(FROM_DAYS(DATEDIFF(NOW(),'${req.body.dob}')), '%Y') + 0,
    concat("${req.body.citizen}","${req.body.pasprtno}"))`; 
    database.query(query,function(error, data)
    {
      if(error)
      {
        //console.log(i);
        throw error; 
      }
      else
      {
        var bookquery = `INSERT INTO bookings values(
          concat(SUBSTR("${req.body.pasprtno}",1,7),date_format(NOW(),'%d%m%y')),
          concat("${req.body.citizen}","${req.body.pasprtno}"),
          "${bookdet[0][0]}",
          "XX",
          "${req.body.class}",
          "999"
        )`; //999 to be edited by price in bookdet array
      
        database.query(bookquery,function(error, data)
        {
          if(error)
          {
            console.log(i);
            throw error; 
          }
        })
    
      }
    })
} 
else{

  for(var i=0;i<srchfltdetails[4];i++)
  {
    var query = `INSERT INTO passengers values(
      "${req.body.fname[i]}",
      "${req.body.lname[i]}",
      DATE_FORMAT(FROM_DAYS(DATEDIFF(NOW(),'${req.body.dob[i]}')), '%Y') + 0,
      concat("${req.body.citizen[i]}","${req.body.pasprtno[i]}"))`; 
      database.query(query,function(error, data)
      {
        if(error)
        {
          console.log(i);
          throw error; 
        }
      })

      var bookquery = `INSERT INTO bookings values(
        concat(SUBSTR("${req.body.pasprtno[i]}",1,7),date_format(NOW(),'%d%m%y')),
        concat("${req.body.citizen[i]}","${req.body.pasprtno[i]}"),
        "${bookdet[0][0]}","XX","${req.body.class[i]}",
        "999"
      )`; //999 to be edited by price in bookdet array
    
        database.query(bookquery,function(error, data)
        {
          if(error)
          {
            console.log(i);
            throw error; 
          }
        })


  }
}

})

router.get("/passengerdetails/selectseat",function(req,res,next){
  res.render('seatresrv');
})




module.exports = router;
