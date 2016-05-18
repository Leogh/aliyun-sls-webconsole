/**
 * Created by roman on 4/28/16.
 */
define([
  'angular',
  'webapp',
  'models/analytics-field',
  'models/analytics-compare-set',
  'models/analytics-field-filter',
  'utils/http-client'
], function (angular, webapp, AnalyticsField, AnalyticsCompareSet, AnalyticsFieldFilter) {

  webapp.factory('services.log-analytics-service', logAnalyticsService);

  logAnalyticsService.$inject = ['utils.http-client', '$q'];

  function logAnalyticsService(http, $q) {

    return {
      compareSet: {
        get: getAnalyticsCompareSet,
        add: addAnalyticsCompareSet,
        update: updateAnalyticsCompareSet,
        remove: removeAnalyticsCompareSet,
      },
      field: {
        get: getAnalyticsField,
        add: addAnalyticsField,
        update: updateAnalyticsField,
        remove: removeAnalyticsField,
      },
      filter: {
        get: getAnalyticsFieldFilter,
        add: addAnalyticsFieldFilter,
        update: updateAnalyticsFieldFilter,
        remove: removeAnalyticsFieldFilter,
      },
      dashboard:{
        build: buildCompareSetDashboard,
      }
    };


    function getAnalyticsCompareSet(name, status) {
      return http.send({
        url: '/analytics/api/analyticsCompareSet',
        params: {
          compareSetName: name,
          status: status
        },
        method: 'get'
      });
    }

    function addAnalyticsCompareSet(compareSet) {
      if (!compareSet instanceof  AnalyticsCompareSet) {
        throw Error('compareSet is not an instance of AnalyticsCompareSet.');
      }
      return http.send({
        url: '/analytics/api/analyticsCompareSet',
        data: {
          compareSet: compareSet
        },
        method: 'post'
      });
    }

    function updateAnalyticsCompareSet(compareSet) {
      if (!compareSet instanceof  AnalyticsCompareSet) {
        throw Error('compareSet is not an instance of AnalyticsCompareSet.');
      }
      return http.send({
        url: '/analytics/api/analyticsCompareSet',
        data: {
          compareSet: compareSet
        },
        method: 'put'
      });
    }

    function removeAnalyticsCompareSet(id) {
      return http.send({
        url: '/analytics/api/analyticsCompareSet',
        params: {
          _id: id
        },
        method: 'delete'
      });
    }


    function getAnalyticsField(name, status){
      return http.send({
        url: '/analytics/api/analyticsField',
        params: {
          fieldName: name,
          status: status
        },
        method: 'get'
      });
    }

    function addAnalyticsField(field){
      if (!field instanceof  AnalyticsField) {
        throw Error('field is not an instance of AnalyticsField.');
      }
      return http.send({
        url: '/analytics/api/analyticsField',
        data: {
          field: field,
        },
        method: 'post'
      });
    }

    function updateAnalyticsField(field){
      if (!field instanceof  AnalyticsField) {
        throw Error('field is not an instance of AnalyticsField.');
      }
      return http.send({
        url: '/analytics/api/analyticsField',
        data: {
          field: field,
        },
        method: 'put'
      });
    }

    function removeAnalyticsField(id){
      return http.send({
        url: '/analytics/api/analyticsField',
        params: {
          _id: id
        },
        method: 'delete'
      });
    }


    function getAnalyticsFieldFilter(){
      return http.send({
        url: '/analytics/api/filter',
        method: 'get'
      });
    }

    function addAnalyticsFieldFilter(filter){
      if (!(filter instanceof  AnalyticsFieldFilter)) {
        throw Error('filter is not an instance of AnalyticsFieldFilter.');
      }
      return http.send({
        url: '/analytics/api/filter',
        data: {
          filter: filter
        },
        method: 'post'
      });
    }

    function updateAnalyticsFieldFilter(filter){
      if (!(filter instanceof  AnalyticsFieldFilter)) {
        throw Error('filter is not an instance of AnalyticsFieldFilter.');
      }
      return http.send({
        url: '/analytics/api/filter',
        data: {
          filter: filter
        },
        method: 'put'
      });
    }

    function removeAnalyticsFieldFilter(id){
      return http.send({
        url: '/analytics/api/filter',
        params: {
          _id: id
        },
        method: 'delete'
      });
    }



    function buildCompareSetDashboard(options){
      if (options.timeOptions.enabled) {
        initDateHours(options.from, options.timeOptions.from);
        initDateHours(options.to, options.timeOptions.to);
      }
      return http.send({
        url: '/analytics/api/dashboard',
        params: {
          compareSetId: options.compareSetId,
          from: options.from,
          to: options.to,
        },
        method: 'get'
      });
    }

    function initDateHours(date, timeOption){
      date.setHours(parseInt(timeOption.h), parseInt(timeOption.m), parseInt(timeOption.s), 0);
    }

  }

});