/**
 * Created by Roman Lo on 5/5/2016.
 */

var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var AnalyticsFieldFilter = new Schema({
    name: { type: String, unique: true },
    interpretations: [{
        key: { type: String, unique: true},
        value: String,
    }],
    createTime: { type: Date, default: Date.now },
    status: Number
});

module.exports = mongoose.model('Analytics.Field.Filter', AnalyticsFieldFilter);