var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

let app = express();

const loginRoute = require('./routes/userloginroute');
const registerRoute = require('./routes/userregisterroute');
const adminRoute = require('./routes/adminroute');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret:"secret",
  resave:false,
  saveUninitialized:true}
));

app.use('/', indexRouter);
app.use('/users/', usersRouter);
app.use('/login',loginRoute);
app.use('/register',registerRoute);
app.use('/admin/',adminRoute);
//catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// app.listen(5000,()=>{console.log(`APP IS LISTENING TO PORT 3000`)});

module.exports = app;
