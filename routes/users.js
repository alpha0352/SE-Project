var express = require('express');
var router = express.Router();
var database = require('../db');
var airports = require('airport-codes');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({
  extended: false
});
const StringDecoder = require('string_decoder').StringDecoder;
const validator = require('../validator/validations');
const {
  body,
  validationResult
} = require('express-validator');
const {
  decode
} = require('punycode');
const e = require('express');
const {
  query
} = require('express');
const {
  setFips
} = require('crypto');
const {
  compareSync
} = require('bcrypt');
const {
  stringify
} = require('querystring');
const stripe = require('stripe')('sk_test_51MAZtVGgRGQoAKf2FkYI1C3Jk4gxyL31X6jto0vIWdF5GjPledu0MahfVcT4jgTYKUrN46BHBRHJGLu0cQas7yAc00opsPMOST');
const passenger = require("../controller/passenger");
const signin = require("../controller/userlogincontroller");
const signup = require("../controller/userregistercontroller");
// const {renderhomepage} = require("../controller/passenger");

const bucket = new Map([

  [301, {
    price: 2300000,
    ticket: "EK306  Skardu-Lahore"
  }],
  [302, {
    price: 2300000,
    ticket: "EK304 Lahore-Karachi"
  }],
  [303, {
    price: 2300000,
    ticket: "EK307 Karachi-Lahore"
  }]
]);

function generatebillid(id) {
  var currentdate = new Date();
  var uid = id.substring(4, 7) +
    currentdate.getDate() +
    (currentdate.getMonth() + 1) +
    currentdate.getFullYear().toString().substring(2, 4) +
    currentdate.getHours() +
    currentdate.getMinutes() +
    currentdate.getSeconds();
  return uid;
  // return Math.floor(Math.random() * 899999 + 100000)
}

router.get('/signout', function (req, res) {
  if (req.session.result) {
    req.session.destroy();
  }
  res.redirect("/users/home");
})

router.get('/signup', signup.RenderRegisterPage);
router.post('/signup', urlencodedParser, validator.RegisterUser, signup.RegisterUser);

router.get('/signin', signin.RenderLoginPage);
router.post('/signin', urlencodedParser, validator.LoginUser, signin.LoginUser);

router.get("/home", passenger.renderhomepage);
router.get('/signout', signin.logoutuser);

var srchfltdetails = [];
/*
0 = origin
1 = destination
2 = depart date
3 = return date
4 = no. of passengers
5 = trip type
*/

var bookdet = []; //saves booked flight 0=flightid, 1 = departure 

router.post("/searchflight", function (req, response) //outbound
  {

    srchfltdetails[0] = req.body.origin;
    srchfltdetails[1] = req.body.destination;
    srchfltdetails[2] = req.body.depart;
    srchfltdetails[3] = req.body.return;
    srchfltdetails[4] = req.body.passengers;
    srchfltdetails[5] = req.body.triptype;

    console.log(srchfltdetails);

    var query = `SELECT flight_id,deploc,arrloc,departure,arrival,departuredate,timediff(arrival,departure) as "tdif",price 
              from flightschedule fs INNER JOIN flight f ON
              fs.flightno = f.flightno  where 
              deploc= "${srchfltdetails[0]}" and 
              arrloc = "${srchfltdetails[1]}" and 
              ( departuredate >= DATE_ADD('${srchfltdetails[2]}',INTERVAL -1 DAY) or
                departuredate <= date_add('${srchfltdetails[2]}',INTERVAL +1 DAY))`;
    database.query(query, function (error, data) {
      if (error) {
        throw error;
      } else {
        if (req.session.result) {
          response.render('list', {
            title: 'OUT-BOUND FLIGHTS',
            action: 'listoutbound',
            sampleData: data,
            depIATA: airports.findWhere({
              city: srchfltdetails[0]
            }).get('iata'),
            arrIATA: airports.findWhere({
              city: srchfltdetails[1]
            }).get('iata'),
            username: req.session.result[0].name,
            issession: 'true'
          });
        } else {
          response.render('list', {
            title: 'OUT-BOUND FLIGHTS',
            action: 'listoutbound',
            sampleData: data,
            depIATA: airports.findWhere({
              city: srchfltdetails[0]
            }).get('iata'),
            arrIATA: airports.findWhere({
              city: srchfltdetails[1]
            }).get('iata'),
            username: '',
            issession: 'false'
          });
        }

      }
    })
  })

