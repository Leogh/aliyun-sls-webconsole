/**
 * Created by roman on 8/2/16.
 */

var config = require('json-config-ext').config;
var async = require('async');
var ALY = require("aliyun-sdk");

/* create sls instance */
var sls = new ALY.SLS(config.aliyun.sls);


var WatchResult = {
  watcher: null,
  thresholds: {

  }
};

var SimpleNotificationManager = function () {};
var instance = null;

/**
 * Execute simple notification rule
 * @param {SimpleNotificationRule} rule
 * @return {Object} result
 * */
SimpleNotificationManager.prototype.executeRule = function (rule) {
  "use strict";
  var results = [];
  for(var watcher in rule.watchList){
    var result = execWatcher(watcher);
    results.push(result);
  }
};

SimpleNotificationManager.WatchResult = WatchResult;

module.exports = new SimpleNotificationManager();



/**
 * Watcher executor
 * @param {Object} watcher
 * @result {WatchResult}
 * */
function execWatcher(watcher){
  "use strict";
  var proj = watcher.projectName,
    logStore = watcher.logStoreName,
    topic = watcher.topic;
  var baseCond = watcher.condition.base;
  var tarCond = watcher.condition.tar;


  sls.getHistograms({
    //必选字段
    projectName: proj,
    logStoreName: logStore,
    from: from, //开始时间(精度为秒,从 1970-1-1 00:00:00 UTC 计算起的秒数)
    to: to,    //结束时间(精度为秒,从 1970-1-1 00:00:00 UTC 计算起的秒数)

    //以下为可选字段
    topic: topic,      //指定日志主题(用户所有主题可以通过listTopics获得)
    query: query    //查询的关键词,不输入关键词,则查询全部日志数据
  }, slsUtils.aliyunSLSCallback.bind(res));
}
