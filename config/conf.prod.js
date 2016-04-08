var defaultConfig = require("./default");

var conf = defaultConfig._extend(defaultConfig.get(), {
  db: {
    mongo: {
      connectionString: ""
    }
  },
  aliyun: {
    sls: {
      accessKeyId: "j8MgAQy2qQSYvr0e",
      secretAccessKey: "Zcq5k1jL8Ow8XI5kNgqZlU7uxQXJY8",
      endpoint: "http://cn-hangzhou.sls.aliyuncs.com",
    }
  },
  logging: {
    configPath: "config/log4js/log.config.prod.json"
  }
});

module.exports = conf;