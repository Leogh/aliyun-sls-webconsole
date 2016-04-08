var env = process.env.NODE_ENV || 'development';
var cfg = require('../config/conf' + (env === 'development' ? '' : ('.' + env)));

module.exports = cfg;