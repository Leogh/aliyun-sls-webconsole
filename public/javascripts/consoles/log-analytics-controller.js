define([
  'webapp',
  'services/aliyun-sls-service',
], function (webapp) {
   // injections
  logAnalyticsController.$inject = ['$scope' , 'services.aliyun-sls-service'];
  return webapp
    .controller('LogAnalyticsController', logAnalyticsController);
    
});