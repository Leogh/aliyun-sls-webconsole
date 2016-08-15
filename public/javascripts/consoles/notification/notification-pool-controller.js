/**
 * Created by Roman Lo on 8/15/2016.
 */

define([
  'angular',
  'webapp',
  'utils/form-utils'
], function (angular, webapp, formUtils) {
  "use strict";

  // injections
  notificationPoolController.$inject = ['$scope', '$uibModal'];

  return webapp
    .controller('NotificationPoolController', notificationPoolController)

  function notificationPoolController($scope, $uibModal) {
    var vm = this;

    vm.pools = [];
    vm.states = {
      loading: false,
      processing: false,
    };

    vm.actions = {
      addOrUpdatePool: function (pool) {
        openPoolModal(pool);
      },
      removePool: function (pool){
        if (confirm('You\'re going to remove a notification pool(id: ' + pool._id + '), are you sure to continue?')){
          // TODO: remove the notification pool config.
        }
      }
    };

    loadPools();

    function loadPools(){
      vm.pools = [];

    }

    function openPoolModal(pool){
      var obModalInst = $uibModal.open({
        animation: true,
        backdrop: 'static',
        keyboard: false,
        templateUrl: 'notification-pool-config-modal.html',
        resolve: {
          pConfig: function () {
            return pool ? angular.merge({}, pool) : null;
          }
        },
        controller: function ($scope, $uibModalInstance, pConfig){
          var modal = this;
          modal.isForAdd = pConfig == null;
          modal.pConfig = modal.isForAdd ? {} : pConfig;

          modal.actions = {
            save: function () {

            },
            dismiss: function (){

            },
          };

        },
        controllerAs: 'modal',
      });
      obModalInst.result.then(function (object) {
        console.log(object);
      }, function () {
        // closed
      });
    }

  }

});
