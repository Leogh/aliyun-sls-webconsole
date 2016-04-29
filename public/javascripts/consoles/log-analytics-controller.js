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


    vm.events = {
      onAddFieldBtnClick: addOrUpdateFieldModal,
      onAddCompareSetBtnClick: addOrUpdateCompareSetModal,
    };


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
        });
      }, function () {
        // closed
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
        });
      }, function () {
        // closed
      });
    }


  }

  function fieldModalController($scope, $uibModalInstance, fieldObj) {
    var vm = this;

    vm.field = fieldObj || new AnalyticsField();
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
    vm.cpSet = compareSet || new AnalyticsCompareSet();
    vm.cFields = Array.prototype.concat(compareSet ? [] : [ presetField ], analyticsFields.success ? analyticsFields.data : []);
    vm.gFields = Array.prototype.concat([ presetField ], analyticsFields.success ? analyticsFields.data : []);
    init();
    //reloadFields();

    vm.validate = {

    };

    vm.actions = {
      onFieldChanged: onFieldChanged,
      save: save,
      dismiss: dismiss,
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
      vm.cpSet.groupField = fieldDict[vm.cpSet.groupField._id];
      $uibModalInstance.close(vm.cpSet);
    }

    function dismiss() {
      $uibModalInstance.dismiss('cancel');
    }

    function init() {
      if (!analyticsFields.success) {
        console.error(analyticsFields);
        alert(`error: ${analyticsFields.msg}`);
        dismiss();
      }
      angular.forEach(vm.gFields, function (f) {
        fieldDict[f._id] = f;
      });
    }
    /*function reloadFields(){
      analyticsFields
          .success(function (data) {
            if (data) {
              vm.fields = data;
            }
            vm.fields = [];
          })
          .error(function(code, msg){
            vm.fields = [];
            alert(msg);
            console.error(code, msg);
          })
          .finally(function () {
            vm.processing = false;
          });
    }*/
  }




});