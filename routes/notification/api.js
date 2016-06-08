/**
 * Created by Roman Lo on 6/1/2016.
 */

var express = require('express');
var utils = require('../../common/utils');
var restResp = require("../../common/rest-response");

var NotificationObserver = require("../../models/notification-observer");
var NotificationObserverGroup = require("../../models/notification-observer-group");
var NotificationWatcher = require("../../models/notification-watcher");
var NotificationWatcherGroup = require("../../models/notification-watcher-group");
var NotificationRule = require("../../models/notification-rule");
var AppEnum = require("../../common/app-enum-types");

var router = express.Router();

/*
 Notification Observer
 */
router.get('/observer', utils.authChk('/login'), function (req, res) {
  var data = req.query;
  NotificationObserver
    .find(data)
    .exec(function (err, observers){
      if (err){
        return utils.handleMongooseError(res, err);
      }
      res.send(restResp.success(observers));
    });
});
router.post('/observer', utils.authChk('/login'), function (req, res) {
  var data = req.data;
  var observer = data.observer;
  var dbObserver = new NotificationObserver();
  dbObserver.name = observer.name;
  dbObserver.realName = observer.realName;
  dbObserver.status = observer.status;
  dbObserver.email = observer.email;

  res.send(restResp.success(true));
});
router.put('/observer', utils.authChk('/login'), function (req, res) {
  res.send(restResp.success(true));
});
router.delete('/observer', utils.authChk('/login'), function (req, res) {
  res.send(restResp.error(0, false));
});


/*
 Notification ListenerGroup
 */
router.get('/observerGroup', utils.authChk('/login'), function (req, res) {
  var data = req.query;
  NotificationObserverGroup
    .find(data)
    .exec(function (err, observerGroups){
      if (err){
        return utils.handleMongooseError(res, err);
      }
      res.send(restResp.success(observerGroups));
    });
});
router.post('/observerGroup', utils.authChk('/login'), function (req, res) {
  var data = req.data;

  res.send(restResp.success(true));
});
router.put('/observerGroup', utils.authChk('/login'), function (req, res) {
  res.send(restResp.success(true));
});
router.delete('/observerGroup', utils.authChk('/login'), function (req, res) {
  res.send(restResp.error(0, false));
});



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




module.exports = router;