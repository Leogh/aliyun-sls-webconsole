/**
 * Created by Roman Lo on 5/30/2016.
 */

var AppEnum = require('../app-enum-types');
var StatusType = AppEnum.StatusType;
var schedule = require('node-schedule');
var utils = require('../utils');
var NotificationRule = require('../../models/notification-rule');
var NotificationManager = require('../notification/notification-manager');
var instance = null;

var NotificationScheduler = function () { };

NotificationScheduler.prototype = {};

NotificationScheduler.prototype.getRules = function (options, callback) {
  NotificationRule
    .find(options)
    .populate('watcherGroups')
    .populate('watcherGroups.watchers')
    .populate('watchers')
    .populate('observerGroups')
    .populate('observerGroups.observers')
    .populate('observers')
    .exec(callback);
};

NotificationScheduler.prototype.getRule = function (ruleId, callback) {
  NotificationRule
    .findOne({
      _id: ruleId
    })
    .populate('watcherGroups')
    .populate('watcherGroups.watchers')
    .populate('watchers')
    .populate('observerGroups')
    .populate('observerGroups.observers')
    .populate('observers')
    .exec(callback);
};
/*

NotificationScheduler.prototype.addOrUpdateRule = function (rule, callback) {
  var isForAdd = rule._id == null;
  var dbRule = null;
  if (!isForAdd) {
    // update
    this.getRules({
      _id: rule._id
    }, function (err, rules) {
      if (err) {
        callback(err, null);
      } else {
        if (rules.length == 0) {
          callback(null, `rule doesn't exist.`);
          return;
        }
        dbRule = rules[0];
        dbRule.name = rule.name || dbRule.name;
        if (rule.watcherGroups) {
          dbRule.watcherGroups = rule.watcherGroups;
        }
        if (rule.watchers) {
          dbRule.watchers = rule.watchers;
        }
        if (rule.observerGroups) {
          dbRule.observerGroups = rule.observerGroups;
        }
        if (rule.observers) {
          dbRule.observers = rule.observers;
        }
      }
    });
  } else {
    //
    var dbRule = new NotificationRule()
  }
};
*/

/*NotificationScheduler.prototype.removeRule = function (ruleId, callback) {
  this.getRules({
    _id: ruleId
  }, function (err, rules) {
    if (err) {
      callback(err, null);
    } else {
      NotificationRule.remove({
        _id: ruleId
      }, function (err, result) {
        if (err) {
          return callback(err, null);
        }
        callback(null, true);
      });
    }
  });
};*/

NotificationScheduler.prototype.initialize = function () {
  var that = this;
  this.getRules({
    status: StatusType.Active
  }, function (err, rules) {
    if (err) {
      throw Error(err);
    }
    // schedule jobs
    for (var i = 0; i < rules.length; i++) {
      var rule = rules[i];
      if (rule instanceof NotificationRule){
        schedule.scheduleJob(rule.cron, jobRunner.bind(null, rule._id));
      }
    }
  });
};

module.exports = instance = instance || new NotificationScheduler();

function jobRunner(ruleId){
  instance.getRule(ruleId, function (err, rule) {
    if (rule.status != StatusType.Active) {
      // ignore.
    } else {
      var notificationManager = new NotificationManager(rule);
      notificationManager.sendNotification();
    }
  });
}