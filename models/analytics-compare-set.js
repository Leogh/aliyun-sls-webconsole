var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var AnalyticsCompareSet = new Schema({
  name: String,
  hashing: String,
  compareField: { type: Schema.Types.ObjectId, ref: 'AnalyticsField' }, // object id for analytics-field
  groupField: { type: Schema.Types.ObjectId, ref: 'AnalyticsField' }, // object id for analytics-field
  chartType: String,
  createTime: { type: Date, default: Date.now },
  status: Number
});

AnalyticsCompareSet.index({name: 1, hashing: 1}, {unique: true});

module.exports = mongoose.model('Analytics.CompareSet', AnalyticsCompareSet);