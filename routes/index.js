var express = require('express');
var passport = require('passport');
var User = require('../models/user');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Aliyun SLS Web Console' });
});

router.get('/login', function (req, res, next) {  
  res.render('login', { title: 'Login', fromUrl: req.query.from });
});

router.post('/login', function (req, res, next) {
  var username = req.body.username;
  var password = req.body.password;
  var rememberMe= req.body.rememberMe;
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }    
    if (!user) {
      res.render('login', { title: 'Login', fromUrl: req.body.fromUrl, username: username, hasError: true, errMessage: info.message });
      return;
    }
    req.login(user, function(err) {
      if (err) { return next(err); }
      var url = '/';
      if (rememberMe){
        var hour = 3600000;
        req.session.cookie.maxAge = 14 * 24 * hour; //2 weeks
      }
      if (req.body.fromUrl) {
        url = req.body.fromUrl;
      }

      return res.redirect(url);
    });
  })(req, res, next);
});

router.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/login');
});

router.get('/register', function (req, res, next) {
  res.render('register', { title: 'Register' }); 
});

router.post('/register', function (req, res, next) {
  var username = req.body.username;
  var password = req.body.password;
  var passwordConfirm = req.body.passwordConfirm;
  var hasError = false;
  var errMessage = '';
  if (!hasError && !username){
    hasError = true;
    errMessage = '用户名不能为空';
    
  }
  if (!hasError && password != passwordConfirm){
    hasError = true;
    errMessage = '密码不一致';
  }
  
  if (hasError) {
    return res.render('register', { title: 'Register', hasError: hasError, errMessage: errMessage, username: username });
  }
  
  User.register(new User({ username : username }), password, function(err, user) {
    if (err) {
      return res.render('register', { title: 'Register', hasError: true, errMessage: err.message, username: username });
    }
    passport.authenticate('local')(req, res, function () {
      res.redirect('/');
    });
  });
  
});

module.exports = router;