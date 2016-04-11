define([
  "angular",
  "angular-sanitize",
  "angular-bootstrap-tpls",
  "highcharts-ng",
], function (angular) {
  'use strict';
  // construct angular module
  // resolving dependencies
  return angular.module('webapp', [
    'ngSanitize',
    'ui.bootstrap',
    'highcharts-ng',
  ]);
});