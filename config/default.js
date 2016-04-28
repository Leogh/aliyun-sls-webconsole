var merge = require('merge');

var defaultConfig = {
  auth: {
    authEnable: true,
  },
  db: {
    mongo: {
      connectionString: ""
    }
  },
  aliyun: {
    sls: {
      accessKeyId: "在阿里云sls申请的 accessKeyId",
      secretAccessKey: "在阿里云sls申请的 secretAccessKey",

      // 根据你的 sls project所在地区选择填入
      // 北京：http://cn-beijing.sls.aliyuncs.com
      // 杭州：http://cn-hangzhou.sls.aliyuncs.com
      // 青岛：http://cn-qingdao.sls.aliyuncs.com
      // 深圳：http://cn-shenzhen.sls.aliyuncs.com

      // 注意：如果你是在 ECS 上连接 SLS，可以使用内网地址，速度快，没有带宽限制。
      // 北京：cn-hangzhou-intranet.sls.aliyuncs.com
      // 杭州：cn-beijing-intranet.sls.aliyuncs.com
      // 青岛：cn-qingdao-intranet.sls.aliyuncs.com
      // 深圳：cn-shenzhen-intranet.sls.aliyuncs.com
      endpoint: 'http://cn-hangzhou.sls.aliyuncs.com',

      // 这是 sls sdk 目前支持最新的 api 版本, 不需要修改
      apiVersion: "2015-06-01"

      //以下是可选配置
      //,httpOptions: {
      //    timeout: 10000  //10秒, 默认没有timeout
      //}
    }
  },
  logging: {
    configPath: ""
  }
};

exports.get = function () {
  return defaultConfig;
};
exports._extend = function (ori, ext) {
  return merge.recursive(true, ori, ext);
}