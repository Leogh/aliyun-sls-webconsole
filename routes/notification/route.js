/**
 * Created by Roman Lo on 6/1/2016.
 */
var express = require('express');
var utils = require('../../common/utils');
var router = express.Router();

/* GET notification home page. */
router.get('/', utils.authChk('/login'), function (req, res) {
  res.render('consoles/notification/index', {
    title: 'Home - Notification'
  });
});

/* GET notification home page. */
router.get('/management', utils.authChk('/login'), function (req, res) {
  res.render('consoles/notification/management', {
    title: 'Management - Notification'
  });
});

module.exports = router;

