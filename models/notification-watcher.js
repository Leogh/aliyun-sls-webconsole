/**
 * Created by Roman Lo on 5/27/2016.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NotificationWatcher = new Schema({
  name: String,
  type: Number,
  detail: Schema.Types.Mixed, // notification watcher detail
  cron: String,
  remarks: String,
  status: Number,
});

NotificationWatcher.index({name: 1}, {unique: true});

module.exports = mongoose.model('Notification.Watcher', NotificationWatcher);