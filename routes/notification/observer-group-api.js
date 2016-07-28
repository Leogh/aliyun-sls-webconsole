/**
 * Created by Roman Lo on 7/28/2016.
 */

var async = require('async');
var utils = require('../../common/utils');
var restResp = require("../../common/rest-response");

var NotificationObserver = require("../../models/notification-observer");
var NotificationObserverGroup = require("../../models/notification-observer-group");

module.exports = function (router) {
  /*
   Notification ObserverGroup
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
    var data = req.body;
    var observerGroup = data.observerGroup;
    if (observerGroup._id) {
      res.send(restResp.error(restResp.CODE_ERROR, 'observer should be new.'));
      return;
    }
    if (!observerGroup.observers || observerGroup.observers.length == 0){
      res.send(restResp.error(restResp.CODE_ERROR, 'should have at least 1 observer in group.'));
      return;
    }
    addOrUpdateObserverGroup(res, observerGroup);
  });

  router.put('/observerGroup', utils.authChk('/login'), function (req, res) {
    var data = req.body;
    var observerGroup = data.observerGroup;
    if (!observerGroup._id){
      res.send(restResp.error(restResp.CODE_ERROR, 'observer should have an id.'));
      return;
    }
    if (!observerGroup.observers || observerGroup.observers.length == 0){
      res.send(restResp.error(restResp.CODE_ERROR, 'should have at least 1 observer in group.'));
      return;
    }
    addOrUpdateObserverGroup(res, observerGroup);
  });

  router.delete('/observerGroup', utils.authChk('/login'), function (req, res) {
    var data = req.query;
    var groupId = data._id;
    NotificationObserverGroup.remove({
      _id: groupId
    }, function (err) {
      if (err) {
        utils.handleMongooseError(res, err);
      }
      res.send(restResp.success(true));
    });
  });
};


function addOrUpdateObserverGroup(res, observerGroup) {
  var isForAdd = observerGroup._id == null;
  async.parallel({
    observer: function (cb){
      if (observerGroup.observers == null || typeof observerGroup.observers === 'undefined') {
        observerGroup.observers = [];
      }
      var obIds = [];
      observerGroup.observers.forEach(function (item) {
        obIds.push(item);
      });
      if (obIds.length == 0) {
        cb(null, true);
      } else {
        NotificationObserver
          .where('_id').in(obIds)
          .exec(function (err, result) {
            if (err) {
              cb(err, null);
              return;
            }
            if (result.length != observerGroup.observers.length) {
              cb('some observer(s) not found', null);
              return;
            }
            cb(null, observerGroup.observers);
          });
      }
    },
    observerGroup: function (cb){
      if (!isForAdd){
        NotificationObserverGroup.findOne({
            _id: observerGroup._id,
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

    var existedGroup = result.observerGroup;
    var dbGroup = null;
    if (isForAdd) {
      if (existedGroup != null){
        return res.send(restResp.error(null, `duplicate name: ${existedGroup.name}`));
      }
      dbGroup = new NotificationObserverGroup();
    } else {
      if (existedGroup == null){
        return res.send(restResp.error(null, `no record found.`));
      }
      dbGroup = existedGroup;
    }

    dbGroup.name = observerGroup.name;
    dbGroup.observers = result.observer;
    dbGroup.status = observerGroup.status;
    dbGroup.remarks = observerGroup.remarks;

    dbGroup.save(function (err, result) {
      if (err) {
        utils.handleMongooseError(res, err);
        return;
      }
      res.send(restResp.success(result));
    });
  });
}
