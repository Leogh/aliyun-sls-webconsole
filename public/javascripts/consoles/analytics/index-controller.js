define([
  'angular',
  'webapp',
  'utils/form-utils',
  'services/log-analytics-service',
], function (angular, webapp, formUtils) {
  // injections
  logAnalyticsController.$inject = ['$scope', 'services.log-analytics-service'];

  return webapp
    .controller('LogAnalyticsController', logAnalyticsController)
    .filter('timestamp', timestampFilter)
    .filter('percentage', percentageFilter);

  function logAnalyticsController($scope, logAnalyticsService) {
    var vm = this;
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    var tmr = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    var filterDict = {};

    vm.options = {
      from: today,
      to: tmr,
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
      compareSetId: null,
      chartType: ''
    };
    vm.hours = formUtils.genTimeRange(0, 23);
    vm.minutes = formUtils.genTimeRange(0, 59);
    vm.seconds = formUtils.genTimeRange(0, 59);
    vm.fromIsOpen = false;
    vm.toIsOpen = false;

    vm.anaFields = [];
    vm.compareSets = [];
    vm.anaFieldFilters = [];


    vm.compareSetOption = null;
    vm.dashboards = [];

    vm.actions = {
      analyze: analyze,
      reloadFieldsAndSets: reloadFieldsAndSets,
    };

    vm.interpretFieldValue = interpretFieldValue;

    reloadFieldsAndSets();

    function analyze() {
      vm.dashboards = [];
      vm.compareSetOption = null;
      logAnalyticsService
        .dashboard
        .build(vm.options)
        .success(function (data) {
          console.log(data);
          var set = data.compareSet;
          if (set.groupField != null) {  // grouping
            angular.forEach(data.dashboard.sub, function (subBoard, key) {
              var board = {
                groupKey: key,
                cpFieldName: set.compareField.name,
                dateRange: data.dateRange,
                full: data.dashboard.full[key],
                sub: subBoard,
              };
              board.chartConfig = buildPieChartConfig(set, board, vm.options);
              vm.dashboards.push(board);
            });
          } else {
            var board = {
              cpFieldName: set.compareField.name,
              dateRange: data.dateRange,
              full: data.dashboard.full,
              sub: data.dashboard.sub,
            };
            board.chartConfig = buildPieChartConfig(set, board, vm.options);
            vm.dashboards.push(board);
          }
          vm.compareSetOption = set;
        })
        .error(function (code, msg) {
          console.error(code, msg);
        })
        ['finally'](function () {
        if (vm.dashboards.length > 0) {
          // show chart
        }
      });
    }

    function buildPieChartConfig(compareSet, board, options) {
      var title = `${compareSet.name}`;
      if (compareSet.groupField != null) {
        var interpretedGroupKey = interpretFieldValue(board.groupKey, compareSet.groupField);
        title += ` - ${compareSet.groupField.name} [${interpretedGroupKey}]`;
      }
      return {
        options: {
          chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
          },
          plotOptions: {
            pie: {
              allowPointSelect: true,
              cursor: 'pointer',
              dataLabels: {
                enabled: true,
                format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                style: {
                  color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                }
              },
              showInLegend: true
            }
          },
          tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
          },
        },
        title: {
          text: title
        },
        series: [{
          name: 'Count',
          colorByPoint: true,
          data: (function (brd) {
            var dataArr = [];
            var fullCnt = brd.full;
            var availableColorSettings = Object.keys(compareSet.compareField.colorSetting);
            angular.forEach(brd.sub, function (subItem, key) {
              var interpretedTxt = interpretFieldValue(key, compareSet.compareField);
              var color = availableColorSettings.indexOf(key) >= 0 ? compareSet.compareField.colorSetting[key] : null;
              var data = {
                name: `${compareSet.compareField.name} - ${interpretedTxt}`,
                y: subItem / fullCnt
              };
              if (color) {
                data.colorByPoint = false;
                data.color = color;
              }
              dataArr.push(data);
            });
            console.log(dataArr);
            return dataArr;
          })(board),
        }]
      };
    }

    function reloadFieldsAndSets() {
      vm.anaFields = [];
      vm.compareSets = [];
      vm.anaFieldFilters = [];
      filterDict = {};
      logAnalyticsService
        .field
        .get()
        .success(function (fields) {
          vm.anaFields = fields;
        });
      logAnalyticsService
        .filter.get()
        .success(function (filters) {
          vm.anaFieldFilters = filters;
          angular.forEach(vm.anaFieldFilters, function (f) {
            f.interDict = {};
            angular.forEach(f.interpretations, function (inter) {
              f.interDict[inter.key] = inter.value;
            });
            filterDict[f.name] = f;
          });
        });
      logAnalyticsService
        .compareSet.get()
        .success(function (sets) {
          vm.compareSets = sets;
          if (vm.options.compareSetId == null && sets.length > 0) {
            vm.options.compareSetId = sets[0]._id;
          }
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

  function percentageFilter() {
    return function (num) {
      var tmp = num * 10000;
      tmp = Math.ceil(tmp);
      return tmp / 100;
    };
  }

  function timestampFilter() {
    var UNIX_TIME_START = new Date(1970, 0, 1, 0, 0, 0);
    return function (timestamp) {
      var stamp = parseInt(timestamp) + (8 * 3600);
      var date = new Date();
      date.setTime(UNIX_TIME_START.getTime() + stamp * 1000);
      return date;
    };
  }

});