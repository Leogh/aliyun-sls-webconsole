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
  simpleNotificationRuleController.$inject = ['$scope', 'services.notification-rule-service'];

  return webapp
    .controller('SimpleNotificationRuleController', simpleNotificationRuleController)

  function simpleNotificationRuleController($scope, notificationRuleService) {
    var vm = this;
    console.log(SimpleNotificationRule);

    vm.rules = [];
    vm.selectedRule = null;

    vm.actions = {
      editRule: function (rule) {
        var allow = true;
        if (vm.selectedRule != null){
          allow = confirm(`changes not submit, are you want to leave?`);
        }
        if (allow){
          vm.selectedRule = angular.merge({}, rule);
        }
      },
      addRule: function () {
        var allow = true;
        if (vm.selectedRule != null){
          allow = confirm(`Changes not submit, are you want to leave?`);
        }
        if (allow){
          vm.selectedRule = new SimpleNotificationRule();
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
      notificationRuleService
        .simple[method](rule)
        .error(function (code, msg) {
          alert(`${method} simple notification rule failed[${code}] - ${msg}`);
        })
        .success(function (result) {
          console.log(result);
        })
        ['finally'](function () {
          reload();
        });
    }

  }

});