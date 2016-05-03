define([
  'webapp',
  'models/analytics-field',
  'models/analytics-compare-set',
  'services/log-analytics-service',
], function (webapp, AnalyticsField, AnalyticsCompareSet) {
   // injections
  logAnalyticsController.$inject = ['$scope' , 'services.log-analytics-service', '$uibModal'];
  return webapp
    .controller('LogAnalyticsController', logAnalyticsController)
    .controller('fieldModalController', fieldModalController)
    .controller('compareSetModalController', compareSetModalController);

  function logAnalyticsController($scope, logAnalyticsService, $uibModal) {
    var vm = this;
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    var tmr = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);

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

    vm.actions = {
      addOrUpdateFieldModal: addOrUpdateFieldModal,
      addOrUpdateCompareSetModal: addOrUpdateCompareSetModal,
      toggleToolPanel: toggleToolPanel,
      analyze: analyze,
    };

    reloadFieldsAndSets();

    function addOrUpdateFieldModal(fieldObj) {
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
          },
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

    function addOrUpdateCompareSetModal(compareSet){
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

    function toggleToolPanel() {
      vm.showManagementTools = !vm.showManagementTools;
      if (vm.showManagementTools) {
        reloadFieldsAndSets();
      }
    }
    
    function analyze() {
      logAnalyticsService
        .dashboard
        .build(vm.options)
        .success(function (data) {
          console.log(data);
        })
        .error(function (code, msg) {
          console.error(code, msg);
        })
        ['finally'](function () {
          // console.log(data);
        });
    }

    function reloadFieldsAndSets () {
      vm.anaFields = [];
      vm.compareSets = [];
      logAnalyticsService
          .field
          .get()
          .success(function (fields) {
            vm.anaFields = fields;
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
    
    
  }

  function fieldModalController($scope, $uibModalInstance, fieldObj) {
    var vm = this;

    vm.field = angular.merge(new AnalyticsField(), fieldObj) || new AnalyticsField();
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


  function compareSetModalController($scope, $uibModalInstance, compareSet, analyticsFields) {
    var vm = this;
    var presetField = new AnalyticsField();
    var fieldDict = {};
    presetField.name = '(None)';

    vm.processing = true;
    vm.cpSet = angular.merge(new AnalyticsCompareSet(), compareSet) || new AnalyticsCompareSet();
    vm.cFields = Array.prototype.concat(compareSet ? [] : [ presetField ], analyticsFields.success ? analyticsFields.data : []);
    vm.gFields = Array.prototype.concat([ presetField ], analyticsFields.success ? analyticsFields.data : []);
    vm.condFields = Array.prototype.concat([], analyticsFields.success ? analyticsFields.data : []);
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
      if (vm.cpSet.compareStrategy == 0){   // group
        vm.cpSet.groupField = fieldDict[vm.cpSet.groupField._id];
        vm.cpSet.compareConditions = [];  // reset compare conditions
      } else if (vm.cpSet.compareStrategy == 1 ){ // cond
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
      // remove
      for(var i = 0; i < vm.condFields.length; i++){
        if (vm.condFields[i]._id == fieldId) {
          vm.condFields.splice(i, 1);
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
      if (vm.condFields.length > 0){
        vm.condition = vm.condFields[0]._id;
      }
    }
  }




});