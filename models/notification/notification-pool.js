/**
 * Created by roman on 8/12/16.
 */


var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var NotificationPool = new Schema({
  title: String,
  targets: {
    type: [{
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
    }],
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
  cron: String
});

module.exports = mongoose.model('Notification.NotificationPool', NotificationPool);