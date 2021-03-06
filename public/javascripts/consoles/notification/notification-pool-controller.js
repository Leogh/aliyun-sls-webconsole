/**
 * Created by Roman Lo on 8/15/2016.
 */

define([
  'angular',
  'webapp',
  'utils/form-utils',
  'services/notification-pool-service'
], function (angular, webapp, formUtils) {
  "use strict";

  // injections
  notificationPoolController.$inject = ['$scope', '$uibModal', '$interval','services.notification-pool-service'];

  return webapp
    .controller('NotificationPoolController', notificationPoolController)
    .filter('json', function () {
      return function (text){
        if (typeof text === 'object'){
          return JSON.stringify(angular.copy(text), null, 4);
        }
        return text;
      };
    });

  function notificationPoolController($scope, $uibModal, $interval, poolService) {
    var vm = this;

    var ticker = null;

    vm.pools = [];
    vm.poolStatus = {};
    vm.states = {
      loading: false,
      processing: false,
      cmdExecuting: false,
    };

    vm.poolRunState = function (id, withConfig){
      if (vm.poolStatus[id]){
        var val = angular.merge({}, vm.poolStatus[id]);
        if (!withConfig && val.config){
          delete val.config;
        }
        return val;
      }
      return { msg: 'N/A' };
    };

    vm.actions = {
      addOrUpdatePool: function (pool) {
        openPoolModal(pool);
      },
      removePool: function (pool){
        if (confirm('You\'re going to remove a notification pool(id: ' + pool._id + '), are you sure to continue?')){
          poolService
            .remove(pool._id)
            .error(function (code, msg) {
              console.warn(code, msg);
            })
            ['finally'](function () {
              loadPools();
            });
        }
      },
      refreshPoolState: function () {
        loadStatus();
      },
      restartPool: function (pool) {
        vm.states.cmdExecuting = true;
        poolService
          .exec('start', pool._id)
          .error(function (code, msg) {
            alert(code + ': ' + msg);
          })
          .success(function () {
            loadStatus();
          })
          ['finally'](function (){
            vm.states.cmdExecuting = false;
          });
      },
      stopPool: function (pool) {
        vm.states.cmdExecuting = true;
        poolService
          .exec('stop', pool._id)
          .error(function (code, msg) {
            alert(code + ': ' + msg);
          })
          .success(function () {
            loadStatus();
          })
          ['finally'](function (){
            vm.states.cmdExecuting = false;
          });
      },
      toggleAutoRefreshPoolState: function(interval){
        if (ticker == null){
          ticker = $interval(function () {
            loadStatus();
          }, interval);
        } else {
          $interval.cancel(ticker);
          ticker = null;
        }
      }
    };

    loadPools();

    function loadPools(){
      vm.pools = [];
      loadStatus();
      poolService
        .get()
        .error(function (code, msg) {
          console.warn(code, msg);
        })
        .success(function (pools) {
          vm.pools = pools;
        });
    }
    
    function loadStatus(){
      poolService
        .exec('status')
        .error(function (code, msg) {
          console.warn(code, msg);
        })
        .success(function (results) {
          vm.poolStatus = results;
        });
    }

    function openPoolModal(pool){
      var obModalInst = $uibModal.open({
        animation: true,
        backdrop: 'static',
        keyboard: false,
        templateUrl: 'notification-pool-config-modal.html',
        size: 'lg',
        resolve: {
          pConfig: function () {
            return pool ? angular.merge({}, pool) : null;
          },
          service: function (){
            return poolService;
          }
        },
        controller: function ($scope, $uibModalInstance, pConfig, service){
          var modal = this;
          modal.isForAdd = pConfig == null;
          modal.pConfig = modal.isForAdd ? {} : pConfig;
          modal.temp = {
            targetJson: null,
            _tarIndex: null,
            jsonErr: null,
          };

          modal.storeCount = function (store) {
            return store === '*' ? 1 : Object.keys(store).length;
          };

          modal.actions = {
            save: function () {
              if (/^\s*$/.test(modal.pConfig.title)) {
                alert('Title cannot be empty.');
                return;
              }
              if (modal.pConfig.targets.length == 0){
                alert('Should have at least 1 target.');
                return;
              }
              if (modal.pConfig.observers.length == 0){
                alert('Should have at least 1 observer.');
                return;
              }
              if (isNaN(modal.pConfig.logDelay) || parseInt(modal.pConfig.logDelay) < 0){
                alert('Log delay should be greater than 0.');
                return;
              }
              // if (needLogLevelValidate){
              //   // validate log level
              //   if (!/[\w\W]+/.test(modal.pConfig.level)) {
              //     modal.temp.jsonErr = 'log level is not defined';
              //     return;
              //   }
              //   // validate threshold
              //   if (!/\d+/.test(modal.pConfig.threshold)) {
              //     modal.temp.jsonErr = 'threshold is not defined';
              //     return;
              //   }
              // }
              var actionName = modal.isForAdd ? 'add' : 'update';
              var isSuccess = false;
              service[actionName](modal.pConfig)
                .error(function (code, msg) {
                  alert(msg);
                  console.error(code, msg);
                })
                .success(function (result) {
                  console.log(result);
                  isSuccess = true;
                })
                ['finally'](function () {
                  if (isSuccess){
                    $uibModalInstance.close(modal.pConfig);
                  }
                });
            },
            dismiss: function (){
              $uibModalInstance.dismiss('cancel');
            },
            addOrUpdateTarget: function(index){
              var target = {};
              if (modal.temp.targetJson != null){
                if (!confirm('!!!')){
                  return;
                }
              }
              if (index >= 0){
                target = angular.merge({}, modal.pConfig.targets[index]);
              } else {
                target = {
                  projectName: '',
                  stores: '*'
                }
              }
              modal.temp._tarIndex = index;
              modal.temp.targetJson = JSON.stringify(target, null, 4);
            },
            saveTarget: function () {
              var target = validateTargetConfigJson(modal.temp.targetJson);
              if (target){
                var index = modal.temp._tarIndex;
                if (index >= 0){
                  modal.pConfig.targets[index] = target;
                } else {
                  modal.pConfig.targets.push(target);
                }
                modal.temp.targetJson = null;
                modal.temp._tarIndex = null;
              } else {
                return;
              }
            },
            addObserver: function(){
              if (modal.temp.ob == null || /^\s*$/.test(modal.temp.ob)){
                alert('observer cannot be empty');
                return;
              }
              if (modal.pConfig.observers.indexOf(modal.temp.ob) >= 0){
                alert('observer already exist: ' + modal.temp.ob);
                return;
              }
              modal.pConfig.observers.push(modal.temp.ob);
              modal.temp.ob = null;
            }
          };

          function validateLogStore(name, topics){
            modal.temp.jsonErr = null;
            if (!/[\w\W]+/.test(name)){
              modal.temp.jsonErr = 'project name is not defined';
              return -1;
            }
            if (topics === '*'){
              return 0;
            } else if (topics instanceof Array) {
              var needValidateLogLevel = false;
              for(var i = 0; i < topics.length; i++){
                var topic = topics[i];
                if (topic instanceof Object){
                  if (typeof topic.name !== 'string') {
                    modal.temp.jsonErr = 'topic name is not defined';
                    return -1;
                  }
                  if (typeof topic.conditions !== 'object') {
                    modal.temp.jsonErr = 'invalid topic conditions';
                    return -1;
                  }
                  if (typeof topic.conditions.target !== 'string') {
                    modal.temp.jsonErr = 'invalid topic target condition';
                    return -1;
                  }
                  if (typeof topic.conditions.base !== 'undefined' && topic.conditions.base != null && topic.conditions.base !== 'string'){
                    modal.temp.jsonErr = 'invalid topic base condition';
                    return -1;
                  }
                  if (!/\d+/.test(topic.threshold)) {
                    modal.temp.jsonErr = 'topic threshold is invalid or not defined';
                    return -1;
                  }
                } else if (typeof topic === 'string') {
                  needValidateLogLevel = true;
                } else {
                  modal.temp.jsonErr = 'Invalid topic config.';
                  return -1;
                }
              }
              return needValidateLogLevel ? 0 : 1;
            }

          }

          function validateTargetConfigJson(json){
            modal.temp.jsonErr = null;
            try {
              var target = JSON.parse(json);
              var needLogLevelValidate = false;
              // validate project name
              if (!/[\w\W]+/.test(target.projectName)) {
                modal.temp.jsonErr = 'project name is not defined';
                return;
              }

              // validate log stores
              if (target.stores instanceof Object) {
                for(var i = 0; i < target.stores.length; i++){
                  var result = validateLogStore(target.stores[i]);
                  if (result === -1){
                    return;
                  }
                  if (result === 0){
                    needLogLevelValidate = true;
                  }
                }
              } else if (target.stores === '*') {
                needLogLevelValidate = true;
              } else {
                modal.temp.jsonErr = 'invalid log store config';
                return;
              }

              return target;
            } catch (err) {
              var pos = err.message.match(/position (\d+)/)[1];
              var start = pos - 20 > 0 ? pos - 20 : 0;
              var len = pos - start;
              var str = json.substr(start, len);
              modal.temp.jsonErr = err.message + ' near: ' + str;
              console.warn(err.message, 'near: ', str);
            }
          }


          // init pConfig
          if (modal.isForAdd) {
            modal.pConfig = {
              title: '',
              targets: [],
              observers: [],
              logDelay: 60,
              cron: '* */1 * * * *',
              level: '',
              threshold: ''
            };
          }

        },
        controllerAs: 'modal',
      });
      obModalInst.result.then(function (object) {
        console.log(object);
        loadPools();
      }, function () {
        // closed
      });
    }

  }

});
