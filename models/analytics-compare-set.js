var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var AnalyticsCompareSet = new Schema({
  name: String,
  hashing: String,
  compareField: { type: Schema.Types.ObjectId, ref: 'Analytics.Field' }, // object id for analytics-field
  groupField: { type: Schema.Types.ObjectId, ref: 'Analytics.Field' }, // object id for analytics-field
  compareConditions: [{
    field: { type: Schema.Types.ObjectId, ref: 'Analytics.Field' }, // object id for analytics-field
    value: String,
  }],
  strategy: Number,
  chartType: String,
  createTime: { type: Date, default: Date.now },
  status: Number
});

AnalyticsCompareSet.index({name: 1, hashing: 1}, {unique: true});
//AnalyticsCompareSet.index({ 'compareConditions.field': 1 }, {unique: true});

module.exports = mongoose.model('Analytics.CompareSet', AnalyticsCompareSet);