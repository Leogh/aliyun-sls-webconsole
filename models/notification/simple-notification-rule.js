/**
 * Created by Roman Lo on 6/22/2016.
 */

var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var SimpleNotificationRule = new Schema({
  name: String,
  hashing: String,
  createTime: { type: Date, default: Date.now },
  status: Number,
  addresses: {
    type: Array,
    validate: {
      validator: function (value) {
        if (value instanceof Array) {
          var tmp = [];
          for (var i = 0; i < value.length; i++) {
            var val = value[i];
            if (typeof val !== 'string') return false;
            if (tmp.indexOf(val) >= 0) {
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
  cronExpression: String,
  watchList: {
    type: [{
      projectName: String,
      logStoreName: String,
      topic: String,
      conditions: String
    }]
  }
});

SimpleNotificationRule.index({name: 1, hashing: 1}, {unique: true});

module.exports = mongoose.model('Aliyun.SLS.SimpleNotificationRule', SimpleNotificationRule);