router.get("/inbound", function (req, response) {
  console.log(srchfltdetails[1]);
  var query = `SELECT flight_id,deploc,arrloc,departure,arrival,departuredate,timediff(arrival,departure) as "tdif",price 
  from flightschedule fs INNER JOIN flight f ON
  fs.flightno = f.flightno  where 
  deploc= "${srchfltdetails[1]}" and 
  arrloc = "${srchfltdetails[0]}" and 
  ( departuredate >= DATE_ADD('${srchfltdetails[2]}',INTERVAL -1 DAY) or
    departuredate <= date_add('${srchfltdetails[2]}',INTERVAL +1 DAY))`;
  database.query(query, function (error, data) {
    if (error) {
      throw error;
    } else {
      if (req.session.result) {
        response.render('list', {
          title: 'IN-BOUND FLIGHTS',
          action: 'listinbound',
          sampleData: data,
          depIATA: airports.findWhere({
            city: srchfltdetails[1]
          }).get('iata'),
          arrIATA: airports.findWhere({
            city: srchfltdetails[0]
          }).get('iata'),
          username: req.session.result[0].name,
          issession: 'true'
        });
      } else {
        response.render('list', {
          title: 'IN-BOUND FLIGHTS',
          action: 'listinbound',
          sampleData: data,
          depIATA: airports.findWhere({
            city: srchfltdetails[1]
          }).get('iata'),
          arrIATA: airports.findWhere({
            city: srchfltdetails[0]
          }).get('iata'),
          username: '',
          issession: 'false'
        });
      }
    }
  });
})

router.get("/outbound/:flight_id/:departure", function (req, response, next) {
  bookdet.push([req.params.flight_id, req.params.departure]);
  console.log(bookdet);
  if (srchfltdetails[5] == 'One-Way') {
    response.redirect('/users/passengerdetails');
  } else {
    response.redirect('/users/inbound');
  }
})

router.get("/inbound/:flight_id/:departure", function (req, response, next) {
  bookdet.push([req.params.flight_id, req.params.departure]);

  console.log(bookdet);
  response.redirect('/users/passengerdetails');

})

