/**
 * Created by Roman Lo on 6/1/2016.
 */

var AppEnum = require('../app-enum-types');
var StatusType = AppEnum.StatusType;
var WatcherType = AppEnum.NotificationWatcherType;
var NotificationContentType = AppEnum.NotificationContentType;

// log notification builders
var LogNotificationBuilder = require('../notification/builder/log-notification-builder');

// email notification providers
var EmailNotficationProvider = require('../notification/provider/email-notifiication-provider');


var NotificationManager = function (rule) {
  if (!rule){
    throw Error('Invalid rule');
  }
  // initialize
  this.observers = {};
  this.watchers = {};
  // build observer array
  var observers = rule.observers || [];
  if (rule.observerGroups) {
    rule.observerGroups.forEach(function (group) {
      Array.prototype.concat(observers, group.observers);
    });
  }
  // build watchers array
  var watchers = rule.watchers || [];
  if (rule.watcherGroups) {
    rule.watcherGroups.forEach(function (group) {
      Array.prototype.concat(watchers, group.watchers);
    });
  }
  // construct observer dict
  this.observers = convertMongooseItemToDict(observers)
  // construct watcher dict
  this.watchers = convertMongooseItemToDict(watchers);
};

// reset NotificationManager prototype
NotificationManager.prototype = {};

NotificationManager.prototype.sendNotification = function () {
  var watcherKeys = Object.keys(this.watchers);
  var observerKeys = Object.keys(this.observers);
  var that = this;
  watcherKeys.forEach(function (watcherId) {
    var watcher = that.watchers[watcherId];
    var builder = getNotificationBuilder(watcher)
    var provider = getNotificationProvider(watcher);
    var content = builder.build();
    observerKeys.forEach(function (observerId){
      var observer = that.observers[observerId];
      provider.notify(content, observer);
    });
  });
};

module.exports = NotificationManager;

function convertMongooseItemToDict(mongooseObjects) {
  var dict = {};
  mongooseObjects.forEach(function (item) {
    dict[item._id] = item;
  });
  return dict;
}

function getNotificationProvider(watcher) {
  if (!watcher) {
    throw Error(`Invalid watcher.`);
  }
  switch (watcher.type) {
    case WatcherType.Log:
      return new EmailNotficationProvider(null);
    case WatcherType.CompareSet:
    case WatcherType.Report:
    default:
      throw Error(`Not supported watcher type: ${watcher.type}`);
  }
}

function getNotificationBuilder(watcher){
  if (!watcher){
    throw Error(`Invalid watcher.`);
  }
  switch (watcher.type) {
    case WatcherType.Log:
      return new LogNotificationBuilder();
    case WatcherType.CompareSet:
    case WatcherType.Report:
    default:
      throw Error(`Not supported watcher type: ${watcher.type}`);
  }
}