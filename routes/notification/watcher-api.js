/**
 * Created by Roman Lo on 7/28/2016.
 */

var utils = require('../../common/utils');
var restResp = require("../../common/rest-response");

var NotificationWatcher = require("../../models/notification-watcher");

module.exports = function (router) {
  /*
   Notification Watcher
   */
  router.get('/watcher', utils.authChk('/login'), function (req, res) {

  });

  router.post('/watcher', utils.authChk('/login'), function (req, res) {

  });

  router.put('/watcher', utils.authChk('/login'), function (req, res) {

  });

  router.delete('/watcher', utils.authChk('/login'), function (req, res) {

  });

};
