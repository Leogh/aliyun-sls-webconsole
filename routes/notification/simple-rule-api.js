/**
 * Created by Roman Lo on 7/29/2016.
 */
var async = require('async');
var utils = require('../../common/utils');
var restResp = require("../../common/rest-response");
var SimpleNotificationRule = require("../../models/notification/simple-notification-rule");

var config = require('json-config-ext').config;
var crypto = require("crypto");
var shasum = crypto.createHash('sha1');

shasum.update(config.aliyun.logAnalytics.accessKeyId);
const ALY_LOG_ANALYTICS_ACCESS_HASH = shasum.digest('hex');

module.exports = function (router) {
  /*
   Notification Rule
   */
  router.get('/simpleNotificationRule', utils.authChk('/login'), function (req, res) {
    var data = req.query;
    SimpleNotificationRule
      .find(data)
      .exec(function (err, rules){
        if (err){
          return utils.handleMongooseError(res, err);
        }
        res.send(restResp.success(rules));
      });
  });

  router.post('/simpleNotificationRule', utils.authChk('/login'), function (req, res) {
    var data = req.body;
    var rule = data.rule;
    if (rule._id) {
      res.send(restResp.error(restResp.CODE_ERROR, 'notification rule should be new.'));
      return;
    }
    addOrUpdateSimpleNotificationRule(res, rule);
  });

  router.put('/simpleNotificationRule', utils.authChk('/login'), function (req, res) {
    var data = req.body;
    var rule = data.rule;
    if (!rule._id) {
      res.send(restResp.error(restResp.CODE_ERROR, 'notification rule should be existed.'));
      return;
    }
    addOrUpdateSimpleNotificationRule(res, rule);
  });

  router.delete('/simpleNotificationRule', utils.authChk('/login'), function (req, res) {
    var data = req.query;
    var ruleId = data._id;
    SimpleNotificationRule.remove({
      _id: ruleId
    }, function (err) {
      if (err) {
        utils.handleMongooseError(res, err);
        return;
      }
      res.send(restResp.success(true));
    });
  });
};

function addOrUpdateSimpleNotificationRule(res, rule){
  var isForAdd = rule._id == null;
  async.parallel({
    simpleRule: function (cb){
      if (!isForAdd){
        SimpleNotificationRule.findOne({
            _id: rule._id,
          })
          .exec(cb);
      } else {
        SimpleNotificationRule.findOne({
            name: rule.name,
            hashing: ALY_LOG_ANALYTICS_ACCESS_HASH
          })
          .exec(cb);
      }
    }
  }, function (err, result) {
    if (err) {
      utils.handleMongooseError(res, err);
      return;
    }
    var existedRule = result.simpleRule;
    var dbRule = null;
    if (isForAdd) {
      if (existedRule != null){
        return res.send(restResp.error(restResp.CODE_ERROR, `duplicate name: ${existedRule.name}`));
      }
      dbRule = new SimpleNotificationRule();
    } else {
      if (existedRule == null){
        return res.send(restResp.error(restResp.CODE_ERROR, `no record found.`));
      }
      dbRule = existedRule;
    }

    dbRule.name = rule.name;
    dbRule.hashing = ALY_LOG_ANALYTICS_ACCESS_HASH;

    dbRule.addresses = rule.addresses;
    dbRule.cronExpression = rule.cronExpression;
    dbRule.watchList = rule.watchList;

    dbRule.status = rule.status;

    dbRule.save(function (err, result) {
      if (err) {
        utils.handleMongooseError(res, err);
        return;
      }
      res.send(restResp.success(result));
    });
  });
}