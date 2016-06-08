/**
 * Created by Roman Lo on 5/18/2016.
 */
var express = require('express');
var utils = require('../../../common/utils');

var router = express.Router();

/* GET log analytics home page. */
router.get('/', utils.authChk('/login'), function (req, res) {
  res.render('consoles/analytics/index', {
    title: 'Home - Analytics'
  });
});

/* GET log analytics report. */
router.get('/report', utils.authChk('/login'), function (req, res) {
  res.render('consoles/analytics/report', {
    title: 'Report - Analytics'
  });
});

/* GET log analytics management tool. */
router.get('/management', utils.authChk('/login'), function (req, res) {
  res.render('consoles/analytics/management', {
    title: 'Management Tool - Analytics'
  });
});

module.exports = router;