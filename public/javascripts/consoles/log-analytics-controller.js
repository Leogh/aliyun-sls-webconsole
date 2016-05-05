define([
  'angular',
  'webapp',
  'models/analytics-field',
  'models/analytics-compare-set',
  'models/analytics-field-filter',
  'services/log-analytics-service',
], function (angular, webapp, AnalyticsField, AnalyticsCompareSet, AnalyticsFieldFilter) {
   // injections
  logAnalyticsController.$inject = ['$scope' , 'services.log-analytics-service', '$uibModal'];

  return webapp
    .controller('LogAnalyticsController', logAnalyticsController)
    .controller('fieldModalController', fieldModalController)
    .controller('compareSetModalController', compareSetModalController)
    .controller('filterModalController', filterModalController)
    .filter('timestamp', timestampFilter)
    .filter('percentage', percentageFilter)
    .filter('strategy', strategyFilter);

  function logAnalyticsController($scope, logAnalyticsService, $uibModal, $filterProvider) {
    console.log($filterProvider);
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
    vm.hours = genTimeRange(0, 23);
    vm.minutes = genTimeRange(0, 59);
    vm.seconds = genTimeRange(0, 59);
    vm.fromIsOpen = false;
    vm.toIsOpen = false;

    vm.anaFields = [];
    vm.compareSets = [];
    vm.anaFieldFilters = [];


    vm.compareSetOption = null;
    vm.dashboards = [];

    vm.actions = {
      addOrUpdateFieldModel: addOrUpdateFieldModel,
      addOrUpdateCompareSetModel: addOrUpdateCompareSetModel,
      addOrUpdateFieldFilterModel: addOrUpdateFieldFilterModel,
      removeFieldModel: removeFieldModel,
      removeCompareSetModel: removeCompareSetModel,
      removeFieldFilterModel: removeFieldFilterModel,
      copyAddCompareSetModel: copyAddCompareSetModel,
      toggleToolPanel: toggleToolPanel,
      analyze: analyze,
    };

    vm.interpretFieldValue = interpretFieldValue;

    reloadFieldsAndSets();

    function addOrUpdateFieldModel(fieldObj) {
      var fieldModalInst = $uibModal.open({
        animation: true,
        backdrop: 'static',
        keyboard: false,
        templateUrl: 'analytics-field-modal.html',
        controller: 'fieldModalController',
        controllerAs: 'vm',
        resolve: {
          fieldObj: function () {
            return fieldObj;
          }
        },
      });
      fieldModalInst.result.then(function (obj, cmd) {
        var promise = null;
        var isAdd = true;
        if (obj._id) {
          isAdd = false;
          promise = logAnalyticsService.field.update(obj);
        } else {
          promise = logAnalyticsService.field.add(obj);
        }
        promise.success(function(){
          if (isAdd){
            alert(`analytics field added!`);
          }
        }).error(function (code, msg) {
          alert(`[${code}] - ${msg}`);
          console.error(code, msg);
        })['finally'](function (){
          reloadFieldsAndSets();
        });
      }, function () {
        // closed
        reloadFieldsAndSets();
      });
    }

    function removeFieldModel(fieldObj) {
      if (fieldObj._id && confirm(`You are going to remove field "${fieldObj.name}", please confirm.`)){
        var promise = logAnalyticsService.field.remove(fieldObj._id);
        promise.error(function (code, msg) {
          alert(`${code} - ${msg}`);
          console.error(code, msg);
        })['finally'](function () {
          reloadFieldsAndSets();
        });
      }
    }

    function addOrUpdateCompareSetModel(compareSet){
      var fieldModalInst = $uibModal.open({
        animation: true,
        backdrop: 'static',
        keyboard: false,
        templateUrl: 'analytics-compare-set-modal.html',
        controller: 'compareSetModalController',
        controllerAs: 'vm',
        resolve: {
          compareSet: function () {
            return compareSet;
          },
          analyticsFields: function () {
            return logAnalyticsService.field.get();
          },
          interpreter: function () {
            return vm.interpretFieldValue
          }
        },
      });
      fieldModalInst.result.then(function (obj, cmd) {
        var promise = null;
        var isAdd = true;
        if (obj._id) {
          isAdd = false;
          promise = logAnalyticsService.compareSet.update(obj);
        } else {
          isAdd = false;
          promise = logAnalyticsService.compareSet.add(obj);
        }
        promise.success(function(){
          if (isAdd){
            alert(`analytics field added!`);
          }
        }).error(function (code, msg) {
          alert(`[${code}] - ${msg}`);
          console.error(code, msg);
        })['finally'](function (){
          reloadFieldsAndSets();
        });
      }, function () {
        // closed
        reloadFieldsAndSets();
      });
    }

    function removeCompareSetModel(compareSet){
      if (compareSet._id && confirm(`You are going to remove compare set "${compareSet.name}", please confirm.`)){
        var promise = logAnalyticsService.compareSet.remove(compareSet._id);
        promise.error(function (code, msg) {
          alert(`${code} - ${msg}`);
          console.error(code, msg);
        })['finally'](function () {
          reloadFieldsAndSets();
        });
      }
    }

    function addOrUpdateFieldFilterModel(filter) {
      var filterModalInst = $uibModal.open({
        animation: true,
        backdrop: 'static',
        keyboard: false,
        templateUrl: 'analytics-field-filter-modal.html',
        controller: 'filterModalController',
        controllerAs: 'vm',
        resolve: {
          filterObj: function () {
            return filter;
          }
        },
      });
      filterModalInst.result.then(function (filter, cmd) {
        var promise = null;
        var isAdd = true;
        if (filter._id) {
          isAdd = false;
          promise = logAnalyticsService.filter.update(filter);
        } else {
          isAdd = false;
          promise = logAnalyticsService.filter.add(filter);
        }
        promise.success(function(){
          if (isAdd){
            alert(`analytics field filter added!`);
          }
        }).error(function (code, msg) {
          alert(`[${code}] - ${msg}`);
          console.error(code, msg);
        })['finally'](function (){
          reloadFieldsAndSets();
        });
      }, function () {
        // closed
        reloadFieldsAndSets();
      });
    }

    function removeFieldFilterModel(filter){
      if (filter._id && confirm(`You are going to remove filter "${filter.name}", please confirm.`)){
        var promise = logAnalyticsService.filter.remove(filter._id);
        promise.error(function (code, msg) {
          alert(`${code} - ${msg}`);
          console.error(code, msg);
        })['finally'](function () {
          reloadFieldsAndSets();
        });
      }
    }

    function copyAddCompareSetModel(baseSet) {
      var newSet = angular.merge(new AnalyticsCompareSet(), baseSet);
      newSet._id = null;
      newSet.name += '_Copy';
      vm.actions.addOrUpdateCompareSetModel(newSet);
    }

    function toggleToolPanel() {
      vm.showManagementTools = !vm.showManagementTools;
      if (vm.showManagementTools) {
        reloadFieldsAndSets();
      }
    }

    function analyze() {
      vm.dashboards = [];
      vm.compareSetOption = null;
      logAnalyticsService
        .dashboard
        .build(vm.options)
        .success(function (data) {
          console.log(data);
          var set = data.compareSet;
          if (set.strategy == 0 && set.groupField != null) {  // grouping
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

    function buildColumnChartConfig(compareSet, board, options) {

    }

    function buildPieChartConfig (compareSet, board, options) {
      var title = `${compareSet.name}`;
      if (compareSet.strategy == 0 && compareSet.groupField != null) {
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
          data: (function (brd){
            var dataArr = [];
            var fullCnt = brd.full;
            angular.forEach(brd.sub, function (subItem, key) {
              var interpretedTxt = interpretFieldValue(key, compareSet.compareField);
              dataArr.push({
                name: `${compareSet.compareField.name} - ${interpretedTxt}`,
                y: subItem / fullCnt
              });
            });
            console.log(dataArr);
            return dataArr;
          })(board),
        }]
      };
    }

    function reloadFieldsAndSets () {
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

    function genTimeRange(s, e) {
      var arr = [];
      for(var i = s; i <= e; i++){
        var str = i.toString();
        if (i < 10) {
          str = '0' + str;
        }
        arr.push(str);
      }
      return arr;
    }

    function interpretFieldValue (fieldValue, field) {
      if (!field){
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

  function fieldModalController($scope, $uibModalInstance, fieldObj) {
    var vm = this;

    vm.field = angular.merge(new AnalyticsField(), fieldObj || new AnalyticsField());
    vm.tempValue = '';

    vm.validate = {
      isValidValue: isValidValue,
    };

    function isValidValue () {
      return vm.tempValue && vm.field.valueSet.indexOf(vm.tempValue) < 0;
    }

    vm.actions = {
      save: save,
      dismiss: dismiss,
      addValue: addValue,
      removeValue: removeValue,
    };

    function save() {
      $uibModalInstance.close(vm.field);
    }

    function dismiss() {
      $uibModalInstance.dismiss('cancel');
    }

    function addValue() {
      vm.field.valueSet.push(vm.tempValue);
      vm.tempValue = '';
    }

    function removeValue(idx) {
      vm.field.valueSet.splice(idx, 1);
    }


  }

  function compareSetModalController($scope, $uibModalInstance, compareSet, analyticsFields, interpreter) {
    var vm = this;
    var presetField = new AnalyticsField();
    var fieldDict = {};
    presetField.name = '(None)';

    vm.processing = true;
    vm.cpSet = angular.merge(new AnalyticsCompareSet(), compareSet || new AnalyticsCompareSet());
    vm.cFields = Array.prototype.concat(compareSet ? [] : [ presetField ], analyticsFields.success ? analyticsFields.data : []);
    vm.gFields = Array.prototype.concat([ presetField ], analyticsFields.success ? analyticsFields.data : []);
    vm.condFields = Array.prototype.concat([], analyticsFields.success ? analyticsFields.data : []);

    vm.interpretFieldValue = interpreter;

    init();
    //reloadFields();

    vm.validate = {

    };

    vm.actions = {
      onFieldChanged: onFieldChanged,
      save: save,
      dismiss: dismiss,
      addCondField: addCondField,
      removeCondField: removeCondField,
    };
    
    function onFieldChanged(type) {
      // var fieldKey = type == 'c' ? 'compareField' : 'groupField';
      // if (vm.cpSet[fieldKey]._id) {
      //   var id = vm.cpSet[fieldKey]._id;
      //   vm.cpSet[fieldKey] = fieldDict[id];
      // }
    }

    function save() {
      vm.cpSet.compareField = fieldDict[vm.cpSet.compareField._id];
      if (vm.cpSet.strategy == 0){   // group
        vm.cpSet.groupField = vm.cpSet.groupField._id == null ? null : fieldDict[vm.cpSet.groupField._id];
        vm.cpSet.compareConditions = [];  // reset compare conditions
      } else if (vm.cpSet.strategy == 1 ){ // cond
        angular.forEach(vm.cpSet.compareConditions, function (item) {
          item.field = fieldDict[item.field._id];
        });
        this.groupField = null; // reset group field
      }
      $uibModalInstance.close(vm.cpSet);
    }

    function dismiss() {
      $uibModalInstance.dismiss('cancel');
    }

    function addCondField(fieldId){
      var tar = fieldDict[fieldId];
      vm.cpSet.compareConditions.push({
        field: tar,
        value: tar.valueSet[0],
      });
      removeCondFieldOptionById(fieldId);
    }

    function removeCondFieldOptionById(fieldId) {
      // remove
      for(var i = 0; i < vm.condFields.length; i++){
        if (vm.condFields[i]._id == fieldId) {
          vm.condFields.splice(i, 1);
          if (vm.condFields.length > 0){
            vm.condition = vm.condFields[0]._id;
          }
          break;
        }
      }
    }

    function removeCondField(index) {
      var tar = vm.cpSet.compareConditions[index].field;
      vm.condFields.push(tar);
      vm.cpSet.compareConditions.splice(index, 1);
    }

    function init() {
      if (!analyticsFields.success) {
        console.error(analyticsFields);
        alert(`error: ${analyticsFields.msg}`);
        dismiss();
      }
      if (compareSet && compareSet.groupField == null) {
        vm.cpSet.groupField = new AnalyticsField();
        vm.cpSet.groupField.name = '(None)';
      }
      angular.forEach(vm.gFields, function (f) {
        fieldDict[f._id] = f;
      });
      // init cond fields options (remove existed conditions)
      if (vm.condFields.length > 0){
        angular.forEach(vm.cpSet.compareConditions, function(cond) {
          removeCondFieldOptionById(cond.field._id);
        });
        vm.condition = vm.condFields[0]._id;
      }
    }
  }

  function filterModalController($scope, $uibModalInstance, filterObj) {
    var vm = this;

    vm.filter = angular.merge(new AnalyticsFieldFilter(), filterObj);
    vm.planText = getInterpretationPlanText();
    vm.bulkMode = 0;

    vm.actions = {
      addInterpretation: addInterpretation,
      removeInterpretation: removeInterpretation,
      bulkUpdate: bulkUpdate,
      modeChange: modeChange,
      save: save,
      dismiss: dismiss,
    };

    function addInterpretation() {
      vm.filter.interpretations.push({
        key: '',
        value: null,
      });
    }

    function bulkUpdate() {
      var tmp = [];
      var arr = vm.planText.replace(/(\r\n|\n|\r)/gm,"").split('|');
      angular.forEach(arr, function (item) {
        var idx = item.indexOf('":"');
        var key = item.substr(1, idx - 1);
        var val = item.substr(idx + 3, item.length - idx - 4);
        tmp.push({
          key: key,
          value: val
        });
      });
      vm.filter.interpretations = tmp;
    }

    function modeChange() {
      vm.planText = getInterpretationPlanText();
    }

    function getInterpretationPlanText(){
      var txt = '';
      angular.forEach(vm.filter.interpretations, function (inter) {
        txt += `"${inter.key}":"${inter.value}"|`;
      });
      if (txt[txt.length - 1] == '|') {
        txt = txt.substr(0, txt.length - 1);
      }
      return txt;
    }

    function save() {
      if (vm.bulkMode == 1){
        bulkUpdate();
      }
      var hasErr = false;
      var arr = [];
      for(var i = 0; i < vm.filter.interpretations.length; i ++ ){
        var inter = vm.filter.interpretations[i];
        if (arr.indexOf(inter.key) >= 0) {
          alert(`Duplicate key ${inter.key}`);
          hasErr = true;
          break;
        }
        arr.push(inter.key);
      }
      if (!hasErr){
        $uibModalInstance.close(vm.filter);
      }
    }

    function dismiss() {
      $uibModalInstance.dismiss('cancel');
    }

    function removeInterpretation(index) {
      vm.filter.interpretations.splice(index, 1);
    }
  }

  function percentageFilter () {
    return function (num) {
      var tmp = num * 10000;
      tmp = Math.ceil(tmp);
      return tmp / 100;
    };
  }

  function timestampFilter () {
    var UNIX_TIME_START = new Date(1970, 0, 1, 0, 0, 0);
    return function (timestamp) {
      var stamp = parseInt(timestamp) + (8 * 3600);
      var date = new Date();
      date.setTime(UNIX_TIME_START.getTime() + stamp * 1000);
      return date;
    };
  }

  function strategyFilter() {
    return function (strategy) {
      if (strategy === null || typeof strategy === 'undefined') {
        return 'Group';
      }
      var num = parseInt(strategy);
      switch (num) {
        case 0: return 'Group';
        case 1: return 'Condition';
        default: return 'Unknown';
      }
    };
  }

});