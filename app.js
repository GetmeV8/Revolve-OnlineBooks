const createError = require('http-errors');
const express = require('express');
const path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
const hbs = require('express-handlebars');
let bodyparser = require('body-parser')
let userRouter = require('./routes/user');
let adminRouter = require('./routes/admin');
const db = require('./config/connection')
let session = require('express-session')
const nocache = require('nocache')
const helpers = require('./helpers/other-helpers')
require('dotenv').config();
let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs.engine({extname: 'hbs', defaultLayout:'layout', layoutsDir: __dirname +'/views/layout/',partialsDir:__dirname+'/views/partials/',helpers:helpers}))



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.use(session({
secret:'key',
resave:false,
saveUninitialized:false,
cookie:{maxAge:600000}}))
app.use(nocache())

db.connect((err)=>{
  if(err)console.log('connection error'+err)
  
  else console.log('Database connected')
  
})


app.use('/', userRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.render('404')
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error',{err})
});

module.exports = app;
