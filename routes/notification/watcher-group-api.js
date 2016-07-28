/**
 * Created by Roman Lo on 7/28/2016.
 */

var utils = require('../../common/utils');
var restResp = require("../../common/rest-response");

var NotificationWatcher = require("../../models/notification-watcher");
var NotificationWatcherGroup = require("../../models/notification-watcher-group");

module.exports = function (router) {

  /*
   Notification WatcherGroup
   */
  router.get('/watcherGroup', utils.authChk('/login'), function (req, res) {

  });
  router.post('/watcherGroup', utils.authChk('/login'), function (req, res) {

  });
  router.put('/watcherGroup', utils.authChk('/login'), function (req, res) {

  });
  router.delete('/watcherGroup', utils.authChk('/login'), function (req, res) {

  });


};
