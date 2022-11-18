//const { request, response } = require('express');
var express = require('express');

var router = express.Router();

var database = require('../db');

var countries = require("i18n-iso-countries");

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

router.get("/home", function(request, response, next){
  response.render('home');
});


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
module.exports = router;

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
  response.render('passengerdetails',{passnum:srchfltdetails[4]});
})

router.post("/passengerdetails/detinputs",function(req,res,next){
//  console.log(req.body.fname[0]);
//  console.log(req.body.lname[0]);
//  console.log(req.body.dob[0]);
//  console.log(req.body.pasprtno[0]);
  for(var i=0;i<srchfltdetails[4];i++){
    //  console.log(req.body.fname[i]);
    //  console.log(req.body.citizen[i]);
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
        else
        {
          res.write("BOOKING SUCCESSFUL");//redirect to show my bookings
        }
      })
  }
})
