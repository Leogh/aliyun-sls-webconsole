define([
  'angular',
  'webapp',
  'models/analytics-field',
  'models/analytics-compare-set',
  'models/analytics-field-filter',
  'models/analytics-report',
  'filters/period-unit-filter',
  'services/log-analytics-service',
], function (angular, webapp, AnalyticsField, AnalyticsCompareSet, AnalyticsFieldFilter, AnalyticsReport, periodUnitFilter) {

  "use strict";

  // injections
  analyticsManagementController.$inject = ['$scope', 'services.log-analytics-service', '$uibModal'];

  return webapp
    .controller('AnalyticsManagementController', analyticsManagementController)
    .controller('fieldModalController', fieldModalController)
    .controller('compareSetModalController', compareSetModalController)
    .controller('filterModalController', filterModalController)
    .controller('reportModalController', reportModalController)
    .filter('periodUnit', periodUnitFilter);

  function analyticsManagementController($scope, logAnalyticsService, $uibModal) {
    var vm = this;
    var filterDict = {};
    vm.states = {
      showManagementTools: true,
      showReports: true,
      showCompareSet: true,
    };

    vm.anaFields = [];
    vm.compareSets = [];
    vm.anaFieldFilters = [];
    vm.anaReports = [];
    vm.compareSetOption = null;

    vm.actions = {
      addOrUpdateFieldModel: addOrUpdateFieldModel,
      addOrUpdateCompareSetModel: addOrUpdateCompareSetModel,
      addOrUpdateFieldFilterModel: addOrUpdateFieldFilterModel,
      addOrUpdateReportModel: addOrUpdateReportModel,
      removeFieldModel: removeFieldModel,
      removeCompareSetModel: removeCompareSetModel,
      removeFieldFilterModel: removeFieldFilterModel,
      removeReportModel: removeReportModel,
      copyAddCompareSetModel: copyAddCompareSetModel,
      copyAddReportModel: copyAddReportModel,
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
        promise.success(function () {
          if (isAdd) {
            alert(`analytics field added!`);
          }
        }).error(function (code, msg) {
          alert(`[${code}] - ${msg}`);
          console.error(code, msg);
        })['finally'](function () {
          reloadFieldsAndSets();
        });
      }, function () {
        // closed
        reloadFieldsAndSets();
      });
    }

    function removeFieldModel(fieldObj) {
      if (fieldObj._id && confirm(`You are going to remove field "${fieldObj.name}", please confirm.`)) {
        var promise = logAnalyticsService.field.remove(fieldObj._id);
        promise.error(function (code, msg) {
          alert(`${code} - ${msg}`);
          console.error(code, msg);
        })['finally'](function () {
          reloadFieldsAndSets();
        });
      }
    }


    function addOrUpdateCompareSetModel(compareSet) {
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
        promise.success(function () {
          if (isAdd) {
            alert(`analytics field added!`);
          }
        }).error(function (code, msg) {
          alert(`[${code}] - ${msg}`);
          console.error(code, msg);
        })['finally'](function () {
          reloadFieldsAndSets();
        });
      }, function () {
        // closed
        reloadFieldsAndSets();
      });
    }

    function removeCompareSetModel(compareSet) {
      if (compareSet._id && confirm(`You are going to remove compare set "${compareSet.name}", please confirm.`)) {
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
        promise.success(function () {
          if (isAdd) {
            alert(`analytics field filter added!`);
          }
        }).error(function (code, msg) {
          alert(`[${code}] - ${msg}`);
          console.error(code, msg);
        })['finally'](function () {
          reloadFieldsAndSets();
        });
      }, function () {
        // closed
        reloadFieldsAndSets();
      });
    }

    function removeFieldFilterModel(filter) {
      if (filter._id && confirm(`You are going to remove filter "${filter.name}", please confirm.`)) {
        var promise = logAnalyticsService.filter.remove(filter._id);
        promise.error(function (code, msg) {
          alert(`${code} - ${msg}`);
          console.error(code, msg);
        })['finally'](function () {
          reloadFieldsAndSets();
        });
      }
    }


    function addOrUpdateReportModel(report) {
      var filterModalInst = $uibModal.open({
        animation: true,
        backdrop: 'static',
        keyboard: false,
        templateUrl: 'analytics-report-modal.html',
        controller: 'reportModalController',
        controllerAs: 'vm',
        resolve: {
          reportObj: function () {
            return report;
          },
          compareSets: function () {
            return logAnalyticsService.compareSet.get();
          },
          periodUnitOptions: function () {
            var options = [];
            angular.forEach(periodUnitFilter.PeriodUnit, function (unit) {
              options.push(unit);
            });
            return options;
          },
        },
      });
      filterModalInst.result.then(function (report, cmd) {
        var promise = null;
        var isAdd = true;
        if (report._id) {
          isAdd = false;
          promise = logAnalyticsService.report.update(report);
        } else {
          isAdd = false;
          promise = logAnalyticsService.report.add(report);
        }
        promise.success(function () {
          if (isAdd) {
            alert(`analytics report added!`);
          }
        }).error(function (code, msg) {
          alert(`[${code}] - ${msg}`);
          console.error(code, msg);
        })['finally'](function () {
          reloadFieldsAndSets();
        });
        reloadFieldsAndSets();
      }, function () {
        // closed
        reloadFieldsAndSets();
      });
    }

    function removeReportModel(report) {
      if (report._id && confirm(`You are going to remove report "${report.name}", please confirm.`)) {
        var promise = logAnalyticsService.report.remove(report._id);
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

    function copyAddReportModel(baseReport) {
      var newReport = angular.merge(new AnalyticsReport(), baseReport);
      newReport._id = null;
      newReport.name += '_Copy';
      vm.actions.addOrUpdateReportModel(newReport);
    }


    function reloadFieldsAndSets() {
      vm.anaFields = [];
      vm.compareSets = [];
      vm.anaFieldFilters = [];
      vm.anaReports = [];
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
        });

      logAnalyticsService
        .report.get()
        .success(function (reports) {
          vm.anaReports = reports;
        })
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

  function fieldModalController($scope, $uibModalInstance, fieldObj) {
    var vm = this;

    vm.field = angular.merge(new AnalyticsField(), fieldObj || new AnalyticsField());
    vm.tempValue = '';
    vm.tempColor = '';

    vm.validate = {
      isValidValue: isValidValue,
    };

    function isValidValue() {
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
      if (vm.tempColor.length > 0) {
        vm.field.colorSetting[vm.tempValue] = (vm.tempColor[0] == '#' ? '' : '#') + vm.tempColor;
      }
      vm.tempValue = '';
      vm.tempColor = '';
    }

    function removeValue(idx) {
      var val = vm.field.valueSet.splice(idx, 1);
      if (Object.keys(vm.field.colorSetting).indexOf(val) >= 0){
        delete vm.field.colorSetting[val];
      }
    }


  }

  function compareSetModalController($scope, $uibModalInstance, compareSet, analyticsFields, interpreter) {
    var vm = this;
    var presetField = new AnalyticsField();
    var fieldDict = {};
    presetField.name = '(None)';

    vm.processing = true;
    vm.cpSet = angular.merge(new AnalyticsCompareSet(), compareSet || new AnalyticsCompareSet());
    vm.cFields = Array.prototype.concat(compareSet ? [] : [presetField], analyticsFields.success ? analyticsFields.data : []);
    vm.gFields = Array.prototype.concat([presetField], analyticsFields.success ? analyticsFields.data : []);
    vm.condFields = Array.prototype.concat([], analyticsFields.success ? analyticsFields.data : []);

    vm.interpretFieldValue = interpreter;

    init();
    //reloadFields();

    vm.validate = {};

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
      vm.cpSet.groupField = vm.cpSet.groupField._id == null ? null : fieldDict[vm.cpSet.groupField._id];
      angular.forEach(vm.cpSet.compareConditions, function (item) {
        item.field = fieldDict[item.field._id];
      });
      $uibModalInstance.close(vm.cpSet);
    }

    function dismiss() {
      $uibModalInstance.dismiss('cancel');
    }

    function addCondField(fieldId) {
      var tar = fieldDict[fieldId];
      vm.cpSet.compareConditions.push({
        field: tar,
        value: tar.valueSet[0],
      });
      removeCondFieldOptionById(fieldId);
    }

    function removeCondFieldOptionById(fieldId) {
      // remove
      for (var i = 0; i < vm.condFields.length; i++) {
        if (vm.condFields[i]._id == fieldId) {
          vm.condFields.splice(i, 1);
          if (vm.condFields.length > 0) {
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
      if (vm.condFields.length > 0) {
        angular.forEach(vm.cpSet.compareConditions, function (cond) {
          removeCondFieldOptionById(cond.field._id);
        });
        vm.condition = vm.condFields[0]._id;
      }
    }
  }

  function filterModalController($scope, $uibModalInstance, filterObj) {
    var vm = this;

    vm.filter = angular.merge(new AnalyticsFieldFilter(), filterObj || new AnalyticsFieldFilter());
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
      var arr = vm.planText.replace(/(\r\n|\n|\r)/gm, "").split('|');
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

    function getInterpretationPlanText() {
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
      if (vm.bulkMode == 1) {
        bulkUpdate();
      }
      var hasErr = false;
      var arr = [];
      for (var i = 0; i < vm.filter.interpretations.length; i++) {
        var inter = vm.filter.interpretations[i];
        if (arr.indexOf(inter.key) >= 0) {
          alert(`Duplicate key ${inter.key}`);
          hasErr = true;
          break;
        }
        arr.push(inter.key);
      }
      if (!hasErr) {
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

  function reportModalController($scope, $uibModalInstance, reportObj, compareSets, periodUnitOptions) {
    var vm = this;
    var compareSetDict = {};
    var watcher = null;

    vm.processing = true;
    vm.report = angular.merge(new AnalyticsReport(), reportObj || new AnalyticsReport());
    vm.periodUnitOptions = periodUnitOptions;
    vm.compareSets = compareSets.success ? compareSets.data : [];
    vm.enablePresetPeriod = vm.report.period ? 1 : 0;
    vm.selectedCompareSet = null;
    vm.actions = {
      addCompareSet: addCompareSet,
      removeCompareSet: removeCompareSet,
      save: save,
      dismiss: dismiss,
    };

    init();

    function addCompareSet() {
      if (vm.selectedCompareSet != null) {
        vm.report.compareSets.push(angular.merge({}, compareSetDict[vm.selectedCompareSet]));
        removeCompareSetOptionById(vm.selectedCompareSet);
        if (vm.compareSets.length > 0) {
          vm.selectedCompareSet = vm.compareSets[0]._id;
        }
      }
    }

    function removeCompareSet(idx) {
      var target = vm.report.compareSets.splice(idx, 1);
      vm.compareSets.push(target[0]);
      if (vm.compareSets.length > 0) {
        vm.selectedCompareSet = vm.compareSets[0]._id;
      }
    }

    function save() {
      if (!vm.report.name || vm.report.name == '') {
        alert(`Please enter a name for this report.`);
        return;
      }
      if (vm.report.compareSets.length == 0) {
        alert(`No CompareSet is selected.`);
        return;
      }
      if (vm.enablePresetPeriod && (!vm.report.period || vm.report.period <= 0)) {
        alert(`Peroid field should be a positive integer.`);
        return;
      }
      if (!vm.enablePresetPeriod) {
        vm.report.periodUnit = null;
        vm.report.period = null;
      }
      $uibModalInstance.close(vm.report);
    }

    function dismiss() {
      $uibModalInstance.dismiss('cancel');
    }

    function init() {
      // init compare set dictionary
      angular.forEach(vm.compareSets, function (set) {
        compareSetDict[set._id] = angular.merge({}, set);
      });
      // remove existed compare sets
      angular.forEach(vm.report.compareSets, function (set){
        removeCompareSetOptionById(set._id);
      });
      // set default selected compare set
      if (vm.compareSets.length > 0) {
        vm.selectedCompareSet = vm.compareSets[0]._id;
      }
      // init watchers
      if (watcher) {
        watcher();
      }
      watcher = $scope.$watch('vm.enablePresetPeriod', function (newValue, oldValue) {
        if (newValue != oldValue) {
          if (newValue == 1 && !vm.report.periodUnit) {
            vm.report.periodUnit = vm.periodUnitOptions[0];
          }
        }
      });
    }

    function removeCompareSetOptionById(id) {
      var tar = null;
      for(var i = 0; i < vm.compareSets.length; i++) {
        var set = vm.compareSets[i];
        if (set._id == id){
          tar = vm.compareSets.splice(i, 1);
          break;
        }
      }
      return tar;
    }

  }

});