/**
 * Created by Roman Lo on 6/2/2016.
 */

define([
  'angular',
  'webapp',
  'utils/form-utils',
  'consoles/notification/management/notification-rule-tab-controller',
  'consoles/notification/management/notification-watcher-tab-controller',
  'consoles/notification/management/notification-observer-tab-controller'
], function (angular, webapp, formUtils, notificationRuleTabController, notificationWatcherTabController, notificationObserverTabController) {
  "use strict";

  // injections
  notificationManagementController.$inject = ['$scope'];

  return webapp
    .controller('NotificationManagementController', notificationManagementController)
    .controller('NotificationRuleTabController', notificationRuleTabController)
    .controller('NotificationWatcherTabController', notificationWatcherTabController)
    .controller('NotificationObserverTabController', notificationObserverTabController);

  function notificationManagementController($scope) {
    var vm = this;
    
  }

});
