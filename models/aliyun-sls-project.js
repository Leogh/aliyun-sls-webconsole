var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var AliyunSLSProject = new Schema({
  name: String,
  hashing: String,
  createTime: { type: Date, default: Date.now },
  status: Number
});

AliyunSLSProject.index({name: 1, hashing: 1}, {unique: true});

module.exports = mongoose.model('Aliyun.SLS.Project', AliyunSLSProject);