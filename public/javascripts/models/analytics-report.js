/**
 * Created by roman on 5/18/16.
 */
define(['base'], function (Base) {

  var AnalyticsReport = function () {
    this.name = '';
    this.compareSets = [];
    this.period = 1;
    this.periodUnit = 1;
    this.createTime = new Date();
    this.status = 1;
  };

  AnalyticsReport.prototype = new Base();

  return AnalyticsReport;

});