var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config = require('json-config-ext').config;
var log4js = require('log4js');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');

var routes = require('./routes/index');
var aliyunSLS = require('./routes/aliyun/sls');
var aliyunSLSLogAnalytics = require('./routes/aliyun/analytics/route');
var aliyunSLSLogAnalyticsAPIs = require('./routes/aliyun/analytics/api');
var notificationViews = require('./routes/notification/route');
var notificationAPIs = require('./routes/notification/api');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// log4js setup
log4js.configure(config.logging.log4jsConfPath);
app.use(log4js.connectLogger(log4js.getLogger('aliyun-sls-webconsole'), {
  level: 'debug',
  format: ':method :url :response-time ms'
}));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// passport setup
app.use(session({
  secret: 'secret', // TODO: makeit configurable
  resave: true,
  saveUninitialized: true,
  maxAge: new Date(Date.now() + (14 * 24 * 60 * 60 * 1000)),
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 14 * 24 * 60 * 60 // = 14 days. Default
  })
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// pass user info to locals
app.use(function (req, res, next) {
  res.locals.user = req.user;
  next();
});

// mongoose setup
mongoose.connect(config.db.mongo.connectionString);

// routes setup
app.use('/', routes);
app.use('/aliyun-sls', aliyunSLS);
app.use('/analytics', aliyunSLSLogAnalytics);
app.use('/notification', notificationViews);
app.use('/analytics/api', aliyunSLSLogAnalyticsAPIs);
app.use('/notification/api', notificationAPIs);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// require('./common/schedule/notification-scheduler').initialize();
// require('./common/schedule/simple-notification-scheduler').initialize();

module.exports = app;