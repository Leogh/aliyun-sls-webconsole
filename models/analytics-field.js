var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var AnalyticsField = new Schema({
  name: String,
  hashing: String,
  valueSet: Array,
  createTime: { type: Date, default: Date.now },
  status: Number
});

AnalyticsField.index({name: 1, hashing: 1}, {unique: true});

module.exports = mongoose.model('AnalyticsField', AnalyticsField);