/**
 * Created by roman on 4/28/16.
 */
define([
  'base',
  'models/analytics-field'
],function (Base, AnalyticsField) {

  var AnalyticsCompareSet = function() {
    this.name = '';
    this.compareField = new AnalyticsField();
    this.groupField = new AnalyticsField();
    this.chartType = '';
    this.strategy = 0;
    this.compareConditions = [];
    this.createTime = new Date();
    this.status = 1;
  };



  AnalyticsCompareSet.prototype = new Base();

  return AnalyticsCompareSet;

});