var merge = require('merge');
var restResp = require("../common/rest-response");
var authEnabled = require("../common/config").auth.authEnable;

const UNIX_TIME_START = new Date(1970, 0, 1, 0, 0, 0);

/**
 * Calculate the unix time stamp for a Date object. The default accuracy is second.
 * @param date
 * @param accuracy
 */
exports.calculateUNIXTimestamp = function (date, accuracy) {
  accuracy = typeof accuracy === 'undefined' ? 0.001 : accuracy;
  var timespan = date.getTime() - UNIX_TIME_START.getTime() - (8 * 1000 * 3600); // timezone adjustment
  return Math.ceil(timespan * accuracy);
};

exports.authChk = function (failRedirect) {
  if (!failRedirect) {
    //failRedirect = '/admin/login';
  }
  return function (req, res, next) {
    if (!authEnabled) {
      return next();
    }
    if (req.isAuthenticated && req.user) {
      return next();
    }
    if (typeof failRedirect === 'string') {
      return res.redirect(failRedirect + "?from=" + req.originalUrl);            
    }
    res.status(401);
  };
};

exports.handleMongooseError = function (res, err) {
  res.send(restResp.error(restResp.CODE_ERROR, err.message));
};

exports._extend = function (ori, ext) {
  return merge.recursive(true, ori, ext);
};