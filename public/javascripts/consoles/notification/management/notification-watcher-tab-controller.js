/**
 * Created by Roman Lo on 6/2/2016.
 */

define([
  'angular',
  'utils/form-utils'
], function (angular, formUtils) {
  "use strict";

  // injections
  notificationWatcherTabController.$inject = ['$scope'];

  return notificationWatcherTabController;

  function notificationWatcherTabController($scope) {
    var wTab = this;
    wTab.title = 'Notification Watcher Tab';
  }

});