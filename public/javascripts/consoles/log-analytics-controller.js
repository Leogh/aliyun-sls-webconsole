define([
  'webapp',
  'models/analytics-field',
  'models/analytics-compare-set',
  'services/aliyun-sls-service',
], function (webapp, AnalyticsField, AnalyticsCompareSet) {
   // injections
  logAnalyticsController.$inject = ['$scope' , 'services.aliyun-sls-service', '$uibModal'];
  return webapp
    .controller('LogAnalyticsController', logAnalyticsController)
    .controller('fieldModalController', fieldModalController)
    .controller('compareSetModalController', compareSetModalController);

  function logAnalyticsController($scope, slsService, $uibModal) {
    var vm = this;


    vm.events = {
      onAddFieldBtnClick: addOrUpdateFieldModal,
      onAddCompareSetBtnClick: addOrCompareSetModal,
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
        console.log(obj, cmd);
      }, function () {
        // closed
      });
    }

    function addOrCompareSetModal(compareSet){
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
        },
      });
      fieldModalInst.result.then(function (obj, cmd) {
        console.log(obj, cmd);
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


  function compareSetModalController($scope, $uibModalInstance, compareSet) {
    var vm = this;

    vm.cpSet = compareSet || new AnalyticsCompareSet();

    vm.validate = {

    };

    vm.actions = {
      save: save,
      dismiss: dismiss,
    };

    function save() {
      $uibModalInstance.close(vm.cpSet);
    }

    function dismiss() {
      $uibModalInstance.dismiss('cancel');
    }


  }




});