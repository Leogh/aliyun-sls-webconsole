/**
 * Created by Roman Lo on 5/18/2016.
 */

var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var AnalyticsReport = new Schema({
    name: String,
    hashing: String,
    compareSets: [
        { type: Schema.Types.ObjectId, ref: 'Analytics.CompareSet' }, // object id for analytics-compareSet
    ],
    period: Number,
    periodUnit: Number,
    chartType: String,
    createTime: { type: Date, default: Date.now },
    status: Number
});

AnalyticsReport.index({name: 1, hashing: 1}, {unique: true});


module.exports = mongoose.model('Analytics.Report', AnalyticsReport);