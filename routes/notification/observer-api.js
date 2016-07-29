/**
 * Created by Roman Lo on 7/28/2016.
 */


var async = require('async');
var utils = require('../../common/utils');
var restResp = require("../../common/rest-response");

var NotificationObserver = require("../../models/notification-observer");

module.exports = function (router) {
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
    var data = req.body;
    var observer = data.observer;
    if (observer._id) {
      res.send(restResp.error(restResp.CODE_ERROR, 'observer should be new.'));
      return;
    }
    addOrUpdateObserver(res, observer);
  });

  router.put('/observer', utils.authChk('/login'), function (req, res) {
    var data = req.body;
    var observer = data.observer;
    if (!observer._id){
      res.send(restResp.error(restResp.CODE_ERROR, 'observer should have an id.'));
      return;
    }
    addOrUpdateObserver(res, observer);
  });

  router.delete('/observer', utils.authChk('/login'), function (req, res) {
    var data = req.query;
    var observerId = data._id;
    NotificationObserver.remove({
      _id: observerId
    }, function (err) {
      if (err) {
        utils.handleMongooseError(res, err);
        return;
      }
      res.send(restResp.success(true));
    });
  });

};

function addOrUpdateObserver(res, observer) {
  var isForAdd = observer._id == null;
  async.parallel({
    observer: function (cb){
      if (!isForAdd){
        NotificationObserver.findOne({
          _id: observer._id,
        })
        .exec(cb);
      } else {
        NotificationObserver.findOne({
          name: observer.name,
        })
        .exec(cb);
      }
    }
  }, function (err, result) {
    if (err) {
      utils.handleMongooseError(res, err);
      return;
    }
    var existedOb = result.observer;
    var dbObserver = null;
    if (isForAdd) {
      if (existedOb != null){
        return res.send(restResp.error(restResp.CODE_ERROR, `duplicate name: ${existedOb.name}`));
      }
      dbObserver = new NotificationObserver();
    } else {
      if (existedOb == null){
        return res.send(restResp.error(restResp.CODE_ERROR, `no record found.`));
      }
      dbObserver = existedOb;
    }

    dbObserver.name = observer.name;
    dbObserver.realName = observer.realName;
    dbObserver.status = observer.status;
    dbObserver.email = observer.email;

    dbObserver.save(function (err, result) {
      if (err) {
        utils.handleMongooseError(res, err);
        return;
      }
      res.send(restResp.success(result));
    });
  });
}

