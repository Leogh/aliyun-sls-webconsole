var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var AnalyticsField = new Schema({
  name: String,
  hashing: String,
  filterName: String,
  valueSet: [{type: String}],
  colorSetting: {
    type: Schema.Types.Mixed,
    validate: {
      validator: function (value) {
        if (value instanceof Object) {
          var keys = Object.keys(value);
          for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (this.valueSet.indexOf(key) < 0) {
              return false;
            }
          }
        }
        return true;
      },
      message: 'Invalid value {VALUE} detected.'
    }
  },
  createTime: {type: Date, default: Date.now},
  status: Number
});

AnalyticsField.index({name: 1, hashing: 1}, {unique: true});

module.exports = mongoose.model('Analytics.Field', AnalyticsField);