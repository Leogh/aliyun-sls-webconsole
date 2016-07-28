/**
 * Created by Roman Lo on 5/27/2016.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NotificationObserver = new Schema({
  name: String,
  realName: String,
  email: String,
  status: Number,
});


NotificationObserver.index({name: 1}, {unique: true});

module.exports = mongoose.model('Notification.Observer', NotificationObserver);