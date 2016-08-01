/**
 * Created by Roman Lo on 7/29/2016.
 */

define([
  'angular',
  'webapp',
  'utils/form-utils',
  'models/notification/simple-notification-rule',
  'services/notification-rule-service'
], function (angular, webapp, formUtils, SimpleNotificationRule) {
  "use strict";

  var
    ThresholdConfig = SimpleNotificationRule.ThresholdConfig,
    WatchEntity = SimpleNotificationRule.WatchEntity,
    OperatorType = ThresholdConfig.OperatorType,
    ValueType = ThresholdConfig.ValueType,
    ColorType = ThresholdConfig.ColorType;

  // injections
  simpleNotificationRuleController.$inject = ['$scope', 'services.notification-rule-service', '$uibModal'];

  return webapp
    .controller('SimpleNotificationRuleController', simpleNotificationRuleController)
    .filter('operatorType', operatorTypeFilter);

  function simpleNotificationRuleController($scope, notificationRuleService, $uibModal) {
    var vm = this;
    console.log(SimpleNotificationRule);

    vm.rules = [];
    vm.selectedRule = null;
    vm.temp = {
      wItem: null,
    };

    vm.actions = {
      addOrUpdateRule: function (rule) {
        var allow = true;
        if (vm.selectedRule != null){
          allow = confirm(`changes not submit, are you want to leave?`);
        }
        if (allow){
          if(rule){
            vm.selectedRule = angular.merge({}, rule);
          }else{
            vm.selectedRule = new SimpleNotificationRule();
          }
        }
      },
      removeRule: function (rule) {
        if (confirm(`Are you sure to remove rule: ${rule.name}`)){
          var isSuccess = false;
          notificationRuleService
            .simple.remove(rule._id)
            .error(function (code, msg) {
              alert(`Simple notification rule remove failed. [${code}] - ${msg}`);
            })
            .success(function (result) {
              console.log(result);
              isSuccess = true;
            })
            ['finally'](function () {
              if (isSuccess){
                reload();
              }
            });
        }
      },
      addOrUpdateWatcher: function (index) {
        if (index >= 0){
          vm.temp.wItem = angular.merge({}, vm.selectedRule.watchList[index]);
        } else {
          vm.temp.wItem = new WatchEntity();
          vm.temp.wItem.valType = ValueType.Percentage.toString();
        }
        vm.temp.wItem._index = index;
      },
      saveWatcher: function () {
        var item = angular.merge({}, vm.temp.wItem);
        var idx = vm.temp.wItem._index;
        if (idx >= 0) {
          vm.selectedRule.watchList[idx] = item;
        }
        vm.selectedRule.watchList.push(item);
        vm.temp.wItem = null;
      },
      openThresholdModal: function (idx) {
        var thresholdConfig = null;
        if (idx >= 0) {
          thresholdConfig = vm.temp.wItem.thresholds[idx];
        } else {
          thresholdConfig = new ThresholdConfig();
          thresholdConfig.color = ColorType.Normal.toString();
          thresholdConfig.type = OperatorType.GreaterThan.toString();
        }
        var thresholdConfigModal = $uibModal.open({
          animation: true,
          backdrop: 'static',
          keyboard: false,
          templateUrl: 'threshold-modal.html',
          controller: thresholdConfigModalController,
          controllerAs: 'vm',
          resolve: {
            thresholdConfig: function () {
              return angular.merge({}, thresholdConfig);
            }
          },
        });
        thresholdConfigModal.result.then(function (item) {
          if (idx >= 0) {
            vm.temp.wItem.thresholds[idx] = item;
          } else {
            vm.temp.wItem.thresholds.push(item);
          }
        }, function () {
          // closed
        });
      },
      submit: function (rule) {
        addOrUpdateRule(rule);
      }
    };

    function reload() {
      vm.selectedRule = null;
      notificationRuleService
        .simple.get()
        .error(function (code, msg) {
          vm.rules = [];
          alert(`Simple notification rule load failed[${code}] - ${msg}`);
        })
        .success(function (rules) {
          vm.rules = rules;
        });
    }

    function addOrUpdateRule(rule){
      var method = rule._id == null ? 'add' : 'update';
      console.log(method, rule);
      return null;
      notificationRuleService
        .simple[method](rule)
        .error(function (code, msg) {
          alert(`${method} simple notification rule failed [${code}] - ${msg}`);
        })
        .success(function (result) {
          console.log(result);
        })
        ['finally'](function () {
          reload();
        });
    }

    function thresholdConfigModalController ($scope, $uibModalInstance, thresholdConfig){
      var vm = this;

      vm.config = thresholdConfig;

      vm.actions = {
        save: function () {
          $uibModalInstance.close(vm.config);
        },
        dismiss: function () {
          $uibModalInstance.dismiss('cancel');
        }
      };
    }
  }

  function operatorTypeFilter(){
    return function (opType) {
      var raw = opType;
      if(!isNaN(opType)) {
        opType = parseInt(opType);
        switch(opType) {
          case OperatorType.Equals: return '==';
          case OperatorType.GreaterThan: return '>=';
          case OperatorType.LessThan: return '<=';
          default:
            return raw;
        }
      } else {
        return raw;
      }
    };
  }

});