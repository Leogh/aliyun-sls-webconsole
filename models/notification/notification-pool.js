/**
 * Created by roman on 8/12/16.
 */


var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var TargetSchema = new Schema({
  projectName: String,
  stores: {
    type: Schema.Types.Mixed,
    validate: {
      validator: function (value) {
        "use strict";
        // TODO target log store validation
        return true;
      }
    }
  }
},{
  _id: false,
});

var NotificationPool = new Schema({
  title: String,
  targets: {
    type: [TargetSchema],
    validate: {
      validator: function (value){
        "use strict";
        // TODO notification pool target validation
        return true;
      }
    }
  },
  observers: {
    type: Array,
    validate: {
      validator: function (value){
        "use strict";
        return true;
      }
    }
  },
  logDelay: {
    type: Number,
    validate: {
      validator: function (value){
        "use strict";
        return true;
        // return !isNaN(value) && parseInt(value) >=0;
      }
    }
  },
  cron: String,
  level: String,
  threshold: Number,
});

module.exports = mongoose.model('Notification.NotificationPool', NotificationPool);