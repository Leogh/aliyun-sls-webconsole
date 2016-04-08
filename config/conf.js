var defaultConfig = require("./default");

var conf = defaultConfig._extend(defaultConfig.get(), {
  db: {
    mongo: {
      connectionString: "mongodb://@localhost:27017/aliyun-sls-webconsole-dev"
    }
  },
  aliyun: {
    /*sls: {
      accessKeyId: "",
      secretAccessKey: "",
      endpoint: "",
    }*/
  },
  logging: {
    configPath: "config/log4js/log.config.json"
  }
});

module.exports = conf;
