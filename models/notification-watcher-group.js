/**
 * Created by Roman Lo on 5/27/2016.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NotificationWatcherGroup = new Schema({
  name: String,
  watchers: [
    { type: Schema.Types.ObjectId, ref: 'Notification.Watcher' }, // object id for notification-watcher
  ],
  status: Number,
  remarks: String,
});

NotificationWatcherGroup.index({name: 1}, {unique: true});

module.exports = mongoose.model('Notification.WatcherGroup', NotificationWatcherGroup);
