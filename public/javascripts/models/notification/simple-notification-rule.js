/**
 * Created by Roman Lo on 7/29/2016.
 */

define(['base'], function (Base) {
  
  var ValueType = {
    Normal: 0,
    Percentage: 1,
  };
  var OperatorType = {
    Equals: 0,
    LessThan: 1,
    GreaterThan: 2,
  };
  var ColorType = {
    Normal: 0,
    Info: 1,
    Warn: 2,
    Danger: 3
  };

  var ThresholdConfig = function () {
    this.name = '';
    this.operatorType = OperatorType.GreaterThan;
    this.val = 0;
    this.color = ColorType.Normal;
  };

  var WatchEntity = function () {
    this.projectName = '';
    this.logStoreName = '';
    this.topic = '';
    this.condition = {
      base: '',
      tar: ''
    };
    this.valType = ValueType.Normal;
    this.thresholds = []; // array of ThresholdConfig
    this.showDetail = false;
  };

  var SimpleNotificationRule = function () {
    this.name = '';
    this.hashing = '';
    this.addresses = [];
    this.cronExpression = '0 0 0 * * *'; // run every day at 00:00,
    this.watchList = []; // array of WatchEntity
    this.status = 1;
  };

  SimpleNotificationRule.prototype = new Base();

  ThresholdConfig.OperatorType = OperatorType;
  ThresholdConfig.ValueType = ValueType;
  ThresholdConfig.ColorType = ColorType;

  SimpleNotificationRule.ThresholdConfig = ThresholdConfig;
  SimpleNotificationRule.WatchEntity = WatchEntity;

  return SimpleNotificationRule;

});