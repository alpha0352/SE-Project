let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let indexRouter = require('./routes/index');
let usersRouter = require('./routes/users');
let app = express();
const adminRoute = require('./routes/adminroute');
const loginRoute = require('./routes/userloginroute');
const registerRoute = require('./routes/userregisterroute');
const session = require('express-session');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret:"secret",resave:false,saveUninitialized:true}));

app.use('/', indexRouter);
app.use('/users/', usersRouter);
app.use('/login',loginRoute);
app.use('/register',registerRoute);
app.use('/admin/',adminRoute);
// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

app.listen(5000,()=>{
  console.log("app is listening to port 5000");
})


module.exports = app;
