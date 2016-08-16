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
  // the email addresses
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
            tmp.push(val);
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
      // aliyun sls project name
      projectName: String,
      // aliyun sls log store name
      logStoreName: String,
      // aliyun sls topic
      topic: String,
      condition: {
        base: String,
        tar: String,
      },
      // valType
      // 0 normal: calculate the exact amount of log under the tar condition.
      // 1 percentage: calculate the proportion of tar in base condition.
      valType: {
        type: Number,
        validate: {
          validator: function (value){
            if (value > 1 || value < 0){
              return false;
            }
            return true;
          },
          message: 'Invalid threshold value type {VALUE} detected.'
        }
      },
      thresholds:{ // threshold configurations
        type: [{
          // threshold name
          name: String,
          // operatorType
          // 0: equals(==)
          // 1: less than(<=)
          // 2: greater than(>=)
          operatorType: {
            type: Number,
            validate: {
              validator: function (value){
                if (value > 2 || value < 0){
                  return false;
                }
                return true;
              },
              message: 'Invalid threshold operator type {VALUE} detected.'
            }
          },
          // threshold value
          val: Number,
          // color type
          // 0 normal: black
          // 1 info: light blue
          // 2 warn: yellow
          // 3 danger: red
          color: Number,
        }],
        validate: {
          validator: function (value) {
            if (value instanceof Array) {
              var tmp = [];
              for (var i = 0; i < value.length; i++) {
                var tar = value[i];
                var val = tar.name;
                if (typeof val !== 'string') return false;
                if (tmp.indexOf(val) >= 0) {
                  return false;
                }
                tmp.push(val);
              }
            }
            return true;
          },
          message: 'Duplicated threshold name {VALUE} detected.'
        }
      },
      // showDetail
      // 0 {default}: not show log content
      // 1 : show log content
      showDetail: Number,
    }]
  }
});

SimpleNotificationRule.index({name: 1, hashing: 1}, {unique: true});

module.exports = mongoose.model('Notification.SimpleNotificationRule', SimpleNotificationRule);
