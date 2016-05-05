/**
 * Created by Roman Lo on 5/5/2016.
 */

var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var AnalyticsFieldFilter = new Schema({
  name: {type: String, unique: true},
  interpretations: {
    type: [{
      key: String,
      value: String,
    }],
    validate: {
      validator: function (value) {
        if (value instanceof Array) {
          var tmp = [];
          for (var i = 0; i < value.length; i++) {
            var key = value[i].key;
            if (tmp.indexOf(key) >= 0) {
              return false;
            }
            tmp.push(key);
          }
        }
        return true;
      },
      message: 'Duplicated {VALUE} detected.'
    }
  },
  createTime: {type: Date, default: Date.now},
  status: Number
});

module.exports = mongoose.model('Analytics.Field.Filter', AnalyticsFieldFilter);