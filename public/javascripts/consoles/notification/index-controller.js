/**
 * Created by Roman Lo on 6/2/2016.
 */

define([
  'angular',
  'webapp',
  'utils/form-utils'
], function (angular, webapp, formUtils) {
  "use strict";

  // injections
  notificationIndexController.$inject = ['$scope'];

  return webapp
    .controller('NotificationIndexController', notificationIndexController)

  function notificationIndexController($scope) {

  }

});