router.get("/passengerdetails", function (req, res, next) {
  console.log(bookdet);
  if (!req.session.result) {
    res.redirect('/users/signin');
  } else {
    res.render('passengerdetails', {
      passnum: srchfltdetails[4],
      username: req.session.result[0].name,
      issession: 'true'
    });
  }
})
let bookid;
router.post("/passengerdetails/detinputs", validator.PassDetail, function (req, res, next) {

  if (req.session.result) {
    let psprt = req.body.pasprtno;
    let lname = req.body.lname;
    let nopsngr = srchfltdetails[4];
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      const alert = errors.array();
      console.log(alert);
      res.render('passengerdetails', {
        passnum: srchfltdetails[4],
        alert: alert
      });
    } else {
      if (nopsngr > 1) {
        bookid = lname[0].substring(0, 3).toUpperCase().concat(nopsngr.toString().concat((psprt[0].toString()).substring(0, 6)));
      } else {
        bookid = lname.substring(0, 3).toUpperCase().concat(nopsngr.toString().concat((psprt.toString()).substring(0, 6)));
      }

      if (srchfltdetails[4] == 1) {
        var query = `INSERT INTO passengers values(
          ${req.session.result[0].userid},
          concat("${req.body.citizen}","${req.body.pasprtno}"),
          "${req.body.fname}",
          "${req.body.lname}",
          DATE_FORMAT(FROM_DAYS(DATEDIFF(NOW(),'${req.body.dob}')), '%Y') + 0)`;
        database.query(query, function (error, data) {
          if (error) {
            //console.log(i);
            throw error;
          } else {
            var bookquery = `INSERT INTO bookings values(
          "${bookid}",
          concat("${req.body.citizen}","${req.body.pasprtno}"),
          "${bookdet[0][0]}",
          "XX",
          "${req.body.class}",
          (select price from flight where flight_id = "${bookdet[0][0]}")
          )`;

            database.query(bookquery, function (error, data) {
              if (error) {
                console.log(i);
                throw error;
              }
            })
            if (srchfltdetails[5] != 'One-Way') {
              var bookquery = `INSERT INTO bookings values(
            "${bookid}",
            concat("${req.body.citizen}","${req.body.pasprtno}"),
            "${bookdet[1][0]}",
            "XX",
            "${req.body.class}",
            (select price from flight where flight_id = "${bookdet[1][0]}")
            )`; //999 to be edited by price in bookdet array

              database.query(bookquery, function (error, data) {
                if (error) {
                  console.log(i);
                  throw error;
                }
              })
            }
          }
        })
      } else {

        for (var i = 0; i < srchfltdetails[4]; i++) {
          var query = `INSERT INTO passengers values(
            ${req.session.result[0].userid},
            concat("${req.body.citizen[i]}","${req.body.pasprtno[i]}"),
            "${req.body.fname[i]}",
            "${req.body.lname[i]}",
            DATE_FORMAT(FROM_DAYS(DATEDIFF(NOW(),'${req.body.dob[i]}')), '%Y') + 0)`;
          database.query(query, function (error, data) {
            if (error) {
              throw error;
            }
          })
          console.log(req.body.citizen[i], req.body.pasprtno[i], req.body.class[i]);
          var bookquery = `INSERT INTO bookings values(
        "${bookid}",
        concat("${req.body.citizen[i]}","${req.body.pasprtno[i]}"),
        "${bookdet[0][0]}","XX","${req.body.class[i]}",
        (select price from flight where flight_id = "${bookdet[0][0]}")
        )`; //999 to be edited by price in bookdet array

          database.query(bookquery, function (error, data) {
            if (error) {
              console.log(i);
              throw error;
            }
          })
          if (srchfltdetails[5] != 'One-Way') {
            var bookquery = `INSERT INTO bookings values(
          "${bookid}",
          concat("${req.body.citizen[i]}","${req.body.pasprtno[i]}"),
          "${bookdet[1][0]}","XX","${req.body.class[i]}",
          (select price from flight where flight_id = "${bookdet[1][0]}")
          )`;
            database.query(bookquery, function (error, data) {
              if (error) {
                console.log(i);
                throw error;
              }
            })
          }
        }
      }
      res.redirect('/users/checkout');
    }
  } else {
    res.redirect('/users/signin');
  }
});

router.get("/checkout", function (req, res) {
  //console.log()
  let query = `SELECT f.price,flightid,arrloc,deploc from bookings b join flight f on b.flightid=f.flight_id
        join flightschedule fs on f.flightno = fs.flightno 
        where bookid = "${bookid}" group by(flightid)`;
  database.query(query, function (error, data) {
    if (error) {
      throw error
    } else {
      let total = 0;
      for (let i = 0; i < data.length; i++) {
        total = total + (data[i].price) * srchfltdetails[4];
      }
      res.render('paymentdet', {
        billdata: data,
        amount: total,
        tpsngr: srchfltdetails[4],
        username: req.session.result[0].name,
        issession: 'true'
      });
    }
  });
})

router.post("/checkout", async function (req, res) {

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: req.body.bucketitems.map(item => {
        const StoreItem = bucket.get(item.id)
        return {
          price_data: {
            currency: 'pkr',
            product_data: {
              name: StoreItem.ticket
            },
            unit_amount: StoreItem.price
          },
          quantity: item.quantity
        }
      }),
      success_url: `http://localhost:3000/users/payment/success`,
      cancel_url: `http://localhost:3000/users/payment/cancel`
    })
    res.json({
      url: session.url
    })
  } catch (e) {
    res.status(500).json({
      error: e.message
    })
  }
})

router.get("/payment/success", function (req, res) {
  console.log(bookid);
  let bilid = generatebillid(bookid);
  console.log(bilid);
  let query = `INSERT INTO BILLING values(${bilid},
    "${bookid}",
    (SELECT distinct(price) from bookings where bookid="${bookid}"),
                (SELECT count(*) from bookings where bookid="${bookid}" group by bookid),
                (SELECT distinct(price) from bookings where bookid="${bookid}")
                *
                (SELECT count(*) from bookings where bookid="${bookid}" group by bookid)                        
      );`;
  database.query(query, function (error, data) {
    if (error) {
      throw error;
    } else {
      res.render('home', {
        issession: true,
        username: req.session.result[0].name
      });
    }
  })
})

