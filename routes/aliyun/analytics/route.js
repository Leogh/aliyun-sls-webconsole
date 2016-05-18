/**
 * Created by Roman Lo on 5/18/2016.
 */
var async = require('async');
var express = require('express');
var passport = require('passport');
var crypto = require("crypto");
var shasum = crypto.createHash('sha1');
var merge = require("merge");
var config = require("../../../common/config");
var utils = require('../../../common/utils');
var log4js = require('log4js');
var ALY = require("aliyun-sdk");

var router = express.Router();

/* GET log analytics home page. */
router.get('/', utils.authChk('/login'), function(req, res, next) {
    res.render('consoles/analytics/index', {
        title: 'Home - Analytics'
    });
});

/* GET log analytics report. */
router.get('/report', utils.authChk('/login'), function(req, res, next) {
    res.render('consoles/analytics/report', {
        title: 'Report - Analytics'
    });
});

/* GET log analytics management tool. */
router.get('/management', utils.authChk('/login'), function(req, res, next) {
    res.render('consoles/analytics/management', {
        title: 'Management Tool - Analytics'
    });
});

module.exports = router;