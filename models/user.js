var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var Schema = mongoose.Schema;

var User = new Schema({
	username: String,
	password: String,
	status: Number,
	createTime: { type: Date, default: Date.now },
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);