router.get("/payment/cancelled", function (req, res) {
  res.render('paymentcancelled');
})

router.get("/tktdet", function (req, res) {

  let query = `select flightno,count(*) as "qty" from flight f join bookings b on f.flight_id = b.flightid 
  where bookid = '${bookid}' 
  group by flightno;`;
  database.query(query, function (error, data) {
    if (error) {
      throw error
    } else {
      console.log(data);
      res.json(data);
    }
  })
})

/*
0=booking reference
1=lname
*/
let curflt;

router.post("/checkinform", function (req, res) {
  //console.log(req.body.bookref,req.body.lname);
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const alert = errors.array();
  } else {
    let query = `SELECT bookid from bookings where bookid = "${req.body.bookref}"`;
    database.query(query, function (error, data) {
      if (data.length == 0) {
        res.render('home', {
          alert: 'Undefined',
          message: 'Booking Reference invalid'
        })
      } else {
        res.redirect('/users/checkin');
      }
    })
  }
})

router.get("/checkin", function (req, res) {
  if (req.session.result) {
    res.render('checkin', {
      issession: 'true',
      username: req.session.result[0].name,
    });
  } else {
    res.redirect('/users/signin')
  }
})

router.get("/selectseat", function (req, res, next) {

  var query = `select distinct(flightid) from passengers p join bookings b 
                on p.passportno = b.psngrid 
                where p.userid = ${req.session.result[0].userid} and b.seat = 'XX'`;
  database.query(query, function (error, data) {
    if (error) {
      throw error;
    } else {
      console.log(data);
      res.render('selectflight', {
        fltData: data,
        issession:'true',
        username:req.session.result[0].name
      })
    }
  });
})

router.get('/selectseat/:fltid', function (req, res) {
  curflt = req.params.fltid;
  if (req.session.result) {
    res.render('seatresrv', {
      issession: 'true',
      username: req.session.result[0].username
    })
  } else {
    res.redirect("/users/signin");
  }
})

router.get("/getbkdseats", function (req, res) {
  var pc = `SELECT count(distinct(psngrid)) as "psngrcount" from bookings b join passengers p on b.psngrid = p.passportno
  where userid = ${req.session.result[0].userid}`;
  database.query(pc, function (error, count) {
    var query = `SELECT seat from bookings where seat<>'XX' and flightid = "${curflt}"`;
    database.query(query, function (error, data) {
      if (error) {
        throw error;
      } else {
        let resdata = {
          data,
          count
        };
        res.json(resdata);
      }
    })
  })
})

router.post("/postseat", function (req, res, next) {

  let buffer = "";
  let decoder = new StringDecoder('utf-8');

  req.on('data', function (data) {
    buffer += decoder.write(data);
    buffer = data;
  })
  req.on('end', function () {
    buffer += decoder.end();
    console.log(JSON.parse(buffer));
    if (JSON.parse(buffer).length > 1) {
      for (let i = 0; i < JSON.parse(buffer).length; i++) {
        var psngrquery = `select distinct(passportno) from bookings b join passengers p on b.psngrid = p.passportno 
            where p.userid = ${req.session.result[0].userid}`;
        database.query(psngrquery, function (error, pid) {
          console.log(pid[0].passportno);
          console.log(pid[1].passportno);
          var query = `UPDATE BOOKINGS b join PASSENGERS p ON b.psngrid = p.passportno 
                        SET seat = "${JSON.parse(buffer)[i]}"
                        where p.userid = ${req.session.result[0].userid} and 
                        b.flightid = '${curflt}' and 
                        b.seat='XX' and
                        b.psngrid = "${pid[i].passportno}" `;
          database.query(query, function (error, data) {
            if (error) {
              throw error;
            }
          })
        })
      }
    } else {
      var psngrquery = `select distinct(passportno) from bookings b join passengers p on b.psngrid = p.passportno 
      where p.userid = ${req.session.result[0].userid}`;
      database.query(psngrquery, function (error, pid) {
        console.log(pid[0]);
        var query = `UPDATE BOOKINGS b join PASSENGERS p ON b.psngrid = p.passportno 
                  SET seat = "${JSON.parse(buffer)}"
                  where p.userid = ${req.session.result[0].userid} and 
                  b.flightid = '${curflt}' and 
                  b.seat='XX' and
                  b.psngrid = "${pid[0].passportno}" `;
        database.query(query, function (error, data) {
          if (error) {
            throw error;
          }
        })
      })

    }
  })
})

