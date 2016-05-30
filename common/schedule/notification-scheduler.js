/**
 * Created by Roman Lo on 5/30/2016.
 */

var schedule = require('node-schedule');
var NotificationRule = require('../../models/notification-rule');

var instance = null;

var NotificationScheduler = function () {
  this.rules = [];
};

NotificationScheduler.prototype.getRules = function (options, callback) {
  NotificationRule
    .find(options)
    .populate('watcherGroups')
    .populate('watcherGroups.watchers')
    .populate('watchers')
    .populate('observerGroups')
    .populate('observerGroups.observers')
    .populate('observers')
    .done(callback);
};

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
  }
};

NotificationScheduler.prototype.removeRule = function (rule, callback) {

};

NotificationScheduler.prototype.initialize = function () {
  var that = this;
  this.getRules({
    status: 1
  }, function (err, rules) {

  });
};

module.exports = instance = instance || new NotificationScheduler();