/**
 * Created by Roman Lo on 5/27/2016.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NotificationRule = new Schema({
  name: String,
  watcherGroups: [
    { type: Schema.Types.ObjectId, ref: 'Notification.WatcherGroup' }, // object id for notification-watcher-group
  ],
  watchers: [
    { type: Schema.Types.ObjectId, ref: 'Notification.Watcher' }, // object id for notification-watcher
  ],
  observerGroups: [
    { type: Schema.Types.ObjectId, ref: 'Notification.ObserverGroup' }, // object id for notification-listener-group
  ],
  observers: [
    { type: Schema.Types.ObjectId, ref: 'Notification.Observer' }, // object id for notification-listener
  ],
  cron: String,
  status: Number,
  remarks: String,
});

NotificationRule.index({name: 1}, {unique: true});

module.exports = mongoose.model('Notification.Rule', NotificationRule);