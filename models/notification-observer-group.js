/**
 * Created by Roman Lo on 5/27/2016.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NotificationObserverGroup = new Schema({
  name: String,
  observers: [
    { type: Schema.Types.ObjectId, ref: 'Notification.Observer' }, // object id for notification-listener
  ],
  status: Number,
  remarks: String,
});

NotificationObserverGroup.index({name: 1}, {unique: true});

module.exports = mongoose.model('Notification.ObserverGroup', NotificationObserverGroup);