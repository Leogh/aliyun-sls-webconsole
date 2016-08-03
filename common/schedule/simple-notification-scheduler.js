/**
 * Created by roman on 8/2/16.
 */

var AppEnum = require('../app-enum-types');
var StatusType = AppEnum.StatusType;
var schedule = require('node-schedule');
var utils = require('../utils');
var SimpleNotificationRule = require('../../models/notification/simple-notification-rule');
var simpleNotificationManager = require('../notification/simple-notification-manager');
var instance = null;

var _scheduled_jobs = {};

var SimpleNotificationScheduler = function () { };

SimpleNotificationScheduler.prototype = {};

SimpleNotificationScheduler.prototype.getRules = function (options, callback) {
  SimpleNotificationRule
    .find(options)
    .exec(callback);
};

SimpleNotificationScheduler.prototype.getRule = function (ruleId, callback) {
  SimpleNotificationRule
    .findOne({
      _id: ruleId
    })
    .exec(callback);
};

SimpleNotificationScheduler.prototype.initialize = function () {
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
      if (rule instanceof SimpleNotificationRule && rule.status == StatusType.Active){
        var job = schedule.scheduleJob(rule.cronExpression, jobRunner.bind(null, rule._id));
        _scheduled_jobs[rule._id] = job;
      }
    }
  });
};

SimpleNotificationScheduler.prototype.getScheduledJobs = function () {
  "use strict";

};

module.exports = instance = instance || new SimpleNotificationScheduler();

function jobRunner(ruleId){
  var curJob = _scheduled_jobs[ruleId];
  var nextRunTime = curJob.nextInvocation();
  instance.getRule(ruleId, function (err, rule) {
    if (err) {
      return;
    }
    if (rule instanceof SimpleNotificationRule) {
      if (rule.status != StatusType.Active) {
        // ignore.
        return schedule.cancelJob(curJob);
      } else {
        simpleNotificationManager.executeRule(rule);
      }
    }
  });
}

