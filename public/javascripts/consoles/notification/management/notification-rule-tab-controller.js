/**
 * Created by Roman Lo on 6/2/2016.
 */

define([
  'angular',
  'utils/form-utils'
], function (angular, formUtils) {
  "use strict";

  // injections
  notificationRuleTabController.$inject = ['$scope'];

  return notificationRuleTabController;

  function notificationRuleTabController($scope) {
    var rTab = this;
    rTab.title = 'Notification Rule Tab';
  }

});