router.get("/checkin/luggage", function (req, res) {
  res.render('luggagecheck', {
    issession: 'true',
    username: req.session.result[0].username
  });
})

router.post("/checkin/luggage", function (req, res) {
  let query1 = `SELECT bookid FROM BOOKINGS b JOIN PASSENGERS p ON B.PSNGRID = P.PASSPORTNO WHERE USERID=${req.session.result[0].userid}`;
  database.query(query1, function (error, q1data) {
    // console.log(q1data[0].bookid);
    let query = `INSERT INTO LUGGAGES VALUES(concat("${q1data[0].bookid}",SUBSTR("${q1data[0].bookid}",3,7)),
    "${q1data[0].bookid}",
    "${req.body.lugno}",
    "${req.body.weight}")`;
    database.query(query, function (error) {
      if (error) {
        throw error;
      } else {
        res.render("home", {
          issession: 'true',
          username: req.session.result[0].username
        });
      }
    })
  })
})

router.get("/checkin/getboardingpass", function (req, res) {
  let cntqry = `SELECT count(distinct(psngrid)) as "psngrcount" from bookings b join passengers p on b.psngrid = p.passportno
  where userid = ${req.session.result[0].userid}`;
  database.query(cntqry, function (error, pcount) {
    let query = `SELECT concat(fname,' ',lname) as "Name",
	  date_format(curdate(),"%d-%M-%Y") as "date",
    flight_id, seat, class, departure, arrival,
    timediff(arrival,departure) as 'traveltime', arrloc, deploc
    FROM PASSENGERS p JOIN BOOKINGS b ON p.passportno = b.psngrid 
							JOIN FLIGHT f ON f.flight_id = b.flightid
                            JOIN FLIGHTSCHEDULE fs ON f.flightno = fs.flightno
    WHERE p.userid = ${req.session.result[0].userid}`;
    database.query(query, function (error, data) {
      if (error) {
        throw error;
      } else {
        console.log(data);
        res.render('boardingpass', {
          bpd: data,
          dept: airports.findWhere({
            city: data[0].deploc
          }).get('iata'),
          arrival: airports.findWhere({
            city: data[0].arrloc
          }).get('iata'),
          count: pcount[0]
        });
      }
    })
  })
})

router.get("/viewbooking", function (req, res) {
  if (req.session.result) {
    let query = `select p.passportno, concat(p.fname,' ',p.lname) as "fullname",b.bookid,b.flightid,b.class,fs.deploc,fs.arrloc,f.arrivaldate,f.departuredate,fs.arrival,fs.departure from passengers p join bookings b on p.passportno = b.psngrid 
    join flight f on b.flightid = f.flight_id
                    join flightschedule fs on f.flightno = fs.flightno
                    where p.userid = ${req.session.result[0].userid} group by passportno`;
    database.query(query, function (error, data) {
      if (error) {
        throw error;
      } else {
        res.render('viewbooking', {
          psngrdata: data,
          issession: 'true',
          username: req.session.result[0].name
        });
      }
    })
  } else {
    res.redirect('/users/signin');
  }
})

router.get("/delete/:passportno", function (req, res) {
  let query = `DELETE FROM BOOKINGS WHERE PSNGRID = "${req.params.passportno}"`
})

router.get("/review", function (req, res) {
  if (req.session.result) {
    res.render('review', {
      issession: 'true',
      username: req.session.result[0].name
    })
  } else {
    res.redirect("/users/signin");
  }
})

router.post("/review", function (req, res) {
  let query = `insert into Review (userid,reviewtitle,review,reviewdate) values (${req.session.result[0].userid},'${req.body.reviewtitle}','${req.body.review}',curdate());`
  database.query(query, function (error, data) {
    if (error) {
      throw error
    } else {
      res.redirect("/users/home");
    }
  })
})


module.exports = router;