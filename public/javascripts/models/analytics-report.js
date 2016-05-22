/**
 * Created by roman on 5/18/16.
 */
define(['base'], function (Base) {

  var AnalyticsReport = function () {
    this.name = '';
    this.compareSets = [];
    this.period = null;
    this.periodUnit = null;
    this.createTime = new Date();
    this.status = 1;
  };

  AnalyticsReport.prototype = new Base();

  return AnalyticsReport;

});