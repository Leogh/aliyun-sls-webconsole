/**
 * Created by Roman Lo on 5/18/2016.
 */

define([
  'angular',
  'webapp',
  'models/analytics-report',
  'services/log-analytics-service',
], function (angular, webapp, AnalyticsReport) {
  "use strict";
  // injections
  analyticsReportController.$inject = ['$scope', 'services.log-analytics-service'];

  return webapp
    .controller('AnalyticsReportController', analyticsReportController);

  function analyticsReportController($scope, logAnalyticsService) {

    // TODO : Pending ...
    var vm = this;

    vm.reports = [];
    vm.periodUnits = ['minute','hour','day'];
    vm.states = {
      processing: false,
    };

    vm.options = {
      // options
      reportId: '1',
      period: '',
      periodUnit: vm.periodUnits[0],
    };

    vm.actions = {
      // actions
      reloadReports: reloadReports,
      showReport: showReport,
    };

    function reloadReports() {
      vm.reports = [];
      logAnalyticsService
        .report
        .get()
        .success(function (data) {
          vm.reports = data;
        })
        .error(function (code, msg) {
          alert(`${code} - ${msg}`);
        })
        .finally(function () {

        });
    }

    function showReport() {
      vm.states.processing = true;
      logAnalyticsService
        .report
        .build(vm.options.report)
        .success(function (data) {
          console.log(data);
        })
        .error(function (code, msg) {
          alert(`${code} - ${msg}`);
        })
        .finally(function () {
          vm.states.processing = false;
        });
    }

  }

});
