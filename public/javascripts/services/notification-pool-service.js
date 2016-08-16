/**
 * Created by Roman Lo on 8/16/2016.
 */



define([
  'angular',
  'webapp',
  'utils/http-client'
],function (angular, webapp) {
  "use strict";
  webapp.factory('services.notification-pool-service', notificationPoolService);

  notificationPoolService.$inject = ['utils.http-client', '$q'];

  var poolApi = '/notification/api/pool-config';
  var execAPi = '/notification/api/exec';

  function notificationPoolService(http) {
    return {
      get: function (options) {
        return http.send({
          url: poolApi,
          params: options,
          method: 'get'
        });
      },
      add: function(pool) {
        return http.send({
          url: poolApi,
          data: pool,
          method: 'post'
        });
      },
      update: function (pool) {
        return http.send({
          url: poolApi,
          data: pool,
          method: 'put'
        });
      },
      remove: function (poolId) {
        return http.send({
          url: poolApi,
          params: {
            _id: poolId
          },
          method: 'delete'
        });
      },
      exec: function (command, poolId){
        return http.send({
          url: execAPi,
          data: {
            action: command,
            id: poolId
          },
          method: 'post'
        });
      }
    };
  }

});