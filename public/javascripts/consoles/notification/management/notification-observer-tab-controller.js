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
    function reload() {
      notificationObserverService
        .observerGroup.get()
        .success(function (groups) {
          oTab.observerGroups = groups;
        })
        .error(function (code, msg) {
          alert(msg + ' [' + code + ']');
        })
        ['finally'](function () {

      });
      notificationObserverService
        .observer.get()
        .success(function (observers) {
          oTab.observers = observers;
          console.log(oTab.observers);
        })
        .error(function (code, msg) {
          alert(msg + ' [' + code + ']');
        })
        ['finally'](function () {

      });
    }

    function openObserverModal(observer) {
      var ob = null;
      if (observer == null) {
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
            return angular.merge({}, ob);
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

    function openCopyObserverModal(observer) {
      var clone = angular.merge({}, observer, {_id: null,});
      openObserverModal(clone);
    }

    function removeObserver(observer) {
      if (confirm(`Are you sure to remove observer: ${observer.name}?`)) {
        notificationObserverService
          .observer.remove(observer._id)
          .error(function (code, msg) {
            alert(msg);
          })
          ['finally'](function () {
          reload();
        });
      }
    }


    function openObserverGroupModal(group) {
      var obG = null;
      if (group == null) {
        obG = new NotificationObserverGroup();
      } else {
        obG = group;
      }
      var obModalInst = $uibModal.open({
        animation: true,
        backdrop: 'static',
        keyboard: false,
        templateUrl: 'notification-observer-group-modal.html',
        controller: notificationObserverGroupModalController,
        controllerAs: 'vm',
        resolve: {
          group: function () {
            return angular.merge({}, obG);
          },
          observers: function () {
            var arr = [];
            angular.forEach(oTab.observers, function (item) {
              arr.push(angular.merge({}, item));
            });
            return arr;
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

    function removeObserverGroup(group) {
      if (confirm(`Are you sure to remove observer group: ${group.name}?`)) {
        notificationObserverService
          .observerGroup.remove(group._id)
          .error(function (code, msg) {
            alert(msg);
          })
          ['finally'](function () {
          reload();
        });
      }
    }

    function notificationObserverModalController($scope, $uibModalInstance, observer, service) {
      var vm = this;
      vm.isForAdd = observer._id == null;
      vm.observer = observer;

      vm.actions = {
        save: save,
        dismiss: dismiss,
      };

      function save() {
        if (vm.observer.name == '' || vm.observer.name == null) {
          alert('Observer name cannot be empty');
          return;
        }
        if (vm.observer.realName == '' || vm.observer.realName == null) {
          alert('Real name cannot be empty');
          return;
        }
        if (!formUtils.validateEmail(vm.observer.email)) {
          alert('Invalid email address: ' + vm.observer.email);
          return;
        }

        var success = false;
        var method = vm.isForAdd ? 'add' : 'update';
        service.observer
          [method](vm.observer)
          .error(function (code, msg) {
            alert('Error: ' + msg + ' [' + code + ']');
          })
          .success(function () {
            success = true;
          })
          ['finally'](function () {
          if (success) {
            $uibModalInstance.close(vm.observer);
          }
        });
      }

      function dismiss() {
        $uibModalInstance.dismiss('cancel');
      }
    }

    function notificationObserverGroupModalController($scope, $uibModalInstance, group, observers, service) {
      var vm = this;
      vm.isForAdd = group._id == null;

      console.log(group);
      console.log(observers);

      vm.group = group;
      vm.selectedObserver = null;
      vm.observerDict = (function (list) {
        var dict = {};
        var selected = (function (li) {
          var arr = {};
          angular.forEach(li, function (ob) {
            arr[ob._id] = true;
          });
          return arr;
        })(vm.group.observers);

        angular.forEach(list, function (ob) {
          if (!selected[ob._id]){
            dict[ob._id] = ob;
          }
        });
        if (list.length > 0){
          vm.selectedObserver = list[0]._id;
        }
        return dict;
      })(observers);

      vm.availableObserverCount = function () {
        return Object.keys(vm.observerDict).length;
      };

      vm.actions = {
        addObserver: addObserver,
        removeObserver: removeObserver,
        save: save,
        dismiss: dismiss,
      };

      function addObserver() {
        var ob = vm.observerDict[vm.selectedObserver];
        vm.group.observers.push(ob);
        delete vm.observerDict[vm.selectedObserver];
        var keys = Object.keys(vm.observerDict);
        if (keys.length > 0) {
          vm.selectedObserver = keys[0];
        }
      }

      function removeObserver(idx) {
        var ob = vm.group.observers[idx];
        vm.observerDict[ob._id] = ob;
        vm.group.observers.splice(idx, 1);
        vm.selectedObserver = ob._id;
      }

      function save() {
        if (vm.group.name == '' || vm.group.name == null) {
          alert('Observer group name cannot be empty');
          return;
        }
        if (vm.group.observers.length == 0) {
          alert('Observers cannot be empty');
          return;
        }

        var success = false;
        var method = vm.isForAdd ? 'add' : 'update';
        service.observerGroup
          [method](vm.group)
          .error(function (code, msg) {
            alert('Error: ' + msg + ' [' + code + ']');
          })
          .success(function () {
            success = true;
          })
          ['finally'](function () {
          if (success) {
            $uibModalInstance.close(vm.group);
          }
        });
      }

      function dismiss() {
        $uibModalInstance.dismiss('cancel');
      }
    }
  }

});