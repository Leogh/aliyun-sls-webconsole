/**
 * Created by Roman Lo on 5/18/2016.
 */

define([
  'angular',
  'webapp',
  'utils/form-utils',
  'models/analytics-report',
  'filters/period-unit-filter',
  'services/log-analytics-service',
], function (angular, webapp, formUtils, AnalyticsReport, periodUnitFilter) {
  "use strict";
  // injections
  analyticsReportController.$inject = ['$scope', 'services.log-analytics-service'];

  return webapp
    .controller('AnalyticsReportController', analyticsReportController)
    .filter('periodUnit', periodUnitFilter);

  function analyticsReportController($scope, logAnalyticsService) {

    var vm = this;
    var now = new Date();
    var yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0);
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    var filterDict = {};

    vm.reports = [];
    vm.periodUnits = periodUnitFilter.PeriodUnit;
    vm.states = {
      processing: false,
      reportLocked: false,
    };

    vm.options = {
      // options
      report: null,
      from: yesterday,
      to: today,
      timeOptions: {
        enabled: false,
        from: {
          h: '00',
          m: '00',
          s: '00',
        },
        to: {
          h: '00',
          m: '00',
          s: '00',
        },
      },
      period: '',
      periodUnit: vm.periodUnits.Minute,
    };
    vm.lockedOptions = {

    };

    vm.hours = formUtils.genTimeRange(0, 23);
    vm.minutes = formUtils.genTimeRange(0, 59);
    vm.seconds = formUtils.genTimeRange(0, 59);
    vm.fromIsOpen = false;
    vm.toIsOpen = false;

    vm.actions = {
      // actions
      onReportChange: onReportChange,
      reloadReports: reloadReports,
      showReport: showReport,
    };

    vm.interpretFieldValue = interpretFieldValue;

    reloadReports();

    function onReportChange() {
      if (vm.options.report.period != null) {
        vm.options.period = vm.options.report.period;
        vm.options.periodUnit = vm.options.report.periodUnit;
      }
    }

    function reloadReports() {
      vm.reports = [];
      filterDict = {};
      var oriReport = vm.options.report;
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
          if (oriReport != null) {
            var hasReport = false;
            for (var i = 0; i < vm.reports.length; i++) {
              if (vm.reports[i]._id == oriReport._id) {
                vm.options.report = vm.reports[i];
                hasReport = true;
                break;
              }
            }
            if (!hasReport){
              vm.options.report = null;
            }
          }
          if (vm.options.report == null && vm.reports.length > 0) {
            vm.options.report = vm.reports[0];
            onReportChange();
          }
        });
      logAnalyticsService
        .filter.get()
        .success(function (filters) {
          angular.forEach(filters, function (f) {
            f.interDict = {};
            angular.forEach(f.interpretations, function (inter) {
              f.interDict[inter.key] = inter.value;
            });
            filterDict[f.name] = f;
          });
        });
    }

    function showReport() {
      if (!(vm.options.period > 0)) {
        alert('No period was set.');
        return;
      }
      vm.states.processing = true;
      vm.states.reportLocked = false;
      vm.lockedOptions = {};
      var hasErr = false;
      logAnalyticsService
        .reporting
        .build(vm.options)
        .success(function (data) {
          var options = data.options;
          var tasks = data.tasks;
          var tasksConsole = {};
          angular.forEach(options.report.compareSets, function (compareSet) {
            var obj = {
              groupField: compareSet.groupField,
              groupFieldStatusDict: {},
              name: compareSet.name,
              loaded: false,
              processing: false,
              compareSet: compareSet
            };
            if (compareSet.groupField) {
              angular.forEach(compareSet.groupField.valueSet, function (value) {
                obj.groupFieldStatusDict[value] = {
                  val: value,
                  loaded: false,
                  processing: false,
                  results: null,
                };
              });
            }
            tasksConsole[compareSet.name] = obj;
          });
          vm.lockedOptions = {
            tasksConsole: tasksConsole,
            options: options,
            tasks: tasks,
          };
          console.log(vm.lockedOptions);
        })
        .error(function (code, msg) {
          alert(`${code} - ${msg}`);
          hasErr = true;
        })
        .finally(function () {
          vm.states.processing = false;
          vm.states.reportLocked = !hasErr;
        });
    }

    function interpretFieldValue(fieldValue, field) {
      if (!field) {
        return fieldValue;
      }
      if (field.filterName && filterDict[field.filterName]) {
        var filter = filterDict[field.filterName];
        var interpretation = filter.interDict[fieldValue];
        if (typeof interpretation === 'undefined') return fieldValue;
        return interpretation;
      }
      return fieldValue;
    }

  }

});
