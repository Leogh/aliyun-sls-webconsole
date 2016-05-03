/**
 * Created by roman on 4/28/16.
 */
define([
  'angular',
  'webapp',
  'models/analytics-field',
  'models/analytics-compare-set',
  'utils/http-client'
], function (angular, webapp, AnalyticsField, AnalyticsCompareSet) {

  webapp.factory('services.log-analytics-service', logAnalyticsService);

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
      },
      dashboard:{
        build: buildCompareSetDashboard,
      }
    };


    function getAnalyticsCompareSet(name, status) {
      return http.send({
        url: '/aliyun-sls-analytics/analyticsCompareSet',
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
        url: '/aliyun-sls-analytics/analyticsCompareSet',
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
        url: '/aliyun-sls-analytics/analyticsCompareSet',
        data: {
          compareSet: compareSet
        },
        method: 'put'
      });
    }

    function getAnalyticsField(name, status){
      return http.send({
        url: '/aliyun-sls-analytics/analyticsField',
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
        url: '/aliyun-sls-analytics/analyticsField',
        data: {
          fieldName: field.name,
          valueSet: field.valueSet,
        },
        method: 'post'
      });
    }

    function updateAnalyticsField(field){
      if (!field instanceof  AnalyticsField) {
        throw Error('field is not an instance of AnalyticsField.');
      }
      return http.send({
        url: '/aliyun-sls-analytics/analyticsField',
        data: {
          _id: field._id,
          fieldName: field.name,
          valueSet: field.valueSet,
          status: field.status,
        },
        method: 'put'
      });
    }

    function buildCompareSetDashboard(options){
      if (options.timeOptions.enabled) {
        initDateHours(options.from, options.timeOptions.from);
        initDateHours(options.to, options.timeOptions.to);
      }
      return http.send({
        url: '/aliyun-sls-analytics/dashboard',
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