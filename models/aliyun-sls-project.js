var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var AliyunSLSProject = new Schema({
  name: { type: String, unique: true },
  hashing: String,
  createTime: { type: Date, default: Date.now },
  status: Number
});

module.exports = mongoose.model('Aliyun.SLS.Project', AliyunSLSProject);