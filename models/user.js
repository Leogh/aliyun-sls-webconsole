var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var Schema = mongoose.Schema;

var User = new Schema({
	username: String,
	password: String,
	status: Number,
	favorProjects: Schema.Types.Mixed,
	analyticsDashboard: [{ type: Schema.Types.ObjectId, ref: 'Analytics.CompareSet', unique: true }],
	createTime: { type: Date, default: Date.now },
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);