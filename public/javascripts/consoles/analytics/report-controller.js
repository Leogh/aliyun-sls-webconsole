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
  analyticsReportController.$inject = ['$scope', '$uibModal', 'services.log-analytics-service'];

  return webapp
    .controller('AnalyticsReportController', analyticsReportController)
    .controller('chartAppendingModalController', chartAppendingModalController)
    .filter('periodUnit', periodUnitFilter);

  function analyticsReportController($scope, $uibModal,logAnalyticsService) {

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
    vm.lockedOptions = {};

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
      loadTaskConsoleData: loadTaskConsoleData,
      openAddToChartModal: openAddToChartModal,
      addToChart: addToChart,
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
            if (!hasReport) {
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
              compareSet: compareSet,
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
            dashboards: [],
          };
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

    function loadTaskConsoleData(tskConsole, groupValue) {
      var compareSet = angular.merge({}, tskConsole.compareSet);
      var tasks = [];
      var isGroupTask = false;
      var statusAppender = tskConsole;

      if (typeof groupValue !== 'undefined') {
        isGroupTask = true;
        statusAppender = tskConsole.groupFieldStatusDict[groupValue];
        compareSet.groupField.valueSet = [groupValue];
      }

      angular.forEach(vm.lockedOptions.tasks[tskConsole.name], function (task) {
        var curTsk = angular.merge({}, task);
        curTsk.set = compareSet;
        tasks.push(curTsk);
      });

      tskConsole.processing = true;
      statusAppender.results = null;
      statusAppender.processing = true;
      statusAppender.loaded = false;
      statusAppender.error = null;

      logAnalyticsService
        .reporting
        .exec(tasks)
        .success(function (results) {
          statusAppender.loaded = true;
          statusAppender.results = results;
          console.log(results);
        })
        .error(function (code, msg) {
          statusAppender.loaded = false;
          statusAppender.error = `${code} - ${msg}`;
        })
        .finally(function () {
          statusAppender.processing = false;
          tskConsole.processing = false;
        });
    }

    function openAddToChartModal(tskConsole, groupValue) {
      var name = tskConsole.name;
      if (typeof groupValue !== 'undefined') {
        name += ' - ' + interpretFieldValue(groupValue, tskConsole.groupField);
      }
      var modalInst = $uibModal.open({
        animation: true,
        backdrop: 'static',
        keyboard: false,
        templateUrl: 'chart-append-modal.html',
        controller: 'chartAppendingModalController',
        controllerAs: 'vm',
        size: 'lg',
        resolve: {
          name: function () {
            return name;
          },
          groupValue: function () {
            return groupValue;
          },
          charts: function () {
            return vm.lockedOptions.dashboards;
          },
          tskConsole: function () {
            return tskConsole;
          },
        },
      });
      modalInst.result.then(function (result) {
        console.log(arguments);
        var seriesName = result.seriesName;
        var chartIndexes = result.appendTo.chartIndexes;
        var chartName = result.appendTo.chartName;
        var valueSetValue = result.valueSetValue;
        if (chartIndexes instanceof Array){
          angular.forEach(chartIndexes, function (idx) {
            addToChart(tskConsole, valueSetValue, groupValue, idx, seriesName);
          });
        } else {
          var len = vm.lockedOptions.dashboards.push({
            name: chartName,
            config: buildChartConfig(chartName),
          });
          addToChart(tskConsole, valueSetValue, groupValue, len - 1, seriesName);
        }
      }, function () {
        // close
      });
    }

    function getDashboardValue(dashboard, compareValue, groupValue) {
      var valueCategory = compareValue == null ? 'full' : 'sub';
      var target = dashboard[valueCategory];
      if (typeof groupValue !== 'undefined') {
        target =  target[groupValue];
      }
      return parseInt(compareValue == null ? target : target[compareValue]);
    }

    function addToChart(tskConsole, compareValue, groupValue, chartIdx, seriesName) {
      var src = tskConsole;
      var name = tskConsole.name;
      var isGroup = false;
      var isFull = compareValue == null;
      if (typeof groupValue !== 'undefined') {
        isGroup = true
        src = tskConsole.groupFieldStatusDict[groupValue];
        name += ' - ' + interpretFieldValue(groupValue, tskConsole.groupField);
      }
      var report = src.results.report;

      var data = [];
      var categories = [];
      angular.forEach(report, function (item) {
        categories.push({
          to: parseInt(item.to),
          from: parseInt(item.from),
        });
      });
      categories.sort(function (a, b) {
        return parseInt(a) - parseInt(b);
      });
      angular.forEach(categories, function (item, index) {
        var dashboard = report[item.from].dashboards[tskConsole.name];
        var val = getDashboardValue(dashboard, compareValue, groupValue);
        data.push(val);
        categories[index] = item.to;
      });

      var targetChart = vm.lockedOptions.dashboards[chartIdx];
      targetChart.config.xAxis.categories =  constructChartCategory(categories, vm.lockedOptions.options.periodUnit);

      var seriesId = tskConsole.name + (isGroup ? '_G:' + groupValue : '') + (!isFull ? '_C:' + compareValue : '');
      var existed = false;
      var series = targetChart.config.series;
      var seriesOption = {
        name: !seriesName ? name : seriesName,
        data: data,
        _id: seriesId
      };
      for (var i = 0; i < series.length; i++) {
        if (series[i]._id == seriesId) {
          existed = true;
          targetChart.config.series[i] = seriesOption;
          break;
        }
      }
      if (!existed) {
        targetChart.config.series.push(seriesOption);
      }
    }

    function buildChartConfig(name) {
      return {
        options: {
          chart: {
            type: 'spline'
          },
          plotOptions: {
            spline: {
              marker: {
                radius: 4,
                lineColor: '#666666',
                lineWidth: 1
              }
            }
          },
          tooltip: {
            crosshairs: true,
            shared: true
          },
        },
        title: {
          text: !name ? 'Default Chart' : name,
        },
        xAxis: {
          categories: []
        },
        yAxis: {
          title: {
            text: 'Count'
          }
        },
        series: [],
      };
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

    function constructChartCategory(timestampArr, periodUnit) {
      var categories = [];
      var monthArr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      var dateFormat = '';
      switch (parseInt(periodUnit)) {
        case periodUnitFilter.PeriodUnit.Minute:
        case periodUnitFilter.PeriodUnit.Hour:
          dateFormat = '{month}. {date}, {hour}:{minute}';
          break;
        case periodUnitFilter.PeriodUnit.Day:
        case periodUnitFilter.PeriodUnit.Week:
          dateFormat = '{month}. {date}';
          break;
        case periodUnitFilter.PeriodUnit.Month:
          dateFormat = '{month}. {year}';
          break;
      }
      angular.forEach(timestampArr, function (timestamp) {
        var date = new Date(timestamp * 1000);
        var min = date.getMinutes();
        var hrs = date.getHours();
        var txt = dateFormat
          .replace('{year}', date.getFullYear())
          .replace('{month}', monthArr[date.getMonth()])
          .replace('{date}', date.getDate())
          .replace('{hour}', hrs < 10 ? ('0' + hrs) : hrs)
          .replace('{minute}', min < 10 ? ('0' + min) : min);
        categories.push(txt);
      });
      return categories;
    }



  }


  function chartAppendingModalController($scope, $uibModalInstance, name, groupValue, charts, tskConsole) {
    var vm = this;
    var FULL_DATA = 'Full Data';
    vm.name = name;
    vm.chartType = charts.length > 0 ? '0' : '1';
    vm.chartName = null;
    vm.selectedDataOption = FULL_DATA;
    vm.dataOptions = function () {
      var options = [ FULL_DATA ];
      var compareField = tskConsole.compareSet.compareField;
      angular.forEach(compareField.valueSet, function (val) {
        options.push(val);
      });
      return options;
    }();
    vm.chartOptions = function () {
      var options = [];
      angular.forEach(charts, function (item){
        options.push({
          name: item.name,
          selected: false
        });
      });
      return options;
    }();

    vm.actions = {
      confirm: confirmAdd,
      dismiss: closeModal,
    };

    function confirmAdd() {
      var selectedChartIndexes = null;
      if (!vm.name || vm.name == '') {
        alert('Series name is required');
        return;
      }
      if (vm.chartType == '1') {
        if (vm.chartName == null || vm.chartName.length == 0) {
          alert('Chart name is required');
          return ;
        }
      } else {
        selectedChartIndexes = [];
        angular.forEach(vm.chartOptions, function (item, index) {
          if (item.selected) {
            selectedChartIndexes.push(index);
          }
        });
        if (selectedChartIndexes.length == 0) {
          alert('Select one chart at least.');
          return;
        }
      }
      var valueSetValue = vm.selectedDataOption == FULL_DATA ? null : vm.selectedDataOption;
      var seriesName = vm.selectedDataOption == FULL_DATA ? vm.name : (vm.name + ' - ' + vm.selectedDataOption);
      $uibModalInstance.close({
        seriesName: seriesName,
        valueSetValue: valueSetValue,
        appendTo: {
          chartName: vm.chartName,
          chartIndexes: selectedChartIndexes,
        }
      });
    }

    function closeModal() {
      $uibModalInstance.dismiss('cancel');
    }

  }
});
