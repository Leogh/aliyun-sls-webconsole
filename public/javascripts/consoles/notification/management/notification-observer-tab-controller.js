/**
 * Created by Roman Lo on 6/2/2016.
 */

define([
  'angular',
  'utils/form-utils',
  'models/notification/observer',
  'models/notification/observer-group',
  'services/notification-observer-service'
], function (angular, formUtils, NotificationObserver, NotificationObserverGroup) {
  "use strict";

  // injections
  notificationObserverTabController.$inject = ['$scope', 'services.notification-observer-service', '$uibModal'];

  return notificationObserverTabController;

  function notificationObserverTabController($scope, notificationObserverService, $uibModal) {
    var oTab = this;
    oTab.observers = [];
    oTab.observerGroups = [];

    oTab.actions = {
      openObserverModal: openObserverModal,
      openCopyObserverModal: openCopyObserverModal,
      removeObserver: removeObserver,
      openObserverGroupModal: openObserverGroupModal,
      removeObserverGroup: removeObserverGroup,

    };

    reload();
    function reload(){
      notificationObserverService
        .observerGroup.get()
        .success(function (groups) {
          oTab.observerGroups = groups;
        })
        .error(function (code, msg) {
          alert(msg + ' [' +  code +  ']');
        })
        ['finally'](function () {

        });
      notificationObserverService
        .observer.get()
        .success(function (observers) {
          oTab.observers = observers;
        })
        .error(function (code, msg) {
          alert(msg + ' [' +  code +  ']');
        })
        ['finally'](function () {

        });
    }

    function openObserverModal(observer) {
      var ob = null;
      if (observer == null){
        ob = new NotificationObserver();
      } else {
        ob = observer;
      }
      var obModalInst = $uibModal.open({
        animation: true,
        backdrop: 'static',
        keyboard: false,
        templateUrl: 'notification-observer-modal.html',
        controller: notificationObserverModalController,
        controllerAs: 'vm',
        resolve: {
          observer: function () {
            return ob;
          },
          service: function () {
            return notificationObserverService;
          }
        },
      });
      obModalInst.result.then(function (object) {
        console.log(object);
        reload();
      }, function () {
        // closed
      });
    }

    function openCopyObserverModal(observer){

    }

    function removeObserver() {

    }

    function openObserverGroupModal() {

    }

    function removeObserverGroup() {

    }

    function notificationObserverModalController($scope, $uibModalInstance, observer, service) {
      var vm = this;

      vm.observer = observer;

      vm.actions = {
        save: save,
        dismiss: dismiss,
      };

      function save(){
        if (vm.observer.name == '' || vm.observer.name == null){
          alert('Observer name cannot be empty');
          return;
        }
        if (vm.observer.realName == '' || vm.observer.realName == null){
          alert('Real name cannot be empty');
          return;
        }
        if (!formUtils.validateEmail(vm.observer.email)){
          alert('Invalid email address: ' + vm.observer.email);
          return;
        }

        var success = false;
        service.observer
          .add(vm.observer)
          .success(function (observer){
            success = true;
          })
          .error(function (code, msg) {
            alert('Error: ' + msg + ' [' + code + ']');
          })
          ['finally'](function (){
            if (success){
              $uibModalInstance.close(vm.observer);
            }
          });
      }

      function dismiss(){
        $uibModalInstance.dismiss('cancel');
      }
    }
  }

});