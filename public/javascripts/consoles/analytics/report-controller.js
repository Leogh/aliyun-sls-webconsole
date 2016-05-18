/**
 * Created by Roman Lo on 5/18/2016.
 */

define([
  'angular',
  'webapp',
  'services/log-analytics-service',
], function (angular, webapp) {
  // injections
  analyticsReportController.$inject = ['$scope', 'services.log-analytics-service'];

  return webapp
    .controller('AnalyticsReportController', analyticsReportController);

  function analyticsReportController($scope, logAnalyticsService) {
    // TODO : Pending ...
  }

});
