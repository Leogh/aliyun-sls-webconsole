/**
 * Created by Roman Lo on 5/27/2016.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ScheduleJob = new Schema({
  notificationRule: {
    type: Schema.Types.ObjectId,
    ref: 'Notification.Rule'
  }, // object id for notification-rule
  runTimes: Number,
  hashing: String,
  startTime: Date,
  endTime: Date,
  status: Number,
  remarks: [{
    time: Date,
    message: String,
  }],
});

ScheduleJob.index({hashing: 1}, {unique: true});
ScheduleJob.index({status: 1});

module.exports = mongoose.model('Schedule.Job', ScheduleJob);