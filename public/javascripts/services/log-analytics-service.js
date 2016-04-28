/**
 * Created by roman on 4/28/16.
 */
define([
  'angular',
  'webapp',
  'models/analytics-field',
  'models/analytics-compare-set',
  'utils/http-client'
], function (angular, webapp) {

  webapp.factory('services.aliyun-sls-service', logAnalyticsService);

  logAnalyticsService.$inject = ['utils.http-client', '$q'];

  function logAnalyticsService(http, $q) {

    return {
      compareSet: {
        get: getAnalyticsCompareSet,
        add: addAnalyticsCompareSet,
        update: updateAnalyticsCompareSet,
      },
      field: {
        get: getAnalyticsField,
        add: addAnalyticsField,
        update: updateAnalyticsField,
      }
    };


    function getAnalyticsCompareSet(name) {

    }

    function addAnalyticsCompareSet(compareSet) {

    }

    function updateAnalyticsCompareSet(compareSet) {

    }

    function getAnalyticsField(name){

    }

    function addAnalyticsField(field){

    }

    function updateAnalyticsField(field){

    }

  }

});