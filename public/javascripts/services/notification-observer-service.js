/**
 * Created by Roman Lo on 6/7/2016.
 */


define([
  'angular',
  'webapp',
  'utils/http-client'
],function (angular, webapp) {
  "use strict";
  webapp.factory('services.notification-observer-service', notificationObserverService);

  notificationObserverService.$inject = ['utils.http-client', '$q'];

  var observerApi = '/notification/api/observer';
  var observerGroupApi = '/notification/api/observerGroup';

  function notificationObserverService(http) {
    return {
      observer: {
        get: function (options) {
          return http.send({
            url: observerApi,
            param: options,
            method: 'get'
          });
        },
        add: function(observer) {
          return http.send({
            url: observerApi,
            data: {
              observer: observer
            },
            method: 'post'
          });
        },
        update: function (observer) {
          return http.send({
            url: observerApi,
            data: {
              observer: observer
            },
            method: 'put'
          });
        },
        remove: function (observerId) {
          return http.send({
            url: observerApi,
            data: {
              _id: observerId
            },
            method: 'delete'
          });
        },
      },
      observerGroup: {
        get: function (options) {
          return http.send({
            url: observerGroupApi,
            param: options,
            method: 'get'
          });
        },
        add: function(observer) {
          return http.send({
            url: observerGroupApi,
            data: {
              observer: observer
            },
            method: 'post'
          });
        },
        update: function (observer) {
          return http.send({
            url: observerGroupApi,
            data: {
              observer: observer
            },
            method: 'put'
          });
        },
        remove: function (observerId) {
          return http.send({
            url: observerGroupApi,
            data: {
              _id: observerId
            },
            method: 'delete'
          });
        },
      }
    };
  }

});