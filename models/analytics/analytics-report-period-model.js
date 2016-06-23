/**
 * Created by Roman Lo on 5/19/2016.
 */

var AnalyticsReportPeriodModel = function (dateRange) {
    this.from = dateRange.from;
    this.to = dateRange.to;
    this.dashboards = {};
  };

AnalyticsReportPeriodModel.prototype = {
  addDashboard: function (compareSetName, dashboard) {
    this.dashboards[compareSetName] = dashboard;
  },
  removeDashboard: function (compareSetName) {
    delete this.dashboards[compareSetName];
  }
};

module.exports = AnalyticsReportPeriodModel;