
var restResp = require("../common/rest-response");
var log4js = require('log4js');
var logger = log4js.getLogger("aliyun.sls");

/**
 * Aliyun SLS SDK general callback handler
 * @param err
 * @param data
 */
exports.aliyunSLSCallback = function (err, data) {
  var result = null;
  if (err) {
    result = restResp.error(err.code, err.errorMessage || err.message);
    logger.warn('error occurs when calling Aliyun SLS API.', err.code, err.errorMessage || err.message);
  } else {
    result = restResp.success(data);
  }
  this.send(result);
};