/**
 * Created by Roman Lo on 7/28/2016.
 */

var utils = require('../../common/utils');
var restResp = require("../../common/rest-response");

var NotificationRule = require("../../models/notification-rule");

module.exports = function (router) {
  /*
   Notification Rule
   */
  router.get('/notificationRule', utils.authChk('/login'), function (req, res) {

  });
  router.post('/notificationRule', utils.authChk('/login'), function (req, res) {

  });
  router.put('/notificationRule', utils.authChk('/login'), function (req, res) {

  });
  router.delete('/notificationRule', utils.authChk('/login'), function (req, res) {

  });

};
