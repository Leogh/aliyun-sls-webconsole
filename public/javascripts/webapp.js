define([
  "angular",
  "angular-sanitize",
  "angular-bootstrap-tpls",
  "bootstrap-ui-datetime-picker"
], function (angular) {
  'use strict';
  // construct angular module
  // resolving dependencies
  return angular.module('webapp', [
    'ngSanitize',
    'ui.bootstrap',
    'ui.bootstrap.datetimepicker'
  ]);
});