/**
 * Created by Roman Lo on 8/15/2016.
 */
var async = require('async');
var utils = require('../../common/utils');
var restResp = require("../../common/rest-response");
var NotificationPool = require("../../models/notification/notification-pool");

var notificationCommander = require("../../common/notification/notification-commander");

module.exports = function (router) {
  /*
   Notification Rule
   */
  router.get('/pool-config', utils.authChk('/login'), function (req, res) {
    NotificationPool
      .find()
      .exec(function (err, results){
        if (err) {
          utils.handleMongooseError(res, err);
          return;
        }
        res.send(restResp.success(results));
      });
  });

  router.post('/pool-config', utils.authChk('/login'), function (req, res) {
    var data = req.body;
    if (data._id){
      res.send(restResp.error(restResp.CODE_ERROR, 'record already existed.'));
      return;
    }
    addOrUpdateNotificationPool(res, data);
  });

  router.put('/pool-config', utils.authChk('/login'), function (req, res) {
    var data = req.body;
    if (!data._id){
      res.send(restResp.error(restResp.CODE_ERROR, 'no record found.'));
      return;
    }
    addOrUpdateNotificationPool(res, data);
  });

  router.delete('/pool-config', utils.authChk('/login'), function (req, res) {
    var data = req.query;
    var poolId = data._id;
    NotificationPool.remove({
      _id: poolId
    }, function (err) {
      if (err) {
        utils.handleMongooseError(res, err);
        return;
      }
      res.send(restResp.success(true));
    });
  });

  router.post('/exec', utils.authChk('/login'), function (req, res){
    var data = req.body;
    var action = data.action;
    var id = data.id;
    if (typeof notificationCommander[action] !== 'function') {
      res.send(restResp.error(restResp.CODE_ERROR, `invalid command '${action}'`));
      return;
    }
    notificationCommander[action].call(this, id, function(err, result){
      "use strict";
      if (err){
        res.send(restResp.error(restResp.CODE_ERROR, 'exec error.'));
        return;
      }
      res.send(restResp.success(result));
    });
  });

};

function addOrUpdateNotificationPool(res, pool){
  var isForAdd = pool._id == null;
  async.parallel({
    notificationPool: function (cb){
      if (!isForAdd){
        NotificationPool.findOne({
            _id: pool._id,
          })
          .exec(cb);
      } else {
        cb(null, true);
      }
    }
  }, function (err, result) {
    if (err) {
      utils.handleMongooseError(res, err);
      return;
    }
    var existedPool = result.notificationPool;
    var dbPool = null;
    if (isForAdd) {
      dbPool = new NotificationPool();
    } else {
      if (existedPool == null){
        res.send(restResp.error(restResp.CODE_ERROR, `no record found.`));
        return
      }
      dbPool = existedPool;
    }

    dbPool.title = pool.title;
    dbPool.targets = pool.targets;
    dbPool.observers = pool.observers;
    dbPool.logDelay = pool.logDelay;
    dbPool.cron = pool.cron;
    dbPool.level = pool.level;
    dbPool.threshold = pool.threshold;

    dbPool.save(function (err, result) {
      if (err) {
        utils.handleMongooseError(res, err);
        return;
      }
      res.send(restResp.success(result));
    });
  });
}