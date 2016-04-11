var defaultConfig = require("./default");

var conf = defaultConfig._extend(defaultConfig.get(), {
  db: {
    mongo: {
      connectionString: "<your-mongodb-connectionString>"
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
