/**
 * Created by roman on 8/16/16.
 */

var request = require('request');
var config = require('json-config-ext').config;
var log4js = require('log4js');
var logger = log4js.getLogger("aliyun-sls-webconsole");

var ServiceApi = getNotificationServiceApi();

exports.status = function (id, cb) {
  "use strict";
  sendCommand('check', id, cb);
};

exports.start = function (id, cb){
  "use strict";
  sendCommand('start', id, cb);
};

exports.stop = function (id, cb){
  "use strict";
  sendCommand('stop', id, cb);
};

exports.startAll = function (cb){
  "use strict";
  sendCommand('start-all', null, cb);
};

exports.stopAll = function (cb){
  "use strict";
  sendCommand('stop-all', null, cb);
};

function sendCommand(action, poolId, callback){
  "use strict";
  request({
    url: ServiceApi,
    method: 'POST',
    json: true,
    body: {
      action: action,
      id: poolId,
    }
  }, function (error, response, body){
    if (error){
      logger.error('api call failed: ' + ServiceApi, error);
      callback(error, null);
      return;
    }
    if (body.success){
      callback(null, body.data);
    } else {
      logger.warn(body.msg);
      callback(body, null);
    }
  });
}

function getNotificationServiceApi(){
  "use strict";
  return `${config.notification.service.host}${config.notification.service.port > 0 ? ':' + config.notification.service.port : ''}/api/notification`
}

