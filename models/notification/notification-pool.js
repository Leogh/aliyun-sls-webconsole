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
        type: Mixed,
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
  }
});

module.exports = mongoose.model('Notification.NotificationPool', NotificationPool);