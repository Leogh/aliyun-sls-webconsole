var ResponseCode = {
  SUCCESS: 200,
  ERROR: 400,
};

var StandardResponseModel = function (data, success, code, msg) {
  this.success = typeof success === 'undefined' ? true : success;
  this.code = typeof code !== 'undefined' ? code : (this.success ? ResponseCode.SUCCESS : ResponseCode.ERROR);
  this.msg = this.success ? 'success' : (typeof msg === 'undefined' ? 'unknown' : msg);
  this.data = data;
};

exports.success = function (data) {
  return new StandardResponseModel(data, true, ResponseCode.SUCCESS);
};

exports.error = function (code, msg) {
  return new StandardResponseModel(null, false, code, msg);
};