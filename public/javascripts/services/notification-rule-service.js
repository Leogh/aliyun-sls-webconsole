/**
 * Created by Roman Lo on 7/29/2016.
 */
define([
  'angular',
  'webapp',
  'utils/http-client'
],function (angular, webapp) {
  "use strict";
  webapp.factory('services.notification-rule-service', notificationRuleService);

  notificationRuleService.$inject = ['utils.http-client', '$q'];

  var simpleRuleApi = '/notification/api/simpleNotificationRule';

  function notificationRuleService(http) {
    return {
      simple: {
        get: function (options) {
          return http.send({
            url: simpleRuleApi,
            params: options,
            method: 'get'
          });
        },
        add: function(rule) {
          return http.send({
            url: simpleRuleApi,
            data: {
              rule: rule
            },
            method: 'post'
          });
        },
        update: function (rule) {
          return http.send({
            url: simpleRuleApi,
            data: {
              rule: rule
            },
            method: 'put'
          });
        },
        remove: function (ruleId) {
          return http.send({
            url: simpleRuleApi,
            params: {
              _id: ruleId
            },
            method: 'delete'
          });
        },
      },

    };
  }

});